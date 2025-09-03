const express = require("express");
const router = express.Router();
const resumeManagementController = require("../controllers/resumeManagement.controller");
// const resumeController = require("../controllers/resume.controller");

const authPolicy = require("../utils/auth.policy");

//Resume Management APIS

router.post(`/add-resume`, authPolicy, resumeManagementController.addResume);
router.get(`/view-resumes`, authPolicy, resumeManagementController.viewResumes);
router.get("/view-resume/:id", resumeManagementController.viewSingleResume);

router.patch("/update-resume/:id", authPolicy, resumeManagementController.updateResume);

router.delete(
  '/delete-resume/:id',
  authPolicy,
  resumeManagementController.deleteResume
);

module.exports = router;
