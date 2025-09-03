const router = require("express").Router();
const tailoredResumeController = require("../controllers/tailoredResume.controller");

// Create a tailored resume
router.post("/", tailoredResumeController.createTailoredResume);

// Get all tailored resumes
router.get("/", tailoredResumeController.getTailoredResumes);

// Get tailored resume by ID
router.get("/:id", tailoredResumeController.getTailoredResumeById);

// Update tailored resume
router.put("/:id", tailoredResumeController.updateTailoredResume);

// Delete tailored resume
router.delete("/:id", tailoredResumeController.deleteTailoredResume);

module.exports = router;
