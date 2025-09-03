const express = require("express");
const router = express.Router();
const aiInterviewCopilotController = require("../controllers/aiInterviewCopilot.controller");

router.post('/add', aiInterviewCopilotController.addYourResume);

// Get contexts for a user
router.post('/get', aiInterviewCopilotController.getYourResume);

// Remove a resume
router.post('/remove', aiInterviewCopilotController.removeYourResume);




module.exports = router;