// import React, { useState, useMemo } from "react"
// import DashBoardLayout from "../../dashboardLayout"
// import Dropdown from "../../components/dropdown"
// import SimpleInputField from "../../components/SimpleInputFields"
// import Button from "../../components/Button"
// import { successToast, errorToast } from "../../components/Toast"
// import { useNavigate } from "react-router-dom"
// import TextAreaComponent from "../../components/TextAreaComponent"
// import coverLetterService from "../../api/aiService"
// import CircularIndeterminate from "../../components/loader/circular"
// import API_ENDPOINTS from "../../api/endpoints"
// import { PiStarFourFill } from "react-icons/pi"
// import DOMPurify from "dompurify"
// import ElegantLoader from "../resumeBuilder/ui/BridgeLoader"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const AiCoverLetterGenerator = () => {
//   const navigate = useNavigate()
//   const [selectedTone, setSelectedTone] = useState("")
//   const [additionalInfo, setAdditionalInfo] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
//   const [generatedJobDesc, setGeneratedJobDesc] = useState("")

//   const [inputFields, setInputFields] = useState([
//     { label: "Job Title*", placeholder: "Designer", value: "" },
//     { label: "Your Name*", placeholder: "Philip", value: "" },
//     { label: "Company Name", placeholder: "Unknown", value: "" },
//     {
//       label: "Your Skills*",
//       placeholder: "Skills will be separated using ,",
//       value: ""
//     },
//     { label: "Role Type*", placeholder: "Full time", value: "" },
//     { label: "Job Location*", placeholder: "Remote", value: "" }
//   ])

//   const toneOptions = [
//     "Formal",
//     "Professional",
//     "Convincing",
//     "Assertive",
//     "Inspirational",
//     "Informational"
//   ]

//   const roleTypeOptions = ["Full Time", "Part Time", "Internship", "Freelance"]
//   const jobLocationOptions = ["Remote", "Onsite", "Hybrid"]

//   const handleToneChange = (event) => {
//     setSelectedTone(event.target.value)
//   }

//   const isFormValid =
//     selectedTone !== "" &&
//     additionalInfo.trim() !== "" &&
//     inputFields.every((field) => field.value.trim() !== "")

//   const handleInputChange = (event, index) => {
//     const value = event.target.value
//     const newInputFields = [...inputFields]

//     // Special validation for "Your job title*" field (index 0)
//     if (index === 0) {
//       // Only allow alphabets and spaces
//       const namePattern = /^[a-zA-Z\s]*$/

//       if (namePattern.test(value) && value.length <= 100) {
//         newInputFields[index].value = value
//         setInputFields(newInputFields)
//       }
//       // If pattern doesn't match, don't update the value (effectively blocking the input)
//       return
//     }

//     // Special validation for "Your Name*" field (index 1)
//     if (index === 1) {
//       // Only allow alphabets and spaces
//       const namePattern = /^[a-zA-Z\s]*$/
//       if (namePattern.test(value) && value.length <= 100) {
//         newInputFields[index].value = value
//         setInputFields(newInputFields)
//       }
//       // If pattern doesn't match, don't update the value (effectively blocking the input)
//       return
//     }

//     // For other fields, update normally
//     newInputFields[index].value = value
//     setInputFields(newInputFields)
//   }

//   const generateJobDescription = async () => {
//     const jobTitle = inputFields[0].value.trim()

//     if (!jobTitle) {
//       errorToast("Please enter a job title first to generate job description.")
//       return
//     }

//     setIsGeneratingJobDesc(true)

//     try {
//       const accessToken = localStorage.getItem("access_token")
//       localStorage.setItem("Save_job_title_Cover_Letter", jobTitle)
//       const requestBody = {
//         job_title: jobTitle,
//         job_description: additionalInfo || "",
//         job_skills: inputFields[3].value || ""
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.GenerateAIJobDescription}`,
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

//       const responseData = await response.json()

//       if (responseData.description) {
//         setGeneratedJobDesc(responseData.description)
//         setAdditionalInfo(responseData.description) // Also set for form submission
//         successToast("Job description generated successfully!")
//       } else {
//         errorToast("Failed to generate job description. Please try again.")
//       }
//     } catch (error) {
//       console.error("Error generating job description:", error)
//       errorToast("Something went wrong while generating job description.")
//     } finally {
//       setIsGeneratingJobDesc(false)
//     }
//   }

//   // Sanitize the generated job description for safe HTML rendering
//   const sanitizedJobDesc = useMemo(() => {
//     if (!generatedJobDesc) return ""
//     return DOMPurify.sanitize(generatedJobDesc)
//   }, [generatedJobDesc])

//   const handleSubmit = async () => {
//     if (selectedTone === "") {
//       errorToast("Please select a tone.")
//       return
//     }

//     const emptyInput = inputFields.find((input) => input.value === "")
//     if (emptyInput) {
//       errorToast(`Please fill the ${emptyInput.label} field.`)
//       return
//     }

//     // Additional validation for name field
//     const nameField = inputFields[1].value.trim()
//     if (nameField === "") {
//       errorToast("Please enter a valid name.")
//       return
//     }

//     // Check minimum length for name (at least 3 characters)
//     if (nameField.length < 3) {
//       errorToast("Name must be at least 3 characters long.")
//       return
//     }

//     const formData = {
//       tone: selectedTone,
//       job_title: inputFields[0].value,
//       your_name: inputFields[1].value,
//       applying_for_company: inputFields[2].value,
//       your_skills: inputFields[3].value,
//       role_type: inputFields[4].value,
//       job_location: inputFields[5].value,
//       job_description: additionalInfo
//     }

//     setLoading(true)
//     try {
//       // Get access token from localStorage
//       const accessToken = localStorage.getItem("access_token")

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.AiCoverLetterGenerate}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`
//           },
//           body: JSON.stringify(formData)
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const responseData = await response.json()

//       if (
//         responseData.userData &&
//         responseData.companyData &&
//         responseData.letterBody
//       ) {
//         successToast("Cover letter generated successfully!")

//         // Save individual parts of response
//         localStorage.setItem(
//           "coverLetterUserData",
//           JSON.stringify(responseData.userData)
//         )
//         localStorage.setItem(
//           "coverLetterCompanyData",
//           JSON.stringify(responseData.companyData)
//         )
//         localStorage.setItem("coverLetterBody", responseData.letterBody)

//         // Navigate to show cover letter page
//         navigate("/show-cover-letter")
//       } else {
//         errorToast(responseData.message || "Failed to generate cover letter.")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       errorToast("Something went wrong. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <>
//       {loading && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
//           <CircularIndeterminate />
//         </div>
//       )}
//       <DashBoardLayout>
//         <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
//           <div className="w-full">
//             <div className="text-center space-y-3 pt-5 md:pt-10 md:pb-5">
//               <p className="text-xl md:text-3xl font-normal text-primary">
//                 AI Cover Letter Generator
//               </p>
//               <p className="text-sm md:text-base px-3 pb-3 md:px-0 md:pb-0 font-normal text-primary">
//                 Create your personalized cover letter for job applications,
//                 powered by AI technology—fast and free!
//               </p>
//             </div>
//             <hr className="border-t-2 border-simplePurple mb-5 w-[60%] md:w-[40%] mx-auto" />

//             {/* Add CSS for job description display */}
//             <style jsx>{`
//               .ai-job-desc-display {
//                 background-color: rgba(251, 251, 251, 0.08);
//                 border: 2px dashed rgba(251, 251, 251, 0.2);
//                 border-radius: 8px;
//                 padding: 16px;
//                 min-height: 120px;
//                 color: #ffffff;
//                 overflow-y: auto;
//                 max-height: 300px;
//               }

//               .ai-job-desc-display ul {
//                 list-style-type: disc;
//                 padding-left: 20px;
//                 margin: 8px 0;
//               }

//               .ai-job-desc-display li {
//                 margin-bottom: 8px;
//                 line-height: 1.5;
//               }

//               .ai-job-desc-display ol {
//                 list-style-type: decimal;
//                 padding-left: 20px;
//                 margin: 8px 0;
//               }
//             `}</style>

//             <div className="w-full px-5 md:px-10 py-5 ">
//               <Dropdown
//                 className="py-3"
//                 label="Select a tone*"
//                 placeholder="Formal"
//                 options={toneOptions}
//                 onChange={handleToneChange}
//               />

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
//                 {inputFields.map((input, index) => {
//                   if (input.label === "Role Type*") {
//                     return (
//                       <div key={index}>
//                         <label className="block text-primary mb-2">
//                           {input.label}
//                         </label>
//                         <select
//                           value={input.value}
//                           onChange={(event) => handleInputChange(event, index)}
//                           className="block w-full bg-dropdownBackground text-primary border border-formBorders py-3.5 px-3 rounded-md shadow-sm">
//                           <option
//                             className="text-primary bg-inputBackGround"
//                             value=""
//                             disabled>
//                             Select Role Type
//                           </option>
//                           {roleTypeOptions.map((role) => (
//                             <option
//                               className="text-primary bg-inputBackGround"
//                               key={role}
//                               value={role}>
//                               {role}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )
//                   }

//                   if (input.label === "Job Location*") {
//                     return (
//                       <div key={index}>
//                         <label className="block text-primary mb-2">
//                           {input.label}
//                         </label>
//                         <select
//                           value={input.value}
//                           onChange={(event) => handleInputChange(event, index)}
//                           className="block w-full bg-dropdownBackground text-primary border border-formBorders py-3.5 px-3 rounded-md shadow-sm">
//                           <option
//                             className="text-primary bg-inputBackGround"
//                             value=""
//                             disabled>
//                             Select Job Location
//                           </option>
//                           {jobLocationOptions.map((loc) => (
//                             <option
//                               className="text-primary bg-inputBackGround"
//                               key={loc}
//                               value={loc}>
//                               {loc}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )
//                   }

//                   return (
//                     <SimpleInputField
//                       key={index}
//                       label={input.label}
//                       placeholder={input.placeholder}
//                       value={input.value}
//                       onChange={(event) => handleInputChange(event, index)}
//                     />
//                   )
//                 })}
//               </div>

//               <div className="mt-5">
//                 <div className="flex w-full justify-between items-center mb-2">
//                   <label className="block text-primary">Job Description*</label>
//                   <Button
//                     onClick={generateJobDescription}
//                     className={`p-2 px-3 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg
//                       bg-gradient-to-b from-gradientStart to-gradientEnd
//                       hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
//                    `}>
//                     <PiStarFourFill size={16} />
//                     <span>
//                       {isGeneratingJobDesc
//                         ? "Generating..."
//                         : "Generate with AI"}
//                     </span>
//                   </Button>
//                 </div>

//                 {/* Show loader, generated content, or textarea based on state */}
//                 {isGeneratingJobDesc ? (
//                   <div className="min-h-[120px] border border-formBorders rounded-md bg-dropdownBackground flex items-center justify-center">
//                     <ElegantLoader />
//                   </div>
//                 ) : generatedJobDesc ? (
//                   <div className="space-y-3">
//                     <div
//                       className="ai-job-desc-display"
//                       dangerouslySetInnerHTML={{ __html: sanitizedJobDesc }}
//                     />
//                     <div className="flex justify-end">
//                       <Button
//                         onClick={() => {
//                           setGeneratedJobDesc("")
//                           setAdditionalInfo("")
//                         }}
//                         className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
//                         Clear
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <TextAreaComponent
//                     placeholder="Enter job description or click the button above to generate with AI"
//                     value={additionalInfo}
//                     onTextChange={setAdditionalInfo}
//                   />
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-center py-5 md:py-10">
//               <Button
//                 onClick={handleSubmit}
//                 className={`p-3 px-10 whitespace-nowrap md:px-5 flex items-center space-x-2 max-w-60 min-w-max h-12 rounded-lg
//     text-navbar
//     bg-gradient-to-b from-gradientStart to-gradientEnd
//     hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
//     disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:hover:ring-0 disabled:bg-gradient-to-b
//   `}
//                 disabled={loading || !isFormValid}>
//                 {loading ? "Generating..." : "Generate Cover Letter"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DashBoardLayout>
//     </>
//   )
// }

// export default AiCoverLetterGenerator

import React, { useState, useMemo } from "react"
import DashBoardLayout from "../../dashboardLayout"
import Dropdown from "../../components/dropdown"
import SimpleInputField from "../../components/SimpleInputFields"
import Button from "../../components/Button"
import { successToast, errorToast } from "../../components/Toast"
import { useNavigate } from "react-router-dom"
import TextAreaComponent from "../../components/TextAreaComponent"
import coverLetterService from "../../api/aiService"
import CircularIndeterminate from "../../components/loader/circular"
import API_ENDPOINTS from "../../api/endpoints"
import { PiStarFourFill } from "react-icons/pi"
import { BiRefresh } from "react-icons/bi"
import DOMPurify from "dompurify"
import ElegantLoader from "../resumeBuilder/ui/BridgeLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const AiCoverLetterGenerator = () => {
  const navigate = useNavigate()
  const [selectedTone, setSelectedTone] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false)
  const [generatedJobDesc, setGeneratedJobDesc] = useState("")

  // Skills generation states
  const [generatedSkills, setGeneratedSkills] = useState([])
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false)

  const [inputFields, setInputFields] = useState([
    { label: "Job Title*", placeholder: "Designer", value: "", required: true },
    { label: "Your Name*", placeholder: "Philip", value: "", required: true },
    {
      label: "Company Name",
      placeholder: "Unknown",
      value: "",
      required: false
    },
    {
      label: "Your Skills*",
      placeholder: "Skills will be separated using ,",
      value: "",
      required: true
    },
    {
      label: "Role Type*",
      placeholder: "Full time",
      value: "",
      required: true
    },
    { label: "Job Location*", placeholder: "Remote", value: "", required: true }
  ])

  const toneOptions = [
    "Formal",
    "Professional",
    "Convincing",
    "Assertive",
    "Inspirational",
    "Informational"
  ]

  const roleTypeOptions = ["Full Time", "Part Time", "Internship", "Freelance"]
  const jobLocationOptions = ["Remote", "Onsite", "Hybrid"]

  const handleToneChange = (event) => {
    setSelectedTone(event.target.value)
  }

  // Updated validation to only check required fields
  const isFormValid =
    selectedTone !== "" &&
    additionalInfo.trim() !== "" &&
    inputFields.every((field) => {
      if (field.required) {
        return field.value.trim() !== ""
      }
      return true
    })

  const handleInputChange = (event, index) => {
    const value = event.target.value
    const newInputFields = [...inputFields]

    // Special validation for "Your job title*" field (index 0)
    if (index === 0) {
      const namePattern = /^[a-zA-Z\s]*$/
      if (namePattern.test(value) && value.length <= 100) {
        newInputFields[index].value = value
        setInputFields(newInputFields)
      }
      return
    }

    // Special validation for "Your Name*" field (index 1)
    if (index === 1) {
      const namePattern = /^[a-zA-Z\s]*$/
      if (namePattern.test(value) && value.length <= 100) {
        newInputFields[index].value = value
        setInputFields(newInputFields)
      }
      return
    }

    // For other fields, update normally
    newInputFields[index].value = value
    setInputFields(newInputFields)
  }

  // Generate skills function
  const generateSkills = async () => {
    const jobTitle = inputFields[0].value.trim()

    if (!jobTitle) {
      errorToast("Please enter a job title first to generate skills.")
      return
    }

    setIsGeneratingSkills(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      // Parse existing skills from the input field
      const existingSkills = inputFields[3].value
        ? inputFields[3].value
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== "")
        : []

      const requestBody = {
        desiredPosition: jobTitle,
        skills: existingSkills
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
      setIsGeneratingSkills(false)
    }
  }

  // Refresh skills function
  const refreshSkills = async () => {
    const jobTitle = inputFields[0].value.trim()

    if (!jobTitle) {
      errorToast("Please enter a job title first to refresh skills.")
      return
    }

    setIsGeneratingSkills(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        errorToast("Access token not found. Please login again.")
        return
      }

      const existingSkills = inputFields[3].value
        ? inputFields[3].value
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== "")
        : []

      const requestBody = {
        desiredPosition: jobTitle,
        skills: existingSkills
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
        successToast("Skills refreshed! Click on skills below to add them.")
      } else {
        errorToast("No new skills generated. Please try again.")
      }
    } catch (error) {
      console.error("Error refreshing skills:", error)
      errorToast("Failed to refresh skills. Please try again.")
    } finally {
      setIsGeneratingSkills(false)
    }
  }

  // Handle skill chip click
  const handleSkillChipClick = (skillName) => {
    const newInputFields = [...inputFields]
    const skillsIndex = 3 // "Your Skills*" field index

    // Get current skills
    const currentSkills = newInputFields[skillsIndex].value
      ? newInputFields[skillsIndex].value
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== "")
      : []

    // Check if skill already exists
    const exists = currentSkills.some(
      (existing) => existing.toLowerCase() === skillName.toLowerCase()
    )

    if (!exists) {
      // Add skill to the input field
      const updatedSkills = [...currentSkills, skillName]
      newInputFields[skillsIndex].value = updatedSkills.join(", ")
      setInputFields(newInputFields)

      // Remove from generated skills
      setGeneratedSkills((prev) => prev.filter((skill) => skill !== skillName))
    }
  }

  const generateJobDescription = async () => {
    const jobTitle = inputFields[0].value.trim()

    if (!jobTitle) {
      errorToast("Please enter a job title first to generate job description.")
      return
    }

    setIsGeneratingJobDesc(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      localStorage.setItem("Save_job_title_Cover_Letter", jobTitle)
      const requestBody = {
        job_title: jobTitle,
        job_description: additionalInfo || "",
        job_skills: inputFields[3].value || ""
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GenerateAIJobDescription}`,
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

      const responseData = await response.json()

      if (responseData.description) {
        setGeneratedJobDesc(responseData.description)
        setAdditionalInfo(responseData.description)
        successToast("Job description generated successfully!")
      } else {
        errorToast("Failed to generate job description. Please try again.")
      }
    } catch (error) {
      console.error("Error generating job description:", error)
      errorToast("Something went wrong while generating job description.")
    } finally {
      setIsGeneratingJobDesc(false)
    }
  }

  // Sanitize the generated job description for safe HTML rendering
  const sanitizedJobDesc = useMemo(() => {
    if (!generatedJobDesc) return ""
    return DOMPurify.sanitize(generatedJobDesc)
  }, [generatedJobDesc])

  const handleSubmit = async () => {
    if (selectedTone === "") {
      errorToast("Please select a tone.")
      return
    }

    const emptyRequiredInput = inputFields.find(
      (input) => input.required && input.value.trim() === ""
    )
    if (emptyRequiredInput) {
      errorToast(`Please fill the ${emptyRequiredInput.label} field.`)
      return
    }

    const nameField = inputFields[1].value.trim()
    if (nameField === "") {
      errorToast("Please enter a valid name.")
      return
    }

    if (nameField.length < 3) {
      errorToast("Name must be at least 3 characters long.")
      return
    }

    const formData = {
      tone: selectedTone,
      job_title: inputFields[0].value,
      your_name: inputFields[1].value,
      applying_for_company: inputFields[2].value || "",
      your_skills: inputFields[3].value,
      role_type: inputFields[4].value,
      job_location: inputFields[5].value,
      job_description: additionalInfo
    }

    setLoading(true)
    try {
      const accessToken = localStorage.getItem("access_token")

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.AiCoverLetterGenerate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()

      if (
        responseData.userData &&
        responseData.companyData &&
        responseData.letterBody
      ) {
        successToast("Cover letter generated successfully!")

        localStorage.setItem(
          "coverLetterUserData",
          JSON.stringify(responseData.userData)
        )
        localStorage.setItem(
          "coverLetterCompanyData",
          JSON.stringify(responseData.companyData)
        )
        localStorage.setItem("coverLetterBody", responseData.letterBody)

        navigate("/show-cover-letter")
      } else {
        errorToast(responseData.message || "Failed to generate cover letter.")
      }
    } catch (error) {
      console.error("Error:", error)
      errorToast("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <CircularIndeterminate />
        </div>
      )}
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full">
            <div className="text-center space-y-3 pt-5 md:pt-10 md:pb-5">
              <p className="text-xl md:text-3xl font-normal text-primary">
                AI Cover Letter Generator
              </p>
              <p className="text-sm md:text-base px-3 pb-3 md:px-0 md:pb-0 font-normal text-primary">
                Create your personalized cover letter for job applications,
                powered by AI technology—fast and free!
              </p>
            </div>
            <hr className="border-t-2 border-simplePurple mb-5 w-[60%] md:w-[40%] mx-auto" />

            {/* Add CSS for job description display */}
            <style jsx>{`
              .ai-job-desc-display {
                background-color: rgba(251, 251, 251, 0.08);
                border: 2px dashed rgba(251, 251, 251, 0.2);
                border-radius: 8px;
                padding: 16px;
                min-height: 120px;
                color: #ffffff;
                overflow-y: auto;
                max-height: 300px;
              }

              .ai-job-desc-display ul {
                list-style-type: disc;
                padding-left: 20px;
                margin: 8px 0;
              }

              .ai-job-desc-display li {
                margin-bottom: 8px;
                line-height: 1.5;
              }

              .ai-job-desc-display ol {
                list-style-type: decimal;
                padding-left: 20px;
                margin: 8px 0;
              }
            `}</style>

            <div className="w-full px-5 md:px-10 py-5 ">
              <Dropdown
                className="py-3"
                label="Select a tone*"
                placeholder="Formal"
                options={toneOptions}
                onChange={handleToneChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 items-center">
                {inputFields.map((input, index) => {
                  if (input.label === "Role Type*") {
                    return (
                      <div key={index}>
                        <label className="block text-primary mb-2">
                          {input.label}
                        </label>
                        <select
                          value={input.value}
                          onChange={(event) => handleInputChange(event, index)}
                          className="block w-full bg-dropdownBackground text-primary border border-formBorders py-3.5 px-3 rounded-md shadow-sm">
                          <option
                            className="text-primary bg-inputBackGround"
                            value=""
                            disabled>
                            Select Role Type
                          </option>
                          {roleTypeOptions.map((role) => (
                            <option
                              className="text-primary bg-inputBackGround"
                              key={role}
                              value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  if (input.label === "Job Location*") {
                    return (
                      <div key={index}>
                        <label className="block text-primary mb-2">
                          {input.label}
                        </label>
                        <select
                          value={input.value}
                          onChange={(event) => handleInputChange(event, index)}
                          className="block w-full bg-dropdownBackground text-primary border border-formBorders py-3.5 px-3 rounded-md shadow-sm">
                          <option
                            className="text-primary bg-inputBackGround"
                            value=""
                            disabled>
                            Select Job Location
                          </option>
                          {jobLocationOptions.map((loc) => (
                            <option
                              className="text-primary bg-inputBackGround"
                              key={loc}
                              value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  // Special handling for Skills field with generate button
                  if (input.label === "Your Skills*") {
                    return (
                      <div key={index}>
                        <div className="flex w-full justify-between items-center mb-2">
                          <label className="block text-primary text-sm">
                            {input.label}
                          </label>
                          {generatedSkills.length === 0 ? (
                            <Button
                              onClick={generateSkills}
                              disabled={isGeneratingSkills}
                              className="p-1 px-2 whitespace-nowrap flex items-center space-x-1 min-w-max text-xs text-navbar rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                              <PiStarFourFill size={12} />
                              <span>
                                {isGeneratingSkills ? "Gen..." : "AI Skills"}
                              </span>
                            </Button>
                          ) : (
                            <Button
                              onClick={refreshSkills}
                              disabled={isGeneratingSkills}
                              className="p-1 px-2 whitespace-nowrap flex items-center space-x-1 min-w-max text-xs text-navbar rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                              <BiRefresh size={12} />
                              <span>
                                {isGeneratingSkills ? "Regen..." : "Refresh"}
                              </span>
                            </Button>
                          )}
                        </div>

                        <SimpleInputField
                          label=""
                          placeholder={input.placeholder}
                          value={input.value}
                          onChange={(event) => handleInputChange(event, index)}
                        />
                      </div>
                    )
                  }

                  return (
                    <SimpleInputField
                      key={index}
                      label={input.label}
                      placeholder={input.placeholder}
                      value={input.value}
                      onChange={(event) => handleInputChange(event, index)}
                    />
                  )
                })}
              </div>

              {/* Generated Skills Chips - Moved outside grid */}
              {(generatedSkills.length > 0 || isGeneratingSkills) && (
                <div className="mt-5 bg-almostBlack rounded-lg p-4">
                  {isGeneratingSkills ? (
                    <div className="flex items-center justify-center py-8">
                      <ElegantLoader />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-primary mb-3">
                        Click on skills below to add them to your profile
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {generatedSkills.map((skillName, skillIndex) => (
                          <button
                            key={skillIndex}
                            onClick={() => handleSkillChipClick(skillName)}
                            className="flex items-center text-primary border border-customGray rounded-md bg-inputBackGround hover:bg-purpleBackground px-2 md:px-3 py-2 transition-colors">
                            + {skillName}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5">
                <div className="flex w-full justify-between items-center mb-2">
                  <label className="block text-primary">Job Description*</label>
                  <Button
                    onClick={generateJobDescription}
                    className={`p-2 px-3 whitespace-nowrap flex items-center space-x-2 min-w-max text-navbar rounded-lg 
                      bg-gradient-to-b from-gradientStart to-gradientEnd 
                      hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
                   `}>
                    <PiStarFourFill size={16} />
                    <span>
                      {isGeneratingJobDesc
                        ? "Generating..."
                        : "Generate with AI"}
                    </span>
                  </Button>
                </div>

                {/* Show loader, generated content, or textarea based on state */}
                {isGeneratingJobDesc ? (
                  <div className="min-h-[120px] border border-formBorders rounded-md bg-dropdownBackground flex items-center justify-center">
                    <ElegantLoader />
                  </div>
                ) : generatedJobDesc ? (
                  <div className="space-y-3">
                    <div
                      className="ai-job-desc-display"
                      dangerouslySetInnerHTML={{ __html: sanitizedJobDesc }}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setGeneratedJobDesc("")
                          setAdditionalInfo("")
                        }}
                        className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TextAreaComponent
                    placeholder="Enter job description or click the button above to generate with AI"
                    value={additionalInfo}
                    onTextChange={setAdditionalInfo}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center py-5 md:py-10">
              <Button
                onClick={handleSubmit}
                className={`p-3 px-10 whitespace-nowrap md:px-5 flex items-center space-x-2 max-w-60 min-w-max h-12 rounded-lg 
    text-navbar 
    bg-gradient-to-b from-gradientStart to-gradientEnd 
    hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
    disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:hover:ring-0 disabled:bg-gradient-to-b
  `}
                disabled={loading || !isFormValid}>
                {loading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </>
  )
}

export default AiCoverLetterGenerator
