const mongoose = require("mongoose")
const JobsActivity = require("../models/jobsActivity.model")

const methods = {
  // Add job activity
  addJobActivity: async (req, res) => {
    try {
      const data = req.body
      data.userId = req.token._id

      if (
        !data.jobTitle ||
        !data.companyName ||
        !data.platform ||
        !data.resumeId ||
        !data.jobUrl
      ) {
        return res.status(400).json({
          msg: "Please provide all required fields (jobTitle, companyName, platform, resumeId, jobUrl)",
          success: false
        })
      }

      const newJobActivity = new JobsActivity(data)
      const addedJobActivity = await newJobActivity.save()

      return res.status(200).json({
        jobActivity: addedJobActivity,
        msg: "Job activity added successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add job activity",
        error: error.message,
        success: false
      })
    }
  },

  // View job activities by userId
  jobActivityCount: async (req, res) => {
    try {
      const { date, platform } = req.query
      const userId = req.token._id

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false
        })
      }

      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        deleted: false
      }

      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        matchQuery.createdAt = { $gte: start, $lt: end }
      }

      const jobActivities = await JobsActivity.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              platformName: "$platform",
              userId: "$userId"
            },
            resumeId: { $first: "$resumeId" },
            platformName: { $first: "$platform" },
            totalNoOfAppliedJobs: { $sum: 1 }
          }
        }
      ])

      return res.status(200).json({
        jobActivities: jobActivities,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view job activities",
        error: error.message,
        success: false
      })
    }
  },

  // View job activities by userId
  viewJobActivities: async (req, res) => {
    try {
      const { resumeId, platformName, date } = req.query
      const userId = req.token._id
      const { page = 1, limit = 20 } = req.query

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false
        })
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 } // Sort by createdAt in descending order
      }

      const filters = { userId: userId, deleted: false }

      if (platformName) {
        filters.platform = platformName
      }
      if (resumeId) {
        filters.resumeId = resumeId
      }
      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        filters.createdAt = { $gte: start, $lt: end }
      }

      const jobActivities = await JobsActivity.paginate(filters, options)

      return res.status(200).json({
        jobActivities: jobActivities,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view job activities",
        error: error.message,
        success: false
      })
    }
  },

  // Update job activity
  updateJobActivity: async (req, res) => {
    try {
      const { _id, ...data } = req.body

      if (!_id) {
        return res.status(400).json({
          msg: "Job activity ID is required",
          success: false
        })
      }

      const existingJobActivity = await JobsActivity.findById(_id)

      if (!existingJobActivity) {
        return res.status(404).json({
          msg: "Job activity not found",
          success: false
        })
      }

      const updatedJobActivity = await JobsActivity.findByIdAndUpdate(
        _id,
        data,
        {
          new: true
        }
      )

      return res.status(200).json({
        jobActivity: updatedJobActivity,
        msg: "Job activity updated successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update job activity",
        error: error.message,
        success: false
      })
    }
  },

  // Delete job activity (soft delete)
  deleteJobActivity: async (req, res) => {
    try {
      const { _id } = req.body

      if (!_id) {
        return res.status(400).json({
          msg: "Job activity ID is required",
          success: false
        })
      }

      const existingJobActivity = await JobsActivity.findByIdAndUpdate(_id, {
        deleted: true
      })

      if (!existingJobActivity) {
        return res.status(404).json({
          msg: "Job activity not found",
          success: false
        })
      }

      return res.status(200).json({
        msg: "Job activity deleted successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete job activity",
        error: error.message,
        success: false
      })
    }
  }
}

module.exports = methods
