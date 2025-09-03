const express = require("express");
const router = express.Router();
const jobPrepController = require("../controllers/jobPrep.controller");
const authPolicy = require("../utils/auth.policy");

// Create a new Job Prep entry
router.post(`/create-job-prep`, authPolicy, jobPrepController.addJobPrep);

// View all Job Prep entries (paginated)
router.get(`/view-job-preps`, authPolicy, jobPrepController.viewJobPreps);

// View a single Job Prep entry by ID
router.get(`/view-job-prep/:id`, authPolicy, jobPrepController.viewSingleJobPrep);

// Delete a Job Prep entry (soft delete)
router.delete(`/delete-job-prep/:id`, authPolicy, jobPrepController.deleteJobPrep);

module.exports = router;
