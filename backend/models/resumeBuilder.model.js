const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const resumeBuilderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "in_progress", "completed"],
      default: "draft",
    },
    resumeName: {
      type: String,
      default: "Untitled Resume",
    },
    isComplete: { type: Boolean, default: false },

    socialMediaLinks: {
      githubUrl: {
        type: String,
        default: "",
      },
      linkedInUrl: {
        type: String,
        default: "",
      },
      dribbleUrl: {
        type: String,
        default: "",
      },
      portfolioUrl: {
        type: String,
        default: "",
      },
      otherLinks: [
        {
          type: String,
          default: "",
        },
      ],
    },
    personalInformation: {
      firstName: {
        type: String,
        default: "",
      },
      lastName: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      phoneNo: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
    },
    workExperiences: [
      {
        jobTitle: {
          type: String,
          default: "",
        },
        companyName: {
          type: String,
          default: "",
        },
        location: {
          type: String,
          default: "",
        },
        experienceType: {
          type: String,
          default: "",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        currentlyWorkingHere: {
          type: Boolean,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    education: [
      {
        institutionName: {
          type: String,
          default: "",
        },
        institutionType: {
          type: String,
          default: "",
        },
        institutionCity: {
          type: String,
          default: "",
        },
        institutionState: {
          type: String,
          default: "",
        },
        major: {
          type: String,
          default: "",
        },
        degreeType: {
          type: String,
          default: "",
        },
        gpa: {
          type: String,
          default: "",
        },
        startDate: {
          type: String,
        },
        endDate: {
          type: String,
        },
      },
    ],
    skills: [
      {
        skillName: {
          type: String,
          default: "",
        },
        experienceYearsCount: {
          type: String,
          default: "",
        },
      },
    ],
    projects: [
      {
        projectTitle: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          default: "",
        },
        technologies: {
          type: [String],
          default: [],
        },
        description: {
          type: String,
          default: "",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        isOngoing: {
          type: Boolean,
          default: false,
        },
      },
    ],
    language: [
      {
        type: String,
        default: "",
      },
    ],
    achievements: [
      {
        awardTitle: {
          type: String,
          default: "",
        },
        issuer: {
          type: String,
          default: "",
        },
        issueDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    certifications: [
      {
        certificateTitle: {
          type: String,
          default: "",
        },
        issueDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        certificateUrl: {
          type: String,
          default: "",
        },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

resumeBuilderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("resumeBuilder", resumeBuilderSchema);
