import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import ExperienceModal from "../ui/ExperienceModal"
import ExperienceCard from "../ui/ExperienceCard"
import DashBoardLayout from "../../../dashboardLayout"
import CircularIndeterminate from "../../../components/loader/circular"
import { successToast, errorToast } from "../../../components/Toast"
import API_ENDPOINTS from "../../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const CreateResumeExperience = () => {
  const [experiences, setExperiences] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/scan-resume/makeProfile") // Navigate to makeProfile page
  }

  const handleContinue = () => {
    setLoading(true)

    // Save current experiences in localStorage
    localStorage.setItem(
      "resumeBuilderExperiences",
      JSON.stringify(experiences)
    )

    // Retrieve required data
    const resumeId = localStorage.getItem("ResumeBuilder-Id")
    const accessToken = localStorage.getItem("access_token")
    const resumeTitle = localStorage.getItem("resumeTitle")
    const personalData = localStorage.getItem("resumeBuilderPersonalData")
    const experiencesData = localStorage.getItem("resumeBuilderExperiences")

    if (!resumeId || !accessToken) {
      errorToast("Missing resume ID or access token")
      setLoading(false)
      return
    }

    const parsedPersonalData = personalData ? JSON.parse(personalData) : {}
    const parsedExperiences = experiencesData ? JSON.parse(experiencesData) : []

    // Validate experience data if present
    if (parsedExperiences.length > 0) {
      const requiredFields = [
        "companyName",
        "jobTitle",
        "location",
        "experienceType"
        // "startDate",
        // "endDate"
        // "description"
      ]

      const isValidExperience = parsedExperiences.every((experience, index) => {
        const missingFields = requiredFields.filter((field) => {
          const value = experience[field]
          return !value || (typeof value === "string" && value.trim() === "")
        })

        if (missingFields.length > 0) {
          errorToast(
            `Experience ${
              index + 1
            } is missing required fields: ${missingFields.join(", ")}`
          )
          return false
        }
        return true
      })

      if (!isValidExperience) {
        setLoading(false)
        return
      }
    }

    // Replace "Present" with null for endDate
    const formattedExperiences = parsedExperiences.map((exp) => ({
      ...exp,
      endDate: exp.endDate === "Present" ? null : exp.endDate
    }))

    // Merge experiences into personal data
    const mergedData = {
      ...parsedPersonalData,
      experiences: formattedExperiences
    }

    // Final payload with resumeTitle and merged personal data
    const finalFormData = {
      resumeTitle,
      ...mergedData
    }

    const updateUrl = `${BASE_URL}${API_ENDPOINTS.UpdateResumeBuilder}/${resumeId}`

    fetch(updateUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(finalFormData)
    })
      .then((res) => res.json())
      .then((responseData) => {
        console.log("Resume update response:", responseData)

        if (responseData.success) {
          successToast("Resume updated successfully!")
          navigate("/scan-resume/addEducation")
        } else {
          errorToast("Failed to update resume!")
          console.error("Resume update failed:", responseData)
        }
      })
      .catch((error) => {
        console.error("Error updating resume:", error)
        errorToast("Something went wrong while updating resume.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleAddExperience = (experience) => {
    setExperiences([...experiences, experience])
    setIsModalOpen(false)
  }

  const handleEditExperience = (index) => {
    setSelectedExperience({ ...experiences[index], id: index })
    setIsModalOpen(true)
  }

  const handleSaveExperience = (id, updatedData) => {
    const updatedExperiences = [...experiences]
    updatedExperiences[id] = updatedData
    setExperiences(updatedExperiences)
    setIsModalOpen(false)
  }

  const handleDeleteExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index)
    setExperiences(updatedExperiences)
  }

  // Load experiences from local storage when the component mounts
  useEffect(() => {
    const storedExperiences = localStorage.getItem("resumeBuilderExperiences")
    if (storedExperiences) {
      setExperiences(JSON.parse(storedExperiences))
    }
  }, []) // Empty array ensures this runs once when the component mounts

  return (
    <DashBoardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularIndeterminate />
        </div>
      ) : (
        <div className="flex flex-col h-full bg-almostBlack">
          {/* <header>
          <DashboardNavbar />
        </header> */}
          <div className="bg-almostBlack w-full  border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
            <div className="w-full">
              <div className="w-full py-5 px-3">
                <div className="flex items-center justify-center relative">
                  <div className="flex items-center">
                    <div
                      className="flex flex-col items-center  hover:cursor-pointer"
                      onClick={() => navigate("/scan-resume/makeProfile")}>
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full border border-stepperBackground text-primary">
                        1
                      </div>
                      <span className="text-primary text-xs md:text-sm mt-2 absolute top-12 ">
                        Profile
                      </span>
                    </div>
                    <div className="flex items-center ">
                      <div className=" w-5 md:w-28 lg:w-32 h-1 flex-grow border-t-2 "></div>
                      <div className=" text-lg  md:text-2xl">{`>`}</div>
                    </div>
                    <div className="flex flex-col items-center  hover:cursor-pointer">
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-stepperBackground text-primary">
                        2
                      </div>
                      <span className="text-primary text-xs md:text-sm mt-2 absolute top-12">
                        Experience
                      </span>
                    </div>
                    <div className="flex items-center ">
                      <div className=" w-5 md:w-28 lg:w-32 h-1 flex-grow border-t-2 "></div>
                      <div className="text-lg  md:text-2xl">{`>`}</div>
                    </div>
                    <div
                      className="flex flex-col items-center  hover:cursor-pointer"
                      onClick={() => navigate("/scan-resume/addEducation")}>
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full border border-stepperBackground text-primary">
                        3
                      </div>
                      <span className="text-primary text-xs md:text-sm mt-2 absolute top-12">
                        Education
                      </span>
                    </div>
                    <div className="flex items-center ">
                      <div className=" w-5 md:w-28 lg:w-32 h-1 flex-grow border-t-2 "></div>
                      <div className="text-lg  md:text-2xl">{`>`}</div>
                    </div>
                    <div
                      className="flex flex-col items-center  hover:cursor-pointer"
                      onClick={() => navigate("/scan-resume/addAdditional")}>
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full border border-stepperBackground text-primary">
                        4
                      </div>
                      <span className="text-primary text-xs md:text-sm mt-2 absolute top-12">
                        Additional
                      </span>
                    </div>
                    <div className="flex items-center ">
                      <div className=" w-5 md:w-28 lg:w-32 h-1 flex-grow border-t-2 "></div>
                      <div className="text-lg  md:text-2xl">{`>`}</div>
                    </div>
                    <div
                      className="flex flex-col items-center  hover:cursor-pointer"
                      onClick={() =>
                        navigate("/scan-resume/chooseTemplateCreateResume")
                      }>
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full border border-purple text-primary">
                        5
                      </div>
                      <span className="text-primary text-xs md:text-sm mt-2 absolute top-12">
                        Done
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-[5%] md:px-[10%]">
                <div className="text-center pt-14 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                  <p className="text-primary text-xl md:text-3xl font-semibold">
                    Tell us where you worked
                  </p>
                  <p className="text-primary text-sm md:text-xl font-normal pt-2">
                    Let hiring managers know where you worked and what you
                    accomplished
                  </p>
                </div>
              </div>
              <div className="px-[5%] md:px-[20%] mt-20">
                {experiences.length === 0 ? (
                  <div className="border border-dashed rounded-xl border-customGray p-16">
                    <p className="text-primary text-center whitespace-nowrap">
                      No Experience added
                    </p>
                  </div>
                ) : (
                  experiences.map((experience, index) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      onEdit={() => handleEditExperience(index)}
                      onDelete={() => handleDeleteExperience(index)}
                    />
                  ))
                )}
                <Button
                  className="mt-5 text-lg text-primary hover:text-purpleText"
                  onClick={() => {
                    setSelectedExperience(null)
                    setIsModalOpen(true)
                  }}>
                  + Add More
                </Button>

                <ExperienceModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onAddExperience={handleAddExperience}
                  onSave={handleSaveExperience}
                  initialData={selectedExperience || {}}
                />
              </div>
              <div className="flex justify-center my-10 space-x-4">
                <Button
                  onClick={handleBack}
                  // className="p-3 px-10 text-xl font-semibold border-2 border-purple  text-primary rounded-full hover:ring-2 hover:bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  className="p-2 sm:p-3 px-8 md:px-6 min-w-32 flex items-center justify-center bg-almostBlack text-navbar font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  // className="p-3 px-10 text-xl font-semibold bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  className="p-2 sm:p-3 px-4 sm:px-6 min-w-32 flex items-center justify-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashBoardLayout>
  )
}

export default CreateResumeExperience
