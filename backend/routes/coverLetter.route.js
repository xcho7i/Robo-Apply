const express = require("express");
const router = express.Router();
const coverLetterController = require("../controllers/coverLetter.controller");
const authPolicy = require("../utils/auth.policy");

router.post("/", authPolicy, coverLetterController.addCoverLetter);
router.get("/", authPolicy, coverLetterController.viewCoverLetters);
router.get("/:id", authPolicy, coverLetterController.viewSingleCoverLetter);
router.patch("/:id", authPolicy, coverLetterController.updateCoverLetter);
router.delete("/:id", authPolicy, coverLetterController.deleteCoverLetter);

module.exports = router;