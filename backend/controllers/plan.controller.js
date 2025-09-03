const Plan = require("../models/plans.model");

let methods = {
// Add a new plan
addPlan: async (req, res) => {
  try {
    const { name, price, vat_percentage, duration_in_months, description } =
      req.body;
      
    // Create a new plan
    const newPlan = new Plan({
      name,
      price,
      vat_percentage,
      duration_in_months,
      description,
    });

    await newPlan.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Plan added successfully",
        data: newPlan,
      });
  } catch (err) {
    console.error("Error adding plan:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},
// View all plans
viewPlans: async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    console.error("Error fetching plans:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},
// Update a plan
updatePlan: async (req, res) => {
  try {
    const plan_id = req.query.plan_id; // Plan ID from the URL
    const updates = req.body; // Fields to update

    // Find the plan by plan_id and update
    const updatedPlan = await Plan.findOneAndUpdate({ _id:plan_id }, updates, {
      new: true,
    });
    if (!updatedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Plan updated successfully",
        data: updatedPlan,
      });
  } catch (err) {
    console.error("Error updating plan:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},
// Delete a plan
deletePlan:async (req, res) => {
  try {
    const { plan_id } = req.params; // Plan ID from the URL

    // Find the plan by plan_id and delete
    const deletedPlan = await Plan.deleteOne({ _id:plan_id });
    if (!deletedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Plan deleted successfully",
      });
  } catch (err) {
    console.error("Error deleting plan:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
};
module.exports = methods;