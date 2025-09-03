"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Alert, AlertDescription } from "./components/ui/alert"
import { Badge } from "./components/ui/badge"
import DashBoardLayout from "../../dashboardLayout"
import { Sparkles } from "lucide-react"
import {
  downloadTailoredResume,
  generateModernResumeDocx
} from "./lib/modern-resume-generator"
import { successToast, errorToast } from "../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"
import { BASE_URL } from "../../api"

// Import new components
import { FileUploadSection } from "./components/FileUploadSection"
import { BulkActions } from "./components/BulkActions"
import { JobTable } from "./components/JobTable"
import { SettingsPanel } from "./components/SettingsPanel"

// Import utilities
import { extractTextFromFile, parseExcelFile } from "./utils/fileUtils"
import {
  generateJobTitles,
  generateJobDescriptions,
  generateJobSkills,
  generateCompleteRowAI,
  processBulkGeneration,
  startNewOperation,
  validateCreditForActionExport,
  validateBulkCreditRequirements,
  calculateBulkCreditRequirements
} from "./utils/apiUtils"

// Import types
import {
  JobRow,
  RetryState,
  FieldErrors,
  CreditValidationResult,
  ActionType
} from "./types"

// Import components
import CreditConfirmationModal from "./components/CreditConfirmationModal"
import { SESSION_ID_KEY } from "./config"

// Helper function to trigger credit refresh
const refreshCredits = () => {
  console.log("💳 Triggering credits refresh...")
  window.dispatchEvent(new CustomEvent("creditsUpdated"))
}
function getRandomBetween40And60() {
  return Math.floor(Math.random() * (60 - 40 + 1)) + 40
}
// Generate UUID v4
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Session ID management

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = generateUUID()
    localStorage.setItem(SESSION_ID_KEY, sessionId)
    console.log("🆔 Created new session ID:", sessionId)
  } else {
    console.log("🆔 Retrieved existing session ID:", sessionId)
  }

  return sessionId
}

interface BulkJobGeneratorProps {
  className?: string
  onJobsGenerated?: (jobs: JobRow[]) => void
}

const SingleJobGenerator: React.FC<BulkJobGeneratorProps> = ({
  className = "",
  onJobsGenerated
}) => {
  const navigate = useNavigate()

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem("access_token")

  // Initialize session ID on component mount
  const [sessionId] = useState<string>(() => getOrCreateSessionId())

  const [jobs, setJobs] = useState<JobRow[]>([
    {
      id: "1",
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: ""
    }
  ])

  // Debug jobs state changes
  useEffect(() => {
    console.log(
      "🔍 Jobs state changed:",
      jobs.map((j) => ({
        id: j.id,
        title: j.jobTitle.substring(0, 30),
        desc: j.description.substring(0, 30),
        skills: j.skills.substring(0, 30)
      }))
    )
  }, [jobs])

  const [language, setLanguage] = useState("English (US)")
  const [yearsOfExperience, setYearsOfExperience] = useState("2-5")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bulkGenerating, setBulkGenerating] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<{ [key: string]: string }>({})
  const [baseResume, setBaseResume] = useState<File | null>(null)
  const [baseResumeContent, setBaseResumeContent] = useState<string>("")
  const [includeDescriptions, setIncludeDescriptions] = useState(false)
  const [isUploadingExcel, setIsUploadingExcel] = useState(false)
  const [isGeneratingResumes, setIsGeneratingResumes] = useState(false)
  const [editingDescriptions, setEditingDescriptions] = useState<Set<string>>(
    new Set()
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [retryState, setRetryStateData] = useState<RetryState>({})
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  // Credit confirmation modal state
  const [creditModal, setCreditModal] = useState<{
    isOpen: boolean
    creditValidation: CreditValidationResult | null
    pendingAction: (() => Promise<void>) | null
    isLoading: boolean
  }>({
    isOpen: false,
    creditValidation: null,
    pendingAction: null,
    isLoading: false
  })

  // Timer management for rate limit auto-clearing
  const [retryTimers, setRetryTimers] = useState<{
    [key: string]: NodeJS.Timeout
  }>({})

  // Auto-clear error message after wait period and enable retry button
  const scheduleAutoRetry = (jobId: string, field: string, waitMs: number) => {
    const timerKey = `${jobId}-${field}`

    // Clear existing timer if any
    if (retryTimers[timerKey]) {
      clearTimeout(retryTimers[timerKey])
    }

    // Set new timer
    const timer = setTimeout(() => {
      clearFieldError(jobId, field)
      // Set retry state to true so the retry button appears
      setRetryState(jobId, field, true, 0)

      // Clean up timer
      setRetryTimers((prev) => {
        const newTimers = { ...prev }
        delete newTimers[timerKey]
        return newTimers
      })
    }, waitMs)

    // Store timer
    setRetryTimers((prev) => ({
      ...prev,
      [timerKey]: timer
    }))
  }

  // Utility functions for retry state management
  const setFieldError = (jobId: string, field: string, error: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: error
      }
    }))
  }

  const clearFieldError = (jobId: string, field: string) => {
    setFieldErrors((prev) => {
      const jobErrors = { ...prev[jobId] }
      delete jobErrors[field]
      if (Object.keys(jobErrors).length === 0) {
        const newErrors = { ...prev }
        delete newErrors[jobId]
        return newErrors
      }
      return {
        ...prev,
        [jobId]: jobErrors
      }
    })
  }

  const setRetryState = (
    jobId: string,
    field: string,
    canRetry: boolean,
    waitMs: number = 0
  ) => {
    setRetryStateData((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: {
          canRetry,
          waitMs,
          retryAfter: Date.now() + waitMs
        }
      }
    }))
  }

  const clearRetryState = (jobId: string, field: string) => {
    setRetryStateData((prev) => {
      const jobRetries = { ...prev[jobId] }
      delete jobRetries[field]
      if (Object.keys(jobRetries).length === 0) {
        const newRetries = { ...prev }
        delete newRetries[jobId]
        return newRetries
      }
      return {
        ...prev,
        [jobId]: jobRetries
      }
    })
  }

  const canRetryField = (jobId: string, field: string): boolean => {
    const retry = retryState[jobId]?.[field]
    return retry?.canRetry && Date.now() >= retry.retryAfter
  }

  // Basic utility functions
  const addRow = () => {
    if (jobs.length >= 100) {
      setError("Maximum of 100 job rows allowed")
      return
    }

    const newJob: JobRow = {
      id: Date.now().toString(),
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: ""
    }
    setJobs([...jobs, newJob])
  }

  const updateJob = (id: string, field: keyof JobRow, value: string) => {
    console.log(`🔄 updateJob called: id=${id}, field=${field}, value=${value}`)
    console.log(
      `🔄 Current jobs before update:`,
      jobs.map((j) => ({ id: j.id, [field]: j[field] }))
    )

    setJobs((prevJobs) => {
      const updated = prevJobs.map((job) =>
        job.id === id ? { ...job, [field]: value } : job
      )
      console.log(
        `✅ Jobs updated. Job ${id} now has ${field}:`,
        updated.find((j) => j.id === id)?.[field]
      )
      console.log(
        `✅ All jobs after update:`,
        updated.map((j) => ({ id: j.id, [field]: j[field] }))
      )
      return updated
    })
  }

  // Batch update multiple jobs at once for better performance and consistency
  const updateMultipleJobs = (
    updates: Array<{ id: string; field: keyof JobRow; value: string }>
  ) => {
    setJobs((prevJobs) => {
      const updatedJobs = [...prevJobs]
      updates.forEach(({ id, field, value }) => {
        const jobIndex = updatedJobs.findIndex((job) => job.id === id)
        if (jobIndex !== -1) {
          updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], [field]: value }
        }
      })
      return updatedJobs
    })
  }

  const removeRow = (id: string) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter((job) => job.id !== id))
    }
  }

  // Reset row to empty state
  const resetRow = (job: JobRow) => {
    console.log("🔄 resetRow called for job:", job.id)
    console.log("🔄 Current job state:", {
      companyUrl: job.companyUrl,
      jobTitle: job.jobTitle,
      description: job.description,
      skills: job.skills
    })

    updateJob(job.id, "companyUrl", "")
    updateJob(job.id, "jobTitle", "")
    updateJob(job.id, "description", "")
    updateJob(job.id, "skills", "")

    console.log("🔄 Called updateJob for all fields including companyUrl")

    // Clear any field errors for this job
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[job.id]
      console.log("🔄 Cleared field errors for job:", job.id)
      return newErrors
    })
    // Clear any retry states for this job
    setRetryStateData((prev) => {
      const newRetries = { ...prev }
      delete newRetries[job.id]
      console.log("🔄 Cleared retry states for job:", job.id)
      return newRetries
    })

    console.log("🔄 resetRow completed for job:", job.id)
  }

  // Handle resume upload
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingResume(true)
    try {
      const content = await extractTextFromFile(file)
      setBaseResumeContent(content)
      setBaseResume(file)
      successToast("Resume uploaded successfully!")
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

    setIsUploadingExcel(true)
    try {
      const parsedJobs = await parseExcelFile(file)
      setJobs(parsedJobs)
      setError(null)
      successToast(`Successfully imported ${parsedJobs.length} job entries`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse Excel file"
      errorToast(errorMessage)
    } finally {
      setIsUploadingExcel(false)
    }
  }

  // Remove resume
  const removeResume = () => {
    setBaseResume(null)
    setBaseResumeContent("")
  }

  // Credit validation helper functions
  const handleCreditConfirmation = async () => {
    console.log("🎯 Credit confirmation clicked")
    if (creditModal.pendingAction) {
      console.log("🎯 Executing pending action after credit confirmation")
      setCreditModal((prev) => ({ ...prev, isLoading: true }))
      try {
        await creditModal.pendingAction()
        console.log("🎯 Pending action completed successfully")
        setCreditModal({
          isOpen: false,
          creditValidation: null,
          pendingAction: null,
          isLoading: false
        })
      } catch (error) {
        console.error("🎯 Error executing confirmed action:", error)
        setCreditModal((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      console.warn("🎯 No pending action found")
    }
  }

  const closeCreditModal = () => {
    setCreditModal({
      isOpen: false,
      creditValidation: null,
      pendingAction: null,
      isLoading: false
    })
  }

  const executeWithCreditCheck = async (
    actionType:
      | "job_title_generation"
      | "job_description_generation"
      | "job_skills_generation",
    action: () => Promise<void>
  ) => {
    try {
      console.log(`🔍 Checking credits for bulk ${actionType}...`)
      // Use bulk validation that analyzes all jobs and provides detailed breakdown
      const creditValidation = await validateBulkCreditRequirements(
        jobs,
        actionType,
        sessionId
      )

      console.log(`💳 Bulk credit validation result:`, creditValidation)

      if (!creditValidation.canProceed) {
        errorToast(creditValidation.message)
        return
      }

      if (creditValidation.needsConfirmation) {
        console.log(`💬 Showing confirmation modal for bulk ${actionType}`)
        setCreditModal({
          isOpen: true,
          creditValidation,
          pendingAction: () => action(),
          isLoading: false
        })
        return
      }

      // No confirmation needed, execute directly
      console.log(`✅ No confirmation needed, executing bulk ${actionType}`)
      await action()
    } catch (error) {
      console.error("Error in credit check:", error)
      errorToast("Failed to validate credits. Please try again.")
    }
  }

  // API generation functions with parallel processing
  const generateAllTitles = async () => {
    await executeWithCreditCheck("job_title_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      const entriesWithUrl = jobs.filter((job) => job.companyUrl.trim())
      if (entriesWithUrl.length === 0) {
        errorToast("Please add company URLs to generate titles")
        return
      }

      setBulkGenerating("titles")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk titles:", batchId)

        // Process all title generations in parallel
        const parallelTasks = entriesWithUrl
          .filter((job) => !job.jobTitle.trim())
          .map(async (job) => {
            try {
              const response = await generateJobTitles(
                job,
                jobs,
                "",
                yearsOfExperience,
                language,
                sessionId,
                true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
                batchId // Pass the same BATCH_ID for all jobs in this bulk operation
              )
              if (response.success && response.data) {
                updateJob(job.id, "jobTitle", response.data)
              } else if (response.error) {
                console.log(
                  `Bulk title error for job ${job.id}:`,
                  response.error
                )
                setFieldError(job.id, "jobTitle", response.error.message)
                if (response.error.isRateLimit && response.error.waitMs) {
                  console.log(
                    `Setting bulk retry state for ${job.id}-jobTitle:`,
                    response.error.waitMs
                  )
                  setRetryState(job.id, "jobTitle", true, response.error.waitMs)
                  scheduleAutoRetry(job.id, "jobTitle", response.error.waitMs)
                }
              }
            } catch (error) {
              console.error(
                `Failed to generate title for job ${job.id}:`,
                error
              )
              setFieldError(job.id, "jobTitle", "Failed to generate title")
            }
          })

        await Promise.all(parallelTasks)
        successToast(
          `Bulk title generation completed for ${parallelTasks.length} jobs`
        )
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk title generation:", error)
        errorToast("Failed to generate titles")
      } finally {
        setBulkGenerating(null)
      }
    }) // Close executeWithCreditCheck
  }

  const generateAllDescriptions = async () => {
    await executeWithCreditCheck("job_description_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      console.log("=== Starting bulk descriptions generation ===")
      console.log("Current jobs:", jobs)
      const entriesWithTitle = jobs.filter((job) => job.jobTitle.trim())
      console.log("Entries with titles:", entriesWithTitle)
      if (entriesWithTitle.length === 0) {
        errorToast("Please add job titles to generate descriptions")
        return
      }

      setBulkGenerating("descriptions")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk descriptions:", batchId)

        // Process all description generations in parallel
        const jobsToProcess = entriesWithTitle.filter(
          (job) => !job.description.trim()
        )
        console.log("Jobs to process for descriptions:", jobsToProcess)

        if (jobsToProcess.length === 0) {
          successToast("All jobs already have descriptions")
          setBulkGenerating(null)
          return
        }

        const parallelTasks = jobsToProcess.map(async (job) => {
          try {
            console.log(`Starting description generation for job ${job.id}`)
            const response = await generateJobDescriptions(
              job,
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
              batchId // Pass the same BATCH_ID for all jobs in this bulk operation
            )
            console.log(`Description response for job ${job.id}:`, response)
            if (response.success && response.data) {
              const descriptionData = response.data as any
              const jobDescription =
                descriptionData.job_description || descriptionData
              console.log(
                `Updating job ${job.id} with description:`,
                jobDescription
              )
              updateJob(job.id, "description", jobDescription)
              return { success: true, jobId: job.id, data: jobDescription }
            } else if (response.error) {
              console.log(
                `Description error for job ${job.id}:`,
                response.error
              )
              setFieldError(job.id, "description", response.error.message)
              if (response.error.isRateLimit && response.error.waitMs) {
                setRetryState(
                  job.id,
                  "description",
                  true,
                  response.error.waitMs
                )
                scheduleAutoRetry(job.id, "description", response.error.waitMs)
              }
              return { success: false, jobId: job.id, error: response.error }
            }
          } catch (error) {
            console.error(
              `Failed to generate description for job ${job.id}:`,
              error
            )
            setFieldError(
              job.id,
              "description",
              "Failed to generate description"
            )
            return { success: false, jobId: job.id, error }
          }
        })

        const results = await Promise.all(parallelTasks)
        const successfulUpdates = results.filter((result) => result?.success)
        console.log(
          `Bulk description generation completed. ${successfulUpdates.length} successful out of ${parallelTasks.length} total`
        )
        console.log("Successful results:", successfulUpdates)
        console.log("All results:", results)

        successToast(
          `Bulk description generation completed for ${successfulUpdates.length} jobs`
        )
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk description generation:", error)
        errorToast("Failed to generate descriptions")
      } finally {
        setBulkGenerating(null)
      }
    }) // Close executeWithCreditCheck
  }

  const generateAllSkills = async () => {
    await executeWithCreditCheck("job_skills_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      console.log("=== Starting bulk skills generation ===")
      console.log("Current jobs:", jobs)
      const entriesWithContent = jobs.filter(
        (job) => job.jobTitle.trim() || job.description.trim()
      )
      console.log("Entries with content:", entriesWithContent)
      if (entriesWithContent.length === 0) {
        errorToast("Please add job titles or descriptions to generate skills")
        return
      }

      setBulkGenerating("skills")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk skills:", batchId)

        // Process all skills generations in parallel
        const jobsToProcess = entriesWithContent.filter(
          (job) => !job.skills.trim()
        )
        console.log("Jobs to process for skills:", jobsToProcess)

        if (jobsToProcess.length === 0) {
          successToast("All jobs already have skills")
          setBulkGenerating(null)
          return
        }

        const parallelTasks = jobsToProcess.map(async (job) => {
          try {
            console.log(`Starting skills generation for job ${job.id}`)
            const response = await generateJobSkills(
              job,
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
              batchId // Pass the same BATCH_ID for all jobs in this bulk operation
            )
            console.log(`Skills response for job ${job.id}:`, response)
            if (response.success && response.data) {
              const skillsData = response.data as any
              const skills = skillsData.skills || skillsData
              console.log(`Updating job ${job.id} with skills:`, skills)
              updateJob(job.id, "skills", skills)
              return { success: true, jobId: job.id, data: skills }
            } else if (response.error) {
              console.log(`Skills error for job ${job.id}:`, response.error)
              setFieldError(job.id, "skills", response.error.message)
              if (response.error.isRateLimit && response.error.waitMs) {
                setRetryState(job.id, "skills", true, response.error.waitMs)
                scheduleAutoRetry(job.id, "skills", response.error.waitMs)
              }
              return { success: false, jobId: job.id, error: response.error }
            }
          } catch (error) {
            console.error(`Failed to generate skills for job ${job.id}:`, error)
            setFieldError(job.id, "skills", "Failed to generate skills")
            return { success: false, jobId: job.id, error }
          }
        })

        const results = await Promise.all(parallelTasks)
        const successfulUpdates = results.filter((result) => result?.success)
        console.log(
          `Bulk skills generation completed. ${successfulUpdates.length} successful out of ${parallelTasks.length} total`
        )

        successToast(
          `Bulk skills generation completed for ${successfulUpdates.length} jobs`
        )
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk skills generation:", error)
        errorToast("Failed to generate skills")
      } finally {
        setBulkGenerating(null)
      }
    }) // Close executeWithCreditCheck
  }

  // API wrapper functions that handle error states and UI updates
  const handleAPICall = async (
    jobId: string,
    field: string,
    apiCall: () => Promise<any>,
    onSuccess: (data: string) => void
  ) => {
    try {
      clearFieldError(jobId, field)
      clearRetryState(jobId, field)

      const response = await apiCall()
      console.log(`API response for ${jobId}-${field}:`, response)

      if (response.success && response.data) {
        let processedData = response.data
        // Handle nested API response structures
        if (
          field === "description" &&
          typeof response.data === "object" &&
          (response.data as any).job_description
        ) {
          processedData = (response.data as any).job_description
        } else if (
          field === "skills" &&
          typeof response.data === "object" &&
          (response.data as any).skills
        ) {
          processedData = (response.data as any).skills
        }
        onSuccess(processedData as string)
        successToast(`${field} generated successfully`)
      } else if (response.error) {
        const error = response.error
        console.log(`API error for ${jobId}-${field}:`, error)
        setFieldError(jobId, field, error.message)

        if (error.isRateLimit && error.waitMs) {
          console.log(
            `Setting retry state for ${jobId}-${field}:`,
            error.waitMs
          )
          setRetryState(jobId, field, true, error.waitMs)
          scheduleAutoRetry(jobId, field, error.waitMs)
          errorToast(
            `Rate limited. Retry button will appear in ${Math.ceil(
              error.waitMs / 1000
            )} seconds`
          )
        } else {
          errorToast(`Failed to generate ${field}`)
        }
      }
    } catch (error) {
      console.error(`Error generating ${field}:`, error)
      const errorMessage =
        error instanceof Error ? error.message : `Failed to generate ${field}`
      setFieldError(jobId, field, errorMessage)
      errorToast(errorMessage)
    }
  }

  // Individual generation functions with improved error handling
  const generateTitles = async (job: JobRow) => {
    if (!job.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }

    setIsProcessing(true)

    // Check credit validation first
    try {
      const creditValidation = await validateCreditForActionExport(
        "job_title_generation",
        sessionId,
        true // Always fetch fresh data before showing modal
      )

      if (!creditValidation.canProceed) {
        errorToast(creditValidation.message)
        setFieldError(job.id, "jobTitle", creditValidation.message)
        setIsProcessing(false)
        return
      }

      if (creditValidation.needsConfirmation) {
        console.log(
          `💬 Showing confirmation modal for single job title generation`
        )
        setCreditModal({
          isOpen: true,
          creditValidation,
          pendingAction: async () => {
            console.log(
              "🎯 Executing pending action for single job title generation"
            )
            // Reset credit status and call the API with skipCreditCheck = true
            startNewOperation() // Clear any cached credit status
            console.log(
              "🎯 Credit cache cleared, calling handleAPICall with skipCreditCheck=true"
            )
            await handleAPICall(
              job.id,
              "jobTitle",
              () => {
                console.log(
                  "🎯 About to call generateJobTitles with skipCreditCheck=true"
                )
                return generateJobTitles(
                  job,
                  jobs,
                  "",
                  yearsOfExperience,
                  language,
                  sessionId,
                  true // skipCreditCheck
                )
              },
              (title) => updateJob(job.id, "jobTitle", title)
            )
          },
          isLoading: false
        })
        setIsProcessing(false)
        return
      }

      // No confirmation needed, proceed with API call
      await handleAPICall(
        job.id,
        "jobTitle",
        () =>
          generateJobTitles(
            job,
            jobs,
            "",
            yearsOfExperience,
            language,
            sessionId,
            true // skipCreditCheck since we already validated
          ),
        (title) => updateJob(job.id, "jobTitle", title)
      )
    } catch (error) {
      console.error("Error in credit validation:", error)
      errorToast("Failed to validate credits. Please try again.")
    }

    setIsProcessing(false)
  }

  const generateDescriptions = async (job: JobRow) => {
    if (!job.jobTitle.trim()) {
      errorToast("Please enter a job title first")
      return
    }

    console.log(`Individual description generation for job ${job.id}`)
    setIsProcessing(true)

    // Check credit validation first
    try {
      const creditValidation = await validateCreditForActionExport(
        "job_description_generation",
        sessionId,
        true // Always fetch fresh data before showing modal
      )

      if (!creditValidation.canProceed) {
        errorToast(creditValidation.message)
        setFieldError(job.id, "description", creditValidation.message)
        setIsProcessing(false)
        return
      }

      if (creditValidation.needsConfirmation) {
        console.log(
          `💬 Showing confirmation modal for single job description generation`
        )
        setCreditModal({
          isOpen: true,
          creditValidation,
          pendingAction: async () => {
            console.log(
              "🎯 Executing pending action for single job description generation"
            )
            // Reset credit status and call the API with skipCreditCheck = true
            startNewOperation() // Clear any cached credit status
            console.log(
              "🎯 Credit cache cleared, calling handleAPICall with skipCreditCheck=true"
            )
            await handleAPICall(
              job.id,
              "description",
              () => {
                console.log(
                  "🎯 About to call generateJobDescriptions with skipCreditCheck=true"
                )
                return generateJobDescriptions(
                  job,
                  "",
                  yearsOfExperience,
                  language,
                  sessionId,
                  true // skipCreditCheck
                )
              },
              (description) => {
                console.log(
                  `Individual update job ${job.id} with description:`,
                  description
                )
                updateJob(job.id, "description", description)
              }
            )
          },
          isLoading: false
        })
        setIsProcessing(false)
        return
      }

      // No confirmation needed, proceed with API call
      await handleAPICall(
        job.id,
        "description",
        () =>
          generateJobDescriptions(
            job,
            "",
            yearsOfExperience,
            language,
            sessionId,
            true // skipCreditCheck since we already validated
          ),
        (description) => {
          console.log(
            `Individual update job ${job.id} with description:`,
            description
          )
          updateJob(job.id, "description", description)
        }
      )
    } catch (error) {
      console.error("Error in credit validation:", error)
      errorToast("Failed to validate credits. Please try again.")
    }
    setIsProcessing(false)
  }

  const generateSkills = async (job: JobRow) => {
    if (!job.jobTitle.trim() && !job.description.trim()) {
      errorToast("Please enter a job title or description first")
      return
    }

    console.log(`Individual skills generation for job ${job.id}`)
    setIsProcessing(true)

    // Check credit validation first
    try {
      const creditValidation = await validateCreditForActionExport(
        "job_skills_generation",
        sessionId,
        true // Always fetch fresh data before showing modal
      )

      if (!creditValidation.canProceed) {
        errorToast(creditValidation.message)
        setFieldError(job.id, "skills", creditValidation.message)
        setIsProcessing(false)
        return
      }

      if (creditValidation.needsConfirmation) {
        console.log(
          `💬 Showing confirmation modal for single job skills generation`
        )
        setCreditModal({
          isOpen: true,
          creditValidation,
          pendingAction: async () => {
            // Reset credit status and call the API with skipCreditCheck = true
            startNewOperation() // Clear any cached credit status
            await handleAPICall(
              job.id,
              "skills",
              () =>
                generateJobSkills(
                  job,
                  "",
                  yearsOfExperience,
                  language,
                  sessionId,
                  true
                ), // skipCreditCheck
              (skills) => {
                console.log(
                  `Individual update job ${job.id} with skills:`,
                  skills
                )
                updateJob(job.id, "skills", skills)
              }
            )
          },
          isLoading: false
        })
        setIsProcessing(false)
        return
      }

      // No confirmation needed, proceed with API call
      await handleAPICall(
        job.id,
        "skills",
        () =>
          generateJobSkills(
            job,
            "",
            yearsOfExperience,
            language,
            sessionId,
            true
          ), // skipCreditCheck since we already validated
        (skills) => {
          console.log(`Individual update job ${job.id} with skills:`, skills)
          updateJob(job.id, "skills", skills)
        }
      )
    } catch (error) {
      console.error("Error in credit validation:", error)
      errorToast("Failed to validate credits. Please try again.")
    }

    setIsProcessing(false)
  }

  // Comprehensive row generation with retry mechanism
  const generateRowAI = async (job: JobRow) => {
    console.log("🤖 generateRowAI called for job:", job.id)
    console.log("📋 Job state:", {
      companyUrl: job.companyUrl,
      jobTitle: job.jobTitle,
      description: job.description,
      skills: job.skills
    })

    if (!job.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }

    setIsProcessing(true)
    setFieldErrors({})
    setRetryStateData({})

    // Determine which fields are missing and need generation
    const missingFields: { field: string; actionType: ActionType }[] = []

    if (!job.jobTitle?.trim()) {
      missingFields.push({
        field: "jobTitle",
        actionType: "job_title_generation"
      })
    }
    if (!job.description?.trim()) {
      missingFields.push({
        field: "description",
        actionType: "job_description_generation"
      })
    }
    if (!job.skills?.trim()) {
      missingFields.push({
        field: "skills",
        actionType: "job_skills_generation"
      })
    }

    if (missingFields.length === 0) {
      errorToast("All fields are already generated for this row")
      setIsProcessing(false)
      return
    }

    console.log(
      "🔍 Missing fields for row generation:",
      missingFields.map((f) => f.field)
    )

    try {
      // Determine which action types we need for this single row
      const actionTypes: ActionType[] = missingFields.map((f) => f.actionType)

      // Use the new bulk validation logic for a single job
      const bulkResult = await calculateBulkCreditRequirements(
        [job], // Single job in array
        actionTypes,
        sessionId
      )

      if (!bulkResult.canProceed) {
        errorToast(bulkResult.message)
        setIsProcessing(false)
        return
      }

      if (bulkResult.needsConfirmation) {
        console.log("💬 Showing confirmation modal for row generation")

        setCreditModal({
          isOpen: true,
          creditValidation: {
            canProceed: true,
            needsConfirmation: true,
            action:
              actionTypes.length > 1
                ? "multiple_fields_generation"
                : actionTypes[0],
            creditCost: bulkResult.totalCreditCost,
            freeUsed: bulkResult.freeUsed,
            message: bulkResult.message
          },
          pendingAction: async () => {
            console.log("🎯 Executing pending action for row generation")
            // Reset credit status and call the API with skipCreditCheck = true
            startNewOperation()
            console.log(
              "🎯 Credit cache cleared, calling generateCompleteRowAI with skipCreditCheck=true"
            )

            await executeRowGeneration(job, true) // skipCreditCheck = true
          },
          isLoading: false
        })
        setIsProcessing(false)
        return
      }

      // No confirmation needed, proceed with API call
      console.log("✅ No confirmation needed for row generation, proceeding...")
      await executeRowGeneration(job, true) // skipCreditCheck = true since we already validated
    } catch (error) {
      console.error("Error in credit validation for row generation:", error)
      errorToast("Failed to validate credits. Please try again.")
      setIsProcessing(false)
    }
  }

  // Helper function to execute the actual row generation
  const executeRowGeneration = async (
    job: JobRow,
    skipCreditCheck: boolean = false
  ) => {
    try {
      // Generate a unique BATCH_ID for this individual row operation
      const batchId = generateUUID()
      console.log("📦 Generated BATCH_ID for individual row:", batchId)

      const generatedContent = await generateCompleteRowAI(
        job,
        jobs,
        "",
        yearsOfExperience,
        language,
        sessionId,
        skipCreditCheck,
        batchId // Pass BATCH_ID for this individual row operation
      )

      let updated = false
      const generatedItems: string[] = []

      console.log("🔍 Processing generateRowAI results:", generatedContent)

      // Handle title response
      if (generatedContent.title?.data) {
        console.log("📝 Updating title with:", generatedContent.title.data)
        updateJob(job.id, "jobTitle", generatedContent.title.data)
        generatedItems.push("title")
        updated = true
      } else if (generatedContent.title?.error) {
        console.log("❌ Title error:", generatedContent.title.error)
        const error = generatedContent.title.error
        setFieldError(job.id, "jobTitle", error.message)
        if (error.isRateLimit && error.waitMs) {
          setRetryState(job.id, "jobTitle", true, error.waitMs)
          scheduleAutoRetry(job.id, "jobTitle", error.waitMs)
        }
      }

      // Handle description response
      if (generatedContent.description?.data) {
        const descriptionData = generatedContent.description.data as any
        const jobDescription =
          descriptionData.job_description || descriptionData
        console.log("📄 Updating description with:", jobDescription)
        updateJob(job.id, "description", jobDescription)
        generatedItems.push("description")
        updated = true
      } else if (generatedContent.description?.error) {
        console.log("❌ Description error:", generatedContent.description.error)
        const error = generatedContent.description.error
        setFieldError(job.id, "description", error.message)
        if (error.isRateLimit && error.waitMs) {
          setRetryState(job.id, "description", true, error.waitMs)
          scheduleAutoRetry(job.id, "description", error.waitMs)
        }
      } else {
        console.log(
          "⚠️ No description data found in:",
          generatedContent.description
        )
      }

      // Handle skills response
      if (generatedContent.skills?.data) {
        const skillsData = generatedContent.skills.data as any
        const skills = skillsData.skills || skillsData
        console.log("🎯 Updating skills with:", skills)
        updateJob(job.id, "skills", skills)
        generatedItems.push("skills")
        updated = true
      } else if (generatedContent.skills?.error) {
        console.log("❌ Skills error:", generatedContent.skills.error)
        const error = generatedContent.skills.error
        setFieldError(job.id, "skills", error.message)
        if (error.isRateLimit && error.waitMs) {
          setRetryState(job.id, "skills", true, error.waitMs)
          scheduleAutoRetry(job.id, "skills", error.waitMs)
        }
      } else {
        console.log("⚠️ No skills data found in:", generatedContent.skills)
      }

      console.log(
        "🎉 Final results - Updated:",
        updated,
        "Items:",
        generatedItems
      )

      if (updated) {
        if (generatedItems.length > 0) {
          successToast(`Generated ${generatedItems.join(", ")} for this row`)
          refreshCredits() // Refresh credits after successful row generation
        }
      } else {
        errorToast("Failed to generate any content for this row")
      }
    } catch (error) {
      console.error("Error during row AI generation:", error)
      errorToast("Something went wrong while generating AI content")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle retry for field errors
  const handleRetryField = (jobId: string, field: string, job: JobRow) => {
    clearFieldError(jobId, field)
    clearRetryState(jobId, field)

    // Determine which function to call based on field
    if (field === "jobTitle") {
      generateTitles(job)
    } else if (field === "description") {
      generateDescriptions(job)
    } else if (field === "skills") {
      generateSkills(job)
    }
  }

  // Generate tailored resumes for all jobs
  const navigateToGenerateTailoredResumes = async () => {
    startNewOperation() // Reset credit status check for this operation

    // Validate inputs first
    const validJobs = jobs.filter(
      (job) => job.jobTitle.trim() || job.description.trim()
    )
    if (validJobs.length === 0) {
      errorToast("Please add at least one job with a title or description")
      return
    }

    if (!baseResumeContent) {
      errorToast(
        "Please upload a base resume first to generate tailored resumes"
      )
      return
    }

    if (!baseResume) {
      errorToast("Resume file is missing. Please upload your resume again.")
      return
    }

    // Ensure we have a session ID
    let currentSessionId = sessionId
    if (!currentSessionId) {
      currentSessionId = getOrCreateSessionId()
    }

    try {
      setIsGeneratingResumes(true)

      // Step 1: Upload base resume to session
      console.log("📤 Uploading base resume to session...")
      const formData = new FormData()
      formData.append("SESSION_ID", currentSessionId)
      formData.append("resumeText", baseResumeContent)
      formData.append("resume", baseResume)

      const uploadResponse = await fetch(
        `${BASE_URL}${API_ENDPOINTS.UploadBaseResume}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          },
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text()
        throw new Error(`Failed to upload base resume: ${uploadError}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log("✅ Base resume uploaded successfully:", uploadResult)

      // Extract file info from upload response
      const fileInfo = uploadResult.data?.file_info || null
      if (!fileInfo) {
        throw new Error("File info not received from upload response")
      }

      // Step 1.5: Analyze resume score for each job and prepare enhanced job data
      console.log("📊 Analyzing resume scores for jobs...")
      const enhancedJobs: any[] = []

      for (const job of validJobs) {
        let resumeScore = null
        try {
          const analyzeResponse = await fetch(
            `${BASE_URL}${API_ENDPOINTS.AnalyzeResumeScore}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify({
                resumeText: baseResumeContent,
                jobTitle: job.jobTitle,
                jobDescription: job.description,
                skills: job.skills
              })
            }
          )

          if (analyzeResponse.ok) {
            const analyzeResult = await analyzeResponse.json()
            console.log(
              `📊 Resume score analysis for "${job.jobTitle}":`,
              analyzeResult
            )
            resumeScore = analyzeResult.data?.score || null
          } else {
            console.log(
              `❌ Failed to analyze resume score for "${job.jobTitle}":`,
              analyzeResponse.status
            )
          }
        } catch (analyzeError) {
          console.error(
            `Error analyzing resume score for "${job.jobTitle}":`,
            analyzeError
          )
        }

        // Create enhanced job object with score and core settings
        const enhancedJob = {
          ...job,
          resumeScore: resumeScore || getRandomBetween40And60(),
          language: language,
          yearsOfExperience: yearsOfExperience
        }

        enhancedJobs.push(enhancedJob)
      }

      // return

      // Step 2: Save jobs to session
      console.log("💾 Saving jobs to session...")
      const saveJobsResponse = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SaveJobsToSession}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            SESSION_ID: currentSessionId,
            jobs: enhancedJobs,
            fileInfo: fileInfo,
            resumeText: baseResumeContent
          })
        }
      )

      if (!saveJobsResponse.ok) {
        const saveError = await saveJobsResponse.text()
        throw new Error(`Failed to save jobs to session: ${saveError}`)
      }

      console.log("✅ Jobs saved to session successfully")

      // Step 3: Process each job through the AI pipeline
      // console.log("🤖 Starting AI resume generation...")
      // for (const job of validJobs) {
      //   try {
      //     const response = await fetch(
      //       `${BASE_URL}${API_ENDPOINTS.GenerateAIResume}`,
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //           Authorization: `Bearer ${getAuthToken()}`
      //         },
      //         body: JSON.stringify({
      //           job_title: job.jobTitle,
      //           job_description: job.description,
      //           required_skills: job.skills.split(",").map((s) => s.trim()),
      //           company_url: job.companyUrl,
      //           language: language,
      //           years_of_experience: yearsOfExperience,
      //           base_resume_content: baseResumeContent,
      //           resumeText: baseResumeContent,
      //           SESSION_ID: currentSessionId
      //         })
      //       }
      //     )

      //     if (!response.ok) {
      //       console.error(`Failed to process job: ${job.jobTitle}`)
      //       continue
      //     }

      //     const result = await response.json()
      //     console.log("Generated resume data:", result)
      //     console.log("Processed job:", job.jobTitle, result)
      //   } catch (jobError) {
      //     console.error(`Error processing job ${job.jobTitle}:`, jobError)
      //   }
      // }

      successToast(
        `Successfully processed ${validJobs.length} jobs with your base resume`
      )
      navigate(`/initialize-resume-generation/${currentSessionId}`)
    } catch (error) {
      console.error("Error in resume generation process:", error)
      errorToast(
        error instanceof Error
          ? error.message
          : "Failed to process jobs. Please try again."
      )
    } finally {
      setIsGeneratingResumes(false)
    }
  }

  // Generate all rows with AI content using parallel calls
  const generateAllRows = async () => {
    // We need to check each action type for credit confirmation
    // Since we could be generating any combination of fields

    // First, check basic job validity before showing any credit confirmations
    const validJobs = jobs.filter((job) => job.companyUrl.trim())
    if (validJobs.length === 0) {
      errorToast("Please add company URLs to generate content")
      return
    }

    // Check if all jobs already have all fields populated
    const jobsWithAllFields = validJobs.filter(
      (job) =>
        job.jobTitle.trim() && job.description.trim() && job.skills.trim()
    )

    if (jobsWithAllFields.length === validJobs.length) {
      successToast(
        "All fields are already generated - use individual generate functions to regenerate"
      )
      return
    }

    // Start credit check - this needs to be done before any API calls
    startNewOperation() // Reset credit status check for this operation

    // Determine which field types we'll be generating
    const needsTitles = validJobs.some((job) => !job.jobTitle.trim())
    const needsDescriptions = validJobs.some((job) => !job.description.trim())
    const needsSkills = validJobs.some((job) => !job.skills.trim())

    try {
      // Determine which field types we'll be generating
      const actionTypes: ActionType[] = []
      if (needsTitles) actionTypes.push("job_title_generation")
      if (needsDescriptions) actionTypes.push("job_description_generation")
      if (needsSkills) actionTypes.push("job_skills_generation")

      if (actionTypes.length === 0) {
        successToast("All fields are already generated")
        return
      }

      // Use the new bulk validation that shows all actions in a single modal
      const bulkResult = await calculateBulkCreditRequirements(
        validJobs,
        actionTypes,
        sessionId
      )

      if (!bulkResult.canProceed) {
        errorToast(bulkResult.message)
        return
      }

      if (bulkResult.needsConfirmation) {
        // Show single confirmation modal for all field types
        setCreditModal({
          isOpen: true,
          creditValidation: {
            canProceed: true,
            needsConfirmation: true,
            action: "multiple_fields_generation",
            creditCost: bulkResult.totalCreditCost,
            freeUsed: bulkResult.freeUsed,
            message: bulkResult.message
          },
          pendingAction: () => executeGenerateAllRows(validJobs),
          isLoading: false
        })
        return
      }

      // If we get here, no confirmation was needed
      await executeGenerateAllRows(validJobs)
    } catch (error) {
      console.error("Error checking credits for generateAllRows:", error)
      errorToast("Failed to validate credits. Please try again.")
      setIsProcessing(false)
    }
  }

  // The actual execution function after all credit checks/confirmations
  const executeGenerateAllRows = async (validJobs: JobRow[]) => {
    setIsProcessing(true)
    setFieldErrors({})
    setRetryStateData({})

    try {
      // Generate a unique BATCH_ID for this bulk row operation
      const batchId = generateUUID()
      console.log("📦 Generated BATCH_ID for bulk rows:", batchId)

      let successCount = 0

      await processBulkGeneration(validJobs, async (job) => {
        try {
          const generatedContent = await generateCompleteRowAI(
            job,
            jobs,
            "",
            yearsOfExperience,
            language,
            sessionId,
            true, // skipCreditCheck - we've already validated at the bulk level
            batchId // Pass the same BATCH_ID for all jobs in this bulk operation
          )

          let hasUpdates = false

          // Handle each field's response
          if (generatedContent.title?.data) {
            updateJob(job.id, "jobTitle", generatedContent.title.data)
            hasUpdates = true
          } else if (generatedContent.title?.error) {
            const error = generatedContent.title.error
            setFieldError(job.id, "jobTitle", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(job.id, "jobTitle", true, error.waitMs)
              scheduleAutoRetry(job.id, "jobTitle", error.waitMs)
            }
          }

          if (generatedContent.description?.data) {
            const descriptionData = generatedContent.description.data as any
            const jobDescription =
              descriptionData.job_description || descriptionData
            updateJob(job.id, "description", jobDescription)
            hasUpdates = true
          } else if (generatedContent.description?.error) {
            const error = generatedContent.description.error
            setFieldError(job.id, "description", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(job.id, "description", true, error.waitMs)
              scheduleAutoRetry(job.id, "description", error.waitMs)
            }
          }

          if (generatedContent.skills?.data) {
            const skillsData = generatedContent.skills.data as any
            const skills = skillsData.skills || skillsData
            updateJob(job.id, "skills", skills)
            hasUpdates = true
          } else if (generatedContent.skills?.error) {
            const error = generatedContent.skills.error
            setFieldError(job.id, "skills", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(job.id, "skills", true, error.waitMs)
              scheduleAutoRetry(job.id, "skills", error.waitMs)
            }
          }

          if (hasUpdates) {
            successCount++
          }
        } catch (error) {
          console.error(`Failed to generate content for job ${job.id}:`, error)
        }
      })

      if (successCount > 0) {
        successToast(`Generated content for ${successCount} job rows`)
        refreshCredits() // Refresh credits after successful operation
      } else {
        errorToast("Failed to generate content for any jobs")
      }
    } catch (error) {
      console.error("Error in bulk row generation:", error)
      errorToast("Failed to generate content")
    } finally {
      setIsProcessing(false)
    }
  }

  // Parallel bulk generation for all fields
  const generateAllFieldsParallel = async () => {
    // Start new credit check operation
    startNewOperation()

    const entriesWithUrl = jobs.filter((job) => job.companyUrl.trim())
    if (entriesWithUrl.length === 0) {
      errorToast("Please add company URLs to generate content")
      return
    }

    // Check if all jobs already have all fields populated
    const jobsWithAllFields = entriesWithUrl.filter(
      (job) =>
        job.jobTitle.trim() && job.description.trim() && job.skills.trim()
    )

    if (jobsWithAllFields.length === entriesWithUrl.length) {
      successToast(
        "All fields are already generated - use individual generate functions to regenerate"
      )
      return
    }

    // Determine which field types we'll be generating
    const needsTitles = entriesWithUrl.some((job) => !job.jobTitle.trim())
    const needsDescriptions = entriesWithUrl.some(
      (job) => !job.description.trim()
    )
    const needsSkills = entriesWithUrl.some((job) => !job.skills.trim())

    try {
      // Determine which field types we'll be generating
      const actionTypes: ActionType[] = []
      if (needsTitles) actionTypes.push("job_title_generation")
      if (needsDescriptions) actionTypes.push("job_description_generation")
      if (needsSkills) actionTypes.push("job_skills_generation")

      if (actionTypes.length === 0) {
        successToast("All fields are already generated")
        return
      }

      // Use the new bulk validation that shows all actions in a single modal
      const bulkResult = await calculateBulkCreditRequirements(
        entriesWithUrl,
        actionTypes,
        sessionId
      )

      if (!bulkResult.canProceed) {
        errorToast(bulkResult.message)
        return
      }

      if (bulkResult.needsConfirmation) {
        // Show single confirmation modal for all field types
        setCreditModal({
          isOpen: true,
          creditValidation: {
            canProceed: true,
            needsConfirmation: true,
            action: "multiple_fields_generation",
            creditCost: bulkResult.totalCreditCost,
            freeUsed: bulkResult.freeUsed,
            message: bulkResult.message
          },
          pendingAction: () => executeGenerateAllFieldsParallel(entriesWithUrl),
          isLoading: false
        })
        return
      }

      // If we get here, no confirmation was needed
      await executeGenerateAllFieldsParallel(entriesWithUrl)
    } catch (error) {
      console.error(
        "Error checking credits for generateAllFieldsParallel:",
        error
      )
      errorToast("Failed to validate credits. Please try again.")
    }
  }

  // Execute the parallel field generation after credit check/confirmation
  const executeGenerateAllFieldsParallel = async (validJobs: JobRow[]) => {
    setBulkGenerating("all")
    try {
      // Generate a unique BATCH_ID for this parallel fields operation
      const batchId = generateUUID()
      console.log("📦 Generated BATCH_ID for parallel fields:", batchId)

      // Create parallel tasks for all fields of all jobs
      const parallelTasks: Promise<void>[] = []

      validJobs.forEach((job) => {
        // Title generation
        if (!job.jobTitle.trim()) {
          parallelTasks.push(
            generateJobTitles(
              job,
              jobs,
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // Skip credit check as we've already validated at bulk level
              batchId // Pass the same BATCH_ID for all jobs in this parallel operation
            )
              .then((response) => {
                if (response.success && response.data) {
                  updateJob(job.id, "jobTitle", response.data)
                } else if (response.error) {
                  setFieldError(job.id, "jobTitle", response.error.message)
                  if (response.error.isRateLimit && response.error.waitMs) {
                    setRetryState(
                      job.id,
                      "jobTitle",
                      true,
                      response.error.waitMs
                    )
                    scheduleAutoRetry(job.id, "jobTitle", response.error.waitMs)
                  }
                }
              })
              .catch((error) => {
                console.error(
                  `Failed to generate title for job ${job.id}:`,
                  error
                )
                setFieldError(job.id, "jobTitle", "Failed to generate title")
              })
          )
        }

        // Description generation
        if (!job.description.trim()) {
          parallelTasks.push(
            generateJobDescriptions(
              job,
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // Skip credit check as we've already validated at bulk level
              batchId // Pass the same BATCH_ID for all jobs in this parallel operation
            )
              .then((response) => {
                if (response.success && response.data) {
                  const descriptionData = response.data as any
                  const jobDescription =
                    descriptionData.job_description || descriptionData
                  updateJob(job.id, "description", jobDescription)
                } else if (response.error) {
                  setFieldError(job.id, "description", response.error.message)
                  if (response.error.isRateLimit && response.error.waitMs) {
                    setRetryState(
                      job.id,
                      "description",
                      true,
                      response.error.waitMs
                    )
                    scheduleAutoRetry(
                      job.id,
                      "description",
                      response.error.waitMs
                    )
                  }
                }
              })
              .catch((error) => {
                console.error(
                  `Failed to generate description for job ${job.id}:`,
                  error
                )
                setFieldError(
                  job.id,
                  "description",
                  "Failed to generate description"
                )
              })
          )
        }

        // Skills generation
        if (!job.skills.trim()) {
          parallelTasks.push(
            generateJobSkills(
              job,
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // Skip credit check as we've already validated at bulk level
              batchId // Pass the same BATCH_ID for all jobs in this parallel operation
            )
              .then((response) => {
                if (response.success && response.data) {
                  const skillsData = response.data as any
                  const skills = skillsData.skills || skillsData
                  updateJob(job.id, "skills", skills)
                } else if (response.error) {
                  setFieldError(job.id, "skills", response.error.message)
                  if (response.error.isRateLimit && response.error.waitMs) {
                    setRetryState(job.id, "skills", true, response.error.waitMs)
                    scheduleAutoRetry(job.id, "skills", response.error.waitMs)
                  }
                }
              })
              .catch((error) => {
                console.error(
                  `Failed to generate skills for job ${job.id}:`,
                  error
                )
                setFieldError(job.id, "skills", "Failed to generate skills")
              })
          )
        }
      })

      // Execute all tasks in parallel
      await Promise.all(parallelTasks)
      successToast(
        `Parallel generation completed for ${parallelTasks.length} fields`
      )
      refreshCredits() // Refresh credits after successful operation
    } catch (error) {
      console.error("Error in parallel bulk generation:", error)
      errorToast("Failed to generate content")
    } finally {
      setBulkGenerating(null)
      setIsProcessing(false)
    }
  }

  // Helper to convert FieldErrors to legacy format for component compatibility
  const getLegacyFieldErrors = (): { [key: string]: string } => {
    const legacy: { [key: string]: string } = {}
    Object.entries(fieldErrors).forEach(([jobId, jobErrors]) => {
      Object.entries(jobErrors).forEach(([field, error]) => {
        legacy[`${jobId}-${field}`] = error
      })
    })
    console.log("Legacy field errors:", legacy)
    return legacy
  }

  // Helper to convert RetryState to legacy format
  const getLegacyRetryReady = (): { [key: string]: boolean } => {
    const legacy: { [key: string]: boolean } = {}
    Object.entries(retryState).forEach(([jobId, jobRetries]) => {
      Object.entries(jobRetries).forEach(([field, retry]) => {
        legacy[`${jobId}-${field}`] = canRetryField(jobId, field)
      })
    })
    console.log("Legacy retry ready:", legacy)
    console.log("Raw retry state:", retryState)
    return legacy
  }

  // Legacy retry handler for component compatibility
  const legacyHandleRetryField = (fieldKey: string, job: JobRow) => {
    const [jobId, field] = fieldKey.split("-")
    if (jobId && field) {
      handleRetryField(jobId, field, job)
    }
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(retryTimers).forEach((timer) => clearTimeout(timer))
    }
  }, [retryTimers])

  return (
    <DashBoardLayout>
      <div className={`space-y-8 ${className}`}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0 bg-almostBlack">
          <CardHeader className="bg-gradient-to-r from-almostBlack to-primaryBackground border-b border-customGray">
            <CardTitle className="flex items-center gap-3 text-xl text-primary">
              <div className="p-2 bg-gradient-to-r from-gradientStart to-gradientEnd rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Tailored Resume Generator
              <Badge
                variant="secondary"
                className="ml-2 bg-gradient-to-r from-gradientStart to-gradientEnd text-white border-0">
                AI-Powered
              </Badge>
            </CardTitle>
            <p className="text-lightGrey mt-2">
              Generate a tailored resume for a single job. Enter the company URL and let AI create the job title, description, and required skills for you.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8 bg-almostBlack">
            {/* File Upload Section */}

             <FileUploadSection
              isSingleGenerationPage={true}
              baseResume={baseResume}
              baseResumeContent={baseResumeContent}
              isUploadingResume={isUploadingResume}
              isUploadingExcel={isUploadingExcel}
              onResumeUpload={handleResumeUpload}
              onExcelUpload={handleExcelUpload}
              onRemoveResume={removeResume}
              isGeneratingResumes={isGeneratingResumes}
              onGenerateAllRows={generateAllRows}
              onGenerateTailoredResumes={navigateToGenerateTailoredResumes}
            />

            {/* Job Table */}
            <div className="space-y-4">
              {/* Bulk Actions */}
              <BulkActions
                isProcessing={isProcessing}
                isGeneratingResumes={isGeneratingResumes}
                baseResumeContent={baseResumeContent}
                onGenerateAllRows={generateAllRows}
                onGenerateTailoredResumes={navigateToGenerateTailoredResumes}
              />

              {/* Table */}
              <JobTable
                jobs={jobs}
                isProcessing={isProcessing}
                isSingleGenerationPage={true}
                fieldErrors={getLegacyFieldErrors()}
                retryReady={getLegacyRetryReady()}
                bulkGenerating={bulkGenerating}
                onUpdateJob={updateJob}
                onGenerateTitles={generateTitles}
                onGenerateDescriptions={generateDescriptions}
                onGenerateSkills={generateSkills}
                onGenerateRowAI={generateRowAI}
                onRemoveRow={removeRow}
                onRetryField={legacyHandleRetryField}
                onResetRow={resetRow}
                onAddRow={addRow}
                onGenerateAllTitles={generateAllTitles}
                onGenerateAllDescriptions={generateAllDescriptions}
                onGenerateAllSkills={generateAllSkills}
              />
            </div>

            {/* Core Settings */}
            <SettingsPanel
              language={language}
              yearsOfExperience={yearsOfExperience}
              onLanguageChange={setLanguage}
              onYearsOfExperienceChange={setYearsOfExperience}
            />
          </CardContent>
        </Card>
      </div>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={creditModal.isOpen}
        onClose={closeCreditModal}
        onConfirm={handleCreditConfirmation}
        creditValidation={creditModal.creditValidation!}
        isLoading={creditModal.isLoading}
      />
    </DashBoardLayout>
  )
}

export default SingleJobGenerator
