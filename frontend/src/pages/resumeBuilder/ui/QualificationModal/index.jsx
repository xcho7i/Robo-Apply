import React, { useState, useEffect } from "react"
import { IoMdClose } from "react-icons/io"
import { errorToast } from "../../../../components/Toast"
import Button from "../../../../components/Button"
import SimpleInputField from "../../../../components/SimpleInputFields"
import DatePickerInput from "../../../../components/DatePickerInput"

const QualificationModal = ({
  isOpen,
  onClose,
  onAddQualification,
  initialData = {},
  onSave
}) => {
  const [institutionName, setInstitutionName] = useState("")
  const [institutionType, setInstitutionType] = useState("")
  const [institutionCity, setInstitutionCity] = useState("")
  const [institutionState, setInstitutionState] = useState("")
  const [major, setMajor] = useState("")
  const [degreeType, setDegreeType] = useState("")
  const [gpa, setGpa] = useState("")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setInstitutionName(initialData.institutionName || "")
      setInstitutionType(initialData.institutionType || "")
      setInstitutionCity(initialData.institutionCity || "")
      setInstitutionState(initialData.institutionState || "")
      setMajor(initialData.major || "")
      setDegreeType(initialData.degreeType || "")
      setGpa(initialData.gpa || "")
      setStartDate(
        initialData.startDate ? new Date(initialData.startDate) : null
      )
      setEndDate(initialData.endDate ? new Date(initialData.endDate) : null)
    }
  }, [isOpen, initialData])

  const handleGpaChange = (event) => {
    const value = event.target.value
    if (
      /^\d*(\.\d{0,2})?$/.test(value) &&
      (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 4))
    ) {
      setGpa(value)
    }
  }

  const handleSaveQualification = () => {
    if (
      !institutionName ||
      !institutionType ||
      !major ||
      !degreeType ||
      !startDate
    ) {
      errorToast("Please fill in all required fields.")
      return
    }

    const qualificationData = {
      institutionName,
      institutionType,
      institutionCity,
      institutionState,
      major,
      degreeType,
      gpa,
      startDate,
      endDate
    }

    // Get existing qualifications from localStorage
    const existingQualifications =
      JSON.parse(localStorage.getItem("resumeBuilderQualifications")) || []

    if (initialData.id !== undefined) {
      // Update existing qualification
      const updatedQualifications = [...existingQualifications]
      updatedQualifications[initialData.id] = qualificationData
      localStorage.setItem(
        "resumeBuilderQualifications",
        JSON.stringify(updatedQualifications)
      )
      onSave(initialData.id, qualificationData)
    } else {
      // Add new qualification
      const newQualifications = [...existingQualifications, qualificationData]
      localStorage.setItem(
        "resumeBuilderQualifications",
        JSON.stringify(newQualifications)
      )
      onAddQualification(qualificationData)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      id="qualification-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) =>
        e.target.id === "qualification-modal-container" && onClose()
      }>
      <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={24} />
        </Button>

        <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4">
          {initialData.id !== undefined
            ? "Edit Qualification"
            : "Add Qualification"}
        </h2>

        <div className="md:flex md:flex-col  md:space-y-4 border border-x-0 border-customGray py-5">
          <SimpleInputField
            placeholder="Enter Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            className="w-full"
          />

          <div className="md:flex md:space-x-4">
            <div className="w-full items-center flex">
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm">
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value=""
                  disabled>
                  Select Institution Type
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="University">
                  University
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="College">
                  College
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Institute">
                  Institute
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Online">
                  Online
                </option>
              </select>
            </div>
            <SimpleInputField
              placeholder="Enter Institution City"
              value={institutionCity}
              onChange={(e) => setInstitutionCity(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:flex md:space-x-4">
            <SimpleInputField
              placeholder="Institution State"
              value={institutionState}
              onChange={(e) => setInstitutionState(e.target.value)}
              className="w-full"
            />
            <SimpleInputField
              placeholder="Major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:flex md:space-x-4">
            <div className="w-full items-center flex">
              <select
                value={degreeType}
                onChange={(e) => setDegreeType(e.target.value)}
                className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm">
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value=""
                  disabled>
                  Select Degree Type
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Bachelor's">
                  Bachelor's
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Master's">
                  Master's
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="PhD">
                  PhD
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Diploma">
                  Diploma
                </option>
                <option
                  className="text-lightGrey bg-inputBackGround"
                  value="Certificate">
                  Certificate
                </option>
              </select>
            </div>
            <SimpleInputField
              placeholder="GPA"
              value={gpa}
              onChange={handleGpaChange}
              className="w-full"
            />
          </div>

          <div className="md:flex md:space-x-4">
            <DatePickerInput
              placeholder="Start Date"
              selectedDate={startDate}
              onChange={setStartDate}
              className="w-full"
            />
            <DatePickerInput
              placeholder="End Date"
              selectedDate={endDate}
              onChange={setEndDate}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3 mb-5 space-x-4">
          <Button
            onClick={onClose}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
            Close
          </Button>
          <Button
            onClick={handleSaveQualification}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd">
            {initialData.id !== undefined
              ? "Save Changes"
              : "Add Qualification"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QualificationModal
