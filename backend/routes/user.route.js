const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const subscriptionController = require("../controllers/subscription.controller");

const authPolicy = require("../utils/auth.policy");
const utils = require("../utils/index");

router.get(`/seedPlans`,userController.seedAllSubscriptionPlans); 


router.post(`/user-signup`, userController.addUser);
router.get(`/view-user`, authPolicy, userController.viewUser);
router.patch(`/update-user`, authPolicy, userController.updateUser);
router.delete(`/delete-user`, authPolicy, userController.deleteUser);
router.post(`/enable-user`, authPolicy, userController.enableUser);
router.post(`/login`, userController.loginUser);
router.post(`/verify-user`, userController.verifyOtp);
router.post("/google-callback", userController.googleCallBackHandler);
router.post(`/forgot-password`, userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetPasswordOtp);
router.post(`/reset-password`, userController.resetPassword);
router.post(`/change-password`, authPolicy, userController.changePassword);
router.get(`/get-user`, userController.getUser);
router.post(`/upload-file`, userController.fileUploadS3);
router.get(`/download-file`, userController.downloadFileFromS3); 

router.post(`/saveJob`, authPolicy, userController.saveJob); 
router.get(`/getSavedJobs`, authPolicy,userController.getJobApplications); 
router.get(`/getSavedJobsByDate`, authPolicy,userController.getUserJobApplicationsByDate); 
router.get(`/getSavedJobsByFilters`, authPolicy,userController.getUserJobApplicationsByFilters); 
router.get(`/savedJobsByPlatform`, authPolicy,userController.getUserJobApplicationsByPlatform); 


router.get(`/subscription`, authPolicy,userController.getUserSubscriptionUsage);
router.get(`/accountBilling`, authPolicy,userController.userAccountBilling); 

router.patch(`/updateUserCredits`, authPolicy,userController.deductUserCredits); 

// User onboarding routes
router.post(`/onboarding`, authPolicy, userController.submitUserOnboarding);

router.post(`/buyCredits`, authPolicy,subscriptionController.createCreditCheckout); 

router.post(`/setPassword`, authPolicy,userController.setNewPassword); 










// outer.get(`/job-applications/by-date`, authPolicy, userController.getUserJobApplicationsByDate);
// router.get(`/job-applications/filters`, authPolicy, userController.getUserJobApplicationsByFilters);
// router.get(`/job-applications/by-platform`, authPolicy, userController.getUserJobApplicationsByPlatform);






module.exports = router;
