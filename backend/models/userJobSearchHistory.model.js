const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userJobSearchHistorySchema = new mongoose.Schema(
  
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    searchHistoryKeyword: {
      type: String,
      required: true,
    },
    keywordsIncludeInJobs: {
      type: String,
      default: "",
    },
    jobLocation: {
      type: String,
      default: "",
    },
    numberOfJobs: {
      type: Number,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userJobSearchHistorySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("userJobSearchHistory", userJobSearchHistorySchema);
