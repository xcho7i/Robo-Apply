const express = require("express");
const router = express.Router();
const resumeScoreController = require("../controllers/resumeScore.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/add-resume-score`, authPolicy, resumeScoreController.addResumeScore);
router.get(`/get-resume-scores`, authPolicy, resumeScoreController.getResumeScores);
router.get(`/get-resume-score/:id`, authPolicy, resumeScoreController.getResumeScoreById);
router.delete(`/delete-resume-score/:id`, authPolicy, resumeScoreController.deleteResumeScore);
router.patch(`/update-resume-score/:id`, authPolicy, resumeScoreController.updateResumeScore);


module.exports = router;
