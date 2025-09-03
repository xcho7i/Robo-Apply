const express = require("express");
const router = express.Router();
const searchHistoryController = require("../controllers/searchHistory.controller");
const authPolicy = require("../utils/auth.policy");

router.post(`/add-search`, authPolicy, searchHistoryController.addSearch);
router.get(`/view-searches`, authPolicy, searchHistoryController.viewSearches);
router.put(`/update-search`, authPolicy, searchHistoryController.updateSearch);
router.delete(`/delete-search`, authPolicy, searchHistoryController.deleteSearch);

module.exports = router;
