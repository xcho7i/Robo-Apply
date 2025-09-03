const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const authPolicy = require("../utils/auth.policy");



router.post("/create-subscription",authPolicy, subscriptionController.createSubscription);
router.get("/subscription-success", subscriptionController.subscriptionSuccess);




router.post("/reason", authPolicy,subscriptionController.saveCancelReason);
router.post("/discount", authPolicy,subscriptionController.applyDiscountAndKeepSubscription);
router.post("/cancel", authPolicy,subscriptionController.cancelSubscription);
router.post("/revertUnsub", authPolicy,subscriptionController.revertSubscriptionCancel);
router.get('/billing-info', authPolicy, subscriptionController.getBillingInfo);
// Handles both plan upgrades and downgrades
router.post('/upgrade', authPolicy, subscriptionController.upgradePlan);
// Creates Stripe checkout for plan upgrades (new approach)
router.post('/create-upgrade-checkout', authPolicy, subscriptionController.createUpgradeCheckout);
// Previews both plan upgrades and downgrades
router.get('/preview-upgrade', authPolicy, subscriptionController.previewUpgrade);





// Testing routes for card decline simulation
router.get('/payment-methods', authPolicy, subscriptionController.getUserPaymentMethods);
router.post('/update-payment-method-test', authPolicy, subscriptionController.updatePaymentMethodForTesting);

// Testing routes for trial emails
router.post('/test-trial-email', authPolicy, subscriptionController.testTrialEmail);
router.post('/test-trial-email-cron', authPolicy, subscriptionController.testTrialEmailCron);

module.exports = router;
