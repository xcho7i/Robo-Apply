import React, { useState, useEffect, useRef } from "react"
import { IoMdClose } from "react-icons/io"
import { errorToast } from "../../Toast"
import SimpleInputField from "../../SimpleInputFields"
import DatePickerInput from "../../DatePickerInput"
import Button from "../../Button"
import CircularIndeterminate from "../../loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import { PiStarFourFill } from "react-icons/pi"
import DOMPurify from "dompurify"

import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import ElegantLoader from "../../../pages/resumeBuilder/ui/BridgeLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

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

const AddAchievementModal = ({
  isOpen,
  onClose,
  onAddAchievement,
  initialData = {},
  onSave
}) => {
  const [awardTitle, setAwardTitle] = useState("")
  const [issuer, setIssuer] = useState("")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [description, setDescription] = useState("")

  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("")
  const [showAiResponse, setShowAiResponse] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)

  const quillRef = useRef(null)

  // Custom text editor configuration - only ul, ol, bold, italic, underline
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }]
    ]
  }

  const quillFormats = ["bold", "italic", "underline", "list", "bullet"]

  useEffect(() => {
    if (isOpen) {
      setAwardTitle(initialData.awardTitle || "")
      setIssuer(initialData.issuer || "")
      setDescription(initialData.description || "")

      const parseDate = (date) => {
        if (!date || date === "null" || date === "") return null
        const parsed = new Date(date)
        return isNaN(parsed) ? null : parsed
      }

      setStartDate(parseDate(initialData.startDate))
      setEndDate(parseDate(initialData.endDate))
    }
  }, [isOpen, initialData])

  const handleClose = () => {
    setDescription("")
    setAiGeneratedDescription("")
    setShowAiResponse(false)
    onClose()
  }

  const handleDescriptionChange = (content) => {
    setDescription(content)
  }

  const handleSaveAchievement = () => {
    if (!awardTitle || !issuer || !startDate || !description) {
      errorToast("Please fill in all required fields.")
      return
    }

    const achievementData = {
      awardTitle,
      issuer,
      startDate,
      endDate,
      description
    }

    if (initialData.id !== undefined) {
      onSave(initialData.id, achievementData)
    } else {
      onAddAchievement({ ...achievementData, id: Date.now() })
    }

    onClose()
  }

  const handleAddAiDescription = () => {
    // Combine existing description with AI generated description
    let combinedDescription = ""

    if (description && description.trim() !== "") {
      // If there's existing description, append AI description after it
      combinedDescription = description

      // Add appropriate spacing between existing and new content
      const trimmedDescription = description.trim()
      if (
        !trimmedDescription.endsWith("</p>") &&
        !trimmedDescription.endsWith("<br>")
      ) {
        // Handle both plain text and HTML content
        if (
          !trimmedDescription.includes("<") &&
          !trimmedDescription.includes(">")
        ) {
          combinedDescription += "" // Plain text spacing
        } else {
          combinedDescription += "" // HTML spacing
        }
      }

      combinedDescription += aiGeneratedDescription
    } else {
      // If no existing description, just use AI generated description
      combinedDescription = aiGeneratedDescription
    }

    setDescription(combinedDescription)
    setAiGeneratedDescription("")
    setShowAiResponse(false)

    // Focus back to the main editor
    if (quillRef.current) {
      quillRef.current.focus()
    }
  }

  const handleAISuggestion = async () => {
    const missingFields = []
    if (!awardTitle) missingFields.push("Award Title")
    if (!issuer) missingFields.push("Issuer")

    if (missingFields.length > 0) {
      errorToast(
        `Please fill in the following before using AI Suggestion: ${missingFields.join(
          ", "
        )}`
      )
      return
    }

    const formData = {
      AchExe: true,
      JobExe: false,
      awardTitle,
      issuer,
      achievementDescription: description,
      suggestedAchievement: "null"
    }

    setIsAILoading(true)
    setShowAiResponse(false)
    // Don't hide AI response immediately, let loading show in place

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.ImproveJobDescriptionWithAI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) throw new Error("Failed to fetch AI suggestion")

      const data = await response.json()

      if (data?.improved) {
        // Update the main description with improved content
        setDescription(data.improved)
        // Set AI generated description to show suggested content
        setAiGeneratedDescription(data.suggested ? data.suggested[0] : "")
        setShowAiResponse(true)
      } else {
        errorToast("No description received from AI.")
      }
    } catch (error) {
      console.error("AI Suggestion Error:", error)
      errorToast("Error generating AI suggestion.")
    } finally {
      setIsAILoading(false)
    }
  }

  const handleRetryAISuggestion = async () => {
    const missingFields = []
    if (!awardTitle) missingFields.push("Award Title")
    if (!issuer) missingFields.push("Issuer")

    if (missingFields.length > 0) {
      errorToast(
        `Please fill in the following before using AI Suggestion: ${missingFields.join(
          ", "
        )}`
      )
      return
    }

    const formData = {
      awardTitle,
      issuer,
      achievementDescription: description,
      suggestedAchievement: ""
    }

    setIsAILoading(true)
    setShowAiResponse(false)

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateAchivementDescription}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) throw new Error("Failed to fetch AI suggestion")

      const data = await response.json()

      if (data?.description) {
        setAiGeneratedDescription(data.description)
        setShowAiResponse(true)
      } else {
        errorToast("No description received from AI.")
      }
    } catch (error) {
      console.error("AI Suggestion Error:", error)
      errorToast("Error generating AI suggestion.")
    } finally {
      setIsAILoading(false)
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
        id="add-achievement-modal-container"
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) =>
          e.target.id === "add-achievement-modal-container" && onClose()
        }>
        <div className="bg-modalPurple rounded-lg p-4 md:p-8 max-w-[90%] md:max-w-[50%] mt-10 relative border max-h-[90vh] overflow-y-auto">
          <Button
            onClick={handleClose}
            className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
            <IoMdClose size={24} />
          </Button>

          <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4">
            {initialData.id !== undefined
              ? "Edit Achievement"
              : "Add Achievement"}
          </h2>

          <div className="flex flex-col space-y-2 border border-x-0 border-customGray py-5">
            <div className="space-y-2 md:flex md:space-x-4 md:space-y-0">
              <SimpleInputField
                placeholder="Award Title"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                className="w-full"
              />
              <SimpleInputField
                placeholder="Issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="md:flex md:space-x-4">
              <DatePickerInput
                placeholder="Start Date"
                selectedDate={startDate}
                onChange={setStartDate}
                className="w-full"
              />
              <DatePickerInput
                placeholder="End Date"
                selectedDate={endDate}
                onChange={setEndDate}
                className="w-full"
              />
            </div>

            {/* Enhanced Description Section with Quill Editor */}
            <div className="relative">
              <label className="block text-primary my-4">Description</label>
              <div className="z-30">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Add description of your achievement..."
                  className="custom-quill-editor bg-dropdownBackground rounded border-formBorders"
                  style={{
                    marginBottom: showAiResponse || isAILoading ? "0px" : "40px" // Conditional margin
                  }}
                />
              </div>
            </div>

            {/* AI Interaction Section */}
            <div className="relative">
              {/* Show AI response area when loading OR when response is available */}
              {showAiResponse || isAILoading ? (
                <>
                  <label className="block text-primary my-2">
                    AI Generated Description
                  </label>

                  {/* Show loading or content */}
                  {isAILoading ? (
                    <div className="ai-content-display flex items-center justify-center">
                      <ElegantLoader />
                    </div>
                  ) : (
                    <div
                      className="ai-content-display"
                      dangerouslySetInnerHTML={{ __html: sanitizedAiContent }}
                    />
                  )}

                  <div className="flex justify-end mt-2 space-x-3">
                    {isAILoading ? (
                      <div></div> // Empty div to maintain spacing
                    ) : (
                      <>
                        <Button
                          onClick={handleRetryAISuggestion}
                          className="bg-white text-purple font-semibold rounded-full px-6  text-sm"
                          title="Retry AI Suggestion">
                          Retry
                        </Button>
                        <Button
                          onClick={handleAddAiDescription}
                          className="bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full px-8 py-1 text-sm font-medium"
                          title="Add AI Description to Main Description">
                          Add
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex justify-end absolute bottom-0 right-0">
                  <Button
                    onClick={handleAISuggestion}
                    disabled={isAILoading}
                    className="text-primary hover:text-yellowColor bg-purple rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="AI Suggestion for Description">
                    <PiStarFourFill size={16} />
                    <p>Improve with AI</p>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-5 mb-2 space-x-4">
            <Button
              onClick={handleClose}
              className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
              Close
            </Button>
            <Button
              onClick={handleSaveAchievement}
              className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
              {initialData.id !== undefined
                ? "Save Changes"
                : "Add Achievement"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddAchievementModal
