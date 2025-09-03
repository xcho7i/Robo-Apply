import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DashboardNavbar from "../../../dashboardNavbar"
import Button from "../../../components/Button"
import { HiArrowLeft } from "react-icons/hi"
import BasicModernTemplate from "../ui/BasicModernTemplate"
import ClassicalProfessional from "../ui/ClassicalProfessional"
import ModernProfessional from "../ui/ModernProfessional"
import Creative from "../ui/CreativeTemplate"
import Classic from "../ui/ClassicTemplate"
import { ImInsertTemplate } from "react-icons/im"

const ShowResume = () => {
  const navigate = useNavigate()
  const [resumeData, setResumeData] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templateName, setTemplateName] = useState("")

  useEffect(() => {
    // Get data from localStorage
    const storedSkills =
      JSON.parse(localStorage.getItem("resumeBuilderSkills")) || []
    const storedAchievements =
      JSON.parse(localStorage.getItem("resumeBuilderAchievements")) || []
    const storedLanguages =
      JSON.parse(localStorage.getItem("resumeBuilderLanguages")) || []
    const storedCertifications =
      JSON.parse(localStorage.getItem("resumeBuilderCertifications")) || []
    const storedExperiences =
      JSON.parse(localStorage.getItem("resumeBuilderExperiences")) || []
    const storedQualifications =
      JSON.parse(localStorage.getItem("resumeBuilderQualifications")) || []
    const storedPersonalData =
      JSON.parse(localStorage.getItem("resumeBuilderPersonalData")) || {}
    const resumeTitle = localStorage.getItem("resumeTitle") || "My Resume"

    const data = {
      skills: storedSkills,
      achievements: storedAchievements,
      languages: storedLanguages,
      certifications: storedCertifications,
      experiences: storedExperiences,
      qualifications: storedQualifications,
      personalData: storedPersonalData,
      resumeTitle
    }

    setResumeData(data)

    // Get the selected template and its name from localStorage
    const template = localStorage.getItem("selectedTemplate") || "basic"
    setSelectedTemplate(template)

    // Set the corresponding template name based on selected template
    if (template === "basic") {
      setTemplateName("Basic Modern")
    } else if (template === "classical") {
      setTemplateName("Classic Professional")
    } else if (template === "modern") {
      setTemplateName("Modern Professional")
    } else if (template === "creative") {
      setTemplateName("Creative")
    } else if (template === "classic") {
      setTemplateName("Classic")
    }
  }, [])

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-primary text-center">Loading Resume Preview...</p>
      </div>
    )
  }

  const {
    skills,
    achievements,
    languages,
    certifications,
    experiences,
    qualifications,
    personalData,
    resumeTitle
  } = resumeData

  // Determine which template to display based on selectedTemplate
  let TemplateToShow
  if (selectedTemplate === "basic") {
    TemplateToShow = BasicModernTemplate
  } else if (selectedTemplate === "classical") {
    TemplateToShow = ClassicalProfessional
  } else if (selectedTemplate === "modern") {
    TemplateToShow = ModernProfessional
  } else if (selectedTemplate === "creative") {
    TemplateToShow = Creative
  } else if (selectedTemplate === "classic") {
    TemplateToShow = Classic
  }

  return (
    <div className="flex flex-col bg-almostBlack">
      <header>
        <DashboardNavbar />
      </header>

      <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full px-3 md:px-10 py-5 md:py-10">
          <div className="flex items-center justify-between md:px-10 lg:px-20">
            <p className="text-primary text-lg md:text-3xl font-medium">
              AI ResumeBuilder
            </p>
            <div className="flex gap-5">
              <Button
                // onClick={() =>
                //   navigate("/scan-resume/chooseTemplateCreateResume")
                // }
                onClick={() =>
                  navigate("/scan-resume/chooseTemplateCreateResume")
                }
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <ImInsertTemplate className="mr-2" />
                Change Template
              </Button>
              <Button
                // onClick={() =>
                //   navigate("/scan-resume/chooseTemplateCreateResume")
                // }
                onClick={() => navigate("/auto-apply")}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center md:h-full">
          <div className=" px-5 w-full rounded-lg text-center space-y-5">
            <p className="text-primary text-lg lg:text-4xl font-medium">
              Choose one of our ATS - friendly resume templates.
            </p>
            <p className="text-primary text-lg md:text-2xl font-normal pt-2 pb-5">
              {templateName} {/* Display the template name here */}
            </p>
          </div>

          {/* <div className="h-auto max-h-[950px]  overflow-auto"> */}
          {TemplateToShow && (
            <TemplateToShow
              personalData={personalData}
              skills={skills}
              achievements={achievements}
              certifications={certifications}
              experiences={experiences}
              languages={languages}
              qualifications={qualifications}
            />
          )}
          {/* </div> */}
        </div>
      </div>
    </div>
  )
}

export default ShowResume
