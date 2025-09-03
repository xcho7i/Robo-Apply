const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { v4: uuidv4 } = require("uuid");

const aiCopilotInterviewSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, default: uuidv4 }, // generate UUID automatically
    userId: { type: String, required: true },
    resume_name: { type: String, default: "" },
    resume_textcontent: { type: String, default: "" },
    role: { type: String, default: "" },
    specialization: { type: String, default: "General" },
    context: { type: String, default: "" },
    interview_expected_time: { type: Date }, // not required, can be null
    conversation_history: { type: Array, default: [] },
    status: {
      type: String,
      enum: ["upcoming", "completed", "active"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

aiCopilotInterviewSessionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model(
  "aiCopilotInterviewSession",
  aiCopilotInterviewSessionSchema
);
