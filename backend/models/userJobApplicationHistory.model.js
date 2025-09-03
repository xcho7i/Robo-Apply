// 

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userJobApplicationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", 
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
  platformName: {
  type: String,
  required: true,
  enum: ['LinkedIn', 'Indeed', 'Dice']
},
    processingLink: {
      type: String,
      required: true,
    },
    selectedProfile: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "resume", 
      required: true,
    },
    jobDate: {
      type: Date,
      required: true,
    },
    appliedAt: { 
      type: Date, 
      default: Date.now 
    },

    skillSearchKeyword:{
      type: String,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userJobApplicationHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("userJobApplicationHistory", userJobApplicationHistorySchema);
