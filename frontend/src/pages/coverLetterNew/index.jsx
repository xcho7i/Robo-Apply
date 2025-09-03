import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../dashboardLayout"
import Button from "../../components/Button"
import { FaPlus } from "react-icons/fa"
import { IoInformationCircleSharp } from "react-icons/io5"
import CircularIndeterminate from "../../components/loader/circular"
import CoverLetterCard from "./ui/CoverLetterCard"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"
import DeleteModal from "./ui/DeleteModal"
import { errorToast, successToast } from "../../components/Toast"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { formatDistanceToNow } from "date-fns"
import { IoMdDownload } from "react-icons/io"
import { FaEye } from "react-icons/fa"
import { useTour, aiCoverLetter } from "@/src/stores/tours"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const MainCoverLetter = () => {
  const [loading, setLoading] = useState(true)
  const [coverLetters, setCoverLetters] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navigate = useNavigate()

  // const handleCoverLetterNavigation = () => {
  //   let subData = null

  //   try {
  //     const rawData = localStorage.getItem("subscription_data")
  //     subData = rawData ? JSON.parse(rawData) : null
  //   } catch (err) {
  //     console.error("Failed to parse subscription_data:", err)
  //     subData = null
  //   }

  //   const monthlyCredits = subData?.remaining?.monthlyCredits ?? 0

  //   if (monthlyCredits < 7) {
  //     setShowUpgradeModal(true)
  //   } else {
  //     navigate("/coverletter")
  //   }
  // }

    const { startModuleTourIfEligible } = useTour()
useEffect(() => {
  startModuleTourIfEligible("main-coverletter", aiCoverLetter, { showWelcome: false })
}, [startModuleTourIfEligible])

  const handleCoverLetterNavigation = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("No access token found.")
      return
    }

    setLoading(true) // ✅ Start loading

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

      if (monthlyCredits < 7) {
        setShowUpgradeModal(true)
      } else {
        navigate("/coverletter")
      }
    } catch (err) {
      setShowUpgradeModal(true)
    } finally {
      setLoading(false) // ✅ Stop loading
    }
  }

  const handleEditClick = async (coverLetter) => {
    const token = localStorage.getItem("access_token")
    const id = coverLetter._id

    if (!token || !id) {
      console.error("Missing token or cover letter ID")
      return
    }

    setLoading(true) // ✅ Start loading

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetCoverLetter}/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch cover letter details")
      }

      const data = await response.json()
      const coverLetterDetail = data.coverLetter

      // ✅ Save values to localStorage
      localStorage.setItem(
        "coverLetterUserData",
        JSON.stringify(coverLetterDetail.userData)
      )
      localStorage.setItem(
        "coverLetterCompanyData",
        JSON.stringify(coverLetterDetail.companyData)
      )
      localStorage.setItem("coverLetterBody", coverLetterDetail.letterBody)
      localStorage.setItem("coverLetter_id", coverLetterDetail._id)

      // ✅ Navigate after storing
      navigate("/show-cover-letter")
    } catch (error) {
      console.error("❌ Error fetching cover letter details:", error)
    } finally {
      setLoading(false) // ✅ Stop loading
    }
  }

  const handleDeleteClick = (coverLetter) => {
    setSelectedCoverLetter(coverLetter)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedCoverLetter) return
    setShowDeleteModal(false)

    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetCoverLetter}/${selectedCoverLetter._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.msg || "Failed to delete cover letter.")
      }

      successToast(result.msg)

      // Remove deleted item from UI
      setCoverLetters((prev) =>
        prev.filter((cl) => cl._id !== selectedCoverLetter._id)
      )
    } catch (error) {
      errorToast(error)
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setSelectedCoverLetter(null)
    }
  }

  useEffect(() => {
    // ✅ Clear specific items from localStorage
    localStorage.removeItem("coverLetterBody")
    localStorage.removeItem("coverLetterCompanyData")
    localStorage.removeItem("coverLetterUserData")
    localStorage.removeItem("jobInMind")
    localStorage.removeItem("cv_data")
    localStorage.removeItem("coverLetter_id")

    const token = localStorage.getItem("access_token")
    if (!token) {
      setLoading(false)
      return
    }

    const fetchCoverLetters = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}${API_ENDPOINTS.GetCoverLetter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch cover letters.")
        }

        const data = await response.json()
        setCoverLetters(data.coverLetters.docs)
      } catch (error) {
        errorToast("❌ Error fetching cover letters:", error)
        setCoverLetters([])
      } finally {
        setLoading(false)
      }
    }

    fetchCoverLetters()
  }, [])

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full lg:px-10">
          <div className="justify-between flex pr-3 md:pr-0 w-full py-12">
            <div className="px-5" data-tour="ai-coverletter-cvrLtrHeading">
              <div className="flex items-start gap-3">
                <p className="text-xl md:text-3xl justify-start font-bold text-primary">
                  My Cover Letters
                </p>
                <div className="group relative">
                  <IoInformationCircleSharp
                    className="text-primary hover:text-purple-400 cursor-pointer transition-colors duration-200"
                    size={16}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-50">
                    <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
                      <strong>Uses 7 credits</strong>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p>View, Edit and Share your cover letters here.</p>
            </div>
            <div className="flex items-center gap-3" data-tour="ai-coverletter-addNewCvrLtr">
              <Button
                onClick={handleCoverLetterNavigation}
                className="p-3 px-5 flex items-center whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <FaPlus />
                New Cover Letter
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <CircularIndeterminate />
            </div>
          ) : coverLetters.length === 0 ? (
            <div className="w-full h-80 bg-lightPurple justify-center items-center flex rounded-lg" data-tour="ai-coverletter-createCvrLtr">
              <Button
                onClick={handleCoverLetterNavigation}
                className="py-5 px-8 flex items-center space-x-2 max-w-40 min-w-max text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                CREATE YOUR COVER LETTER FIRST
              </Button>
            </div>
          ) : (
            // <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-5 md:p-0 mt-5">
            //   {(() => {
            //     const nameCount = {}
            //     return coverLetters.map((coverLetter) => {
            //       let baseName = coverLetter.userData?.name || "Cover Letter"
            //       if (nameCount[baseName]) {
            //         const suffix = `(${nameCount[baseName]})`
            //         baseName = `${baseName}${suffix}`
            //         nameCount[coverLetter.userData?.name] += 1
            //       } else {
            //         nameCount[baseName] = 1
            //       }
            //       return (
            //         <CoverLetterCard
            //           key={coverLetter._id}
            //           coverLetterName={baseName}
            //           onEditClick={() => handleEditClick(coverLetter)}
            //           onDeleteClick={() => handleDeleteClick(coverLetter)}
            //         />
            //       )
            //     })
            //   })()}
            // </div>
            <div className="mt-5 w-full overflow-x-auto p-5 md:p-0">
              <table className="w-full border-collapse justify-between">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Name
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Company Name
                    </th>
                    <th className="text-left py-4 px-4 text-primary font-medium">
                      Last Updated
                    </th>
                    <th className="text-center py-4 px-4 text-primary font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coverLetters.map((coverLetter) => (
                    <tr
                      key={coverLetter._id}
                      className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {coverLetter.userData?.name || "Cover Letter"}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        <p className="text-primary font-medium">
                          {coverLetter.companyData?.name || "N/A"}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-primary">
                          {coverLetter.updatedAt
                            ? formatDistanceToNow(
                                new Date(coverLetter.updatedAt),
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
                              onClick={() => handleEditClick(coverLetter)}>
                              <FaEye size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Preview
                            </span>
                          </div>
                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleEditClick(coverLetter)}>
                              <FaEdit size={20} />
                            </Button>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                              Edit
                            </span>
                          </div>

                          <div className="group relative">
                            <Button
                              className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              onClick={() => handleDeleteClick(coverLetter)}>
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
        context="coverLetter"
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </DashBoardLayout>
  )
}

export default MainCoverLetter
