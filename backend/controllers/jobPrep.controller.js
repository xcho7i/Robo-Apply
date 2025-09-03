const JobPrep = require("../models/jobPrep.model");

const methods = {
  // Create a new Job Prep entry
  addJobPrep: async (req, res) => {
    try {
      const userId = req.token._id;
      const {
        timestamp,
        resumeUsed,
        jobDescription,
        initialInterviewGuide,
        conversationHistory,
        totalQuestions,
      } = req.body;

      const newJobPrep = new JobPrep({
        userId,
        timestamp,
        resumeUsed,
        jobDescription,
        initialInterviewGuide,
        conversationHistory,
        totalQuestions,
      });

      const saved = await newJobPrep.save();

      return res.status(201).json({
        msg: "Job preparation data saved successfully",
        jobPrep: saved,
        success: true,
      });
    } catch (error) {
      console.error("Add JobPrep Error:", error);
      return res.status(500).json({
        msg: "Failed to save job preparation data",
        error: error.message,
        success: false,
      });
    }
  },

  // View all job prep entries (paginated)
  viewJobPreps: async (req, res) => {
    try {
      const userId = req.token._id;
      const { page = 1, limit = 20 } = req.query;

      const jobPreps = await JobPrep.paginate(
        { userId, deleted: false },
        {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: { createdAt: -1 },
        }
      );

      return res.status(200).json({
        jobPreps,
        success: true,
      });
    } catch (error) {
      console.error("View JobPreps Error:", error);
      return res.status(500).json({
        msg: "Failed to retrieve job preparation entries",
        error: error.message,
        success: false,
      });
    }
  },

  // View a single job prep entry
  viewSingleJobPrep: async (req, res) => {
    try {
      const jobPrepId = req.params.id;

      const jobPrep = await JobPrep.findOne({
        _id: jobPrepId,
        deleted: false,
      });

      if (!jobPrep) {
        return res.status(404).json({
          msg: "Job preparation entry not found",
          success: false,
        });
      }

      return res.status(200).json({
        jobPrep,
        success: true,
      });
    } catch (error) {
      console.error("View Single JobPrep Error:", error);
      return res.status(500).json({
        msg: "Failed to retrieve job preparation entry",
        error: error.message,
        success: false,
      });
    }
  },

  // Delete job prep entry (soft delete)
  deleteJobPrep: async (req, res) => {
    try {
      const jobPrepId = req.params.id;

      const jobPrep = await JobPrep.findById(jobPrepId);
      if (!jobPrep) {
        return res.status(404).json({
          msg: "No job preparation entry found with this ID",
          success: false,
        });
      }

      jobPrep.deleted = true;
      await jobPrep.save();

      return res.status(200).json({
        msg: "Job preparation entry deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Delete JobPrep Error:", error);
      return res.status(500).json({
        msg: "Failed to delete job preparation entry",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods;

