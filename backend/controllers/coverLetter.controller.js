const CoverLetter = require("../models/coverLetter.model");
const User = require("../models/user.model");

const methods = {
  // CREATE
  // addCoverLetter: async (req, res) => {
  //   try {
  //     const userId = req.token._id;
  //     const { companyData, letterBody } = req.body;

  //     if (!letterBody || !companyData?.name) {
  //       return res.status(400).json({
  //         msg: "Company name and letter body are required",
  //         success: false,
  //       });
  //     }

  //     const user = await User.findById(userId).lean();
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User not found",
  //         success: false,
  //       });
  //     }

  //     const userData = {
  //       name: `${user.firstName} ${user.lastName}`.trim() || user.fullName || "",
  //       address: "", // Optional: Fill from user profile if available
  //       cityStateZip: `${user.city || ""}, ${user.state || ""} ${user.country || ""}`.trim(),
  //       email: user.email || "",
  //       phone: user.phoneNo || "",
  //       date: new Date().toISOString().split("T")[0], // e.g., 2025-07-10
  //     };

  //     const newCoverLetter = new CoverLetter({
  //       userId,
  //       userData,
  //       companyData,
  //       letterBody,
  //     });

  //     const saved = await newCoverLetter.save();

  //     return res.status(201).json({
  //       coverLetter: saved,
  //       msg: "Cover letter created successfully",
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.error("Add Cover Letter Error:", error);
  //     return res.status(500).json({
  //       msg: "Failed to create cover letter",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  addCoverLetter: async (req, res) => {
  try {
    const userId = req.token._id;
    const { userData, companyData, letterBody ,jobTitle} = req.body;

    if (!letterBody) {
      return res.status(400).json({
        msg: "letter body is required",
        success: false,
      });
    }

    // if (!userData?.name || !userData?.email || !userData?.phone) {
    //   return res.status(400).json({
    //     msg: "User name, email, and phone are required",
    //     success: false,
    //   });
    // }

    const newCoverLetter = new CoverLetter({
      userId,
      userData: {
        ...userData,
        date: userData.date || new Date().toISOString().split("T")[0], // use given date or today's date
      },
      companyData,
      jobTitle,
      letterBody,
    });

    const saved = await newCoverLetter.save();

    return res.status(201).json({
      coverLetter: saved,
      msg: "Cover letter created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Add Cover Letter Error:", error);
    return res.status(500).json({
      msg: "Failed to create cover letter",
      error: error.message,
      success: false,
    });
  }
},


  // READ ALL
  viewCoverLetters: async (req, res) => {
    try {
      const userId = req.token._id;
      const { page = 1, limit = 900 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: { path: "userId", select: "firstName lastName email" },
      };

      const coverLetters = await CoverLetter.paginate(
        { userId, deleted: false },
        options
      );

      return res.status(200).json({
        coverLetters,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to retrieve cover letters",
        error: error.message,
        success: false,
      });
    }
  },

  // READ ONE
  viewSingleCoverLetter: async (req, res) => {
    try {
      const { id } = req.params;

      const letter = await CoverLetter.findOne({
        _id: id,
        deleted: false,
      });

      if (!letter) {
        return res.status(404).json({
          msg: "Cover letter not found",
          success: false,
        });
      }

      return res.status(200).json({
        coverLetter: letter,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to retrieve cover letter",
        error: error.message,
        success: false,
      });
    }
  },

  // UPDATE
  // updateCoverLetter: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const userId = req.token._id;
  //     const { companyData, letterBody } = req.body;

  //     const existing = await CoverLetter.findOne({ _id: id, userId, deleted: false });
  //     if (!existing) {
  //       return res.status(404).json({
  //         msg: "Cover letter not found",
  //         success: false,
  //       });
  //     }

  //     if (letterBody) existing.letterBody = letterBody;
  //     if (companyData && companyData.name) existing.companyData = companyData;

  //     const updated = await existing.save();

  //     return res.status(200).json({
  //       coverLetter: updated,
  //       msg: "Cover letter updated successfully",
  //       success: true,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Failed to update cover letter",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  updateCoverLetter: async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.token._id;
    const { userData, companyData, letterBody } = req.body;

    const existing = await CoverLetter.findOne({ _id: id, userId, deleted: false });
    if (!existing) {
      return res.status(404).json({
        msg: "Cover letter not found",
        success: false,
      });
    }

    if (letterBody) existing.letterBody = letterBody;
    if (companyData && companyData.name) existing.companyData = companyData;
    if (userData && userData.name && userData.email && userData.phone) {
      existing.userData = {
        ...userData,
        date: userData.date || new Date().toISOString().split("T")[0]
      };
    }

    const updated = await existing.save();

    return res.status(200).json({
      coverLetter: updated,
      msg: "Cover letter updated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to update cover letter",
      error: error.message,
      success: false,
    });
  }
},


  // DELETE (soft delete)
  deleteCoverLetter: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.token._id;

      const coverLetter = await CoverLetter.findOne({ _id: id, userId });

      if (!coverLetter) {
        return res.status(404).json({
          msg: "Cover letter not found",
          success: false,
        });
      }

      coverLetter.deleted = true;
      await coverLetter.save();

      return res.status(200).json({
        msg: "Cover letter deleted successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete cover letter",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = methods;
