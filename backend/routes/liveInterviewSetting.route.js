const express = require("express");
const router = express.Router();
const aiInterviewCopilotController = require("../controllers/aiInterviewCopilot.controller");

// Add a new context
router.post('/additional-context/add', aiInterviewCopilotController.addCopilotContext);

// Get contexts for a user
router.post('/additional-context/get', aiInterviewCopilotController.getCopilotContexts);


module.exports = router;