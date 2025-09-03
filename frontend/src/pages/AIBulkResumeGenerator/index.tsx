"use client"

import type React from "react"
import { useState } from "react"
import CompactDropdownSelect from "./components/CompactDropdownSelect"
import { Sparkles, Upload, FileText, X } from "lucide-react"
import { successToast, errorToast } from "../../components/Toast"
import API_ENDPOINTS from "../../api/endpoints"
import DashBoardLayout from "../../dashboardLayout"
import * as XLSX from "xlsx"
import * as mammoth from "mammoth"

interface JobEntry {
  id: number
  companyUrl: string
  jobTitle: string
  description: string
  skills: string
}

interface CoreSettings {
  language: string
  yearsOfExperience: string
}

const AIBulkResumeGenerator: React.FC = () => {
  const [jobEntries, setJobEntries] = useState<JobEntry[]>([
    { id: 1, companyUrl: "", jobTitle: "", description: "", skills: "" }
  ])
  const [coreSettings, setCoreSettings] = useState<CoreSettings>({
    language: "English (US)",
    yearsOfExperience: "2"
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [baseResume, setBaseResume] = useState<File | null>(null)
  const [baseResumeContent, setBaseResumeContent] = useState<string>("")
  const [isUploadingExcel, setIsUploadingExcel] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  const languageOptions = [
    "English (US)",
    "English (UK)",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese",
    "Japanese"
  ]

  const experienceOptions = ["0-1", "1-2", "2-3", "3-5", "5-7", "7-10", "10+"]

  const addNewRow = () => {
    const newId = Math.max(...jobEntries.map((entry) => entry.id)) + 1
    setJobEntries([
      ...jobEntries,
      {
        id: newId,
        companyUrl: "",
        jobTitle: "",
        description: "",
        skills: ""
      }
    ])
  }

  const updateJobEntry = (id: number, field: keyof JobEntry, value: string) => {
    setJobEntries(
      jobEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    )
  }

  const deleteJobEntry = (id: number) => {
    if (jobEntries.length > 1) {
      setJobEntries(jobEntries.filter((entry) => entry.id !== id))
    }
  }

  // File processing utility functions
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjs = await import("pdfjs-dist")
      // Set worker path
      if (typeof window !== "undefined") {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
      }
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const textItems = textContent.items as any[]
        const pageText = textItems
          .filter((item) => item.str && typeof item.str === "string")
          .map((item) => item.str.trim())
          .join(" ")
        fullText += pageText + "\n"
      }
      return fullText.trim()
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      throw new Error("Failed to extract text from PDF file")
    }
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value.trim()
    } catch (error) {
      console.error("Error extracting text from DOCX:", error)
      throw new Error("Failed to extract text from DOCX file")
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    try {
      if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        return await file.text()
      } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        return await extractTextFromPDF(file)
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        return await extractTextFromDOCX(file)
      } else {
        throw new Error(
          "Unsupported file format. Please use PDF, DOCX, or TXT files."
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to extract text from file: ${file.name}`)
    }
  }

  // Handle resume upload
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingResume(true)
    setBaseResume(file)
    try {
      const extractedText = await extractTextFromFile(file)
      setBaseResumeContent(extractedText)
      successToast(`Resume uploaded successfully: ${file.name}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to extract text from file"
      errorToast(errorMessage)
      setBaseResumeContent("")
      setBaseResume(null)
    } finally {
      setIsUploadingResume(false)
    }
  }

  // Handle Excel file upload
  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      errorToast("Please upload a valid Excel file (.xlsx or .xls)")
      return
    }

    setIsUploadingExcel(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        errorToast("Excel file appears to be empty")
        return
      }

      // Flexible column mapping
      const getColumnValue = (row: any, possibleNames: string[]): string => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== null) {
            return String(row[name]).trim()
          }
        }
        return ""
      }

      // Map Excel data to job entries
      const newJobs: JobEntry[] = jsonData.slice(0, 50).map((row, index) => ({
        id: Date.now() + index,
        companyUrl: getColumnValue(row, [
          "Company URL",
          "companyUrl",
          "company_url",
          "URL",
          "url",
          "Company",
          "company",
          "Website",
          "website"
        ]),
        jobTitle: getColumnValue(row, [
          "Job Title",
          "jobTitle",
          "job_title",
          "Title",
          "title",
          "Position",
          "position",
          "Role",
          "role"
        ]),
        description: getColumnValue(row, [
          "Description",
          "description",
          "Job Description",
          "jobDescription",
          "job_description",
          "desc",
          "Desc"
        ]),
        skills: getColumnValue(row, [
          "Skills",
          "skills",
          "Required Skills",
          "requiredSkills",
          "required_skills",
          "skill",
          "Skill"
        ])
      }))

      // Filter out completely empty rows
      const validJobs = newJobs.filter(
        (job) =>
          job.companyUrl.trim() !== "" ||
          job.jobTitle.trim() !== "" ||
          job.description.trim() !== "" ||
          job.skills.trim() !== ""
      )

      if (validJobs.length === 0) {
        const availableColumns = Object.keys(jsonData[0] || {}).join(", ")
        errorToast(
          `No valid job data found. Available columns: ${availableColumns}`
        )
        return
      }

      setJobEntries(validJobs)
      successToast(`Successfully imported ${validJobs.length} job entries`)
      event.target.value = "" // Clear file input
    } catch (error) {
      console.error("Error parsing Excel file:", error)
      errorToast(
        "Failed to parse Excel file. Please ensure it's a valid Excel format."
      )
    } finally {
      setIsUploadingExcel(false)
    }
  }

  const generateTitles = async (entry: JobEntry) => {
    if (!entry.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }
    try {
      setIsProcessing(true)
      // Call API to generate job titles based on company URL
      const response = await fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          company_url: entry.companyUrl,
          generate_type: "titles"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate titles")
      }

      const result = await response.json()
      // Update the job title with generated content
      updateJobEntry(
        entry.id,
        "jobTitle",
        result.data.job_title || "Generated Title"
      )
      successToast("Job title generated successfully")
    } catch (error) {
      console.error("Error generating titles:", error)
      errorToast("Failed to generate job title")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateDescriptions = async (entry: JobEntry) => {
    if (!entry.jobTitle.trim()) {
      errorToast("Please enter a job title first")
      return
    }
    try {
      setIsProcessing(true)
      const response = await fetch(
        API_ENDPOINTS.GenerateSingleAIJobDescriptionV2,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({
            job_title: entry.jobTitle,
            company_url: entry.companyUrl,
            generate_type: "description"
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to generate description")
      }

      const result = await response.json()
      console.log("Generated description:", result.data.job_description)
      updateJobEntry(
        entry.id,
        "description",
        result.data.job_description || "Generated description..."
      )
      successToast("Job description generated successfully")
    } catch (error) {
      console.error("Error generating description:", error)
      errorToast("Failed to generate job description")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSkills = async (entry: JobEntry) => {
    if (!entry.jobTitle.trim() && !entry.description.trim()) {
      errorToast("Please enter a job title or description first")
      return
    }
    try {
      setIsProcessing(true)
      const response = await fetch(API_ENDPOINTS.GenerateSingleAISkill, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          company_url: entry.companyUrl,
          job_title: entry.jobTitle,
          job_description: entry.description,
          generate_type: "skills"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate skills")
      }

      const result = await response.json()
      console.log("single skill", result.data.skills)
      updateJobEntry(
        entry.id,
        "skills",
        result.data.skills || "Generated skills..."
      )
      successToast("Skills generated successfully")
    } catch (error) {
      console.error("Error generating skills:", error)
      errorToast("Failed to generate skills")
    } finally {
      setIsProcessing(false)
    }
  }

  // Bulk generation functions
  const generateAllTitles = async () => {
    const entriesWithUrl = jobEntries.filter((entry) => entry.companyUrl.trim())
    if (entriesWithUrl.length === 0) {
      errorToast("Please add company URLs to generate titles")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const entry of entriesWithUrl) {
        try {
          const response = await fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({
              company_url: entry.companyUrl,
              generate_type: "titles"
            })
          })

          if (response.ok) {
            const result = await response.json()
            updateJobEntry(
              entry.id,
              "jobTitle",
              result.generated_title || "Generated Title"
            )
            successCount++
          }
        } catch (error) {
          console.error(
            `Failed to generate title for entry ${entry.id}:`,
            error
          )
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} job titles`)
      } else {
        errorToast("Failed to generate any titles")
      }
    } catch (error) {
      console.error("Error in bulk title generation:", error)
      errorToast("Failed to generate titles")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAllDescriptions = async () => {
    const entriesWithTitle = jobEntries.filter((entry) => entry.jobTitle.trim())
    if (entriesWithTitle.length === 0) {
      errorToast("Please add job titles to generate descriptions")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const entry of entriesWithTitle) {
        try {
          const response = await fetch(API_ENDPOINTS.GenerateAIJobDescription, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({
              job_title: entry.jobTitle,
              company_url: entry.companyUrl,
              generate_type: "description"
            })
          })

          if (response.ok) {
            const result = await response.json()
            updateJobEntry(
              entry.id,
              "description",
              result.generated_description || "Generated description..."
            )
            successCount++
          }
        } catch (error) {
          console.error(
            `Failed to generate description for entry ${entry.id}:`,
            error
          )
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} job descriptions`)
      } else {
        errorToast("Failed to generate any descriptions")
      }
    } catch (error) {
      console.error("Error in bulk description generation:", error)
      errorToast("Failed to generate descriptions")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAllSkills = async () => {
    const entriesWithContent = jobEntries.filter(
      (entry) => entry.jobTitle.trim() || entry.description.trim()
    )
    if (entriesWithContent.length === 0) {
      errorToast("Please add job titles or descriptions to generate skills")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const entry of entriesWithContent) {
        try {
          const response = await fetch(API_ENDPOINTS.GenerateSkills, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({
              job_title: entry.jobTitle,
              job_description: entry.description,
              generate_type: "skills"
            })
          })

          if (response.ok) {
            const result = await response.json()
            updateJobEntry(
              entry.id,
              "skills",
              result.generated_skills || "Generated skills..."
            )
            successCount++
          }
        } catch (error) {
          console.error(
            `Failed to generate skills for entry ${entry.id}:`,
            error
          )
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} skills lists`)
      } else {
        errorToast("Failed to generate any skills")
      }
    } catch (error) {
      console.error("Error in bulk skills generation:", error)
      errorToast("Failed to generate skills")
    } finally {
      setIsProcessing(false)
    }
  }
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [retryReady, setRetryReady] = useState<{ [key: string]: boolean }>({})

  const generateRowAI = async (entry: JobEntry) => {
    if (!entry.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }

    setIsProcessing(true)
    setFieldErrors({})
    setRetryReady({})

    const localGeneratedData = {
      jobTitle: entry.jobTitle,
      description: entry.description,
      skills: entry.skills
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }

    const bodyForTitle = JSON.stringify({
      company_url: entry.companyUrl,
      generate_type: "titles"
    })

    const bodyForDescription = JSON.stringify({
      job_title: localGeneratedData.jobTitle,
      company_url: entry.companyUrl,
      generate_type: "description"
    })

    const bodyForSkills = JSON.stringify({
      company_url: entry.companyUrl,
      job_title: localGeneratedData.jobTitle,
      job_description: localGeneratedData.description,
      generate_type: "skills"
    })

    const fetchTitle = fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
      method: "POST",
      headers,
      body: bodyForTitle
    })

    const fetchDescription = fetch(
      API_ENDPOINTS.GenerateSingleAIJobDescriptionV2,
      {
        method: "POST",
        headers,
        body: bodyForDescription
      }
    )

    const fetchSkills = fetch(API_ENDPOINTS.GenerateSingleAISkill, {
      method: "POST",
      headers,
      body: bodyForSkills
    })

    Promise.allSettled([fetchTitle, fetchDescription, fetchSkills])
      .then(async (results) => {
        const [titleResult, descResult, skillsResult] = results

        const parseJson = async (res: any) => {
          if (res.status === "fulfilled") {
            try {
              return await res.value.json()
            } catch {
              return null
            }
          }
          return null
        }

        const titleData = await parseJson(titleResult)
        const descData = await parseJson(descResult)
        const skillsData = await parseJson(skillsResult)

        const newErrors: { [key: string]: string } = {}
        const retryFlags: { [key: string]: boolean } = {}

        const handleRateLimit = (key: string, waitMs: number) => {
          newErrors[key] = `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )}s.`
          setTimeout(() => {
            setRetryReady((prev) => ({ ...prev, [key]: true }))
          }, waitMs)
        }

        if (titleData?.data?.wait_ms) {
          handleRateLimit("jobTitle", titleData.data.wait_ms)
        }

        if (descData?.data?.wait_ms) {
          handleRateLimit("description", descData.data.wait_ms)
        }

        if (skillsData?.data?.wait_ms) {
          handleRateLimit("skills", skillsData.data.wait_ms)
        }

        setFieldErrors(newErrors)

        if (titleData?.data?.job_title && !localGeneratedData.jobTitle.trim()) {
          localGeneratedData.jobTitle = titleData.data.job_title
        }

        if (
          descData?.data?.job_description &&
          !localGeneratedData.description.trim()
        ) {
          localGeneratedData.description = descData.data.job_description
        }

        if (skillsData?.data?.skills && !localGeneratedData.skills.trim()) {
          localGeneratedData.skills = skillsData.data.skills
        }

        setJobEntries((prevEntries) =>
          prevEntries.map((prevEntry) =>
            prevEntry.id === entry.id
              ? {
                  ...prevEntry,
                  jobTitle: localGeneratedData.jobTitle,
                  description: localGeneratedData.description,
                  skills: localGeneratedData.skills
                }
              : prevEntry
          )
        )

        const generatedItems: ("title" | "description" | "skills")[] = []
        if (localGeneratedData.jobTitle !== entry.jobTitle)
          generatedItems.push("title")
        if (localGeneratedData.description !== entry.description)
          generatedItems.push("description")
        if (localGeneratedData.skills !== entry.skills)
          generatedItems.push("skills")

        if (generatedItems.length > 0) {
          successToast(`Generated ${generatedItems.join(", ")} for this row`)
        } else if (Object.keys(newErrors).length === 0) {
          successToast("All fields already have content")
        }
      })
      .catch((err) => {
        console.error("Error during Promise.allSettled processing:", err)
        errorToast("Something went wrong while generating AI content")
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }

  const processAllJobs = async () => {
    const validEntries = jobEntries.filter(
      (entry) => entry.jobTitle.trim() || entry.description.trim()
    )
    if (validEntries.length === 0) {
      errorToast("Please add at least one job with a title or description")
      return
    }

    if (!baseResumeContent) {
      errorToast(
        "Please upload a base resume first to generate tailored resumes"
      )
      return
    }

    try {
      setIsProcessing(true)
      for (const entry of validEntries) {
        // Process each job entry through your AI pipeline
        const response = await fetch(API_ENDPOINTS.GenerateAIResume, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({
            job_title: entry.jobTitle,
            job_description: entry.description,
            required_skills: entry.skills.split(",").map((s) => s.trim()),
            company_url: entry.companyUrl,
            language: coreSettings.language,
            years_of_experience: coreSettings.yearsOfExperience,
            base_resume_content: baseResumeContent // Include the uploaded resume content
          })
        })

        if (!response.ok) {
          console.error(`Failed to process job: ${entry.jobTitle}`)
          continue
        }

        const result = await response.json()
        console.log("Generated resume data:", result)
        console.log("Processed job:", entry.jobTitle, result)
      }

      successToast(
        `Successfully processed ${validEntries.length} jobs with your base resume`
      )
    } catch (error) {
      console.error("Error processing jobs:", error)
      errorToast("Failed to process some jobs")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashBoardLayout>
      <div className="min-h-screen bg-almostBlack text-primary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold text-white">
              AI Bulk Resume Generator
            </h1>
            <p className="text-lg text-jobSeekersColor max-w-2xl mx-auto">
              Create your personalized resumes for job applications, powered by
              AI technology—fast and free!
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gradientStart to-gradientEnd mx-auto rounded-full"></div>
          </div>

          {/* File Upload Section - Compact */}
          <div className="bg-almostBlack border border-customGray rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Upload size={16} />
              File Upload
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resume Upload */}
              <div className="space-y-2">
                <h3 className="text-white text-xs font-medium flex items-center gap-2">
                  <FileText size={14} />
                  Base Resume
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() =>
                        document.getElementById("resume-upload")?.click()
                      }
                      disabled={isUploadingResume}
                      className="flex items-center gap-2 px-3 py-1 border border-customGray/50 rounded text-white hover:border-purple transition-colors disabled:opacity-50 text-xs">
                      {isUploadingResume ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-purple border-t-transparent rounded-full"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          Upload Resume
                        </>
                      )}
                    </button>
                    {baseResume && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-700/50">
                          <FileText size={12} />
                          {baseResume.name}
                        </div>
                        <button
                          onClick={() => {
                            setBaseResume(null)
                            setBaseResumeContent("")
                          }}
                          className="text-red-400 hover:text-red-300">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-jobSeekersColor">
                    Supports PDF, DOCX, and TXT files.
                  </p>
                  {baseResumeContent && (
                    <div className="mt-1 p-2 bg-almostBlack border border-customGray/50 rounded text-xs text-jobSeekersColor">
                      <div className="text-white text-xs mb-1">
                        Resume Preview:
                      </div>
                      {baseResumeContent.substring(0, 150)}...
                    </div>
                  )}
                </div>
              </div>

              {/* Excel Upload */}
              <div className="space-y-2">
                <h3 className="text-white text-xs font-medium flex items-center gap-2">
                  <Sparkles size={14} />
                  Excel Job Data
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="excel-upload"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() =>
                        document.getElementById("excel-upload")?.click()
                      }
                      disabled={isUploadingExcel}
                      className="flex items-center gap-2 px-3 py-1 border border-customGray/50 rounded text-white hover:border-purple transition-colors disabled:opacity-50 text-xs">
                      {isUploadingExcel ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-purple border-t-transparent rounded-full"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          Upload Excel
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-jobSeekersColor">
                    Expected: "Company URL", "Job Title", "Description",
                    "Skills".
                  </p>
                  <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-700/50">
                    💡 Company URLs required. Other columns auto-mapped.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Entries Table - Minimal Clean Design */}
          <div className="space-y-6">
            {/* Bulk Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Job Entries</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-jobSeekersColor">
                  Bulk Actions:
                </span>
                <button
                  onClick={generateAllTitles}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-2 py-1 border border-customGray rounded text-purple hover:border-purple transition-colors disabled:opacity-50"
                  title="Generate all job titles">
                  <Sparkles size={14} />
                  <span className="text-xs">Titles</span>
                </button>
                <button
                  onClick={generateAllDescriptions}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-2 py-1 border border-customGray rounded text-purple hover:border-purple transition-colors disabled:opacity-50"
                  title="Generate all job descriptions">
                  <Sparkles size={14} />
                  <span className="text-xs">Descriptions</span>
                </button>
                <button
                  onClick={generateAllSkills}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-2 py-1 border border-customGray rounded text-purple hover:border-purple transition-colors disabled:opacity-50"
                  title="Generate all skills">
                  <Sparkles size={14} />
                  <span className="text-xs">Skills</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-customGray rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-customGray">
                      <th className="text-left p-2 text-white font-medium text-xs">
                        Company URL*
                      </th>
                      <th className="text-left p-2 text-white font-medium text-xs">
                        Job Title
                      </th>
                      <th className="text-left p-2 text-white font-medium text-xs">
                        Job Description
                      </th>
                      <th className="text-left p-2 text-white font-medium text-xs">
                        Skills
                      </th>
                      <th className="text-left p-2 text-white font-medium text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobEntries.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={`${
                          index !== jobEntries.length - 1
                            ? "border-b border-customGray/30"
                            : ""
                        }`}>
                        {/* Company URL */}
                        <td className="p-2 w-1/5">
                          <input
                            type="text"
                            placeholder="google.com"
                            value={entry.companyUrl}
                            onChange={(e) =>
                              updateJobEntry(
                                entry.id,
                                "companyUrl",
                                e.target.value
                              )
                            }
                            className="w-full h-10 px-3 bg-transparent border border-customGray/50 rounded text-white placeholder:text-placeHolderColor focus:outline-none focus:border-purple text-xs"
                          />
                        </td>

                        {/* Job Title */}
                        <td className="p-2 w-1/5">
                          <div className="group relative">
                            <input
                              type="text"
                              placeholder="Software Engineer"
                              value={entry.jobTitle}
                              onChange={(e) =>
                                updateJobEntry(
                                  entry.id,
                                  "jobTitle",
                                  e.target.value
                                )
                              }
                              className="w-full h-10 px-3 pr-10 bg-transparent border border-customGray/50 rounded text-white placeholder:text-placeHolderColor focus:outline-none focus:border-purple text-xs"
                            />
                            <button
                              onClick={() => generateTitles(entry)}
                              disabled={isProcessing}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100 border border-transparent hover:border-purple/30"
                              title="Generate job title">
                              <Sparkles size={14} />
                            </button>
                          </div>
                          <div>
                            {retryReady.jobTitle ? (
                              <button
                                onClick={() => {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    jobTitle: ""
                                  }))
                                  setRetryReady((prev) => ({
                                    ...prev,
                                    jobTitle: false
                                  }))
                                  generateTitles(entry)
                                }}
                                className="text-purple underline text-xs">
                                Retry
                              </button>
                            ) : fieldErrors.jobTitle ? (
                              <p className="text-red-400 text-xs">
                                {fieldErrors.jobTitle}
                              </p>
                            ) : null}
                          </div>
                        </td>

                        {/* Job Description */}
                        <td className="p-2 w-1/5">
                          <div className="group relative">
                            <input
                              type="text"
                              placeholder="Enter job description"
                              value={entry.description}
                              onChange={(e) =>
                                updateJobEntry(
                                  entry.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full h-10 px-3 pr-10 bg-transparent border border-customGray/50 rounded text-white placeholder:text-placeHolderColor focus:outline-none focus:border-purple text-xs"
                            />
                            <button
                              onClick={() => generateDescriptions(entry)}
                              disabled={isProcessing}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100 border border-transparent hover:border-purple/30"
                              title="Generate job description">
                              <Sparkles size={14} />
                            </button>
                          </div>
                        </td>

                        {/* Skills */}
                        <td className="p-2 w-1/5">
                          <div className="group relative">
                            <input
                              type="text"
                              placeholder="Enter Skills"
                              value={entry.skills}
                              onChange={(e) =>
                                updateJobEntry(
                                  entry.id,
                                  "skills",
                                  e.target.value
                                )
                              }
                              className="w-full h-10 px-3 pr-10 bg-transparent border border-customGray/50 rounded text-white placeholder:text-placeHolderColor focus:outline-none focus:border-purple text-xs"
                            />
                            <button
                              onClick={() => generateSkills(entry)}
                              disabled={isProcessing}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100 border border-transparent hover:border-purple/30"
                              title="Generate skills">
                              <Sparkles size={14} />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-2 w-1/5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => generateRowAI(entry)}
                              disabled={isProcessing}
                              className="h-10 w-10 text-purple hover:text-purple/80 transition-colors disabled:opacity-50 flex items-center justify-center border border-customGray/50 rounded hover:border-purple"
                              title="Generate all AI content for this row">
                              <Sparkles size={16} />
                            </button>
                            {jobEntries.length > 1 && (
                              <button
                                onClick={() => deleteJobEntry(entry.id)}
                                className="h-10 px-3 border border-red-500/30 text-red-400 rounded hover:border-red-500 transition-colors text-sm">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Row */}
              <div className="border-t border-customGray/30 p-2">
                <button
                  onClick={addNewRow}
                  className="w-full py-2 border-2 border-customGray rounded text-purple hover:border-purple transition-colors flex items-center justify-center gap-2 text-xs font-medium">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add New Job Entry
                </button>
              </div>
            </div>
          </div>

          {/* Core Settings - Compact Form Style */}
          <div className="bg-almostBlack border border-customGray rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} />
              Core Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="block text-white text-xs font-medium">
                  Select a language*
                </label>
                <CompactDropdownSelect
                  options={languageOptions}
                  selectedOption={coreSettings.language}
                  onChange={(value) =>
                    setCoreSettings((prev) => ({ ...prev, language: value }))
                  }
                  label="Select Language"
                  className="w-full"
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="block text-white text-xs font-medium">
                  Years of Experience*
                </label>
                <CompactDropdownSelect
                  options={experienceOptions}
                  selectedOption={coreSettings.yearsOfExperience}
                  onChange={(value) =>
                    setCoreSettings((prev) => ({
                      ...prev,
                      yearsOfExperience: value
                    }))
                  }
                  label="Select Experience"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={processAllJobs}
              disabled={isProcessing || !baseResumeContent}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gradientStart to-gradientEnd text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-semibold text-lg">
              <Sparkles size={20} />
              {isProcessing
                ? "Processing..."
                : !baseResumeContent
                ? "Upload Resume to Generate"
                : "Generate Tailored Resumes"}
            </button>
            {!baseResumeContent && (
              <div className="ml-4 flex items-center text-yellow-400 text-sm">
                <span>⚠️ Upload a base resume first</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default AIBulkResumeGenerator
