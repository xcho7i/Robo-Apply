// const mongoose = require("mongoose");
// const mongoosePaginate = require("mongoose-paginate-v2");

// const resumeManagementSchema = new mongoose.Schema(
//   {
//     resumeName: {
//       type: String,
//       required: true,
//     },
//     resumeUrl: {
//       type: String,
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user",
//       required: true,
//     },
//     deleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// resumeManagementSchema.plugin(mongoosePaginate);
// module.exports = mongoose.model("resume", resumeManagementSchema);


const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    jobTitle:{type: String},
    resumeName: { type: String },
    resumeFileName: { type: String },
    resumeUrl: { type: String },
    status: { type: String, enum: ["draft", "in_progress", "completed"] },
    uploaded: { type: String },

    socialMediaLinks: {
      github: { type: String },
      linkedin: { type: String },
      dribble: { type: String },
      portfolio: { type: String },
      otherLink: { type: String },
    },

    personalInformation: {
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phoneNo: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      countryCode: { type: String },
      gender: { type: String },
      zipCode: { type: String },
      timeZone: { type: String },
      mailingAddress: { type: String },
    },

    experiences: [
      {
        jobTitle: { type: String },
        companyName: { type: String },
        location: { type: String },
        experienceType: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
      },
    ],

    qualifications: [
      {
        institutionName: { type: String },
        institutionType: { type: String },
        institutionCity: { type: String },
        institutionState: { type: String },
        major: { type: String },
        degreeType: { type: String },
        gpa: { type: String },
        startDate: { type: String },
        endDate: { type: String },
      },
    ],

    skills: [
      {
        skill: { type: String },
        yearsOfExperience: { type: String },
      },
    ],

    projects: [
      {
        projectTitle: { type: String },
        role: { type: String },
        technologies: { type: [String] },
        description: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        isOngoing: { type: String },
      },
    ],

    languagesList: [
      {
        language: { type: String },
        proficiency: { type: String },
      },
    ],

    achievements: [
      {
        awardTitle: { type: String },
        issuer: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
      },
    ],

    certifications: [
      {
        certificationTitle: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        certificationUrl: { type: String },
      },
    ],

    formData: {
      experience: { type: String },
      veteranStatus: { type: String },
      disability: { type: String },
      willingToRelocate: { type: String },
      raceEthnicity: { type: String },
      noticePeriod: { type: String },
      expectedSalary: { type: String },
      expectedSalaryCurrency: { type: String },
      currentSalary: { type: String },
      currentSalaryCurrency: { type: String },
      drivingLicense: { type: String },
      highestEducation: { type: String },
      expectedJoiningDate: { type: String },
      companiesExclude: { type: String },
      visaSponsorshipStatus: { type: String },
      securityClearanceStatus: { type: String },
      countriesAuthorizedToWork: { type: String },
      hybridSetting: { type: String },
      remoteSetting: { type: String },
      siteSetting: { type: String },
      canStartImmediately: { type: String },
      currentlyEmployed: { type: String },
    },

    coverLetter: { type: String },
    deleted: { type: String ,default:false },
    isComplete: { type: Boolean, default: false },
        isResumeBuilder: { type: Boolean, default: false },


  },
  { timestamps: true }
);


resumeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("resume", resumeSchema);



