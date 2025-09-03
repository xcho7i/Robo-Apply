import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import uploadResumeHere from "../../../assets/resumeManagerIcons/uploadResumeIcon.svg"
import { HiArrowLeft } from "react-icons/hi"
import DashBoardLayout from "../../../dashboardLayout"
import Button from "../../../components/Button"
import ResumeUploadModal from "../../../components/Modals/ResumeUploadModal"
import { BsThreeDots } from "react-icons/bs"
import { successToast, errorToast } from "../../../components/Toast"
import ViewAndDownloadMenu from "../../../components/ViewAndDownloadMenu"
import AddExperienceModal from "../../../components/Modals/AddExperienceModal"
import WorkExperience from "../ui/WorkExperience"
import DeleteExperienceModal from "../../../components/Modals/DeleteExperienceModal"
import ResumeManagerCoverLetter from "../ui/ResumeManagerCoverLetter"

import SocialMediaLinks from "../ui/SocialMediaLinks"
import Qualification from "../ui/Qualification"
import AddQualificationModal from "../../../components/Modals/AddQualificationModal"
import DeleteEducationModal from "../../../components/Modals/DeleteEducationModal"
import Certification from "../ui/Certification"
import AddCertificationModal from "../../../components/Modals/AddCertificationModal"
import DeleteCertificationModal from "../../../components/Modals/DeleteCertificationModal"
import AddAchievementModal from "../../../components/Modals/AddAchievementModal"
import DeleteAchievementModal from "../../../components/Modals/DeleteAchievementModal"
import Achievement from "../ui/Achievement"
import Miscellaneous from "../ui/Miscellaneous"
import Skills from "../ui/Skills"
import Languages from "../ui/Languages"
import CircularIndeterminate from "../../../components/loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import { addResume, updateResume } from "@/src/api/functions"
import { Experience, Resume } from "@types"
import { BASE_URL } from "@/src/api"
import PersonalData from "../ui/PersonalData"
import { message } from "antd"
import { isNameOkay, isRequiredFieldsFilled } from "./helpers"

// Interface for editing experience data
interface EditExperienceData extends Experience {
  editIndex: number
}

// import ResumeForm from "../ResumeForm"
// const BASE_URL =
// import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const EditResumeManager = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false)
  // const [resume, setResume] = useState<Resume & { resumeFileName: string }>()
  // console.log(resume)

  // Resume state
  const [replaceResumeModalOpen, setReplaceResumeModalOpen] = useState(false)
  const [resumeName, setResumeName] = useState("")
  // const [resumeFile, setResumeFile] = useState(location.state?.file || null)
  // const [resumeFileName, setResumeFileName] = useState("No File Uploaded")
  const [menuVisible, setMenuVisible] = useState(false)

  const [nameError, setNameError] = useState({ firstName: "", lastName: "" })

  //  States for add
  const [addExperienceModalOpen, setAddExperienceModalOpen] = useState(false)
  const [addQualificationModalOpen, setAddQualificationModalOpen] =
    useState(false)
  const [addCertificationModalOpen, setAddCertificationModalOpen] =
    useState(false)
  const [addAchievementModalOpen, setAddAchievementModalOpen] = useState(false)

  // seperate states
  const [experiences, setExperiences] = useState<Resume["experiences"]>([])
  const [qualifications, setQualifications] = useState<
    Resume["qualifications"]
  >([])
  const [certifications, setCertifications] = useState<
    Resume["certifications"]
  >([])
  const [achievements, setAchievements] = useState<Resume["achievements"]>([])
  const [skills, setSkills] = useState<Resume["skills"]>([])
  const [languagesList, setLanguagesList] = useState<Resume["languagesList"]>(
    []
  )

  // states for delete
  const [deleteExperienceModalOpen, setDeleteExperienceModalOpen] =
    useState(false)
  const [deleteQualificationModalOpen, setDeleteQualificationModalOpen] =
    useState(false)
  const [deleteCertificationModalOpen, setDeleteCertificationModalOpen] =
    useState(false)
  const [deleteAchievementModalOpen, setDeleteAchievementModalOpen] =
    useState(false)

  // State for deletion
  const [experienceToDelete, setExperienceToDelete] = useState(null)
  const [qualificationToDelete, setQualificationToDelete] = useState(null)
  const [certificationToDelete, setCertificationToDelete] = useState(null)
  const [achievementToDelete, setAchievementToDelete] = useState(null)

  // State for editing
  const [editExperienceData, setEditExperienceData] =
    useState<EditExperienceData | null>(null)
  const [editQualificationData, setEditQualificationData] =
    useState<Qualification | null>(null)
  const [editCertificationData, setEditCertificationData] =
    useState<Certification | null>(null)
  const [editAchievementData, setEditAchievementData] =
    useState<Achievement | null>(null)

  // Social media state
  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [dribbleUrl, setDribbleUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [otherUrl, setOtherUrl] = useState("")
  const [coverLetter, setCoverLetter] = useState("")

  const [personalFieldErrors, setPersonalFieldErrors] = useState<
    Resume["personalInformation"]
  >({} as any)
  const [formErrors, setFormErrors] = useState<Resume["formData"]>({} as any)

  const [personalInformation, setPersonalInformation] = useState<
    Resume["personalInformation"]
  >({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    countryCode: "",
    email: "",
    gender: "",
    phoneNo: "",
    state: "",
    zipCode: "",
    timeZone: "Central",
    mailingAddress: ""
  })

  const [formData, setFormData] = useState<Resume["formData"]>({
    experience: "",
    veteranStatus: "",
    disability: "",
    willingToRelocate: "",
    raceEthnicity: "",
    noticePeriod: "",
    expectedSalary: "",
    expectedSalaryCurrency: "",
    currentSalary: "",
    currentSalaryCurrency: "",
    drivingLicense: "",
    highestEducation: "",
    expectedJoiningDate: "",
    companiesExclude: "",
    visaSponsorshipStatus: "yes",
    securityClearanceStatus: "yes",
    canStartImmediately: "yes",
    hybridSetting: "yes",
    siteSetting: "yes",
    remoteSetting: "yes",
    currentlyEmployed: "no",
    countriesAuthorizedToWork: ""
  })

  const handleFormDataChange = (field: keyof Resume["formData"], value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value
    }))

    if (value && String(value)?.trim()) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: false
      }))
    }
  }
  const handlePersonalInfoChange = (
    field: keyof Resume["personalInformation"],
    value
  ) => {
    setPersonalInformation((prevState) => ({
      ...prevState,
      [field]: value
    }))

    if (value && String(value)?.trim()) {
      setPersonalFieldErrors((prevErrors) => ({
        ...prevErrors,
        [field]: false
      }))
    }
  }

  // Resume Handlers
  const handleReplaceResume = () => {
    setReplaceResumeModalOpen(true)
  }

  const handleModalSubmit = (newResumeName: string, file: File) => {
    setResumeName(newResumeName)
    // setResumeFile(file)
    // setResumeFileName(file.name)
    setReplaceResumeModalOpen(false)
    window.location.reload()
  }

  // Experience Handlers
  const handleAddExperience = (experience: Experience) => {
    setExperiences((prev) => [...prev, experience])
    setAddExperienceModalOpen(false)
  }

  // Qualification Handlers
  const handleAddQualification = (qualification: Qualification) => {
    setQualifications((prev) => [...prev, qualification])
    setAddQualificationModalOpen(false)
  }

  // Certification handlers
  const handleAddCertification = (certification: Certification) => {
    setCertifications((prev) => [...prev, certification])
    setAddCertificationModalOpen(false)
  }

  // Achivement handler
  const handleAddAchievement = (achievement) => {
    setAchievements((prev) => [...prev, achievement])
    setAddAchievementModalOpen(false)
  }

  // edit Experience
  const handleEditExperience = (index) => {
    const experienceToEdit = experiences[index]
    setEditExperienceData({ ...experienceToEdit, editIndex: index })
    setAddExperienceModalOpen(true)
  }

  // edit Qualification
  const handleEditQualification = (index) => {
    const qualificationToEdit = qualifications[index]
    setEditQualificationData({ ...qualificationToEdit, id: index })
    setAddQualificationModalOpen(true)
  }

  // edit Certification
  const handleEditCertification = (index) => {
    const certificationToEdit = certifications[index]
    setEditCertificationData({ ...certificationToEdit, id: index })
    setAddCertificationModalOpen(true)
  }

  // Edit Achievement
  const handleEditAchievement = (index) => {
    const achievementToEdit = achievements[index]
    setEditAchievementData({ ...achievementToEdit, id: index })
    setAddAchievementModalOpen(true)
  }

  // delete Experience
  const handleDeleteExperience = (index) => {
    setExperienceToDelete(index)
    setDeleteExperienceModalOpen(true)
  }

  // delete Qualification
  const handleDeleteQualification = (index) => {
    setQualificationToDelete(index)
    setDeleteQualificationModalOpen(true)
  }

  // delete Certification
  const handleDeleteCertification = (index) => {
    setCertificationToDelete(index)
    setDeleteCertificationModalOpen(true)
  }

  // delete achievement
  const handleDeleteAchievement = (index) => {
    setAchievementToDelete(index)
    setDeleteAchievementModalOpen(true)
  }

  // save Exprience
  const handleSaveExperience = (id, updatedExperience) => {
    // Handle both id and editIndex cases for backward compatibility
    const actualId = typeof id === "number" ? id : parseInt(id)
    setExperiences((prevExperiences) =>
      prevExperiences.map((exp, idx) =>
        idx === actualId ? updatedExperience : exp
      )
    )
    setEditExperienceData(null)
  }

  // save Qualification
  const handleSaveQualification = (id, updatedQualification) => {
    setQualifications((prevQualifications) =>
      prevQualifications.map((qul, idq) =>
        idq === id ? updatedQualification : qul
      )
    )
    setEditQualificationData(null)
  }

  // save Certification
  const handleSaveCertification = (id, updatedCertification) => {
    setCertifications((prevCertifications) =>
      prevCertifications.map((cert, idx) =>
        idx === id ? updatedCertification : cert
      )
    )
    setEditCertificationData(null)
  }

  // Save Achievement
  const handleSaveAchievement = (id, updatedAchievement) => {
    setAchievements((prevAchievements) =>
      prevAchievements.map((ach, idx) =>
        idx === id ? updatedAchievement : ach
      )
    )
    setEditAchievementData(null)
  }

  // confrm Delete Experience
  const confirmDeleteExperience = () => {
    setExperiences((prevExperiences) =>
      prevExperiences.filter((_, idx) => idx !== experienceToDelete)
    )
    setDeleteExperienceModalOpen(false)
    setExperienceToDelete(null)
  }

  // confrm Delete Qualification
  const confirmDeleteQualification = () => {
    setQualifications((prevQualifications) =>
      prevQualifications.filter((_, idx) => idx !== qualificationToDelete)
    )
    setDeleteQualificationModalOpen(false)
    setQualificationToDelete(null)
  }

  // confrm Delete Certification
  const confirmDeleteCertification = () => {
    setCertifications((prevCertifications) =>
      prevCertifications.filter((_, idx) => idx !== certificationToDelete)
    )
    setDeleteCertificationModalOpen(false)
    setCertificationToDelete(null)
  }

  // Confirm delete achievement
  const confirmDeleteAchievement = () => {
    setAchievements((prevAchievements) =>
      prevAchievements.filter((_, idx) => idx !== achievementToDelete)
    )
    setDeleteAchievementModalOpen(false)
    setAchievementToDelete(null)
  }

  // Menu Handlers
  const toggleMenu = () => {
    setMenuVisible((prev) => !prev)
  }

  // // View and Download Handlers
  const handleView = () => {
    const resumeUrlPath = localStorage.getItem("resumeUrlPath")

    if (resumeUrlPath) {
      window.open(resumeUrlPath, "_blank")
      successToast("Resume is now open in a new tab!")
    } else {
      errorToast("No resume URL found in local storage.")
    }
  }

  const handleDownload = async () => {
    const resumeUrlPath = localStorage.getItem("resumeUrlPath")
    setLoading(true)
    //fFIXME
    if (resumeUrlPath) {
      const fullUrl = `${BASE_URL}${API_ENDPOINTS.DownloadFile(resumeUrlPath)}`

      try {
        const response = await fetch(fullUrl)
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }

        const blob = await response.blob()
        const downloadUrl = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = "Download Resume"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)

        successToast("Resume downloaded successfully!")
      } catch (error) {
        console.error("Download failed:", error)
        errorToast("Failed to download the resume.")
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
      errorToast("No resume URL found in local storage.")
    }
  }

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0]
  }

  // Add Skill Handler
  const addSkill = (newSkill) => {
    setSkills((prevSkills) => [...prevSkills, newSkill])
  }

  // Delete Skill Handler
  const deleteSkill = (index) => {
    setSkills((prevSkills) => prevSkills.filter((_, i) => i !== index))
  }

  // Add Languages
  const addLanguage = (newLanguage) => {
    setLanguagesList([...languagesList, newLanguage])
  }

  // Delete Language
  const deleteLanguage = (index) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index))
  }

  // save all update changes
  const handleUpdateResume = async () => {
    const updatedExperiences = experiences.map((exp: any) => ({
      ...exp,
      startDate: formatDate(exp.startDate),
      endDate: exp.endDate ? formatDate(exp.endDate) : "present"
    }))

    const resumeNameFromLocalStorage = localStorage.getItem("resumeName")
    const resumeUrlPathFromLocalStorage = localStorage.getItem("resumeUrlPath")
    const jobTitleFromLocalStorage = localStorage.getItem("jobTitle") // Get job title from localStorage
    const resumeResponse = JSON.parse(
      localStorage.getItem("resumeResponse") || "{}"
    )
    const resumeId = localStorage.getItem("resumeId")

    if (
      !resumeNameFromLocalStorage ||
      !resumeUrlPathFromLocalStorage ||
      !resumeId
    ) {
      errorToast("Missing resume data")
      return
    }

    if (personalInformation.firstName && personalInformation.lastName) {
      let user = localStorage.getItem("user_data")
      if (user) {
        let userData = JSON.parse(user)
        let userFirstName = userData?.firstName
        let userLastName = userData?.lastName
        const isFirstNameOkay = isNameOkay(
          userFirstName || "",
          personalInformation.firstName
        )
        const isLastNameOkay = isNameOkay(
          userLastName || "",
          personalInformation.lastName
        )

        // if (!isFirstNameOkay || !isLastNameOkay) {
        //   errorToast("First Name or Last Name doesn't match with your account")
        //   setNameError({
        //     firstName: isFirstNameOkay
        //       ? ""
        //       : `Your first name "${personalInformation.firstName}" appears significantly different from your original name "${userFirstName}". Only minor changes are allowed.`,
        //     lastName: isLastNameOkay
        //       ? ""
        //       : `Your last name "${personalInformation.lastName}" appears significantly different from your original name "${userLastName}". Only minor changes are allowed.`
        //   })
        //   return
        // }
      }
    }

    const data: Resume = {
      resumeName: resumeNameFromLocalStorage,
      resumeUrl: resumeUrlPathFromLocalStorage,
      jobTitle: jobTitleFromLocalStorage || "", // Add job title to the data
      socialMediaLinks: {
        github: githubUrl,
        linkedin: linkedinUrl,
        dribble: dribbleUrl,
        portfolio: portfolioUrl,
        otherLink: otherUrl
      },
      personalInformation: personalInformation,
      experiences: updatedExperiences,
      qualifications,
      certifications,
      achievements,
      skills,
      languagesList,
      formData,
      coverLetter
    }

    const { success, message, missingFormFields, missingPersonalFields } =
      isRequiredFieldsFilled(data)

    if (!success) {
      setPersonalFieldErrors(missingPersonalFields)
      setFormErrors(missingFormFields)
      errorToast(message)
      return console.log({ missingPersonalFields, missingFormFields })
    }

    setLoading(true)

    try {
      const res = await updateResume(resumeId, data)
      if (res.success) {
        successToast(res.message)

        localStorage.removeItem("resumeName")
        localStorage.removeItem("resumeResponse")
        localStorage.removeItem("resumeUrlPath")
        localStorage.removeItem("jobTitle") // Clean up job title from localStorage

        navigate("/resume-manager")
      } else if (res.success == false) {
        errorToast(res.message)
      }
    } catch (error) {
      console.error("Error updating resume:", error)
      errorToast("Failed to update resume!")
    } finally {
      setLoading(false)
    }
  }

  // Save all changes
  const handleSaveNewResume = async () => {
    const updatedExperiences = experiences.map((exp: any) => ({
      ...exp,
      startDate: formatDate(exp.startDate),
      endDate: exp.endDate ? formatDate(exp.endDate) : "present"
    }))

    const resumeNameFromLocalStorage = localStorage.getItem("resumeName")
    const resumeUrlPathFromLocalStorage = localStorage.getItem("resumeUrlPath")
    const jobTitleFromLocalStorage = localStorage.getItem("jobTitle") // Get job title from localStorage

    if (!resumeNameFromLocalStorage || !resumeUrlPathFromLocalStorage) {
      errorToast("Resume name or URL path is missing from local storage")
      return
    }

    // check if the name is different
    if (personalInformation.firstName && personalInformation.lastName) {
      let user = localStorage.getItem("user_data")
      if (user) {
        let userData = JSON.parse(user)
        let userFirstName = userData?.firstName
        let userLastName = userData?.lastName
        const isFirstNameOkay = isNameOkay(
          userFirstName || "",
          personalInformation.firstName
        )
        const isLastNameOkay = isNameOkay(
          userLastName || "",
          personalInformation.lastName
        )

        // if (!isFirstNameOkay || !isLastNameOkay) {
        //   errorToast("First Name or Last Name doesn't match with your account")
        //   setNameError({
        //     firstName: isFirstNameOkay
        //       ? ""
        //       : `Your first name "${personalInformation.firstName}" appears significantly different from your original name "${userFirstName}". Only minor changes are allowed.`,
        //     lastName: isLastNameOkay
        //       ? ""
        //       : `Your last name "${personalInformation.lastName}" appears significantly different from your original name "${userLastName}". Only minor changes are allowed.`
        //   })
        //   return
        // }
      }
    }

    const data: Resume = {
      resumeName: resumeNameFromLocalStorage,
      resumeUrl: resumeUrlPathFromLocalStorage,
      jobTitle: jobTitleFromLocalStorage || "", // Add job title to the data
      socialMediaLinks: {
        github: githubUrl,
        linkedin: linkedinUrl,
        dribble: dribbleUrl,
        portfolio: portfolioUrl,
        otherLink: otherUrl
      },
      personalInformation: personalInformation,
      experiences: updatedExperiences,
      qualifications,
      certifications,
      achievements,
      skills,
      languagesList,
      formData,
      coverLetter
    }

    const { success, message, missingFormFields, missingPersonalFields } =
      isRequiredFieldsFilled(data)

    if (!success) {
      setPersonalFieldErrors(missingPersonalFields)
      setFormErrors(missingFormFields)
      errorToast(message)
      return console.log({ missingPersonalFields, missingFormFields })
    }

    setLoading(true)

    try {
      const res = await addResume(data)
      if (res.success) {
        successToast(res.message)

        localStorage.removeItem("resumeName")
        localStorage.removeItem("resumeResponse")
        localStorage.removeItem("resumeUrlPath")
        localStorage.removeItem("jobTitle") // Clean up job title from localStorage

        navigate("/resume-manager")
      } else if (res.success == false) {
        errorToast(res.message)
      }
    } catch (error) {
      console.error("Error saving resume:", error)
      errorToast("Failed to save resume!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuVisible &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuVisible])

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Retrieve data from localStorage
      const storedResumeData = localStorage.getItem("resumeResponse")

      if (storedResumeData) {
        const parsedData: Resume & { resumeFileName: string } =
          JSON.parse(storedResumeData)

        // setResume(parsedData)

        // Set resume name and file name
        setResumeName(parsedData.resumeName || "")
        // setResumeFileName(parsedData.resumeFileName || "No File Uploaded")

        // Set social media links
        if (parsedData.socialMediaLinks) {
          setGithubUrl(parsedData.socialMediaLinks.github || "")
          setLinkedinUrl(parsedData.socialMediaLinks.linkedin || "")
          setDribbleUrl(parsedData.socialMediaLinks.dribble || "")
          setPortfolioUrl(parsedData.socialMediaLinks.portfolio || "")
          setOtherUrl(parsedData.socialMediaLinks.otherLink || "")
        }

        // Set personal information
        if (parsedData.personalInformation) {
          setPersonalInformation(parsedData.personalInformation)
        }

        // Set experiences
        if (parsedData.experiences && Array.isArray(parsedData.experiences)) {
          setExperiences(parsedData.experiences)
        }

        // Set qualifications
        if (
          parsedData.qualifications &&
          Array.isArray(parsedData.qualifications)
        ) {
          setQualifications(parsedData.qualifications)
        }

        // Set certifications
        if (
          parsedData.certifications &&
          Array.isArray(parsedData.certifications)
        ) {
          setCertifications(parsedData.certifications)
        }

        // Set achievements
        if (parsedData.achievements && Array.isArray(parsedData.achievements)) {
          setAchievements(parsedData.achievements)
        }

        // Set skills - handle the special format from the example
        if (parsedData.skills && Array.isArray(parsedData.skills)) {
          setSkills(parsedData.skills)
        }

        // Set languages
        if (
          parsedData.languagesList &&
          Array.isArray(parsedData.languagesList)
        ) {
          setLanguagesList(parsedData.languagesList)
        }

        // Set form data
        if (parsedData.formData) {
          setFormData({
            ...formData,
            ...parsedData.formData
          })
        }

        // Set cover letter
        if (parsedData.coverLetter !== undefined) {
          setCoverLetter(parsedData.coverLetter)
        }

        console.log("Resume data loaded from localStorage")
      } else {
        console.log("No resume data found in localStorage")
      }
    } catch (error) {
      console.error("Error loading resume data:", error)
    }

    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const isEdited = localStorage.getItem("edited") === "true"

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <CircularIndeterminate />
        </div>
      ) : (
        <DashBoardLayout>
          <div className="bg-almostBlack overflow-x-hidden w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
            <div className="w-full px-2 md:px-10">
              {/* Header Section */}
              <div className="items-center justify-end w-full flex space-y-3 py-7">
                <div className="flex gap-3">
                  <Button
                    onClick={handleReplaceResume}
                    className="p-3 md:px-5 flex items-center space-x-2 max-w-full whitespace-nowrap text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    <img
                      src={uploadResumeHere}
                      className="mr-2"
                      alt="Upload Icon"
                      loading="lazy"
                    />
                    Replace Resume
                  </Button>
                  <Button
                    onClick={() => navigate("/resume-manager")}
                    className="p-3 px-3 flex items-center space-x-2max-w-full whitespace-nowrap text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    <HiArrowLeft className="mr-2" />
                    Go Back
                  </Button>
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="items-center justify-start w-full flex pb-5">
                <p className="text-base font-bold">Your Uploaded Resume</p>
              </div>

              <div className="items-center justify-between w-full flex px-5 md:px-10 py-10 bg-dropdownBackground border border-formBorders rounded-md">
                <div className="w-full flex">
                  <img
                    src={uploadResumeHere}
                    className="mr-2 w-10 h-10"
                    alt="Upload Icon"
                    loading="lazy"
                  />
                  <div className="w-full items-center flex">
                    {/* <p className="text-sm md:text-lg font-semibold">
                      {resumeFile ? resumeFile.name : resumeFileName}
                    </p> */}
                    <p className="text-xs font-medium">Data Added</p>
                  </div>
                </div>
                <div className="relative">
                  <BsThreeDots
                    onClick={toggleMenu}
                    className="cursor-pointer"
                  />
                  {menuVisible && (
                    <div ref={menuRef}>
                      <ViewAndDownloadMenu
                        onView={handleView}
                        onDownload={handleDownload}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* <ResumeForm
                resume={resume}
                onSaveResume={(values) => {
                  values
                }}
              /> */}

              {/* Social Media Links Section */}
              <SocialMediaLinks
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                linkedinUrl={linkedinUrl}
                setLinkedinUrl={setLinkedinUrl}
                dribbleUrl={dribbleUrl}
                setDribbleUrl={setDribbleUrl}
                portfolioUrl={portfolioUrl}
                setPortfolioUrl={setPortfolioUrl}
                otherUrl={otherUrl}
                setOtherUrl={setOtherUrl}
              />

              {/* Personal Data Section */}
              <PersonalData
                nameError={nameError}
                personalInformation={personalInformation}
                onChange={handlePersonalInfoChange}
                errors={personalFieldErrors}
              />

              {/* Work Experience Section */}
              <WorkExperience
                experiences={experiences}
                onEdit={handleEditExperience}
                onDelete={handleDeleteExperience}
                onAddExperience={() => {
                  setEditExperienceData(null)
                  setAddExperienceModalOpen(true)
                }}
              />

              {/* Qualification Section */}
              <Qualification
                qualifications={qualifications}
                onEdit={handleEditQualification}
                onDelete={handleDeleteQualification}
                onAddQualification={() => {
                  setEditQualificationData(null)
                  setAddQualificationModalOpen(true)
                }}
              />
              {/* Skills Section */}
              <Skills
                skillsList={skills}
                addSkill={addSkill}
                deleteSkill={deleteSkill}
              />

              {/* Languages Secion */}
              <Languages
                languagesList={languagesList}
                addLanguage={addLanguage}
                deleteLanguage={deleteLanguage}
              />

              <Achievement
                achievements={achievements}
                onEdit={handleEditAchievement}
                onDelete={handleDeleteAchievement}
                onAddAchievement={() => {
                  setEditAchievementData(null)
                  setAddAchievementModalOpen(true)
                }}
              />

              {/* Certifications Section */}
              <Certification
                certifications={certifications}
                onEdit={handleEditCertification}
                onDelete={handleDeleteCertification}
                onAddCertification={() => {
                  setEditCertificationData(null)
                  setAddCertificationModalOpen(true)
                }}
              />

              {/* Miscellaneous Section */}
              <Miscellaneous
                formData={formData}
                errors={formErrors}
                setErrors={setFormErrors}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                onChange={handleFormDataChange}
              />

              <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full lg:w-[65%] bg-almostBlack p-4 shadow-md flex gap-5 md:gap-10 justify-center">
                {/* Save Changes Button */}
                {isEdited ? (
                  <Button
                    onClick={handleUpdateResume}
                    className="w-full md:max-w-40 py-2 px-2 whitespace-nowrap md:px-5 text-center flex items-center justify-center text-primary text-navbar font-light text-sm rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    Update
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveNewResume}
                    className="w-full md:max-w-40 py-2 px-2 whitespace-nowrap md:px-5 text-center flex items-center justify-center text-primary text-navbar font-light text-sm rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    Save Changes
                  </Button>
                )}
                {/* <Link
                  to="/dashboard-cover"
                  className="w-full md:max-w-40 py-2 px-2 whitespace-nowrap md:px-5 text-center flex items-center justify-center text-primary text-navbar font-light text-sm rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  target="_blank">
                  Generate Cover Letter
                </Link> */}
                <Button
                  onClick={() => setCoverLetterModalOpen(true)}
                  className="w-full md:max-w-40 py-2 px-2 whitespace-nowrap md:px-5 text-center flex items-center justify-center text-primary text-navbar font-light text-sm rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Generate Cover Letter
                </Button>
              </div>
            </div>
          </div>

          {/*Delete Modals */}
          <DeleteExperienceModal
            isOpen={deleteExperienceModalOpen}
            onClose={() => setDeleteExperienceModalOpen(false)}
            onConfirm={confirmDeleteExperience}
          />
          <DeleteEducationModal
            isOpen={deleteQualificationModalOpen}
            onClose={() => setDeleteQualificationModalOpen(false)}
            onConfirm={confirmDeleteQualification}
          />
          <DeleteCertificationModal
            isOpen={deleteCertificationModalOpen}
            onClose={() => setDeleteCertificationModalOpen(false)}
            onConfirm={confirmDeleteCertification}
          />
          <DeleteAchievementModal
            isOpen={deleteAchievementModalOpen}
            onClose={() => setDeleteAchievementModalOpen(false)}
            onConfirm={confirmDeleteAchievement}
          />

          {/* Add Data Modals */}
          <AddExperienceModal
            isOpen={addExperienceModalOpen}
            onClose={() => setAddExperienceModalOpen(false)}
            onAddExperience={handleAddExperience}
            onSave={handleSaveExperience}
            initialData={editExperienceData || {}}
          />
          <AddQualificationModal
            isOpen={addQualificationModalOpen}
            onClose={() => setAddQualificationModalOpen(false)}
            onAddQualification={handleAddQualification}
            onSave={handleSaveQualification}
            initialData={editQualificationData || {}}
          />
          <AddCertificationModal
            isOpen={addCertificationModalOpen}
            onClose={() => setAddCertificationModalOpen(false)}
            onAddCertification={handleAddCertification}
            onSave={handleSaveCertification}
            initialData={editCertificationData || {}}
          />
          <AddAchievementModal
            isOpen={addAchievementModalOpen}
            onClose={() => setAddAchievementModalOpen(false)}
            onAddAchievement={handleAddAchievement}
            onSave={handleSaveAchievement}
            initialData={editAchievementData || {}}
          />

          {/* Replace Resume Modal */}
          <ResumeUploadModal
            isOpen={replaceResumeModalOpen}
            onClose={() => setReplaceResumeModalOpen(false)}
            onSubmit={handleModalSubmit}
            resumeName={resumeName}
          />

          <ResumeManagerCoverLetter
            open={coverLetterModalOpen}
            onClose={() => setCoverLetterModalOpen(false)}
            setCoverLetter={setCoverLetter}
            coverLetter={coverLetter}
          />
        </DashBoardLayout>
      )}
    </>
  )
}

export default EditResumeManager
