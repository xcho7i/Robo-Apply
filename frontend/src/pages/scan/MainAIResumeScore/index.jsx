import React, { useState, useEffect } from "react"
import Button from "../../../components/Button"
import { FaPlus } from "react-icons/fa"
import { IoInformationCircleSharp } from "react-icons/io5"
import CircularIndeterminate from "../../../components/loader/circular"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../../api/endpoints"
import { errorToast, successToast } from "../../../components/Toast"
import UpgradePlanModal from "../../../components/Modals/UpgradePlanModal"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { formatDistanceToNow } from "date-fns"
import { IoMdDownload } from "react-icons/io"
import { FaEye } from "react-icons/fa"
import { FaChartLine } from "react-icons/fa"
import DashBoardLayout from "../../../dashboardLayout"
import DeleteModal from "../ui/DeleteModal"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const MainAIResumeScore = () => {
  const [loading, setLoading] = useState(true)
  const [resumeScores, setResumeScores] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResumeScore, setSelectedResumeScore] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navigate = useNavigate()

  const handleResumeScoreNavigation = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("No access token found.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.SubscriptionData}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Failed to fetch subscription data.")
      }

      const subData = await res.json()

      const monthlyCredits =
        subData?.subscription?.remaining?.monthlyCredits ?? 0

      if (monthlyCredits < 8) {
        setShowUpgradeModal(true)
      } else {
        navigate("/scan")
      }
    } catch (err) {
      console.error("Error checking subscription:", err)
      setShowUpgradeModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleViewClick = async (resumeScore) => {
    const token = localStorage.getItem("access_token")
    const id = resumeScore._id

    if (!token || !id) {
      console.error("Missing token or resume score ID")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetResumeScore}/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch resume score details")
      }

      const data = await response.json()
      const resumeScoreDetail = data.resumeScore

      // Save values to localStorage
      localStorage.setItem("resumeScoreData", JSON.stringify(resumeScoreDetail))
      localStorage.setItem("resumeScore_id", resumeScoreDetail._id)

      // Navigate to show resume score page
      navigate("/show-resume-score")
    } catch (error) {
      console.error("❌ Error fetching resume score details:", error)
      errorToast("Failed to load resume score details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (resumeScore) => {
    setSelectedResumeScore(resumeScore)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedResumeScore) return
    setShowDeleteModal(false)

    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.DeleteResumeScore}/${selectedResumeScore._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.msg || "Failed to delete resume score.")
      }

      successToast(result.msg || "Resume score deleted successfully!")

      // Remove deleted item from UI
      setResumeScores((prev) =>
        prev.filter((rs) => rs._id !== selectedResumeScore._id)
      )
    } catch (error) {
      console.error("Error deleting resume score:", error)
      errorToast("Failed to delete resume score")
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setSelectedResumeScore(null)
    }
  }

  useEffect(() => {
    // Clear specific items from localStorage
    localStorage.removeItem("resumeScoreData")
    localStorage.removeItem("resumeScore_id")

    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("No access token found.")
      setLoading(false)
      return
    }

    const fetchResumeScores = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}${API_ENDPOINTS.GetResumeScore}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch resume scores.")
        }

        const data = await response.json()
        setResumeScores(data.resumeScores?.docs || data.resumeScores || [])
      } catch (error) {
        console.error("❌ Error fetching resume scores:", error)
        errorToast("Failed to load resume scores")
        setResumeScores([])
      } finally {
        setLoading(false)
      }
    }

    fetchResumeScores()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-400/30"
    if (score >= 60)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
    if (score >= 40)
      return "bg-orange-500/20 text-orange-400 border-orange-400/30"
    return "bg-red-500/20 text-red-400 border-red-400/30"
  }

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full lg:px-10">
          <div className="justify-between flex pr-3 md:pr-0 w-full py-12">
            <div className="px-5">
              <div className="flex items-start gap-3">
                <p className="text-xl md:text-3xl justify-start font-bold text-primary">
                  AI Resume Scores
                </p>
                <div className="group relative">
                  <IoInformationCircleSharp
                    className="text-primary hover:text-purple-400 cursor-pointer transition-colors duration-200"
                    size={16}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-50">
                    <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
                      <strong>Uses 8 credits</strong>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-primary">
                View and analyze your resume scores with AI-powered insights.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleResumeScoreNavigation}
                className="p-3 px-5 flex items-center whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <FaChartLine />
                Analyze Resume
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <CircularIndeterminate />
            </div>
          ) : resumeScores.length === 0 ? (
            <div className="w-full h-80 bg-lightPurple justify-center items-center flex rounded-lg">
              <div className="text-center">
                <FaChartLine className="mx-auto mb-4 text-primary" size={48} />
                <p className="text-primary text-lg mb-4">
                  No resume scores yet
                </p>
                <Button
                  onClick={handleResumeScoreNavigation}
                  className="py-5 px-8 flex items-center space-x-2 max-w-60 min-w-max text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  ANALYZE YOUR FIRST RESUME
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 w-full overflow-x-auto p-5 md:p-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Resume Name
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Score
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Job Title
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Analyzed On
                    </th>
                    <th className="text-center py-4 px-4 text-primary font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resumeScores.map((resumeScore) => (
                    <tr
                      key={resumeScore._id}
                      className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {resumeScore.resumeName || "Resume Analysis"}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              resumeScore.overallScore || 0
                            )}`}>
                            {resumeScore.overallScore || 0}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getScoreBadge(
                              resumeScore.overallScore || 0
                            )}`}>
                            {resumeScore.overallScore >= 80
                              ? "Excellent"
                              : resumeScore.overallScore >= 60
                              ? "Good"
                              : resumeScore.overallScore >= 40
                              ? "Fair"
                              : "Needs Work"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <p className="text-primary">
                          {resumeScore.jobTitle || "N/A"}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-primary">
                          {resumeScore.createdAt
                            ? formatDistanceToNow(
                                new Date(resumeScore.createdAt),
                                {
                                  addSuffix: true
                                }
                              )
                            : "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleViewClick(resumeScore)}>
                              <FaEye size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              View Details
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleViewClick(resumeScore)}>
                              <FaChartLine size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              View Analysis
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar text-red-400 font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDeleteClick(resumeScore)}>
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

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="scan"
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Resume Score"
        message="Are you sure you want to delete this resume analysis? This action cannot be undone."
      />
    </DashBoardLayout>
  )
}

export default MainAIResumeScore
