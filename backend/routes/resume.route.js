const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");

const authPolicy = require("../utils/auth.policy");

//Resume Management APIS

router.post(`/add-resume`, authPolicy, resumeController.addResume);
router.get(`/view-resumes`, authPolicy, resumeController.viewResumes);
router.get("/view-resume/:id", resumeController.viewSingleResume);

router.patch("/update-resume/:id", authPolicy, resumeController.updateResume);

router.delete(
  '/delete-resume/:id',
  authPolicy,
  resumeController.deleteResume
);

module.exports = router;
