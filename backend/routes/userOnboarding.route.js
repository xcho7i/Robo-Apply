const express = require("express");
const router = express.Router();
const userOnboardingController = require("../controllers/userOnboarding.controller");
const authPolicy = require("../utils/auth.policy");

// Apply authentication middleware to all routes
router.use(authPolicy);

// Submit onboarding data (POST)
router.post("/submit", userOnboardingController.submitOnboarding);

// Get user's onboarding data (GET)
router.get("/data", userOnboardingController.getOnboardingData);

// Get onboarding data by user ID (GET) - for admin or specific user lookup
router.get("/data/:userId", userOnboardingController.getOnboardingData);

// Update specific onboarding field (PATCH)
router.patch("/update-field", userOnboardingController.updateOnboardingField);

// Update specific onboarding field by user ID (PATCH)
router.patch("/update-field/:userId", userOnboardingController.updateOnboardingField);

// Get onboarding completion status (GET)
router.get("/status", userOnboardingController.getOnboardingStatus);

// Get onboarding status by user ID (GET)
router.get("/status/:userId", userOnboardingController.getOnboardingStatus);

// Delete onboarding data (DELETE) - soft delete
router.delete("/delete", userOnboardingController.deleteOnboardingData);

// Delete onboarding data by user ID (DELETE)
router.delete("/delete/:userId", userOnboardingController.deleteOnboardingData);

// Get all onboarding data (admin function) (GET)
router.get("/all", userOnboardingController.getAllOnboardingData);

module.exports = router; 