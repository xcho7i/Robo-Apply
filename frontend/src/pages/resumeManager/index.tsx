import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashBoardLayout from "../../dashboardLayout"
import Button from "../../components/Button"
import uploadResumeHere from "../../assets/resumeManagerIcons/uploadResumeIcon.svg"
import { HiArrowLeft } from "react-icons/hi"
import { FaEdit } from "react-icons/fa"
import { MdDelete, MdEdit } from "react-icons/md"
import { formatDistanceToNow } from "date-fns"
import ResumeUploadModal from "../../components/Modals/ResumeUploadModal"
import EditResumeNameModal from "../../components/Modals/EditResumeNameModal"
import DeleteResumeModal from "../../components/Modals/DeleteResumeModal"
import { successToast, errorToast } from "@/src/components/Toast"
import CircularIndeterminate from "../../components/loader/circular"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import API_ENDPOINTS from "../../api/endpoints"
import {
  deleteResume,
  getAllResumes,
  getResumeDetails
} from "@/src/api/functions"
import { ResumeList } from "@types"
import { BASE_URL } from "@/src/api"
import { User } from "@/src/api/functions/user"
import { useDashboardStore } from "@/src/stores/dashboard"
import dayjs from "dayjs"
import { useTour, resumeManagerSteps } from "@/src/stores/tours"

const UploadAndShowResume = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [currentEditingResume, setCurrentEditingResume] =
    useState<ResumeList | null>(null)
  const [currentDeletingResume, setCurrentDeletingResume] =
    useState<ResumeList | null>(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // const [resumes, setResumes] = useState<ResumeList[]>([])
  const resumes = useDashboardStore((state) => state.resumeList)
  const setResumes = useDashboardStore((state) => state.setResumeList)
    // const { startModuleTourIfEligible } = useTour()

const { startModuleTourIfEligible } = useTour()
useEffect(() => {
  startModuleTourIfEligible("resume-manager", resumeManagerSteps, { showWelcome: false })
}, [startModuleTourIfEligible])

  const generateDropdownOptions = (resume) => [
    {
      label: "Edit Resume Name",
      action: () => handleEditResumeName(resume)
    },
    {
      label: "Delete Resume",
      action: () => handleDeleteResume(resume)
    }
  ]

  const handleEditResumeName = (resume) => {
    setCurrentEditingResume(resume)
    setEditModalOpen(true)
  }

  const handleDeleteResume = (resume) => {
    setCurrentDeletingResume(resume)
    setDeleteModalOpen(true)
  }

  const handleResumeSubmit = (resumeName, file) => {
    if (resumes.some((resume) => resume.name === resumeName)) {
      errorToast("A resume with this name already exists.")
      return
    }

    setResumes([
      ...resumes,
      {
        name: resumeName,
        status: "Not Completed",
        _id: "",
        updatedAt: dayjs().format(),
        jobTitle: ""
      }
    ])
    successToast("Resume uploaded successfully!")

    navigate("/resume-manager/editResume", { state: { resumeName, file } })
  }

  const handleSaveEditedName = async (newName: string) => {
    if (!newName.trim()) {
      errorToast("Resume name cannot be empty.")
      return
    }

    if (resumes.some((resume) => resume.name === newName)) {
      errorToast("A resume with this name already exists.")
      return
    }
    setEditModalOpen(false)
    setLoading(true)

    const token = localStorage.getItem("access_token")
    if (!token) {
      errorToast("Authorization token is missing.")
      setLoading(false)
      return
    }

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.UpdateResume(
      currentEditingResume?._id || ""
    )}`

    try {
      const response = await fetch(fullUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resumeName: newName })
      })

      if (!response.ok) {
        throw new Error("Failed to update resume name")
        setLoading(false)
      }

      setResumes(
        resumes.map((resume) =>
          resume._id === currentEditingResume?._id
            ? { ...resume, name: newName }
            : resume
        )
      )
      setLoading(false)
      successToast("Resume name updated successfully!")
      setCurrentEditingResume(null)
    } catch (error) {
      setLoading(false)
      errorToast("Failed to update resume name.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!currentDeletingResume || !currentDeletingResume._id) {
      errorToast("Resume ID missing. Cannot delete.")
      return
    }

    const resumeId = currentDeletingResume._id
    setDeleteModalOpen(false)
    setLoading(true)

    try {
      const res = await deleteResume(resumeId)
      if (res.success == false) {
        errorToast(res.message)
        setLoading(false)
        return
      }
      if (res.success) {
        successToast(res.message)
        setResumes(resumes.filter((resume) => resume._id !== resumeId))
      }
    } catch (error) {
      errorToast("Failed to delete resume.")
    } finally {
      setLoading(false)
      setCurrentDeletingResume(null)
    }
  }

  const handleEditClick = async (resume: ResumeList) => {
    setLoading(true)

    try {
      const res = await getResumeDetails(resume._id)
      if (res.error) {
        errorToast(res.error)
        return
      }

      if (res.resume) {
        localStorage.setItem("resumeResponse", JSON.stringify(res.resume))
        localStorage.setItem("resumeName", res.resume.resumeName)
        localStorage.setItem("resumeUrlPath", res.resume.resumeUrl)
        localStorage.setItem("jobTitle", res.resume.jobTitle)
        localStorage.setItem("resumeId", res.resume._id)

        localStorage.setItem("edited", "true")
        setLoading(false)

        navigate("/resume-manager/editResume", {
          state: {
            resumeName: resume.name,
            _id: resume._id
          }
        })
      }
    } catch (error) {
      errorToast("Failed to fetch resume details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    getAllResumes()
      .then((res) => {
        if (res.error) {
          errorToast(res.error)
        }
        if (res.resumes) {
          setResumes(res.resumes)
        }
      })
      .finally(() => {
        setLoading(false)
      })
    localStorage.removeItem("edited")
    localStorage.removeItem("resumeUrlPath")
    localStorage.removeItem("resumeName")
    localStorage.removeItem("resumeResponse")
    localStorage.removeItem("jobTitle")
  }, [])

  const handleUploadResumeClick = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      errorToast("Please log in to continue.")
      return
    }

    setLoading(true)

    try {
      const res = await User.getSubscriptionData()
      if (!res.success) {
        errorToast(res.message)
        setLoading(false)
        return
      }

      const resumeProfiles =
        res.data?.subscription?.remaining?.resumeProfiles ?? 0

      if (resumeProfiles > 0) {
        setUploadModalOpen(true)
      } else {
        setShowUpgradeModal(true)
      }
    } catch (error) {
      errorToast("Failed to check subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full lg:px-10">
          <div className="justify-end flex pr-3 md:pr-0 w-full py-7">
            <div className="flex items-center gap-3">
            <div data-tour="rm-upload-btn" style={{ display: "inline-block", scrollMarginTop: 100 }}>

              <Button
              
                onClick={handleUploadResumeClick}
                className="p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <img
                  src={uploadResumeHere}
                  className="mr-2"
                  alt="Upload Icon"
                  loading="lazy"
                />
                {/* Upload Resume */}
                Create New Profile
              </Button>
              </div>  
              <Button
                onClick={() => navigate("/auto-apply")}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <HiArrowLeft className="mr-2" />
                Go Back
              </Button>
            </div>
          </div>

          <section
          data-tour="rm-workspace"
          style={{ scrollMarginTop: 100 }}   // sticky header offset
          className="px-5"
        >
            <p className="text-xl md:text-2xl justify-start font-normal text-primary">
              Edit your resumes/CV's
            </p>
         

          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <CircularIndeterminate />
            </div>
          ) : resumes.length === 0 ? (
            <div className="w-full h-80 bg-lightPurple justify-center items-center flex rounded-lg">
              <Button
                onClick={handleUploadResumeClick}
                className="py-5 px-8 flex items-center space-x-2 max-w-40 min-w-max text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                UPLOAD YOUR RESUME FIRST
              </Button>
            </div>
          ) : (
            <div className="mt-5 w-full overflow-x-auto p-5 md:p-0">
              <table className="w-full border-collapse justify-between">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Profile Name
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Job Title
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Last Updated
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Action Buttons
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((resume, index) => (
                    <tr
                      key={resume._id}
                      className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {`${resume.name}` || "Resume"}
                        </p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {`${resume.jobTitle}` || "Resume"}
                        </p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-primary capitalize">
                          {/* {resume.status || "Not Completed"} */}
                          Completed
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-primary">
                          {resume.updatedAt
                            ? formatDistanceToNow(new Date(resume.updatedAt), {
                                addSuffix: true
                              })
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleEditResumeName(resume)}>
                              <MdEdit size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Edit Name
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleEditClick(resume)}>
                              <FaEdit size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Edit File
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDeleteResume(resume)}>
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
           </section>
        </div>
      </div>

      <ResumeUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleResumeSubmit}
      />

      {currentEditingResume && (
        <EditResumeNameModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setCurrentEditingResume(null)
          }}
          currentName={currentEditingResume.name}
          onSave={handleSaveEditedName}
        />
      )}

      {currentDeletingResume && (
        <DeleteResumeModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setCurrentDeletingResume(null)
          }}
          resumeName={currentDeletingResume.name}
          onConfirm={handleConfirmDelete}
        />
      )}

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
        }}
        context="resumeUpload"
      />
    </DashBoardLayout>
  )
}

export default UploadAndShowResume
