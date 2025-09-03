const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const jobsActivitySchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resume",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

jobsActivitySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("jobsActivity", jobsActivitySchema);
