const express = require("express")
const router = express.Router()
const aiResumeController = require("../controllers/aiResumeTailor.controller")
const authPolicy = require("../utils/auth.policy")

router.post(
  "/get-tailored-data-for-resume",
  authPolicy,
  aiResumeController.generateTailoredResume
)
router.post(
  "/generate-job-description",
  authPolicy,
  aiResumeController.generateJobDescription
)
router.post(
  "/generate-job-skills",
  authPolicy,
  aiResumeController.generateJobSkills
)
router.post(
  "/generate-job-title",
  authPolicy,
  aiResumeController.generateJobTitle
)

router.get(
  "/credit-status",
  authPolicy,
  aiResumeController.getUserCreditStatus
)

// Resume upload endpoint for session tracking
router.post(
  "/upload-base-resume",
  authPolicy,
  aiResumeController.uploadBaseResume
)

// Generate pre-signed URL for resume access
router.post(
  "/generate-resume-access-url",
  authPolicy,
  aiResumeController.generateResumeAccessUrl
)

// Get complete session data and previous sessions
router.post(
  "/get-session-data",
  authPolicy,
  aiResumeController.getSessionData
)

// Get generation history for a specific generation
router.get(
  "/generation-history/:SESSION_ID/:generation_id",
  authPolicy,
  aiResumeController.getGenerationHistory
)

// Delete generation from session
router.post(
  "/delete-generation",
  authPolicy,
  aiResumeController.deleteGenerationFromSession
)

// Store multiple job details without generating resumes
router.post(
  "/store-job-details",
  authPolicy,
  aiResumeController.storeJobDetails
)

// Analyze resume-job match score
router.post(
  "/analyze-resume-job-match",
  authPolicy,
  aiResumeController.analyzeResumeJobMatch
)

// Stream S3 file - Public endpoint for CORS bypass
router.get(
  "/stream-s3-file",
  aiResumeController.streamS3File
)

// Handle HEAD requests for the public endpoint
router.head(
  "/stream-s3-file",
  aiResumeController.streamS3File
)

// Handle preflight requests for the public endpoint
router.options(
  "/stream-s3-file",
  aiResumeController.streamS3File
)

module.exports = router
