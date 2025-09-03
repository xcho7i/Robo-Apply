const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/add-feedback`, authPolicy, feedbackController.addFeedback);
router.get(`/view-feedbacks`, feedbackController.viewFeedbacks);
router.put(`/update-feedback`, authPolicy, feedbackController.updateFeedback);
router.delete(
  `/delete-feedback`,
  authPolicy,
  feedbackController.deleteFeedback
);

module.exports = router;
