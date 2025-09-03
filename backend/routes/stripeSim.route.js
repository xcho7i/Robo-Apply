// routes/stripeSimRoutes.js (or inline in your routes file)
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // test key
const User = require('../models/user.model'); // adjust path
const authPolicy = require("../utils/auth.policy");


// 1) Create a Test Clock and save to user
router.post('/clock',authPolicy, async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const clock = await stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000),
      name: `trial-failure-sim:${userId}`
    });

    user.stripeTestClockId = clock.id;
    await user.save();

    res.json({ success: true, testClock: clock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2) Create a NEW Stripe Customer on that clock and set it on the user
//    (Your existing createSubscription will re-use user.stripeCustomerId automatically.)
router.post('/customer-on-clock',authPolicy, async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.stripeTestClockId) {
      return res.status(400).json({ success: false, message: 'Create a test clock first.' });
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName || `User ${userId}`,
      test_clock: user.stripeTestClockId,
      metadata: { appUserId: String(userId), sim: 'trial-end-failure' }
    });

    // IMPORTANT: override your user's customer to this clock-bound one (data change, not code change)
    user.stripeCustomerId = customer.id;
    await user.save();

    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3) Attach a FAILING payment method & set as default:
 *    type options:
 *      - "insufficient_funds" -> 4000000000009995
 *      - "generic_decline"    -> 4000000000000002
 *    If you omit type, default is insufficient_funds.
 */
// router.post('/attach-failing-pm',authPolicy, async (req, res) => {
//   try {
//     const userId = req.token._id;
//     const { type = 'insufficient_funds' } = req.body;

//     const user = await User.findById(userId);
//     if (!user || !user.stripeCustomerId) {
//       return res.status(400).json({ success: false, message: 'Customer not found. Create customer on clock first.' });
//     }

//     // Map failure type to a test card
//     const cardNumberMap = {
//       insufficient_funds: '4000000000009995',
//       generic_decline: '4000000000000002'
//     };
//     const number = cardNumberMap[type] || cardNumberMap.insufficient_funds;

//     // Create a test PaymentMethod using card details (OK in test mode)
//     const pm = await stripe.paymentMethods.create({
//       type: 'card',
//       card: {
//         number,
//         exp_month: 12,
//         exp_year: new Date().getFullYear() + 2,
//         cvc: '123'
//       }
//     });

//     await stripe.paymentMethods.attach(pm.id, { customer: user.stripeCustomerId });

//     // Set as default so renewal uses this failing PM
//     await stripe.customers.update(user.stripeCustomerId, {
//       invoice_settings: { default_payment_method: pm.id }
//     });

//     res.json({ success: true, paymentMethod: pm });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// 4) Advance the test clock by X days/hours to hit end-of-trial & trigger the charge

// 3) Attach a FAILING PaymentMethod (no raw card data)
router.post('/attach-failing-pm',authPolicy, async (req, res) => {
    try {
      const userId = req.token._id;
      const { pmId = 'pm_card_chargeCustomerFail' } = req.body; // default: always fails when charged
  
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ success: false, message: 'Customer not found. Create customer on clock first.' });
      }
  
      // Attach the preset test PaymentMethod to the customer
      const pm = await stripe.paymentMethods.attach(pmId, {
        customer: user.stripeCustomerId,
      });
  
      // Make it the default for invoices/subscriptions
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: { default_payment_method: pm.id },
      });
  
      res.json({ success: true, paymentMethod: pm });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  // POST /api/v1/stripe-sim/subscription/use-pm
// body: { pmId?: string }  // default is 'pm_card_chargeCustomerFail'
router.post('/subscription/use-pm',authPolicy, async (req, res) => {
    try {
      const userId = req.token._id;
      const { pmId = 'pm_card_chargeCustomerFail' } = req.body;
  
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ success: false, message: 'Customer not found.' });
      }
  
      // Ensure PM is attached to the customer
      await stripe.paymentMethods.attach(pmId, { customer: user.stripeCustomerId }).catch(() => { /* it might already be attached */ });
  
      const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, limit: 3, status: 'all' });
      const sub = subs.data[0];
      if (!sub) return res.status(400).json({ success: false, message: 'No subscription found for this customer.' });
  
      const updated = await stripe.subscriptions.update(sub.id, {
        default_payment_method: pmId,
      });
  
      res.json({ success: true, subscription: { id: updated.id, default_payment_method: updated.default_payment_method, status: updated.status } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  // POST /api/v1/stripe-sim/subscription/detach-others
// body: { keepPmId?: string } // default keeps 'pm_card_chargeCustomerFail'
router.post('/subscription/detach-others',authPolicy, async (req, res) => {
    try {
      const userId = req.token._id;
      const { keepPmId = 'pm_card_chargeCustomerFail' } = req.body;
  
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ success: false, message: 'Customer not found.' });
      }
  
      const pms = await stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card', limit: 100 });
      const toDetach = pms.data.filter(pm => pm.id !== keepPmId);
  
      const results = [];
      for (const pm of toDetach) {
        try {
          results.push(await stripe.paymentMethods.detach(pm.id));
        } catch (e) {
          results.push({ id: pm.id, error: e.message });
        }
      }
  
      res.json({ success: true, detached: results.length, details: results });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  
  

router.post('/advance',authPolicy, async (req, res) => {
  try {
    const userId = req.token._id;
    const { days = 4, seconds = 0 } = req.body; // default +4 days
    const user = await User.findById(userId);

    if (!user || !user.stripeTestClockId) {
      return res.status(400).json({ success: false, message: 'No test clock. Create one first.' });
    }

    // Get current clock to read frozen_time
    const clock = await stripe.testHelpers.testClocks.retrieve(user.stripeTestClockId);
    const advanceTo = clock.frozen_time + (days * 86400) + seconds;

    const advanced = await stripe.testHelpers.testClocks.advance(user.stripeTestClockId, {
      frozen_time: advanceTo
    });

    res.json({ success: true, advancedClock: advanced });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5) Status: fetch latest subscription & invoice info for the customer
router.get('/status',authPolicy, async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'Customer not found.' });
    }

    const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, limit: 5 });
    const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 5 });

    res.json({
      success: true,
      subscriptions: subs.data.map(s => ({
        id: s.id,
        status: s.status,
        trial_end: s.trial_end,
        current_period_end: s.current_period_end,
        latest_invoice: s.latest_invoice,
      })),
      invoices: invoices.data.map(i => ({
        id: i.id,
        status: i.status, // e.g. 'open', 'paid', 'uncollectible'
        attempt_count: i.attempt_count,
        next_payment_attempt: i.next_payment_attempt,
        payment_intent_status: i.payment_intent?.status,
        last_payment_error: i.payment_intent?.last_payment_error?.message || null,
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6) (Optional) Cleanup: delete the test customer + clear fields
router.post('/cleanup',authPolicy, async (req, res) => {
  try {
    const userId = req.token._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const results = {};
    if (user.stripeCustomerId) {
      try {
        results.customerDelete = await stripe.customers.del(user.stripeCustomerId);
      } catch (e) {
        results.customerDelete = { error: e.message };
      }
      user.stripeCustomerId = undefined;
    }
    if (user.stripeTestClockId) {
      // Clocks auto-expire once there are no objects tied, but we can just clear it.
      user.stripeTestClockId = undefined;
    }
    await user.save();

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET /api/v1/stripe-sim/who-will-be-charged
router.get('/who-will-be-charged',authPolicy, async (req, res) => {
    try {
      const userId = req.token._id;
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ success: false, message: 'Customer not found.' });
      }
  
      // latest (or only) active sub
      const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, limit: 3, status: 'all' });
      const sub = subs.data[0];
      if (!sub) return res.json({ success: true, info: 'No subscriptions for this customer yet.' });
  
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
  
      const subPM = sub.default_payment_method || null;
      const custPM = customer.invoice_settings?.default_payment_method || null;
  
      res.json({
        success: true,
        subscriptionId: sub.id,
        subscriptionStatus: sub.status,
        willUse: subPM ? 'subscription.default_payment_method' : (custPM ? 'customer.invoice_settings.default_payment_method' : 'none'),
        subscriptionDefaultPaymentMethod: subPM,
        customerDefaultPaymentMethod: custPM,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  

module.exports = router;
