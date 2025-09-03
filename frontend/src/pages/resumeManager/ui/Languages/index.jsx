import React, { useState } from "react"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"

const Languages = ({ languagesList = [], addLanguage, deleteLanguage }) => {
  // Default state for language and proficiency
  const [language, setLanguage] = useState("")
  const [proficiency, setProficiency] = useState("")
  const [errors, setErrors] = useState({ language: false, proficiency: false })

  const handleAddLanguage = () => {
    if (!language || !proficiency) {
      setErrors({
        language: !language,
        proficiency: !proficiency
      })
      return
    }

    addLanguage({ language, proficiency })

    setLanguage("")
    setProficiency("")
    setErrors({ language: false, proficiency: false })
  }

  return (
    <>
      <div className="items-center justify-start w-full flex py-3">
        <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
          Languages
        </p>
      </div>
      <div className="w-[100%] md:w-[80%]">
        <div className="flex  items-center justify-between space-x-4 mb-4">
          <div className=" w-full">
            <SimpleInputField
              placeholder="Enter a Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full "
              error={errors.language}
            />
          </div>
          <div className=" w-full">
            <select
              size="py-2"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className={`block w-full bg-dropdownBackground text-primary border px-3 pb-3 pt-4 rounded shadow-sm ${
                errors.proficiency
                  ? "border-red-500 mb-5"
                  : "border-formBorders py-2"
              }`}>
              <option className="bg-inputBackGround" value="Proficiency">
                Proficiency
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

        <div className="flex items-center justify-end mb-4">
          <Button
            onClick={handleAddLanguage}
            className="p-2 px-5 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Add
          </Button>
        </div>

        <div className="flex flex-wrap mt-4">
          {languagesList.map((item, index) => (
            <div
              key={index}
              className="text-primary border border-customGray rounded-md bg-inputBackGround px-3 py-2 mb-2 mr-3 flex items-center space-x-1">
              <span className="text-base font-normal">{item.language}</span>
              <span className="text-base font-normal">
                {" "}
                - {item.proficiency}
              </span>
              <button
                onClick={() => deleteLanguage(index)}
                className="text-primary font-medium pl-2">
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Languages
