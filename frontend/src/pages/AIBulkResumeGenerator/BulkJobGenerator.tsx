"use client"
import { IoInformationCircleSharp } from "react-icons/io5"
import React, { useState, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Alert, AlertDescription } from "./components/ui/alert"
import { Badge } from "./components/ui/badge"
import DashBoardLayout from "../../dashboardLayout"
import { Sparkles } from "lucide-react"
import {
  downloadTailoredResume,
  generateModernResumeDocx
} from "./lib/modern-resume-generator"
// import { successToast, errorToast } from "../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"
import { BASE_URL } from "../../api"
import { useResumeGenerationStore } from "../../stores/aiResumeGeneration"

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
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
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
import { useSubscriptionStore } from "@/src/stores/subscription"
import { useDashboardStore } from "@/src/stores/dashboard"
import { User } from "@/src/api/functions/user"
import { analytics } from "@/src/api/functions/analytics"
import { getAllResumes } from "@/src/api/functions"
import { errorToast } from "@/src/components/Toast"

const successToast = (...args: any[]) => console.log("Success Toast:", ...args)
// const errorToast = (...args: any[]) => console.error("Error Toast:", ...args)

// Helper function to trigger credit refresh
const refreshCredits = () => {
  console.log("💳 Triggering credits refresh...")
  setTimeout(
    () => window.dispatchEvent(new CustomEvent("creditsUpdated")),
    1000
  )
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
  isSingleGenerationPage?: boolean
  onJobsGenerated?: (jobs: JobRow[]) => void
}

// Info Tooltip Component with fixed positioning
const InfoTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isPositioned, setIsPositioned] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (iconRef.current && tooltipRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      setPosition({
        top: iconRect.top - tooltipRect.height - 10, // 10px gap above the icon
        left: iconRect.left + iconRect.width / 2 - tooltipRect.width / 2 // Center align with icon
      })
      setIsPositioned(true)
    }
  }

  const handleMouseEnter = () => {
    setIsVisible(true)
    setIsPositioned(false)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
    setIsPositioned(false)
  }

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && !isPositioned) {
      // Use requestAnimationFrame to ensure the tooltip is rendered
      requestAnimationFrame(() => {
        updatePosition()
      })
    }
  }, [isVisible, isPositioned])

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false)
        setIsPositioned(false)
      }
    }

    const handleWheel = () => {
      if (isVisible) {
        setIsVisible(false)
        setIsPositioned(false)
      }
    }

    const handleResize = () => {
      if (isVisible) {
        updatePosition()
      }
    }

    if (isVisible) {
      // Add listeners to window
      window.addEventListener("scroll", handleScroll)
      window.addEventListener("wheel", handleWheel, { passive: true })
      window.addEventListener("resize", handleResize)

      // Add scroll listeners to all scrollable ancestors
      let element = iconRef.current?.parentElement
      while (element && element !== document.body) {
        element.addEventListener("scroll", handleScroll)
        element = element.parentElement
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("resize", handleResize)

      // Remove scroll listeners from all scrollable ancestors
      let element = iconRef.current?.parentElement
      while (element && element !== document.body) {
        element.removeEventListener("scroll", handleScroll)
        element = element.parentElement
      }
    }
  }, [isVisible])

  return (
    <>
      <div
        ref={iconRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <IoInformationCircleSharp
          className="text-primary cursor-pointer transition-colors duration-200"
          size={16}
        />
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-[9999999999999] transition-opacity duration-200 ${
            isPositioned ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}>
          <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
            <strong>Uses 15 credits</strong>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </>
  )
}

const InternalBulkJobGenerator: React.FC<BulkJobGeneratorProps> = ({
  className = "",
  onJobsGenerated,
  isSingleGenerationPage = false
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
  const [yearsOfExperienceStateValue, setYearsOfExperience] = useState({
    value: "3",
    custom: false
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
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

  // Individual loader states for each function
  const [isGeneratingAllTitles, setIsGeneratingAllTitles] = useState(false)
  const [isGeneratingAllDescriptions, setIsGeneratingAllDescriptions] =
    useState(false)
  const [isGeneratingAllSkills, setIsGeneratingAllSkills] = useState(false)
  const [generatingRowAI, setGeneratingRowAI] = useState<Set<string>>(new Set())

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

  const yearsOfExperience = yearsOfExperienceStateValue.value

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

  // API generation functions with sequential processing for consistency
  const generateAllTitles = async () => {
    await executeWithCreditCheck("job_title_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      const entriesWithUrl = jobs.filter((job) => job.companyUrl.trim())
      if (entriesWithUrl.length === 0) {
        errorToast("Please add company URLs to generate titles")
        return
      }

      setIsGeneratingAllTitles(true)
      setBulkGenerating("titles")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk titles:", batchId)

        // Process title generations sequentially for consistency
        const jobsToProcess = entriesWithUrl.filter(
          (job) => !job.jobTitle.trim()
        )
        let successCount = 0
        let currentJobs = [...jobs] // Work with a copy to track updates

        console.log(
          `🔄 Starting sequential title generation for ${jobsToProcess.length} jobs`
        )

        for (const job of jobsToProcess) {
          try {
            console.log(`📝 Generating title for job ${job.id}...`)

            // Get the current state of jobs to pass updated context
            const currentJob = currentJobs.find((j) => j.id === job.id) || job

            const response = await generateJobTitles(
              currentJob,
              currentJobs, // Pass current state with any previously generated titles
              "",
              yearsOfExperience,
              language,
              sessionId,
              true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
              batchId // Pass the same BATCH_ID for all jobs in this bulk operation
            )

            if (response.success && response.data) {
              console.log(
                `✅ Title generated for job ${job.id}:`,
                response.data
              )
              updateJob(job.id, "jobTitle", response.data)
              // Update local copy to maintain context for next iterations
              currentJobs = currentJobs.map((j) =>
                j.id === job.id
                  ? { ...j, jobTitle: response.data as string }
                  : j
              )
              successCount++
            } else if (response.error) {
              console.log(`❌ Title error for job ${job.id}:`, response.error)
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
            console.error(`Failed to generate title for job ${job.id}:`, error)
            setFieldError(job.id, "jobTitle", "Failed to generate title")
          }
        }

        successToast(`Title generation completed for ${successCount} jobs`)
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk title generation:", error)
        errorToast("Failed to generate titles")
      } finally {
        setIsGeneratingAllTitles(false)
        setBulkGenerating(null)
      }
    }) // Close executeWithCreditCheck
  }

  const generateAllDescriptions = async () => {
    await executeWithCreditCheck("job_description_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      console.log("=== Starting sequential bulk descriptions generation ===")
      console.log("Current jobs:", jobs)
      const entriesWithTitle = jobs.filter((job) => job.jobTitle.trim())
      console.log("Entries with titles:", entriesWithTitle)
      if (entriesWithTitle.length === 0) {
        errorToast("Please add job titles to generate descriptions")
        return
      }

      setIsGeneratingAllDescriptions(true)
      setBulkGenerating("descriptions")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk descriptions:", batchId)

        // Process description generations sequentially for consistency
        const jobsToProcess = entriesWithTitle.filter(
          (job) => !job.description.trim()
        )
        console.log("Jobs to process for descriptions:", jobsToProcess)

        if (jobsToProcess.length === 0) {
          successToast("All jobs already have descriptions")
          setIsGeneratingAllDescriptions(false)
          setBulkGenerating(null)
          return
        }

        let successCount = 0
        let currentJobs = [...jobs] // Work with a copy to track updates

        console.log(
          `🔄 Starting sequential description generation for ${jobsToProcess.length} jobs`
        )

        for (const job of jobsToProcess) {
          try {
            console.log(`📄 Generating description for job ${job.id}...`)

            // Get the current state of jobs to pass updated context
            const currentJob = currentJobs.find((j) => j.id === job.id) || job

            const response = await generateJobDescriptions(
              currentJob,
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
                `✅ Description generated for job ${job.id}:`,
                jobDescription
              )
              updateJob(job.id, "description", jobDescription)
              // Update local copy to maintain context for next iterations
              currentJobs = currentJobs.map((j) =>
                j.id === job.id ? { ...j, description: jobDescription } : j
              )
              successCount++
            } else if (response.error) {
              console.log(
                `❌ Description error for job ${job.id}:`,
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
          }
        }

        console.log(
          `Sequential description generation completed. ${successCount} successful out of ${jobsToProcess.length} total`
        )

        successToast(
          `Description generation completed for ${successCount} jobs`
        )
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk description generation:", error)
        errorToast("Failed to generate descriptions")
      } finally {
        setIsGeneratingAllDescriptions(false)
        setBulkGenerating(null)
      }
    }) // Close executeWithCreditCheck
  }

  const generateAllSkills = async () => {
    await executeWithCreditCheck("job_skills_generation", async () => {
      startNewOperation() // Reset credit status check for this operation

      console.log("=== Starting sequential bulk skills generation ===")
      console.log("Current jobs:", jobs)
      const entriesWithContent = jobs.filter(
        (job) => job.jobTitle.trim() || job.description.trim()
      )
      console.log("Entries with content:", entriesWithContent)
      if (entriesWithContent.length === 0) {
        errorToast("Please add job titles or descriptions to generate skills")
        return
      }

      setIsGeneratingAllSkills(true)
      setBulkGenerating("skills")
      try {
        // Generate a unique BATCH_ID for this bulk operation
        const batchId = generateUUID()
        console.log("📦 Generated BATCH_ID for bulk skills:", batchId)

        // Process skills generations sequentially for consistency
        const jobsToProcess = entriesWithContent.filter(
          (job) => !job.skills.trim()
        )
        console.log("Jobs to process for skills:", jobsToProcess)

        if (jobsToProcess.length === 0) {
          successToast("All jobs already have skills")
          setIsGeneratingAllSkills(false)
          setBulkGenerating(null)
          return
        }

        let successCount = 0
        let currentJobs = [...jobs] // Work with a copy to track updates

        console.log(
          `🔄 Starting sequential skills generation for ${jobsToProcess.length} jobs`
        )

        for (const job of jobsToProcess) {
          try {
            console.log(`🎯 Generating skills for job ${job.id}...`)

            // Get the current state of jobs to pass updated context
            const currentJob = currentJobs.find((j) => j.id === job.id) || job

            const response = await generateJobSkills(
              currentJob,
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
              console.log(`✅ Skills generated for job ${job.id}:`, skills)
              updateJob(job.id, "skills", skills)
              // Update local copy to maintain context for next iterations
              currentJobs = currentJobs.map((j) =>
                j.id === job.id ? { ...j, skills: skills } : j
              )
              successCount++
            } else if (response.error) {
              console.log(`❌ Skills error for job ${job.id}:`, response.error)
              setFieldError(job.id, "skills", response.error.message)
              if (response.error.isRateLimit && response.error.waitMs) {
                setRetryState(job.id, "skills", true, response.error.waitMs)
                scheduleAutoRetry(job.id, "skills", response.error.waitMs)
              }
            }
          } catch (error) {
            console.error(`Failed to generate skills for job ${job.id}:`, error)
            setFieldError(job.id, "skills", "Failed to generate skills")
          }
        }

        console.log(
          `Sequential skills generation completed. ${successCount} successful out of ${jobsToProcess.length} total`
        )

        successToast(`Skills generation completed for ${successCount} jobs`)
        refreshCredits() // Refresh credits after successful operation
      } catch (error) {
        console.error("Error in bulk skills generation:", error)
        errorToast("Failed to generate skills")
      } finally {
        setIsGeneratingAllSkills(false)
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

    // Add this job to the generating set
    setGeneratingRowAI((prev) => {
      const newSet = new Set(prev)
      newSet.add(job.id)
      return newSet
    })
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
      setGeneratingRowAI((prev) => {
        const newSet = new Set(prev)
        newSet.delete(job.id)
        return newSet
      })
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
        setGeneratingRowAI((prev) => {
          const newSet = new Set(prev)
          newSet.delete(job.id)
          return newSet
        })
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
        setGeneratingRowAI((prev) => {
          const newSet = new Set(prev)
          newSet.delete(job.id)
          return newSet
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
      setGeneratingRowAI((prev) => {
        const newSet = new Set(prev)
        newSet.delete(job.id)
        return newSet
      })
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

      let updated = false
      const generatedItems: string[] = []
      let currentJob = { ...job } // Work with a copy to track updates

      console.log(
        "🔄 Starting sequential row generation for job:",
        currentJob.id
      )

      // Step 1: Generate title if missing
      if (!currentJob.jobTitle?.trim()) {
        console.log("📝 Step 1: Generating job title...")
        try {
          const titleResponse = await generateJobTitles(
            currentJob,
            jobs,
            "",
            yearsOfExperience,
            language,
            sessionId,
            skipCreditCheck,
            batchId
          )

          if (titleResponse.success && titleResponse.data) {
            console.log("✅ Title generated:", titleResponse.data)
            updateJob(currentJob.id, "jobTitle", titleResponse.data)
            currentJob.jobTitle = titleResponse.data // Update local copy
            generatedItems.push("title")
            updated = true
          } else if (titleResponse.error) {
            console.log("❌ Title error:", titleResponse.error)
            const error = titleResponse.error
            setFieldError(currentJob.id, "jobTitle", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(currentJob.id, "jobTitle", true, error.waitMs)
              scheduleAutoRetry(currentJob.id, "jobTitle", error.waitMs)
            }
            // Don't continue if title generation failed
            return
          }
        } catch (error) {
          console.error("Error generating title:", error)
          setFieldError(currentJob.id, "jobTitle", "Failed to generate title")
          return
        }
      }

      // Step 2: Generate description if missing (now has title)
      if (!currentJob.description?.trim()) {
        console.log("📄 Step 2: Generating job description...")
        try {
          const descriptionResponse = await generateJobDescriptions(
            currentJob,
            "",
            yearsOfExperience,
            language,
            sessionId,
            skipCreditCheck,
            batchId
          )

          if (descriptionResponse.success && descriptionResponse.data) {
            const descriptionData = descriptionResponse.data as any
            const jobDescription =
              descriptionData.job_description || descriptionData
            console.log("✅ Description generated:", jobDescription)
            updateJob(currentJob.id, "description", jobDescription)
            currentJob.description = jobDescription // Update local copy
            generatedItems.push("description")
            updated = true
          } else if (descriptionResponse.error) {
            console.log("❌ Description error:", descriptionResponse.error)
            const error = descriptionResponse.error
            setFieldError(currentJob.id, "description", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(currentJob.id, "description", true, error.waitMs)
              scheduleAutoRetry(currentJob.id, "description", error.waitMs)
            }
            // Continue to skills generation even if description fails
          }
        } catch (error) {
          console.error("Error generating description:", error)
          setFieldError(
            currentJob.id,
            "description",
            "Failed to generate description"
          )
        }
      }

      // Step 3: Generate skills if missing (now has title and possibly description)
      if (!currentJob.skills?.trim()) {
        console.log("🎯 Step 3: Generating job skills...")
        try {
          const skillsResponse = await generateJobSkills(
            currentJob,
            "",
            yearsOfExperience,
            language,
            sessionId,
            skipCreditCheck,
            batchId
          )

          if (skillsResponse.success && skillsResponse.data) {
            const skillsData = skillsResponse.data as any
            const skills = skillsData.skills || skillsData
            console.log("✅ Skills generated:", skills)
            updateJob(currentJob.id, "skills", skills)
            generatedItems.push("skills")
            updated = true
          } else if (skillsResponse.error) {
            console.log("❌ Skills error:", skillsResponse.error)
            const error = skillsResponse.error
            setFieldError(currentJob.id, "skills", error.message)
            if (error.isRateLimit && error.waitMs) {
              setRetryState(currentJob.id, "skills", true, error.waitMs)
              scheduleAutoRetry(currentJob.id, "skills", error.waitMs)
            }
          }
        } catch (error) {
          console.error("Error generating skills:", error)
          setFieldError(currentJob.id, "skills", "Failed to generate skills")
        }
      }

      console.log(
        "🎉 Sequential generation completed - Updated:",
        updated,
        "Items:",
        generatedItems
      )

      if (updated) {
        if (generatedItems.length > 0) {
          successToast(`Generated ${generatedItems.join(", ")} for this row`)
          refreshCredits() // Refresh credits after successful operation
        }
      } else {
        errorToast("Failed to generate any content for this row")
      }
    } catch (error) {
      console.error("Error during row AI generation:", error)
      errorToast("Something went wrong while generating AI content")
    } finally {
      setGeneratingRowAI((prev) => {
        const newSet = new Set(prev)
        newSet.delete(job.id)
        return newSet
      })
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

      // Check credits for tailored resume generation before proceeding
      const bulkResult = await calculateBulkCreditRequirements(
        validJobs,
        ["tailored_resume"],
        currentSessionId
      )

      if (bulkResult.shouldShowUpgradeModal) {
        setIsGeneratingResumes(false)
        return setShowUpgradeModal(true)
      }

      if (!bulkResult.canProceed) {
        errorToast(bulkResult.message)
        setIsGeneratingResumes(false)
        return
      }

      if (bulkResult.needsConfirmation) {
        setCreditModal({
          isOpen: true,
          creditValidation: {
            canProceed: true,
            needsConfirmation: true,
            action: "tailored_resume",
            creditCost: bulkResult.totalCreditCost,
            freeUsed: bulkResult.freeUsed,
            message: bulkResult.message
          },
          pendingAction: async () => {
            setupStoreAndNavigate(validJobs, currentSessionId)
          },
          isLoading: false
        })
        setIsGeneratingResumes(false)
        return
      }

      // No confirmation needed, proceed directly
      setupStoreAndNavigate(validJobs, currentSessionId)
    } catch (error) {
      console.error("Error in resume generation validation:", error)
      errorToast("Failed to validate credits. Please try again.")
      setIsGeneratingResumes(false)
    }
  }

  // Setup store and navigate immediately - called after credit confirmation
  const setupStoreAndNavigate = (
    validJobs: JobRow[],
    currentSessionId: string
  ) => {
    try {
      // Store data in Zustand store before navigation
      useResumeGenerationStore.getState().setJobs(validJobs)
      useResumeGenerationStore.getState().setSessionId(currentSessionId)
      useResumeGenerationStore
        .getState()
        .setBaseResumeData(
          baseResumeContent,
          baseResume,
          yearsOfExperience,
          language
        )
      useResumeGenerationStore.getState().setNavigatedFromBulkGenerator(true)
      useResumeGenerationStore.getState().setIsGenerating(true)

      // Initialize job generation states
      validJobs.forEach((job) => {
        useResumeGenerationStore.getState().updateJobGenerationState(job.id, {
          status: "pending",
          progress: 0
        })
      })

      // Navigate immediately to show loading state
      navigate(`/initialize-resume-generation/${currentSessionId}?asBg=true`)
    } catch (error) {
      console.error(
        "[BulkJobGenerator] Error in store setup and navigation:",
        error
      )
      errorToast(
        error instanceof Error
          ? error.message
          : "Failed to start resume generation. Please try again."
      )
      setIsGeneratingResumes(false)
      useResumeGenerationStore.getState().setIsGenerating(false)
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

        <Card className="shadow-lg border-0 bg-almostBlack ">
          <CardHeader className="bg-gradient-to-r from-almostBlack to-primaryBackground ">
            <CardTitle className="flex items-center gap-3 text-xl md:text-3xl text-primary">
              {/* <div className="p-2 bg-gradient-to-r from-gradientStart to-gradientEnd rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div> */}
              {isSingleGenerationPage ? "" : "Bulk "}Tailored Resume Generator
              <InfoTooltip />
              {/* <Badge
                variant="secondary"
                className="ml-2 bg-gradient-to-r from-gradientStart to-gradientEnd text-white border-0">
                AI-Powered
              </Badge> */}
            </CardTitle>
            <p className="text-lightGrey mt-2">
              {isSingleGenerationPage
                ? "Create a Personalized Resume in Seconds"
                : "Create Personalized Resumes in Seconds"}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-4 lg:p-8 bg-almostBlack">
            {/* File Upload Section */}

            <FileUploadSection
              baseResume={baseResume}
              isSingleGenerationPage={isSingleGenerationPage}
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
            <div className="space-y-4 ">
              {/* Bulk Actions */}
              <div className="pt-[1px]"></div>
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
                isSingleGenerationPage={isSingleGenerationPage}
                isProcessing={isProcessing}
                fieldErrors={getLegacyFieldErrors()}
                retryReady={getLegacyRetryReady()}
                bulkGenerating={bulkGenerating}
                isGeneratingAllTitles={isGeneratingAllTitles}
                isGeneratingAllDescriptions={isGeneratingAllDescriptions}
                isGeneratingAllSkills={isGeneratingAllSkills}
                generatingRowAI={generatingRowAI}
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
              yearsOfExperience={yearsOfExperienceStateValue}
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
      {showUpgradeModal && (
        <UpgradePlanModal
          isOpen={showUpgradeModal}
          context="bulkResumeGenerator"
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </DashBoardLayout>
  )
}

const MemoizedInternalBulkJobGenerator = React.memo(InternalBulkJobGenerator)
const BulkJobGenerator: React.FC<BulkJobGeneratorProps> = ({
  className = "",
  isSingleGenerationPage = false
}) => {
  const setSubscription = useSubscriptionStore((set) => set.setSubscription)
  const setLoadingSubscription = useSubscriptionStore(
    (set) => set.setLoadingSubscription
  )

  useEffect(() => {
    const store = useResumeGenerationStore.getState()
    store.resetStore()
    localStorage.removeItem("resume-generation-store")
  }, [])

  useEffect(() => {
    window.addEventListener("creditsUpdated", () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      setLoadingSubscription(true)
      User.getSubscriptionData()
        .then(async (res) => {
          if (res.success == false) {
            return console.error(res.message)
          }

          const subscriptionObj = res?.data
          const response = await analytics.getJobHistoryCount()

          if (response.success === false) {
            console.error(response.message)
          }

          let totalJobsApplied = response.jobActivities?.reduce(
            (acc, job) => acc + job.totalNoOfAppliedJobs,
            0
          )

          if (subscriptionObj) {
            setSubscription(subscriptionObj, totalJobsApplied || 0)
          }
        })
        .catch((err) => {
          console.error("Error checking subscription:", err)
        })
        .finally(() => {
          setLoadingSubscription(false)
        })
    })
  }, [])

  const thekey = useMemo(
    () => (isSingleGenerationPage ? `single-key` : `bulk-key`),
    [isSingleGenerationPage]
  )

  return (
    <MemoizedInternalBulkJobGenerator
      key={thekey}
      className={className}
      isSingleGenerationPage={isSingleGenerationPage}
    />
  )
}

export default BulkJobGenerator
