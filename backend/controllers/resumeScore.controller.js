const ResumeScore = require("../models/resumeScore.model");

let methods = {
  addResumeScore: async (req, res) => {
    try {
      const userId = req.token._id; // ✅ get from token
      const data = req.body;

      if (!data) {
        return res.status(400).json({
          msg: "Please provide resume score data.",
          success: false
        });
      }

      data.userId = userId; // ✅ attach userId from token

      const resumeScore = new ResumeScore(data);
      const savedScore = await resumeScore.save();

      return res.status(200).json({
        msg: "Resume score added successfully",
        data: savedScore,
        success: true
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add resume score",
        error: error.message,
        success: false
      });
    }
  },

  getResumeScores: async (req, res) => {
    try {
      const userId = req.token._id; // ✅ only fetch logged-in user's scores

      const paginateOptions =
        req.query.page && req.query.limit
          ? { page: parseInt(req.query.page), limit: parseInt(req.query.limit) }
          : { page: 1, limit: 50 };

      const scores = await ResumeScore.paginate(
        { userId },
        { ...paginateOptions }
      );

      return res.status(200).json({
        data: scores,
        success: true
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to fetch resume scores",
        error: error.message,
        success: false
      });
    }
  },

  getResumeScoreById: async (req, res) => {
    try {
      const userId = req.token._id;
      const { id } = req.params;

      const score = await ResumeScore.findOne({ _id: id, userId });

      if (!score) {
        return res.status(404).json({
          msg: "Resume score not found",
          success: false
        });
      }

      return res.status(200).json({
        data: score,
        success: true
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to fetch resume score",
        error: error.message,
        success: false
      });
    }
  },

  deleteResumeScore: async (req, res) => {
    try {
      const userId = req.token._id;
      const { id } = req.params;

      const deletedScore = await ResumeScore.findOneAndDelete({
        _id: id,
        userId
      });

      if (!deletedScore) {
        return res.status(404).json({
          msg: "Resume score not found",
          success: false
        });
      }

      return res.status(200).json({
        msg: "Resume score deleted successfully",
        success: true
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete resume score",
        error: error.message,
        success: false
      });
    }
  },
updateResumeScore: async (req, res) => {
  try {
    const userId = req.token._id; // ✅ from token
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        msg: "Please provide resume score data to update.",
        success: false
      });
    }

    // Find the existing record for this user and update it
    const updatedScore = await ResumeScore.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true } // return updated document
    );

    if (!updatedScore) {
      return res.status(404).json({
        msg: "Resume score not found for this user.",
        success: false
      });
    }

    return res.status(200).json({
      msg: "Resume score updated successfully",
      data: updatedScore,
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to update resume score",
      error: error.message,
      success: false
    });
  }
}

};

module.exports = methods;
