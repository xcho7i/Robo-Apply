import React, { useState, useEffect, useRef } from "react"
import { IoMdClose } from "react-icons/io"
import { errorToast, successToast } from "../../../../components/Toast"
import Button from "../../../../components/Button"
import SimpleInputField from "../../../../components/SimpleInputFields"
import DatePickerInput from "../../../../components/DatePickerInput"
import TextAreaComponent from "../../../../components/TextAreaComponent"
import { LiaRobotSolid } from "react-icons/lia"
import CircularIndeterminate from "../../../../components/loader/circular"
import API_ENDPOINTS from "../../../../api/endpoints"
import { PiStarFourFill } from "react-icons/pi"
import BouncingDotsLoader from "../../../../components/loader/BouncingDotsLoader"
import DOMPurify from "dompurify"

// Rich text editor imports
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import ElegantLoader from "../BridgeLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const experienceTypes = [
  "Full-Time",
  "Part-Time",
  "Hybrid",
  "Internship",
  "Contract"
]

// Custom styles for dark theme
const customEditorStyles = `
  .custom-quill-editor .ql-toolbar {
    border-color: rgba(251, 251, 251, 0.08);
    border-radius: 8px 8px 0 0;
  }

  .custom-quill-editor .ql-container {
    border-color: rgba(251, 251, 251, 0.08);
    color: #ffffff;
    border-radius: 0 0 8px 8px;
  }

  .custom-quill-editor .ql-editor {
    color: #ffffff;
    min-height: 120px;
  }

  .custom-quill-editor .ql-editor::before {
    color: #9ca3af;
    font-style: normal;
  }

  .custom-quill-editor .ql-stroke {
    stroke: #ffffff;
  }

  .custom-quill-editor .ql-fill {
    fill: #ffffff;
  }

  .custom-quill-editor .ql-picker-label {
    color: #ffffff;
  }

  .custom-quill-editor .ql-picker-options {
    background-color: #374151;
    border-color: rgba(251, 251, 251, 0.08);
  }

  .custom-quill-editor .ql-picker-item {
    color: #ffffff;
  }

  .custom-quill-editor .ql-picker-item:hover {
    background-color: #4b5563;
  }

  .custom-quill-editor .ql-tooltip {
    background-color: #374151;
    border-color: rgba(251, 251, 251, 0.08);
    color: #ffffff;
  }

  /* Styles for AI generated content display */
  .ai-content-display {
    background-color: rgba(251, 251, 251, 0.08);
    border: 2px dashed rgba(251, 251, 251, 0.2);
    border-radius: 8px;
    padding: 16px;
    min-height: 120px;
    color: #ffffff;
    overflow-y: auto;
    max-height: 200px;
  }

  .ai-content-display ul {
    list-style-type: disc;
    padding-left: 20px;
    margin: 0;
  }

  .ai-content-display li {
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .ai-content-display ol {
    list-style-type: decimal;
    padding-left: 20px;
    margin: 0;
  }
`

const ExperienceModal = ({
  isOpen,
  onClose,
  onAddExperience,
  initialData = {},
  onSave
}) => {
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")
  const [experienceType, setExperienceType] = useState("")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isCurrentJob, setIsCurrentJob] = useState(false)
  const [description, setDescription] = useState("")
  const [originalDescription, setOriginalDescription] = useState("")
  const [isAILoading, setIsAILoading] = useState(false)
  const [isRetryLoading, setIsRetryLoading] = useState(false)
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("")
  const [showActionButtons, setShowActionButtons] = useState(false)

  const quillRef = useRef(null)

  // Custom text editor configuration - only ul, ol, bold, italic, underline
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }]
      // ["clean"]
    ]
  }

  const quillFormats = ["bold", "italic", "underline", "list", "bullet"]

  useEffect(() => {
    if (isOpen) {
      setCompanyName(initialData.companyName || "")
      setJobTitle(initialData.jobTitle || "")
      setLocation(initialData.location || "")
      setExperienceType(initialData.experienceType || "")

      // Validate and set start date
      if (
        initialData.startDate &&
        !isNaN(new Date(initialData.startDate).getTime())
      ) {
        setStartDate(new Date(initialData.startDate))
      } else {
        setStartDate(null)
      }

      // Handle end date and "Present" condition
      if (initialData.endDate === "Present") {
        setIsCurrentJob(true)
        setEndDate(null)
      } else {
        setIsCurrentJob(false)

        if (
          initialData.endDate &&
          !isNaN(new Date(initialData.endDate).getTime())
        ) {
          setEndDate(new Date(initialData.endDate))
        } else {
          setEndDate(null)
        }
      }

      setDescription(initialData.description || "")
      setOriginalDescription(initialData.description || "")
      
      // Auto-generate AI content when modal opens
      // Use a longer timeout to ensure state is properly set
      setTimeout(() => {
        // Only call API if we have at least some meaningful data to work with
        if (initialData.companyName || initialData.jobTitle || initialData.location || initialData.experienceType || initialData.description) {
          // Pass the initialData directly to avoid state timing issues
          console.log("Initial data:", initialData)
          handleRetryAISuggestionWithData(initialData)
        }
      }, 500)
    }
  }, [isOpen, initialData])

  const handleClose = () => {
    setDescription("")
    setOriginalDescription("")
    setAiGeneratedDescription("")
    setShowActionButtons(false)
    setIsRetryLoading(false)
    onClose()
  }

  const handleDescriptionChange = (content) => {
    setDescription(content)
  }

  const handleSaveExperience = () => {
    if (
      !companyName ||
      !jobTitle ||
      !location ||
      !experienceType ||
      !startDate
    ) {
      errorToast("Please fill in all required fields.")
      return
    }

    const experienceData = {
      companyName,
      jobTitle,
      location,
      experienceType,
      startDate,
      endDate: isCurrentJob ? "Present" : endDate,
      description
    }

    if (initialData.id !== undefined) {
      onSave(initialData.id, experienceData)
    } else {
      onAddExperience({ ...experienceData, id: Date.now() })
    }

    onClose()
  }

  // const handleAddAiDescription = () => {
  //   setDescription(aiGeneratedDescription)
  //   setShowAiResponse(false)
  //   setAiGeneratedDescription("")
  // }

    const handleAddAiDescription = async () => {
    try {
      // Prepare payload for generate-jed API (retry functionality)
      const requestData = {
        companyName,
        location,
        jobTitle,
        experienceType,
        experienceDescription: description,
        suggestedExperience: aiGeneratedDescription || ""
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateJobDescription}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestData)
        }
      )

      const result = await response.json()

      if (result.description) {
        // Set the new AI description in the AI section (this shows the new content)
        setAiGeneratedDescription(result.description)
        
        successToast("New AI description generated! Review it and use the 'Add to Description' button to add it to your description.")
      } else {
        errorToast("No description generated. Please try again.")
      }
    } catch (error) {
      console.error("AI Add error:", error)
      errorToast("Error generating AI suggestion.")
    }
  }

  const handleAddToDescription = () => {
    if (!aiGeneratedDescription) {
      errorToast("No AI content to add. Please generate content first.")
      return
    }

    // Add the AI content to the main description field
    let combinedDescription = ""
    
    if (description && description.trim() !== "") {
      // If there's existing description, append AI description after it
      combinedDescription = description
      
      // Add minimal spacing between existing and new content
      const trimmedDescription = description.trim()
      // if (
      //   !trimmedDescription.endsWith("</p>") &&
      //   !trimmedDescription.endsWith("<br>")
      // ) {
      //   // Handle both plain text and HTML content
      //   if (
      //     !trimmedDescription.includes("<") &&
      //     !trimmedDescription.includes(">")
      //   ) {
      //     combinedDescription += "\n" // Single line break
      //   } else {
      //     combinedDescription += "<br>" // Single line break
      //   }
      // }
      
      combinedDescription += aiGeneratedDescription
    } else {
      // If no existing description, just use the AI description
      combinedDescription = aiGeneratedDescription
    }
    
    // Update the main description field
    setDescription(combinedDescription)
    
    successToast("AI content added to main description!")
  }

  const handleCheckboxChange = (e) => {
    setIsCurrentJob(e.target.checked)
    if (e.target.checked) setEndDate(null)
  }

  const handleCancelAIContent = () => {
    // Restore original content and hide action buttons
    setDescription(originalDescription)
    setShowActionButtons(false)
    successToast("Original content restored")
  }

  const handleUseAIContent = () => {
    // Keep the AI content and hide action buttons
    setShowActionButtons(false)
    successToast("AI content applied")
  }

  const handleAISuggestion = async () => {
    const missingFields = []
    if (!companyName) missingFields.push("Company Name")
    if (!location) missingFields.push("Location")
    if (!jobTitle) missingFields.push("Job Title")
    if (!experienceType) missingFields.push("Experience Type")
    if (!description || description.trim() === "") missingFields.push("Description")

    if (missingFields.length > 0) {
      errorToast(
        `Please fill in the following before using AI Improvement: ${missingFields.join(
          ", "
        )}`
      )
      return
    }

    setIsAILoading(true)
    
    try {
      // Prepare payload with the required fields for improve-descriptions API
      const payload = {
        companyName,
        location,
        jobTitle,
        experienceType,
        startDate,
        endDate: isCurrentJob ? "Present" : endDate,
        experienceDescription: description,
        AchExe: false,
        JobExe: true
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.ImproveJobDescriptionWithAI}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw new Error("Failed to improve job description")
      }

      const result = await response.json()

      if (result.improved) {
        // Store original content before replacing with AI content
        setOriginalDescription(description)
        
        // Set the improved description as the main description
        setDescription(result.improved)
        
        // Show action buttons after AI response
        setShowActionButtons(true)
        
        successToast("Job description improved successfully!")
      } else {
        errorToast("No improved description received from AI.")
        // Restore original content if no response
        setDescription(originalDescription)
      }
    } catch (error) {
      console.error("AI Improvement error:", error)
      errorToast("Error improving job description. Please try again.")
    } finally {
      setIsAILoading(false)
    }
  }

  const handleRetryAISuggestionWithData = async (data) => {
    setIsRetryLoading(true)
    try {
      // Validate that we have the required data
      if (!data.companyName && !data.jobTitle && !data.location && !data.experienceType && !data.description) {
        console.warn("No meaningful data provided for AI retry")
        setIsRetryLoading(false)
        return
      }

      // Prepare payload for generate-jed API using the provided data
      const requestData = {
        companyName: data.companyName || "",
        location: data.location || "",
        jobTitle: data.jobTitle || "",
        experienceType: data.experienceType || "",
        experienceDescription: data.description || "",
        suggestedExperience: aiGeneratedDescription || ""
      }
      
      // Debug: Log the payload being sent
      console.log("Retry API Payload (with data):", requestData)
      console.log("Data provided:", data)
      console.log("API Endpoint:", `${BASE_URL}${API_ENDPOINTS.GenerateJobDescription}`)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateJobDescription}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.description) {
        setAiGeneratedDescription(result.description)
        console.log("AI description set successfully")
      } else {
        console.warn("No description in API response:", result)
        errorToast("No description generated. Please try again.")
      }
    } catch (error) {
      console.error("AI Retry error:", error)
      errorToast("Error generating AI suggestion.")
    } finally {
      setIsRetryLoading(false)
    }
  }

  const handleRetryAISuggestion = async () => {
    setIsRetryLoading(true)
    try {
      // Validate that we have the required data
      if (!companyName && !jobTitle && !location && !experienceType && !description) {
        console.warn("No meaningful data in current state for AI retry")
        errorToast("Please fill in some fields before retrying AI suggestion.")
        setIsRetryLoading(false)
        return
      }

      // Prepare payload for generate-jed API (current retry functionality)
      // Use current state values for manual retry
      const requestData = {
        companyName: companyName || "",
        location: location || "",
        jobTitle: jobTitle || "",
        experienceType: experienceType || "",
        experienceDescription: description || "",
        suggestedExperience: aiGeneratedDescription || ""
      }
      
      // Debug: Log the payload being sent
      console.log("Manual Retry API Payload:", requestData)
      console.log("Current state values:", { companyName, location, jobTitle, experienceType, description })
      console.log("API Endpoint:", `${BASE_URL}${API_ENDPOINTS.GenerateJobDescription}`)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateJobDescription}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.description) {
        setAiGeneratedDescription(result.description)
        console.log("AI description set successfully")
      } else {
        console.warn("No description in API response:", result)
        errorToast("No description generated. Please try again.")
      }
    } catch (error) {
      console.error("AI Retry error:", error)
      errorToast("Error generating AI suggestion.")
    } finally {
      setIsRetryLoading(false)
    }
  }

  // Sanitize the AI generated content for safe HTML rendering
  const sanitizedAiContent = React.useMemo(() => {
    if (!aiGeneratedDescription) return ""
    return DOMPurify.sanitize(aiGeneratedDescription)
  }, [aiGeneratedDescription])

  if (!isOpen) return null

  return (
    <>
      <style>{customEditorStyles}</style>
      <div
        id="add-experience-modal-container"
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) =>
          e.target.id === "add-experience-modal-container" && onClose()
        }>
        <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border max-h-[90vh] overflow-y-auto">
          <Button
            onClick={onClose}
            className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
            <IoMdClose size={24} />
          </Button>

          <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4 ">
            {initialData.id !== undefined
              ? "Edit Experience"
              : "Add Experience"}
          </h2>

          <div className="flex flex-col md:space-y-2 border border-x-0 border-customGray pt-5">
            <div className="space-y-2 md:flex md:space-x-4 md:space-y-0">
              <SimpleInputField
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full"
              />
              <SimpleInputField
                placeholder="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <SimpleInputField
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="">
              <select
                id="experienceType"
                value={experienceType}
                onChange={(e) => setExperienceType(e.target.value)}
                className="block w-full bg-dropdownBackground md:mt-2.5 text-primary border border-formBorders  py-3 px-3 rounded-md">
                <option
                  value=""
                  className="text-primary bg-inputBackGround"
                  disabled>
                  Experience type
                </option>
                {experienceTypes.map((type) => (
                  <option
                    className="text-primary bg-inputBackGround"
                    key={type}
                    value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:flex md:space-x-4">
              <DatePickerInput
                placeholder="Start Date"
                selectedDate={startDate}
                onChange={setStartDate}
                className="w-full"
              />
              {!isCurrentJob && (
                <DatePickerInput
                  placeholder="End Date"
                  selectedDate={endDate}
                  onChange={setEndDate}
                  className="w-full"
                />
              )}
            </div>

            <div className="flex items-center pb-4 md:mx-5 z-50">
              <input
                type="checkbox"
                checked={isCurrentJob}
                onChange={handleCheckboxChange}
                className={`form-checkbox mr-3 h-5 w-5 border-2 bg-lightGreyBackground rounded  
                  ${
                    isCurrentJob
                      ? "border-customGray bg-transparent text-purpleColor"
                      : "border-customGray"
                  } focus:ring-0`}
              />
              <label className="text-sm text-primary">
                Currently working here
              </label>
            </div>

                                                  {/* Enhanced Description Section with Quill Editor */}
              <div className="relative">
                <label className="text-primary text-base font-medium mb-2 block">
                  Add Description
                </label>

              {/* Show loading animation in the same area during AI processing */}
              {isAILoading ? (
                <div className="z-30">
                  <div className="custom-quill-editor bg-dropdownBackground rounded border-formBorders">
                                        <div className="ql-container border-formBorders rounded-b-lg">
                                              <div className="ql-editor min-h-[120px] flex items-center justify-center">
                          <ElegantLoader height="h-60" />
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                                /* Custom Text Editor with specific formatting options */
                <div className="z-30">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Add description of your role and responsibilities..."
                    className="custom-quill-editor bg-dropdownBackground rounded border-formBorders"
                    style={
                      {
                        // marginBottom: "50px"
                      }
                    }
                  />
                  
                                                                                                  {/* Text Editor Action Buttons - Bottom Left - Only show when AI response is received */}
                    {showActionButtons && (
                      <div className="flex justify-start mt-3 space-x-2">
                        <button
                          onClick={handleCancelAIContent}
                          className="flex items-center px-3 py-1.5 bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-3 h-3 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                        <button
                          onClick={handleUseAIContent}
                          className="flex items-center px-3 py-1.5 bg-[#821db6] text-white rounded-full hover:bg-[#6b1a9a] transition-colors duration-200 text-sm"
                        >
                          <svg className="w-3 h-3 mr-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Use
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>

                        {/* AI Interaction Section - Hidden when Cancel/Use buttons are shown */}
            {!showActionButtons && (
              <div className="relative mt-4 pb-2">
                {/* AI Generated Description Section - Hidden during loading */}
                {!isAILoading && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-primary">
                        AI Generated Description
                      </label>
                      
                      {/* Improve with AI Button - Moved to right side of label */}
                      <Button
                        onClick={handleAISuggestion}
                        disabled={isAILoading}
                        className="text-primarys hover:text-yellowColor bg-purple rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="AI Suggestion for Description">
                        <PiStarFourFill size={16} />
                        <p>Improve with AI</p>
                      </Button>
                    </div>
                    
                                                                {/* AI Content Display - Show loading animation during retry, content during normal state */}
                      {isRetryLoading ? (
                        <div className="ai-content-display flex items-center justify-center overflow-hidden">
                          <ElegantLoader/>
                        </div>
                      ) : (
                        <div
                          className="ai-content-display"
                          dangerouslySetInnerHTML={{ __html: aiGeneratedDescription ? sanitizedAiContent : '<p class="text-gray-400 italic">Click "Improve with AI" to generate a description...</p>' }}
                        />
                      )}
                      
                                        {/* AI Action Buttons - Hidden during retry loading, visible during normal state */}
                      {!isRetryLoading && (
                        <div className="flex justify-end mt-2 mb-2 space-x-3">
                          <Button
                            onClick={handleRetryAISuggestion}
                            className="bg-primary text-purple font-semibold rounded-full px-6 text-sm"
                            title="Retry AI Suggestion">
                            Retry
                          </Button>
                          {aiGeneratedDescription && (
                          <Button
                          onClick={() => {
                            handleAddToDescription();
                            handleRetryAISuggestion();
                          }}
                          className="bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full px-8 py-1 text-sm font-medium"
                          title="Add AI Content to Main Description"
                        >
                          Add
                        </Button>
                        
                          )}
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-5 mb-2 space-x-4 ">
            <Button
              onClick={handleClose}
              className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
              Close
            </Button>
            <Button
              onClick={handleSaveExperience}
              className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
              {initialData.id !== undefined ? "Save Changes" : "Add Experience"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExperienceModal
