// import React, { useState } from "react"
// import SimpleInputField from "../../../../components/SimpleInputFields"
// import Button from "../../../../components/Button"
// import { PiStarFourFill } from "react-icons/pi"
// import { BiRefresh } from "react-icons/bi"
// import { errorToast, successToast } from "../../../../components/Toast"
// import API_ENDPOINTS from "../../../../api/endpoints"
// import ElegantLoader from "../../../resumeBuilder/ui/BridgeLoader"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const Skills = ({ skillsList = [], addSkill, deleteSkill }) => {
//   const [skill, setSkill] = useState("")
//   const [yearsOfExperience, setYearsOfExperience] = useState("")
//   const [defaultExperience, setDefaultExperience] = useState("")
//   const [errors, setErrors] = useState({ skill: false, years: false })
//   const [generatedSkills, setGeneratedSkills] = useState([])
//   const [isGenerating, setIsGenerating] = useState(false)

//   const handleAddSkill = () => {
//     const experience = yearsOfExperience || defaultExperience
//     if (!skill || !experience) {
//       setErrors({
//         skill: !skill,
//         years: !experience
//       })
//       return
//     }

//     addSkill({ skill, yearsOfExperience: experience })

//     setSkill("")
//     setYearsOfExperience("")
//     setErrors({ skill: false, years: false })
//   }

//   const generateSkills = async () => {
//     try {
//       setIsGenerating(true)

//       // Get resumeName from localStorage for desiredPosition
//       const resumeName = localStorage.getItem("resumeName")

//       if (!resumeName) {
//         errorToast("Resume name not found. Please set a resume name first.")
//         return
//       }

//       const accessToken = localStorage.getItem("access_token")
//       if (!accessToken) {
//         errorToast("Access token not found. Please login again.")
//         return
//       }

//       const requestBody = {
//         desiredPosition: resumeName,
//         skills: skillsList.map((skill) => skill.skill) // Send only skill names as strings
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GenerateSkills}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`
//           },
//           body: JSON.stringify(requestBody)
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()

//       if (data.skills && Array.isArray(data.skills)) {
//         setGeneratedSkills(data.skills)
//         successToast(
//           "Skills generated successfully! Click on skills below to add them."
//         )
//       } else {
//         errorToast("No skills generated. Please try again.")
//       }
//     } catch (error) {
//       console.error("Error generating skills:", error)
//       errorToast("Failed to generate skills. Please try again.")
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const handleSkillChipClick = (skillName) => {
//     // Check if skill already exists in skillsList
//     const exists = skillsList.some(
//       (existing) => existing.skill.toLowerCase() === skillName.toLowerCase()
//     )

//     if (!exists) {
//       // Add skill with default experience or 1 year if no default set
//       const experience = defaultExperience || ""
//       addSkill({
//         skill: skillName,
//         yearsOfExperience: experience
//       })

//       // Remove from generated skills
//       setGeneratedSkills((prev) => prev.filter((skill) => skill !== skillName))
//     }
//   }

//   const refreshSkills = async () => {
//     try {
//       setIsGenerating(true)

//       // Get resumeName from localStorage for desiredPosition
//       const resumeName = localStorage.getItem("resumeName")

//       if (!resumeName) {
//         errorToast("Resume name not found. Please set a resume name first.")
//         return
//       }

//       const accessToken = localStorage.getItem("access_token")
//       if (!accessToken) {
//         errorToast("Access token not found. Please login again.")
//         return
//       }

//       const requestBody = {
//         desiredPosition: resumeName,
//         skills: skillsList.map((skill) => skill.skill) // Send only skill names as strings
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GenerateSkills}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`
//           },
//           body: JSON.stringify(requestBody)
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()

//       if (data.skills && Array.isArray(data.skills)) {
//         // Replace all existing generated skills with new ones
//         setGeneratedSkills(data.skills)
//         successToast("Skills refreshed! Click on skills below to add them.")
//       } else {
//         errorToast("No new skills generated. Please try again.")
//       }
//     } catch (error) {
//       console.error("Error refreshing skills:", error)
//       errorToast("Failed to refresh skills. Please try again.")
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   return (
//     <>
//       <div className="items-center justify-between w-full flex mb-4 w-[100%] md:w-[80%]">
//         <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
//           Skills
//         </p>

//         {/* Generate Skills / Refresh Button */}
//         {generatedSkills.length === 0 ? (
//           <Button
//             onClick={generateSkills}
//             disabled={isGenerating}
//             className="p-2 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//             <PiStarFourFill size={16} />
//             {isGenerating ? "Generating..." : "Generate AI Skills"}
//           </Button>
//         ) : (
//           <Button
//             onClick={refreshSkills}
//             disabled={isGenerating}
//             className="p-2 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//             <BiRefresh size={16} />
//             {isGenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         )}
//       </div>

//       <div className="w-[100%] md:w-[80%]">
//         <div className="flex space-x-4 mb-4">
//           <SimpleInputField
//             placeholder="Enter a Skill"
//             value={skill}
//             onChange={(e) => {
//               const inputValue = e.target.value
//               if (/^[a-zA-Z\s]*$/.test(inputValue)) {
//                 setSkill(inputValue)
//               }
//             }}
//             className="w-full"
//             error={errors.skill}
//           />
//           <SimpleInputField
//             placeholder="Years of Experience"
//             value={yearsOfExperience}
//             onChange={(e) => {
//               if (/^\d*$/.test(e.target.value))
//                 setYearsOfExperience(e.target.value)
//             }}
//             className="w-full"
//             error={errors.years}
//           />
//         </div>

//         {/* Generated Skills Chips */}

//         {(generatedSkills.length > 0 || isGenerating) && (
//           <div className="mb-4 bg-almostBlack rounded-lg p-4 ">
//             {isGenerating ? (
//               <div className="flex items-center justify-center py-8">
//                 <ElegantLoader />
//               </div>
//             ) : (
//               <>
//                 <p className="text-sm text-primary mb-3">
//                   Click on skills below to add them to your profile
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {generatedSkills.map((skillName, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleSkillChipClick(skillName)}
//                       className="flex items-center text-primary border border-customGray rounded-md bg-inputBackGround hover:bg-purpleBackground px-2 md:px-3 py-2 mb-2 mr-2 md:mr-3">
//                       + {skillName}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         <div className="flex items-center justify-between mb-4">
//           <p className="text-primary text-xs md:text-base">
//             Default Experience (used if specific years not provided)
//           </p>
//           <Button
//             onClick={handleAddSkill}
//             className="p-2 px-5 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//             Add
//           </Button>
//         </div>

//         <SimpleInputField
//           placeholder="Default Experience (e.g., 0)"
//           value={defaultExperience}
//           onChange={(e) => {
//             if (/^\d*$/.test(e.target.value))
//               setDefaultExperience(e.target.value)
//           }}
//           className="w-full mb-4"
//         />

//         <div className="flex flex-wrap mt-4">
//           {skillsList.map((item, index) => (
//             <div
//               key={index}
//               className="text-primary border border-customGray rounded-md bg-inputBackGround px-3 py-2 mb-2 mr-3 flex items-center space-x-1">
//               <span className="text-base font-normal">{item.skill}</span>
//               {item.skill && item.yearsOfExperience && (
//                 <span className="text-base font-normal"> - </span>
//               )}
//               <span className="text-base font-normal">
//                 {item.yearsOfExperience}
//               </span>
//               <button
//                 onClick={() => deleteSkill(index)}
//                 className="text-primary font-medium pl-2">
//                 X
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Skills

import React, { useState } from "react"
import SimpleInputField from "../../../../components/SimpleInputFields"
import Button from "../../../../components/Button"
import { PiStarFourFill } from "react-icons/pi"
import { BiRefresh } from "react-icons/bi"
import { errorToast, successToast } from "../../../../components/Toast"
import API_ENDPOINTS from "../../../../api/endpoints"
import ElegantLoader from "../../../resumeBuilder/ui/BridgeLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const Skills = ({ skillsList = [], addSkill, deleteSkill }) => {
  const [skill, setSkill] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [defaultExperience, setDefaultExperience] = useState("")
  const [errors, setErrors] = useState({ skill: false, years: false })
  const [generatedSkills, setGeneratedSkills] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddSkill = () => {
    const experience = yearsOfExperience || defaultExperience
    if (!skill || !experience) {
      setErrors({
        skill: !skill,
        years: !experience
      })
      return
    }

    addSkill({ skill, yearsOfExperience: experience })

    setSkill("")
    setYearsOfExperience("")
    setErrors({ skill: false, years: false })
  }

  const generateSkills = async () => {
    try {
      setIsGenerating(true)

      // Get resumeName from localStorage for desiredPosition
      const resumeName = localStorage.getItem("jobTitle")

      if (!resumeName) {
        errorToast("Resume name not found. Please set a resume name first.")
        return
      }

      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      const requestBody = {
        desiredPosition: resumeName,
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
      // Add skill with default experience or 1 year if no default set
      const experience = defaultExperience || ""
      addSkill({
        skill: skillName,
        yearsOfExperience: experience
      })

      // Remove from generated skills
      setGeneratedSkills((prev) => prev.filter((skill) => skill !== skillName))
    }
  }

  const refreshSkills = async () => {
    try {
      setIsGenerating(true)

      // Get resumeName from localStorage for desiredPosition
      const resumeName = localStorage.getItem("jobTitle")

      if (!resumeName) {
        errorToast("Resume name not found. Please set a resume name first.")
        return
      }

      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      // Combine current skillsList and existing generatedSkills for the API call
      const allCurrentSkills = [
        ...skillsList.map((skill) => skill.skill), // Current skills from skillsList
        ...generatedSkills // Previously generated skills that haven't been added yet
      ]

      const requestBody = {
        desiredPosition: resumeName,
        skills: allCurrentSkills // Send combined skills list
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
        // Filter out skills that are already in skillsList to avoid duplicates
        const existingSkillNames = skillsList.map((skill) =>
          skill.skill.toLowerCase()
        )
        const newGeneratedSkills = data.skills.filter(
          (skillName) => !existingSkillNames.includes(skillName.toLowerCase())
        )

        // Replace with only the latest generated skills (not combining with previous ones)
        setGeneratedSkills(newGeneratedSkills)
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
    <>
      <div className="items-center justify-between w-full flex mb-4  md:w-[80%]">
        <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
          Skills
        </p>

        {/* Generate Skills / Refresh Button */}
        {generatedSkills.length === 0 ? (
          <Button
            onClick={generateSkills}
            disabled={isGenerating}
            className="p-2 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            <PiStarFourFill size={16} />
            {isGenerating ? "Generating..." : "Generate AI Skills"}
          </Button>
        ) : (
          <Button
            onClick={refreshSkills}
            disabled={isGenerating}
            className="p-2 px-3 flex items-center hover:text-yellowColor whitespace-nowrap gap-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            <BiRefresh size={16} />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}
      </div>

      <div className="w-[100%] md:w-[80%]">
        <div className="flex space-x-4 mb-4">
          <SimpleInputField
            placeholder="Enter a Skill"
            value={skill}
            onChange={(e) => {
              const inputValue = e.target.value
              if (/^[a-zA-Z\s]*$/.test(inputValue)) {
                setSkill(inputValue)
              }
            }}
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
          <div className="mb-4 bg-almostBlack rounded-lg p-4 ">
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

        <div className="flex items-center justify-between mb-4">
          <p className="text-primary text-xs md:text-base">
            Default Experience (used if specific years not provided)
          </p>
          <Button
            onClick={handleAddSkill}
            className="p-2 px-5 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Add
          </Button>
        </div>

        <SimpleInputField
          placeholder="Default Experience (e.g., 0)"
          value={defaultExperience}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value))
              setDefaultExperience(e.target.value)
          }}
          className="w-full mb-4"
        />

        <div className="flex flex-wrap mt-4">
          {skillsList.map((item, index) => (
            <div
              key={index}
              className="text-primary border border-customGray rounded-md bg-inputBackGround px-3 py-2 mb-2 mr-3 flex items-center space-x-1">
              <span className="text-base font-normal">{item.skill}</span>
              {item.skill && item.yearsOfExperience && (
                <span className="text-base font-normal"> - </span>
              )}
              <span className="text-base font-normal">
                {item.yearsOfExperience}
              </span>
              <button
                onClick={() => deleteSkill(index)}
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

export default Skills
