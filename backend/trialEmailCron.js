const cron = require('node-cron');
const User = require('./models/user.model');
const UserSubscription = require('./models/userSubscriptionModel');
const services = require('./helpers/services');

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    // Get all users with active trial subscriptions
    const activeTrialUsers = await User.find({
      'trialEmailCampaign.campaignStatus': 'active'
    });

    for (const user of activeTrialUsers) {
      const trialSub = await UserSubscription.findOne({
        userId: user._id,
        isActive: true,
        isTrialPeriod: true
      });

      if (!trialSub) {
        // No active trial subscription found, mark campaign as completed
        console.log(`🔄 No active trial subscription found for user ${user.email} - marking campaign as completed`);
        await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { 'trialEmailCampaign.campaignStatus': 'completed' } },
          { new: true }
        );
        continue;
      }

      // If trial subscription is no longer in trial period, mark campaign as completed
      if (!trialSub.isTrialPeriod) {
        console.log(`🔄 Trial period ended for user ${user.email} - marking campaign as completed`);
        await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { 'trialEmailCampaign.campaignStatus': 'completed' } },
          { new: true }
        );
        continue;
      }

      const now = new Date();
      const trialStart = trialSub.startDate;
      const hoursPassed = Math.floor((now - trialStart) / (1000 * 60 * 60));
      const { activationEmails, cancellationEmails } = user.trialEmailCampaign;

      // Handle trial activation emails
      if (!trialSub.isCancelled) {
        if (!activationEmails.day1Sent && hoursPassed >= 0) {
          await services.sendTrialActivationEmail(user._id, 'day1');
        }
        else if (!activationEmails.day2Sent && hoursPassed >= 24) {
          await services.sendTrialActivationEmail(user._id, 'day2');
        }
        else if (!activationEmails.day3MorningSent && hoursPassed >= 48) {
          await services.sendTrialActivationEmail(user._id, 'day3Morning');
        }
        else if (!activationEmails.day3EveningSent && hoursPassed >= 60) {
          await services.sendTrialActivationEmail(user._id, 'day3Evening');
        }
      }
      // Handle trial cancellation emails
      else {
        const cancelTime = trialSub.cancelAt || now;
        const hoursSinceCancellation = Math.floor((now - cancelTime) / (1000 * 60 * 60));

        if (!cancellationEmails.immediate) {
          await services.sendTrialCancellationEmail(user._id, 'immediate');
        }
        else if (!cancellationEmails.after24h && hoursSinceCancellation >= 24) {
          await services.sendTrialCancellationEmail(user._id, 'after24h');
        }
        else if (!cancellationEmails.finalDay && hoursSinceCancellation >= 48) {
          await services.sendTrialCancellationEmail(user._id, 'finalDay');
        }
      }
    }
  } catch (error) {
    console.error('Error in trial email cron job:', error);
  }
});
