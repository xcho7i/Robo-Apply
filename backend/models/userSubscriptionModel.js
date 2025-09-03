const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    subscriptionPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan"},

    planSnapshot: {
      name: String,
      identifier: String,
      billingCycle: String,
      price: Number,
      dailyLimit: Number,
      monthlyCredits: Number,
      resumeProfiles: Number,
      freeTailoredResumes: Number,
      freeAutoApplies: Number,
      includesAutoApply: Boolean,
      includesResumeBuilder: Boolean,
      includesResumeScore: Boolean,
      includesAICoverLetters: Boolean,
      includesInterviewBuddy: Boolean,
      includesTailoredResumes: Boolean,
      descriptionNote: String
    },

    // Tracks user's actual consumption (resets every month)
    usage: {
      jobApplicationsToday: { type: Number, default: 0 },
      monthlyCreditsUsed: { type: Number, default: 0 },
      resumeProfilesUsed: { type: Number, default: 0 },
      tailoredResumesUsed: { type: Number, default: 0 },
      autoAppliesUsed: { type: Number, default: 0 },
      // New fields for AI operation tracking
      jobDescriptionGenerations: { type: Number, default: 0 },
      jobSkillsGenerations: { type: Number, default: 0 },
      jobTitleGenerations: { type: Number, default: 0 },
      generationsWithoutTailoring: { type: Number, default: 0 }, // For abuse detection
    },

    // Batch session tracking for smart credit optimization
    batchSession: {
      batchId: { type: String, default: null }, // BATCH_ID for batch coordination
      sessionId: { type: String, default: null }, // SESSION_ID for session tracking (preserved)
      startTime: { type: Date, default: null },
      operations: [{
        operationType: String, // Operation type (JOB_DESCRIPTION_GENERATION, etc.)
        timestamp: Date,
        tokensUsed: Number,
        creditsDeducted: Number,
        operationCount: Number,
        operationId: String,
        result: mongoose.Schema.Types.Mixed
      }],
      totalCreditsDeducted: { type: Number, default: 0 },
      isActive: { type: Boolean, default: false }
    },

    // Stripe or billing metadata
    stripeCustomerId: String,
    stripeSubscriptionId: String,

    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    isCancelled: { type: Boolean, default: false },
    cancelAt: { type: Date, default: null },
    notice:{type: String, default:null},
    isTrialPeriod:{type: Boolean} 


  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);