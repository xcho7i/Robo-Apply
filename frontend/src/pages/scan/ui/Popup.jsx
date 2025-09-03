import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from "@mui/material"
import { HiArrowLeft } from "react-icons/hi"
import { PiStarFourFill } from "react-icons/pi"
import { useDropzone } from "react-dropzone"
import { successToast, errorToast } from "../../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../../api/endpoints"
import DOMPurify from "dompurify"
import { useTour,aiResumeScore } from "../../../stores/tours"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const UploadResumeDialog = ({ open, onSubmit }) => {
  const [resume, setResume] = useState(null) // For uploaded resume file
  const [description, setDescription] = useState("")
  const [fileError, setFileError] = useState("") // For file validation errors
  const [jobTitleInput, setJobTitleInput] = useState("")
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const navigate = useNavigate()

    const { startModuleTourIfEligible } = useTour()
useEffect(() => {
  startModuleTourIfEligible("ai-resume-score", aiResumeScore, { showWelcome: false })
}, [startModuleTourIfEligible])

  const generateJobDescription = async () => {
    if (!jobTitleInput.trim()) {
      errorToast("Please enter a job title to generate job description.")
      return
    }

    setIsGeneratingJobDesc(true)

    try {
      const accessToken = localStorage.getItem("access_token")

      const requestBody = {
        job_title: jobTitleInput,
        job_description: "",
        job_skills: ""
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateAIJobDescription}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData.description) {
        // Convert HTML to plain text for the textarea
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = responseData.description
        const plainText = tempDiv.textContent || tempDiv.innerText || ""

        setDescription(plainText)
        successToast("Job description generated successfully!")
      } else {
        errorToast("Failed to generate job description. Please try again.")
      }
    } catch (error) {
      errorToast("Something went wrong while generating job description.")
    } finally {
      setIsGeneratingJobDesc(false)
    }
  }

  // Function to validate file type
  const validateFileType = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    ]

    const allowedExtensions = [".pdf", ".doc", ".docx"]

    // Check by MIME type first
    if (allowedTypes.includes(file.type)) {
      return true
    }

    // Fallback: check by file extension
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."))
    return allowedExtensions.includes(fileExtension)
  }

  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Clear previous errors
    setFileError("")

    // Handle rejected files (by react-dropzone)
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (
        rejection.errors.some((error) => error.code === "file-invalid-type")
      ) {
        setFileError("Please upload only PDF, DOC, or DOCX files.")
      } else if (
        rejection.errors.some((error) => error.code === "too-many-files")
      ) {
        setFileError("Please upload only one file at a time.")
      } else {
        setFileError("File upload failed. Please try again.")
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Additional validation
      if (!validateFileType(file)) {
        setFileError("Please upload only PDF, DOC, or DOCX files.")
        return
      }

      // Check file size (optional - limit to 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        setFileError("File size must be less than 10MB.")
        return
      }

      setResume(file)
      setFileError("")
      successToast("Resume uploaded successfully!")
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"]
    },
    maxFiles: 1,
    multiple: false
  })

  const handleSubmit = () => {
    if (!resume || !description) {
      errorToast("Please input all required data!")
      return
    }

    if (fileError) {
      errorToast("Please input all required data!")(
        "Please fix the file upload error before submitting."
      )
      return
    }

    localStorage.setItem("resumeScoreJobDescription", description)

    const formData = new FormData()
    formData.append("file", resume)
    formData.append("Jobdescription", description)

    onSubmit(formData) // Call the parent's API handler
  }

  useEffect(() => {
    if (open) {
      setResume(null)
      setDescription("")
      setFileError("")
      setJobTitleInput("")

      // Clear the specified localStorage keys
      const keysToRemove = [
        "resumeRecruiter_Tips",
        "resumeScoreData",
        "resumeFormatting",
        "resumeSearchability",
        "resumeParsedData",
        "resumeHardSkills",
        "resumeSoftSkills"
      ]

      keysToRemove.forEach((key) => localStorage.removeItem(key))
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent dialog from closing via backdrop click
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          backgroundColor: "#1E1E1E", // Dark background color
          borderRadius: "8px"
        }
      }}>
      <DialogTitle>
        <Typography variant="h6" style={{ color: "white" }} data-tour="ai-scan-heading">
          Create New Scan
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Job Title Input and Generate Button */}
        <Box className="mb-6">
          <Typography
            variant="subtitle1"
            className="text-[#B0B0B0] text-sm font-bold mb-2">
            Job Title
          </Typography>
          <Box className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Software Engineer"
              value={jobTitleInput}
              onChange={(e) => setJobTitleInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#2E2E2E] border border-[#424242] rounded-lg text-white placeholder:text-[#8A8A8A] outline-none focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9]"
            />
            <Box sx={{display:"flex",alignItems:"center"}} data-tour="ai-scan-generateBtn">
            <Button
              onClick={generateJobDescription}
              disabled={isGeneratingJobDesc || !jobTitleInput.trim()}
              variant="contained"
              style={{
                backgroundColor:
                  isGeneratingJobDesc || !jobTitleInput.trim()
                    ? "#6B7280"
                    : "#9A3CF9",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                minWidth: "140px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
              <PiStarFourFill size={16} />
              {isGeneratingJobDesc ? "Generating..." : "Generate"}
            </Button></Box>
          </Box>
        </Box>

        <Box className="flex flex-col md:flex-row gap-4 md:items-center" >
          {/* Resume Upload */}
          <Box className="flex-1 flex flex-col gap-2" data-tour="ai-scan-dragResume">
            <Typography
              variant="subtitle1"
              className="text-[#B0B0B0] text-sm font-bold">
              Resume
            </Typography>
            <Box
            
              {...getRootProps()}
              className={`border border-dashed border-[#5E5E5E] p-4 flex items-center justify-center rounded-lg ${
                isDragActive ? "text-[#9A3CF9] bg-[#2E2E2E]" : "text-[#B0B0B0]"
              } ${fileError ? "border-red-500" : ""} cursor-pointer h-[200px]`}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography className="text-[#9A3CF9]">
                  Drop your resume here...
                </Typography>
              ) : resume ? (
                <Typography className="text-white">
                  Uploaded: {resume.name}
                </Typography>
              ) : (
                <Typography className="w-full text-center">
                  Drag-n-drop or click to upload your resume
                  <br />
                  <span className="text-xs text-[#8A8A8A]">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </span>
                </Typography>
              )}
            </Box>

            {/* Error Message */}
            {fileError && (
              <Alert
                severity="error"
                style={{
                  backgroundColor: "#2E1618",
                  color: "#F87171",
                  border: "1px solid #991B1B"
                }}>
                {fileError}
              </Alert>
            )}
          </Box>

          {/* Job Description */}
          <Box className="flex-1 flex flex-col gap-2">
            <Typography
              variant="subtitle1"
              className="text-[#B0B0B0] text-sm font-bold">
              Job Description
            </Typography>
            <textarea
              placeholder="Job description will appear here after generation or you can type manually..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[200px] bg-[#2E2E2E] text-white rounded-lg border border-[#424242] outline-none resize-none p-3 focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9]"
              style={{
                opacity: isGeneratingJobDesc ? 0.6 : 1
              }}
              disabled={isGeneratingJobDesc}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        style={{
          padding: "16px",
          justifyContent: "end",
          gap: "1rem"
        }}>
        <Button
          onClick={() => navigate("/auto-apply")}
          style={{
            color: "#B0B0B0",
            textTransform: "none",
            fontWeight: "bold"
          }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!!fileError} // Disable submit button if there's a file error
          style={{
            backgroundColor: fileError ? "#6B7280" : "#9A3CF9",
            color: "white",
            textTransform: "none",
            fontWeight: "bold"
          }}>
          Scan
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadResumeDialog
