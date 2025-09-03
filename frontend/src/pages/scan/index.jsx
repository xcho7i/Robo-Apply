import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Template from "./ui/template" // Ensure the correct path to Template
import DashboardNavbar from "../../dashboardNavbar" // Ensure the correct path to DashboardNavbar
import { FaArrowLeft } from "react-icons/fa" // Import the icon from react-icons
import { FaStar } from "react-icons/fa" // For the star icon
import { IoCheckmarkCircleOutline } from "react-icons/io5" // For the autosaved icon
import CustomSwitch from "./ui/CustomSwitch"
import VerticalBarChart from "./ui/BarChart"
import UploadResumeDialog from "./ui/Popup"

import html2canvas from "html2canvas"
import jsPDF from "jspdf"

import Report from "./ui/Report"
import CircularProgressBarScan from "../../components/CircularProgressBarScan"
import CircularIndeterminate from "../../components/loader/circular"
import Button from "../../components/Button"
import UploadResumeScanDialog from "./ui/scanPopup"
import DashBoardLayout from "../../dashboardLayout"
import API_ENDPOINTS from "../../api/endpoints"
import { successToast, errorToast } from "../../components/Toast"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import ResumeScoreLoader from "../../components/loader/ResumeScoreLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const ScanPage = () => {
  const navigate = useNavigate()

  const [checked, setChecked] = React.useState(false)
  const [viewOn, setViewOn] = React.useState(true)

  const [dialogOpen, setDialogOpen] = useState(true)
  const [scandialogOpen, setScandialogOpen] = useState(false)
  const [loading, setLoading] = useState(false) // New state for loading spinner
  const [showContent, setShowContent] = useState(false) // For controlling content visibility

  const [progress, setProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)
  const [searchabilityText, setSearchabilityText] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    setDialogOpen(true) // Open dialog box on page load
  }, [])

  const handleDialogClose = () => {
    setDialogOpen(false)
  }
  const handleDialogClosepopup = () => {
    setScandialogOpen(false)
  }

  // const handleDialogSubmit = (formData) => {
  //   const accessToken = localStorage.getItem("access_token");
  //   if (!accessToken) {
  //     errorToast("Please log in to continue.");
  //     return;
  //   }
  //   setScandialogOpen(false);
  //   setDialogOpen(false);
  //   setLoading(true);

  //   const scanUrl = `${BASE_URL}${API_ENDPOINTS.ResumeScore}`; // Ensure this is defined correctly

  //   fetch(scanUrl, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //     body: formData,
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data && data.scoring && data.resume_data) {
  //         // Save relevant sections into localStorage
  //         localStorage.setItem("resumeScoreData", JSON.stringify(data.scoring));
  //         localStorage.setItem(
  //           "resumeHardSkills",
  //           JSON.stringify(data.hard_skills)
  //         );
  //         localStorage.setItem(
  //           "resumeSoftSkills",
  //           JSON.stringify(data.soft_skills)
  //         );
  //         localStorage.setItem(
  //           "resumeSearchability",
  //           JSON.stringify(data.Searchability)
  //         );
  //         localStorage.setItem(
  //           "resumeRecruiter_Tips",
  //           JSON.stringify(data.Recruiter_Tips)
  //         );
  //         localStorage.setItem(
  //           "resumeFormatting",
  //           JSON.stringify(data.Formatting)
  //         );
  //         localStorage.setItem(
  //           "resumeParsedData",
  //           JSON.stringify(data.resume_data)
  //         );

  //         const searchabilityData = data.scoring.find(
  //           (item) => item.title === "Searchability"
  //         );
  //         if (
  //           searchabilityData &&
  //           typeof searchabilityData.progress === "number"
  //         ) {
  //           setProgress(0); // Reset before starting
  //           setTargetProgress(searchabilityData.progress);
  //         }

  //         const summary = data.Searchability?.summary;
  //         if (summary) {
  //           setSearchabilityText(summary);
  //         }

  //         setShowContent(true); // << Show the result content now
  //         successToast("Resume scan successful!");
  //       } else {
  //         errorToast("Unexpected response format.");
  //         console.error("Unexpected scan data:", data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Scan API error:", err);
  //       errorToast("An error occurred during scan.");
  //     })
  //     .finally(() => {
  //       setLoading(false); // Always stop loading indicator
  //       setShowContent(true);
  //     });
  // };

  const handleDialogSubmit = async (formData) => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      errorToast("Please log in to continue.")
      return
    }

    setScandialogOpen(false)
    setDialogOpen(false)
    setLoading(true)

    try {
      // Step 1: Check subscription credits
      const subRes = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SubscriptionData}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!subRes.ok) {
        throw new Error("Failed to fetch subscription data.")
      }

      const subData = await subRes.json()
      const monthlyCredits =
        subData?.subscription?.remaining?.monthlyCredits ?? 0

      if (monthlyCredits < 8) {
        setShowUpgradeModal(true)
        setLoading(false)
        return
      }

      // Step 2: Proceed with scan
      const scanUrl = `${BASE_URL}${API_ENDPOINTS.ResumeScore}`

      const res = await fetch(scanUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData
      })

      const data = await res.json()

      if (data && data.scoring && data.resume_data) {
        localStorage.setItem("resumeScoreData", JSON.stringify(data.scoring))
        localStorage.setItem(
          "resumeHardSkills",
          JSON.stringify(data.hard_skills)
        )
        localStorage.setItem(
          "resumeSoftSkills",
          JSON.stringify(data.soft_skills)
        )
        localStorage.setItem(
          "resumeSearchability",
          JSON.stringify(data.Searchability)
        )
        localStorage.setItem(
          "resumeRecruiter_Tips",
          JSON.stringify(data.Recruiter_Tips)
        )
        localStorage.setItem(
          "resumeFormatting",
          JSON.stringify(data.Formatting)
        )
        localStorage.setItem(
          "resumeParsedData",
          JSON.stringify(data.resume_data)
        )

        const searchabilityData = data.scoring.find(
          (item) => item.title === "Searchability"
        )
        if (
          searchabilityData &&
          typeof searchabilityData.progress === "number"
        ) {
          setProgress(0)
          setTargetProgress(searchabilityData.progress)
        }

        const summary = data.Searchability?.summary
        if (summary) {
          setSearchabilityText(summary)
        }

        setShowContent(true)
        successToast("Resume scan successful!")
      } else {
        errorToast("Unexpected response format.")
        console.error("Unexpected scan data:", data)
      }
    } catch (err) {
      console.error("Scan API error:", err)
      errorToast("An error occurred during scan.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewScan = () => {
    setProgress(0)
    setTargetProgress(0)
    setShowContent(false)
    setDialogOpen(true) // Open the dialog
  }
  const handleNewScanPopup = () => {
    setScandialogOpen(true) // Open the dialog
    console.log("new scan")
  }

  const handleChange = (event) => {
    setChecked(event.target.checked)
  }

  useEffect(() => {
    // Get resume score data from localStorage
    const resumeScoreData =
      JSON.parse(localStorage.getItem("resumeScoreData")) || []

    // Find the Searchability item and get its progress
    const searchabilityData = resumeScoreData.find(
      (item) => item.title === "Searchability"
    )

    if (searchabilityData && typeof searchabilityData.progress === "number") {
      setTargetProgress(searchabilityData.progress)
    }

    // Get searchability text from localStorage
    const resumeSearchability = JSON.parse(
      localStorage.getItem("resumeSearchability")
    )

    if (resumeSearchability && resumeSearchability.summary) {
      setSearchabilityText(resumeSearchability.summary)
    }
  }, [showContent]) // Added showContent as dependency to update when content loads

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < targetProgress) {
          return prevProgress + 1
        } else {
          clearInterval(interval)
          return prevProgress
        }
      })
    }, 20)
    return () => clearInterval(interval)
  }, [targetProgress, showContent])

  const downloadAsPDF = async () => {
    setLoading(true)

    // Get the template element and temporarily store the original width
    const templateElement = document.getElementById("template")
    const originalWidth = templateElement.style.width

    // Temporarily set width for proper scaling
    templateElement.style.width = "1000px"

    // Capture canvas
    const canvas = await html2canvas(templateElement, { scale: 2 })
    const image = canvas.toDataURL("image/png")

    // Restore the original width after the canvas generation
    templateElement.style.width = originalWidth

    const pdf = new jsPDF("p", "mm", "a4")

    const margins = {
      top: 10,
      bottom: 5,
      left: 10,
      right: 5
    }

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const availableWidth = pageWidth - margins.left - margins.right
    const availableHeight = pageHeight - margins.top - margins.bottom

    const imageWidth = canvas.width
    const imageHeight = canvas.height

    const ratio = availableWidth / imageWidth
    const scaledWidth = availableWidth
    const scaledHeight = imageHeight * ratio

    const adjustedScaledHeight = Math.min(scaledHeight, availableHeight)

    pdf.addImage(
      image,
      "PNG",
      margins.left,
      margins.top,
      scaledWidth,
      adjustedScaledHeight
    )

    pdf.save("resume.pdf")

    // Hide the loading spinner after the PDF is saved
    setLoading(false)
  }

  const handleSave = () => {
    // Collect all data from localStorage
    const resumeScoreData = localStorage.getItem("resumeScoreData")
    const resumeHardSkills = localStorage.getItem("resumeHardSkills")
    const resumeSoftSkills = localStorage.getItem("resumeSoftSkills")
    const resumeSearchability = localStorage.getItem("resumeSearchability")
    const resumeRecruiter_Tips = localStorage.getItem("resumeRecruiter_Tips")
    const resumeFormatting = localStorage.getItem("resumeFormatting")
    const resumeParsedData = localStorage.getItem("resumeParsedData")
    const resumeScoreJobDescription = localStorage.getItem(
      "resumeScoreJobDescription"
    ) // ✅ New

    // Create FormData object
    const formData = new FormData()

    // Add data to FormData
    if (resumeScoreData) formData.append("scoreData", resumeScoreData)
    if (resumeHardSkills) formData.append("hardSkills", resumeHardSkills)
    if (resumeSoftSkills) formData.append("softSkills", resumeSoftSkills)
    if (resumeSearchability)
      formData.append("searchability", resumeSearchability)
    if (resumeRecruiter_Tips)
      formData.append("recruiterTips", resumeRecruiter_Tips)
    if (resumeFormatting) formData.append("formatting", resumeFormatting)
    if (resumeParsedData) formData.append("parsedData", resumeParsedData)
    if (resumeScoreJobDescription)
      formData.append("jobDescription", resumeScoreJobDescription) // ✅ New

    // Create regular object for easier debugging
    const bodyData = {
      scoreData: resumeScoreData ? JSON.parse(resumeScoreData) : null,
      hardSkills: resumeHardSkills ? JSON.parse(resumeHardSkills) : null,
      softSkills: resumeSoftSkills ? JSON.parse(resumeSoftSkills) : null,
      searchability: resumeSearchability
        ? JSON.parse(resumeSearchability)
        : null,
      recruiterTips: resumeRecruiter_Tips
        ? JSON.parse(resumeRecruiter_Tips)
        : null,
      formatting: resumeFormatting ? JSON.parse(resumeFormatting) : null,
      parsedData: resumeParsedData ? JSON.parse(resumeParsedData) : null,
      jobDescription: resumeScoreJobDescription || null // ✅ New
    }

    console.log("=== Body Data Object ===", bodyData)

    // Show success message
    successToast("Data collected successfully! Check console for details.")
  }

  return (
    <>
      {loading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-black  z-50">
          {/* <CircularIndeterminate /> */}
          <ResumeScoreLoader />
        </div>
      ) : (
        <>
          <div className="bg-almostBlack min-h-screen ">
            {/* Rest of the content */}
            {showContent && (
              <div className="lg:p-4">
                {/* Header */}
                <DashboardNavbar />
                <div className="flex justify-center  flex-col items-center gap-8 w-full  border border-gray-800 py-6">
                  <div className="md:flex md:justify-between items-center w-[87%]">
                    <h1 className="text-2xl pb-4 md:pb-0 font-bold">
                      AI Resume Score
                    </h1>
                    <div className="flex flex-end gap-2">
                      {viewOn && (
                        <Button
                          onClick={downloadAsPDF}
                          className="flex items-center justify-center p-2 text-base whitespace-nowrap md:text-lg font-semibold w-full h-12 text-white bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                          Download as PDF
                        </Button>
                      )}
                      {/* <Button
                        onClick={handleSave}
                        className="flex items-center justify-center p-2 text-base whitespace-nowrap md:text-lg font-semibold w-full h-12 text-white bg-gradient-to-b from-green-500 to-green-600 rounded-lg hover:ring-2 hover:ring-green-600 focus:ring-2 focus:ring-green-600">
                        Save
                      </Button> */}
                      <Button
                        onClick={() => navigate("/auto-apply")}
                        className="flex items-center justify-center gap-1 p-2 text-base whitespace-nowrap md:text-lg font-semibold w-full h-12 text-white bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                      <FaArrowLeft className="mr-2" />
                      Go to Dashboard
                      </Button>
                      <Button
                        // onClick={() => navigate("handle")}
                        onClick={handleNewScan}
                        className="flex items-center justify-center gap-1 p-2 text-base whitespace-nowrap md:text-lg font-semibold w-full h-12 text-white bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                        <FaArrowLeft className="mr-2" />
                        Go Back
                      </Button>
                    </div>
                  </div>

                  {/* Instruction Header */}
                  <div className="w-full md:w-[87%]">
                    <div className="mx-6">
                      <h2 className="text-lg font-bold">
                        Validate and update the resume you've uploaded
                      </h2>
                      <p className="text-white text-base md:text-lg md:font-bold">
                        The imported resume may lead to inaccurate parsing;
                        please validate or add any missing information.
                        (One-time exercise)
                      </p>
                    </div>
                  </div>
                  {/* Banner */}

                  <div className="bg-[#9A3CF9] w-[87%] h-[1px]"></div>
                  <div className="bg-purple-600 text-white md:flex md:justify-between items-start px-3 md:px-6 py-3 rounded-lg shadow-lg bg-[#9A3CF9] w-[87%]">
                    <div className="flex pb-4 md:pb-0 items-start">
                      <FaStar className="mr-2" />
                      <span className="font-semibold ">
                        Product UI Designer.pdf
                      </span>
                    </div>

                    <div className="flex space-x-4 md:space-x-6">
                      <div>
                        <label className="flex  md:items-center ">
                          <span className="mr-2 text-sm md:font-semibold font-semibold">
                            Highlight skills
                          </span>
                          <CustomSwitch
                            checked={checked}
                            onChange={handleChange}
                          />
                        </label>
                      </div>

                      <div className="flex items-center pb-1 md:pb-0">
                        <IoCheckmarkCircleOutline
                          className="mr-1 text-lg"
                          size={20}
                        />
                        <span className="text-sm md:font-semibold font-semibold">
                          Autosaved
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg shadow-md md:p-4 flex justify-center w-full">
                    <div className="flex flex-wrap justify-between w-[90%]">
                      {/* Left Sction */}
                      <div className="w-full lg:w-1/3 md:p-4 p-2 flex flex-col justify-start gap-">
                        <div className="bg-purple-600 text-white md:p-6 rounded-lg">
                          {showContent && (
                            <div
                              className="space-x-2"
                              style={{
                                display: "flex",
                                justifyContent: "center"
                              }}>
                              <div className="rounded-full px-2 py-4">
                                <CircularProgressBarScan
                                  progress={progress}
                                  size={150}
                                  strokeWidth={20}
                                />
                              </div>
                              <div className="flex flex-col my-auto">
                                <p className="mt-5">Keep improving!</p>
                                <p className="text-sm mt-2">
                                  {searchabilityText ||
                                    "Keep making recommended updates to your resume to reach a score of 75% or more."}
                                </p>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handleNewScanPopup}
                            className="text-purple-600 font-bold py-2 px-4 rounded-lg mt-4 bg-[#9A3CF9]">
                            New Scan
                          </button>
                        </div>

                        <div className=" rounded-lg md:p-4 pb-2 mt-4 md:mt-0">
                          <h4 className="text-sm font-bold mb-4">
                            Match Ratio History
                          </h4>
                          {/* Vertical Chart in its own fixed container */}
                          <div className="relative">
                            <VerticalBarChart />
                          </div>
                        </div>

                        <Report />
                      </div>
                      {/* RIGHT SECTION */}
                      <div className="flex w-full lg:w-2/3 flex-col ">
                        <div className="w-full">
                          <div className="py-4 px-2 rounded-lg shadow-md">
                            <Template
                              downloadAsPDF={downloadAsPDF}
                              setViewOn={setViewOn}
                              viewOn={viewOn}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <UploadResumeScanDialog
              open={scandialogOpen}
              onClose={handleDialogClosepopup}
              onSubmit={handleDialogSubmit}
            />

            <UpgradePlanModal
              isOpen={showUpgradeModal}
              onClose={() => {
                setShowUpgradeModal(false)
                navigate("/auto-apply")
              }}
              context="scan"
            />

            {dialogOpen && (
              <DashBoardLayout>
                <UploadResumeDialog
                  open={dialogOpen}
                  onClose={handleDialogClose}
                  onSubmit={handleDialogSubmit}
                />
              </DashBoardLayout>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default ScanPage
