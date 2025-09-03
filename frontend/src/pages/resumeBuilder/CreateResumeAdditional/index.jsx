import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashboardNavbar from "../../../dashboardNavbar"
import Button from "../../../components/Button"
import AddSkillsResume from "../ui/AddSkillsResume"
import AddAchievementsResume from "../ui/AddAchievementsResume"
import AddLanguageResume from "../ui/AddLanguageResume" // import AddLanguageResume component
import AchievementModal from "../ui/AchievementModal"
import CertificateModal from "../ui/CertificateModal"
import AddCertificateResume from "../ui/AddCertificateResume"
import DashBoardLayout from "../../../dashboardLayout"
import CircularIndeterminate from "../../../components/loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import { successToast, errorToast } from "../../../components/Toast"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const CreateResumeAdditional = () => {
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [achievements, setAchievements] = useState([])
  const [languages, setLanguages] = useState([]) // Add state for languages
  const [certifications, setCertifications] = useState([])
  const [isAchievementModalOpen, setAchievementModalOpen] = useState(false)
  const [isCertificateModalOpen, setCertificateModalOpen] = useState(false)
  const [editingAchievementIndex, setEditingAchievementIndex] = useState(null)
  const [editingCertificateIndex, setEditingCertificateIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  // Skill Handlers
  const handleAddSkill = (skillData) => {
    setSkills([...skills, skillData])
  }

  const handleDeleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    setSkills(updatedSkills)
  }

  // Achievement Handlers
  const handleAddAchievement = (achievementData) => {
    if (editingAchievementIndex !== null) {
      handleEditAchievement(editingAchievementIndex, achievementData)
    } else {
      setAchievements([...achievements, achievementData])
    }
    setEditingAchievementIndex(null)
  }

  const handleEditAchievement = (index, achievementData) => {
    const updatedAchievements = [...achievements]
    updatedAchievements[index] = achievementData
    setAchievements(updatedAchievements)
  }

  const handleDeleteAchievement = (index) => {
    const updatedAchievements = achievements.filter((_, i) => i !== index)
    setAchievements(updatedAchievements)
  }

  // Language Handlers
  const handleAddLanguage = (languageData) => {
    setLanguages([...languages, languageData])
  }

  const handleEditLanguage = (index, languageData) => {
    const updatedLanguages = [...languages]
    updatedLanguages[index] = languageData
    setLanguages(updatedLanguages)
  }

  const handleDeleteLanguage = (index) => {
    const updatedLanguages = languages.filter((_, i) => i !== index)
    setLanguages(updatedLanguages)
  }

  // Handlers for Certifications
  const handleAddCertification = (certificationData) => {
    if (editingCertificateIndex !== null) {
      handleEditCertification(editingCertificateIndex, certificationData)
    } else {
      setCertifications([...certifications, certificationData])
    }
    setEditingCertificateIndex(null)
  }

  const handleEditCertification = (index, certificationData) => {
    const updatedCertifications = [...certifications]
    updatedCertifications[index] = certificationData
    setCertifications(updatedCertifications)
  }

  const handleDeleteCertification = (index) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index)
    setCertifications(updatedCertifications)
  }

  // Function to log all data when user clicks Continue
  const handleContinue = () => {
    setLoading(true)

    // Save to localStorage
    localStorage.setItem("resumeBuilderSkills", JSON.stringify(skills))
    localStorage.setItem(
      "resumeBuilderAchievements",
      JSON.stringify(achievements)
    )
    localStorage.setItem("resumeBuilderLanguages", JSON.stringify(languages))
    localStorage.setItem(
      "resumeBuilderCertifications",
      JSON.stringify(certifications)
    )

    // Retrieve all required data from localStorage
    const resumeId = localStorage.getItem("ResumeBuilder-Id")
    const accessToken = localStorage.getItem("access_token")
    const resumeTitle = localStorage.getItem("resumeTitle")

    const personalData = JSON.parse(
      localStorage.getItem("resumeBuilderPersonalData") || "{}"
    )
    const experiencesData = JSON.parse(
      localStorage.getItem("resumeBuilderExperiences") || "[]"
    )
    const qualificationsData = JSON.parse(
      localStorage.getItem("resumeBuilderQualifications") || "[]"
    )
    const storedSkills = JSON.parse(
      localStorage.getItem("resumeBuilderSkills") || "[]"
    )
    const storedAchievements = JSON.parse(
      localStorage.getItem("resumeBuilderAchievements") || "[]"
    )
    const storedLanguages = JSON.parse(
      localStorage.getItem("resumeBuilderLanguages") || "[]"
    )
    const storedCertifications = JSON.parse(
      localStorage.getItem("resumeBuilderCertifications") || "[]"
    )

    if (!resumeId || !accessToken) {
      errorToast("Missing resume ID or access token")
      setLoading(false)
      return
    }

    // ✅ Skills (if present): each must have a non-empty `skill`
    if (storedSkills.length > 0) {
      const invalidSkill = storedSkills.some(
        (skill) => !skill.skill || skill.skill.trim() === ""
      )
      if (invalidSkill) {
        errorToast("Each skill must have a valid skill name.")
        setLoading(false)
        return
      }
    }

    // ✅ Languages (if present): each must have `language` and `proficiency`
    if (storedLanguages.length > 0) {
      const invalidLanguage = storedLanguages.some(
        (lang) =>
          !lang.language ||
          lang.language.trim() === "" ||
          !lang.proficiency ||
          lang.proficiency.trim() === ""
      )
      if (invalidLanguage) {
        errorToast("Each language must include a language and proficiency.")
        setLoading(false)
        return
      }
    }

    // ✅ Certifications (if present): each must have a non-empty `certificationTitle`
    if (storedCertifications.length > 0) {
      const invalidCert = storedCertifications.some(
        (cert) =>
          !cert.certificationTitle || cert.certificationTitle.trim() === ""
      )
      if (invalidCert) {
        errorToast("Each certification must have a certification title.")
        setLoading(false)
        return
      }
    }

    // ✅ Achievements (if present): each must have a non-empty `awardTitle`
    if (storedAchievements.length > 0) {
      const invalidAward = storedAchievements.some(
        (award) => !award.awardTitle || award.awardTitle.trim() === ""
      )
      if (invalidAward) {
        errorToast("Each achievement must have a title.")
        setLoading(false)
        return
      }
    }

    // Format experiences (replace "Present" with null)
    const formattedExperiences = experiencesData.map((exp) => ({
      ...exp,
      endDate: exp.endDate === "Present" ? null : exp.endDate
    }))

    // Merge all data
    const mergedData = {
      ...personalData,
      experiences: formattedExperiences,
      qualifications: qualificationsData,
      skills: storedSkills,
      achievements: storedAchievements,
      languages: storedLanguages,
      certifications: storedCertifications
    }

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
        console.log("Resume updated with additional info:", responseData)

        if (responseData.success) {
          successToast("Resume updated with additional information!")
          navigate("/scan-resume/chooseTemplateCreateResume")
        } else {
          errorToast("Failed to update resume.")
          console.error("Update failed:", responseData)
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

  // Use effect to load data from localStorage
  useEffect(() => {
    const storedSkills = JSON.parse(localStorage.getItem("resumeBuilderSkills"))
    const storedAchievements = JSON.parse(
      localStorage.getItem("resumeBuilderAchievements")
    )
    const storedLanguages = JSON.parse(
      localStorage.getItem("resumeBuilderLanguages")
    )
    const storedCertifications = JSON.parse(
      localStorage.getItem("resumeBuilderCertifications")
    )

    if (storedSkills) setSkills(storedSkills)
    if (storedAchievements) setAchievements(storedAchievements)
    if (storedLanguages) setLanguages(storedLanguages)
    if (storedCertifications) setCertifications(storedCertifications)
  }, [])

  return (
    <DashBoardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularIndeterminate />
        </div>
      ) : (
        <div className="flex flex-col h-full bg-almostBlack">
          <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
            <div className="w-full">
              <div className="w-full py-5 px-3">
                <div className="flex items-center justify-center relative">
                  <div className="flex items-center">
                    <div
                      className="flex flex-col items-center hover:cursor-pointer"
                      onClick={() => navigate("/scan-resume/makeProfile")}>
                      <div className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-stepperBackground text-primary">
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
                    <div
                      className="flex flex-col items-center hover:cursor-pointer"
                      onClick={() => navigate("/scan-resume/addExperience")}>
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full border border-stepperBackground text-primary">
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
                      className="flex flex-col items-center hover:cursor-pointer"
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
                    <div className="flex flex-col items-center hover:cursor-pointer">
                      <div className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-stepperBackground text-primary">
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
                      className="flex flex-col items-center hover:cursor-pointer"
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
                    Tell us about your additional
                  </p>
                  <p className="text-primary text-sm md:text-xl font-normal pt-2">
                    Include every school, even if you are a current student or
                    did not graduate
                  </p>
                </div>
              </div>
              <div className="px-[5%] md:px-[20%] mt-10">
                {/* <AddSkillsResume
                  skillsList={skills}
                  addSkill={handleAddSkill}
                  deleteSkill={handleDeleteSkill}
                /> */}
                <AddSkillsResume
                  skillsList={skills}
                  addSkill={handleAddSkill}
                  deleteSkill={handleDeleteSkill}
                />
                <AddAchievementsResume
                  achievements={achievements}
                  onEditAchievement={(index) => {
                    setEditingAchievementIndex(index)
                    setAchievementModalOpen(true)
                    // setAchievements(null);
                  }}
                  onDeleteAchievement={handleDeleteAchievement}
                  onAddAchievement={() => setAchievementModalOpen(true)}
                />
                {/* Updated Add Language Component */}
                <AddLanguageResume
                  languages={languages}
                  onEditLanguage={handleEditLanguage}
                  onDeleteLanguage={handleDeleteLanguage}
                  onAddLanguage={handleAddLanguage} // Correctly pass handler to add new language
                />
                <AddCertificateResume
                  certifications={certifications}
                  onEditCertification={(index) => {
                    setEditingCertificateIndex(index)
                    setCertificateModalOpen(true)
                  }}
                  onDeleteCertification={handleDeleteCertification}
                  onAddCertification={() => setCertificateModalOpen(true)}
                />
              </div>
              <div className="flex justify-center my-10 space-x-4">
                <Button
                  onClick={() => navigate("/scan-resume/addEducation")}
                  // className="p-3 px-10 text-xl font-semibold border-2 border-purple  text-primary rounded-full hover:ring-2 hover:bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  className="p-2 sm:p-3 px-8 md:px-6 min-w-32 flex items-center justify-center bg-almostBlack text-navbar font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple">
                  Back
                </Button>
                <Button
                  onClick={handleContinue} // Handle the continue action
                  // className="p-3 px-10 text-xl font-semibold bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  className="p-2 sm:p-3 px-4 sm:px-6 min-w-32 flex items-center justify-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Continue
                </Button>
              </div>
            </div>
          </div>
          <AchievementModal
            isOpen={isAchievementModalOpen}
            onClose={() => setAchievementModalOpen(false)}
            onAddAchievement={handleAddAchievement}
            initialData={
              editingAchievementIndex !== null
                ? achievements[editingAchievementIndex]
                : {}
            }
            onSave={handleEditAchievement}
          />
          <CertificateModal
            isOpen={isCertificateModalOpen}
            onClose={() => setCertificateModalOpen(false)}
            onAddCertification={handleAddCertification}
            initialData={
              editingCertificateIndex !== null
                ? certifications[editingCertificateIndex]
                : {}
            }
            onSave={(id, data) =>
              handleEditCertification(editingCertificateIndex, data)
            }
          />
        </div>
      )}
    </DashBoardLayout>
  )
}

export default CreateResumeAdditional
