// const mongoose = require("mongoose");

// const subscriptionCancellationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "UserSubscription", required: true },
//   cancelReason: [{ type: String }],
//   cancelReasonText: { type: String },
//   respondedAt: { type: Date, default: Date.now },
//   type: { type: String, enum: ["send_to_team", "cancel"], default: "send_to_team" }, // 🟣 or 🔘
//   appliedDiscount: { type: Boolean, default: false },
// });
// module.exports = mongoose.model("SubscriptionCancellation", subscriptionCancellationSchema);


const mongoose = require("mongoose");

const subscriptionCancellationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSubscription",
    required: true
  },
  cancelReason: [{ type: String }],
  cancelReasonText: { type: String },
  respondedAt: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["send_to_team", "cancel", "upgrade"], // 🟢 Added "upgrade"
    default: "send_to_team"
  },
  appliedDiscount: { type: Boolean, default: false },
});

module.exports = mongoose.model("SubscriptionCancellation", subscriptionCancellationSchema);
