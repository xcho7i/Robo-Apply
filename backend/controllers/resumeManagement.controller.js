const Resume = require("../models/resumeManagement.model")
const User = require("../models/user.model")

const {
  checkUserResumeProfiles,
  deductUserResumeProfile
} = require("../helpers/services")

const methods = {
  addResume: async (req, res) => {
    try {
      const data = req.body
      const userId = req.token._id

      // STEP 1: Check if user has credits
      try {
        await checkUserResumeProfiles(userId)
      } catch (err) {
        return res.status(403).json({
          msg:
            err.message ||
            "Not enough Profiles left. Please upgrade your plan.",
          success: false
        })
      }

      if (!data.resumeUrl) {
        return res.status(400).json({
          msg: "Please provide resume URL",
          success: false
        })
      }

      if ("isComplete" in data) delete data.isComplete

      if (Array.isArray(data.workExperiences)) {
        data.experiences = data.workExperiences.filter(
          (exp) => exp.companyName && exp.jobTitle
        )
      }

      if (Array.isArray(data.education)) {
        data.qualifications = data.education.filter(
          (edu) => edu.institutionName && edu.degreeType
        )
      }

      if (Array.isArray(data.skills)) {
        data.skills = data.skills
          .map((s) => ({
            skill: s.skill || s.skillName,
            yearsOfExperience:
              s.yearsOfExperience || s.experienceYearsCount || ""
          }))
          .filter((s) => s.skill && s.skill.trim() !== "")
      }

      if (Array.isArray(data.projects)) {
        data.projects = data.projects.filter((p) => p.projectTitle && p.role)
      }

      if (Array.isArray(data.certifications)) {
        data.certifications = data.certifications.filter(
          (c) => c.certificationTitle
        )
      }

      if (Array.isArray(data.achievements)) {
        data.achievements = data.achievements.filter((a) => a.awardTitle)
      }

      if (Array.isArray(data.languagesList)) {
        data.languagesList = data.languagesList.filter(
          (l) => l.language && l.proficiency
        )
      }

      const isComplete = Boolean(
        data.resumeName &&
          data.resumeUrl &&
          data.socialMediaLinks?.linkedin &&
          data.personalInformation?.firstName &&
          data.personalInformation?.lastName &&
          data.personalInformation?.email &&
          data.personalInformation?.phoneNo &&
          data.personalInformation?.country &&
          Array.isArray(data.qualifications) &&
          data.qualifications.length >= 1 &&
          Array.isArray(data.skills) &&
          data.skills.length >= 1 &&
          data.formData &&
          data.formData.experience &&
          data.formData.veteranStatus &&
          data.formData.disability &&
          data.formData.willingToRelocate &&
          data.formData.raceEthnicity &&
          data.formData.noticePeriod &&
          data.formData.expectedSalary &&
          data.formData.expectedSalaryCurrency &&
          data.formData.currentSalary &&
          data.formData.currentSalaryCurrency &&
          data.formData.highestEducation &&
          data.formData.expectedJoiningDate &&
          data.formData.companiesExclude &&
          data.formData.visaSponsorshipStatus &&
          data.formData.securityClearanceStatus &&
          data.formData.countriesAuthorizedToWork
      )

      data.isResumeBuilder = false

      const newResume = new Resume({ ...data, userId, isComplete })
      const addedResume = await newResume.save()

      await deductUserResumeProfile(userId)

      return res.status(201).json({
        resume: addedResume,
        msg: "Resume added successfully",
        success: true
      })
    } catch (error) {
      console.error("Add Resume Error:", error)
      return res.status(500).json({
        msg: "Failed to add resume",
        error: error.message,
        success: false
      })
    }
  },

  viewResumes: async (req, res) => {
    try {
      const { page = 1, limit = 500 } = req.query
      const userId = req.token._id // assuming this is coming from a verified token

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        select: "_id resumeName status isComplete updatedAt jobTitle" // Specify the fields to return
      }

      // Fetch only resumes where userId matches and not deleted
      const resumes = await Resume.paginate(
        { userId: userId, deleted: false, isResumeBuilder: false },
        options
      )

      // const resumes = await Resume.find({
      //   userId: userId,
      //   deleted: false
      // }).select('_id resumeName status isComplete');

      return res.status(200).json({
        resumes: resumes,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view resumes",
        error: error.message,
        success: false
      })
    }
  },

  viewSingleResume: async (req, res) => {
    try {
      const resumeId = req.params.id
      // const userId = req.token._id;

      const resume = await Resume.findOne({
        _id: resumeId,
        // userId: userId,
        deleted: false,
        isResumeBuilder: false
      })

      if (!resume) {
        return res.status(404).json({
          msg: "Resume not found or you don't have access to it",
          success: false
        })
      }

      return res.status(200).json({
        resume: resume,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to retrieve resume",
        error: error.message,
        success: false
      })
    }
  },

  updateResume: async (req, res) => {
    try {
      const data = req.body
      const resumeId = req.params.id
      const userId = req.token._id

      const existingResume = await Resume.findOne({ _id: resumeId, userId })
      if (!existingResume) {
        return res.status(404).json({
          msg: "Resume not found",
          success: false
        })
      }

      const updateData = {}

      // Scalar fields
      if (data.resumeName) updateData.resumeName = data.resumeName
      if (data.resumeFileName) updateData.resumeFileName = data.resumeFileName
      if (data.resumeUrl) updateData.resumeUrl = data.resumeUrl
      if (data.coverLetter !== undefined)
        updateData.coverLetter = data.coverLetter

      // Nested objects
      if (
        data.socialMediaLinks &&
        Object.keys(data.socialMediaLinks).length > 0
      ) {
        updateData.socialMediaLinks = data.socialMediaLinks
      }

      if (
        data.personalInformation &&
        Object.keys(data.personalInformation).length > 0
      ) {
        updateData.personalInformation = data.personalInformation
      }

      if (data.formData && Object.keys(data.formData).length > 0) {
        updateData.formData = data.formData
      }

      // Arrays
      if (Array.isArray(data.education) && data.education.length > 0) {
        updateData.qualifications = data.education.filter(
          (edu) => edu.institutionName && edu.degreeType
        )
      }

      if (
        Array.isArray(data.workExperiences) &&
        data.workExperiences.length > 0
      ) {
        updateData.experiences = data.workExperiences.filter(
          (exp) => exp.companyName && exp.jobTitle
        )
      }

      if (Array.isArray(data.experiences) && data.experiences.length > 0) {
        updateData.experiences = data.experiences.filter(
          (exp) => exp.companyName && exp.jobTitle
        )
      }

      if (Array.isArray(data.skills) && data.skills.length > 0) {
        updateData.skills = data.skills
          .filter((s) => s.skill || s.skillName)
          .map((s) => ({
            skill: s.skill || s.skillName,
            yearsOfExperience:
              s.yearsOfExperience || s.experienceYearsCount || ""
          }))
      }

      if (Array.isArray(data.projects) && data.projects.length > 0) {
        updateData.projects = data.projects.filter(
          (p) => p.projectTitle && p.role
        )
      }

      if (
        Array.isArray(data.certifications) &&
        data.certifications.length > 0
      ) {
        updateData.certifications = data.certifications.filter(
          (c) => c.certificationTitle
        )
      }

      if (Array.isArray(data.achievements) && data.achievements.length > 0) {
        updateData.achievements = data.achievements.filter((a) => a.awardTitle)
      }

      if (Array.isArray(data.languagesList) && data.languagesList.length > 0) {
        updateData.languagesList = data.languagesList.filter(
          (l) => l.language && l.proficiency
        )
      }

      // 🚫 Never allow client to set isComplete manually
      if ("isComplete" in updateData) delete updateData.isComplete

      // ⏫ Perform update
      await Resume.updateOne({ _id: resumeId }, { $set: updateData })

      // 🔁 Refetch to check completeness
      const updated = await Resume.findById(resumeId)

      const isComplete = Boolean(
        updated.resumeName &&
          updated.resumeUrl &&
          updated.socialMediaLinks?.linkedin &&
          updated.personalInformation?.firstName &&
          updated.personalInformation?.lastName &&
          updated.personalInformation?.email &&
          updated.personalInformation?.phoneNo &&
          updated.personalInformation?.country &&
          Array.isArray(updated.qualifications) &&
          updated.qualifications.length >= 1 &&
          Array.isArray(updated.skills) &&
          updated.skills.length >= 1 &&
          updated.formData &&
          updated.formData.experience &&
          updated.formData.veteranStatus &&
          updated.formData.disability &&
          updated.formData.willingToRelocate &&
          updated.formData.raceEthnicity &&
          updated.formData.noticePeriod &&
          updated.formData.expectedSalary &&
          updated.formData.expectedSalaryCurrency &&
          updated.formData.currentSalary &&
          updated.formData.currentSalaryCurrency &&
          updated.formData.highestEducation &&
          updated.formData.expectedJoiningDate &&
          updated.formData.companiesExclude &&
          updated.formData.visaSponsorshipStatus &&
          updated.formData.securityClearanceStatus &&
          updated.formData.countriesAuthorizedToWork
      )

      await Resume.updateOne({ _id: resumeId }, { isComplete })

      const finalResume = await Resume.findById(resumeId)

      return res.status(200).json({
        resume: finalResume,
        msg: "Resume updated successfully",
        success: true
      })
    } catch (error) {
      console.error("Update Resume Error:", error)
      return res.status(500).json({
        msg: "Failed to update resume",
        error: error.message,
        success: false
      })
    }
  },

  deleteResume: async (req, res) => {
    try {
      const { id } = req.params

      if (!id) {
        return res
          .status(400)
          .json({ msg: "Resume ID is required", success: false })
      }

      const existingResume = await Resume.findById(id)

      if (!existingResume) {
        return res
          .status(404)
          .json({ msg: "No Resume with this ID found", success: false })
      }

      existingResume.deleted = true
      await existingResume.save()

      return res
        .status(200)
        .json({ msg: "Resume deleted successfully", success: true })
    } catch (error) {
      return res
        .status(500)
        .json({
          msg: "Failed to delete resume",
          error: error.message,
          success: false
        })
    }
  }
}

module.exports = methods
