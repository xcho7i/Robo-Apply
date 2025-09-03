const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const liveInterviewSettingCopilotSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        copilotVerbosity: {
            type: String,
            enum: ["Consise", "Default", "Length"],
            default: "Consise",
            required: true,
        },
        copilotLanguage: {
            type: String,
            enum: ["en"],
            default: "en",
            required: true,
        },
        copilotTransactionDelay: {
            type: String,
            enum: ["Low", "Default", "High"],
            default: "High",
            required
        },
        copilotTemperature: {
            type: String,
            enum: ["Low", "Default", "High"],
            default: "Default",
            required      
        },
        performancePreference: {
            type: String,
            enum: ["Speed", "Quality"],
            default: "Quality",
            required      
        }, 
    }
)

liveInterviewSettingCopilotSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("liveInterviewSettingCopilot", liveInterviewSettingCopilotSchema);