const express = require("express");
const router = express.Router();
const aiInterviewCopilotController = require("../controllers/aiInterviewCopilot.controller");

router.post('/add', aiInterviewCopilotController.addYourPosition);

// Get contexts for a user
router.post('/get', aiInterviewCopilotController.getYourPosition);

// Remove a resume
router.post('/remove', aiInterviewCopilotController.removeYourPosition);




module.exports = router;