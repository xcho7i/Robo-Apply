import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import { HiArrowLeft } from "react-icons/hi"
import { IoCheckboxOutline, IoCloseCircleOutline } from "react-icons/io5"
import { LiaWindowClose } from "react-icons/lia"

import DashBoardLayout from "../../../dashboardLayout"
import { errorToast } from "../../../components/Toast"

const ASKSpecificJob = () => {
  const navigate = useNavigate()

  const [selectedOption, setSelectedOption] = useState(null) // State to track selected option

  const handleContinue = () => {
    if (!selectedOption) {
      errorToast("Please select an option before continuing.")
      return // Prevents proceeding if no option is selected
    }
    localStorage.setItem("jobInMind", selectedOption)
    // Proceed to navigation based on the selected option
    if (selectedOption === "yes") {
      navigate("/coverletter/desiredJobYes")
    } else if (selectedOption === "no") {
      navigate("/coverletter/desiredJobNo")
    }
  }

  const handleBack = () => {
    navigate("/coverletter/show-cv-data")
  }

  const handleSelectOption = (option) => {
    setSelectedOption(option) // Update the selected option
  }

  useEffect(() => {
    // Load stored selection from localStorage
    const savedOption = localStorage.getItem("jobInMind")
    if (savedOption === "yes" || savedOption === "no") {
      setSelectedOption(savedOption)
    }
  }, [])

  return (
    <DashBoardLayout>
      <div className="flex flex-col h-full bg-almostBlack">
        <div className="flex-grow w-full px-4 sm:px-6 md:px-10 border border-l-0 border-r-0 border-b-0 border-t-dashboardborderColor">
          <div className="flex items-center justify-between py-6">
            <p className="text-primary text-xl sm:text-2xl md:text-3xl font-medium">
              Cover Letter
            </p>
            <Button
              onClick={() => navigate("/coverletter/show-cv-data")}
              className="p-2 sm:p-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
              <HiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
          <div className="flex items-center justify-center mt-32 md:mt-40">
            <div className="py-10 px-3 sm:px-8 md:px-5 w-full max-w-2xl rounded-lg bg-almostBlack">
              <p className="text-primary text-base md:text-2xl font-semibold">
                Do you have a specific job in mind?
              </p>

              {/* Option: Yes */}
              <div
                onClick={() => handleSelectOption("yes")}
                className={`border flex  justify-between mt-5 p-3 ${
                  selectedOption === "yes"
                    ? "border-customGray"
                    : " border-customGray"
                }`}>
                <div className="flex items-center gap-2 text-center">
                  <IoCheckboxOutline
                    size={26}
                    className={`${
                      selectedOption === "yes"
                        ? "text-prupleText bg-modalPurple"
                        : "text-lightGrey"
                    } text-3xl`}
                  />
                  <span
                    className={`${
                      selectedOption === "yes" ? "text-lg" : "text-lg"
                    }`}>
                    Yes
                  </span>
                </div>
                <div className="">
                  {/* <IoCloseCircleOutline
                    className={`${
                      selectedOption === "yes"
                        ? "text-prupleText bg-modalPurple rounded-full"
                        : "text-lightGrey"
                    } text-3xl`}
                  /> */}
                </div>
              </div>

              {/* Option: No */}
              <div
                onClick={() => handleSelectOption("no")}
                className={`border flex justify-between mt-5 p-3 ${
                  selectedOption === "no"
                    ? "border-customGray"
                    : "border-customGray"
                }`}>
                <div className="flex gap-2 items-center text-center">
                  <LiaWindowClose
                    size={30}
                    className={`${
                      selectedOption === "no"
                        ? "text-prupleText bg-modalPurple"
                        : "text-lightGrey"
                    } text-3xl`}
                  />
                  <span
                    className={`${
                      selectedOption === "no" ? "text-lg" : "text-lg"
                    }`}>
                    No
                  </span>
                </div>
                <div>
                  {/* <IoCloseCircleOutline
                    className={`${
                      selectedOption === "no"
                        ? "text-prupleText bg-modalPurple rounded-full"
                        : "text-lightGrey"
                    } text-3xl`}
                  /> */}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 mt-6">
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
      </div>
    </DashBoardLayout>
  )
}

export default ASKSpecificJob
