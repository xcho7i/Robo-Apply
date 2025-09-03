const Feedback = require("../models/feedback.model")
const User = require("../models/user.model")

const methods = {
  addFeedback: async (req, res) => {
    try {
      const data = req.body
      const userId = req.token._id

      if (!data.feedbackDescription || !data.feedbackRating) {
        return res.status(400).json({
          msg: "Please provide feedback description and rating",
          success: false
        })
      }

      const newFeedback = new Feedback({ ...data, userId })
      const addedFeedback = await newFeedback.save()

      return res.status(201).json({
        feedback: addedFeedback,
        msg: "Feedback added successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add feedback",
        error: error.message,
        success: false
      })
    }
  },

  viewFeedbacks: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Sort by createdAt in descending order for latest on top
        populate: {
          path: "userId",
          select: "firstName lastName imageUrl",
          model: User
        }
      }

      const feedbacks = await Feedback.paginate({ deleted: false }, options)

      return res.status(200).json({
        feedbacks: feedbacks,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view feedbacks",
        error: error.message,
        success: false
      })
    }
  },

  updateFeedback: async (req, res) => {
    try {
      const { _id, ...data } = req.body

      if (!_id) {
        return res.status(400).json({
          msg: "Feedback ID is required",
          success: false
        })
      }

      const existingFeedback = await Feedback.findById(_id)

      if (!existingFeedback) {
        return res.status(404).json({
          msg: "Feedback not found",
          success: false
        })
      }

      const updatedFeedback = await Feedback.findByIdAndUpdate(_id, data, {
        new: true
      })

      return res.status(200).json({
        feedback: updatedFeedback,
        msg: "Feedback updated successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update feedback",
        error: error.message,
        success: false
      })
    }
  },

  deleteFeedback: async (req, res) => {
    try {
      const { _id } = req.body

      if (!_id) {
        return res.status(400).json({
          msg: "Feedback ID is required",
          success: false
        })
      }

      const existingFeedback = await Feedback.findById(_id)

      if (!existingFeedback) {
        return res.status(404).json({
          msg: "No Feedback with this ID found",
          success: false
        })
      }

      existingFeedback.deleted = true // Mark as deleted instead of actually deleting
      await existingFeedback.save()

      return res.status(200).json({
        msg: "Feedback deleted successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete feedback",
        error: error.message,
        success: false
      })
    }
  }
}

module.exports = methods
