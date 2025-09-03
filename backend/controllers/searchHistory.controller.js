const Search = require("../models/searchHistory.model");

const methods = {
  // Add search history
  addSearch: async (req, res) => {
    try {
      const data = req.body;

      if (!data.jobTitle || !data.location || !data.resumeId) {
        return res.status(400).json({
          msg: "Please provide job title, location, and resume ID",
          success: false,
        });
      }

      const newSearch = new Search(data);
      const addedSearch = await newSearch.save();

      return res.status(201).json({
        search: addedSearch,
        msg: "Search history added successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add search history",
        error: error.message,
        success: false,
      });
    }
  },

  // View search history based on resumeId
  viewSearches: async (req, res) => {
    try {
      const { resumeId } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!resumeId) {
        return res.status(400).json({
          msg: "Resume ID is required",
          success: false,
        });
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Sort by createdAt in descending order
      };

      const searches = await Search.paginate(
        { resumeId, deleted: false },
        options
      );

      return res.status(200).json({
        searches: searches,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view search history",
        error: error.message,
        success: false,
      });
    }
  },

  // Update search history
  updateSearch: async (req, res) => {
    try {
      const { _id, ...data } = req.body;

      if (!_id) {
        return res.status(400).json({
          msg: "Search ID is required",
          success: false,
        });
      }

      const existingSearch = await Search.findById(_id);

      if (!existingSearch) {
        return res.status(404).json({
          msg: "Search history not found",
          success: false,
        });
      }

      const updatedSearch = await Search.findByIdAndUpdate(_id, data, {
        new: true,
      });

      return res.status(200).json({
        search: updatedSearch,
        msg: "Search history updated successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update search history",
        error: error.message,
        success: false,
      });
    }
  },

  // Delete search history (soft delete)
  deleteSearch: async (req, res) => {
    try {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({
          msg: "Search ID is required",
          success: false,
        });
      }

      const existingSearch = await Search.findOneAndDelete({ _id: _id });

      return res.status(200).json({
        msg: "Search history deleted successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete search history",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods;
