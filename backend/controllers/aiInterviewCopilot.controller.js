const mongoose = require("mongoose")
const LiveInterviewSettingContext = require("../models/liveInterviewSetting.context.model")
const fs = require("fs")
const path = require("path")
const AddYourResume = require("../models/addYourResume.model")
const AiCopilotInterviewSession = require("../models/aiCopilotInterviewSession.model")
const AddYourPosition = require("../models/addYourPosition.model")
const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")

const UPLOAD_DIR = path.join(__dirname, "../uploads/resumes")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Helper function to get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase()
}

// Helper function to parse different file types
const parseFileContent = async (fileData, filename) => {
  const extension = getFileExtension(filename)

  try {
    switch (extension) {
      case '.pdf':
        const pdfData = await pdfParse(fileData)
        return pdfData.text || ""

      case '.txt':
        return fileData.toString('utf-8')

      case '.docx':
        const result = await mammoth.extractRawText({ buffer: fileData })
        return result.value || ""

      case '.doc':
        // For .doc files, mammoth may not work perfectly, but we'll try
        // Note: .doc files are legacy format, .docx is recommended
        try {
          const docResult = await mammoth.extractRawText({ buffer: fileData })
          return docResult.value || ""
        } catch (docError) {
          console.warn("Warning: .doc file parsing may not be fully supported. Consider converting to .docx format.")
          // Return empty string if .doc parsing fails completely
          return ""
        }

      default:
        return ""
    }
  } catch (error) {
    console.error(`Error parsing ${extension} file:`, error.message)
    return ""
  }
}

// Helper function to validate file type
const isValidFileType = (filename) => {
  const validExtensions = ['.pdf', '.txt', '.doc', '.docx']
  const extension = getFileExtension(filename)
  return validExtensions.includes(extension)
}

const methods = {
  addCopilotContext: async (req, res) => {
    try {
      const data = req.body
      // data.userId = req.token._id;

      if (!data.userId) {
        return res.status(400).json({
          msg: "Missing userId",
          success: false
        })
      }

      if (data.contexts.length === 0) {
        return res.status(400).json({
          msg: "There is no context.",
          success: false
        })
      }

      const updatedContext = await LiveInterviewSettingContext.findOneAndUpdate(
        { userId: data.userId },
        { $set: { contexts: data.contexts } },
        { new: true, upsert: true }
      )

      console.log(" userId => ", data.userId)

      return res.status(200).json({
        contexts: updatedContext,
        msg: "Contexts added successfully",
        success: true
      })
    } catch (error) {
      console.log("req.body => ", req.body)
      return res.status(500).json({
        msg: "Failed to add context",
        error: error.message,
        success: false
      })
    }
  },

  getCopilotContexts: async (req, res) => {
    try {
      const data = req.body

      if (!data.userId) {
        return res.status(400).json({
          msg: "Missing userId",
          success: false
        })
      }

      const context = await LiveInterviewSettingContext.findOne({
        userId: data.userId
      })
      if (!context) {
        return res.status(404).json({
          msg: "No contexts found for this user",
          success: false
        })
      }

      return res.status(200).json({
        contexts: context.contexts,
        msg: "Contexts fetched successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to fetch contexts",
        error: error.message,
        success: false
      })
    }
  },

  addYourResume: async (req, res) => {
    try {
      const { userId } = req.body
      console.log("addYourResume userId =>", userId)
      if (!userId) return res.status(400).json({ error: "userId is required" })

      if (!req.files || !req.files.resume) {
        return res.status(400).json({ error: "No files uploaded" })
      }

      const uploadedFiles = Array.isArray(req.files.resume)
        ? req.files.resume
        : [req.files.resume]

      // Save files + extract text
      const resumeData = []
      for (const file of uploadedFiles) {
        const filePath = path.join(UPLOAD_DIR, file.name)

        // Validate file type
        if (!isValidFileType(file.name)) {
          return res.status(400).json({
            error: `Invalid file type for ${file.name}. Only PDF, TXT, DOC, and DOCX files are allowed.`
          })
        }

        // Save the file locally
        fs.writeFileSync(filePath, file.data)

        // Extract text content based on file type
        let textContent = ""
        try {
          textContent = await parseFileContent(file.data, file.name)
        } catch (err) {
          console.error(`${getFileExtension(file.name).toUpperCase()} parse failed:`, err.message)
          // Continue processing even if parsing fails - file is still saved
        }

        resumeData.push({
          name: file.name,
          date: new Date(),
          fileUrl: `/uploads/resumes/${file.name}`,
          textContent
        })
      }

      // Save to DB
      let userResumes = await AddYourResume.findOne({ userId })
      if (!userResumes) {
        userResumes = new AddYourResume({ userId, resumes: resumeData })
      } else {
        userResumes.resumes.push(...resumeData)
      }

      await userResumes.save()

      res.json({
        uploadedFiles: resumeData,
        success: true,
        message: `Successfully uploaded ${resumeData.length} file(s)`
      })
    } catch (err) {
      console.error("addYourResume error =>", err)
      res.status(500).json({ error: err.message || "Internal server error" })
    }
  },

  getYourResume: async (req, res) => {
    try {
      const data = req.body

      if (!data.userId) {
        return res.status(400).json({
          msg: "Missing userId",
          success: false
        })
      }

      const userResumes = await AddYourResume.findOne({
        userId: data.userId
      })
      if (!userResumes) {
        return res.status(404).json({
          msg: "No resumes found for this user",
          success: false
        })
      }

      return res.status(200).json({
        uploadedFiles: userResumes.resumes.map((r) => ({
          id: r._id,
          name: r.name,
          date: r.date,
          fileUrl: r.fileUrl
          // textContent: r.textContent
        })),
        msg: "Resumes fetched successfully",
        success: true
      })
    } catch (error) {
      console.error("getYourResume error =>", error)
      return res.status(500).json({
        msg: "Failed to fetch resumes",
        error: error.message,
        success: false
      })
    }
  },

  removeYourResume: async (req, res) => {
    try {
      const { userId, _id } = req.body;
      console.log("removeYourResume _id =>", _id, userId);

      if (!userId) {
        return res.status(400).json({ msg: "Missing userId", success: false });
      }
      if (!_id) {
        return res.status(400).json({ msg: "Missing _id", success: false });
      }

      // Find the user's resume document
      const userResumeDoc = await AddYourResume.findOne({ userId: userId });
      if (!userResumeDoc) {
        return res.status(404).json({ msg: "User resume document not found", success: false });
      }

      // Find the index of the resume to remove
      const resumeIndex = userResumeDoc.resumes.findIndex(r => r._id.toString() === _id);
      if (resumeIndex === -1) {
        return res.status(404).json({ msg: "Resume not found", success: false });
      }

      // Remove the resume from the array
      userResumeDoc.resumes.splice(resumeIndex, 1);
      await userResumeDoc.save();

      return res.status(200).json({ msg: "Resume removed successfully", success: true });
    } catch (error) {
      console.error("removeYourResume error =>", error);
      return res.status(500).json({
        msg: "Failed to remove resume",
        error: error.message,
        success: false
      });
    }
  },

  addYourPosition: async (req, res) => {
    try {
      const data = req.body;

      console.log("addYourPosition data =>", data); 
      if (!data.userId) {
        return res.status(400).json({ msg: "Missing userId", success: false });
      }

      // Only one position can be added per request
      if (!data.position || typeof data.position !== "object") {
        return res.status(400).json({ msg: "Missing or invalid position object.", success: false });
      }

      // Find the user's position document, or create if not exists
      let userPositionDoc = await AddYourPosition.findOne({ userId: data.userId });

      if (!userPositionDoc) {
        // Create new document with the first position
        userPositionDoc = new AddYourPosition({
          userId: data.userId,
          positions: [data.position]
        });
        await userPositionDoc.save();
      } else {
        // Add the new position to the existing array
        userPositionDoc.positions.push(data.position);
        await userPositionDoc.save();
      }

      return res.status(200).json({
        positions: userPositionDoc.positions,
        msg: "Position added successfully",
        success: true
      });
    } catch (error) {
      console.error("addYourPosition error =>", error);
      return res.status(500).json({
        msg: "Failed to add position",
        error: error.message,
        success: false
      });
    }
  },

  removeYourPosition: async (req, res) => {
    try {
      const data = req.body
      console.log("removeYourPosition data =>", data);
      const {userId, _id} = data
      if (!userId) {
        return res.status(400).json({ msg: "Missing userId", success: false });
      }
      if (!_id) {
        return res.status(400).json({ msg: "Missing _id", success: false });
      }
      const userPositionDoc = await AddYourPosition.findOne({ userId: userId });
      if (!userPositionDoc) {
        return res.status(404).json({ msg: "User position document not found", success: false });
      }
      const positionIndex = userPositionDoc.positions.findIndex(p => p._id.toString() === _id);
      if (positionIndex === -1) {
        return res.status(404).json({ msg: "Position not found", success: false });
      }
      userPositionDoc.positions.splice(positionIndex, 1);
      await userPositionDoc.save();
      return res.status(200).json({ msg: "Position removed successfully", success: true });
    } catch (error) {
      console.error("removeYourPosition error =>", error);
    }
  },

  getYourPosition: async (req, res) => {
    try {
      const {userId} = req.body
      if (!userId) {
        return res.status(400).json({ msg: "Missing userId", success: false });
      }
      const userPositionDoc = await AddYourPosition.findOne({ userId: userId });
      if (!userPositionDoc) {
        return res.status(404).json({ msg: "User position document not found", success: false });
      }
      return res.status(200).json({
        positions: userPositionDoc.positions,
        msg: "Positions fetched successfully",
        success: true
      });
    } catch (error) {
      console.error("getYourPosition error =>", error);
    }
  },

  addInterviewSession: async (req, res) => {
    try {
      const data = req.body

      if (!data.userId) {
        return res.status(400).json({ msg: "Missing userId", success: false })
      }

      const requiredFields = [
        "resume_name",
        "resume_id",
        "role",
        "specialization",
        "interview_expected_time"
      ]

      // for (const field of requiredFields) {
      //   if (!data[field]) {
      //     return res
      //       .status(400)
      //       .json({ msg: `Missing field: ${field}`, success: false })
      //   }
      // }

      let resumeTextContent = ""

      // If resume_id is provided, fetch the resume text
      if (data.resume_id) {
        const userResumes = await AddYourResume.findOne({ userId: data.userId })

        if (userResumes) {
          const selectedResume = userResumes.resumes.find(
            (r) => r._id.toString() === data.resume_id
          )
          if (selectedResume)
            resumeTextContent = selectedResume.textContent || ""
        }
      }

      const newSession = new AiCopilotInterviewSession({
        userId: data.userId,
        resume_name: data.resume_name,
        resume_textcontent: resumeTextContent,
        role: data.role,
        specialization: data.specialization,
        context: data.context || "",
        interview_expected_time: new Date(data.interview_expected_time),
        status: data.status || "upcoming"
      })

      await newSession.save()

      return res.status(200).json({
        session: newSession,
        sessionId: newSession.sessionId,
        msg: "Interview session added successfully",
        success: true
      })
    } catch (error) {
      console.error("addInterviewSession error =>", error)
      return res.status(500).json({
        msg: "Failed to add interview session",
        error: error.message,
        success: false
      })
    }
  },

  // Delete an AI Copilot interview session by sessionId (UUID string)
  deleteInterviewSession: async (req, res) => {
    try {
      const { sessionId } = req.body
      if (!sessionId) {
        return res
          .status(400)
          .json({ msg: "Missing sessionId", success: false })
      }

      const deleted = await AiCopilotInterviewSession.findOneAndDelete({
        sessionId
      })

      if (!deleted) {
        return res
          .status(404)
          .json({ msg: "Session not found", success: false })
      }

      return res.status(200).json({
        msg: "Interview session deleted successfully",
        success: true
      })
    } catch (error) {
      console.error("deleteInterviewSession error =>", error)
      return res.status(500).json({
        msg: "Failed to delete interview session",
        error: error.message,
        success: false
      })
    }
  },

  // Get an AI Copilot interview session by sessionId (UUID string)
  getInterviewSession: async (req, res) => {
    try {
      const { sessionId } = req.params
      if (!sessionId) {
        return res
          .status(400)
          .json({ msg: "Missing sessionId", success: false })
      }

      const session = await AiCopilotInterviewSession.findOne({ sessionId })

      if (!session) {
        return res
          .status(404)
          .json({ msg: "Session not found", success: false })
      }

      return res.status(200).json({
        session,
        msg: "Interview session fetched successfully",
        success: true
      })
    } catch (error) {
      console.error("getInterviewSession error =>", error)
      return res.status(500).json({
        msg: "Failed to fetch interview session",
        error: error.message,
        success: false
      })
    }
  },

  // Get an AI Copilot interview session by sessionId (UUID string)
  getAllInterviewSessions: async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ msg: "Missing userId", success: false });
    }

    const sessions = await AiCopilotInterviewSession.find({ userId }).sort({
      interview_expected_time: -1,
    });

    if (!sessions || sessions.length === 0) {
      return res
        .status(404)
        .json({ msg: "No sessions found for this user", success: false });
    }

    return res.status(200).json({
      sessions,
      msg: "Interview sessions fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("getAllInterviewSessions error =>", error);
    return res.status(500).json({
      msg: "Failed to fetch interview sessions",
      error: error.message,
      success: false,
    });
  }
},


  // Update status of an interview session
  updateInterviewSessionStatus: async (req, res) => {
    try {
      const { sessionId, status, conversation_history } = req.body
      if (!sessionId || !status) {
        return res.status(400).json({
          msg: "Missing sessionId or status",
          success: false
        })
      }
      
      if (!["upcoming", "completed", "active"].includes(status)) {
        return res.status(400).json({
          msg: "Invalid status. Must be 'upcoming', 'completed', or 'active'.",
          success: false
        })
      }
      
      console.log("updateSession ==========================> ", sessionId, status, conversation_history)

      // Ensure conversation_history is an array if provided
      const updateData = { status }
      if (conversation_history !== undefined) {
        updateData.conversation_history = Array.isArray(conversation_history) ? conversation_history : []
      }

      const session = await AiCopilotInterviewSession.findOne({ sessionId })
      if ( session.status === "active") {
        const updatedSession = await AiCopilotInterviewSession.findOneAndUpdate(
          { sessionId },
          { $set: updateData },
          { new: true }
        )
        
        if (!updatedSession) {
          return res.status(404).json({
            msg: "Session not found",
            success: false
          })
        }
  
        return res.status(200).json({
          session: updatedSession,
          msg: "Interview session status updated as active successfully",
          success: true
        })
      } else if (session.status === "upcoming") {
        const updatedSession = await AiCopilotInterviewSession.findOneAndUpdate(
          { sessionId },
          { $set: { status:'active' } },
          { new: true }
        )
        if (!updatedSession) {
          return res.status(404).json({
            msg: "Session not found",
            success: false
          })
        }
        
        return res.status(200).json({
          session: updatedSession,
          msg: "Interview session status updated as upcoming to active successfully",
          success: true
        })
      } else if (session.status === "completed") {
        return res.status(400).json({
          msg: "Session is already completed",
          success: false
        })
      }

    } catch (error) {
      console.error("updateInterviewSessionStatus error =>", error)
      return res.status(500).json({
        msg: "Failed to update interview session status",
        error: error.message,
        success: false
      })
    }
  },

}

module.exports = methods
