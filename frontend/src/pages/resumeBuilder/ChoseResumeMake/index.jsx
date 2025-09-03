import React, { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import { HiArrowLeft } from "react-icons/hi"
import uploadResumeIcon from "../../../assets/resumeBuilder/uploadResumeIcon.svg"
import createResumeIcon from "../../../assets/resumeBuilder/createResumeIcon.svg"
import DashboardNavbar from "../../../dashboardNavbar"
import LoaderBar from "../../../components/loader/LoaderBar"
import TrackComponent from "../ui/TrackComponent"
import DashBoardLayout from "../../../dashboardLayout"
import API_ENDPOINTS from "../../../api/endpoints"
import basicModern from "../../../assets/resumeBuilder/basicModern.png"
import classicProfessional from "../../../assets/resumeBuilder/classicProfessional.png"
import modernProfessional from "../../../assets/resumeBuilder/modernProfessional.png"
import creative from "../../../assets/resumeBuilder/Creative.jpg"
import classic from "../../../assets/resumeBuilder/Classic.jpg"

import { IoMdDownload } from "react-icons/io"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import CircularIndeterminate from "../../../components/loader/circular"
import { errorToast, successToast } from "../../../components/Toast"
import { formatDistanceToNow } from "date-fns"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const ChosseResumeMake = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingCircle, setLoadingCircle] = useState(false)
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [resumes, setResumes] = useState([])
  const fileInputRef = useRef(null)

  // Handler for "Upload Resume" click

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]

    if (file) {
      const validFormats = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]

      if (!validFormats.includes(file.type)) {
        alert("Invalid file format. Please upload a .doc, .docx, or .pdf file.")
        return
      }

      setLoading(true)

      const formData = new FormData()
      formData.append("file", file) // Attach file with key 'file'

      try {
        const response = await fetch(
          `${BASE_URL}${API_ENDPOINTS.FileuploadResumeBuilder}`,
          {
            method: "POST",
            body: formData
          }
        )

        const result = await response.json()
        console.log(">>>>>>>>>>>>>>>>>:", result)

        // Save each section of the response in localStorage
        for (const [key, value] of Object.entries(result)) {
          localStorage.setItem(key, JSON.stringify(value))
        }
        navigate("/scan-resume/create")
      } catch (error) {
        console.error("File upload error:", error)
        alert("Error uploading file.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUploadResumeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click() // Programmatically click the input element
    }
  }

  // Handler for navigating to "Create Resume" page
  const handleCreateResumeClick = () => {
    navigate("/scan-resume/create")
  }

  // useEffect(() => {
  //   const keysToRemove = [
  //     "resumeBuilderAchievements",
  //     "resumeBuilderCertifications",
  //     "resumeBuilderExperiences",
  //     "resumeBuilderLanguages",
  //     "resumeBuilderPersonalData",
  //     "resumeBuilderQualifications",
  //     "resumeBuilderSkills",
  //     "resumeTitle",
  //     "selectedTemplate",
  //     "ResumeBuilder-Id"
  //   ]

  //   // Remove each item from localStorage
  //   keysToRemove.forEach((key) => localStorage.removeItem(key))
  // }, [])

  const fetchAllResumeData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }
    setLoadingCircle(true)
    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetAllResumeBuilder}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      const data = await response.json()
      console.log("Fetched Resume Data:", data)
      if (data?.resumes?.docs) {
        setResumes(data.resumes.docs)
      }
    } catch (error) {
      console.error("Error fetching resume data:", error)
    } finally {
      setLoadingCircle(false)
    }
  }

  const getTemplateImage = (template) => {
    switch (template) {
      case "modern":
        return modernProfessional
      case "classical":
        return classicProfessional
      case "basic":
        return basicModern
      case "creative":
        return creative
      case "classic":
        return classic
      default:
        return basicModern
    }
  }

  // useEffect(() => {
  //   fetchAllResumeData()
  // }, [])

  const handleEditResume = async (resumeId) => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoadingCircle(true)

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetResumeBuilderById}/${resumeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const { resume } = await response.json()

      // Save each section to localStorage
      localStorage.setItem(
        "resumeBuilderExperiences",
        JSON.stringify(resume.experiences || [])
      )
      localStorage.setItem(
        "resumeBuilderQualifications",
        JSON.stringify(resume.qualifications || [])
      )
      localStorage.setItem(
        "resumeBuilderSkills",
        JSON.stringify(resume.skills || [])
      )
      localStorage.setItem(
        "resumeBuilderAchievements",
        JSON.stringify(resume.achievements || [])
      )
      localStorage.setItem(
        "resumeBuilderLanguages",
        JSON.stringify(resume.languages || [])
      )
      localStorage.setItem(
        "resumeBuilderCertifications",
        JSON.stringify(resume.certifications || [])
      )
      localStorage.setItem("selectedTemplate", resume.selectedTemplate || "")
      localStorage.setItem("resumeTitle", resume.resumeTitle || "")
      localStorage.setItem("ResumeBuilder-Id", resume._id || "")

      // Combine personal data into one object
      const personalData = {
        name: resume.name || "",
        jobTitle: resume.jobTitle || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        website: resume.website || [],
        summary: resume.summary || "",
        address: resume.address || "",
        city: resume.city || "",
        state: resume.state || "",
        postalCode: resume.postalCode || "",
        country: resume.country || ""
      }

      localStorage.setItem(
        "resumeBuilderPersonalData",
        JSON.stringify(personalData)
      )
      navigate("/scan-resume/create")
      console.log("Resume data loaded into localStorage successfully.")
    } catch (error) {
      console.error("Error fetching resume by ID:", error)
    } finally {
      setLoadingCircle(false)
    }
  }

  const handleDownloadResume = async (resumeId) => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoadingCircle(true)

    try {
      const response = await fetch(
        `${BASE_URL}/api/resumeBuilder/view-resume/${resumeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const { resume } = await response.json()

      // Save each section to localStorage
      localStorage.setItem(
        "resumeBuilderExperiences",
        JSON.stringify(resume.experiences || [])
      )
      localStorage.setItem(
        "resumeBuilderQualifications",
        JSON.stringify(resume.qualifications || [])
      )
      localStorage.setItem(
        "resumeBuilderSkills",
        JSON.stringify(resume.skills || [])
      )
      localStorage.setItem(
        "resumeBuilderAchievements",
        JSON.stringify(resume.achievements || [])
      )
      localStorage.setItem(
        "resumeBuilderLanguages",
        JSON.stringify(resume.languages || [])
      )
      localStorage.setItem(
        "resumeBuilderCertifications",
        JSON.stringify(resume.certifications || [])
      )
      localStorage.setItem("selectedTemplate", resume.selectedTemplate || "")
      localStorage.setItem("resumeTitle", resume.resumeTitle || "")
      localStorage.setItem("ResumeBuilder-Id", resume._id || "")

      // Combine personal data into one object
      const personalData = {
        name: resume.name || "",
        jobTitle: resume.jobTitle || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        website: resume.website || [],
        summary: resume.summary || "",
        address: resume.address || "",
        city: resume.city || "",
        state: resume.state || "",
        postalCode: resume.postalCode || "",
        country: resume.country || ""
      }

      localStorage.setItem(
        "resumeBuilderPersonalData",
        JSON.stringify(personalData)
      )
      navigate("/scan-resume/showResume")
      console.log("Resume data loaded into localStorage successfully.")
    } catch (error) {
      console.error("Error fetching resume by ID:", error)
    } finally {
      setLoadingCircle(false)
    }
  }

  const handleDeleteResume = async (resumeId) => {
    setLoadingCircle(true)

    const accessToken = localStorage.getItem("access_token")

    if (!resumeId || !accessToken) {
      errorToast("Missing resume ID or access token.")
      setLoadingCircle(false)
      return
    }

    const deleteUrl = `${BASE_URL}${API_ENDPOINTS.DeleteResumeBuilder}/${resumeId}`

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      })

      const responseData = await response.json()
      console.log(">>>>>>>>>>>>>>>", responseData)
      if (response.ok && responseData.success) {
        successToast("Resume deleted successfully!")

        // ✅ EITHER refetch
        await fetchAllResumeData()
      } else {
        throw new Error(responseData?.msg || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      errorToast("Something went wrong while deleting the resume.")
    } finally {
      setLoadingCircle(false)
    }
  }

  if (loadingCircle) {
    return (
      <>
        <header>
          <DashboardNavbar />
        </header>
        <div className="flex flex-col h-screen bg-almostBlack">
          <CircularIndeterminate />
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-almostBlack">
      {loading ? (
        <>
          <header>
            <DashboardNavbar />
          </header>
          <div className="flex items-center justify-center h-[75vh]">
            <LoaderBar />
          </div>
        </>
      ) : (
        <>
          <DashBoardLayout>
            <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
              <div className="w-full">
                <div className="w-full p-3 md:p-10">
                  <div className="flex items-center justify-between md:px-7">
                    <p className="text-primary text-xl md:text-3xl font-medium">
                      AI ResumeBuilder
                    </p>
                    <Button
                      onClick={() =>
                        navigate("/scan-resume/main-ResumeBuilder")
                      }
                      className="p-3 px-3 flex items-center space-x-2 max-w-40 text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                      <HiArrowLeft className="mr-2" />
                      Go Back
                    </Button>
                  </div>

                  {/* choose how to make resume */}
                  <div>
                    <div className="items-center justify-between text-center pt-5 md:pt-28 pb-10 md:pb-20 space-y-5 md:space-y-10">
                      <p className="text-primary text-xl md:text-2xl font-medium">
                        How do you want to start?
                      </p>
                      <p className="text-primary text-base md:text-xl font-normal">
                        Build a free resume that gets you interviewed by
                        employers
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:space-x-20">
                      <div
                        className="border border-primary rounded-md px-5 md:px-20 py-20 items-center justify-center text-center cursor-pointer"
                        onClick={handleUploadResumeClick}>
                        <img
                          src={uploadResumeIcon}
                          className="mx-auto"
                          alt="Upload Resume"
                          loading="lazy"
                        />
                        <p className="text-primary text-2xl font-medium pt-3">
                          Upload my resume
                        </p>
                        <p className="text-lightestGrey text-base font-normal">
                          We will reformat and fill in your
                        </p>
                        <p className="text-lightestGrey text-base font-normal">
                          information to save your time.
                        </p>
                      </div>

                      <div
                        className="border border-primary rounded-md px-5 md:px-20 py-20 items-center justify-center text-center cursor-pointer"
                        onClick={handleCreateResumeClick}>
                        <img
                          src={createResumeIcon}
                          className="mx-auto"
                          alt="Create Resume"
                          loading="lazy"
                        />
                        <p className="text-primary text-2xl font-medium pt-3">
                          Create resume
                        </p>
                        <p className="text-lightestGrey text-base font-normal">
                          We will help you build a resume
                        </p>
                        <p className="text-lightestGrey text-base font-normal">
                          step-by-step
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resume List Rendering */}
                  {/* {resumes.length > 0 && (
                    <div className="mt-20 w-full flex flex-col items-center justify-center gap-6">
                      {resumes.map((resume) => (
                        <div
                          key={resume._id}
                          className="w-full lg:w-1/2 rounded-md border border-primary bg-almostBlack shadow-md shadow-slate-500 px-4 py-2 flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row items-center gap-5">
                            <img
                              src={getTemplateImage(resume.selectedTemplate)}
                              className="h-36 sm:h-60 w-28 sm:w-40 object-contain"
                              alt="Resume Template"
                            />

                            <div className=" justify-between space-y-10 items-center sm:items-start w-full gap-4 sm:px-5">
                              <div className="space-y-2 w-full">
                                {resume.name && resume.jobTitle && (
                                  <p className="text-lg sm:text-xl font-medium text-center sm:text-left text-primary">
                                    {resume.name}, {resume.jobTitle}
                                  </p>
                                )}

                                {resume.updatedAt && (
                                  <p className="text-base font-medium text-center sm:text-left text-primary">
                                    Updated about{" "}
                                    {formatDistanceToNow(
                                      new Date(resume.updatedAt),
                                      { addSuffix: false }
                                    )}{" "}
                                    ago
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap justify-center sm:justify-start gap-4 w-full">
                                <Button
                                  className="p-2 gap-2 px-4 sm:px-6 flex items-center text-navbar font-medium rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                  onClick={() =>
                                    handleDownloadResume(resume._id)
                                  }>
                                  <IoMdDownload size={18} />
                                  Download
                                </Button>
                                <Button
                                  className="p-2 gap-2 px-4 sm:px-6 flex items-center text-navbar font-medium rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                  onClick={() => handleEditResume(resume._id)}>
                                  <FaEdit size={18} />
                                  Edit
                                </Button>
                                <Button
                                  className="p-2 gap-2 px-4 sm:px-6 flex items-center text-navbar font-medium rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                  onClick={() =>
                                    handleDeleteResume(resume._id)
                                  }>
                                  <MdDelete size={18} />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </DashBoardLayout>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".doc,.docx,.pdf"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  )
}

export default ChosseResumeMake
