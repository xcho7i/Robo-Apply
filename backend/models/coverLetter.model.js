const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    
    userData: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      cityStateZip: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      date: { type: String, default: "" },
    },

    companyData: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      cityStateZip: { type: String, default: "" },
    },

    letterBody: {
      type: String,
      // required: true,
    },

    jobTitle:{
      type:String,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

coverLetterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("coverLetter", coverLetterSchema);
