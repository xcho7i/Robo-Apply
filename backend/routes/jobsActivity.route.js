const express = require("express");
const router = express.Router();
const jobsActivityController = require("../controllers/jobsActivity.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/add-job-activity`, authPolicy, jobsActivityController.addJobActivity);
router.get(`/job-activity-count`, authPolicy, jobsActivityController.jobActivityCount);
router.get(`/view-job-activities`, authPolicy, jobsActivityController.viewJobActivities);
router.put(`/update-job-activity`, authPolicy, jobsActivityController.updateJobActivity);
router.delete(`/delete-job-activity`, authPolicy, jobsActivityController.deleteJobActivity);

module.exports = router;
