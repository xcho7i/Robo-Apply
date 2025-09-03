const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g., "Basic Plan"
    },
    identifier: {
      type: String,
      required: true, // e.g., basic_monthly_individual
      unique: true,
    },
    planType: {
      type: String,
      enum: ["individual", "enterprise"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isMostPopular: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: "", // e.g., "Limited Time !!!", "Most Popular !!!"
    },
    savingsText: {
      type: String,
      default: "", // e.g., "Save $120 with yearly"
    },
    jobLimits: {
      dailyLimit: {
        type: Number,
        required: true, // e.g., 20, 100, 500
      },
    },
    monthlyCredits: {
      type: Number,
      required: true, // e.g., 4000, 30000, 100000
    },
    includesAutoApply: {
      type: Boolean,
      default: true,
    },
    includesResumeBuilder: {
      type: Boolean,
      default: true,
    },
    includesResumeScore: {
      type: Boolean,
      default: true,
    },
    includesAICoverLetters: {
      type: Boolean,
      default: true,
    },
    resumeProfiles: {
      type: Number,
      required: true, // e.g., 1, 5, 10
    },
    includesInterviewBuddy: {
      type: Boolean,
      default: true,
    },
    includesTailoredResumes: {
      type: Boolean,
      default: true,
    },
    freeTailoredResumes: {
      type: Number,
      default: 3,
    },
    freeAutoApplies: {
      type: Number,
      default: 3,
    },
    descriptionNote: {
      type: String,
      default: "", // e.g., "Ideal for active job seekers with tailored needs."
    },
    deleted: {
      type: Boolean,
      default: false,
    },
     productId: {
      type: String,
      // required: true,
    },
      priceId: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

subscriptionPlanSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("subscriptionPlan", subscriptionPlanSchema);




// const mongoose = require("mongoose");
// const mongoosePaginate = require("mongoose-paginate-v2");

// const subscriptionPlanSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     identifier: {
//       type: String, // e.g., basic_monthly_individual, large_yearly_enterprise
//       required: true,
//       unique: true,
//     },
//     planType: {
//       type: String,
//       enum: ["individual", "enterprise"],
//       required: true,
//     },
//     billingCycle: {
//       type: String,
//       enum: ["monthly", "yearly"],
//       default: "monthly",
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     isMostPopular: {
//       type: Boolean,
//       default: false,
//     },
//     tag: {
//       type: String,
//       default: "", // e.g., "20% Save", "Unlimited Students"
//     },
//     studentLimit: {
//       type: String,
//       default: "", // e.g., "Up to 250 Students", "Unlimited Students"
//     },
//     jobLimits: {
//       dailyLimit: {
//         type: mongoose.Schema.Types.Mixed, // number or "unlimited"
//         default: 0,
//       },
//     },
//     features: {
//       linkedinAutomation: Boolean,
//       indeedAutomation: Boolean,
//       monsterAutomation: Boolean,
//       zipRecruiterAutomation: Boolean,
//       diceAutomation: Boolean,
//       simplyHiredAutomation: Boolean,

//       resumeBuilder: {
//         type: String,
//         enum: ["none", "basic", "advanced"],
//         default: "none",
//       },
//       resumeScoring: Number, // max CVs allowed
//       coverLetterGenerator: {
//         type: String,
//         enum: ["none", "basic", "personalized"],
//         default: "none",
//       },
//       analytics: {
//         type: String,
//         enum: ["none", "basic", "advanced"],
//         default: "none",
//       },
//       cvImprovementTips: Boolean,
//       interviewPreparation: {
//         type: String,
//         enum: ["none", "basic", "advanced"],
//         default: "none",
//       },
//       customerSupport: {
//         type: String,
//         enum: ["none", "standard", "priority"],
//         default: "none",
//       },
//       accessToJobMatching: Boolean,
//       multipleUserAccess: Boolean,
//       allBasicFeatures: Boolean,
//       unlimitedCoverLetterGeneration: Boolean,
//       jobApplicationAutomation: Boolean,
//       atsOptimization: Boolean,
//       noRestrictions: Boolean,
//     },
//     restrictions: {
//       type: [String],
//       default: [],
//     },
//     deleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// subscriptionPlanSchema.plugin(mongoosePaginate);
// module.exports = mongoose.model("subscriptionPlan", subscriptionPlanSchema);