const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Plan name (e.g., Basic, Pro, Premium)
    price: { type: Number, required: true }, // Subscription price
    vat_percentage: { type: Number, default: 10 }, // Optional VAT percentage (default: 10%)
    duration_in_months: { type: Number, required: true }, // Subscription duration (e.g., 1, 6, 12 months)
    description: { type: String }, // Plan description
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Plan", PlanSchema);
