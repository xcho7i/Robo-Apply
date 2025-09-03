const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const resumeScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    scoreData: [
      {
        title: { type: String, default: "" },
        progress: { type: Number, default: 0 }
      }
    ],
    hardSkills: [
      {
        id: Number,
        name: { type: String, default: "" },
        value: { type: String, default: "" }
      }
    ],
    softSkills: [
      {
        id: Number,
        name: { type: String, default: "" },
        value: { type: String, default: "" }
      }
    ],
    searchability: {
      summary: { type: String, default: "" }
    },
    recruiterTips: {
      summary: { type: String, default: "" }
    },
    formatting: {
      summary: { type: String, default: "" }
    },
    parsedData: {
      name: { type: String, default: "" },
      title: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      website: { type: String, default: "" },
      summary: { type: String, default: "" },
      skills: [[String]],
      experience: [
        {
          title: { type: String, default: "" },
          duration: { type: String, default: "" },
          responsibilities: [String]
        }
      ],
      education: [
        {
          degree: { type: String, default: "" },
          duration: { type: String, default: "" },
          institution: { type: String, default: "" },
          details: { type: String, default: "" }
        }
      ],
      additional: {
        languages: { type: String, default: "" },
        certifications: { type: String, default: "" },
        awards: { type: String, default: "" }
      }
    },
    jobDescription: { type: String, default: "" } // ✅ New field added
  },
  { timestamps: true }
);

resumeScoreSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ResumeScore", resumeScoreSchema);
