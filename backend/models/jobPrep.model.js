const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const interviewGuideSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Answer: { type: String, required: true },
});

const conversationHistorySchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Answer: { type: String, required: true },
  type: { type: String, enum: ["conversation", "note"], default: "conversation" },
});

const jobPrepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    resumeUsed: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    initialInterviewGuide: [interviewGuideSchema],

    conversationHistory: [conversationHistorySchema],

    totalQuestions: {
      type: Number,
      required: true,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

jobPrepSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("jobPrep", jobPrepSchema);
