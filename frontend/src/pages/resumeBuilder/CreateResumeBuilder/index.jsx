import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import DashboardNavbar from "../../../dashboardNavbar"
import { HiArrowLeft } from "react-icons/hi"
import SimpleInputField from "../../../components/SimpleInputFields"
import DashBoardLayout from "../../../dashboardLayout"

const CreateResumeBuilder = () => {
  const navigate = useNavigate()
  const [jobTitle, setJobTitle] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    const savedResumeTitle = localStorage.getItem("resumeTitle")
    if (savedResumeTitle) {
      setJobTitle(savedResumeTitle)
    }
  }, [])

  const handleContinue = () => {
    if (!jobTitle.trim()) {
      setError(true)
    } else {
      setError(false)
      localStorage.setItem("resumeTitle", jobTitle)
      // Retrieve from localStorage
      const savedJobTitle = localStorage.getItem("resumeTitle")

      // Prepare form data
      const formData = {
        resumeTitle: savedJobTitle
      }

      // Log form data
      console.log(formData)
      navigate("/scan-resume/makeProfile")
    }
  }

  const handleSkip = () => {
    navigate("/scan-resume/makeProfile")
  }

  return (
    <DashBoardLayout>
      <div className="flex flex-col h-full bg-almostBlack">
        {/* <header>
        <DashboardNavbar />
      </header> */}
        <div className="flex-grow bg-almostBlack w-full border border-l-0 border-r-0 border-b-0 border-t-dashboardborderColor ">
          <div className="w-full px-4 sm:px-6 md:px-10">
            <div className="flex items-center justify-between py-6">
              <p className="text-primary text-xl sm:text-2xl md:text-3xl font-medium">
                AI ResumeBuilder
              </p>
              <Button
                onClick={() => navigate("/scan-resume")}
                className="p-2 sm:p-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <HiArrowLeft className="mr-2" />
                Go Back
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <div className="py-10 px-3 sm:px-8 md:px-5 w-full max-w-2xl rounded-lg bg-almostBlack ">
                <p className="text-primary text-base md:text-2xl">
                  What resume title will you be applying to?
                </p>
                <SimpleInputField
                  placeholder="e.g Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-4"
                  error={error}
                />
                <div className="flex items-center justify-end space-x-4 mt-6">
                  <Button
                    onClick={handleSkip}
                    className="p-2 sm:p-3 px-8 md:px-6 min-w-32 flex items-center justify-center bg-almostBlack text-navbar font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                    Skip
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="p-2 sm:p-3 px-4 sm:px-6 min-w-32 flex items-center justify-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default CreateResumeBuilder
