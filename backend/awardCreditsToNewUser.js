const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./models/user.model");
const UserSubscription = require("./models/userSubscriptionModel");

// Database connection
const connectDB = async () => {
  try {
    const mongoUrl = `${process.env.DB_URL}${process.env.DB_NAME}`;
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected successfully to: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Main function to award credits to new users
const awardCreditsToNewUsers = async () => {
  try {
    console.log("Starting credit award process for new users...");
    
    // First, check how many users already have extraCreditsAwarded: true
    const usersWithExtraCredits = await User.countDocuments({
      extraCreditsAwarded: true
    });
    
    console.log(`Users who already have extra credits awarded: ${usersWithExtraCredits}`);
    
    // Check if we've already awarded credits to 500+ users
    if (usersWithExtraCredits >= 500) {
      console.log(`❌ Credit award limit reached! Already awarded credits to ${usersWithExtraCredits} users. Maximum limit is 500. Exiting...`);
      return;
    }
    
    console.log(`✅ Credit award limit check passed. Can proceed with awarding credits.`);
    
    // Find all users who haven't received extra credits yet (regardless of signup date)
    const eligibleUsers = await User.find({
      extraCreditsAwarded: { $ne: true }
    });
    
    console.log(`Found ${eligibleUsers.length} eligible users for credit award`);
    
    if (eligibleUsers.length === 0) {
      console.log("No eligible users found. Exiting...");
      return;
    }
    
    // Check if awarding credits to all eligible users would exceed the 500 limit
    const totalAfterAward = usersWithExtraCredits + eligibleUsers.length;
    if (totalAfterAward > 500) {
      console.log(`⚠️  Warning: Awarding credits to all ${eligibleUsers.length} eligible users would exceed the 500 limit.`);
      console.log(`Current: ${usersWithExtraCredits}, After award: ${totalAfterAward}`);
      console.log(`Will only award credits to ${500 - usersWithExtraCredits} users to stay within limit.`);
      
      // Limit the eligible users to stay within the 500 limit
      const maxUsersToAward = 500 - usersWithExtraCredits;
      eligibleUsers.splice(maxUsersToAward);
      console.log(`Processing only ${eligibleUsers.length} users to stay within limit.`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each eligible user
    for (const user of eligibleUsers) {
      try {
        console.log(`Processing user: ${user.email} (ID: ${user._id})`);
        
        // Find the user's active subscription
        const userSubscription = await UserSubscription.findOne({
          userId: user._id,
          isActive: true
        });
        
        if (userSubscription) {
          // Add 2000 credits to the user's subscription plan snapshot
          const currentCredits = userSubscription.planSnapshot.monthlyCredits || 0;
          userSubscription.planSnapshot.monthlyCredits = currentCredits + 2000;
          
          // Save the updated subscription
          await userSubscription.save();
          
          console.log(`✓ Added 2000 credits to user ${user.email}. New total: ${userSubscription.planSnapshot.monthlyCredits}`);
          
          // Only mark the user as having received extra credits if they actually have a subscription
          user.extraCreditsAwarded = true;
          await user.save();
          
          console.log(`✓ Marked user ${user.email} as having received extra credits`);
        } else {
          console.log(`⚠ No active subscription found for user ${user.email} - skipping credit award and marking`);
        }
        successCount++;
        
      } catch (userError) {
        console.error(`✗ Error processing user ${user.email}:`, userError.message);
        errorCount++;
      }
    }
    
    console.log("\n=== CREDIT AWARD SUMMARY ===");
    console.log(`Users with extra credits before: ${usersWithExtraCredits}`);
    console.log(`Total eligible users found: ${eligibleUsers.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Users with extra credits after: ${usersWithExtraCredits + successCount}`);
    console.log(`Remaining slots until 500 limit: ${500 - (usersWithExtraCredits + successCount)}`);
    console.log("Credit award process completed!");
    
  } catch (error) {
    console.error("Error in awardCreditsToNewUsers:", error);
    throw error;
  }
};

// Function to run the script
const runScript = async () => {
  try {
    await connectDB();
    await awardCreditsToNewUsers();
  } catch (error) {
    console.error("Script execution failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the script if called directly
if (require.main === module) {
  runScript();
}

module.exports = { awardCreditsToNewUsers, connectDB };
