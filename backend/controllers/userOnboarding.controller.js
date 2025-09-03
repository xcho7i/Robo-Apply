const UserOnboarding = require("../models/userOnboarding.model");
const User = require("../models/user.model");

const methods = {
  // Create or update user onboarding data
  submitOnboarding: async (req, res) => {
    try {
      const data = req.body;

      const userId = req.token._id;


      console.log("USER ID", userId);

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false,
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          msg: "User not found",
          success: false,
        });
      }

      // Check if onboarding data already exists
      let onboardingData = await UserOnboarding.findOne({ userId });

      if (onboardingData) {
        // Update existing onboarding data
        const updatedOnboarding = await UserOnboarding.findByIdAndUpdate(
          onboardingData._id,
          {
            ...data,
            userId,
            isCompleted: true,
          },
          { new: true }
        );

        user.onboardingCompleted = true;
        await user.save();

        return res.status(200).json({
          onboarding: updatedOnboarding,
          msg: "Onboarding data updated successfully",
          success: true,
        });
      } else {
        // Create new onboarding data
        const newOnboarding = new UserOnboarding({
          ...data,
          userId,
          isCompleted: true,
        });

        const savedOnboarding = await newOnboarding.save();

        user.onboardingCompleted = true;
        await user.save();

        return res.status(201).json({
          onboarding: savedOnboarding,
          msg: "Onboarding data submitted successfully",
          success: true,
        });
      }
    } catch (error) {
      console.error("Onboarding submission error:", error);
      return res.status(500).json({
        msg: "Failed to submit onboarding data",
        error: error.message,
        success: false,
      });
    }
  },

  // Get user onboarding data
  getOnboardingData: async (req, res) => {
    try {
      const userId = req.token._id;

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false,
        });
      }

      const onboardingData = await UserOnboarding.findOne({ 
        userId, 
        deleted: false 
      }).populate('userId', 'firstName lastName email');

      if (!onboardingData) {
        return res.status(404).json({
          msg: "Onboarding data not found",
          success: false,
        });
      }

      return res.status(200).json({
        onboarding: onboardingData,
        success: true,
      });
    } catch (error) {
      console.error("Get onboarding data error:", error);
      return res.status(500).json({
        msg: "Failed to get onboarding data",
        error: error.message,
        success: false,
      });
    }
  },

  // Update specific onboarding fields
  updateOnboardingField: async (req, res) => {
    try {
      const { field, value } = req.body;
      const userId = req.token._id;

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false,
        });
      }

      if (!field) {
        return res.status(400).json({
          msg: "Field name is required",
          success: false,
        });
      }

      const updateData = { [field]: value };
      
      const updatedOnboarding = await UserOnboarding.findOneAndUpdate(
        { userId, deleted: false },
        updateData,
        { new: true }
      );

      if (!updatedOnboarding) {
        return res.status(404).json({
          msg: "Onboarding data not found",
          success: false,
        });
      }

      return res.status(200).json({
        onboarding: updatedOnboarding,
        msg: "Onboarding field updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Update onboarding field error:", error);
      return res.status(500).json({
        msg: "Failed to update onboarding field",
        error: error.message,
        success: false,
      });
    }
  },

  // Delete onboarding data (soft delete)
  deleteOnboardingData: async (req, res) => {
    try {
      const userId = req.token._id;

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false,
        });
      }

      const onboardingData = await UserOnboarding.findOne({ userId });

      if (!onboardingData) {
        return res.status(404).json({
          msg: "Onboarding data not found",
          success: false,
        });
      }

      onboardingData.deleted = true;
      await onboardingData.save();

      return res.status(200).json({
        msg: "Onboarding data deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Delete onboarding data error:", error);
      return res.status(500).json({
        msg: "Failed to delete onboarding data",
        error: error.message,
        success: false,
      });
    }
  },

  // Get onboarding completion status
  getOnboardingStatus: async (req, res) => {
    try {
      const userId = req.token._id;

      if (!userId) {
        return res.status(400).json({
          msg: "User ID is required",
          success: false,
        });
      }

      const onboardingData = await UserOnboarding.findOne({ 
        userId, 
        deleted: false 
      });

      return res.status(200).json({
        isCompleted: onboardingData?.isCompleted || false,
        hasOnboardingData: !!onboardingData,
        success: true,
      });
    } catch (error) {
      console.error("Get onboarding status error:", error);
      return res.status(500).json({
        msg: "Failed to get onboarding status",
        error: error.message,
        success: false,
      });
    }
  },

  // Get all onboarding data (admin function)
  getAllOnboardingData: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      };

      const query = { deleted: false };
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { jobTitle: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } }
        ];
      }

      const onboardingData = await UserOnboarding.paginate(query, options);

      return res.status(200).json({
        onboardingData,
        success: true,
      });
    } catch (error) {
      console.error("Get all onboarding data error:", error);
      return res.status(500).json({
        msg: "Failed to get onboarding data",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods; 