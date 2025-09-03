const express = require("express");
const router = express.Router();
const resumeBuilderController = require("../controllers/resumeBuilder.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/create-resume`, authPolicy, resumeBuilderController.addResume);
router.get(`/view-built-resume`, authPolicy, resumeBuilderController.viewResumes);
router.put(`/update-built-resume`, authPolicy, resumeBuilderController.updateResume);
router.delete(`/delete-built-resume`, authPolicy, resumeBuilderController.deleteResume);

module.exports = router;
