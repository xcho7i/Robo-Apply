const Profile = require("../models/profileManagement.model");

const methods = {
  addProfile: async (req, res) => {
    try {
      const data = req.body;
      const resumeId = data.resumeId; // Assuming resumeId is provided in the request body

      if (!resumeId) {
        return res.status(400).json({
          msg: "Please provide a resume ID",
          success: false,
        });
      }

      const newProfile = new Profile(data);
      const addedProfile = await newProfile.save();

      return res.status(201).json({
        profile: addedProfile,
        msg: "Profile added successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add profile",
        error: error.message,
        success: false,
      });
    }
  },

  viewProfiles: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const profiles = await Profile.paginate({ deleted: false }, options);

      return res.status(200).json({
        profiles: profiles,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view profiles",
        error: error.message,
        success: false,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { _id, ...data } = req.body;

      if (!_id) {
        return res.status(400).json({
          msg: "Profile ID is required",
          success: false,
        });
      }

      const existingProfile = await Profile.findById(_id);

      if (!existingProfile) {
        return res.status(404).json({
          msg: "Profile not found",
          success: false,
        });
      }

      const updatedProfile = await Profile.findByIdAndUpdate(_id, data, {
        new: true,
      });

      return res.status(200).json({
        profile: updatedProfile,
        msg: "Profile updated successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update profile",
        error: error.message,
        success: false,
      });
    }
  },

  deleteProfile: async (req, res) => {
    try {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({
          msg: "Profile ID is required",
          success: false,
        });
      }

      const existingProfile = await Profile.findById(_id);

      if (!existingProfile) {
        return res.status(404).json({
          msg: "No profile with this ID found",
          success: false,
        });
      }

      existingProfile.deleted = true; // Mark as deleted instead of actually deleting
      await existingProfile.save();

      return res.status(200).json({
        msg: "Profile deleted successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete profile",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods;
