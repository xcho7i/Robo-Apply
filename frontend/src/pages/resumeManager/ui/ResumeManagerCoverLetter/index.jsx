import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography
} from "@mui/material"
import { PiStarFourFill } from "react-icons/pi"
import { IoMdClose } from "react-icons/io"
import { successToast, errorToast } from "../../../../components/Toast"
import API_ENDPOINTS from "../../../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const ResumeManagerCoverLetter = ({
  open,
  onClose,
  setCoverLetter,
  coverLetter
}) => {
  const [jobTitleInput, setJobTitleInput] = useState("")
  const [description, setDescription] = useState("")
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [coverLetterGenerated, setCoverLetterGenerated] = useState("")

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
      console.error("Error generating job description:", error)
      errorToast("Something went wrong while generating job description.")
    } finally {
      setIsGeneratingJobDesc(false)
    }
  }

  const generateCoverLetter = async () => {
    if (!description.trim()) {
      errorToast("Please generate or enter a job description first.")
      return
    }

    setIsGeneratingCoverLetter(true)

    try {
      const accessToken = localStorage.getItem("access_token")

      // Create FormData instead of JSON
      const formData = new FormData()
      formData.append("job_description", description)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetSimpleCoverLetter}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`
            // Remove Content-Type header to let browser set it for FormData
          },
          body: formData // Send FormData instead of JSON
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData.letterBody) {
        // Directly save to parent component without showing in modal
        setCoverLetter(responseData.letterBody)
        successToast("Cover letter generated and saved successfully!")
        handleClose() // Close modal immediately
      } else if (responseData.coverLetter) {
        setCoverLetter(responseData.coverLetter)
        successToast("Cover letter generated and saved successfully!")
        handleClose()
      } else if (responseData.cover_letter) {
        setCoverLetter(responseData.cover_letter)
        successToast("Cover letter generated and saved successfully!")
        handleClose()
      } else {
        errorToast("Failed to generate cover letter. Please try again.")
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
      errorToast("Something went wrong while generating cover letter.")
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleClose = () => {
    setJobTitleInput("")
    setDescription("")
    setCoverLetterGenerated("")
    onClose()
  }

  useEffect(() => {
    if (open) {
      setJobTitleInput("")
      setDescription("")
      setCoverLetterGenerated("") // Always reset this when opening
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          backgroundColor: "#1E1E1E",
          borderRadius: "8px",
          maxHeight: "90vh"
        }
      }}>
      <DialogTitle>
        <div className="flex justify-between items-center">
          <Typography variant="h6" style={{ color: "white" }}>
            Generate Cover Letter
          </Typography>
          <Button
            onClick={handleClose}
            style={{
              minWidth: "auto",
              padding: "4px",
              borderRadius: "50%",
              backgroundColor: "#374151"
            }}>
            <IoMdClose size={20} color="white" />
          </Button>
        </div>
      </DialogTitle>

      <DialogContent>
        {/* Job Title Input and Generate Description Button */}
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
              {isGeneratingJobDesc
                ? "Generating Job Description..."
                : "Generate Job Description"}
            </Button>
          </Box>
        </Box>

        {/* Job Description Textarea */}
        <Box className="mb-6">
          <Typography
            variant="subtitle1"
            className="text-[#B0B0B0] text-sm font-bold mb-2">
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

        {/* Generate Cover Letter Button */}
        <Box className="flex justify-center">
          <Button
            onClick={generateCoverLetter}
            disabled={isGeneratingCoverLetter || !description.trim()}
            variant="contained"
            style={{
              backgroundColor:
                isGeneratingCoverLetter || !description.trim()
                  ? "#6B7280"
                  : "#9A3CF9",
              color: "white",
              textTransform: "none",
              fontWeight: "bold",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
            <PiStarFourFill size={16} />
            {isGeneratingCoverLetter
              ? "Generating Cover Letter..."
              : "Generate Cover Letter"}
          </Button>
        </Box>

        {/* Generated Cover Letter Display */}
        {/* {coverLetterGenerated && (
          <Box className="">
            <Typography
              variant="subtitle1"
              className="text-[#B0B0B0] text-sm font-bold mb-2">
              Generated Cover Letter
            </Typography>
            <div
              className="w-full min-h-[300px] bg-[#2E2E2E] text-white rounded-lg border border-[#424242] p-4 overflow-y-auto max-h-[400px]"
              style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {coverLetterGenerated}
            </div>
          </Box>
        )} */}
      </DialogContent>

      {/* <DialogActions
        style={{
          padding: "16px",
          justifyContent: "center",
          gap: "1rem"
        }}>
        <Button
          onClick={handleClose}
          style={{
            color: "#B0B0B0",
            textTransform: "none",
            fontWeight: "bold"
          }}>
          Close
        </Button>
        {coverLetterGenerated && (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(coverLetterGenerated)
              successToast("Cover letter copied to clipboard!")
            }}
            variant="contained"
            style={{
              backgroundColor: "#10B981",
              color: "white",
              textTransform: "none",
              fontWeight: "bold",
              marginRight: "8px"
            }}>
            Copy Cover Letter
          </Button>
        )}
        {coverLetterGenerated && (
          <Button
            onClick={() => {
              setCoverLetter(coverLetterGenerated)
              successToast("Cover letter saved to resume!")
              handleClose()
            }}
            variant="contained"
            style={{
              backgroundColor: "#9A3CF9",
              color: "white",
              textTransform: "none",
              fontWeight: "bold"
            }}>
            Save & Close
          </Button>
        )}
      </DialogActions> */}
    </Dialog>
  )
}

export default ResumeManagerCoverLetter
