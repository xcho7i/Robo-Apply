const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    resumeTitle: { type: String },
    name: { type: String },
    jobTitle: { type: String }, //gyugu
    email: { type: String },
    phone: { type: String },
    linkedin: { type: String },
    website: [{ type: String }],
    summary: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },

    experiences: [
      {
        companyName: { type: String },
        jobTitle: { type: String },
        location: { type: String },
        experienceType: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
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
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false }, 
      },
    ],

    skills: [
      {
        skill: { type: String },
        yearsOfExperience: { type: String },
      },
    ],

    achievements: [
      {
        awardTitle: { type: String },
        issuer: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false }, 
        description: { type: String },
      },
    ],

    languages: [
      {
        language: { type: String },
        proficiency: { type: String },
      },
    ],

    certifications: [
      {
        certificationTitle: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false }, 
      },
    ],

    selectedTemplate: { type: String },
    isComplete: { type: Boolean, default: false },
    deleted: { type: String, default: false },
    isResumeBuilder: { type: Boolean, default: false },
  },
  { timestamps: true } //need updatedAt
);

resumeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Resume", resumeSchema);
