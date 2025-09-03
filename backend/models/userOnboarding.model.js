const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userOnboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    activeCard: {
      type: Number,
      default: 0,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    jobSearchStatus: {
      type: String,
      // enum: ["Active Job Seeker", "Passive Job Seeker", "Not Looking", ""],
      // default: "",
    },
    challenges: [{
      type: String,
      default: [],
    }],
    hearAboutUs: {
      type: String,
      default: "",
    },
    employmentStatus: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    salary: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    resumeName: {
      type: String,
      default: "",
    },
    resumeData: {
      type: String,
      default: "",
    },
    resumeType: {
      type: String,
      default: "",
    },
    selectedOption: {
      type: String,
      default: "",
    },
    selectedExperienceLevels: [{
      type: String,
      default: [],
    }],
    educationLevel: {
      type: String,
      // enum: ["High School", "Associate's degree", "Bachelor's degree", "Master's degree", "Doctorate", "Other"],
      // default: "",
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    jobSearchGoal: {
      type: String,
      default: "",
    },
    selectedBlockers: [{
      type: String,
      default: [],
    }],
    selectedGoal: {
      type: String,
      default: "",
    },
    jobsPerWeek: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      default: "",
    },
    selectedPlan: {
      type: String,
      default: "",
    },
    currency: {
      name: {
        type: String,
        default: "",
      },
      symbol: {
        type: String,
        default: "",
      },
      code: {
        type: String,
        default: "",
      },
    },
    jobSearchGoalLabel: {
      type: String,
      default: "",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userOnboardingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("userOnboarding", userOnboardingSchema); 