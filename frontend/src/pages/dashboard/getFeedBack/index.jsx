import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../../dashboardLayout"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import { HiArrowLeft } from "react-icons/hi"
import RatingComponent from "../../../components/RatingComponent"
import TextAreaComponent from "../../../components/TextAreaComponent"
import LimitCard from "../ui/LimitCard"
import ReportSubmitModal from "../../../components/Modals/ReportSubmitModal"
import ReportModal from "../../../components/Modals/ReportModal"
import { successToast, errorToast } from "../../../components/Toast"
import linkedInImg from "../../../assets/dashboardIcons/linkedinImage.svg"
import indeedImg from "../../../assets/dashboardIcons/indeedImage.svg"
import zipRecruiterImg from "../../../assets/dashboardIcons/ziprecruiterImage.svg"
import glassdoorImg from "../../../assets/dashboardIcons/glassdoorImage.svg"
import monsterImg from "../../../assets/dashboardIcons/monsterImage.svg"
import simplyHiredImg from "../../../assets/dashboardIcons/simplyHiredImage.svg"

const GetFeedback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // const { logo, platformName } = location.state || {};
  const [platformName, setPlatformName] = useState("")
  const [logo, setLogo] = useState("")

  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")
  const [isReportModalOpen, setReportModalOpen] = useState(false)
  const [isReportSubmittedModalOpen, setReportSubmittedModalOpen] =
    useState(false)

  const handleRatingSelected = (newRating) => {
    setRating(newRating)
  }

  const handleTextChange = (text) => {
    setFeedbackText(text)
  }

  const handleButtonClick = () => {
    if (rating === 0 || feedbackText.trim() === "") {
      errorToast("Please provide a rating and feedback before submitting.")
    } else {
      console.log("Selected Rating:", rating)
      console.log("Feedback Text:", feedbackText)
      successToast("Feedback submitted successfully!")
      handleReset()
      navigate("/auto-apply")
    }
  }
  const handleGoBack = () => {
    navigate("/dashboard/job-apply", { replace: true })
  }

  const handleReset = () => {
    setRating(0)
    setFeedbackText("")
  }

  const openReportModal = () => {
    setReportModalOpen(true)
  }

  const closeReportModalAndOpenSubmit = () => {
    setReportModalOpen(false)
    setReportSubmittedModalOpen(true)
  }

  useEffect(() => {
    const name = localStorage.getItem("platformName") || "Unknown"
    setPlatformName(name)

    // Map of platform names to logo imports
    const platformLogos = {
      linkedin: linkedInImg,
      indeed: indeedImg,
      ziprecruiter: zipRecruiterImg,
      glassdoor: glassdoorImg,
      monster: monsterImg,
      simplyhired: simplyHiredImg
    }

    const selectedLogo = platformLogos[name.toLowerCase()] || ""
    setLogo(selectedLogo)

    console.log("📌 platformName from localStorage:", name)
    console.log("🖼️ Logo image being shown:", selectedLogo)
  }, [])

  return (
    <>
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div>
            <div className="w-full flex items-center justify-between px-5 md:px-16 border-t-0 border-l-0 border border-r-0 border-b-dashboardborderColor">
              {/* <div className="items-center w-full flex space-y-3 space-x-3 md:space-x-5 py-5">
                {logo && (
                  <img
                    src={logo}
                    alt={`${platformName} Logo`}
                    className="w-10 h-10"
                    loading="lazy"
                  />
                )}
                <p className="text-xl md:text-2xl font-normal text-primary">
                  {platformName || "No Platform Selected"}
                </p>
              </div> */}
              <div className="items-center w-full flex space-y-3 space-x-3 md:space-x-5 py-5">
                {logo && (
                  <img
                    src={logo}
                    alt={`${platformName} Logo`}
                    className="w-10 h-10"
                    loading="lazy"
                  />
                )}
                <p className="text-xl md:text-2xl font-normal text-primary">
                  {platformName || "No Platform Selected"}
                </p>
              </div>

              <div className="items-center w-full  justify-end flex space-y-3 space-x-5 py-5">
                <Button
                  onClick={handleGoBack}
                  className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  <HiArrowLeft className="mr-2 " />
                  Go Back
                </Button>
              </div>
            </div>

            <div className="w-full block lg:flex justify-center px-5 md:px-10 py-5 gap-5">
              <div className="flex-1 border rounded-lg flex items-center bg-lightPurple justify-center ">
                <div className="w-full h-full flex flex-col items-center py-5 px-5 md:px-10 rounded-lg border space-y-3">
                  <div className="w-full flex justify-center">
                    <p className="text-primary text-xl font-medium">
                      Feedback - AIJOBS
                    </p>
                  </div>

                  <div className="w-full flex justify-center">
                    <RatingComponent
                      onRatingSelected={handleRatingSelected}
                      rating={rating}
                    />
                  </div>

                  <div className="w-full flex justify-center">
                    <p className="text-primary text-base font-normal">
                      Any suggestions/what went wrong/what should we improve?
                    </p>
                  </div>

                  <div className="w-full flex justify-center">
                    <TextAreaComponent
                      className="w-full h-32 placeholder:text-primary"
                      placeholder="Type your issues, suggestions, feedback here ...."
                      onTextChange={handleTextChange}
                      value={feedbackText}
                    />
                  </div>

                  <div className="w-full flex justify-center">
                    <Button
                      onClick={handleButtonClick}
                      className="p-4 flex items-center space-x-2 w-full md:w-[70%] justify-center text-xl font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                      Submit Feedback
                    </Button>
                  </div>
                  {/* <div className="w-full flex justify-center">
                    <p>Wrong Answer Submitted While Automating ?</p>
                  </div>
                  <div className="w-full flex justify-center">
                    <Button
                      onClick={openReportModal}
                      className="text-purpleColor text-2xl font-semibold"
                    >
                      Click here to report question / answer’s
                    </Button>
                  </div> */}
                </div>
              </div>
              <br />

              <div className="flex-1 border rounded-lg flex items-center  bg-lightPurple justify-center ">
                <div className="w-full h-full flex flex-col px-3 md:px-5 items-center py-10 rounded-lg border space-y-5">
                  <div className="w-full flex justify-start">
                    <Link
                      className="text-primary text-2xl font-bold px-5 hover:underline"
                      onClick={handleReset}>
                      Reset
                    </Link>
                  </div>

                  <div className="w-full flex justify-start">
                    <LimitCard
                      jobLimit="100%"
                      progressValue={100}
                      title="Percentage Complete"
                      label="100% used, Jobs Applied"
                      className="bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashBoardLayout>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModalAndOpenSubmit}
      />

      <ReportSubmitModal
        isOpen={isReportSubmittedModalOpen}
        onClose={() => setReportSubmittedModalOpen(false)}
      />
    </>
  )
}

export default GetFeedback
