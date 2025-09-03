const cron = require("node-cron");
const User = require("./models/user.model");
const UserSubscription = require("./models/userSubscriptionModel");

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔄 Running free plan expiry check...");

    const freeSubs = await UserSubscription.find({
      isActive: true,
      "planSnapshot.identifier": "free_plan"
    });

    const now = new Date();

    for (const sub of freeSubs) {
      const daysPassed = (now - new Date(sub.startDate)) / (1000 * 60 * 60 * 24);

      if (daysPassed >= 3) {
        await User.findByIdAndUpdate(sub.userId, { isFreePlanExpired: true });
        console.log(`⚠️ User ${sub.userId} free plan expired due to 3-day limit.`);
      }
    }

    console.log("✅ Free plan expiry check complete.");
  } catch (err) {
    console.error("❌ Error in free plan expiry cron:", err);
  }
});
