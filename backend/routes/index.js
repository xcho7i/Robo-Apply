const express = require("express");
const router = express.Router();

// const router = require("express").Router();
const userRoutes = require("./user.route");
const resumeManagementRoutes = require("./resumeManagement.route");
const resuneRoutes = require("./resume.route");

const profileManagementRoutes = require("./profileManagemet.route");
const feedbackRoutes = require("./feedback.route");
const searchHistoryRoutes = require("./searchHistory.route");
const jobsActivityRoutes = require("./jobsActivity.route");
const resumeBuilderRoutes = require("./resumeBuilder.route");
const planRoutes = require("./plan.route");
const subscriptionRoutes = require("./subscription.route");
const userJobSearchHistoryRoutes = require("./userJobSearchHistory.route");
const stripeRoutes = require("./stripe.route");
const coverLetterRoutes = require("./coverLetter.route");
const tailoredResumeRoutes = require("./tailoredResume.route");
const subscriptionController = require("../controllers/subscription.controller")
const jobPrepRoutes = require("./jobPrep.route");

const aiResumeTailorRoutes = require("./aiResumeTailor.route");
const userOnboardingRoutes = require("./userOnboarding.route");
const resumeScoreRoutes = require("./resumeScore.route");

const liveInterviewSettingRoutes = require("./liveInterviewSetting.route");
const addYourResumeRoutes = require("./addYourResume.route");
const aiCopilotInterviewSessionRoutes = require("./aiCopilotInterviewSession.route");
const aiInterviewCopilotRoutes = require("./aiInterviewCopilot.route");
const addYourPositionRoutes = require("./addYourPosition.route");

const stripeSimRoutes = require('./stripeSim.route');



// Stripe webhook must use raw body parser
// router.post(
//   "/handleWebhook",
//   express.raw({ type: "application/json" }),
//   subscriptionController.handleWebhook
// );
router.use("/stripeSim", stripeSimRoutes);

router.use("/user", userRoutes);
router.use("/onboarding", userOnboardingRoutes);
router.use("/resume", resumeManagementRoutes);
router.use("/resumeBuilder", resuneRoutes);

router.use("/profile", profileManagementRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/search", searchHistoryRoutes);
router.use("/jobs-activity", jobsActivityRoutes);
router.use("/resume-builder", resumeBuilderRoutes);
router.use("/plan", planRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/searchHistory", userJobSearchHistoryRoutes);
router.use("/stripe", stripeRoutes);
router.use("/coverLetter", coverLetterRoutes);
router.use("/tailoredResume", tailoredResumeRoutes);
router.use("/jobPrep", jobPrepRoutes);
router.use("/ai-resume-tailor", aiResumeTailorRoutes);
router.use("/resScore", resumeScoreRoutes);

router.use("/ai-interview-copilot", aiInterviewCopilotRoutes);

router.use("/aiInterviewCopilot/live-interview/setting", liveInterviewSettingRoutes)
router.use("/aiInterviewCopilot/add-your-resume", addYourResumeRoutes)
router.use("/aiInterviewCopilot/interview-session", aiCopilotInterviewSessionRoutes)
router.use("/aiInterviewCopilot/add-your-position", addYourPositionRoutes)


module.exports = router;
