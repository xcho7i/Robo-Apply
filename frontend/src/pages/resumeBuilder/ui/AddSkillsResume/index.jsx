import React, { useState } from "react"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"
import { PiStarFourFill } from "react-icons/pi"
import { BiRefresh } from "react-icons/bi"
import { errorToast, successToast } from "../../../../components/Toast"
import API_ENDPOINTS from "../../../../api/endpoints"
import ElegantLoader from "../BridgeLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const AddSkillsResume = ({ skillsList = [], addSkill, deleteSkill }) => {
  const [skill, setSkill] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [errors, setErrors] = useState({ skill: false, years: false })
  const [generatedSkills, setGeneratedSkills] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddSkill = () => {
    if (!skill || !yearsOfExperience) {
      setErrors({
        skill: !skill,
        years: !yearsOfExperience
      })
      return
    }

    addSkill({ skill, yearsOfExperience })

    setSkill("")
    setYearsOfExperience("")
    setErrors({ skill: false, years: false })
  }

  const generateSkills = async () => {
    try {
      setIsGenerating(true)

      // Get personal data from localStorage
      const personalData = JSON.parse(
        localStorage.getItem("resumeBuilderPersonalData")
      )

      if (!personalData || !personalData.jobTitle) {
        errorToast(
          "Job title not found. Please fill in your personal information first."
        )
        return
      }

      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      const requestBody = {
        desiredPosition: personalData.jobTitle,
        skills: skillsList.map((skill) => skill.skill) // Send only skill names as strings
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateSkills}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.skills && Array.isArray(data.skills)) {
        setGeneratedSkills(data.skills)
        successToast(
          "Skills generated successfully! Click on skills below to add them."
        )
      } else {
        errorToast("No skills generated. Please try again.")
      }
    } catch (error) {
      console.error("Error generating skills:", error)
      errorToast("Failed to generate skills. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSkillChipClick = (skillName) => {
    // Check if skill already exists in skillsList
    const exists = skillsList.some(
      (existing) => existing.skill.toLowerCase() === skillName.toLowerCase()
    )

    if (!exists) {
      // Add skill with default 1 year experience
      addSkill({
        skill: skillName
        // yearsOfExperience: "1"
      })

      // Remove from generated skills
      setGeneratedSkills((prev) => prev.filter((skill) => skill !== skillName))
    }
  }

  const refreshSkills = async () => {
    try {
      setIsGenerating(true)

      // Get personal data from localStorage
      const personalData = JSON.parse(
        localStorage.getItem("resumeBuilderPersonalData")
      )

      if (!personalData || !personalData.jobTitle) {
        errorToast(
          "Job title not found. Please fill in your personal information first."
        )
        return
      }

      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      const requestBody = {
        desiredPosition: personalData.jobTitle,
        skills: skillsList.map((skill) => skill.skill) // Send only skill names as strings
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateSkills}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.skills && Array.isArray(data.skills)) {
        // Replace all existing generated skills with new ones
        setGeneratedSkills(data.skills)
        successToast("Skills refreshed! Click on skills below to add them.")
      } else {
        errorToast("No new skills generated. Please try again.")
      }
    } catch (error) {
      console.error("Error refreshing skills:", error)
      errorToast("Failed to refresh skills. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg md:text-xl text-primary font-normal mb-1 inline-block border-b-2 border-purple">
          Skills
        </p>

        {/* Generate Skills / Refresh Button */}
        {generatedSkills.length === 0 ? (
          <Button
            onClick={generateSkills}
            disabled={isGenerating}
            className="p-3 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            <PiStarFourFill size={16} />
            {isGenerating ? "Generating..." : "Generate AI Skills"}
          </Button>
        ) : (
          <Button
            onClick={refreshSkills}
            disabled={isGenerating}
            className="p-3 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            <BiRefresh size={16} />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}
      </div>

      <div className="md:flex md:space-x-4 mb-4">
        <SimpleInputField
          placeholder="Enter a Skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full"
          error={errors.skill}
        />
        <SimpleInputField
          placeholder="Years of Experience"
          value={yearsOfExperience}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value))
              setYearsOfExperience(e.target.value)
          }}
          className="w-full"
          error={errors.years}
        />
      </div>
      {/* Generated Skills Chips */}
      {(generatedSkills.length > 0 || isGenerating) && (
        <div className="mb-4  bg-almostBlack rounded-lg ">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <ElegantLoader />
            </div>
          ) : (
            <>
              <p className="text-sm text-primary mb-3">
                Click on skills below to add them to your profile
              </p>
              <div className="flex flex-wrap gap-2">
                {generatedSkills.map((skillName, index) => (
                  <button
                    key={index}
                    onClick={() => handleSkillChipClick(skillName)}
                    className="flex items-center text-primary border border-customGray rounded-md bg-inputBackGround hover:bg-purpleBackground px-2 md:px-3 py-2 mb-2 mr-2 md:mr-3">
                    + {skillName}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <Button
        onClick={handleAddSkill}
        className="p-2 px-4 md:px-5 mb-2 md:mb-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
        Add
      </Button>

      <div className="flex flex-wrap mt-2 md:mt-4">
        {skillsList.map((item, index) => (
          <div
            key={index}
            className="flex items-center text-primary border border-customGray rounded-md bg-inputBackGround px-2 md:px-3 py-2 mb-2 mr-2 md:mr-3">
            <span className="text-sm md:text-base font-normal mr-2">
              {item.skill}
            </span>
            {item.yearsOfExperience && (
              <span className="text-sm md:text-base font-normal mr-2">
                - {item.yearsOfExperience}
              </span>
            )}
            <button
              onClick={() => deleteSkill(index)}
              className="text-primary font-medium">
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddSkillsResume
