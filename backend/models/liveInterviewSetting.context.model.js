const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const liveInterviewSettingContextSchema = new mongoose.Schema(
    {
        userId: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            // ref: "user",
            required: true,
        },
        contexts: {
            type: [String],
        }       
    }
)

liveInterviewSettingContextSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("liveInterviewSettingContext", liveInterviewSettingContextSchema);