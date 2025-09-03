const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Plan = require("../models/plans.model");
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const services = require("../helpers/services");

/**
 * Subscription Controller
 * 
 * Plan Change Logic:
 * - UPGRADE: When new plan price > current plan price
 *   - Immediate proration charge
 *   - Plan changes immediately
 * 
 * - DOWNGRADE: When new plan price < current plan price  
 *   - No immediate charge
 *   - Plan changes at next billing cycle
 * 
 * - SAME PRICE: When new plan price = current plan price
 *   - No charge
 *   - Plan features change immediately
 */


const UserSubscription = require("../models/userSubscriptionModel");
const SubscriptionCancellation = require("../models/subscriptionCancellation.model");
const SubscriptionPlan = require("../models/subscriptionPlans.model");
const PaymentHistory = require("../models/paymentHistory.model");


const methods = {


createCreditCheckout: async (req, res) => {
    try {
      const { credits } = req.body;
      const userId = req.token._id;


      if (!credits || credits <= 0) {
        return res.status(400).json({ success: false, msg: "Invalid credit quantity." });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, msg: "User not found" });

      // Create Stripe Customer if not exists
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });

        user.stripeCustomerId = customer.id;
        await user.save();
      }

      const amountInCents = credits * 15; // $0.15 per credit

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} Extra Job Credits`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',

        success_url: `${process.env.ROOT_URL}/plan-purchase-success`,
        cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,

        metadata: {
          userId: userId,
          creditsPurchased: credits,
        },
      });

      return res.status(200).json({ success: true, checkoutUrl: session.url });
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      return res.status(500).json({ success: false, msg: "Checkout failed", error: error.message });
    }
},

createSubscription: async (req, res) => {
    try {
      const { identifier, isTrial } = req.body;

      const userId = req.token._id;

      // Validate User
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, error: "User not found" });

      // Check if user has already activated trial
      if (isTrial && user.trialActivated) {
        return res.status(400).json({
          success: false,
          message: "You have already used your free trial"
        });
      }

      //Check current plan
 
      const userPlan = await UserSubscription.findOne({ userId, isActive: true });

      if (userPlan && userPlan.planSnapshot.identifier !== "free_plan") {
        return res.status(200).json({
          success: true,
          message: `You are currently subscribed to ${userPlan.planSnapshot.name}`
        });
      } 

      const plan = await SubscriptionPlan.findOne({ identifier })
      if (!plan) return res.status(404).json({ success: false, error: "Subscription plan not Availiable" });

      //Will add logic to check if the user already has this subscription

      if (!plan.priceId || !plan.productId) {
        return res.status(404).json({ success: false, error: "Subscription plan not Availiable" });
      }

      // Check if user has a Stripe customer ID, if not create one
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });

        user.stripeCustomerId = customer.id;
        await user.save();
      }


      // return res.status(200).json({success:true,plan})


      // Create Stripe Checkout Session
      // const session = await stripe.checkout.sessions.create({
      //   mode: "subscription",
      //   payment_method_types: ["card"],
      //   // customer_email: user.email,
      //   customer: user.stripeCustomerId,

      //   line_items: [{ price: plan.priceId, quantity: 1 }],
      //   success_url: `https://staging.robo-apply.com/plan-purchase-success`,
      //   cancel_url: `https://staging.robo-apply.com//plan-purchase-failure`,
      //   metadata: { userId: user._id.toString(), planIdentifier: identifier },
      // });


    const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  customer: user.stripeCustomerId,

  line_items: [{ price: plan.priceId, quantity: 1 }],
  
  subscription_data: {
    trial_period_days: 3,  //3-day free trial
    metadata: {
      userId: user._id.toString(),
      planIdentifier: identifier,
      isTrialPeriod: 'true'
    }
  },

  success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
  metadata: {
    userId: user._id.toString(),
    planIdentifier: identifier,
    isTrialPeriod: 'true'
  },
});

      res.json({ success: true, checkoutUrl: session.url });
    } catch (error) {
      console.error("Error creating subscription:", error.message);
      res.status(500).json({ error: error.message });
    }
},

  /**
   * Save Subscription in Database After Successful Payment
   */
subscriptionSuccess: async (req, res) => {
    try {
      const { session_id } = req.query;

      if (!session_id) return res.status(400).json({ error: "Session ID missing" });

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const subscriptionId = session.subscription;

      if (!subscriptionId) {
        console.error("❌ No subscription ID found in session.");
        return res.status(400).json({ error: "Subscription ID missing from session." });
      }

      // Retrieve subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = session.metadata.userId;
      const planId = session.metadata.planId;

      console.log("✅ Subscription Created in Stripe:", subscription.id);

      // Check if Subscription already exists in DB
      const existingSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
      if (!existingSubscription) {
        // Save Subscription in Database
        const newSubscription = new Subscription({
          userId,
          planId,
          stripeSubscriptionId: subscription.id,
          status: "active", // ✅ Mark as active
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
        });

        await newSubscription.save();
        console.log("✅ Subscription saved in MongoDB:", subscription.id);
      }

      res.json({ success: true, message: "Subscription activated successfully!" });
    } catch (error) {
      console.error("Error handling subscription success:", error.message);
      res.status(500).json({ error: error.message });
    }
},

saveCancelReason: async (req, res) => {
  const userId = req.token._id;
  const { cancelReason, cancelReasonText } = req.body;

  const activeSub = await UserSubscription.findOne({ userId, isActive: true });
  if (!activeSub) {
    return res.status(404).json({ success: false, msg: "No active subscription found." });
  }

  await SubscriptionCancellation.create({
    userId,
    subscriptionId: activeSub._id,
    cancelReason,
    cancelReasonText,
    type: "send_to_team"
  });

  return res.status(200).json({ success: true, msg: "Reason submitted successfully." });
},

applyDiscountAndKeepSubscription: async (req, res) => {
  try {
    const userId = req.token._id;
    const { identifier } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found." });

    // Check if user has already used their discount
    if (user.discountUsed) {
      return res.status(400).json({ success: false, msg: "You have already used your discount." });
    }

    const currentSub = await UserSubscription.findOne({ userId, isActive: true });
    if (!currentSub || !currentSub.stripeSubscriptionId) {
      return res.status(404).json({ success: false, msg: "Active subscription not found." });
    }

    const selectedPlan = await SubscriptionPlan.findOne({ identifier });
    if (!selectedPlan || !selectedPlan.priceId || !selectedPlan.productId) {
      return res.status(404).json({ success: false, msg: "Subscription plan not available." });
    }

    console.log(`🔍 Current subscription: ${currentSub.stripeSubscriptionId}, isTrialPeriod: ${currentSub.isTrialPeriod}`);

    // Create a 30% discount coupon (valid for 3 months)
    const coupon = await stripe.coupons.create({
      percent_off: 30,
      duration: "repeating",
      duration_in_months: 3,
    });

    // Handle trial users: Create new subscription via checkout
    if (currentSub.isTrialPeriod) {
      console.log(`🔍 Trial user detected - creating new subscription via checkout`);
      console.log(`💰 Rollover credits will be calculated by webhook when new subscription is created`);

      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });
        user.stripeCustomerId = customer.id;
        await user.save();
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: user.stripeCustomerId,
        line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
        discounts: [{ coupon: coupon.id }],
        metadata: {
          userId: user._id.toString(),
          planIdentifier: identifier,
          fromDiscountFlow: "true",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        },
        subscription_data: {
          metadata: {
            userId: user._id.toString(),
            planIdentifier: identifier,
            fromDiscountFlow: "true",
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
        },
        success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
      });

      console.log(`🔍 Created Stripe checkout session for trial discount flow:`);
      console.log(`🔍 Session ID: ${session.id}`);
      console.log(`🔍 Old subscription ID: ${currentSub.stripeSubscriptionId}`);

      // End trial email campaign
      user.trialEmailCampaign.campaignStatus = 'upgraded';
      await user.save();

      return res.status(200).json({
        success: true,
        checkoutUrl: session.url,
        msg: `Redirecting to discounted plan checkout. Any remaining credits from your current subscription will be rolled over to your new plan. Your current subscription will be cancelled immediately after the new one is created.`,
      });
    }

    // Handle non-trial users: Apply discount to existing subscription
    else {
      console.log(`🔍 Non-trial user detected - applying discount to existing subscription`);
      
      // Apply discount for next 3 billing cycles without changing current cycle
      console.log(`🔍 Applying 30% discount for next 3 billing cycles`);
      
      // Check if user wants to change plan
      if (currentSub.planSnapshot.identifier !== identifier) {
        console.log(`🔍 Plan change detected: ${currentSub.planSnapshot.identifier} -> ${identifier}`);
        console.log(`📅 Plan change will take effect at next billing cycle`);
        
        // Get current subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
        
        // Schedule plan change for next billing cycle and apply discount
        await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: selectedPlan.priceId,
          }],
          discounts: [{ coupon: coupon.id }],
          proration_behavior: "none",
          metadata: {
            userId: user._id.toString(),
            planIdentifier: identifier,
            fromDiscountFlow: "true",
            discountApplied: "true",
            planChangeScheduled: "true",
          },
        });
        
        console.log(`✅ Plan change scheduled for next billing cycle with 30% discount applied`);
      } else {
        // Same plan - just apply discount for next 3 billing cycles
        console.log(`🔍 Same plan - applying discount for next 3 billing cycles`);
        
        await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
          discounts: [{ coupon: coupon.id }],
          metadata: {
            userId: user._id.toString(),
            planIdentifier: identifier,
            fromDiscountFlow: "true",
            discountApplied: "true",
          },
        });
        
        console.log(`✅ 30% discount applied for next 3 billing cycles`);
      }

      // Mark discount as used
      user.discountUsed = true;
      await user.save();
      
      // Create SubscriptionCancellation record for discount tracking
      await SubscriptionCancellation.create({
        userId,
        subscriptionId: currentSub._id,
        cancelReason: [],
        cancelReasonText: "30% discount applied to existing subscription",
        type: "upgrade",
        appliedDiscount: true,
      });

      // Determine appropriate success message
      const planChangeMessage = currentSub.planSnapshot.identifier !== identifier 
        ? ` Your plan change to ${selectedPlan.name} will take effect at your next billing cycle.`
        : '';
      
      return res.status(200).json({
        success: true,
        msg: `30% discount has been successfully applied for the next 3 billing cycles. Your current billing cycle remains unchanged and no immediate charge has been made.${planChangeMessage}`,
      });
    }

  } catch (error) {
    console.error("Error applying discount:", error.message);
    return res.status(500).json({
      success: false,
      msg: "Failed to apply discount or change plan.",
      error: error.message,
    });
  }
},

cancelSubscription: async (req, res) => {
  try {
    const userId = req.token._id;
    const { cancelReason, cancelReasonText } = req.body;

    // First, try to find an active subscription
    let userSub = await UserSubscription.findOne({ userId, isActive: true });
    
    // If no active subscription found, try to find a cancelled subscription that might still have isActive: true
    if (!userSub) {
      userSub = await UserSubscription.findOne({ userId, isCancelled: true, isActive: true });
      
      if (userSub) {
        // This subscription is cancelled but still has isActive: true, so we need to set it to false
        userSub.isActive = false;
        await userSub.save();
        
        return res.status(200).json({
          success: true,
          msg: "Subscription was already cancelled and has been marked as inactive.",
          cancelAt: userSub.cancelAt
        });
      }
      
      return res.status(404).json({ success: false, msg: "Subscription not found." });
    }

    const stripeSub = await stripe.subscriptions.update(userSub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Store cancellation reason
    await SubscriptionCancellation.create({
      userId,
      subscriptionId: userSub._id,
      cancelReason,
      cancelReasonText,
      type: "cancel"
    });

    // Update user subscription cancellation status
    userSub.isCancelled = true;
    // Note: isActive remains true until the billing period ends
    // Stripe will send a webhook event when the period ends, and we'll set isActive = false then

    if (stripeSub.cancel_at) {
      const cancelAtDate = new Date(stripeSub.cancel_at * 1000);
      userSub.cancelAt = cancelAtDate;

      // Calculate days left
      const now = new Date();
      const diffTime = cancelAtDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days

      userSub.notice = `Your ${userSub.planSnapshot.name} will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`;
    } else {
      userSub.notice = `Your ${userSub.planSnapshot.name} has been cancelled.`;
    }

    await userSub.save();

    // If this is a trial subscription, send immediate cancellation email
    if (userSub.isTrialPeriod) {
      console.log(`🔍 Trial subscription cancelled via cancelSubscription - sending immediate cancellation email`);
      const user = await User.findById(userId);
      if (user) {
        try {
          // Update campaign status
          console.log(`📝 Updating campaign status to cancelled for trial cancellation`);
          await User.findOneAndUpdate(
            { _id: userId },
            { $set: { 'trialEmailCampaign.campaignStatus': 'cancelled' } },
            { new: true }
          );

          // Send immediate cancellation email
          console.log(`📧 Sending immediate cancellation email to ${user.email}`);
          await services.sendTrialCancellationEmail(userId, 'immediate');
          console.log(`✅ Trial cancellation email sent successfully via cancelSubscription`);
        } catch (error) {
          console.error(`❌ Failed to send trial cancellation email via cancelSubscription:`, error);
        }
      } else {
        console.error(`❌ User not found for trial cancellation email: ${userId}`);
      }
    }

    return res.status(200).json({
      success: true,
      msg: "Subscription cancellation scheduled at period end. Your subscription will remain active until the end of the current billing period.",
      cancelAt: userSub.cancelAt
    });

  } catch (error) {
    console.error("Cancel error:", error.message);
    return res.status(500).json({ success: false, msg: "Cancellation failed", error: error.message });
  }
},

revertSubscriptionCancel: async (req, res) => {
  try {
    const userId = req.token._id;

    // First, try to find an active subscription that is cancelled
    let userSub = await UserSubscription.findOne({ userId, isActive: true, isCancelled: true });
    
    // If no active cancelled subscription found, try to find any cancelled subscription
    if (!userSub) {
      userSub = await UserSubscription.findOne({ userId, isCancelled: true });
      
      if (!userSub || !userSub.stripeSubscriptionId) {
        return res.status(400).json({
          success: false,
          msg: "No cancellable subscription found.",
        });
      }
    }

    const updatedSub = await stripe.subscriptions.update(userSub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local DB
    userSub.isCancelled = false;
    userSub.isActive = true; // Reactivate the subscription
    userSub.cancelAt = null;
    await userSub.save();

    // If this was a trial subscription, resume trial email campaign
    if (userSub.isTrialPeriod) {
      const user = await User.findById(userId);
      if (user && user.trialEmailCampaign.campaignStatus === 'cancelled') {
        user.trialEmailCampaign.campaignStatus = 'active';
        await user.save();

        // Calculate days passed in trial to determine which email to send next
        const daysPassed = Math.floor((new Date() - userSub.startDate) / (1000 * 60 * 60 * 24));
        const { activationEmails } = user.trialEmailCampaign;

        let nextEmail;
        if (!activationEmails.day1Sent) nextEmail = 'day1';
        else if (!activationEmails.day2Sent && daysPassed >= 1) nextEmail = 'day2';
        else if (!activationEmails.day3MorningSent && daysPassed >= 2) nextEmail = 'day3Morning';
        else if (!activationEmails.day3EveningSent && daysPassed >= 2) nextEmail = 'day3Evening';

        if (nextEmail) {
          try {
            await services.sendTrialActivationEmail(userId, nextEmail);
          } catch (error) {
            console.error("Failed to send trial reactivation email:", error);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      msg: "Subscription cancellation reverted.",
    });

  } catch (error) {
    console.error("Error reverting cancellation:", error.message);
    return res.status(500).json({
      success: false,
      msg: "Failed to revert cancellation.",
      error: error.message,
    });
  }
},

upgradePlan: async (req, res) => {
  try {
    const userId = req.token._id;
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, msg: "Missing plan identifier" });
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
    }

    const newPlan = await SubscriptionPlan.findOne({ identifier });
    if (!newPlan || !newPlan.priceId) {
      return res.status(404).json({ success: false, msg: "Plan not found or priceId missing" });
    }

    const currentSub = await UserSubscription.findOne({ userId, isActive: true, isCancelled: false });
    if (!currentSub || !currentSub.stripeSubscriptionId) {
      // If no active subscription found, create a new subscription via checkout
      try {
        // Create a new checkout session for the new plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            action: 'new_subscription',
            isNewSubscription: 'true',
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromNewSubscription: 'true',
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "new_subscription",
          message: "Redirect to Stripe to complete your new subscription payment",
        });

      } catch (error) {
        console.error("Error creating new subscription checkout session:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to create new subscription checkout session.",
          error: error.message,
        });
      }
    }

    const currentSubscription = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
    
    // Check if user is in trial period
    const isInTrial = currentSubscription.status === 'trialing' || currentSub.isTrialPeriod;
    
    // Check if user is already on this plan (but allow trial-to-paid conversion)
    if (currentSub.planSnapshot?.identifier === identifier && !isInTrial) {
      // CASE: Same Plan Regular Subscription - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the same plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'same_plan_renewal',
            isSamePlanRenewal: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromSamePlanRenewal: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "same_plan_renewal",
          message: "Redirect to Stripe to complete your plan renewal payment",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error processing same plan renewal:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process same plan renewal.",
          error: error.message,
        });
      }
    }

    // Determine if this is an upgrade, downgrade, or trial-to-paid conversion
    const isUpgrade = newPlan.price > currentSub.planSnapshot.price;
    const isDowngrade = newPlan.price < currentSub.planSnapshot.price;
    const isTrialToPaid = currentSub.planSnapshot?.identifier === identifier && isInTrial;
    
    console.log(`Plan change: Current: $${currentSub.planSnapshot.price}, New: $${newPlan.price}, Type: ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : isTrialToPaid ? 'Trial-to-Paid' : 'Same Price'}`);

    // If this is a trial upgrade or trial-to-paid conversion, end trial email campaign
    if ((isUpgrade || isTrialToPaid) && isInTrial) {
      user.trialEmailCampaign.campaignStatus = 'upgraded';
      await user.save();
    }

    if (isTrialToPaid) {
      // CASE 1: Same Plan During Trial Period - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the same plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'trial_to_paid',
            isTrialToPaid: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromTrialToPaid: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "trial_to_paid",
          message: "Redirect to Stripe to complete your trial-to-paid conversion",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error creating trial-to-paid checkout session:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process trial-to-paid conversion.",
          error: error.message,
        });
      }
    } else if (isUpgrade && isInTrial) {
      // CASE 2: Upgrade to Bigger Plan During Trial - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the upgraded plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'trial_upgrade',
            isTrialUpgrade: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromTrialUpgrade: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "trial_upgrade",
          message: "Redirect to Stripe to complete your trial upgrade payment",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error processing trial upgrade:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process trial upgrade.",
          error: error.message,
        });
      }
    } else if (isDowngrade && isInTrial) {
      // CASE 3: Downgrade to Smaller Plan During Trial - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the downgraded plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'trial_downgrade',
            isTrialDowngrade: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromTrialDowngrade: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "trial_downgrade",
          message: "Redirect to Stripe to complete your trial downgrade payment",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error processing trial downgrade:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process trial downgrade.",
          error: error.message,
        });
      }
    } else if (isUpgrade && !isInTrial) {
      // CASE 4: Regular Subscription Upgrade - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the upgraded plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'regular_upgrade',
            isRegularUpgrade: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromRegularUpgrade: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "regular_upgrade",
          message: "Redirect to Stripe to complete your plan upgrade payment",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error processing regular upgrade:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process regular upgrade.",
          error: error.message,
        });
      }
    } else if (isDowngrade && !isInTrial) {
      // CASE 5: Regular Subscription Downgrade - Create new subscription first, then cancel old one
      try {
        // Create a new checkout session for the downgraded plan
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price: newPlan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            action: 'regular_downgrade',
            isRegularDowngrade: 'true',
            oldSubscriptionId: currentSub.stripeSubscriptionId,
          },
          subscription_data: {
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              fromRegularDowngrade: 'true',
              oldSubscriptionId: currentSub.stripeSubscriptionId,
            },
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "regular_downgrade",
          message: "Redirect to Stripe to complete your plan downgrade payment",
          oldSubscriptionId: currentSub.stripeSubscriptionId,
        });

      } catch (error) {
        console.error("Error processing regular downgrade:", error);
        return res.status(500).json({
          success: false,
          msg: "Failed to process regular downgrade.",
          error: error.message,
        });
      }
    } else {
      // Same price - just update the plan
      await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: newPlan.priceId,
          },
        ],
        proration_behavior: "none",
        metadata: {
          userId: user._id.toString(),
          planIdentifier: newPlan.identifier,
          fromUpgradeFlow: true,
        },
      });

      return res.status(200).json({
        success: true,
        msg: "Plan changed successfully.",
        nextBillingDate: new Date(currentSubscription.current_period_end * 1000),
        type: "change",
      });
    }
  } catch (error) {
    console.error("Error upgrading plan:", error.message);
    return res.status(500).json({
      success: false,
      msg: "Failed to upgrade plan.",
      error: error.message,
    });
  }
},



getBillingInfo: async (req, res) => {
  try {
    const userId = req.token._id;

    const userSub = await UserSubscription.findOne({ userId, isActive: true });
    if (!userSub || !userSub.stripeSubscriptionId) {
      return res.status(404).json({ success: false, msg: "No active subscription found." });
    }

    const subscription = await stripe.subscriptions.retrieve(userSub.stripeSubscriptionId);
    const price = subscription.items.data[0].price;
    const product = await stripe.products.retrieve(price.product);

    // ✅ Fetch the upcoming invoice to get actual discounted price
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
      customer: subscription.customer,
    });

    // Convert cents to dollars
    const originalAmount = price.unit_amount / 100;
    const discountedAmount = upcomingInvoice.total / 100;
    const discountPercent = subscription.discount?.coupon?.percent_off || 0;

    return res.status(200).json({
      success: true,
      data: {
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        originalAmount,
        discountedAmount,
        discountPercent,
        currency: price.currency,
        interval: price.recurring.interval,
        productName: product.name,
        priceId: price.id,
        subscriptionStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    });

  } catch (error) {
    console.error("Error fetching billing info:", error.message);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch billing info",
      error: error.message
    });
  }
},

handleWebhook: async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];

    console.log("🔍 STRIIIPEEE---Signature:", sig);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) return res.status(400).send("Webhook secret is missing.");

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    const timestamp = new Date().toISOString();
    console.log(`✅✅✅✅✅ Stripe Event Received✅✅✅✅✅ [${timestamp}]`);
    console.log(`🔍 Event Type: ${event.type}`);
    // console.log(`🔍 Event ID: ${event.id}`);
    // console.log(`🔍 Event Created: ${new Date(event.created * 1000)}`);
    // console.log(`🔍 Event Data Object Type: ${event.data?.object?.object}`);
    // console.log(`🔍 Event Data Object ID: ${event.data?.object?.id}`);
    
    // Log metadata for subscription events
    if (event.type === 'customer.subscription.created' || event.type === 'checkout.session.completed') {
      // console.log(`🔍 Event Metadata: ${JSON.stringify(event.data?.object?.metadata, null, 2)}`);
    }
    
    // console.log("Full EVENT:", JSON.stringify(event, null, 2));
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const { userId, planIdentifier, fromTrialUpgrade, fromTrialDowngrade, fromTrialToPaid, fromRegularUpgrade, fromRegularDowngrade, fromSamePlanRenewal, fromDiscountFlow, oldSubscriptionId, cancelledTrialSubscriptionId, cancelledAtPeriodEndSubscriptionId } = subscription.metadata || {};
        
        console.log(`🔍 customer.subscription.created - Subscription ID: ${subscription.id}`);
        // console.log(`🔍 Full Metadata:`, JSON.stringify(subscription.metadata, null, 2));
        console.log(`🔍 fromTrialToPaid: ${fromTrialToPaid}, cancelledTrialSubscriptionId: ${cancelledTrialSubscriptionId}`);
        console.log(`🔍 fromRegularUpgrade: ${fromRegularUpgrade}, fromRegularDowngrade: ${fromRegularDowngrade}, fromSamePlanRenewal: ${fromSamePlanRenewal}`);
        console.log(`🔍 fromDiscountFlow: ${fromDiscountFlow}, oldSubscriptionId: ${oldSubscriptionId}`);
        console.log(`🔍 rolloverCredits: ${subscription.metadata?.rolloverCredits}`);
        
        if (!userId) {
          console.log(`❌ No userId found in metadata, breaking`);
          break;
        }

        const user = await User.findById(userId);
        if (!user) {
          console.log(`❌ User not found for userId: ${userId}`);
          break;
        }

        // Handle trial activation
        const isTrialPeriod = subscription.metadata?.isTrialPeriod === 'true' || subscription.trial_period_days > 0;
        console.log(`🔍 Is trial period: ${isTrialPeriod}, trial_period_days: ${subscription.trial_period_days}`);
        
        if (isTrialPeriod) {
          console.log(`✅ Setting up trial for user ${user.email}`);
          
          // Update user with trial activation and initial campaign setup
          const trialUpdateResult = await User.findOneAndUpdate(
            { _id: userId },
            { 
              $set: {
                trialActivated: true,
                subscribed: true,
                'trialEmailCampaign.activationEmails.day1Sent': false,
                'trialEmailCampaign.activationEmails.day2Sent': false,
                'trialEmailCampaign.activationEmails.day3MorningSent': false,
                'trialEmailCampaign.activationEmails.day3EveningSent': false,
                'trialEmailCampaign.cancellationEmails.immediate': false,
                'trialEmailCampaign.cancellationEmails.after24h': false,
                'trialEmailCampaign.cancellationEmails.finalDay': false,
                'trialEmailCampaign.lastEmailSentAt': null,
                'trialEmailCampaign.campaignStatus': 'active'
              }
            },
            { new: true, upsert: false }
          );

          if (!trialUpdateResult) {
            console.error(`❌ Failed to update user trial settings for ${userId}`);
          } else {
            console.log(`✅ Updated user trial settings successfully`);
          }
          
          // Send first trial email after a small delay to ensure database update is committed
          setTimeout(async () => {
            try {
              console.log(`📧 Sending trial activation email to ${user.email}`);
              await services.sendTrialActivationEmail(userId, 'day1');
              console.log(`✅ Trial activation email sent successfully`);
            } catch (error) {
              console.error("Failed to send trial activation email:", error);
            }
          }, 100); // 100ms delay
        } else {
          // Just update subscribed status for non-trial subscriptions
          user.subscribed = true;
          await user.save();
        }

        // Check if this subscription already exists
        const existingSubscription = await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });
        if (existingSubscription) {
          console.log("⚠️ Subscription already exists for this subscription ID:", subscription.id);
          break;
        }

        const plan = await SubscriptionPlan.findOne({ identifier: planIdentifier });
        if (!plan) {
          console.error(`❌ Plan not found for subscription creation: ${planIdentifier}`);
          break;
        }

        console.log(`✅ Plan found: ${plan.name} (${plan.identifier})`);

        const planSnapshot = {
          name: plan.name,
          identifier: plan.identifier,
          billingCycle: plan.billingCycle,
          price: plan.price,
          dailyLimit: plan.jobLimits.dailyLimit,
          monthlyCredits: plan.monthlyCredits,
          resumeProfiles: plan.resumeProfiles,
          freeTailoredResumes: plan.freeTailoredResumes,
          freeAutoApplies: plan.freeAutoApplies,
          includesAutoApply: plan.includesAutoApply,
          includesResumeBuilder: plan.includesResumeBuilder,
          includesResumeScore: plan.includesResumeScore,
          includesAICoverLetters: plan.includesAIcoverLetters,
          includesInterviewBuddy: plan.includesInterviewBuddy,
          includesTailoredResumes: plan.includesTailoredResumes,
          descriptionNote: plan.descriptionNote,
        };

        // Calculate and roll over remaining credits from old subscription
        let totalRolloverCredits = 0;
        let oldSubscription = null;

        console.log(`🔍 Starting credit rollover calculation for subscription ${subscription.id}`);
        console.log(`🔍 Metadata check - oldSubscriptionId: ${subscription.metadata?.oldSubscriptionId}`);
        console.log(`🔍 Action types - fromTrialUpgrade: ${fromTrialUpgrade}, fromRegularUpgrade: ${fromRegularUpgrade}, fromDiscountFlow: ${fromDiscountFlow}`);

        // Find the old subscription that's being replaced
        if (subscription.metadata?.oldSubscriptionId) {
          oldSubscription = await UserSubscription.findOne({ stripeSubscriptionId: subscription.metadata.oldSubscriptionId });
          console.log(`🔍 Looking for old subscription with ID: ${subscription.metadata.oldSubscriptionId}`);
          if (oldSubscription) {
            console.log(`✅ Found old subscription: ${oldSubscription.stripeSubscriptionId}`);
            console.log(`📊 Old subscription details: monthlyCredits=${oldSubscription.planSnapshot?.monthlyCredits}, used=${oldSubscription.usage?.monthlyCreditsUsed}`);
          } else {
            console.log(`❌ Old subscription not found in database`);
          }
        } else if (cancelledTrialSubscriptionId) {
          oldSubscription = await UserSubscription.findOne({ stripeSubscriptionId: cancelledTrialSubscriptionId });
          console.log(`🔍 Using cancelledTrialSubscriptionId: ${cancelledTrialSubscriptionId}`);
        } else if (cancelledAtPeriodEndSubscriptionId) {
          oldSubscription = await UserSubscription.findOne({ stripeSubscriptionId: cancelledAtPeriodEndSubscriptionId });
          console.log(`🔍 Using cancelledAtPeriodEndSubscriptionId: ${cancelledAtPeriodEndSubscriptionId}`);
        } else {
          console.log(`🔍 No old subscription ID found in metadata - checking for other active subscriptions`);
        }

        // Calculate remaining credits from old subscription
        if (oldSubscription) {
          console.log(`🔍 Old subscription found: ${oldSubscription.stripeSubscriptionId}, isTrialPeriod: ${oldSubscription.isTrialPeriod}`);
          if (oldSubscription.planSnapshot?.monthlyCredits && oldSubscription.usage?.monthlyCreditsUsed !== undefined) {
            const remainingCredits = oldSubscription.planSnapshot.monthlyCredits - oldSubscription.usage.monthlyCreditsUsed;
            console.log(`💰 Calculating credits: ${oldSubscription.planSnapshot.monthlyCredits} - ${oldSubscription.usage.monthlyCreditsUsed} = ${remainingCredits}`);
            if (remainingCredits > 0) {
              totalRolloverCredits = remainingCredits;
              console.log(`💰 Credit rollover: ${remainingCredits} credits from old subscription ${oldSubscription.stripeSubscriptionId}`);
            } else {
              console.log(`💰 No credits to rollover from old subscription (remaining: ${remainingCredits})`);
            }
          } else {
            console.log(`💰 Old subscription missing credit data - monthlyCredits: ${oldSubscription.planSnapshot?.monthlyCredits}, used: ${oldSubscription.usage?.monthlyCreditsUsed}`);
          }
        }

        // Also check for any other active subscriptions that might have remaining credits
        const otherActiveSubscriptions = await UserSubscription.find({
          userId: user._id,
          isActive: true,
          _id: { $ne: oldSubscription?._id }
        });

        console.log(`🔍 Found ${otherActiveSubscriptions.length} other active subscriptions to check`);

        for (const sub of otherActiveSubscriptions) {
          console.log(`🔍 Checking subscription ${sub.stripeSubscriptionId} for additional credits`);
          if (sub.planSnapshot?.monthlyCredits && sub.usage?.monthlyCreditsUsed !== undefined) {
            const remainingCredits = sub.planSnapshot.monthlyCredits - sub.usage.monthlyCreditsUsed;
            console.log(`💰 Additional calculation: ${sub.planSnapshot.monthlyCredits} - ${sub.usage.monthlyCreditsUsed} = ${remainingCredits}`);
            if (remainingCredits > 0) {
              totalRolloverCredits += remainingCredits;
              console.log(`💰 Additional credit rollover: ${remainingCredits} credits from subscription ${sub.stripeSubscriptionId}`);
              console.log(`💰 Running total rollover credits: ${totalRolloverCredits}`);
            }
          }
        }

        // Add rollover credits to the new subscription's monthly credits
        console.log(`💰 Base plan credits: ${planSnapshot.monthlyCredits}`);
        console.log(`💰 Total rollover credits: ${totalRolloverCredits}`);
        
        if (totalRolloverCredits > 0) {
          const oldMonthlyCredits = planSnapshot.monthlyCredits;
          planSnapshot.monthlyCredits += totalRolloverCredits;
          console.log(`💰 FINAL CALCULATION: ${oldMonthlyCredits} + ${totalRolloverCredits} = ${planSnapshot.monthlyCredits}`);
          console.log(`💰 Total rollover credits: ${totalRolloverCredits} added to new subscription ${subscription.id}`);
        } else {
          console.log(`💰 No rollover credits to add to new subscription`);
        }

        console.log(`📝 Creating new subscription with planSnapshot:`, JSON.stringify(planSnapshot, null, 2));

        const newSub = await UserSubscription.create({
          userId: user._id,
          subscriptionPlanId: plan._id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          planSnapshot,
          usage: {
            jobApplicationsToday: 0,
            monthlyCreditsUsed: 0,
            resumeProfilesUsed: 0,
            tailoredResumesUsed: 0,
            autoAppliesUsed: 0,
            jobDescriptionGenerations: 0,
            jobSkillsGenerations: 0,
            jobTitleGenerations: 0,
            generationsWithoutTailoring: 0,
          },
          startDate: new Date(subscription.current_period_start * 1000),
          isTrialPeriod: false, // This is not a trial subscription
          endDate: new Date(subscription.current_period_end * 1000),
          isActive: true,
          isCancelled: false,
          cancelAt: null,
        });

        console.log(`✅ New subscription created in database: ${newSub._id}`);

        // Handle old subscription cancellation and deletion for all upgrade/downgrade scenarios
        let subscriptionToCancel = null;
        
        // Check for old subscription ID in metadata
        if (subscription.metadata?.oldSubscriptionId) {
          subscriptionToCancel = subscription.metadata.oldSubscriptionId;
          console.log(`🔍 Found oldSubscriptionId in metadata: ${subscriptionToCancel}`);
        } else if (cancelledTrialSubscriptionId) {
          subscriptionToCancel = cancelledTrialSubscriptionId;
        } else if (cancelledAtPeriodEndSubscriptionId) {
          subscriptionToCancel = cancelledAtPeriodEndSubscriptionId;
        }

        if (subscriptionToCancel) {
          try {
            console.log(`🚫 Attempting to cancel old subscription: ${subscriptionToCancel}`);
            // Immediately cancel the old subscription in Stripe
            await stripe.subscriptions.cancel(subscriptionToCancel);
            console.log(`✅ Successfully cancelled old subscription in Stripe: ${subscriptionToCancel}`);

            // Delete the old subscription data from our database
            const deletedSub = await UserSubscription.findOneAndDelete({ stripeSubscriptionId: subscriptionToCancel });
            if (deletedSub) {
              console.log(`🗑️ Successfully deleted old subscription data for: ${subscriptionToCancel}`);
            } else {
              console.log(`⚠️ Old subscription data not found in database for: ${subscriptionToCancel}`);
            }

          } catch (error) {
            console.error(`❌ Error cancelling/deleting old subscription ${subscriptionToCancel}:`, error.message);
            // Continue with the process even if old subscription cleanup fails
          }
        } else {
          console.log(`ℹ️ No old subscription to cancel`);
        }

        // Set all other user subscriptions to inactive (except for those scheduled for cancellation at period end)
        const updateResult = await UserSubscription.updateMany(
          { 
            userId: user._id,
            _id: { $ne: newSub._id },
            isCancelled: { $ne: true } // Don't deactivate subscriptions that are already scheduled for cancellation
          },
          { isActive: false }
        );
        console.log(`🔄 Updated ${updateResult.modifiedCount} other subscriptions to inactive`);

        // Create SubscriptionCancellation record for discount flows
        if (fromDiscountFlow === "true") {
          try {
            await SubscriptionCancellation.create({
              userId,
              subscriptionId: newSub._id,
              cancelReason: [],
              cancelReasonText: "30% discount flow completed",
              type: "cancel",
              appliedDiscount: true,
            });
            console.log(`📝 Created SubscriptionCancellation record for discount flow`);
          } catch (error) {
            console.error(`❌ Error creating SubscriptionCancellation record:`, error.message);
          }
        }

        // Determine the action type for logging
        let actionType = 'regular';
        if (fromTrialUpgrade === 'true') actionType = 'trial_upgrade';
        else if (fromTrialDowngrade === 'true') actionType = 'trial_downgrade';
        else if (fromTrialToPaid === 'true') actionType = 'trial_to_paid';
        else if (fromRegularUpgrade === 'true') actionType = 'regular_upgrade';
        else if (fromRegularDowngrade === 'true') actionType = 'regular_downgrade';
        else if (fromSamePlanRenewal === 'true') actionType = 'same_plan_renewal';
        else if (fromDiscountFlow === 'true') actionType = 'discount_flow';
        
        console.log(`✅ New subscription created for user ${user.email}: ${subscription.id} (${actionType})`);
        if (subscriptionToCancel) {
          console.log(`🔄 Old subscription ${subscriptionToCancel} has been cancelled and deleted`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object;
        const subscription = await UserSubscription.findOne({ stripeSubscriptionId: deletedSub.id });
        
        if (subscription) {
          // Update subscription status
          subscription.isActive = false;
          subscription.isCancelled = true;
          subscription.cancelAt = null;
          subscription.endDate = new Date();
          await subscription.save();

          // If this was a trial subscription, handle trial cancellation emails
          if (subscription.isTrialPeriod) {
            const user = await User.findById(subscription.userId);
            if (user && user.trialEmailCampaign.campaignStatus === 'active') {
              user.trialEmailCampaign.campaignStatus = 'cancelled';
              await user.save();

              // Send immediate cancellation email
              try {
                await services.sendTrialCancellationEmail(user._id, 'immediate');
              } catch (error) {
                console.error("Failed to send trial cancellation email:", error);
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log(`🔍 customer.subscription.updated - Subscription ID: ${sub.id}`);
        console.log(`🔍 Subscription status: ${sub.status}`);
        console.log(`🔍 Cancel at period end: ${sub.cancel_at_period_end}`);
        console.log(`🔍 Cancel at: ${sub.cancel_at}`);
        
        const subscription = await UserSubscription.findOne({ stripeSubscriptionId: sub.id });
        
        if (!subscription) {
          console.log(`❌ Subscription not found in database for ID: ${sub.id}`);
          break;
        }

        console.log(`🔍 Database subscription found - isTrialPeriod: ${subscription.isTrialPeriod}, isCancelled: ${subscription.isCancelled}`);
        
        const wasNotCancelled = !subscription.isCancelled;
        console.log(`🔍 wasNotCancelled: ${wasNotCancelled}`);
        
        // Update cancellation status
        subscription.isCancelled = sub.cancel_at_period_end;
        subscription.cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;
        
        console.log(`🔍 Updated subscription - isCancelled: ${subscription.isCancelled}, cancelAt: ${subscription.cancelAt}`);
        
        // Handle subscription cancellation at period end
        if (subscription.isCancelled && sub.status === 'canceled') {
          // Subscription has been cancelled and the period has ended
          subscription.isActive = false;
          subscription.endDate = new Date();
          console.log(`🔄 Subscription ${sub.id} cancelled at period end - setting isActive to false`);
        } else if (subscription.isCancelled && sub.status === 'active') {
          // Subscription is cancelled but still active until period end
          // Keep isActive as true until the period actually ends
          console.log(`⏰ Subscription ${sub.id} cancelled but still active until period end`);

          // If this is a trial subscription being cancelled for the first time
          if (subscription.isTrialPeriod && wasNotCancelled) {
            console.log(`🔍 Trial subscription cancelled for the first time - preparing to send cancellation email`);
            const user = await User.findById(subscription.userId);
            if (!user) {
              console.log(`❌ User not found for subscription ${sub.id}`);
            } else {
              console.log(`✅ User found: ${user.email}`);
              try {
                // Update campaign status first
                console.log(`📝 Updating campaign status to cancelled`);
                const updatedUser = await User.findOneAndUpdate(
                  { _id: user._id },
                  { $set: { 'trialEmailCampaign.campaignStatus': 'cancelled' } },
                  { new: true }
                );

                if (!updatedUser) {
                  console.error(`❌ Failed to update campaign status for user ${user._id}`);
                } else {
                  console.log(`✅ Updated campaign status successfully`);
                }

                // Send immediate cancellation email
                console.log(`📧 Sending immediate cancellation email to ${user.email}`);
                await services.sendTrialCancellationEmail(user._id, 'immediate');
                console.log(`✅ Trial cancellation email sent successfully to ${user.email}`);
              } catch (error) {
                console.error(`❌ Failed to send trial cancellation email:`, error);
                console.error(`❌ Error details:`, error.stack);
              }
            }
          } else {
            console.log(`🔍 Not sending cancellation email - isTrialPeriod: ${subscription.isTrialPeriod}, wasNotCancelled: ${wasNotCancelled}`);
          }
        } else if (subscription.isCancelled && sub.status === 'past_due') {
          // Subscription is cancelled and past due - set to inactive
          subscription.isActive = false;
          console.log(`🚫 Subscription ${sub.id} cancelled and past due - setting isActive to false`);
        }
          
        // Check if this is a plan change (upgrade/downgrade)
        if (sub.metadata?.planIdentifier && sub.metadata?.fromUpgradeFlow === "true") {
          const plan = await SubscriptionPlan.findOne({ identifier: sub.metadata.planIdentifier });
          if (plan) {
            subscription.planSnapshot = {
              ...subscription.planSnapshot,
              ...plan.toObject(),
            };
            subscription.updatedAt = new Date();
            
            // Set all other user subscriptions to inactive and this one to active
            await UserSubscription.updateMany(
              { 
                userId: subscription.userId,
                _id: { $ne: subscription._id }
              },
              { isActive: false }
            );
            
            subscription.isActive = true;
          }
        }
        
        await subscription.save();
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        const {
          userId,
          planIdentifier,
          creditsPurchased,
          fromDiscountFlow,
          fromUpgradeFlow,
          isTrialPeriod
        } = session.metadata || {};

        console.log(`🔍 checkout.session.completed - Session ID: ${session.id}`);
        // console.log(`🔍 Full Session Metadata:`, JSON.stringify(session.metadata, null, 2));
        console.log(`🔍 fromDiscountFlow: ${fromDiscountFlow}`);
        console.log(`🔍 Session mode: ${session.mode}`);
        console.log(`🔍 Session subscription: ${session.subscription}`);

        if (!userId) {
          console.log(`❌ No userId found in session metadata, breaking`);
          break;
        }

        // If this payment was from a discount flow, mark the discount as used
        if (fromDiscountFlow === 'true') {
          const user = await User.findById(userId);
          if (user) {
            user.discountUsed = true;
            await user.save();
            console.log(`✅ Updated discountUsed flag for user ${userId}`);
          }
        }

        const user = await User.findById(userId);
        if (!user) {
          console.log(`❌ User not found for userId: ${userId}`);
          break;
        }

          user.subscribed = true;
        await user.save();


        if (!user.stripeCustomerId) {
          user.stripeCustomerId = session.customer;
          await user.save();
        }

        if (creditsPurchased && session.mode === "payment") {
          console.log(`💰 Processing credit purchase: ${creditsPurchased} credits`);
          const extraCredits = parseInt(creditsPurchased, 10);
          user.credits += extraCredits;
          await user.save();
          
          // Create PaymentHistory record for credit purchase
          await PaymentHistory.create({
            userId: user._id,
            subscriptionId: null, // No subscription for credit purchases
            stripeSubscriptionId: null, // No subscription for credit purchases
            invoiceId: session.payment_intent || session.id, // Use payment_intent as invoiceId for credit purchases
            amount: session.amount_total,
            currency: session.currency || "usd",
            paidAt: new Date(session.created * 1000),
            status: "paid",
            metadata: {
              creditsPurchased: extraCredits,
              type: "credit_purchase",
              fromCheckout: true,
            },
            paymentMethod: session.payment_method_types?.[0] || "card",
          });
          
          break;
        }

        if (planIdentifier && session.mode === "subscription" && session.subscription) {
          console.log(`📋 Processing subscription creation for plan: ${planIdentifier}`);
          
          // Check if this is a trial upgrade, downgrade, trial-to-paid, regular upgrade/downgrade, same plan renewal, or discount flow - if so, let customer.subscription.created handle it
          if (session.metadata?.action === 'trial_upgrade' || session.metadata?.action === 'trial_downgrade' || session.metadata?.action === 'trial_to_paid' || session.metadata?.action === 'regular_upgrade' || session.metadata?.action === 'regular_downgrade' || session.metadata?.action === 'same_plan_renewal' || session.metadata?.fromDiscountFlow === 'true') {
            const actionType = session.metadata?.action || (session.metadata?.fromDiscountFlow === 'true' ? 'discount_flow' : 'unknown');
            console.log(`⚠️ ${actionType} detected - letting customer.subscription.created handle subscription creation`);
            console.log(`⚠️ Skipping subscription creation in checkout.session.completed for: ${actionType}`);
            break;
          }

          const alreadyExists = await UserSubscription.findOne({
            stripeSubscriptionId: session.subscription,
            userId: user._id,
          });

          if (alreadyExists) {
            console.log("⚠️ Subscription already exists for this session.subscription ID. Skipping creation.");
            break;
          }

          const plan = await SubscriptionPlan.findOne({ identifier: planIdentifier });
          if (!plan) break;

          // Check if this is an upgrade flow that should handle credit rollover in customer.subscription.created instead
          const isUpgradeFlow = session.metadata?.action === 'trial_upgrade' || 
                               session.metadata?.action === 'trial_downgrade' || 
                               session.metadata?.action === 'trial_to_paid' || 
                               session.metadata?.action === 'regular_upgrade' || 
                               session.metadata?.action === 'regular_downgrade' || 
                               session.metadata?.action === 'same_plan_renewal' || 
                               session.metadata?.fromDiscountFlow === 'true';

          let totalRolloverCredits = 0;
          
          // Only calculate rollover credits if this is NOT an upgrade flow
          // Upgrade flows handle credit rollover in customer.subscription.created
          if (!isUpgradeFlow) {
            console.log(`💰 Regular subscription creation - calculating credit rollover`);
            
            // Check for any active subscriptions that might have remaining credits 
            const existingActiveSubscriptions = await UserSubscription.find({
              userId: user._id,
              isActive: true,
            });

            for (const sub of existingActiveSubscriptions) {
              if (sub.planSnapshot?.monthlyCredits && sub.usage?.monthlyCreditsUsed !== undefined) {
                const remainingCredits = sub.planSnapshot.monthlyCredits - sub.usage.monthlyCreditsUsed;
                if (remainingCredits > 0) {
                  totalRolloverCredits += remainingCredits;
                  console.log(`💰 Credit rollover: ${remainingCredits} credits from subscription ${sub.stripeSubscriptionId}`);
                }
              }
            }
          } else {
            console.log(`💰 Upgrade flow detected - credit rollover will be handled in customer.subscription.created webhook`);
          }

          const planSnapshot = {
            name: plan.name,
            identifier: plan.identifier,
            billingCycle: plan.billingCycle,
            price: plan.price,
            dailyLimit: plan.jobLimits.dailyLimit,
            monthlyCredits: isTrialPeriod 
              ? 60 
              : plan.monthlyCredits + totalRolloverCredits, // Conditional monthly credits
            resumeProfiles: plan.resumeProfiles,
            freeTailoredResumes: plan.freeTailoredResumes,
            freeAutoApplies: plan.freeAutoApplies,
            includesAutoApply: plan.includesAutoApply,
            includesResumeBuilder: plan.includesResumeBuilder,
            includesResumeScore: plan.includesResumeScore,
            includesAICoverLetters: plan.includesAICoverLetters,
            includesInterviewBuddy: plan.includesInterviewBuddy,
            includesTailoredResumes: plan.includesTailoredResumes,
            descriptionNote: plan.descriptionNote,
          };

          if (totalRolloverCredits > 0) {
            console.log(`💰 Total rollover credits: ${totalRolloverCredits} added to new subscription ${session.subscription}`);
          }

          const newSub = await UserSubscription.create({
            userId: user._id,
            subscriptionPlanId: plan._id,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            planSnapshot,
            usage: {
              jobApplicationsToday: 0,
              monthlyCreditsUsed: 0,
              resumeProfilesUsed: 0,
              tailoredResumesUsed: 0,
              autoAppliesUsed: 0,
              jobDescriptionGenerations: 0,
              jobSkillsGenerations: 0,
              jobTitleGenerations: 0,
              generationsWithoutTailoring: 0,
            },
            startDate: new Date(),
            isTrialPeriod: !!isTrialPeriod,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            isCancelled: false,
            cancelAt: null,
          });

          user.isNewUser = false;
          await user.save();

          const freeSub = await UserSubscription.findOne({
            userId,
            isActive: true,
            isCancelled: false,
            "planSnapshot.identifier": "free_plan",
          });

          if (freeSub) {
            const remainingCredits =
              freeSub.planSnapshot.monthlyCredits - freeSub.usage.monthlyCreditsUsed;

            if (remainingCredits > 0) {
              user.credits += remainingCredits;
            }

            freeSub.isActive = false;
            freeSub.isCancelled = true;
            freeSub.cancelAt = new Date();
            await freeSub.save();

            user.isFreePlanExpired = false;
            await user.save();
          }



          if (fromUpgradeFlow === "true") {
            await SubscriptionCancellation.create({
              userId,
              subscriptionId: newSub._id,
              cancelReason: [],
              cancelReasonText: "Plan upgraded or downgraded",
              type: "upgrade",
              appliedDiscount: false,
            });
          }
        }

        // Handle upgrade payments from checkout sessions
        if (session.mode === "subscription" && session.metadata?.action === 'trial_upgrade') {
          console.log(`Processing trial_upgrade subscription from checkout session`);
          
          const { planIdentifier, oldSubscriptionId } = session.metadata;
          
          const subscription = await UserSubscription.findOne({ 
            stripeSubscriptionId: session.subscription,
            userId: user._id 
          });
          
          if (!subscription) {
            console.error(`Subscription not found for trial_upgrade: ${session.subscription}`);
            break;
          }

          const newPlan = await SubscriptionPlan.findOne({ identifier: planIdentifier });
          if (!newPlan) {
            console.error(`Plan not found for trial_upgrade: ${planIdentifier}`);
            break;
          }

          // Update the new subscription with the correct plan snapshot
          subscription.planSnapshot = {
            ...subscription.planSnapshot,
            ...newPlan.toObject(),
          };
          subscription.isTrialPeriod = false;
          subscription.isActive = true;
          subscription.updatedAt = new Date();
          await subscription.save();

          // Set all other user subscriptions to inactive
          await UserSubscription.updateMany(
            { 
              userId: subscription.userId,
              _id: { $ne: subscription._id }
            },
            { isActive: false }
          );

          // Save payment history for the new subscription
          // Note: We'll let the invoice.payment_succeeded webhook handle the payment history
          // to avoid creating duplicate records with incorrect invoice IDs
          console.log(`✅ trial_upgrade completed successfully for user ${user.email}`);
        } else if (session.mode === "payment" && session.metadata?.action) {
          const { action, planIdentifier, stripeSubscriptionId, currentPlanIdentifier } = session.metadata;
          
          if (action === 'regular_upgrade' || action === 'trial_to_paid' || action === 'trial_downgrade') {
            console.log(`Processing ${action} payment from checkout session`);
            
            const subscription = await UserSubscription.findOne({ 
              stripeSubscriptionId,
              userId: user._id 
            });
            
            if (!subscription) {
              console.error(`Subscription not found for ${action}: ${stripeSubscriptionId}`);
              break;
            }

            const newPlan = await SubscriptionPlan.findOne({ identifier: planIdentifier });
            if (!newPlan) {
              console.error(`Plan not found for ${action}: ${planIdentifier}`);
              break;
            }

            // Update subscription based on action type
            if (action === 'trial_to_paid') {
              // For trial-to-paid conversion, just end the trial and keep the same plan
              await stripe.subscriptions.update(stripeSubscriptionId, {
                trial_end: 'now',
                metadata: {
                  userId: user._id.toString(),
                  planIdentifier: newPlan.identifier,
                  fromUpgradeFlow: true,
                  isTrialToPaid: true,
                  trialCancelled: true,
                },
              });
            } else if (action === 'trial_downgrade') {
              // For trial downgrades, change the plan and end the trial
              await stripe.subscriptions.update(stripeSubscriptionId, {
                items: [
                  {
                    id: (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].id,
                    price: newPlan.priceId,
                  },
                ],
                trial_end: 'now',
                proration_behavior: "none",
                metadata: {
                  userId: user._id.toString(),
                  planIdentifier: newPlan.identifier,
                  fromUpgradeFlow: true,
                  isDowngrade: true,
                  isTrialDowngrade: true,
                  trialCancelled: true,
                },
              });
            } else {
              // For regular upgrades, change the plan
              await stripe.subscriptions.update(stripeSubscriptionId, {
                items: [
                  {
                    id: (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].id,
                    price: newPlan.priceId,
                  },
                ],
                proration_behavior: "create_prorations",
                metadata: {
                  userId: user._id.toString(),
                  planIdentifier: newPlan.identifier,
                  fromUpgradeFlow: true,
                  isUpgrade: true,
                },
              });
            }

            // Update plan snapshot
            if (action === 'trial_to_paid') {
              // Keep the same plan snapshot, just update the trial status
              subscription.updatedAt = new Date();
            } else {
              // For upgrades/downgrades, update the plan snapshot
              subscription.planSnapshot = {
                ...subscription.planSnapshot,
                ...newPlan.toObject(),
              };
              subscription.updatedAt = new Date();
            }
            
            // Set all other user subscriptions to inactive and this one to active
            await UserSubscription.updateMany(
              { 
                userId: subscription.userId,
                _id: { $ne: subscription._id }
              },
              { isActive: false }
            );
            
            subscription.isActive = true;

            // Handle trial cancellation for trial downgrades and trial-to-paid conversions
            if (action === 'trial_to_paid' || action === 'trial_downgrade') {
              subscription.isTrialPeriod = false;
            }

            await subscription.save();

            // Note: Payment history will be created by the invoice.payment_succeeded webhook
            // to avoid creating duplicate records with incorrect invoice IDs
            console.log(`✅ ${action} completed successfully for user ${user.email}`);
          }
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription;
        const stripeCustomerId = invoice.customer;

        const userId = invoice.metadata?.userId;
        const planIdentifier = invoice.metadata?.planIdentifier;
        const isUpgrade = invoice.metadata?.fromUpgradeFlow === "true";
        const isDowngrade = invoice.metadata?.isDowngrade === "true";

        const user = await User.findOne({ stripeCustomerId });
        const subscription = await UserSubscription.findOne({
          stripeSubscriptionId,
          userId: user?._id,
        });

          user.subscribed = true;
        await user.save();


        if (!user || !subscription) break;

        // Check if this is a trial upgrade, downgrade, trial-to-paid, or regular upgrade/downgrade by looking at subscription metadata
        const isTrialUpgrade = subscription.metadata?.fromTrialUpgrade === 'true' || 
                              subscription.metadata?.isTrialUpgrade === 'true';
        const isTrialDowngrade = subscription.metadata?.fromTrialDowngrade === 'true' || 
                                subscription.metadata?.isTrialDowngrade === 'true';
        const isTrialToPaid = subscription.metadata?.fromTrialToPaid === 'true' || 
                             subscription.metadata?.isTrialToPaid === 'true';
        const isRegularUpgrade = subscription.metadata?.fromRegularUpgrade === 'true' || 
                                subscription.metadata?.isRegularUpgrade === 'true';
        const isRegularDowngrade = subscription.metadata?.fromRegularDowngrade === 'true' || 
                                  subscription.metadata?.isRegularDowngrade === 'true';

        // Save payment history if not exists
        const existingPayment = await PaymentHistory.findOne({ invoiceId: invoice.id });
        if (!existingPayment) {
          await PaymentHistory.create({
            userId: user._id,
            subscriptionId: subscription._id,
            stripeSubscriptionId,
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            paidAt: new Date(invoice.created * 1000),
            status: invoice.status || "paid",
            metadata: {
              ...invoice.metadata,
              action: isTrialUpgrade ? 'trial_upgrade' : isTrialDowngrade ? 'trial_downgrade' : isTrialToPaid ? 'trial_to_paid' : isRegularUpgrade ? 'regular_upgrade' : isRegularDowngrade ? 'regular_downgrade' : (isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'payment'),
              fromCheckout: true,
            },
            paymentMethod: invoice.payment_method_types?.[0] || "card",
          });
        }

        // Update plan snapshot for upgrades, downgrades, and trial conversions
        if (planIdentifier && (isUpgrade || isDowngrade || isTrialUpgrade || isTrialDowngrade || isTrialToPaid || isRegularUpgrade || isRegularDowngrade)) {
          const plan = await SubscriptionPlan.findOne({ identifier: planIdentifier });
          if (plan) {
            subscription.planSnapshot = {
              ...subscription.planSnapshot,
              ...plan.toObject(),
            };
            subscription.updatedAt = new Date();
            
            // Set all other user subscriptions to inactive and this one to active
            // But don't deactivate subscriptions that are scheduled for cancellation at period end
            await UserSubscription.updateMany(
              { 
                userId: subscription.userId,
                _id: { $ne: subscription._id },
                isCancelled: { $ne: true } // Don't deactivate subscriptions that are already scheduled for cancellation
              },
              { isActive: false }
            );
            
            subscription.isActive = true;
            await subscription.save();
          }
        }

        // Remove trial status after first successful payment
        if (invoice.amount_paid > 0 && subscription) {
          const wasTrialPeriod = subscription.isTrialPeriod;
          subscription.isTrialPeriod = false;

          if (invoice.lines?.data?.[0]?.period?.end) {
            subscription.endDate = new Date(invoice.lines.data[0].period.end * 1000);
          }

          // Handle NATURAL trial-to-paid conversion: calculate remaining credits and update monthlyCredits
          // Only do this when it's NOT an upgrade/downgrade operation (i.e., natural trial ending)
          // AND when credit rollover hasn't already been handled by customer.subscription.created
          const isNaturalTrialEnding = !isTrialUpgrade && !isTrialDowngrade && !isRegularUpgrade && !isRegularDowngrade;
          
          // Check if this subscription was created via an upgrade flow that already handled credit rollover
          const isUpgradeFlow = subscription.planSnapshot.monthlyCredits > 4000; // If it's more than base plan, credits were already rolled over
          
          console.log(`💰 Credit rollover check: isNaturalTrialEnding=${isNaturalTrialEnding}, isUpgradeFlow=${isUpgradeFlow}, monthlyCredits=${subscription.planSnapshot.monthlyCredits}`);
          
          if (isNaturalTrialEnding && !isUpgradeFlow && subscription.planSnapshot?.monthlyCredits && subscription.usage?.monthlyCreditsUsed !== undefined) {
            try {
              console.log(`💰 Natural trial ending detected - calculating remaining credits (no prior rollover)`);
              
              // Calculate remaining credits using the same formula used elsewhere in the code
              const remainingCredits = subscription.planSnapshot.monthlyCredits - subscription.usage.monthlyCreditsUsed;
              
              if (remainingCredits > 0) {
                console.log(`💰 Trial ending: ${remainingCredits} credits remaining from trial period`);
                
                // Fetch the subscription plan to get the actual monthlyCredits
                const plan = await SubscriptionPlan.findOne({ identifier: subscription.planSnapshot.identifier });
                
                if (plan) {
                  // Update monthlyCredits to remaining credits + plan monthlyCredits
                  const newMonthlyCredits = remainingCredits + plan.monthlyCredits;
                  subscription.planSnapshot.monthlyCredits = newMonthlyCredits;
                  subscription.usage.monthlyCreditsUsed = 0;

                  
                  console.log(`💰 Updated monthlyCredits from ${subscription.planSnapshot.monthlyCredits} to ${newMonthlyCredits} (${remainingCredits} remaining + ${plan.monthlyCredits} new)`);
                } else {
                  console.warn(`⚠️ Subscription plan not found for identifier: ${subscription.planSnapshot.identifier}`);
                }
              } else {
                console.log(`💰 Trial ending: No credits remaining from trial period`);
              }
            } catch (error) {
              console.error(`❌ Error calculating trial credits:`, error.message);
            }
          } else if (!isNaturalTrialEnding) {
            console.log(`💰 Skipping trial credit calculation - this is an upgrade/downgrade operation, not natural trial ending`);
          } else if (isUpgradeFlow) {
            console.log(`💰 Skipping trial credit calculation - credits were already rolled over in customer.subscription.created (monthlyCredits: ${subscription.planSnapshot.monthlyCredits})`);
          }

          // End trial email campaign when trial converts to paid subscription
          if (wasTrialPeriod && user) {
            console.log(`📧 Trial converted to paid subscription - ending trial email campaign for user ${user.email}`);
            try {
              await User.findOneAndUpdate(
                { _id: user._id },
                { $set: { 'trialEmailCampaign.campaignStatus': 'completed' } },
                { new: true }
              );
              console.log(`✅ Trial email campaign marked as completed`);
            } catch (error) {
              console.error(`❌ Failed to update trial email campaign status:`, error.message);
            }
          }

          await subscription.save();
        }

        break;
      }


     case "invoice.payment_failed": {
  const invoice = event.data.object;
  const stripeCustomerId = invoice.customer;
  const user = await User.findOne({ stripeCustomerId });

  if (user) {
    console.warn(`❌ Payment failed for user ${user.email}. Invoice ID: ${invoice.id}`);

    // Optionally notify the user via email or app
    // Optionally mark subscription as pending/unpaid in your system
  } else {
    console.warn("❌ Payment failed. User not found for customer:", stripeCustomerId);
  }

  break;
}

      case "invoice.created": {
        const invoice = event.data.object;
        console.log(`🧾 Invoice created. Reason: ${invoice.billing_reason}`);
        console.log(`  → Amount due: ${invoice.amount_due / 100} ${invoice.currency}`);
        console.log(`  → For subscription: ${invoice.subscription}`);
        
        // Handle downgrades that take effect at next billing cycle
        if (invoice.billing_reason === 'subscription_cycle' && invoice.metadata?.isDowngrade === "true") {
          const subscription = await UserSubscription.findOne({ stripeSubscriptionId: invoice.subscription });
          if (subscription && invoice.metadata?.planIdentifier) {
            const plan = await SubscriptionPlan.findOne({ identifier: invoice.metadata.planIdentifier });
            if (plan) {
              subscription.planSnapshot = {
                ...subscription.planSnapshot,
                ...plan.toObject(),
              };
              subscription.updatedAt = new Date();
              
              // Set all other user subscriptions to inactive and this one to active
              await UserSubscription.updateMany(
                { 
                  userId: subscription.userId,
                  _id: { $ne: subscription._id }
                },
                { isActive: false }
              );
              
              subscription.isActive = true;
              await subscription.save();
            }
          }
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        console.log(`🔍 Trial ending soon for subscription ${sub.id}`);
        
        const subscription = await UserSubscription.findOne({ stripeSubscriptionId: sub.id });
        if (!subscription) {
          console.log(`❌ Subscription not found for trial_will_end: ${sub.id}`);
          break;
        }

        const user = await User.findById(subscription.userId);
        if (!user) {
          console.log(`❌ User not found for trial_will_end subscription: ${sub.id}`);
          break;
        }

        // Calculate hours passed in trial
        const hoursPassed = Math.floor((new Date() - subscription.startDate) / (1000 * 60 * 60));
        console.log(`🔍 Hours passed in trial: ${hoursPassed}`);

        // Only send final day emails if we're actually near the end of trial (> 48 hours)
        if (hoursPassed < 48) {
          console.log(`⏳ Too early for final day email (${hoursPassed} hours passed). Skipping.`);
          break;
        }

        // If subscription is cancelled, send final cancellation email
        if (subscription.isCancelled) {
          // Check if final cancellation email was already sent
          if (user.trialEmailCampaign.cancellationEmails.finalDay) {
            console.log(`📧 Final cancellation email already sent. Skipping.`);
            break;
          }

          console.log(`🔍 Cancelled trial ending - sending final cancellation email to ${user.email}`);
          try {
            await services.sendTrialCancellationEmail(user._id, 'finalDay');
            console.log(`✅ Final trial cancellation email sent successfully`);
          } catch (error) {
            console.error(`❌ Failed to send final trial cancellation email:`, error);
          }
        }
        // If not cancelled, send final trial day email
        else {
          // Check if final day email was already sent
          if (user.trialEmailCampaign.activationEmails.day3EveningSent) {
            console.log(`📧 Final day email already sent. Skipping.`);
            break;
          }

          console.log(`🔍 Trial ending - sending final day email to ${user.email}`);
          try {
            await services.sendTrialActivationEmail(user._id, 'day3Evening');
            console.log(`✅ Final trial day email sent successfully`);
          } catch (error) {
            console.error(`❌ Failed to send final trial day email:`, error);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer;
      
        // 1) Find the user by customer
        const user = await User.findOne({ stripeCustomerId });
      
        if (!user) {
          console.warn("❌ Payment failed. User not found for customer:", stripeCustomerId);
          break;
        }
      
        console.warn(`❌ Payment failed for user ${user.email}. Invoice ID: ${invoice.id}`);
      
        // 2) Find the subscription in your DB using the invoice.subscription id
        // const subscription = await UserSubscription.findOne({
        //   stripeSubscriptionId: invoice.subscription,
        //   userId: user._id,
        // });
      
        // // 3) Mark system flags on failure (idempotent-ish)
        // try {
          // Mark the user so UI can show "fix your payment method" banners, etc.
          // if (user.lastPaymentFailed !== true) {
            user.lastPaymentFailed = true;
            await user.save();
          // }
      
          // Deactivate access until a retry succeeds
          // if (subscription && subscription.isActive !== false) {
          //   subscription.isActive = false;
          //   // optional: keep other flags as-is; do NOT mark cancelled here
          //   // optional: you could store invoice.id or next_payment_attempt if your schema has fields
          //   await subscription.save();
          // }
        // } catch (e) {
        //   console.error("❌ Failed to persist payment_failed flags:", e.message);
        // }
      
        // (Optional) notify user / send email here
        // services.notifyPaymentFailed(user._id, invoice.id).catch(console.error);
      
        break;
      }

      default: {
        console.log(`⚠️ Unhandled webhook event type: ${event.type}`);
        // console.log(`🔍 Event data:`, JSON.stringify(event.data, null, 2));
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error processing webhook:", err.message);
    res.status(500).json({ error: err.message });
  }
},

  // Add these helper functions for testing card declines
  getUserPaymentMethods: async (req, res) => {
    try {
      const userId = req.token._id;
      const user = await User.findById(userId);
      
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      return res.status(200).json({
        success: true,
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          last4: pm.card.last4,
          brand: pm.card.brand,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          isDefault: pm.metadata.isDefault === 'true'
        }))
      });
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return res.status(500).json({ success: false, msg: "Failed to get payment methods", error: error.message });
    }
  },

  // Test function to update payment method with a declined card
  updatePaymentMethodForTesting: async (req, res) => {
    try {
      const userId = req.token._id;
      const { testCardType = 'insufficient_funds' } = req.body; // 'insufficient_funds', 'expired', 'incorrect_cvc'
      
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      // Test card numbers based on type
      const testCards = {
        insufficient_funds: '4000000000000002',
        expired: '4000000000000069',
        incorrect_cvc: '4000000000000127'
      };

      const cardNumber = testCards[testCardType] || testCards.insufficient_funds;

      // Create a new payment method with the test card
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: 12,
          exp_year: 2030,
          cvc: '123',
        },
      });

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: user.stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      return res.status(200).json({
        success: true,
        msg: `Payment method updated with test card for ${testCardType} simulation`,
        paymentMethodId: paymentMethod.id,
        testCardType: testCardType
      });
    } catch (error) {
      console.error("Error updating payment method for testing:", error);
      return res.status(500).json({ success: false, msg: "Failed to update payment method", error: error.message });
    }
  },

  // Add these helper functions for testing card declines
  getUserPaymentMethods: async (req, res) => {
    try {
      const userId = req.token._id;
      const user = await User.findById(userId);
      
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      return res.status(200).json({
        success: true,
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          last4: pm.card.last4,
          brand: pm.card.brand,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          isDefault: pm.metadata.isDefault === 'true'
        }))
      });
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return res.status(500).json({ success: false, msg: "Failed to get payment methods", error: error.message });
    }
  },

  // Test function to update payment method with a declined card
  updatePaymentMethodForTesting: async (req, res) => {
    try {
      const userId = req.token._id;
      const { testCardType = 'insufficient_funds' } = req.body; // 'insufficient_funds', 'expired', 'incorrect_cvc'
      
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      // Test card numbers based on type
      const testCards = {
        insufficient_funds: '4000000000000002',
        expired: '4000000000000069',
        incorrect_cvc: '4000000000000127'
      };

      const cardNumber = testCards[testCardType] || testCards.insufficient_funds;

      // Create a new payment method with the test card
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: 12,
          exp_year: 2030,
          cvc: '123',
        },
      });

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: user.stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      return res.status(200).json({
        success: true,
        msg: `Payment method updated with test card for ${testCardType} simulation`,
        paymentMethodId: paymentMethod.id,
        testCardType: testCardType
      });
    } catch (error) {
      console.error("Error updating payment method for testing:", error);
      return res.status(500).json({ success: false, msg: "Failed to update payment method", error: error.message });
    }
  },

  createUpgradeCheckout: async (req, res) => {
    try {
      const userId = req.token._id;
      const { identifier } = req.body;

      if (!identifier) {
        return res.status(400).json({ success: false, msg: "Missing plan identifier" });
      }

      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      const currentSub = await UserSubscription.findOne({ userId, isActive: true });
      if (!currentSub || !currentSub.stripeSubscriptionId) {
        return res.status(404).json({ success: false, msg: "Active subscription not found" });
      }

      const newPlan = await SubscriptionPlan.findOne({ identifier });
      if (!newPlan || !newPlan.priceId) {
        return res.status(404).json({ success: false, msg: "Plan not found or priceId missing" });
      }

      const currentSubscription = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
      
      // Check if user is in trial period
      const isInTrial = currentSubscription.status === 'trialing' || currentSub.isTrialPeriod;
      
      // Check if user is already on this plan (but allow trial-to-paid conversion)
      if (currentSub.planSnapshot?.identifier === identifier && !isInTrial) {
        return res.status(400).json({
          success: false,
          msg: "You are already subscribed to this plan.",
        });
      }

      // Determine if this is an upgrade, downgrade, or trial-to-paid conversion
      const isUpgrade = newPlan.price > currentSub.planSnapshot.price;
      const isDowngrade = newPlan.price < currentSub.planSnapshot.price;
      const isTrialToPaid = currentSub.planSnapshot?.identifier === identifier && isInTrial;
      
      console.log(`Plan change: Current: $${currentSub.planSnapshot.price}, New: $${newPlan.price}, Type: ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : isTrialToPaid ? 'Trial-to-Paid' : 'Same Price'}`);

      if (isTrialToPaid) {
        // TRIAL TO PAID CONVERSION: Cancel trial and charge immediately
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          customer: user.stripeCustomerId,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${newPlan.name} Plan Activation`,
                  description: `Convert from trial to paid ${newPlan.name} plan - Trial will be cancelled`,
                },
                unit_amount: Math.round(newPlan.price * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            currentPlanIdentifier: currentSub.planSnapshot.identifier,
            stripeSubscriptionId: currentSub.stripeSubscriptionId,
            action: 'trial_to_paid',
            isTrialToPaid: 'true',
          },
        });

        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          type: "trial_to_paid",
          message: "Redirect to Stripe to complete your trial-to-paid conversion",
        });
      } else if (isUpgrade) {
        if (isInTrial) {
          // TRIAL UPGRADE: Create checkout session for immediate payment
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer: user.stripeCustomerId,
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `${newPlan.name} Plan Upgrade`,
                    description: `Upgrade from ${currentSub.planSnapshot.name} to ${newPlan.name} - Trial will be cancelled`,
                  },
                  unit_amount: Math.round(newPlan.price * 100), // Convert to cents
                },
                quantity: 1,
              },
            ],
            success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              currentPlanIdentifier: currentSub.planSnapshot.identifier,
              stripeSubscriptionId: currentSub.stripeSubscriptionId,
              action: 'trial_upgrade',
              isTrialUpgrade: 'true',
            },
          });

          return res.status(200).json({
            success: true,
            checkoutUrl: session.url,
            type: "trial_upgrade",
            message: "Redirect to Stripe to complete your trial upgrade payment",
          });
        } else {
          // REGULAR UPGRADE: Create checkout session for proration payment
          // First, calculate the proration amount
          const updatedSub = await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
            items: [
              {
                id: currentSubscription.items.data[0].id,
                price: newPlan.priceId,
              },
            ],
            proration_behavior: "create_prorations",
          });

          // Get the latest invoice to see the proration amount
          const latestInvoice = await stripe.invoices.retrieve(updatedSub.latest_invoice);
          const prorationAmount = latestInvoice.total;

          // Revert the subscription change since we'll handle it in checkout
          await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
            items: [
              {
                id: currentSubscription.items.data[0].id,
                price: currentSub.planSnapshot.priceId,
              },
            ],
            proration_behavior: "none",
          });

          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer: user.stripeCustomerId,
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `${newPlan.name} Plan Upgrade`,
                    description: `Upgrade from ${currentSub.planSnapshot.name} to ${newPlan.name} - Prorated charge`,
                  },
                  unit_amount: prorationAmount,
                },
                quantity: 1,
              },
            ],
            success_url: `${process.env.ROOT_URL}/plan-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.ROOT_URL}/plan-purchase-failure`,
            metadata: {
              userId: user._id.toString(),
              planIdentifier: newPlan.identifier,
              currentPlanIdentifier: currentSub.planSnapshot.identifier,
              stripeSubscriptionId: currentSub.stripeSubscriptionId,
              action: 'regular_upgrade',
              prorationAmount: prorationAmount.toString(),
            },
          });

          return res.status(200).json({
            success: true,
            checkoutUrl: session.url,
            type: "regular_upgrade",
            message: "Redirect to Stripe to complete your plan upgrade payment",
          });
        }
      } else if (isDowngrade) {
        // DOWNGRADE: No payment needed, process immediately
        await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: newPlan.priceId,
            },
          ],
          proration_behavior: "none",
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            fromUpgradeFlow: true,
            isDowngrade: true,
          },
        });

        return res.status(200).json({
          success: true,
          msg: "Plan downgraded successfully. Changes will take effect at your next billing cycle.",
          nextBillingDate: new Date(currentSubscription.current_period_end * 1000),
          type: "downgrade",
        });
      } else {
        // Same price - just update the plan
        await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: newPlan.priceId,
            },
          ],
          proration_behavior: "none",
          metadata: {
            userId: user._id.toString(),
            planIdentifier: newPlan.identifier,
            fromUpgradeFlow: true,
          },
        });

        return res.status(200).json({
          success: true,
          msg: "Plan changed successfully.",
          nextBillingDate: new Date(currentSubscription.current_period_end * 1000),
          type: "change",
        });
      }
    } catch (error) {
      console.error("Error creating upgrade checkout:", error.message);
      return res.status(500).json({
        success: false,
        msg: "Failed to create upgrade checkout.",
        error: error.message,
      });
    }
  },

  previewUpgrade: async (req, res) => {
    try {
      const userId = req.token._id;
      const { identifier } = req.query;

      if (!identifier) {
        return res.status(400).json({ success: false, msg: "Missing plan identifier" });
      }

      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ success: false, msg: "User not found or Stripe customer not available" });
      }

      const currentSub = await UserSubscription.findOne({ userId, isActive: true });
      if (!currentSub || !currentSub.stripeSubscriptionId) {
        return res.status(404).json({ success: false, msg: "Active subscription not found" });
      }

      const newPlan = await SubscriptionPlan.findOne({ identifier });
      if (!newPlan || !newPlan.priceId) {
        return res.status(404).json({ success: false, msg: "Plan not found or priceId missing" });
      }

      // Fetch current subscription
      const currentSubscription = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
      
      // Check if user is in trial period
      const isInTrial = currentSubscription.status === 'trialing' || currentSub.isTrialPeriod;
      
      // Check if user is already on this plan (but allow trial-to-paid conversion)
      if (currentSub.planSnapshot?.identifier === identifier && !isInTrial) {
        // CASE: Same Plan Regular Subscription - Cancel current and create new subscription via checkout
        const currentPeriodEnd = new Date(currentSubscription.current_period_end * 1000);
        
        return res.status(200).json({
          success: true,
          type: "same_plan_renewal",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your current subscription will be cancelled, and you'll be charged immediately for your new plan. Your remainig credits will not be affected.",
            currentPlanCancelledAtPeriodEnd: true,
            currentPlanEndDate: currentPeriodEnd,
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      }

      // Determine if this is an upgrade, downgrade, or trial-to-paid conversion
      const isUpgrade = newPlan.price > currentSub.planSnapshot.price;
      const isDowngrade = newPlan.price < currentSub.planSnapshot.price;
      const isTrialToPaid = currentSub.planSnapshot?.identifier === identifier && isInTrial;
      
      console.log(`Preview plan change: Current: $${currentSub.planSnapshot.price}, New: $${newPlan.price}, Type: ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : isTrialToPaid ? 'Trial-to-Paid' : 'Same Price'}`);

      if (isTrialToPaid) {
        // CASE 1: Same Plan During Trial Period - End trial and charge immediately
        return res.status(200).json({
          success: true,
          type: "trial_to_paid",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your trial will be cancelled and you'll be redirected to Stripe to complete payment for your plan.",
            trialCancelled: true,
            trialEndDate: new Date(currentSubscription.trial_end * 1000),
            originalTrialEndDate: new Date(currentSubscription.trial_end * 1000),
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      } else if (isUpgrade && isInTrial) {
        // CASE 2: Upgrade to Bigger Plan During Trial - Cancel trial and create new subscription
        return res.status(200).json({
          success: true,
          type: "trial_upgrade",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your trial will be cancelled and you'll be redirected to Stripe to complete payment for your new plan.",
            trialCancelled: true,
            trialEndDate: new Date(currentSubscription.trial_end * 1000),
            originalTrialEndDate: new Date(currentSubscription.trial_end * 1000),
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      } else if (isDowngrade && isInTrial) {
        // CASE 3: Downgrade to Smaller Plan During Trial - Cancel trial and create new subscription
        return res.status(200).json({
          success: true,
          type: "trial_downgrade",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your trial will be cancelled and you'll be redirected to Stripe to complete payment for your new plan.",
            trialCancelled: true,
            trialEndDate: new Date(currentSubscription.trial_end * 1000),
            originalTrialEndDate: new Date(currentSubscription.trial_end * 1000),
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      } else if (isUpgrade && !isInTrial) {
        // CASE 4: Regular Subscription Upgrade - Schedule old subscription for cancellation at end of billing cycle and create new subscription
        const currentPeriodEnd = new Date(currentSubscription.current_period_end * 1000);
        
        return res.status(200).json({
          success: true,
          type: "regular_upgrade",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your current subscription will be cancelled, and you'll be charged immediately for your new plan. You'll see remaining credits from both plans in your account.",
            currentPlanCancelledAtPeriodEnd: true,
            currentPlanEndDate: currentPeriodEnd,
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      } else if (isDowngrade && !isInTrial) {
        // CASE 5: Regular Subscription Downgrade - Schedule old subscription for cancellation at end of billing cycle and create new subscription
        const currentPeriodEnd = new Date(currentSubscription.current_period_end * 1000);
        
        return res.status(200).json({
          success: true,
          type: "regular_downgrade",
          invoice: {
            immediateChargeUSD: `$${newPlan.price.toFixed(2)}`,
            nextCycleChargeUSD: `$${newPlan.price.toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            message: "Your current subscription will be cancelled, and you'll be charged immediately for your new plan. You'll see remaining credits from both plans in your account.",
            currentPlanCancelledAtPeriodEnd: true,
            currentPlanEndDate: currentPeriodEnd,
            paymentRequired: true,
            checkoutRequired: true, // Redirect to Stripe checkout
          },
        });
      } else {
        // Same price - just show the plan change
        return res.status(200).json({
          success: true,
          type: "change",
          invoice: {
            immediateChargeUSD: "$0.00",
            nextCycleChargeUSD: `$${(newPlan.price).toFixed(2)}`,
            currency: "usd",
            nextPaymentDate: new Date(currentSubscription.current_period_end * 1000),
            message: "Plan features will change immediately. No price change.",
            checkoutRequired: false, // No checkout needed
          },
        });
      }
    } catch (error) {
      console.error("Error in previewUpgrade:", error.message);
      return res.status(500).json({
        success: false,
        msg: "Failed to preview plan change.",
        error: error.message,
      });
    }
  },

  // Test function to manually trigger trial emails
  testTrialEmail: async (req, res) => {
    try {
      const userId = req.token._id;
      const { emailType } = req.body; // 'day1', 'day2', 'day3Morning', 'day3Evening'

      if (!emailType) {
        return res.status(400).json({ success: false, msg: "Email type is required" });
      }

      const validTypes = ['day1', 'day2', 'day3Morning', 'day3Evening'];
      if (!validTypes.includes(emailType)) {
        return res.status(400).json({ 
          success: false, 
          msg: "Invalid email type. Use: day1, day2, day3Morning, day3Evening" 
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      // Send the test email
      await services.sendTrialActivationEmail(userId, emailType);

      return res.status(200).json({
        success: true,
        msg: `Test ${emailType} email sent successfully to ${user.email}`
      });

    } catch (error) {
      console.error("Test trial email error:", error);
      return res.status(500).json({
        success: false,
        msg: "Failed to send test email",
        error: error.message
      });
    }
  },

  // Test function to run trial email cron logic manually
  testTrialEmailCron: async (req, res) => {
    try {
      const userId = req.token._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      const trialSub = await UserSubscription.findOne({
        userId: user._id,
        isActive: true,
        isTrialPeriod: true
      });

      if (!trialSub) {
        return res.status(404).json({ 
          success: false, 
          msg: "No active trial subscription found" 
        });
      }

      const now = new Date();
      const trialStart = trialSub.startDate;
      const hoursPassed = Math.floor((now - trialStart) / (1000 * 60 * 60));
      const { activationEmails } = user.trialEmailCampaign;

      let emailSent = false;
      let emailType = null;

      // Simulate the cron logic
      if (!trialSub.isCancelled) {
        if (!activationEmails.day1Sent && hoursPassed >= 0) {
          await services.sendTrialActivationEmail(user._id, 'day1');
          emailSent = true;
          emailType = 'day1';
        }
        else if (!activationEmails.day2Sent && hoursPassed >= 24) {
          await services.sendTrialActivationEmail(user._id, 'day2');
          emailSent = true;
          emailType = 'day2';
        }
        else if (!activationEmails.day3MorningSent && hoursPassed >= 48) {
          await services.sendTrialActivationEmail(user._id, 'day3Morning');
          emailSent = true;
          emailType = 'day3Morning';
        }
        else if (!activationEmails.day3EveningSent && hoursPassed >= 60) {
          await services.sendTrialActivationEmail(user._id, 'day3Evening');
          emailSent = true;
          emailType = 'day3Evening';
        }
      }

      return res.status(200).json({
        success: true,
        hoursPassed,
        trialStart,
        activationEmails,
        emailSent,
        emailType: emailSent ? emailType : 'No email due',
        msg: emailSent ? `${emailType} email sent based on trial timing` : 'No email was due to be sent'
      });

    } catch (error) {
      console.error("Test trial email cron error:", error);
      return res.status(500).json({
        success: false,
        msg: "Failed to run test cron",
        error: error.message
      });
    }
  },

};

module.exports = methods;
