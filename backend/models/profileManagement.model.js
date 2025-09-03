const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const profileManagementSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resume",
      required: true,
    },
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
      countryCode: {
        type: String,
        default: "",
      },
      gender: {
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
    miscellanious: {
      totalExperience: {
        type: String,
        default: "",
      },
      veteranStatus: {
        type: String,
        default: "",
      },
      disability: {
        type: String,
        default: "",
      },
      willingToRelocate: {
        type: Boolean,
        default: true,
      },
      ethnicity: {
        type: String,
        default: "",
      },
      noticePeriod: {
        type: String,
        default: "",
      },
      expectatedSalary: {
        type: String,
        default: "",
      },
      expectedSalaryCurrency: {
        type: String,
        default: "",
      },
      currentSalary: {
        type: String,
        default: "",
      },
      currentSalaryCurrency: {
        type: String,
        default: "",
      },
      drivingLicense: {
        type: Boolean,
        default: true,
      },
      highestEducationLevel: {
        type: String,
        default: "",
      },
      expectedDateOfJoining: {
        type: Date,
      },
      coverLetter: {
        type: String,
        default: "",
      },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

profileManagementSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("profile", profileManagementSchema);
