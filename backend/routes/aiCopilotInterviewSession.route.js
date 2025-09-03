const express = require("express");
const router = express.Router();
const aiInterviewCopilotController = require("../controllers/aiInterviewCopilot.controller");

// Add a new interview session
router.post("/addSession", aiInterviewCopilotController.addInterviewSession);

// Delete an interview session
router.post("/deleteSession", aiInterviewCopilotController.deleteInterviewSession);

// Get a interview session for a user
router.get("/getSessions/:sessionId", aiInterviewCopilotController.getInterviewSession);

// Get all interview sessions for a user
router.post("/getAllSessions", aiInterviewCopilotController.getAllInterviewSessions);

// Update interview session status for a user
router.post("/updateSession", aiInterviewCopilotController.updateInterviewSessionStatus);

module.exports = router;
