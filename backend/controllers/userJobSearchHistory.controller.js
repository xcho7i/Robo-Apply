const SearchHistory = require("../models/userJobSearchHistory.model");
const User = require("../models/user.model");

const methods = {
  // Add a new job search history record
  addSearchHistory: async (req, res) => {
    try {
      const userId = req.token._id;
      const data = req.body;

      if (!data.searchHistoryKeyword) {
        return res.status(400).json({
          msg: "Search keyword is required",
          success: false,
        });
      }

      const searchEntry = new SearchHistory({
        userId,
        searchHistoryKeyword: data.searchHistoryKeyword,
        keywordsIncludeInJobs: data.keywordsIncludeInJobs || "",
        jobLocation: data.jobLocation || "",
        numberOfJobs: parseInt(data.numberOfJobs, 10) || 0,
      });

      const savedEntry = await searchEntry.save();

      return res.status(201).json({
        history: savedEntry,
        msg: "Search history saved successfully",
        success: true,
      });
    } catch (error) {
      console.error("Add Search History Error:", error);
      return res.status(500).json({
        msg: "Failed to save search history",
        error: error.message,
        success: false,
      });
    }
  },

  // View paginated search history for the logged-in user
  viewSearchHistory: async (req, res) => {
    try {
      const userId = req.token._id;
      const { page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };

      const history = await SearchHistory.paginate(
        { userId, deleted: false },
        options
      );

      return res.status(200).json({
        history,
        success: true,
      });
    } catch (error) {
      console.error("View Search History Error:", error);
      return res.status(500).json({
        msg: "Failed to retrieve search history",
        error: error.message,
        success: false,
      });
    }
  },

  // View a single search history record by ID
  viewSingleSearchHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.token._id;

      const entry = await SearchHistory.findOne({
        _id: id,
        userId,
        deleted: false,
      });

      if (!entry) {
        return res.status(404).json({
          msg: "Search history record not found",
          success: false,
        });
      }

      return res.status(200).json({
        history: entry,
        success: true,
      });
    } catch (error) {
      console.error("View Single Search History Error:", error);
      return res.status(500).json({
        msg: "Failed to fetch search history record",
        error: error.message,
        success: false,
      });
    }
  },

  // Soft delete a search history record
  deleteSearchHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.token._id;

      const record = await SearchHistory.findOne({
        _id: id,
        userId,
        deleted: false,
      });

      if (!record) {
        return res.status(404).json({
          msg: "Search history record not found",
          success: false,
        });
      }

      record.deleted = true;
      await record.save();

      return res.status(200).json({
        msg: "Search history deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Delete Search History Error:", error);
      return res.status(500).json({
        msg: "Failed to delete search history",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods;
