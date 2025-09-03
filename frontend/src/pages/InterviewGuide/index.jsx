// import React, { useState, useEffect, useRef, useMemo } from "react"
// import DashBoardLayout from "../../dashboardLayout"
// import {
//   FaChevronLeft,
//   FaRegThumbsUp,
//   FaSearch,
//   FaArrowRight,
//   FaSave
// } from "react-icons/fa"
// import { IoMdClose } from "react-icons/io"
// import Button from "../../components/Button"
// import regenerateIcon from "../../assets/generateAiCoverLetterIcons/reGenerateIcon.svg"
// import copyIcon from "../../assets/generateAiCoverLetterIcons/copyIcon.svg"
// import TextAreaComponent from "../../components/TextAreaComponent"
// import SimpleInputField from "../../components/SimpleInputFields"
// import aiIcon from "../../assets/generateAiCoverLetterIcons/aiIcon.svg"
// import userIcon from "../../assets/generateAiCoverLetterIcons/youIcon.svg"
// import { errorToast, successToast } from "../../components/Toast"
// import API_ENDPOINTS from "../../api/endpoints"
// import CircularIndeterminate from "../../components/loader/circular"
// import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
// import { PiStarFourFill } from "react-icons/pi"
// import DOMPurify from "dompurify"
// import ElegantLoader from "../resumeBuilder/ui/BridgeLoader"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const InterviewGuide = () => {
//   const [selectedResume, setSelectedResume] = useState("")
//   const [jobDescription, setJobDescription] = useState("")
//   const [aiResponse, setAiResponse] = useState("")
//   const [userResponse, setUserResponse] = useState("")
//   const [conversationHistory, setConversationHistory] = useState([])
//   const [showResponse, setShowResponse] = useState(false)
//   const [uploadedResumeName, setUploadedResumeName] = useState(null)
//   const [resumeOptions, setResumeOptions] = useState([])
//   const [isLoadingResumes, setIsLoadingResumes] = useState(false)
//   const [uploadedFile, setUploadedFile] = useState(null)
//   const [uploadedFilePath, setUploadedFilePath] = useState(null)
//   const [loadingLoader, setLoadingLoader] = useState(false)
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false)

//   // AI Job Description Modal States
//   const [showJobDescModal, setShowJobDescModal] = useState(false)
//   const [jobTitleInput, setJobTitleInput] = useState("")
//   const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
//   const [generatedJobDesc, setGeneratedJobDesc] = useState("")

//   const fileInputRef = useRef(null)

//   useEffect(() => {
//     fetchResumesForSelect()
//   }, [])

//   // Function to save chat history
//   const handleSaveHistory = () => {
//     if (
//       !showResponse ||
//       ((!aiResponse || aiResponse.length === 0) &&
//         conversationHistory.length === 0)
//     ) {
//       errorToast("No chat history to save!")
//       return
//     }

//     // Prepare the complete chat history
//     const completeHistory = {
//       timestamp: new Date().toISOString(),
//       resumeUsed:
//         uploadedResumeName ||
//         resumeOptions.find((option) => option.id === selectedResume)?.label ||
//         "Unknown",
//       jobDescription: jobDescription,
//       initialInterviewGuide: aiResponse,
//       conversationHistory: conversationHistory,
//       totalQuestions:
//         (Array.isArray(aiResponse) ? aiResponse.length : 0) +
//         conversationHistory.length
//     }

//     console.log("Complete History Object:", completeHistory)

//     // Save to localStorage as well (optional)
//     try {
//       const savedHistories = JSON.parse(
//         localStorage.getItem("interviewGuideHistories") || "[]"
//       )
//       savedHistories.push(completeHistory)
//       localStorage.setItem(
//         "interviewGuideHistories",
//         JSON.stringify(savedHistories)
//       )

//       successToast(
//         "Chat history saved successfully! Check console for details."
//       )
//     } catch (error) {
//       console.error("Error saving to localStorage:", error)
//       successToast("Chat history logged to console!")
//     }
//   }

//   // Sanitize the generated job description for safe HTML rendering
//   const sanitizedJobDesc = useMemo(() => {
//     if (!generatedJobDesc) return ""
//     return DOMPurify.sanitize(generatedJobDesc)
//   }, [generatedJobDesc])

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
//         setGeneratedJobDesc(responseData.description)
//         successToast("Job description generated successfully!")
//       } else {
//         errorToast("Failed to generate job description. Please try again.")
//       }
//     } catch (error) {
//       console.error("Error generating job description:", error)
//       errorToast("Something went wrong while generating job description.")
//     } finally {
//       setIsGeneratingJobDesc(false)
//     }
//   }

//   const handleUseGeneratedJobDesc = () => {
//     setJobDescription(generatedJobDesc)
//     setShowJobDescModal(false)
//     setJobTitleInput("")
//     setGeneratedJobDesc("")
//     successToast("Job description added successfully!")
//   }

//   const handleCloseModal = () => {
//     setShowJobDescModal(false)
//     setJobTitleInput("")
//     setGeneratedJobDesc("")
//     setIsGeneratingJobDesc(false)
//   }

//   const handleFileInputClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click()
//     }
//   }

//   const uploadFile = async (file) => {
//     if (!file) {
//       errorToast("Please upload a file.")
//       return null
//     }
//     setLoadingLoader(true)
//     const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
//     try {
//       const formData = new FormData()
//       formData.append("files", file)

//       const response = await fetch(fullUrl, {
//         method: "POST",
//         body: formData
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || "File upload failed!")
//       }

//       if (data.success && data.files && data.files.length > 0) {
//         const fileUrlPath = data.files[0].urlPath
//         localStorage.setItem("resumeUrlPath", fileUrlPath)
//         successToast("File uploaded successfully!")
//         return fileUrlPath
//       } else {
//         errorToast(data.message || "File upload failed!")
//         return null
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error)
//       errorToast(error.message || "Error uploading file.")
//       return null
//     } finally {
//       setLoadingLoader(false)
//     }
//   }

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0]
//     if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
//       setUploadedFile(file)
//       setUploadedResumeName(file.name)

//       const uploadedPath = await uploadFile(file)
//       if (uploadedPath) {
//         setUploadedFilePath(uploadedPath)
//       } else {
//         setUploadedFile(null)
//         setUploadedResumeName(null)
//         setUploadedFilePath(null)
//         if (fileInputRef.current) {
//           fileInputRef.current.value = null
//         }
//       }
//     } else {
//       errorToast("Please upload a PDF, DOC, or DOCX file.")
//       e.target.value = null
//     }
//   }

//   const handleGenerateClick = async () => {
//     console.log("Job Description:", jobDescription)
//     console.log("Selected Resume (ID):", selectedResume)
//     console.log("Uploaded Resume File Path:", uploadedFilePath)

//     if (!selectedResume && !uploadedFilePath) {
//       errorToast("Please either select a resume or upload a resume!")
//       return
//     }

//     if (!jobDescription) {
//       errorToast("Please enter the job description!")
//       return
//     }

//     const token = localStorage.getItem("access_token")
//     if (!token) {
//       errorToast("Please log in to continue.")
//       return
//     }

//     setLoadingLoader(true)

//     try {
//       // Step 1: Check subscription credits
//       const subRes = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.SubscriptionData}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       )

//       if (!subRes.ok) {
//         throw new Error("Failed to fetch subscription data.")
//       }

//       const subData = await subRes.json()
//       const monthlyCredits =
//         subData?.subscription?.remaining?.monthlyCredits ?? 0

//       if (monthlyCredits < 15) {
//         setShowUpgradeModal(true)
//         setLoadingLoader(false)
//         return
//       }

//       // Step 2: Proceed with generating interview guide
//       const formData = new FormData()
//       formData.append("description", jobDescription)

//       if (uploadedFilePath) {
//         formData.append("url", uploadedFilePath)
//       } else if (selectedResume) {
//         formData.append("resume_id", selectedResume)
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GenerateInterviewGuide}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`
//           },
//           body: formData
//         }
//       )

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to generate interview guide")
//       }

//       // Expecting `data.interviewGuide` array in response
//       setAiResponse(data.interviewGuide || [])
//       setConversationHistory([]) // Reset conversation history for new generation
//       setShowResponse(true)
//       successToast("Interview guide generated successfully!")
//     } catch (error) {
//       console.error("Error generating interview guide:", error)
//       errorToast(error.message || "Error generating interview guide.")
//     } finally {
//       setLoadingLoader(false)
//     }
//   }

//   const handleUserResponseSubmit = async () => {
//     if (userResponse.trim() === "") {
//       errorToast("Please enter a question before submitting!")
//       return
//     }

//     const currentQuestion = userResponse
//     setUserResponse("") // Clear input
//     setLoadingLoader(true)

//     try {
//       // Prepare historical questions including the initial AI response and conversation history
//       const historicalQuestions = [
//         ...aiResponse, // Initial interview guide questions
//         ...conversationHistory // Previous conversation Q&As
//       ]

//       const formData = new FormData()
//       formData.append(
//         "historical_questions",
//         JSON.stringify(historicalQuestions)
//       )
//       formData.append("question", currentQuestion)

//       const token = localStorage.getItem("access_token")

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.InterviewGuideQuestions}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`
//           },
//           body: formData
//         }
//       )

//       const result = await response.json()
//       const queryRes = result?.["Query Response"]

//       if (!response.ok || !queryRes?.Question || !queryRes?.Answer) {
//         throw new Error("Invalid response from server.")
//       }

//       // Create new conversation entry
//       const newConversationEntry = {
//         Question: currentQuestion,
//         Answer: queryRes.Answer,
//         type: "conversation" // To distinguish from initial interview guide
//       }

//       // Update conversation history
//       setConversationHistory((prev) => [...prev, newConversationEntry])
//     } catch (error) {
//       console.error("Error:", error)
//       errorToast(error.message || "Error getting response.")
//     } finally {
//       setLoadingLoader(false)
//     }
//   }

//   const handleRegenerateClick = () => {
//     setSelectedResume("")
//     setJobDescription("")
//     setAiResponse("")
//     setUserResponse("")
//     setConversationHistory([])
//     setShowResponse(false)
//     setUploadedResumeName("")
//     setUploadedFile(null)
//     setUploadedFilePath(null)

//     if (fileInputRef.current) {
//       fileInputRef.current.value = null
//     }
//   }

//   const fetchResumesForSelect = async () => {
//     setIsLoadingResumes(true)
//     const token = localStorage.getItem("access_token")

//     if (!token) {
//       errorToast("You are not authorized.")
//       setIsLoadingResumes(false)
//       return
//     }

//     try {
//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GetAllResumes}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       )

//       const result = await response.json()

//       if (response.ok && result.success && result.resumes?.docs) {
//         const formatted = result.resumes.docs.map((doc) => ({
//           id: doc._id,
//           label: doc.resumeName
//         }))
//         setResumeOptions(formatted)
//       } else {
//         throw new Error("Unexpected response structure")
//       }
//     } catch (error) {
//       errorToast("Failed to load resumes")
//     } finally {
//       setIsLoadingResumes(false)
//     }
//   }

//   return (
//     <>
//       {loadingLoader && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
//           <CircularIndeterminate />
//         </div>
//       )}

//       {/* AI Job Description Modal */}
//       {showJobDescModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[90%] md:max-w-[50%] relative border max-h-[90vh] overflow-y-auto">
//             <Button
//               onClick={handleCloseModal}
//               className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
//               <IoMdClose size={24} />
//             </Button>

//             <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4">
//               Generate AI Job Description
//             </h2>

//             <div className="space-y-4">
//               <SimpleInputField
//                 label="Job Title*"
//                 placeholder="e.g., Software Engineer"
//                 value={jobTitleInput}
//                 onChange={(e) => setJobTitleInput(e.target.value)}
//               />

//               {/* Show loader, generated content, or generate button */}
//               {isGeneratingJobDesc ? (
//                 <div className="min-h-[120px] border border-formBorders rounded-md bg-dropdownBackground flex items-center justify-center">
//                   <ElegantLoader />
//                 </div>
//               ) : generatedJobDesc ? (
//                 <div className="space-y-3">
//                   <label className="block text-primary">
//                     Generated Job Description:
//                   </label>
//                   <div
//                     className="ai-job-desc-display"
//                     style={{
//                       backgroundColor: "rgba(251, 251, 251, 0.08)",
//                       border: "2px dashed rgba(251, 251, 251, 0.2)",
//                       borderRadius: "8px",
//                       padding: "16px",
//                       minHeight: "120px",
//                       color: "#ffffff",
//                       overflowY: "auto",
//                       maxHeight: "300px"
//                     }}
//                     dangerouslySetInnerHTML={{ __html: sanitizedJobDesc }}
//                   />
//                 </div>
//               ) : (
//                 <div className="text-center">
//                   <p className="text-gray-300 mb-4">
//                     Enter a job title to generate a comprehensive job
//                     description
//                   </p>
//                 </div>
//               )}

//               <div className="flex justify-end space-x-4 pt-4">
//                 <Button
//                   onClick={handleCloseModal}
//                   className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-32 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
//                   Cancel
//                 </Button>

//                 {!generatedJobDesc ? (
//                   <Button
//                     onClick={generateJobDescription}
//                     disabled={isGeneratingJobDesc || !jobTitleInput.trim()}
//                     className={`p-3 px-6 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg
//                       bg-gradient-to-b from-gradientStart to-gradientEnd
//                       hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
//                       disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:hover:ring-0`}>
//                     <PiStarFourFill size={16} />
//                     <span>
//                       {isGeneratingJobDesc ? "Generating..." : "Generate"}
//                     </span>
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={handleUseGeneratedJobDesc}
//                     className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-32 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
//                     Use This
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <DashBoardLayout>
//         <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
//           <div className="w-full px-5 md:px-10">
//             <div className="pb-10 pt-10 flex justify-between items-center gap-5">
//               <p className="md:text-lg font-light text-primary">
//                 Choose a resume as the source of information to answer questions
//               </p>
//               <div className="flex gap-2">
//                 <Button
//                   onClick={handleRegenerateClick}
//                   className="p-1 md:p-2 bg-blue h-10 w-10 flex items-center justify-center hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition duration-300">
//                   <img
//                     src={regenerateIcon}
//                     className="w-6 h-6"
//                     alt="Regenerate"
//                     loading="lazy"
//                   />
//                 </Button>
//                 <Button className="p-2 bg-primary h-10 flex items-center justify-center hover:bg-primary-dark hover:shadow-lg transform hover:scale-105 transition duration-300">
//                   <img
//                     src={copyIcon}
//                     className="w-6 h-6"
//                     alt="Copy"
//                     loading="lazy"
//                   />
//                 </Button>
//                 {/* Save History Button */}
//                 {showResponse && (
//                   <Button
//                     onClick={handleSaveHistory}
//                     className="p-2 bg-purpleBackground h-10 flex items-center justify-center hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition duration-300"
//                     title="Save Chat History">
//                     <FaSave className="w-5 h-5 text-Black" />
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className="w-full">
//               <div className="pb-5">
//                 <select
//                   value={selectedResume}
//                   onChange={(e) => setSelectedResume(e.target.value)}
//                   className="block w-full md:w-[80%] bg-dropdownBackground text-primary border border-formBorders py-3 px-3 rounded-md shadow-sm">
//                   <option
//                     className="text-primary bg-inputBackGround"
//                     value=""
//                     disabled>
//                     {isLoadingResumes ? "Loading resumes..." : "Select Resume"}
//                   </option>
//                   {resumeOptions.map((option) => (
//                     <option
//                       className="text-primary bg-inputBackGround"
//                       key={option.id}
//                       value={option.id}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="pb-5">
//                 {uploadedResumeName ? (
//                   <p className="text-lg text-primary">
//                     <strong>Uploaded Resume:</strong> {uploadedResumeName}
//                   </p>
//                 ) : (
//                   <>
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       style={{ display: "none" }}
//                     />
//                     <Button
//                       onClick={handleFileInputClick}
//                       className="px-4 py-3 min-w-max flex gap-3 items-center justify-center text-lg text-primary font-semibold hover:text-primary">
//                       Upload Resume
//                     </Button>
//                   </>
//                 )}
//               </div>

//               {/* Job Description Section with AI Generate Button */}
//               <div className="pb-10 w-full md:w-[80%]">
//                 <div className="flex w-full justify-between items-center mb-2">
//                   <label className="text-primary text-lg font-medium">
//                     Job Description
//                   </label>
//                   <Button
//                     onClick={() => setShowJobDescModal(true)}
//                     className={`p-2 px-3 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg
//                       bg-gradient-to-b from-gradientStart to-gradientEnd
//                       hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd`}>
//                     <PiStarFourFill size={16} />
//                     <span>Generate with AI</span>
//                   </Button>
//                 </div>

//                 {/* Custom Job Description Display/Input */}
//                 {jobDescription && jobDescription.includes("<ul>") ? (
//                   <div className="space-y-3">
//                     <div
//                       className="w-full p-3 text-base text-primary border border-formBorders rounded bg-dropdownBackground min-h-[120px] overflow-y-auto max-h-[300px]"
//                       style={{
//                         backgroundColor: "rgba(251, 251, 251, 0.08)",
//                         border: "2px solid rgba(251, 251, 251, 0.2)",
//                         borderRadius: "8px",
//                         padding: "16px",
//                         color: "#ffffff",
//                         lineHeight: "1.5"
//                       }}
//                       dangerouslySetInnerHTML={{
//                         __html: DOMPurify.sanitize(jobDescription)
//                       }}
//                     />
//                     <div className="flex justify-end">
//                       <Button
//                         onClick={() => setJobDescription("")}
//                         className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
//                         Clear
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <textarea
//                     className="w-full p-3 text-base text-primary placeholder:text-primary border border-formBorders rounded bg-dropdownBackground resize-none min-h-[120px]"
//                     rows="5"
//                     placeholder="Add Job Description or click the button above to generate with AI..."
//                     value={jobDescription}
//                     onChange={(e) => setJobDescription(e.target.value)}
//                   />
//                 )}
//               </div>

//               {!showResponse && (
//                 <div className="pb-10">
//                   <Button
//                     onClick={handleGenerateClick}
//                     className="px-4 py-3 bg-gradient-to-b min-w-max flex gap-3 w-40 items-center justify-center text-base md:text-xl font-semibold from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
//                     Generate
//                     <FaRegThumbsUp />
//                   </Button>
//                 </div>
//               )}

//               {showResponse && (
//                 <div className="bg-inputBackGround w-full md:w-[80%] md:px-4 py-4 mb-10 overflow-y-auto rounded-lg">
//                   {/* Initial AI Interview Guide Response */}
//                   <div className="p-3 space-y-5">
//                     <div className="flex gap-4">
//                       <img
//                         src={aiIcon}
//                         alt="AI"
//                         className="w-6 h-6"
//                         loading="lazy"
//                       />
//                       <p className="items-center text-primary text-xl font-medium">
//                         AI-JOBS Reply
//                       </p>
//                     </div>

//                     {Array.isArray(aiResponse) && aiResponse.length > 0 ? (
//                       aiResponse.map((item, index) => (
//                         <div key={index} className="p-4 ">
//                           <p className="text-primary text-justify font-semibold mb-2">
//                             Q{index + 1}: {item.Question}
//                           </p>
//                           <p className="text-primary text-justify">
//                             <span className="font-semibold ">Ans:</span>{" "}
//                             {item.Answer}
//                           </p>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-gray-500">No response yet.</p>
//                     )}
//                   </div>

//                   {/* Conversation History */}
//                   {conversationHistory.map((conversation, index) => (
//                     <div key={`conversation-${index}`}>
//                       {/* User Question */}
//                       <div className="p-3 space-y-2 border-t border-gray-600 mt-4">
//                         <div className="flex gap-4">
//                           <img
//                             src={userIcon}
//                             alt="User"
//                             className="w-6 h-6"
//                             loading="lazy"
//                           />
//                           <p className="items-center text-primary text-xl font-medium">
//                             You
//                           </p>
//                         </div>
//                         <div className="px-4 ">
//                           <p className="text-primary font-semibold mb-2">
//                             {conversation.Question}
//                           </p>
//                         </div>
//                       </div>

//                       {/* AI Response */}
//                       <div className="p-3 space-y-2">
//                         <div className="flex gap-4">
//                           <img
//                             src={aiIcon}
//                             alt="AI"
//                             className="w-6 h-6"
//                             loading="lazy"
//                           />
//                           <p className="items-center text-primary text-xl font-medium">
//                             AI-JOBS Reply
//                           </p>
//                         </div>
//                         <div className="px-4 py-2">
//                           <p className="text-primary text-justify">
//                             {conversation.Answer}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {showResponse && (
//                 <div className="pb-16 sm:mb-10 md:pb-40 flex gap-4 w-full md:w-[80%] items-center">
//                   <div className="relative flex-1">
//                     <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
//                     <input
//                       type="text"
//                       placeholder="Type your question..."
//                       className="w-full pl-10 text-primary text-lg placeholder:text-primary pr-10 py-5 bg-inputBackGround rounded-lg border border-customGray focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                       value={userResponse}
//                       onChange={(e) => setUserResponse(e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           handleUserResponseSubmit()
//                         }
//                       }}
//                     />
//                     <Button onClick={handleUserResponseSubmit}>
//                       <FaArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary cursor-pointer" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <UpgradePlanModal
//               isOpen={showUpgradeModal}
//               onClose={() => {
//                 setShowUpgradeModal(false)
//                 // Navigate to desired page or close modal
//               }}
//               context="interviewGuide"
//             />
//           </div>
//         </div>
//       </DashBoardLayout>
//     </>
//   )
// }

// export default InterviewGuide

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import DashBoardLayout from "../../dashboardLayout"
import {
  FaChevronLeft,
  FaRegThumbsUp,
  FaSearch,
  FaArrowRight,
  FaSave
} from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import Button from "../../components/Button"
import regenerateIcon from "../../assets/generateAiCoverLetterIcons/reGenerateIcon.svg"
import copyIcon from "../../assets/generateAiCoverLetterIcons/copyIcon.svg"
import TextAreaComponent from "../../components/TextAreaComponent"
import SimpleInputField from "../../components/SimpleInputFields"
import aiIcon from "../../assets/generateAiCoverLetterIcons/aiIcon.svg"
import userIcon from "../../assets/generateAiCoverLetterIcons/youIcon.svg"
import { errorToast, successToast } from "../../components/Toast"
import API_ENDPOINTS from "../../api/endpoints"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import { PiStarFourFill } from "react-icons/pi"
import DOMPurify from "dompurify"
import ElegantLoader from "../resumeBuilder/ui/BridgeLoader"
import { RefreshWarningModal, SaveSessionWarningModal } from "./ui/Modals"
import CircularIndeterminate from "../../components/loader/circular"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const InterviewGuide = () => {
  const [selectedResume, setSelectedResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [userResponse, setUserResponse] = useState("")
  const [conversationHistory, setConversationHistory] = useState([])
  const [showResponse, setShowResponse] = useState(false)
  const [uploadedResumeName, setUploadedResumeName] = useState(null)
  const [resumeOptions, setResumeOptions] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFilePath, setUploadedFilePath] = useState(null)
  const [loadingLoader, setLoadingLoader] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Session Warning Modal States
  const [showSaveWarningModal, setShowSaveWarningModal] = useState(false)
  const [showRefreshWarningModal, setShowRefreshWarningModal] = useState(false)

  // AI Job Description Modal States
  const [showJobDescModal, setShowJobDescModal] = useState(false)
  const [jobTitleInput, setJobTitleInput] = useState("")
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const [generatedJobDesc, setGeneratedJobDesc] = useState("")

  const fileInputRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchResumesForSelect()

    // Add beforeunload event listener for page refresh/close warning
    const handleBeforeUnload = (e) => {
      if (showResponse && (aiResponse || conversationHistory.length > 0)) {
        e.preventDefault()
        e.returnValue = "" // Required for Chrome
        return "" // Required for older browsers
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [showResponse, aiResponse, conversationHistory])

  // Function to save chat history with modal confirmation
  const handleSaveHistoryClick = () => {
    if (
      !showResponse ||
      ((!aiResponse || aiResponse.length === 0) &&
        conversationHistory.length === 0)
    ) {
      errorToast("No chat history to save!")
      return
    }
    setShowSaveWarningModal(true)
  }

  const handleConfirmSave = async () => {
    // Prepare the complete chat history
    const completeHistory = {
      timestamp: new Date().toISOString(),
      resumeUsed:
        uploadedResumeName ||
        resumeOptions.find((option) => option.id === selectedResume)?.label ||
        "Unknown",
      jobDescription: jobDescription,
      initialInterviewGuide: aiResponse,
      conversationHistory: conversationHistory,
      totalQuestions:
        (Array.isArray(aiResponse) ? aiResponse.length : 0) +
        conversationHistory.length
    }

    setShowSaveWarningModal(false)
    setLoadingLoader(true)

    try {
      const token = localStorage.getItem("access_token")

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.PostInterviewGuide}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(completeHistory)
        }
      )

      if (!response.ok) {
        throw new Error("Failed to save interview guide")
      }

      const data = await response.json()

      // Check if the response indicates success
      if (data.success) {
        successToast(data.msg || "Chat history saved successfully!")

        // End the session by resetting all states
        setSelectedResume("")
        setJobDescription("")
        setAiResponse("")
        setUserResponse("")
        setConversationHistory([])
        setShowResponse(false)
        setUploadedResumeName("")
        setUploadedFile(null)
        setUploadedFilePath(null)

        if (fileInputRef.current) {
          fileInputRef.current.value = null
        }

        // Navigate to main interview guide page
        navigate("/main-interview-Guide")
      } else {
        throw new Error(data.msg || "Failed to save interview guide")
      }
    } catch (error) {
      console.error("Error saving interview guide:", error)
      errorToast(error.message || "Failed to save chat history!")
    } finally {
      setLoadingLoader(false)
    }
  }

  // Sanitize the generated job description for safe HTML rendering
  const sanitizedJobDesc = useMemo(() => {
    if (!generatedJobDesc) return ""
    return DOMPurify.sanitize(generatedJobDesc)
  }, [generatedJobDesc])

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
        setGeneratedJobDesc(responseData.description)
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

  const handleUseGeneratedJobDesc = () => {
    setJobDescription(generatedJobDesc)
    setShowJobDescModal(false)
    setJobTitleInput("")
    setGeneratedJobDesc("")
    successToast("Job description added successfully!")
  }

  const handleCloseModal = () => {
    setShowJobDescModal(false)
    setJobTitleInput("")
    setGeneratedJobDesc("")
    setIsGeneratingJobDesc(false)
  }

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const uploadFile = async (file) => {
    if (!file) {
      errorToast("Please upload a file.")
      return null
    }
    setLoadingLoader(true)
    const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "File upload failed!")
      }

      if (data.success && data.files && data.files.length > 0) {
        const fileUrlPath = data.files[0].urlPath
        localStorage.setItem("resumeUrlPath", fileUrlPath)
        successToast("File uploaded successfully!")
        return fileUrlPath
      } else {
        errorToast(data.message || "File upload failed!")
        return null
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      errorToast(error.message || "Error uploading file.")
      return null
    } finally {
      setLoadingLoader(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
      setUploadedFile(file)
      setUploadedResumeName(file.name)

      const uploadedPath = await uploadFile(file)
      if (uploadedPath) {
        setUploadedFilePath(uploadedPath)
      } else {
        setUploadedFile(null)
        setUploadedResumeName(null)
        setUploadedFilePath(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = null
        }
      }
    } else {
      errorToast("Please upload a PDF, DOC, or DOCX file.")
      e.target.value = null
    }
  }

  const handleGenerateClick = async () => {
    console.log("Job Description:", jobDescription)
    console.log("Selected Resume (ID):", selectedResume)
    console.log("Uploaded Resume File Path:", uploadedFilePath)

    if (!selectedResume && !uploadedFilePath) {
      errorToast("Please either select a resume or upload a resume!")
      return
    }

    if (!jobDescription) {
      errorToast("Please enter the job description!")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      errorToast("Please log in to continue.")
      return
    }

    setLoadingLoader(true)

    try {
      // Step 1: Check subscription credits
      const subRes = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SubscriptionData}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!subRes.ok) {
        throw new Error("Failed to fetch subscription data.")
      }

      const subData = await subRes.json()
      const monthlyCredits =
        subData?.subscription?.remaining?.monthlyCredits ?? 0

      if (monthlyCredits < 15) {
        setShowUpgradeModal(true)
        setLoadingLoader(false)
        return
      }

      // Step 2: Proceed with generating interview guide
      const formData = new FormData()
      formData.append("description", jobDescription)

      if (uploadedFilePath) {
        formData.append("url", uploadedFilePath)
      } else if (selectedResume) {
        formData.append("resume_id", selectedResume)
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateInterviewGuide}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate interview guide")
      }

      // Wait for minimum 7.5 seconds (time for all 3 stages to complete)
      setTimeout(() => {
        // Expecting `data.interviewGuide` array in response
        setAiResponse(data.interviewGuide || [])
        setConversationHistory([]) // Reset conversation history for new generation
        setShowResponse(true)
        setLoadingLoader(false)
        successToast("Interview guide generated successfully!")
      }, 7500) // 7.5 seconds minimum loading time
    } catch (error) {
      console.error("Error generating interview guide:", error)
      setTimeout(() => {
        setLoadingLoader(false)
        errorToast(error.message || "Error generating interview guide.")
      }, 7500)
    }
  }

  const handleUserResponseSubmit = async () => {
    if (userResponse.trim() === "") {
      errorToast("Please enter a question before submitting!")
      return
    }

    const currentQuestion = userResponse
    setUserResponse("") // Clear input
    setLoadingLoader(true)

    try {
      // Prepare historical questions including the initial AI response and conversation history
      const historicalQuestions = [
        ...aiResponse, // Initial interview guide questions
        ...conversationHistory // Previous conversation Q&As
      ]

      const formData = new FormData()
      formData.append(
        "historical_questions",
        JSON.stringify(historicalQuestions)
      )
      formData.append("question", currentQuestion)

      const token = localStorage.getItem("access_token")

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.InterviewGuideQuestions}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const result = await response.json()
      const queryRes = result?.["Query Response"]

      if (!response.ok || !queryRes?.Question || !queryRes?.Answer) {
        throw new Error("Invalid response from server.")
      }

      // Create new conversation entry
      const newConversationEntry = {
        Question: currentQuestion,
        Answer: queryRes.Answer,
        type: "conversation" // To distinguish from initial interview guide
      }

      // Update conversation history
      setConversationHistory((prev) => [...prev, newConversationEntry])
    } catch (error) {
      console.error("Error:", error)
      errorToast(error.message || "Error getting response.")
    } finally {
      setLoadingLoader(false)
    }
  }

  const handleRegenerateClick = () => {
    if (showResponse && (aiResponse || conversationHistory.length > 0)) {
      setShowRefreshWarningModal(true)
    } else {
      performReset()
    }
  }

  const performReset = () => {
    setSelectedResume("")
    setJobDescription("")
    setAiResponse("")
    setUserResponse("")
    setConversationHistory([])
    setShowResponse(false)
    setUploadedResumeName("")
    setUploadedFile(null)
    setUploadedFilePath(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const handleConfirmReset = () => {
    performReset()
    setShowRefreshWarningModal(false)
  }

  const fetchResumesForSelect = async () => {
    setIsLoadingResumes(true)
    const token = localStorage.getItem("access_token")

    if (!token) {
      errorToast("You are not authorized.")
      setIsLoadingResumes(false)
      return
    }

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetAllResumes}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (response.ok && result.success && result.resumes?.docs) {
        const formatted = result.resumes.docs.map((doc) => ({
          id: doc._id,
          label: doc.resumeName
        }))
        setResumeOptions(formatted)
      } else {
        throw new Error("Unexpected response structure")
      }
    } catch (error) {
      errorToast("Failed to load resumes")
    } finally {
      setIsLoadingResumes(false)
    }
  }

  return (
    <>
      {/* Loader Overlay with CreateCoverLetterBar */}
      {loadingLoader && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          {/* <div className="bg-almostBlack p-8 rounded-lg border border-primary w-96"> */}
          <CircularIndeterminate />
          {/* <CreateCoverLetterBar /> */}
          {/* </div> */}
        </div>
      )}

      {/* Session Warning Modals */}
      <SaveSessionWarningModal
        isOpen={showSaveWarningModal}
        onClose={() => setShowSaveWarningModal(false)}
        onConfirm={handleConfirmSave}
      />

      <RefreshWarningModal
        isOpen={showRefreshWarningModal}
        onClose={() => setShowRefreshWarningModal(false)}
        onConfirm={handleConfirmReset}
      />

      {/* AI Job Description Modal */}
      {showJobDescModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[90%] md:max-w-[50%] relative border max-h-[90vh] overflow-y-auto">
            <Button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
              <IoMdClose size={24} />
            </Button>

            <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4">
              Generate AI Job Description
            </h2>

            <div className="space-y-4">
              <SimpleInputField
                label="Job Title*"
                placeholder="e.g., Software Engineer"
                value={jobTitleInput}
                onChange={(e) => setJobTitleInput(e.target.value)}
              />

              {/* Show loader, generated content, or generate button */}
              {isGeneratingJobDesc ? (
                <div className="min-h-[120px] border border-formBorders rounded-md bg-dropdownBackground flex items-center justify-center">
                  <ElegantLoader />
                </div>
              ) : generatedJobDesc ? (
                <div className="space-y-3">
                  <label className="block text-primary">
                    Generated Job Description:
                  </label>
                  <div
                    className="ai-job-desc-display"
                    style={{
                      backgroundColor: "rgba(251, 251, 251, 0.08)",
                      border: "2px dashed rgba(251, 251, 251, 0.2)",
                      borderRadius: "8px",
                      padding: "16px",
                      minHeight: "120px",
                      color: "#ffffff",
                      overflowY: "auto",
                      maxHeight: "300px"
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedJobDesc }}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Enter a job title to generate a comprehensive job
                    description
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  onClick={handleCloseModal}
                  className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-32 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
                  Cancel
                </Button>

                {!generatedJobDesc ? (
                  <Button
                    onClick={generateJobDescription}
                    disabled={isGeneratingJobDesc || !jobTitleInput.trim()}
                    className={`p-3 px-6 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg 
                      bg-gradient-to-b from-gradientStart to-gradientEnd 
                      hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:hover:ring-0`}>
                    <PiStarFourFill size={16} />
                    <span>
                      {isGeneratingJobDesc ? "Generating..." : "Generate"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleUseGeneratedJobDesc}
                    className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-32 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
                    Use This
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full px-5 md:px-10">
            <div className="pb-10 pt-10 flex justify-between items-center gap-5">
              <p className="md:text-lg font-light text-primary">
                Choose a resume as the source of information to answer questions
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleRegenerateClick}
                  className="p-1 md:p-2 bg-blue h-10 w-10 flex items-center justify-center hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition duration-300">
                  <img
                    src={regenerateIcon}
                    className="w-6 h-6"
                    alt="Regenerate"
                    loading="lazy"
                  />
                </Button>
                <Button className="p-2 bg-primary h-10 flex items-center justify-center hover:bg-primary-dark hover:shadow-lg transform hover:scale-105 transition duration-300">
                  <img
                    src={copyIcon}
                    className="w-6 h-6"
                    alt="Copy"
                    loading="lazy"
                  />
                </Button>
                {/* Save History Button */}
                {showResponse && (
                  <Button
                    onClick={handleSaveHistoryClick}
                    className="p-2 bg-purpleBackground h-10 flex items-center justify-center hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition duration-300"
                    title="Save Chat History">
                    <FaSave className="w-5 h-5 text-Black" />
                  </Button>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="pb-5">
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="block w-full md:w-[80%] bg-dropdownBackground text-primary border border-formBorders py-3 px-3 rounded-md shadow-sm">
                  <option
                    className="text-primary bg-inputBackGround"
                    value=""
                    disabled>
                    {isLoadingResumes ? "Loading resumes..." : "Select Resume"}
                  </option>
                  {resumeOptions.map((option) => (
                    <option
                      className="text-primary bg-inputBackGround"
                      key={option.id}
                      value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pb-5">
                {uploadedResumeName ? (
                  <p className="text-lg text-primary">
                    <strong>Uploaded Resume:</strong> {uploadedResumeName}
                  </p>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <Button
                      onClick={handleFileInputClick}
                      className="px-4 py-3 min-w-max flex gap-3 items-center justify-center text-lg text-primary font-semibold hover:text-primary">
                      Upload Resume
                    </Button>
                  </>
                )}
              </div>

              {/* Job Description Section with AI Generate Button */}
              <div className="pb-10 w-full md:w-[80%]">
                <div className="flex w-full justify-between items-center mb-2">
                  <label className="text-primary text-lg font-medium">
                    Job Description
                  </label>
                  <Button
                    onClick={() => setShowJobDescModal(true)}
                    className={`p-2 px-3 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg 
                      bg-gradient-to-b from-gradientStart to-gradientEnd 
                      hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd`}>
                    <PiStarFourFill size={16} />
                    <span>Generate with AI</span>
                  </Button>
                </div>

                {/* Custom Job Description Display/Input */}
                {jobDescription && jobDescription.includes("<ul>") ? (
                  <div className="space-y-3">
                    <div
                      className="w-full p-3 text-base text-primary border border-formBorders rounded bg-dropdownBackground min-h-[120px] overflow-y-auto max-h-[300px]"
                      style={{
                        backgroundColor: "rgba(251, 251, 251, 0.08)",
                        border: "2px solid rgba(251, 251, 251, 0.2)",
                        borderRadius: "8px",
                        padding: "16px",
                        color: "#ffffff",
                        lineHeight: "1.5"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(jobDescription)
                      }}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setJobDescription("")}
                        className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="w-full p-3 text-base text-primary placeholder:text-primary border border-formBorders rounded bg-dropdownBackground resize-none min-h-[120px]"
                    rows="5"
                    placeholder="Add Job Description or click the button above to generate with AI..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                )}
              </div>

              {!showResponse && (
                <div className="pb-10">
                  <Button
                    onClick={handleGenerateClick}
                    disabled={loadingLoader}
                    className="px-4 py-3 bg-gradient-to-b min-w-max flex gap-3 w-40 items-center justify-center text-base md:text-xl font-semibold from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
                    Generate
                    <FaRegThumbsUp />
                  </Button>
                </div>
              )}

              {showResponse && (
                <div className="bg-inputBackGround w-full md:w-[80%] md:px-4 py-4 mb-10 overflow-y-auto rounded-lg">
                  {/* Initial AI Interview Guide Response */}
                  <div className="p-3 space-y-5">
                    <div className="flex gap-4">
                      <img
                        src={aiIcon}
                        alt="AI"
                        className="w-6 h-6"
                        loading="lazy"
                      />
                      <p className="items-center text-primary text-xl font-medium">
                        AI-JOBS Reply
                      </p>
                    </div>

                    {Array.isArray(aiResponse) && aiResponse.length > 0 ? (
                      aiResponse.map((item, index) => (
                        <div key={index} className="p-4 ">
                          <p className="text-primary text-justify font-semibold mb-2">
                            Q{index + 1}: {item.Question}
                          </p>
                          <p className="text-primary text-justify">
                            <span className="font-semibold ">Ans:</span>{" "}
                            {item.Answer}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No response yet.</p>
                    )}
                  </div>

                  {/* Conversation History */}
                  {conversationHistory.map((conversation, index) => (
                    <div key={`conversation-${index}`}>
                      {/* User Question */}
                      <div className="p-3 space-y-2 border-t border-gray-600 mt-4">
                        <div className="flex gap-4">
                          <img
                            src={userIcon}
                            alt="User"
                            className="w-6 h-6"
                            loading="lazy"
                          />
                          <p className="items-center text-primary text-xl font-medium">
                            You
                          </p>
                        </div>
                        <div className="px-4 ">
                          <p className="text-primary font-semibold mb-2">
                            {conversation.Question}
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="p-3 space-y-2">
                        <div className="flex gap-4">
                          <img
                            src={aiIcon}
                            alt="AI"
                            className="w-6 h-6"
                            loading="lazy"
                          />
                          <p className="items-center text-primary text-xl font-medium">
                            AI-JOBS Reply
                          </p>
                        </div>
                        <div className="px-4 py-2">
                          <p className="text-primary text-justify">
                            {conversation.Answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* {showResponse && (
                <div className="pb-32 sm:mb-10 md:pb-40 flex gap-4 w-full md:w-[80%] items-center">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                    <input
                      type="text"
                      placeholder="Type your question..."
                      className="w-full pl-10 text-primary text-lg placeholder:text-primary pr-10 py-5 bg-inputBackGround rounded-lg border border-customGray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUserResponseSubmit()
                        }
                      }}
                    />
                    <Button onClick={handleUserResponseSubmit}>
                      <FaArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary cursor-pointer" />
                    </Button>
                  </div>
                </div>
              )} */}
              {showResponse && (
                <div className="pb-32 sm:mb-10 md:pb-40 flex gap-4 w-full md:w-[80%] items-end">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-6 text-primary" />
                    <textarea
                      placeholder="Type your question..."
                      className="w-full pl-10 text-primary text-lg placeholder:text-primary pr-10 py-5 bg-inputBackGround rounded-lg border border-customGray focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none min-h-[60px] max-h-[120px] scrollbar-hide"
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleUserResponseSubmit()
                        }
                      }}
                      rows={1}
                      style={{
                        lineHeight: "1.5",
                        height: "auto",
                        // Hide scrollbar for different browsers
                        scrollbarWidth: "none", // Firefox
                        msOverflowStyle: "none" // IE and Edge
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto"
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 120) + "px"
                      }}
                    />
                    <Button onClick={handleUserResponseSubmit}>
                      <FaArrowRight className="absolute right-3 top-6 text-primary cursor-pointer" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <UpgradePlanModal
              isOpen={showUpgradeModal}
              onClose={() => {
                setShowUpgradeModal(false)
                // Navigate to desired page or close modal
              }}
              context="interviewGuide"
            />
          </div>
        </div>
      </DashBoardLayout>
    </>
  )
}

export default InterviewGuide
