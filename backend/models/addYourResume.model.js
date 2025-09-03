const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const resumeSchema = new mongoose.Schema({
  name: String,
  date: { type: Date, default: Date.now },
  fileUrl: String,
  textContent: { type: String, default: "" } // extracted pdf text
})

const addYourResumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    resumes: [resumeSchema]
  },
  { timestamps: true }
)

addYourResumeSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("addYourResume", addYourResumeSchema)
