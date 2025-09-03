const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const positionSchema = new mongoose.Schema({
  position: { type: String, default: "" },
  company: { type: String, default: "" },
  companyDetails: { type: String, default: "" },
  jobDescription: { type: String, default: "" }
})

const addYourPositionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    positions: [positionSchema]
  },
  { timestamps: true }
)

addYourPositionSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("addYourPosition", addYourPositionSchema)
    