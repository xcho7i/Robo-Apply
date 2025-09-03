const express = require("express");
const router = express.Router();
const searchHistoryController = require("../controllers/userJobSearchHistory.controller");
const authPolicy = require("../utils/auth.policy");

// Job Search History APIs

router.post(
  "/add-search-history",
  authPolicy,
  searchHistoryController.addSearchHistory
);

router.get(
  "/view-search-history",
  authPolicy,
  searchHistoryController.viewSearchHistory
);

router.get(
  "/view-search-history/:id",
  authPolicy,
  searchHistoryController.viewSingleSearchHistory
);

router.delete(
  "/delete-search-history/:id",
  authPolicy,
  searchHistoryController.deleteSearchHistory
);

module.exports = router;
