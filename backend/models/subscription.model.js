const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who subscribed
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true }, // The plan ID
    stripeSubscriptionId: { type: String, required: true }, // Stripe subscription ID
    status: { type: String, enum: ["active", "canceled", "past_due"], default: "active" }, // Subscription status
    startDate: { type: Date, required: true }, // When subscription starts
    endDate: { type: Date, required: true }, // When it expires
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
