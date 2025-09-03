const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const feedbackSchema = new mongoose.Schema(
  {
    feedbackDescription: {
      type: String,
      required: true,
    },

    feedbackRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true }
);

feedbackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("feedback", feedbackSchema);
