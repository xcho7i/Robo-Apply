import React, { useState, useEffect } from "react"

import { FaPlus } from "react-icons/fa"
import { IoInformationCircleSharp } from "react-icons/io5"
import { useNavigate } from "react-router-dom"

import { IoMdDownload } from "react-icons/io"
import { FaEdit } from "react-icons/fa"
import { FaEye } from "react-icons/fa"

import { MdDelete } from "react-icons/md"
import { formatDistanceToNow } from "date-fns"
import DashBoardLayout from "../../../dashboardLayout"
import Button from "../../../components/Button"
import InterviewDeleteModal from "../ui/InterviewDeleteModal"
import { errorToast, successToast } from "../../../components/Toast"
import CircularIndeterminate from "../../../components/loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import { useTour,aiInterviewGuid } from "../../../stores/tours"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const MainInterviewGuide = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
      const { startModuleTourIfEligible } = useTour()
  useEffect(() => {
    startModuleTourIfEligible("ai-interview-guide", aiInterviewGuid, { showWelcome: false })
  }, [startModuleTourIfEligible])

  // Fetch interview guides from API
  useEffect(() => {
    const fetchInterviewGuides = async () => {
      setLoading(true)
      const token = localStorage.getItem("access_token")

      if (!token) {
        errorToast("You are not authorized.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${BASE_URL}${API_ENDPOINTS.GetInterviewGuideFile}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.jobPreps && data.jobPreps.docs) {
          setInterviews(data.jobPreps.docs)
        } else {
          setInterviews([])
        }
      } catch (error) {
        errorToast("Failed to load interview guides")
        setInterviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewGuides()
  }, [])

  const handleEditInterview = (interviewId) => {
    console.log("Edit interview:", interviewId)
    // Navigation logic can be added here later
  }

  const handleViewInterview = async (interviewId) => {

    const token = localStorage.getItem("access_token")
    if (!token) {
      errorToast("You are not authorized.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetSingleInterviewData}/${interviewId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.jobPrep) {
        // Navigate to ShowInterviewGuide component with the data
        navigate("/show-interview-guide", {
          state: {
            interviewData: data.jobPrep
          }
        })
      } else {
        errorToast("Failed to load interview guide data")
      }
    } catch (error) {
      errorToast("Failed to load interview guide details")
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteClick = (interview) => {
    setSelectedInterview(interview)
    setShowDeleteModal(true)
  }

  const handleInterviewNavigation = () => {
    navigate("/interview-Guide")
  }

  const confirmDelete = async () => {
    if (!selectedInterview) return

    const interviewId = selectedInterview._id

    setShowDeleteModal(false)
    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        errorToast("You are not authorized.")
        return
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.DeleteInterviewGuideData}/${interviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        successToast(data.message || "Interview guide deleted successfully!")

        // Remove the deleted interview from the local state
        setInterviews((prevInterviews) =>
          prevInterviews.filter((interview) => interview._id !== interviewId)
        )
      } else {
        errorToast(data.message || "Failed to delete interview guide")
      }
    } catch (error) {
      errorToast("Failed to delete interview guide")
    } finally {
      setLoading(false)
      setSelectedInterview(null)
    }
  }

  // Extract company name from job description HTML
  const extractCompanyFromJobDesc = (jobDescription) => {
    if (!jobDescription) return "N/A"

    // Try to extract company name from job description
    // This is a simple approach, you might need to adjust based on your data format
    const match = jobDescription.match(/Company[:\s]*([^<\n]+)/i)
    return match ? match[1].trim() : "N/A"
  }

  // Extract position from job description HTML
  const extractPositionFromJobDesc = (jobDescription) => {
    if (!jobDescription) return "N/A"

    // Try to extract job title from job description
    const titleMatch = jobDescription.match(
      /<strong>Job Title<\/strong>[:\s]*([^<\n]+)/i
    )
    if (titleMatch) return titleMatch[1].trim()

    // Fallback to look for Job Title without HTML tags
    const fallbackMatch = jobDescription.match(/Job Title[:\s]*([^<\n]+)/i)
    return fallbackMatch ? fallbackMatch[1].trim() : "N/A"
  }

  if (loading) {
    return (
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full flex justify-center items-center py-20">
            <CircularIndeterminate />
          </div>
        </div>
      </DashBoardLayout>
    )
  }

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full lg:px-10">
          <div className="justify-between flex pr-3 md:pr-0 w-full py-12">
            <div className="px-5 flex items-start gap-3">
              <p className="text-xl md:text-3xl justify-start font-bold text-primary" data-tour="ai-interviewGuid-interviewHeading">
                AI Interview Guide
              </p>
              <div className="group relative">
                <IoInformationCircleSharp
                  className="text-primary hover:text-purple-400 cursor-pointer transition-colors duration-200"
                  size={16}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-10">
                  <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
                    <strong>Uses 15 credits</strong>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3" data-tour="ai-interviewGuid-newInterviewGuid">
              <Button
                onClick={handleInterviewNavigation}
                className="p-3 px-5 flex items-center whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <FaPlus />
                New Interview Guide
              </Button>
            </div>
          </div>

          {interviews.length === 0 ? (
            <div className="w-full h-80 bg-lightPurple justify-center items-center flex rounded-lg" data-tour="ai-interviewGuid-createInterviewGuidBtn">
              <Button
                onClick={handleInterviewNavigation}
                className="py-5 px-8 flex items-center space-x-2 max-w-40 min-w-max text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                CREATE YOUR INTERVIEW GUIDE FIRST
              </Button>
            </div>
          ) : (
            <div className="mt-5 w-full overflow-x-auto p-5 md:p-0">
              <table className="w-full border-collapse justify-between ">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Resume Used
                    </th>
                    {/* <th className="text-left py-4 px-4 text-primary font-medium">
                      Company
                    </th> */}
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Position
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Total Questions
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Created At
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr
                      key={interview._id}
                      className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {interview.resumeUsed || "N/A"}
                        </p>
                      </td>
                      {/* <td className="py-4 px-5">
                        <p className="text-primary">
                          {extractCompanyFromJobDesc(interview.jobDescription)}
                        </p>
                      </td> */}
                      <td className="py-4 px-5">
                        <p className="text-primary">
                          {extractPositionFromJobDesc(interview.jobDescription)}
                        </p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-primary">
                          {interview.totalQuestions || 0} Questions
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-primary">
                          {interview.createdAt
                            ? formatDistanceToNow(
                                new Date(interview.createdAt),
                                {
                                  addSuffix: true
                                }
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() =>
                                handleViewInterview(interview._id)
                              }>
                              <FaEye size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              View
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDeleteClick(interview)}>
                              <MdDelete size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Delete
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <InterviewDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </DashBoardLayout>
  )
}

export default MainInterviewGuide
