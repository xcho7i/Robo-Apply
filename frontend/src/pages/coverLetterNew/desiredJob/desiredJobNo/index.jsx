import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../../../dashboardLayout"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"
import { errorToast } from "../../../../components/Toast"
import { useNavigate } from "react-router-dom"
import { IoCheckmarkCircle } from "react-icons/io5"
import CircularIndeterminate from "../../../../components/loader/circular"
import API_ENDPOINTS from "../../../../api/endpoints"
import CoverLetterFinalLoader from "../../../../components/loader/CoverLetterFinalLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const dummyPositions = [
  "Software Developer",
  "Healthcare Professional",
  "Cybersecurity Analyst",
  "Financial Analyst",
  "IT Manager",
  "Data Scientist",
  "Marketing Manager",
  "Teacher"
]

const DesiredJobNo = () => {
  const navigate = useNavigate()
  const [desiredPosition, setDesiredPosition] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChipClick = (position) => {
    setDesiredPosition(position)
  }

  const handleContinue = async () => {
    if (!desiredPosition.trim()) {
      errorToast("Please enter or select a desired position.")
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
        storedCVData.personalDetails || storedCVData.personal_details || ""
      )
      formData.append("desired_position", desiredPosition)
      localStorage.setItem("Save_job_title_Cover_Letter", desiredPosition)

      const accessToken = localStorage.getItem("access_token")
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

      // Save the response parts to localStorage
      localStorage.setItem("coverLetterUserData", JSON.stringify(data.userData))
      localStorage.setItem(
        "coverLetterCompanyData",
        JSON.stringify(data.companyData)
      )
      // localStorage.setItem("coverLetterBody", JSON.stringify(data.letterBody))
      localStorage.setItem("coverLetterBody", data.letterBody)

      navigate("/show-cover-letter")
    } catch (error) {
      console.error("Error generating cover letter:", error)
      errorToast("Something went wrong while generating the cover letter.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/coverletter/askSpecificJob")
  }

  return loading ? (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      {/* <CircularIndeterminate /> */}
      <CoverLetterFinalLoader />
    </div>
  ) : (
    <DashBoardLayout>
      <div className="flex flex-col h-full bg-almostBlack">
        <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full">
            <div className="px-[5%] md:px-[20%] ">
              <div className="text-center pt-14 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                <p className="text-primary text-lg md:text-3xl font-semibold">
                  Add your desired position
                </p>
              </div>
            </div>

            {/* Input Field */}
            <div className="px-[5%] md:px-[30%] mt-20">
              <SimpleInputField
                placeholder="Product Designer"
                value={desiredPosition}
                onChange={(e) => setDesiredPosition(e.target.value)}
              />
            </div>

            {/* Chips */}
            <div className="px-[5%] md:px-[30%] mt-20 flex flex-wrap md:mt-10 gap-4">
              {dummyPositions.map((position) => (
                <div
                  key={position}
                  onClick={() => handleChipClick(position)}
                  className={`relative text-primary py-3 px-3 rounded-lg flex items-center justify-center cursor-pointer ${
                    desiredPosition === position
                      ? "border-2 border-customPurple bg-modalPurple"
                      : "border-2 border-customGray bg-lightGreyBackground"
                  }`}>
                  {position}
                  {desiredPosition === position && (
                    <IoCheckmarkCircle className="absolute bottom-[44px] right-0 text-prupleText text-2xl" />
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-10">
              <Button
                onClick={handleBack}
                className="py-3 px-8 md:px-12 flex min-w-40 items-center justify-center bg-almostBlack text-xl font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="py-3 px-4 sm:px-10 flex min-w-40 items-center justify-center text-xl font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default DesiredJobNo
