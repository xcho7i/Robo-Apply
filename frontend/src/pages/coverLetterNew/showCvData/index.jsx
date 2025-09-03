import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashBoardLayout from "../../../dashboardLayout"
import CVRow from "../ui/CVRow"
import Button from "../../../components/Button"
import { errorToast } from "../../../components/Toast"

const ShowCvData = () => {
  const navigate = useNavigate()

  const [editingField, setEditingField] = useState(null)
  const [cvData, setCvData] = useState({
    education: "",
    recentJob: "",
    experience: "",
    skills: "",
    strengths: "",
    personalDetails: ""
  })

  // CV data fields configuration
  const cvFields = [
    { key: "education", label: "Education" },
    { key: "recentJob", label: "Recent Job" },
    { key: "experience", label: "Experience" },
    { key: "skills", label: "Skills" },
    { key: "strengths", label: "Strengths" },
    { key: "personalDetails", label: "Personal Details" }
  ]

  // Fetch CV data from localStorage on component mount
  useEffect(() => {
    const storedCvData = localStorage.getItem("cv_data")
    if (storedCvData) {
      try {
        const parsedData = JSON.parse(storedCvData)
        setCvData({
          education: parsedData.education || "",
          recentJob: parsedData.recentJob || parsedData.recent_job || "",
          experience: parsedData.experience || "",
          skills: parsedData.skills || "",
          strengths: parsedData.strengths || "",
          personalDetails:
            parsedData.personalDetails || parsedData.personal_details || ""
        })
      } catch (error) {
        console.error("Error parsing CV data from localStorage:", error)
      }
    }
  }, [])

  const handleEdit = (field) => {
    setEditingField(field)
  }

  const handleSave = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      [field]: value
    }))
    setEditingField(null)
  }

  const handleKeyPress = (e, field) => {
    if (e.key === "Enter") {
      handleSave(field, e.target.value)
    }
    if (e.key === "Escape") {
      setEditingField(null)
    }
  }

  const handleContinueClick = () => {
    // Check for any empty field
    const emptyFields = Object.entries(cvData).filter(
      ([key, value]) => !value || value.trim() === ""
    )

    if (emptyFields.length > 0) {
      const missingLabels = emptyFields
        .map(([key]) => {
          const fieldObj = cvFields.find((field) => field.key === key)
          return fieldObj?.label || key
        })
        .join(", ")

      errorToast(`Please complete the following fields: ${missingLabels}`)
      return
    }

    // All fields filled – store and navigate
    localStorage.setItem("cv_data", JSON.stringify(cvData))
    navigate("/coverletter/askSpecificJob")
  }

  return (
    <DashBoardLayout>
      <div className="flex flex-col h-full bg-almostBlack">
        <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full">
            <div className="px-[5%] md:px-[10%]">
              <div className="text-center pt-14 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                <p className="text-primary text-xl md:text-3xl font-semibold">
                  We have successfully processed your resume
                </p>
                <p className="text-primary text-sm md:text-xl font-normal pt-2">
                  Proceed to review and confirm
                </p>
              </div>
              <div className="px-[5%] md:px-[20%] mt-10">
                {/* CV Data Display */}
                <div className="bg-almostBlack rounded-lg border-4 border-dashboardborderColor overflow-hidden">
                  {cvFields.map((field) => (
                    <CVRow
                      key={field.key}
                      label={field.label}
                      value={cvData[field.key]}
                      field={field.key}
                      editingField={editingField}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onKeyPress={handleKeyPress}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8 mb-10">
                  <Button
                    onClick={() => navigate("/coverletter")}
                    className="p-2 sm:p-3 px-8 md:px-6  flex min-w-40 items-center justify-center bg-almostBlack text-navbar font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                    Back
                  </Button>
                  <Button
                    onClick={handleContinueClick}
                    className="p-2 sm:p-3 px-4 sm:px-6 flex  min-w-40 items-center justify-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
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

export default ShowCvData
