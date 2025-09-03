import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../dashboardLayout"
import Button from "../../components/Button"
import { FaPlus } from "react-icons/fa"
import { IoInformationCircleSharp } from "react-icons/io5"
import CircularIndeterminate from "../../components/loader/circular"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"

import { errorToast, successToast } from "../../components/Toast"
import basicModern from "../../assets/resumeBuilder/basicModern.png"
import classicProfessional from "../../assets/resumeBuilder/classicProfessional.png"
import modernProfessional from "../../assets/resumeBuilder/modernProfessional.png"
import creative from "../../assets/resumeBuilder/Creative.jpg"
import classic from "../../assets/resumeBuilder/Classic.jpg"

import { IoMdDownload } from "react-icons/io"
import { FaEye } from "react-icons/fa"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { formatDistanceToNow } from "date-fns"
import DeleteModal from "../coverLetterNew/ui/DeleteModal"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import ResumeDeleteModal from "./ui/ResumeDeleteModal"

// Import tour store and steps
import { useTour, aiResumeBuilder } from "../../stores/tours"

const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const MainResumeBuilder = () => {
  const [loading, setLoading] = useState(true)
  const [resumes, setResumes] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResume, setSelectedResume] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navigate = useNavigate()
  
  // Destructure tour methods including debug methods
  const { 
    startModuleTourIfEligible, 
    debugTourState, 
    forceModuleTour,
    resetFor 
  } = useTour()

  // DEBUG: Add button to test tour manually
  const handleDebugTour = () => {
    debugTourState()
    forceModuleTour("ai-resume-builder", aiResumeBuilder)
  }

  // Reset tour for testing
  const handleResetTour = () => {
    resetFor("ai-resume-builder")
    localStorage.removeItem("ra_any_skip")
    localStorage.removeItem("ra_tour_group_status")
  }

  // Initialize module tour
  useEffect(() => {   
    const timer = setTimeout(() => {
      debugTourState()
      startModuleTourIfEligible("ai-resume-builder", aiResumeBuilder, { showWelcome: false })
    }, 500) // Increased delay

    return () => clearTimeout(timer)
  }, [startModuleTourIfEligible, debugTourState])

  useEffect(() => {
    // Clear specific items from localStorage
    const keysToRemove = [
      "resumeBuilderAchievements",
      "resumeBuilderCertifications", 
      "resumeBuilderExperiences",
      "resumeBuilderLanguages",
      "resumeBuilderPersonalData",
      "resumeBuilderQualifications",
      "resumeBuilderSkills",
      "resumeTitle",
      "selectedTemplate",
      "ResumeBuilder-Id"
    ]

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    const fetchResumes = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("No access token found.")
        return
      }

      try {
        const response = await fetch(
          `${BASE_URL}${API_ENDPOINTS.GetAllResumeBuilder}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch resumes.")
        }

        const data = await response.json()
        setResumes(data.resumes.docs)
      } catch (error) {
        setResumes([])
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [])

  const getTemplateImage = (template) => {
    switch (template) {
      case "modern":
        return modernProfessional
      case "classical":
        return classicProfessional
      case "basic":
        return basicModern
      case "creative":
        return creative
      case "classic":
        return classic
      default:
        return basicModern
    }
  }

  const handleEditResume = async (resumeId) => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetResumeBuilderById}/${resumeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const { resume } = await response.json()

      // Save each section to localStorage
      localStorage.setItem(
        "resumeBuilderExperiences",
        JSON.stringify(resume.experiences || [])
      )
      localStorage.setItem(
        "resumeBuilderQualifications", 
        JSON.stringify(resume.qualifications || [])
      )
      localStorage.setItem(
        "resumeBuilderSkills",
        JSON.stringify(resume.skills || [])
      )
      localStorage.setItem(
        "resumeBuilderAchievements",
        JSON.stringify(resume.achievements || [])
      )
      localStorage.setItem(
        "resumeBuilderLanguages",
        JSON.stringify(resume.languages || [])
      )
      localStorage.setItem(
        "resumeBuilderCertifications",
        JSON.stringify(resume.certifications || [])
      )
      localStorage.setItem("selectedTemplate", resume.selectedTemplate || "")
      localStorage.setItem("resumeTitle", resume.resumeTitle || "")
      localStorage.setItem("ResumeBuilder-Id", resume._id || "")

      // Combine personal data into one object
      const personalData = {
        name: resume.name || "",
        jobTitle: resume.jobTitle || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        website: resume.website || [],
        summary: resume.summary || "",
        address: resume.address || "",
        city: resume.city || "",
        state: resume.state || "",
        postalCode: resume.postalCode || "",
        country: resume.country || ""
      }

      localStorage.setItem(
        "resumeBuilderPersonalData",
        JSON.stringify(personalData)
      )
      navigate("/scan-resume/create")
    } catch (error) {
      console.error("Error fetching resume by ID:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResume = async (resumeId) => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${BASE_URL}/api/resumeBuilder/view-resume/${resumeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const { resume } = await response.json()

      // Save each section to localStorage
      localStorage.setItem(
        "resumeBuilderExperiences",
        JSON.stringify(resume.experiences || [])
      )
      localStorage.setItem(
        "resumeBuilderQualifications",
        JSON.stringify(resume.qualifications || [])
      )
      localStorage.setItem(
        "resumeBuilderSkills",
        JSON.stringify(resume.skills || [])
      )
      localStorage.setItem(
        "resumeBuilderAchievements",
        JSON.stringify(resume.achievements || [])
      )
      localStorage.setItem(
        "resumeBuilderLanguages",
        JSON.stringify(resume.languages || [])
      )
      localStorage.setItem(
        "resumeBuilderCertifications",
        JSON.stringify(resume.certifications || [])
      )
      localStorage.setItem("selectedTemplate", resume.selectedTemplate || "")
      localStorage.setItem("resumeTitle", resume.resumeTitle || "")
      localStorage.setItem("ResumeBuilder-Id", resume._id || "")

      // Combine personal data into one object
      const personalData = {
        name: resume.name || "",
        jobTitle: resume.jobTitle || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        website: resume.website || [],
        summary: resume.summary || "",
        address: resume.address || "",
        city: resume.city || "",
        state: resume.state || "",
        postalCode: resume.postalCode || "",
        country: resume.country || ""
      }

      localStorage.setItem(
        "resumeBuilderPersonalData",
        JSON.stringify(personalData)
      )
      navigate("/scan-resume/showResume")
    } catch (error) {
      console.error("Error fetching resume by ID:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (resume) => {
    setSelectedResume(resume)
    setShowDeleteModal(true)
  }

  const handleResumeNavigation = async () => {
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
      const monthlyCredits = subData?.subscription?.remaining?.monthlyCredits ?? 0

      if (monthlyCredits < 9) {
        setShowUpgradeModal(true)
      } else {
        navigate("/scan-resume")
      }
    } catch (err) {
      setShowUpgradeModal(true)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedResume) return
    setShowDeleteModal(false)

    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.DeleteResumeBuilder}/${selectedResume._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.msg || "Failed to delete resume.")
      }

      successToast(result.msg || "Resume deleted successfully!")

      setResumes((prev) =>
        prev.filter((resume) => resume._id !== selectedResume._id)
      )
    } catch (error) {
      errorToast(
        error.message || "Something went wrong while deleting the resume."
      )
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setSelectedResume(null)
    }
  }

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full lg:px-10">
          
          {/* DEBUG BUTTONS - Remove these in production
          <div className="p-4 bg-red-900 text-white mb-4">
            <p>DEBUG MODE - Remove in production</p>
            <button 
              onClick={handleDebugTour}
              className="mr-2 px-3 py-1 bg-blue-600 rounded">
              Force Tour
            </button>
            <button 
              onClick={handleResetTour}
              className="mr-2 px-3 py-1 bg-green-600 rounded">
              Reset Tour
            </button>
            <button 
              onClick={debugTourState}
              className="px-3 py-1 bg-yellow-600 rounded text-black">
              Debug State
            </button>
          </div> */}

          <div className="justify-between flex pr-3 md:pr-0 w-full py-12">
            <div className="px-5 flex items-start gap-3">
              <p className="text-xl md:text-3xl justify-start font-bold text-primary" data-tour="ai-res-builder-resumeHeading">
                AI Resume Builder
              </p>
              <div className="group relative">
                <IoInformationCircleSharp
                  className="text-primary cursor-pointer transition-colors duration-200"
                  size={16}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-10">
                  <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
                    <strong>Uses 9 credits</strong>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3" data-tour="ai-res-builder-addNewRes">
              <Button
                onClick={handleResumeNavigation}
                className="p-3 px-5 flex items-center whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <FaPlus />
                New Resume
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <CircularIndeterminate />
            </div>
          ) : resumes.length === 0 ? (
            <div className="w-full h-80 bg-lightPurple justify-center items-center flex rounded-lg" data-tour="ai-res-builder-creatResBtn">
              <Button
                onClick={handleResumeNavigation}
                className="py-5 px-8 flex items-center space-x-2 max-w-40 min-w-max text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                CREATE YOUR RESUME FIRST
              </Button>
            </div>
          ) : (
            <div className="mt-5 w-full overflow-x-auto p-5 md:p-0">
              <table className="w-full border-collapse justify-between">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-4 px-4 text-primary font-medium">Name</th>
                    <th className="text-left py-4 px-4 text-primary font-medium">Job Title</th>
                    <th className="text-left py-4 px-4 text-primary font-medium">Template</th>
                    <th className="text-left py-4 px-4 text-primary font-medium">Last Updated</th>
                    <th className="text-left py-4 px-4 text-primary font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((resume) => (
                    <tr key={resume._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">{resume.name || "Resume"}</p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-primary">{resume.jobTitle || "Job Title"}</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-primary capitalize">{resume.selectedTemplate || "Basic"}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-primary">
                          {resume.updatedAt
                            ? formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDownloadResume(resume._id)}>
                              <FaEye size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Preview
                            </span>
                          </div>
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleEditResume(resume._id)}>
                              <FaEdit size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Edit
                            </span>
                          </div>
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDeleteClick(resume)}>
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
      <ResumeDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="resumeBuilder"
      />
    </DashBoardLayout>
  )
}

export default MainResumeBuilder