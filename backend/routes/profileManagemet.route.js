const express = require("express");
const router = express.Router();
const profileManagementController = require("../controllers/profileManagement.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/add-profile`, authPolicy, profileManagementController.addProfile);
router.get(
  `/view-profiles`,
  authPolicy,
  profileManagementController.viewProfiles
);
router.put(
  `/update-profile`,
  authPolicy,
  profileManagementController.updateProfile
);
router.delete(
  `/delete-profile`,
  authPolicy,
  profileManagementController.deleteProfile
);

module.exports = router;
