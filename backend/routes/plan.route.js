const express = require('express');
const planController = require('../controllers/plan.controller');
const router = express.Router();

// Add a new plan
router.post('/add', planController.addPlan);

// View all plans
router.get('/view', planController.viewPlans);

// Update a plan
router.put('/update', planController.updatePlan);

// Delete a plan
router.delete('/delete/:plan_id', planController.deletePlan);

module.exports = router;
