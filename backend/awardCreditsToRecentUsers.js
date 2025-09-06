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

// Main function to award credits to eligible users
const awardCreditsToEligibleUsers = async () => {
  try {
    console.log("Starting credit award process for eligible users...");
    
    // Find all users
    const allUsers = await User.find({});
    
    console.log(`Found ${allUsers.length} total users in database`);
    
    if (allUsers.length === 0) {
      console.log("No users found. Exiting...");
      return;
    }
    
    let eligibleCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of allUsers) {
      try {
        console.log(`\nProcessing user: ${user.email} (ID: ${user._id})`);
        
        // Find the user's active subscription
        const userSubscription = await UserSubscription.findOne({
          userId: user._id,
          isActive: true
        });
        
        if (!userSubscription) {
          console.log(`⚠ No active subscription found for user ${user.email} - skipping`);
          skippedCount++;
          continue;
        }
        
        // Get current monthly credits
        const currentCredits = userSubscription.planSnapshot.monthlyCredits || 0;
        console.log(`Current monthly credits: ${currentCredits}`);
        
        // Check if monthlyCredits <= 60
        if (currentCredits > 60) {
          console.log(`⚠ User ${user.email} has ${currentCredits} credits (more than 60) - skipping`);
          skippedCount++;
          continue;
        }
        
        // User meets all criteria
        eligibleCount++;
        console.log(`✅ User ${user.email} meets all criteria - awarding credits`);
        
        // Add 2000 credits to the user's subscription plan snapshot
        const newCredits = currentCredits + 2000;
        userSubscription.planSnapshot.monthlyCredits = newCredits;
        
        // Save the updated subscription
        await userSubscription.save();
        
        console.log(`✓ Added 2000 credits to user ${user.email}. Credits: ${currentCredits} → ${newCredits}`);
        
        // Mark the user as having received extra credits
        user.extraCreditsAwarded = true;
        await user.save();
        
        console.log(`✓ Marked user ${user.email} as having received extra credits`);
        successCount++;
        
      } catch (userError) {
        console.error(`✗ Error processing user ${user.email}:`, userError.message);
        errorCount++;
      }
    }
    
    console.log("\n=== CREDIT AWARD SUMMARY ===");
    console.log(`Total users found: ${allUsers.length}`);
    console.log(`Users meeting all criteria: ${eligibleCount}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Skipped (no active subscription or >60 credits): ${skippedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log("Credit award process completed!");
    
  } catch (error) {
    console.error("Error in awardCreditsToEligibleUsers:", error);
    throw error;
  }
};

// Function to run the script
const runScript = async () => {
  try {
    await connectDB();
    await awardCreditsToEligibleUsers();
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

module.exports = { awardCreditsToEligibleUsers, connectDB };
