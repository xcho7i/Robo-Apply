const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const searchSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    noOfJobsApplied: {
      type: Number,
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
    fields: {
      type: Map,
      of: String,
      default: {},
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

searchSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("search", searchSchema);
