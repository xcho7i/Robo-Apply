import React, { useState } from "react"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"

const AddLanguageResume = ({ languages, onAddLanguage, onDeleteLanguage }) => {
  // Default state for language and proficiency
  const [language, setLanguage] = useState("")
  const [proficiency, setProficiency] = useState("")
  const [errors, setErrors] = useState({ language: false, proficiency: false })

  // Handle adding a new language
  const handleAddLanguage = () => {
    if (!language || !proficiency) {
      setErrors({
        language: !language,
        proficiency: !proficiency
      })
      return
    }

    // Pass the language and proficiency data to the parent component
    onAddLanguage({ language, proficiency })

    // Reset form fields and errors after adding
    setLanguage("")
    setProficiency("")
    setErrors({ language: false, proficiency: false })
  }

  return (
    <>
      <div className="items-center justify-start w-full flex">
        <p className="text-xl text-primary font-normal mb-5 md:pt-3 inline-block border-b-2 border-purple">
          Languages
        </p>
      </div>

      <div>
        {/* Input fields for language and proficiency */}
        <div className="md:flex items-center justify-between md:space-x-4 mb-4">
          <div className="w-full">
            <SimpleInputField
              placeholder="Enter a Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full"
              error={errors.language}
            />
          </div>
          <div className="w-full items-center">
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className={`block w-full bg-dropdownBackground text-primary border px-3 py-3.5 rounded-md shadow-sm ${
                errors.proficiency
                  ? "border-red-500 mb-5"
                  : "border-formBorders"
              }`}>
              <option className="bg-inputBackGround" value="">
                Proficiency Level
              </option>
              <option className="bg-inputBackGround" value="Beginner">
                Beginner
              </option>
              <option className="bg-inputBackGround" value="Intermediate">
                Intermediate
              </option>
              <option className="bg-inputBackGround" value="Advanced">
                Advanced
              </option>
              <option className="bg-inputBackGround" value="Expert">
                Expert
              </option>
            </select>
          </div>
        </div>

        {/* Add button */}
        <div className="flex items-center justify-start mb-4">
          <Button
            onClick={handleAddLanguage}
            className="p-2 px-5 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Add
          </Button>
        </div>

        {/* Display added languages with proficiency */}
        <div className="flex flex-wrap mt-4">
          {languages.length > 0 ? (
            languages.map((item, index) => (
              <div
                key={index}
                className="text-primary border border-customGray rounded-md bg-inputBackGround px-1.5 md:px-3 py-2 mb-2 mr-1 md:mr-3 flex items-center space-x-1">
                <span className="text-sm md:text-base font-normal">
                  {item.language}
                </span>
                <span className="text-xs md:text-base font-normal">
                  {" "}
                  - {item.proficiency}
                </span>
                <button
                  onClick={() => onDeleteLanguage(index)}
                  className="text-primary font-medium pl-1 md:pl-2">
                  X
                </button>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  )
}

export default AddLanguageResume
