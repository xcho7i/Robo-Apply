const Resume = require("../models/resume.model");
const User = require("../models/user.model");
const {checkUserCredits,deductUserCredits} = require("../helpers/services")

const methods = {

// addResume: async (req, res) => {
//   try {
//     const data = req.body;
//     const userId = req.token._id;

//     if ("isComplete" in data) delete data.isComplete;

//     // Here i need to check whether user has required credits to perform this action. so call that services functions that we made earlier.
//     //If not enough then return response to user that He is out of credits.Upgrade your plan.

//     // Normalize a date field (replaces "present" with null, sets isCurrent)
//     const normalizeDates = (items) => {
//       return items?.map((item) => {
//         const endDateValue = item.endDate?.toString().toLowerCase();
//         const isCurrent = endDateValue === "present";
//         return {
//           ...item,
//           endDate: isCurrent ? null : item.endDate,
//           isCurrent,
//         };
//       }) || [];
//     };

//     // Handle experiences
//     if (Array.isArray(data.experiences)) {
//       data.experiences = normalizeDates(
//         data.experiences.filter((exp) => exp.companyName && exp.jobTitle)
//       );
//     }

//     // Handle qualifications
//     if (Array.isArray(data.qualifications)) {
//       data.qualifications = normalizeDates(
//         data.qualifications.filter((edu) => edu.institutionName && edu.degreeType)
//       );
//     }

//     // Handle certifications
//     if (Array.isArray(data.certifications)) {
//       data.certifications = normalizeDates(
//         data.certifications.filter((c) => c.certificationTitle)
//       );
//     }

//     // Handle achievements
//     if (Array.isArray(data.achievements)) {
//       data.achievements = normalizeDates(
//         data.achievements.filter((a) => a.awardTitle)
//       );
//     }

//     // Handle skills
//     if (Array.isArray(data.skills)) {
//       data.skills = data.skills
//         .map((s) => ({
//           skill: s.skill || s.skillName,
//           yearsOfExperience: s.yearsOfExperience || s.experienceYearsCount || "",
//         }))
//         .filter((s) => s.skill && s.skill.trim() !== "");
//     }

//     // Handle languages
//     if (Array.isArray(data.languages)) {
//       data.languages = data.languages.filter(
//         (l) => l.language && l.proficiency
//       );
//     }

//     const isComplete = Boolean(
//       data.resumeTitle &&
//       data.name &&
//       data.jobTitle &&
//       data.email &&
//       data.phone &&
//       Array.isArray(data.qualifications) &&
//       data.qualifications.length >= 1 &&
//       Array.isArray(data.skills) &&
//       data.skills.length >= 1
//     );

//     const newResume = new Resume({ ...data, userId, isComplete ,isResumeBuilder:true});
//     const addedResume = await newResume.save();


//     //And here after resume got created successfully i need to deduct the credits from userSubscription credtis.

//     return res.status(201).json({
//       resume: addedResume,
//       msg: "Resume added successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.error("Add Resume Error:", error);
//     return res.status(500).json({
//       msg: "Failed to add resume",
//       error: error.message,
//       success: false,
//     });
//   }
// },


addResume : async (req, res) => {
  try {
    const data = req.body;
    const userId = req.token._id;

    try {
      await checkUserCredits(userId, 9);
    } catch (err) {
      return res.status(403).json({
        msg: err.message || "Not enough credits. Please upgrade your plan.",
        success: false,
      });
    }

    if ("isComplete" in data) delete data.isComplete;

    const normalizeDates = (items) => {
      return items?.map((item) => {
        const endDateValue = item.endDate?.toString().toLowerCase();
        const isCurrent = endDateValue === "present";
        return {
          ...item,
          endDate: isCurrent ? null : item.endDate,
          isCurrent,
        };
      }) || [];
    };

    if (Array.isArray(data.experiences)) {
      data.experiences = normalizeDates(
        data.experiences.filter((exp) => exp.companyName && exp.jobTitle)
      );
    }

    if (Array.isArray(data.qualifications)) {
      data.qualifications = normalizeDates(
        data.qualifications.filter((edu) => edu.institutionName && edu.degreeType)
      );
    }

    if (Array.isArray(data.certifications)) {
      data.certifications = normalizeDates(
        data.certifications.filter((c) => c.certificationTitle)
      );
    }

    if (Array.isArray(data.achievements)) {
      data.achievements = normalizeDates(
        data.achievements.filter((a) => a.awardTitle)
      );
    }

    if (Array.isArray(data.skills)) {
      data.skills = data.skills
        .map((s) => ({
          skill: s.skill || s.skillName,
          yearsOfExperience: s.yearsOfExperience || s.experienceYearsCount || "",
        }))
        .filter((s) => s.skill && s.skill.trim() !== "");
    }

    if (Array.isArray(data.languages)) {
      data.languages = data.languages.filter(
        (l) => l.language && l.proficiency
      );
    }

    // Validate and normalize contact fields
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{7,14}$/; // E.164-like: +countrycode and 8-15 digits total

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        msg: "Valid email is required",
        success: false,
      });
    }

    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        msg: "Phone must start with + and country code (E.164)",
        success: false,
      });
    }

    data.email = email;
    data.phone = phone;

    const isComplete = Boolean(
      data.resumeTitle &&
      data.name &&
      data.jobTitle &&
      data.email &&
      data.phone &&
      Array.isArray(data.qualifications) &&
      data.qualifications.length >= 1 &&
      Array.isArray(data.skills) &&
      data.skills.length >= 1
    );

    const newResume = new Resume({
      ...data,
      userId,
      isComplete,
      isResumeBuilder: true,
    });

    const addedResume = await newResume.save();

    await deductUserCredits(userId, 9);

    return res.status(201).json({
      resume: addedResume,
      msg: "Resume added successfully",
      success: true,
    });
  } catch (error) {
    console.error("Add Resume Error:", error);
    return res.status(500).json({
      msg: "Failed to add resume",
      error: error.message,
      success: false,
    });
  }
},

 viewResumes: async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const userId = req.token._id;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      select: '_id resumeTitle status isComplete selectedTemplate name isResumeBuilder jobTitle updatedAt'
    };

    const resumes = await Resume.paginate(
      { userId: userId, deleted: false,isResumeBuilder:true },
      options
    );

    return res.status(200).json({
      resumes,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to view resumes",
      error: error.message,
      success: false,
    });
  }
},

viewSingleResume: async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await Resume.findOne({
      _id: resumeId,
      deleted: false,
      isResumeBuilder:true
    });

    if (!resume) {
      return res.status(404).json({
        msg: "Resume not found or you don't have access to it",
        success: false,
      });
    }

    // Transform function: add endDate: "present" and remove isCurrent
    const transformItems = (items) => {
      return items?.map(item => {
        const obj = item.toObject?.() || item;
        const transformed = {
          ...obj,
          endDate: obj.isCurrent ? "present" : obj.endDate || null,
        };
        delete transformed.isCurrent;
        return transformed;
      }) || [];
    };

    const transformedResume = resume.toObject();
    transformedResume.experiences = transformItems(transformedResume.experiences);
    transformedResume.qualifications = transformItems(transformedResume.qualifications);
    transformedResume.certifications = transformItems(transformedResume.certifications);
    transformedResume.achievements = transformItems(transformedResume.achievements);

    return res.status(200).json({
      resume: transformedResume,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to retrieve resume",
      error: error.message,
      success: false,
    });
  }
},

updateResume: async (req, res) => {
    try {
      const data = req.body;
      console.log("SELEEE",data.selectedTemplate)
    const resumeId = req.params.id; 
      const userId = req.token._id;

      const existingResume = await Resume.findOne({ _id: resumeId, userId });
      if (!existingResume) {
        return res.status(404).json({
          msg: "Resume not found",
          success: false,
        });
      }

      const updateData = {};

      // Update scalar fields
      if (data.resumeTitle) updateData.resumeTitle = data.resumeTitle;
      if (data.name) updateData.name = data.name;
      if (data.jobTitle) updateData.jobTitle = data.jobTitle;
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      if (data.linkedin) updateData.linkedin = data.linkedin;
      if (Array.isArray(data.website)) updateData.website = data.website;
      if (data.summary) updateData.summary = data.summary;
      if (data.address) updateData.address = data.address;
      if (data.city) updateData.city = data.city;
      if (data.state) updateData.state = data.state;
      if (data.postalCode) updateData.postalCode = data.postalCode;
      if (data.country) updateData.country = data.country;
            if (data.selectedTemplate) updateData.selectedTemplate = data.selectedTemplate;


      // Nested objects
      if (data.socialMediaLinks && Object.keys(data.socialMediaLinks).length > 0) {
        updateData.socialMediaLinks = data.socialMediaLinks;
      }

      if (data.experiences && Array.isArray(data.experiences)) {
        updateData.experiences = data.experiences.filter(
          (exp) => exp.companyName && exp.jobTitle
        );
      }

      if (data.qualifications && Array.isArray(data.qualifications)) {
        updateData.qualifications = data.qualifications.filter(
          (edu) => edu.institutionName && edu.degreeType
        );
      }

      if (data.skills && Array.isArray(data.skills)) {
        updateData.skills = data.skills
          .map((s) => ({
            skill: s.skill || s.skillName,
            yearsOfExperience: s.yearsOfExperience || s.experienceYearsCount || "",
          }))
          .filter((s) => s.skill && s.skill.trim() !== "");
      }

      if (data.certifications && Array.isArray(data.certifications)) {
        updateData.certifications = data.certifications.filter(
          (c) => c.certificationTitle
        );
      }

      if (data.achievements && Array.isArray(data.achievements)) {
        updateData.achievements = data.achievements.filter(
          (a) => a.awardTitle
        );
      }

      if (data.languages && Array.isArray(data.languages)) {
        updateData.languages = data.languages.filter(
          (l) => l.language && l.proficiency
        );
      }

      // 🚫 Never allow client to set isComplete manually
      if ("isComplete" in updateData) delete updateData.isComplete;

      await Resume.updateOne({ _id: resumeId }, { $set: updateData });

      // Refetch the updated resume
      const updated = await Resume.findById(resumeId);

      const isComplete = Boolean(
        updated.resumeTitle &&
        updated.name &&
        updated.jobTitle &&
        updated.email &&
        updated.phone &&
        Array.isArray(updated.qualifications) &&
        updated.qualifications.length >= 1 &&
        Array.isArray(updated.skills) &&
        updated.skills.length >= 1
      );

      await Resume.updateOne({ _id: resumeId }, { isComplete });

      const finalResume = await Resume.findById(resumeId);

      return res.status(200).json({
        resume: finalResume,
        msg: "Resume updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Update Resume Error:", error);
      return res.status(500).json({
        msg: "Failed to update resume",
        error: error.message,
        success: false,
      });
    }
},

deleteResume: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ msg: "Resume ID is required", success: false });
      }

      const existingResume = await Resume.findByIdAndDelete(id);

      if (!existingResume) {
        return res.status(404).json({ msg: "No Resume with this ID found", success: false });
      }


      return res.status(200).json({ msg: "Resume deleted successfully", success: true });
    } catch (error) {
      return res.status(500).json({ msg: "Failed to delete resume", error: error.message, success: false });
    }
}
};

module.exports = methods;
