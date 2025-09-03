const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscription",
      required: false, // optional in case you only have stripeSubscriptionId
    },

    stripeSubscriptionId: {
      type: String,
      required: false, // Optional for credit purchases
    },

    invoiceId: {
      type: String,
      required: false, // Optional for credit purchases
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "usd",
    },

    paidAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "failed", "pending"],
      default: "paid",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    paymentMethod: {
      type: String,
      default: null, // e.g. 'card'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
