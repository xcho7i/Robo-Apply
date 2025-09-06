// import React, { useState, useEffect, useMemo } from "react"
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Button,
//   Box,
//   Typography,
//   Alert
// } from "@mui/material"
// import { HiArrowLeft } from "react-icons/hi"
// import { PiStarFourFill } from "react-icons/pi"
// import { useDropzone } from "react-dropzone"
// import { successToast, errorToast } from "../../../components/Toast"
// import { useNavigate } from "react-router-dom"
// import API_ENDPOINTS from "../../../api/endpoints"
// import DOMPurify from "dompurify"
// import { useTour, aiResumeScore } from "../../../stores/tours"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const UploadResumeDialog = ({ open, onSubmit }) => {
//   const [resume, setResume] = useState(null) // For uploaded resume file
//   const [description, setDescription] = useState("")
//   const [fileError, setFileError] = useState("") // For file validation errors
//   const [jobTitleInput, setJobTitleInput] = useState("")
//   const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
//   const navigate = useNavigate()

//   const { startModuleTourIfEligible } = useTour()
//   useEffect(() => {
//     startModuleTourIfEligible("ai-resume-score", aiResumeScore, {
//       showWelcome: false
//     })
//   }, [startModuleTourIfEligible])

//   const generateJobDescription = async () => {
//     if (!jobTitleInput.trim()) {
//       errorToast("Please enter a job title to generate job description.")
//       return
//     }

//     setIsGeneratingJobDesc(true)

//     try {
//       const accessToken = localStorage.getItem("access_token")

//       const requestBody = {
//         job_title: jobTitleInput,
//         job_description: "",
//         job_skills: ""
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GenerateAIJobDescription}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`
//           },
//           body: JSON.stringify(requestBody)
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const responseData = await response.json()

//       if (responseData.description) {
//         // Convert HTML to plain text for the textarea
//         const tempDiv = document.createElement("div")
//         tempDiv.innerHTML = responseData.description
//         const plainText = tempDiv.textContent || tempDiv.innerText || ""

//         setDescription(plainText)
//         successToast("Job description generated successfully!")
//       } else {
//         errorToast("Failed to generate job description. Please try again.")
//       }
//     } catch (error) {
//       errorToast("Something went wrong while generating job description.")
//     } finally {
//       setIsGeneratingJobDesc(false)
//     }
//   }

//   // Function to validate file type
//   const validateFileType = (file) => {
//     const allowedTypes = [
//       "application/pdf",
//       "application/msword", // .doc
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
//     ]

//     const allowedExtensions = [".pdf", ".doc", ".docx"]

//     // Check by MIME type first
//     if (allowedTypes.includes(file.type)) {
//       return true
//     }

//     // Fallback: check by file extension
//     const fileExtension = file.name
//       .toLowerCase()
//       .substring(file.name.lastIndexOf("."))
//     return allowedExtensions.includes(fileExtension)
//   }

//   const onDrop = (acceptedFiles, rejectedFiles) => {
//     // Clear previous errors
//     setFileError("")

//     // Handle rejected files (by react-dropzone)
//     if (rejectedFiles.length > 0) {
//       const rejection = rejectedFiles[0]
//       if (
//         rejection.errors.some((error) => error.code === "file-invalid-type")
//       ) {
//         setFileError("Please upload only PDF, DOC, or DOCX files.")
//       } else if (
//         rejection.errors.some((error) => error.code === "too-many-files")
//       ) {
//         setFileError("Please upload only one file at a time.")
//       } else {
//         setFileError("File upload failed. Please try again.")
//       }
//       return
//     }

//     if (acceptedFiles.length > 0) {
//       const file = acceptedFiles[0]

//       // Additional validation
//       if (!validateFileType(file)) {
//         setFileError("Please upload only PDF, DOC, or DOCX files.")
//         return
//       }

//       // Check file size (optional - limit to 10MB)
//       const maxSize = 10 * 1024 * 1024 // 10MB in bytes
//       if (file.size > maxSize) {
//         setFileError("File size must be less than 10MB.")
//         return
//       }

//       setResume(file)
//       setFileError("")
//       successToast("Resume uploaded successfully!")
//     }
//   }

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "application/pdf": [".pdf"],
//       "application/msword": [".doc"],
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//         [".docx"]
//     },
//     maxFiles: 1,
//     multiple: false
//   })

//   const handleSubmit = () => {
//     if (!resume || !description) {
//       errorToast("Please input all required data!")
//       return
//     }

//     if (fileError) {
//       errorToast("Please input all required data!")(
//         "Please fix the file upload error before submitting."
//       )
//       return
//     }

//     localStorage.setItem("resumeScoreJobDescription", description)

//     const formData = new FormData()
//     formData.append("file", resume)
//     formData.append("Jobdescription", description)

//     onSubmit(formData) // Call the parent's API handler
//   }

//   useEffect(() => {
//     if (open) {
//       setResume(null)
//       setDescription("")
//       setFileError("")
//       setJobTitleInput("")

//       // Clear the specified localStorage keys
//       const keysToRemove = [
//         "resumeRecruiter_Tips",
//         "resumeScoreData",
//         "resumeFormatting",
//         "resumeSearchability",
//         "resumeParsedData",
//         "resumeHardSkills",
//         "resumeSoftSkills"
//       ]

//       keysToRemove.forEach((key) => localStorage.removeItem(key))
//     }
//   }, [open])

//   return (
//     <>
//       <Dialog
//         open={open}
//         onClose={() => {}} // Prevent dialog from closing via backdrop click
//         fullWidth
//         maxWidth="md"
//         PaperProps={{
//           style: {
//             backgroundColor: "#1E1E1E", // Dark background color
//             borderRadius: "8px",
//             position: "fixed"
//           }
//         }}>
//         <DialogTitle>
//           <Typography
//             variant="h6"
//             style={{ color: "white" }}
//             data-tour="ai-scan-heading">
//             Create New Scan
//           </Typography>
//         </DialogTitle>
//         <DialogContent>
//           {/* Job Title Input and Generate Button */}
//           <Box className="mb-6">
//             <Typography
//               variant="subtitle1"
//               className="text-[#B0B0B0] text-sm font-bold mb-2">
//               Job Title
//             </Typography>
//             <Box className="md:flex space-y-2 gap-2">
//               <input
//                 type="text"
//                 placeholder="e.g., Software Engineer"
//                 value={jobTitleInput}
//                 onChange={(e) => setJobTitleInput(e.target.value)}
//                 className="flex-1 px-4 py-3 bg-[#2E2E2E] w-full border border-[#424242] rounded-lg text-white placeholder:text-[#8A8A8A] outline-none focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9]"
//               />
//               <Box
//                 sx={{ display: "flex", alignItems: "center" }}
//                 data-tour="ai-scan-generateBtn">
//                 <Button
//                   onClick={generateJobDescription}
//                   disabled={isGeneratingJobDesc || !jobTitleInput.trim()}
//                   variant="contained"
//                   style={{
//                     backgroundColor:
//                       isGeneratingJobDesc || !jobTitleInput.trim()
//                         ? "#6B7280"
//                         : "#9A3CF9",
//                     color: "white",
//                     textTransform: "none",
//                     fontWeight: "bold",
//                     minWidth: "140px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px"
//                   }}>
//                   <PiStarFourFill size={16} />
//                   {isGeneratingJobDesc ? "Generating..." : "Generate"}
//                 </Button>
//               </Box>
//             </Box>
//           </Box>

//           <Box className="flex flex-col md:flex-row gap-4 md:items-center">
//             {/* Resume Upload */}
//             <Box
//               className="flex-1 flex flex-col gap-2"
//               data-tour="ai-scan-dragResume">
//               <Typography
//                 variant="subtitle1"
//                 className="text-[#B0B0B0] text-sm font-bold">
//                 Resume
//               </Typography>
//               <Box
//                 {...getRootProps()}
//                 className={`border border-dashed border-[#5E5E5E] p-4 flex items-center justify-center rounded-lg ${
//                   isDragActive
//                     ? "text-[#9A3CF9] bg-[#2E2E2E]"
//                     : "text-[#B0B0B0]"
//                 } ${
//                   fileError ? "border-red-500" : ""
//                 } cursor-pointer h-[200px]`}>
//                 <input {...getInputProps()} />
//                 {isDragActive ? (
//                   <Typography className="text-[#9A3CF9]">
//                     Drop your resume here...
//                   </Typography>
//                 ) : resume ? (
//                   <Typography className="text-white">
//                     Uploaded: {resume.name}
//                   </Typography>
//                 ) : (
//                   <Typography className="w-full text-center">
//                     Drag-n-drop or click to upload your resume
//                     <br />
//                     <span className="text-xs text-[#8A8A8A]">
//                       Supported formats: PDF, DOC, DOCX (Max 10MB)
//                     </span>
//                   </Typography>
//                 )}
//               </Box>

//               {/* Error Message */}
//               {fileError && (
//                 <Alert
//                   severity="error"
//                   style={{
//                     backgroundColor: "#2E1618",
//                     color: "#F87171",
//                     border: "1px solid #991B1B"
//                   }}>
//                   {fileError}
//                 </Alert>
//               )}
//             </Box>

//             {/* Job Description */}
//             <Box className="flex-1 flex flex-col gap-2">
//               <Typography
//                 variant="subtitle1"
//                 className="text-[#B0B0B0] text-sm font-bold">
//                 Job Description
//               </Typography>
//               <textarea
//                 placeholder="Job description will appear here after generation or you can type manually..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="w-full h-[200px] bg-[#2E2E2E] text-white rounded-lg border border-[#424242] outline-none resize-none p-3 focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9]"
//                 style={{
//                   opacity: isGeneratingJobDesc ? 0.6 : 1
//                 }}
//                 disabled={isGeneratingJobDesc}
//               />
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions
//           style={{
//             padding: "16px",
//             justifyContent: "end",
//             gap: "1rem"
//           }}>
//           <Button
//             onClick={() => navigate("/scan-Main")}
//             style={{
//               color: "#B0B0B0",
//               textTransform: "none",
//               fontWeight: "bold"
//             }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             variant="contained"
//             disabled={!!fileError} // Disable submit button if there's a file error
//             style={{
//               backgroundColor: fileError ? "#6B7280" : "#9A3CF9",
//               color: "white",
//               textTransform: "none",
//               fontWeight: "bold"
//             }}>
//             Scan
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   )
// }

// export default UploadResumeDialog

import React, { useState, useEffect } from "react"
import { HiArrowLeft } from "react-icons/hi"
import { PiStarFourFill } from "react-icons/pi"
import { useDropzone } from "react-dropzone"
import { successToast, errorToast } from "../../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../../api/endpoints"
import DOMPurify from "dompurify"
import { useTour, aiResumeScore } from "../../../stores/tours"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const UploadResumeDialog = ({ open, onSubmit }) => {
  const [resume, setResume] = useState(null)
  const [description, setDescription] = useState("")
  const [fileError, setFileError] = useState("")
  const [jobTitleInput, setJobTitleInput] = useState("")
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const navigate = useNavigate()

  const { startModuleTourIfEligible } = useTour()
  useEffect(() => {
    startModuleTourIfEligible("ai-resume-score", aiResumeScore, {
      showWelcome: false
    })
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

  const validateFileType = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    const allowedExtensions = [".pdf", ".doc", ".docx"]

    if (allowedTypes.includes(file.type)) {
      return true
    }

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."))
    return allowedExtensions.includes(fileExtension)
  }

  const onDrop = (acceptedFiles, rejectedFiles) => {
    setFileError("")

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

      if (!validateFileType(file)) {
        setFileError("Please upload only PDF, DOC, or DOCX files.")
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
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
      errorToast("Please fix the file upload error before submitting.")
      return
    }

    localStorage.setItem("resumeScoreJobDescription", description)

    const formData = new FormData()
    formData.append("file", resume)
    formData.append("Jobdescription", description)

    onSubmit(formData)
  }

  useEffect(() => {
    if (open) {
      setResume(null)
      setDescription("")
      setFileError("")
      setJobTitleInput("")

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

  if (!open) return null

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        style={{ zIndex: 1000 }}>
        {/* Modal Container */}
        <div
          className="bg-[#1E1E1E] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-[#424242]">
            <h2
              className="text-xl font-semibold text-white"
              data-tour="ai-scan-heading">
              Create New Scan
            </h2>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            {/* Job Title Input and Generate Button */}
            <div className="mb-6">
              <label className="block text-[#B0B0B0] text-sm font-bold mb-2">
                Job Title
              </label>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#2E2E2E] border border-[#424242] rounded-lg text-white placeholder:text-[#8A8A8A] outline-none focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9]"
                />
                <div
                  className="flex items-center"
                  data-tour="ai-scan-generateBtn">
                  <button
                    onClick={generateJobDescription}
                    disabled={isGeneratingJobDesc || !jobTitleInput.trim()}
                    className={`px-6 py-3 rounded-lg font-bold text-white min-w-[140px] flex items-center justify-center gap-2 transition-colors ${
                      isGeneratingJobDesc || !jobTitleInput.trim()
                        ? "bg-[#6B7280] cursor-not-allowed"
                        : "bg-[#9A3CF9] hover:bg-[#8B2CF7] cursor-pointer"
                    }`}>
                    <PiStarFourFill size={16} />
                    {isGeneratingJobDesc ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Resume Upload Section */}
              <div className="flex-1" data-tour="ai-scan-dragResume">
                <label className="block text-[#B0B0B0] text-sm font-bold mb-2">
                  Resume
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors min-h-[200px] flex items-center justify-center ${
                    isDragActive
                      ? "border-[#9A3CF9] bg-[#2E2E2E] text-[#9A3CF9]"
                      : fileError
                      ? "border-red-500 text-[#B0B0B0]"
                      : "border-[#5E5E5E] text-[#B0B0B0] hover:border-[#9A3CF9]"
                  }`}>
                  <input {...getInputProps()} />
                  <div>
                    {isDragActive ? (
                      <p className="text-[#9A3CF9]">Drop your resume here...</p>
                    ) : resume ? (
                      <div className="text-white">
                        <p className="font-semibold">
                          ✓ File uploaded successfully!
                        </p>
                        <p className="text-sm text-[#B0B0B0] mt-1">
                          {resume.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg mb-2">📄 Upload Your Resume</p>
                        <p>Drag-n-drop or click to browse</p>
                        <p className="text-xs text-[#8A8A8A] mt-2">
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Error Message */}
                {fileError && (
                  <div className="mt-3 p-3 bg-[#2E1618] border border-[#991B1B] rounded-lg">
                    <p className="text-[#F87171] text-sm">⚠️ {fileError}</p>
                  </div>
                )}
              </div>

              {/* Job Description Section */}
              <div className="flex-1">
                <label className="block text-[#B0B0B0] text-sm font-bold mb-2">
                  Job Description
                </label>
                <textarea
                  placeholder="Job description will appear here after generation or you can type manually..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isGeneratingJobDesc}
                  className="w-full h-[200px] bg-[#2E2E2E] text-white rounded-lg border border-[#424242] outline-none resize-none p-3 focus:border-[#9A3CF9] focus:ring-1 focus:ring-[#9A3CF9] disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-[#424242] flex justify-end gap-4">
            <button
              onClick={() => navigate("/scan-Main")}
              className="px-6 py-2 text-[#B0B0B0] font-bold hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!!fileError}
              className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                fileError
                  ? "bg-[#6B7280] cursor-not-allowed"
                  : "bg-[#9A3CF9] hover:bg-[#8B2CF7] cursor-pointer"
              }`}>
              Scan
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default UploadResumeDialog
