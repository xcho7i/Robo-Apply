import React, { useState, useEffect, useMemo } from "react"
import DashBoardLayout from "../../../../dashboardLayout"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"
import { errorToast, successToast } from "../../../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../../../api/endpoints"
import CircularIndeterminate from "../../../../components/loader/circular"
import { PiStarFourFill } from "react-icons/pi"
import DOMPurify from "dompurify"
import ElegantLoader from "../../../resumeBuilder/ui/BridgeLoader"
import CoverLetterFinalLoader from "../../../../components/loader/CoverLetterFinalLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const DesiredJobYes = () => {
  const navigate = useNavigate()
  const [desiredPosition, setDesiredPosition] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [hiringManager, setHiringManager] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const [generatedJobDesc, setGeneratedJobDesc] = useState("")

  // Load saved data from localStorage
  useEffect(() => {
    const savedDetails = JSON.parse(localStorage.getItem("detailCoverletter"))
    if (savedDetails) {
      setDesiredPosition(savedDetails.desiredPosition || "")
      setCompanyName(savedDetails.companyName || "")
      setHiringManager(savedDetails.hiringManager || "")
      setDescription(savedDetails.description || "")
    }
  }, [])

  // Sanitize the generated job description for safe HTML rendering
  const sanitizedJobDesc = useMemo(() => {
    if (!generatedJobDesc) return ""
    return DOMPurify.sanitize(generatedJobDesc)
  }, [generatedJobDesc])

  const generateJobDescription = async () => {
    if (!desiredPosition.trim()) {
      errorToast(
        "Please enter a desired position first to generate job description."
      )
      return
    }

    setIsGeneratingJobDesc(true)

    try {
      const accessToken = localStorage.getItem("access_token")

      const requestBody = {
        job_title: desiredPosition,
        job_description: description || "",
        job_skills: "" // You can add skills field if needed
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
        setDescription(responseData.description) // Also set for form submission
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

  // Handle Continue
  const handleContinue = async () => {
    if (!desiredPosition.trim()) {
      errorToast("Desired position is required.")
      return
    }

    if (!description.trim()) {
      errorToast("Description is required.")
      return
    }

    const storedCVData = JSON.parse(localStorage.getItem("cv_data"))

    if (!storedCVData) {
      errorToast("CV data is missing. Please go back and complete your CV.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("education", storedCVData.education || "")
      formData.append(
        "recent_job",
        storedCVData.recentJob || storedCVData.recent_job || ""
      )
      formData.append("experience", storedCVData.experience || "")
      formData.append("skills", storedCVData.skills || "")
      formData.append("strengths", storedCVData.strengths || "")
      formData.append(
        "personal_details",
        storedCVData.personalDetails || personal_details || ""
      )
      formData.append("desired_position", desiredPosition)
      formData.append("Company", companyName)
      formData.append("Hiring_mangaer_name", hiringManager)
      formData.append("description", description)

      const accessToken = localStorage.getItem("access_token")
      localStorage.setItem("Save_job_title_Cover_Letter", desiredPosition)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.AiCoverLetterGenerate2}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error("Failed to generate cover letter")
      }

      const data = await response.json()

      // Save each part of the response separately in localStorage
      localStorage.setItem("coverLetterUserData", JSON.stringify(data.userData))
      localStorage.setItem(
        "coverLetterCompanyData",
        JSON.stringify(data.companyData)
      )
      localStorage.setItem("coverLetterBody", data.letterBody)

      navigate("/show-cover-letter")
    } catch (error) {
      console.error("Error:", error)
      errorToast("Something went wrong while generating the cover letter.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Back
  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          {/* <CircularIndeterminate /> */}
          <CoverLetterFinalLoader />
        </div>
      ) : (
        <DashBoardLayout>
          <div className="flex flex-col h-full bg-almostBlack">
            <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
              <div className="w-full">
                {/* Add CSS for job description display */}
                <style jsx>{`
                  .ai-job-desc-display {
                    background-color: rgba(251, 251, 251, 0.08);
                    border: 2px dashed rgba(251, 251, 251, 0.2);
                    border-radius: 8px;
                    padding: 16px;
                    min-height: 120px;
                    color: #ffffff;
                    overflow-y: auto;
                    max-height: 300px;
                  }

                  .ai-job-desc-display ul {
                    list-style-type: disc;
                    padding-left: 20px;
                    margin: 8px 0;
                  }

                  .ai-job-desc-display li {
                    margin-bottom: 8px;
                    line-height: 1.5;
                  }

                  .ai-job-desc-display ol {
                    list-style-type: decimal;
                    padding-left: 20px;
                    margin: 8px 0;
                  }
                `}</style>

                <div className="px-[5%] md:px-[10%] ">
                  <div className="text-center pt-14 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                    <p className="text-primary text-lg md:text-3xl font-semibold">
                      Please provide details of your desired job
                    </p>
                    <p className="text-primary text-base md:text-xl font-normal pt-2">
                      Create your personalized cover letter for job
                      applications, powered by GPT-3 AI technology—fast and
                      free!
                    </p>
                  </div>
                </div>
                <div className="px-[5%] md:px-[30%] mt-20 ">
                  <SimpleInputField
                    label="Desired Position*"
                    value={desiredPosition}
                    onChange={(e) => setDesiredPosition(e.target.value)}
                  />
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <SimpleInputField
                      label="Company name (optional)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <SimpleInputField
                      label="Hiring manger name (optional)"
                      placeholder="Philip Maya"
                      value={hiringManager}
                      onChange={(e) => setHiringManager(e.target.value)}
                    />
                  </div>

                  {/* Enhanced Description Section with Generate AI Button */}
                  <div className="mt-5">
                    <div className="flex w-full justify-between items-center mb-2">
                      <label className="text-primary">Description*</label>
                      <Button
                        onClick={generateJobDescription}
                        disabled={isGeneratingJobDesc}
                        className={`p-2 px-3 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg 
                          bg-gradient-to-b from-gradientStart to-gradientEnd 
                          hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
                         `}>
                        <PiStarFourFill size={16} />
                        <span>
                          {isGeneratingJobDesc
                            ? "Generating..."
                            : "Generate with AI"}
                        </span>
                      </Button>
                    </div>

                    {/* Show loader, generated content, or textarea based on state */}
                    {isGeneratingJobDesc ? (
                      <div className="min-h-[120px] border border-formBorders rounded-md bg-dropdownBackground flex items-center justify-center">
                        <ElegantLoader />
                      </div>
                    ) : generatedJobDesc ? (
                      <div className="space-y-3">
                        <div
                          className="ai-job-desc-display"
                          dangerouslySetInnerHTML={{ __html: sanitizedJobDesc }}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              setGeneratedJobDesc("")
                              setDescription("")
                            }}
                            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        className="w-full p-3 my-2 placeholder:text-extraLightGrey text-base text-primary  border border-formBorders rounded bg-dropdownBackground resize-none"
                        rows="5"
                        placeholder="Enter job description or click the button above to generate with AI"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-center space-x-4 mt-6">
                    <Button
                      onClick={handleBack}
                      className="py-3 px-8 md:px-12 min-w-40 flex items-center justify-center bg-almostBlack text-xl font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                      Back
                    </Button>
                    <Button
                      onClick={handleContinue}
                      className="py-3 px-4 sm:px-10 min-w-40 flex items-center justify-center text-xl font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashBoardLayout>
      )}
    </>
  )
}

export default DesiredJobYes
