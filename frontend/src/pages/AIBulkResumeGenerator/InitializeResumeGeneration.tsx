"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation
} from "react-router-dom"
import ToggleButton from "../../components/ToggleButton"

import SimpleInputField from "../../components/SimpleInputFields"
import CompactDropdownSelect from "./components/CompactDropdownSelect"
import Button from "../../components/Button"
import StaticCircularLoader from "../../components/loader/StaticCircularLoader"
import { Sparkles, Upload, FileText, X } from "lucide-react"
// import { successToast, errorToast } from "../../components/Toast"
import API_ENDPOINTS from "../../api/endpoints"
import { postRequest } from "../../api/httpRequests"
import { BASE_URL } from "../../api"
import DashBoardLayout from "../../dashboardLayout"
import * as XLSX from "xlsx"
import * as mammoth from "mammoth"
import {
  useResumeGenerationStore,
  useIsGenerating,
  useOverallProgress,
  useApiCalls,
  useIsNavigatedFromBulkGenerator,
  useSetupComplete,
  clearResumeGenerationStore
} from "../../stores/aiResumeGeneration"

import "./styles/docx-preview.css"

import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./components/ui/table"
import { Badge } from "./components/ui/badge"
import { Progress } from "./components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./components/ui/dialog"
import CreditConfirmationModal from "./components/CreditConfirmationModal"
import DiffHighlighter from "../../components/DiffHighlighter"
import AdvancedDiffHighlighter from "../../components/DiffHighlighter/AdvancedDiffHighlighter"
import DocxDiffHighlighter from "../../components/DiffHighlighter/DocxDiffHighlighter"
import SimpleTextHighlighter from "../../components/DiffHighlighter/SimpleTextHighlighter"
import {
  validateCreditForActionExport,
  validateBulkCreditRequirements,
  startNewOperation
} from "./utils/apiUtils"
import { ActionType, CreditValidationResult, JobRow } from "./types"
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  TrendingUp,
  Star,
  CheckCircle,
  Search,
  Zap,
  MoreVertical,
  RotateCcw,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronDown
} from "lucide-react"
import { Link } from "react-router-dom"
import { generateModernResumeDocx } from "./lib/modern-resume-generator"
import { Packer } from "docx"
import { renderAsync } from "docx-preview"
import JSZip from "jszip"
import { SESSION_ID_KEY } from "./config"
import { marked } from "marked"
import DocumentRenderer from "./components/DocumentRenderer"
import UpgradePlanModal from "../../components/Modals/UpgradePlanModal"
import "./initialize-style.css"
import { useDashboardStore } from "@/src/stores/dashboard"
import { useSubscriptionStore } from "@/src/stores/subscription"
import { User } from "@/src/api/functions/user"
import { analytics } from "@/src/api/functions/analytics"
import { getAllResumes } from "@/src/api/functions"
import { useTour, aiDashboardPageSteps } from "@/src/stores/tours"


const successToast = (...args: any[]) => console.log("Success Toast:", ...args)
const errorToast = (...args: any[]) => console.error("Error Toast:", ...args)

const toast = {
  success: successToast,
  error: errorToast
}

// Helper function to trigger credit refresh

// Type definition for tailored resume data
interface TailoredResumeData {
  full_name?: string
  source_content_analysis?: {
    has_email?: boolean
    has_phone?: boolean
    has_location?: boolean
    has_linkedin?: boolean
    has_github?: boolean
    has_social_links?: boolean
    has_relocation_willingness?: boolean
    has_professional_summary?: boolean
    has_skills?: boolean
    has_work_experience?: boolean
    has_education?: boolean
    has_certifications?: boolean
    has_projects?: boolean
    has_languages?: boolean
    has_awards?: boolean
  }
  contact_information?: {
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    website?: string
    social_links?: Array<{
      platform?: string
      url?: string
    }>
    willing_to_relocate?: boolean
  }
  professional_summary?: string
  skills?: string[]
  work_experience?: Array<{
    has_job_title?: boolean
    has_company?: boolean
    has_location?: boolean
    has_start_date?: boolean
    has_end_date?: boolean
    has_responsibilities?: boolean
    job_title?: string
    company?: string
    location?: string
    start_date?: string
    end_date?: string | null
    responsibilities?: string[]
  }>
  education?: Array<{
    has_degree?: boolean
    has_institution?: boolean
    has_location?: boolean
    has_start_year?: boolean
    has_end_year?: boolean
    has_additional_details?: boolean
    degree?: string
    institution?: string
    location?: string
    start_year?: number
    end_year?: number | null
    additional_details?: string
  }>
  certifications?: Array<{
    has_name?: boolean
    has_issuer?: boolean
    has_year?: boolean
    has_credential_url?: boolean
    name?: string
    issuer?: string
    year?: number
    credential_url?: string
  }>
  projects?: Array<{
    has_title?: boolean
    has_description?: boolean
    has_url?: boolean
    title?: string
    description?: string
    url?: string
  }>
  languages?: Array<{
    has_language?: boolean
    has_proficiency?: boolean
    language?: string
    proficiency?: string
  }>
  awards?: Array<{
    has_title?: boolean
    has_issuer?: boolean
    has_year?: boolean
    has_description?: boolean
    title?: string
    issuer?: string
    year?: number
    description?: string
  }>
}

interface Job {
  id: string
  jobTitle: string
  company: string
  companyUrl: string
  description: string
  skills: string
  status: "pending" | "generating" | "completed" | "error"
  progress: number
  resumeUrl?: string
  resumeContent?: string
  docxUrl?: string
  tailoredResumeData?: TailoredResumeData
  error?: string
}

interface PreviewData {
  originalResume: string
  originalResumeFile?: string // File URL or data URL for the original resume
  tailoredResume: string
  tailoredResumeFile?: string // File URL or data URL for the tailored resume
  jobTitle: string
  company: string
  jobDescription: string
  skills: string
}

const InternalInitializeResumeGeneration: React.FC<{ className?: string }> = ({
  className
}) => {
  const { sessionId = "default" } = useParams<{ sessionId: string }>()

  const refreshCredits = () => {
    // refreshCreditsCtx()
    console.log("💳 Triggering credits refresh...")
    setTimeout(
      () => window.dispatchEvent(new CustomEvent("creditsUpdated")),
      1000
    )
  }

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const asBg = searchParams.get("asBg") === "true"

  const [deletedJobs, setDeletedJobs] = useState<Job[]>([])

  // Deleting animation state
  const [deletingJobIds, setDeletingJobIds] = useState<Set<string>>(new Set())
  // console.log("🏁 InitializeResumeGeneration component mounting with:", {
  //   sessionId,
  //   asBg,
  //   searchParams: Object.fromEntries(searchParams.entries()),
  //   currentTime: new Date().toISOString()
  // })

  // Store hooks - using individual selectors to avoid infinite loops
  const isGeneratingFromStore = useIsGenerating()
  const overallProgressFromStore = useOverallProgress()
  const apiCalls = useApiCalls()
  const isNavigatedFromBulkGenerator = useIsNavigatedFromBulkGenerator()
  const setupComplete = useSetupComplete()

  // EARLY DEBUG - Store state on mount
  // console.log("🏪 Store state on component mount:", {
  //   isGeneratingFromStore,
  //   overallProgressFromStore,
  //   apiCalls,
  //   isNavigatedFromBulkGenerator,
  //   setupComplete
  // })
  const [refetchSessionData, shouldRefetchSessionData] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(
    new Set()
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [baseResumeContent, setBaseResumeContent] = useState<string>("")
  const [baseResumeFile, setBaseResumeFile] = useState<string | null>(null) // For file preview
  const [baseResumeS3Url, setBaseResumeS3Url] = useState<string | null>(null) // S3 URL for original resume
  const [yearsOfExperience, setYearsOfExperience] = useState("2-5")
  const [language, setLanguage] = useState("English (US)")

  // useEffect(() => {
  //   localStorage.removeItem(SESSION_ID_KEY)
  // }, [])  // Session data state
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoadingSessionData, setLoadingSessionData] = useState(true)
  const [currentSessionJobs, setCurrentSessionJobs] = useState<any[]>([])
  const [previousSessions, setPreviousSessions] = useState<any[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  // Dashboard filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bulkActionFilter, setBulkActionFilter] = useState("regenerate")
  const [sortBy, setSortBy] = useState("date")

  // Selection state for checkboxes
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Clear selection when filters change to avoid confusion
  useEffect(() => {
    setSelectedJobIds(new Set())
  }, [searchTerm, statusFilter])

  // Ref to prevent multiple executions of auto-generation
  const isAutoGenerationExecuting = useRef(false)

  // Ref to track delete operations
  const isDeleteInProgress = useRef(false)

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

  const { startModuleTourIfEligible } = useTour()
// useEffect(() => {
//   startModuleTourIfEligible("ai-tailored", aiDashboardPageSteps, { showWelcome: false })
// }, [startModuleTourIfEligible])
useEffect(() => {
  startModuleTourIfEligible("initialize-resume-generation", aiDashboardPageSteps, { showWelcome: false })
}, [startModuleTourIfEligible])

  useEffect(() => {
    return () => {
      setBaseResumeCache({
        url: null,
        renderedHTML: null,
        isRendering: false,
        lastCacheKey: null
      })
      setBaseResumeContent("")
      setBaseResumeFile(null)
      setBaseResumeS3Url(null)
    }
  }, [])

  // Reset store state when navigated from bulk generator to ensure fresh start
  useEffect(() => {
    if (asBg && isNavigatedFromBulkGenerator) {
      // console.log("🔄 Resetting store state for fresh background process start")
      const store = useResumeGenerationStore.getState()
      store.setSetupComplete(false)
      store.setBackgroundProcessId(null) // Clear any existing background process ID
      store.updateApiCallStatus("uploadResume", { status: "pending" })
      store.updateApiCallStatus("saveJobs", { status: "pending" })
      store.updateApiCallStatus("generateResumes", {
        status: "pending",
        progress: 0
      })
    }
  }, [asBg, isNavigatedFromBulkGenerator])

  // Check if navigated from bulk generator and handle background loading
  useEffect(() => {
    if (asBg && isNavigatedFromBulkGenerator) {
      // console.log(
      //   "🚀 Detected navigation from bulk generator with background process"
      // )

      // Load data from store using getState() to avoid reactive subscriptions
      const storeData = useResumeGenerationStore.getState()

      if (storeData.jobs.length > 0) {
        // console.log("📊 Loading jobs from store:", storeData.jobs.length)
        setCurrentSessionJobs(storeData.jobs)
      }
      if (storeData.baseResumeContent) {
        // console.log("📄 Loading base resume content from store")
        setBaseResumeContent(storeData.baseResumeContent)
      }

      if (storeData.yearsOfExperience) {
        setYearsOfExperience(storeData.yearsOfExperience)
      }

      if (storeData.language) {
        setLanguage(storeData.language)
      }

      // Set loading state
      setIsGenerating(isGeneratingFromStore)
      setOverallProgress(overallProgressFromStore)

      // console.log("🔄 Background process status:", {
      //   uploadResume: apiCalls.uploadResume.status,
      //   saveJobs: apiCalls.saveJobs.status,
      //   generateResumes: apiCalls.generateResumes.status
      // })
    }
  }, [
    asBg,
    isNavigatedFromBulkGenerator,
    isGeneratingFromStore,
    overallProgressFromStore,
    apiCalls
  ])

  // Start background setup process when navigated from bulk generator
  useEffect(() => {
    // DEBUG: Log all condition values to understand why the effect isn't triggering
    // console.log("🔍 DEBUG - Background setup useEffect conditions:", {
    //   asBg,
    //   isNavigatedFromBulkGenerator,
    //   setupComplete,
    //   uploadResumeStatus: apiCalls.uploadResume.status,
    //   saveJobsStatus: apiCalls.saveJobs.status,
    //   allConditions:
    //     asBg &&
    //     isNavigatedFromBulkGenerator &&
    //     !setupComplete &&
    //     apiCalls.uploadResume.status === "pending" &&
    //     apiCalls.saveJobs.status === "pending"
    // })

    if (
      asBg &&
      isNavigatedFromBulkGenerator &&
      !setupComplete &&
      apiCalls.uploadResume.status === "pending" &&
      apiCalls.saveJobs.status === "pending"
    ) {
      // console.log("🚀 Starting background setup process...")

      // Start the background setup process
      const startBackgroundSetup = async () => {
        try {
          await startBackgroundSetupProcess()
        } catch (error) {
          console.error("Error starting background setup:", error)
        }
      }

      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startBackgroundSetup()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [
    asBg,
    isNavigatedFromBulkGenerator,
    setupComplete,
    apiCalls.uploadResume.status,
    apiCalls.saveJobs.status
  ])

  // Handle background process completion
  useEffect(() => {
    if (
      asBg &&
      isNavigatedFromBulkGenerator &&
      apiCalls.generateResumes.status === "completed"
    ) {
      // Trigger fresh session data refetch
      refetchSessionDataAndWait().then(() => {
        console.log("✅ Fresh session data loaded after background completion")
      })
      // console.log("🎉 Background process completed, removing asBg parameter...")

      // Clean up the store before removing asBg parameter
      console.log("🧹 Cleaning up store before removing asBg parameter...")
      clearResumeGenerationStore()

      // Remove asBg parameter to prevent re-triggering
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete("asBg")
      newSearchParams.append("completed", "true")
      // Update URL without asBg parameter
      const newUrl = newSearchParams.toString()
      const finalUrl = newUrl ? `?${newUrl}` : ""

      // Navigate to the same page without asBg parameter
      navigate(`/initialize-resume-generation/${sessionId}${finalUrl}`, {
        replace: true
      })

      // Auto-refresh the page or fetch updated session data after a short delay
      const timer = setTimeout(() => {
        // Reload to fetch fresh session data
        window.location.reload()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [
    asBg,
    isNavigatedFromBulkGenerator,
    apiCalls,
    sessionId,
    searchParams,
    navigate
  ])

  // Watch for setup completion and trigger resume generation
  useEffect(() => {
    console.log("🔍 DEBUG - Auto-generation useEffect triggered:", {
      asBg,
      isNavigatedFromBulkGenerator,
      setupComplete,
      uploadResumeStatus: apiCalls.uploadResume.status,
      saveJobsStatus: apiCalls.saveJobs.status,
      generateResumesStatus: apiCalls.generateResumes.status,
      isAutoGenerationExecuting: isAutoGenerationExecuting.current,
      currentSessionJobsLength: currentSessionJobs.length
    })

    if (
      asBg &&
      isNavigatedFromBulkGenerator &&
      setupComplete &&
      apiCalls.uploadResume.status === "completed" &&
      apiCalls.saveJobs.status === "completed" &&
      !isAutoGenerationExecuting.current // Prevent re-execution
    ) {
      console.log(
        "🚀 CRITICAL: Setup completed, starting automatic resume generation..."
      )
      // console.log(
      //   "📊 Current generateResumes status:",
      //   apiCalls.generateResumes.status
      // )

      // Only proceed if generation isn't currently running
      if (apiCalls.generateResumes.status === "pending") {
        // console.log(
        //   "📊 Generation status is 'pending' - checking if this is a stuck state..."
        // )

        // Check if we actually have an active generation process
        const storeState = useResumeGenerationStore.getState()
        const hasActiveProcess = storeState.backgroundProcessId

        // console.log("🔍 Checking for active background process:", {
        //   backgroundProcessId: hasActiveProcess,
        //   storeGenerating: storeState.isGenerating,
        //   localGenerating: isGenerating,
        //   currentTime: Date.now()
        // })

        // If no active background process ID, this means resume generation isn't actually running
        // The isGenerating flags might be stuck from setup process
        if (!hasActiveProcess) {
          console.log(
            "� CRITICAL: No active background process - resetting states and proceeding"
          )

          // Reset both local and store generating states
          setIsGenerating(false)
          useResumeGenerationStore.getState().setIsGenerating(false)

          // Reset the generateResumes status to allow fresh start
          useResumeGenerationStore
            .getState()
            .updateApiCallStatus("generateResumes", {
              status: "pending", // Keep as pending to allow generation to start
              progress: 0
            })
          // console.log(
          //   "✅ Generation states reset - proceeding with auto-generation"
          // )
        } else {
          console.log(
            "� CRITICAL: Active background process found - generation in progress, skipping auto-generation"
          )
          return
        }
      }

      isAutoGenerationExecuting.current = true

      // Start resume generation automatically
      const startAutoGeneration = async () => {
        try {
          // CRITICAL FIX: For bulk generation, always use jobs from store directly
          // Don't rely on currentSessionJobs being set correctly
          const storeJobs = useResumeGenerationStore.getState().jobs
          console.log(
            "� CRITICAL: Store jobs for auto-generation:",
            storeJobs.length
          )

          if (storeJobs.length === 0) {
            console.log(
              "❌ CRITICAL: No jobs found in store for auto-generation"
            )
            return
          }

          // Ensure currentSessionJobs reflects the store jobs for consistency
          if (currentSessionJobs.length === 0) {
            console.log(
              "� CRITICAL: Setting currentSessionJobs from store for auto-generation..."
            )
            setCurrentSessionJobs(storeJobs)
            // Wait for state update to complete
            await new Promise((resolve) => setTimeout(resolve, 100))
          }

          // Mark resume generation as starting
          useResumeGenerationStore
            .getState()
            .updateApiCallStatus("generateResumes", {
              status: "pending",
              progress: 0
            })

          console.log(
            "🔍 CRITICAL: Triggering automatic resume generation for stored jobs only..."
          )
          await startResumeGeneration()
        } catch (error) {
          console.error("Error in automatic resume generation:", error)
          useResumeGenerationStore
            .getState()
            .updateApiCallStatus("generateResumes", {
              status: "error",
              progress: 0,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to start generation"
            })
        } finally {
          isAutoGenerationExecuting.current = false
        }
      }

      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        startAutoGeneration()
      }, 1000)

      return () => {
        clearTimeout(timer)
        isAutoGenerationExecuting.current = false
      }
    }
  }, [
    asBg,
    isNavigatedFromBulkGenerator,
    setupComplete,
    apiCalls.uploadResume.status,
    apiCalls.saveJobs.status,
    apiCalls.generateResumes.status,
    currentSessionJobs.length // Add this to re-run when jobs are loaded
  ])

  // EARLY DEBUG - Auto-generation useEffect dependency tracker
  // console.log("📊 Auto-generation dependency change detected:", {
  //   asBg,
  //   isNavigatedFromBulkGenerator,
  //   setupComplete,
  //   uploadResumeStatus: apiCalls.uploadResume.status,
  //   saveJobsStatus: apiCalls.saveJobs.status,
  //   generateResumesStatus: apiCalls.generateResumes.status,
  //   currentSessionJobsLength: currentSessionJobs.length,
  //   isAutoGenerationExecuting: isAutoGenerationExecuting.current,
  //   timestamp: new Date().toISOString()
  // })

  // Handle resume generation completion
  useEffect(() => {
    const state = useResumeGenerationStore.getState()
    const generateResumesStatus = state.apiCalls.generateResumes.status

    if (
      asBg &&
      isNavigatedFromBulkGenerator &&
      generateResumesStatus === "completed"
    ) {
      console.log("🎉 Resume generation completed, removing asBg parameter...")

      // Clean up the store before removing asBg parameter
      console.log("🧹 Cleaning up store before removing asBg parameter...")
      clearResumeGenerationStore()

      // Remove asBg parameter to prevent re-triggering
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete("asBg")
      newSearchParams.append("completed", "true")
      // Update URL without asBg parameter
      const newUrl = newSearchParams.toString()
      const finalUrl = newUrl ? `?${newUrl}` : ""

      // Navigate to the same page without asBg parameter
      navigate(`/initialize-resume-generation/${sessionId}${finalUrl}`, {
        replace: true
      })

      // Clear the store data and refresh session data
      const timer = setTimeout(() => {
        // Reload to fetch fresh session data
        window.location.reload()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [
    asBg,
    isNavigatedFromBulkGenerator,
    apiCalls.generateResumes.status,
    sessionId,
    searchParams,
    navigate
  ])

  // Fetch session data on mount
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        console.warn("No session ID found in route parameters")
        return
      }

      setLoadingSessionData(true)
      try {
        // console.log("Fetching session data for session ID:", sessionId)

        console.log(
          "🔄 Adding cache-busting timestamp for fresh data:",
          Date.now()
        )
        const response = await postRequest(API_ENDPOINTS.GetSessionData, {
          SESSION_ID: sessionId,
          _timestamp: Date.now() // Cache-busting parameter to ensure fresh data
        })

        // console.log("Session data response:", response)

        if (response.success && response.data) {
          setSessionData(response.data)

          // CRITICAL FIX: For bulk generation mode, don't populate currentSessionJobs with existing session data
          // We only want to use jobs from the store (passed from bulk generator)
          if (asBg && isNavigatedFromBulkGenerator) {
            console.log(
              "🚫 Bulk generation mode - skipping session jobs population, will use store jobs only"
            )

            // In bulk generation mode, DON'T override base resume content from session
            // The store already has the correct new resume content
            console.log(
              "🚫 Skipping base resume content from session - using store content only"
            )

            // Only set S3 URL if we don't already have base resume content from store
            if (
              !baseResumeContent &&
              response.data.current_session?.base_resume?.s3_path
            ) {
              setBaseResumeS3Url(
                response.data.current_session.base_resume.s3_path
              )
              console.log(
                "📄 Base resume S3 URL found:",
                response.data.current_session.base_resume.s3_path
              )
            } else {
              console.log(
                "📄 Using base resume content from store, not overriding with session data"
              )
            }

            // Don't set currentSessionJobs - let it be populated from store only
            return
          }

          // Normal mode - populate session jobs as usual
          // Check if current session exists (valid session ID case)
          if (response.data.current_session?.generated_resumes) {
            console.log(
              "📋 Current session generated_resumes:",
              response.data.current_session.generated_resumes
            )

            // Annotate each job with its parent session's session_id
            const jobsWithSessionId =
              response.data.current_session.generated_resumes.map(
                (job: any) => ({
                  ...job,
                  session_id: response.data.current_session.session_id
                })
              )

            console.log(
              "📋 Annotated current session jobs with session_id:",
              jobsWithSessionId[0]?.session_id
            )
            setCurrentSessionJobs(jobsWithSessionId)

            // Set base resume content if available and not already set
            if (
              response.data.current_session?.base_resume?.resume_text &&
              !baseResumeContent
            ) {
              setBaseResumeContent(
                response.data.current_session.base_resume.resume_text
              )
            }

            // Set base resume S3 URL if available
            if (response.data.current_session?.base_resume?.s3_path) {
              setBaseResumeS3Url(
                response.data.current_session.base_resume.s3_path
              )
              console.log(
                "📄 Base resume S3 URL found:",
                response.data.current_session.base_resume.s3_path
              )
            } else {
              console.log("📄 No base resume S3 URL found in session data")
            }
          }
          // Handle case when session ID is invalid/not found - backend returns all sessions in previous_sessions
          else if (
            !response.data.current_session &&
            response.data.previous_sessions?.length > 0
          ) {
            console.log(
              "⚠️ Invalid/missing session ID - Backend returned all sessions in previous_sessions"
            )
            console.log(
              "📋 Available sessions:",
              response.data.previous_sessions.length
            )

            // Try to find the requested session in previous_sessions array
            const requestedSession = response.data.previous_sessions.find(
              (session: any) => session.session_id === sessionId
            )

            if (requestedSession) {
              console.log(
                "✅ Found requested session in previous_sessions:",
                sessionId
              )

              // Map the found session as current session jobs, annotating each job with session_id
              if (requestedSession.generated_resumes) {
                console.log(
                  "📋 Found session generated_resumes:",
                  requestedSession.generated_resumes
                )

                // Annotate each job with its parent session's session_id
                const jobsWithSessionId =
                  requestedSession.generated_resumes.map((job: any) => ({
                    ...job,
                    session_id: requestedSession.session_id
                  }))

                console.log(
                  "📋 Annotated jobs with session_id:",
                  jobsWithSessionId[0]?.session_id
                )
                setCurrentSessionJobs(jobsWithSessionId)
              } else {
                // Ensure we set an empty array if no jobs exist, not null/undefined
                console.log(
                  "📋 No generated_resumes found in session, setting empty array"
                )
                setCurrentSessionJobs([])
              }

              // Set base resume content from found session
              if (requestedSession.base_resume?.resume_text) {
                console.log(
                  "📄 Setting base resume content from session, length:",
                  requestedSession.base_resume.resume_text.length
                )
                setBaseResumeContent(requestedSession.base_resume.resume_text)
              } else {
                console.log("📄 No base resume text found in session")
              }

              // Set base resume S3 URL from found session
              if (requestedSession.base_resume?.s3_path) {
                console.log(
                  "📄 Setting base resume S3 URL from session:",
                  requestedSession.base_resume.s3_path
                )
                setBaseResumeS3Url(requestedSession.base_resume.s3_path)
                console.log(
                  "📄 Base resume S3 URL found in session:",
                  requestedSession.base_resume.s3_path
                )
              } else {
                console.log("📄 No base resume S3 URL found in session")
                console.log(
                  "📄 Session base_resume object:",
                  requestedSession.base_resume
                )
              }

              // Filter out the current session from previous sessions to avoid duplication
              const otherSessions = response.data.previous_sessions.filter(
                (session: any) => session.session_id !== sessionId
              )

              // Annotate jobs in other sessions with their session_id
              const annotatedOtherSessions = otherSessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )

              setPreviousSessions(annotatedOtherSessions)

              console.log(
                `✅ Session recovery successful! Current session now has ${
                  requestedSession.generated_resumes?.length || 0
                } jobs, remaining previous sessions: ${otherSessions.length}`
              )

              // Debug: Log the first job's resume data structure
              if (requestedSession.generated_resumes?.length > 0) {
                console.log("🔍 First recovered job structure:", {
                  generation_id:
                    requestedSession.generated_resumes[0].generation_id,
                  has_resume_data:
                    requestedSession.generated_resumes[0].generated_resume
                      ?.has_resume_data,
                  resume_data_keys: Object.keys(
                    requestedSession.generated_resumes[0].generated_resume
                      ?.resume_data || {}
                  ),
                  complete_generated_resume:
                    requestedSession.generated_resumes[0].generated_resume
                })
              }
            } else {
              console.log("❌ Requested session not found in previous_sessions")
              // UI and stats should never show empty data if valid jobs exist in previous_sessions
              // Set all sessions as previous sessions and show their jobs
              console.log(
                "📋 Setting all sessions as previous sessions to show available jobs"
              )

              // Annotate all session jobs with their session_id
              const annotatedSessions = response.data.previous_sessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )

              setCurrentSessionJobs([])
              setPreviousSessions(annotatedSessions)

              // Set base resume content from the first available session for preview/download functionality
              if (
                response.data.previous_sessions[0]?.base_resume?.resume_text
              ) {
                console.log(
                  "📄 Setting global base resume content from first session for preview functionality, length:",
                  response.data.previous_sessions[0].base_resume.resume_text
                    .length
                )
                setBaseResumeContent(
                  response.data.previous_sessions[0].base_resume.resume_text
                )
              }

              // Set base resume S3 URL from the first available session
              if (response.data.previous_sessions[0]?.base_resume?.s3_path) {
                console.log(
                  "📄 Setting global base resume S3 URL from first session:",
                  response.data.previous_sessions[0].base_resume.s3_path
                )
                setBaseResumeS3Url(
                  response.data.previous_sessions[0].base_resume.s3_path
                )
              }

              // Show a helpful message to user
              console.warn("Session not found. Showing all available sessions.")
            }
          }
          // Handle case when no current session and no previous sessions (truly empty state)
          else if (
            !response.data.current_session &&
            !response.data.previous_sessions?.length
          ) {
            console.log("📭 No current session and no previous sessions found")
            setCurrentSessionJobs([])
            setPreviousSessions([])
          }

          // Always set previous sessions (will be filtered above if current session was found)
          if (
            response.data.previous_sessions &&
            !response.data.current_session
          ) {
            // Only set if we haven't already set them above
            if (
              !response.data.previous_sessions.find(
                (session: any) => session.session_id === sessionId
              )
            ) {
              // Annotate all session jobs with their session_id
              const annotatedSessions = response.data.previous_sessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )
              setPreviousSessions(annotatedSessions)
            }
          } else if (response.data.previous_sessions) {
            // Annotate all session jobs with their session_id
            const annotatedSessions = response.data.previous_sessions.map(
              (session: any) => ({
                ...session,
                generated_resumes:
                  session.generated_resumes?.map((job: any) => ({
                    ...job,
                    session_id: session.session_id
                  })) || []
              })
            )
            setPreviousSessions(annotatedSessions)
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error)
        errorToast("Failed to fetch session data")
      }
      setLoadingSessionData(false)
    }

    fetchSessionData()
  }, [sessionId])

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        console.warn("No session ID found in route parameters")
        return
      }
      setLoadingSessionData(true)
      try {
        // console.log("Fetching session data for session ID:", sessionId)

        const response = await postRequest(API_ENDPOINTS.GetSessionData, {
          SESSION_ID: sessionId,
          _timestamp: Date.now() // Cache-busting parameter to ensure fresh data
        })

        // console.log("Session data response:", response)

        if (response.success && response.data) {
          setSessionData(response.data)

          // CRITICAL FIX: For bulk generation mode, don't populate currentSessionJobs with existing session data
          // We only want to use jobs from the store (passed from bulk generator)
          if (asBg && isNavigatedFromBulkGenerator) {
            console.log(
              "🚫 Bulk generation mode - skipping session jobs population, will use store jobs only"
            )

            // In bulk generation mode, DON'T override base resume content from session
            // The store already has the correct new resume content
            console.log(
              "🚫 Skipping base resume content from session - using store content only"
            )

            // Only set S3 URL if we don't already have base resume content from store
            if (
              !baseResumeContent &&
              response.data.current_session?.base_resume?.s3_path
            ) {
              setBaseResumeS3Url(
                response.data.current_session.base_resume.s3_path
              )
              console.log(
                "📄 Base resume S3 URL found:",
                response.data.current_session.base_resume.s3_path
              )
            } else {
              console.log(
                "📄 Using base resume content from store, not overriding with session data"
              )
            }

            // Don't set currentSessionJobs - let it be populated from store only
            return
          }

          // Normal mode - populate session jobs as usual
          // Check if current session exists (valid session ID case)
          if (response.data.current_session?.generated_resumes) {
            console.log(
              "📋 Current session generated_resumes:",
              response.data.current_session.generated_resumes
            )

            // Annotate each job with its parent session's session_id
            const jobsWithSessionId =
              response.data.current_session.generated_resumes.map(
                (job: any) => ({
                  ...job,
                  session_id: response.data.current_session.session_id
                })
              )

            console.log(
              "📋 Annotated current session jobs with session_id:",
              jobsWithSessionId[0]?.session_id
            )
            setCurrentSessionJobs(jobsWithSessionId)

            // Set base resume content if available
            if (response.data.current_session?.base_resume?.resume_text) {
              setBaseResumeContent(
                response.data.current_session.base_resume.resume_text
              )
            }

            // Set base resume S3 URL if available
            if (response.data.current_session?.base_resume?.s3_path) {
              setBaseResumeS3Url(
                response.data.current_session.base_resume.s3_path
              )
              console.log(
                "📄 Base resume S3 URL found:",
                response.data.current_session.base_resume.s3_path
              )
            } else {
              console.log("📄 No base resume S3 URL found in session data")
            }
          }
          // Handle case when session ID is invalid/not found - backend returns all sessions in previous_sessions
          else if (
            !response.data.current_session &&
            response.data.previous_sessions?.length > 0
          ) {
            console.log(
              "⚠️ Invalid/missing session ID - Backend returned all sessions in previous_sessions"
            )
            console.log(
              "📋 Available sessions:",
              response.data.previous_sessions.length
            )

            // Try to find the requested session in previous_sessions array
            const requestedSession = response.data.previous_sessions.find(
              (session: any) => session.session_id === sessionId
            )

            if (requestedSession) {
              console.log(
                "✅ Found requested session in previous_sessions:",
                sessionId
              )

              // Map the found session as current session jobs, annotating each job with session_id
              if (requestedSession.generated_resumes) {
                console.log(
                  "📋 Found session generated_resumes:",
                  requestedSession.generated_resumes
                )

                // Annotate each job with its parent session's session_id
                const jobsWithSessionId =
                  requestedSession.generated_resumes.map((job: any) => ({
                    ...job,
                    session_id: requestedSession.session_id
                  }))

                console.log(
                  "📋 Annotated jobs with session_id:",
                  jobsWithSessionId[0]?.session_id
                )
                setCurrentSessionJobs(jobsWithSessionId)
              } else {
                // Ensure we set an empty array if no jobs exist, not null/undefined
                console.log(
                  "📋 No generated_resumes found in session, setting empty array"
                )
                setCurrentSessionJobs([])
              }

              // Set base resume content from found session
              if (requestedSession.base_resume?.resume_text) {
                console.log(
                  "📄 Setting base resume content from session, length:",
                  requestedSession.base_resume.resume_text.length
                )
                setBaseResumeContent(requestedSession.base_resume.resume_text)
              } else {
                console.log("📄 No base resume text found in session")
              }

              // Set base resume S3 URL from found session
              if (requestedSession.base_resume?.s3_path) {
                console.log(
                  "📄 Setting base resume S3 URL from session:",
                  requestedSession.base_resume.s3_path
                )
                setBaseResumeS3Url(requestedSession.base_resume.s3_path)
                console.log(
                  "📄 Base resume S3 URL found in session:",
                  requestedSession.base_resume.s3_path
                )
              } else {
                console.log("📄 No base resume S3 URL found in session")
                console.log(
                  "📄 Session base_resume object:",
                  requestedSession.base_resume
                )
              }

              // Filter out the current session from previous sessions to avoid duplication
              const otherSessions = response.data.previous_sessions.filter(
                (session: any) => session.session_id !== sessionId
              )

              // Annotate jobs in other sessions with their session_id
              const annotatedOtherSessions = otherSessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )

              setPreviousSessions(annotatedOtherSessions)

              console.log(
                `✅ Session recovery successful! Current session now has ${
                  requestedSession.generated_resumes?.length || 0
                } jobs, remaining previous sessions: ${otherSessions.length}`
              )

              // Debug: Log the first job's resume data structure
              if (requestedSession.generated_resumes?.length > 0) {
                console.log("🔍 First recovered job structure:", {
                  generation_id:
                    requestedSession.generated_resumes[0].generation_id,
                  has_resume_data:
                    requestedSession.generated_resumes[0].generated_resume
                      ?.has_resume_data,
                  resume_data_keys: Object.keys(
                    requestedSession.generated_resumes[0].generated_resume
                      ?.resume_data || {}
                  ),
                  complete_generated_resume:
                    requestedSession.generated_resumes[0].generated_resume
                })
              }
            } else {
              console.log("❌ Requested session not found in previous_sessions")
              // UI and stats should never show empty data if valid jobs exist in previous_sessions
              // Set all sessions as previous sessions and show their jobs
              console.log(
                "📋 Setting all sessions as previous sessions to show available jobs"
              )

              // Annotate all session jobs with their session_id
              const annotatedSessions = response.data.previous_sessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )

              setCurrentSessionJobs([])
              setPreviousSessions(annotatedSessions)

              // Set base resume content from the first available session for preview/download functionality
              if (
                response.data.previous_sessions[0]?.base_resume?.resume_text
              ) {
                console.log(
                  "📄 Setting global base resume content from first session for preview functionality, length:",
                  response.data.previous_sessions[0].base_resume.resume_text
                    .length
                )
                setBaseResumeContent(
                  response.data.previous_sessions[0].base_resume.resume_text
                )
              }

              // Set base resume S3 URL from the first available session
              if (response.data.previous_sessions[0]?.base_resume?.s3_path) {
                console.log(
                  "📄 Setting global base resume S3 URL from first session:",
                  response.data.previous_sessions[0].base_resume.s3_path
                )
                setBaseResumeS3Url(
                  response.data.previous_sessions[0].base_resume.s3_path
                )
              }

              // Show a helpful message to user
              console.warn("Session not found. Showing all available sessions.")
            }
          }
          // Handle case when no current session and no previous sessions (truly empty state)
          else if (
            !response.data.current_session &&
            !response.data.previous_sessions?.length
          ) {
            console.log("📭 No current session and no previous sessions found")
            setCurrentSessionJobs([])
            setPreviousSessions([])
          }

          // Always set previous sessions (will be filtered above if current session was found)
          if (
            response.data.previous_sessions &&
            !response.data.current_session
          ) {
            // Only set if we haven't already set them above
            if (
              !response.data.previous_sessions.find(
                (session: any) => session.session_id === sessionId
              )
            ) {
              // Annotate all session jobs with their session_id
              const annotatedSessions = response.data.previous_sessions.map(
                (session: any) => ({
                  ...session,
                  generated_resumes:
                    session.generated_resumes?.map((job: any) => ({
                      ...job,
                      session_id: session.session_id
                    })) || []
                })
              )
              setPreviousSessions(annotatedSessions)
            }
          } else if (response.data.previous_sessions) {
            // Annotate all session jobs with their session_id
            const annotatedSessions = response.data.previous_sessions.map(
              (session: any) => ({
                ...session,
                generated_resumes:
                  session.generated_resumes?.map((job: any) => ({
                    ...job,
                    session_id: session.session_id
                  })) || []
              })
            )
            setPreviousSessions(annotatedSessions)
          }
        }
      } catch (error) {
        console.error("Error fetching session data:", error)
        errorToast("Failed to fetch session data")
      }
      setLoadingSessionData(false)
    }

    if (refetchSessionData && sessionId) {
      fetchSessionData()
      shouldRefetchSessionData(false) // Reset the refetch flag after triggering
    }
  }, [refetchSessionData, sessionId])

  // Credit confirmation helper functions
  const handleCreditConfirmation = async () => {
    console.log("🎯 Credit confirmation clicked")
    if (creditModal.pendingAction) {
      console.log("🎯 Executing pending action after credit confirmation")

      // Close the modal immediately upon confirmation
      setCreditModal({
        isOpen: false,
        creditValidation: null,
        pendingAction: null,
        isLoading: false
      })

      try {
        await creditModal.pendingAction()
      } catch (error) {
        console.error("Error executing pending action:", error)
        // Reset generating state on error
        setIsGenerating(false)
        setProcessingJobIds(new Set())
      }
    } else {
      console.warn("🎯 No pending action found")
      closeCreditModal()
    }
  }

  const closeCreditModal = () => {
    // Reset any loading states when modal is closed/cancelled
    setIsGenerating(false)
    // Clear any processing job IDs that might be stuck due to modal cancellation
    setProcessingJobIds(new Set())
    setCreditModal({
      isOpen: false,
      creditValidation: null,
      pendingAction: null,
      isLoading: false
    })
  }

  const executeWithCreditCheck = async (
    actionType: ActionType,
    action: () => Promise<void>,
    customSessionId?: string,
    jobData?: any // Add optional jobData parameter to check for credit exclusion
  ) => {
    try {
      console.log(`🔍 Checking credits for ${actionType}...`)
      const sessionIdToUse = customSessionId || sessionId || ""
      console.log(`🔍 Using session ID for credit check: ${sessionIdToUse}`)

      // Check if this job should be excluded from credit charges
      if (jobData && shouldExcludeFromCredits(jobData)) {
        console.log(
          `✅ Job excluded from credit charges (used_free_generation: false), proceeding directly`
        )

        // For free regenerations, execute directly without modal
        await action()
        return
      }

      const creditValidation = await validateCreditForActionExport(
        actionType,
        sessionIdToUse,
        true
      )

      if (creditValidation.shouldShowUpgradeModal) {
        errorToast(creditValidation.message)
        setProcessingJobIds((prev) => new Set<string>())
        return setShowUpgradeModal(true)
      }

      console.log(`💳 Credit validation result:`, creditValidation)

      if (!creditValidation.canProceed) {
        errorToast(creditValidation.message)
        return
      }

      // AUTO-CONFIRM FOR BACKGROUND OPERATIONS, FORCE CONFIRMATION FOR INTERACTIVE OPERATIONS
      if (asBg) {
        // In background mode (asBg=true), auto-confirm credit check and execute directly
        console.log(
          `✅ Auto-confirming credit check for ${actionType} in background mode (asBg=true)`
        )
        await action()
        return
      }

      // If no credits are required (creditCost is 0 and not using free generation), auto-proceed
      if (creditValidation.creditCost === 0 && !creditValidation.freeUsed) {
        console.log(
          `✅ No credits required for ${actionType}, proceeding automatically`
        )
        await action()
        return
      }

      // For interactive mode, always show confirmation modal for resume generation regardless of credit cost
      console.log(
        `⚠️ FORCING credit confirmation for ${actionType} (user requested always confirm)`
      )

      // If no cost but we still want to show confirmation, create appropriate message
      const confirmationMessage =
        creditValidation.message ||
        `Generate tailored resume? This will use${
          creditValidation.creditCost > 0
            ? ` ${creditValidation.creditCost} credits`
            : ""
        }${creditValidation.freeUsed ? " and 1 free generation" : ""}${
          creditValidation.creditCost === 0 && !creditValidation.freeUsed
            ? " your available resources"
            : ""
        }.`

      setCreditModal({
        isOpen: true,
        creditValidation: {
          ...creditValidation,
          needsConfirmation: true, // Force confirmation
          message: confirmationMessage
        },
        pendingAction: action,
        isLoading: false
      })
      return

      // Original logic (commented out since we always want confirmation)
      // if (creditValidation.needsConfirmation) {
      //   console.log(`⚠️ Credit confirmation needed for ${actionType}`)
      //   setCreditModal({
      //     isOpen: true,
      //     creditValidation,
      //     pendingAction: action,
      //     isLoading: false
      //   })
      //   return
      // }

      // // No confirmation needed, execute directly
      // console.log(`✅ No confirmation needed, executing ${actionType}`)
      // await action()
    } catch (error) {
      console.error("Error in credit check:", error)
      errorToast("Failed to validate credits. Please try again.")
    }
  }

  const executeWithBulkCreditCheck = async (
    jobs: any[],
    actionType: ActionType,
    action: () => Promise<void>
  ) => {
    console.log("🎯 executeWithBulkCreditCheck called with:", {
      jobsCount: jobs.length,
      actionType,
      asBg,
      hasAction: typeof action === "function"
    })

    try {
      console.log(`🔍 Checking credits for bulk ${actionType}...`)
      console.log(`📋 Jobs to process:`, jobs)

      // Filter out jobs that don't require credit charges
      const jobsRequiringCredits = getJobsRequiringCredits(jobs)
      const excludedJobs = jobs.filter((job) => shouldExcludeFromCredits(job))

      console.log(`💳 Credit filtering results:`, {
        totalJobs: jobs.length,
        jobsRequiringCredits: jobsRequiringCredits.length,
        excludedJobs: excludedJobs.length
      })

      // Transform only jobs requiring credits to JobRow format for credit validation
      const transformedJobs: JobRow[] = jobsRequiringCredits.map((job) => ({
        id: job.generation_id || job.id || Date.now().toString(),
        companyUrl: `https://${job.job_details.company_name
          .toLowerCase()
          .replace(/\s+/g, "")}.com`, // Mock URL
        jobTitle: job.job_details.job_title,
        description: job.job_details.job_description || "",
        skills: Array.isArray(job.job_details.job_skills)
          ? job.job_details.job_skills.join(", ")
          : job.job_details.job_skills || ""
      }))

      console.log(`🔄 Transformed jobs for validation:`, transformedJobs)

      // Use bulk validation only for jobs that require credits
      const creditValidation = await validateBulkCreditRequirements(
        transformedJobs,
        actionType,
        sessionId || ""
      )

      console.log(`💳 Bulk credit validation result:`, creditValidation)

      if (creditValidation.shouldShowUpgradeModal) {
        errorToast(creditValidation.message)
        setProcessingJobIds((prev) => new Set<string>())
        return setShowUpgradeModal(true)
      }

      // If no jobs require credits and we have excluded jobs, show a custom message
      if (jobsRequiringCredits.length === 0 && excludedJobs.length > 0) {
        console.log(
          `✅ All ${excludedJobs.length} jobs are free (previously paid), proceeding without credit check`
        )

        // AUTO-PROCEED for all operations when no credits are required
        console.log(`🚀 Executing bulk action directly (all jobs free)...`)
        await action()
        return
      }

      if (creditValidation.shouldShowUpgradeModal) {
        errorToast(creditValidation.message)
        setProcessingJobIds((prev) => new Set<string>())
        return setShowUpgradeModal(true)
      }

      if (!creditValidation.canProceed) {
        console.log(`❌ Cannot proceed: ${creditValidation.message}`)
        errorToast(creditValidation.message)
        return
      }

      // AUTO-CONFIRM FOR BACKGROUND OPERATIONS, FORCE CONFIRMATION FOR INTERACTIVE OPERATIONS
      if (asBg) {
        // In background mode (asBg=true), auto-confirm credit check and execute directly
        console.log(
          `✅ Auto-confirming bulk credit check for ${actionType} in background mode (asBg=true)`
        )
        console.log(`🚀 Executing bulk action directly...`)
        console.log(`🔍 Action function type:`, typeof action)
        console.log(
          `🔍 Action function:`,
          action.toString().substring(0, 100) + "..."
        )

        try {
          console.log(`🎯 STARTING action execution...`)
          await action()
          console.log(`✅ COMPLETED action execution successfully`)
        } catch (actionError) {
          console.error(`❌ ERROR during action execution:`, actionError)
          throw actionError
        }
        return
      }

      // If no credits are required (creditCost is 0 and not using free generation), auto-proceed
      if (creditValidation.creditCost === 0 && !creditValidation.freeUsed) {
        console.log(
          `✅ No credits required for bulk ${actionType}, proceeding automatically`
        )
        await action()
        return
      }

      // FORCE CONFIRMATION FOR ALL INTERACTIVE GENERATE OPERATIONS
      // Always show confirmation modal for resume generation regardless of credit cost
      console.log(
        `⚠️ FORCING credit confirmation for bulk ${actionType} (user requested always confirm)`
      )
      console.log(`🪟 Opening credit modal...`)

      // Enhanced message that includes information about excluded jobs
      let enhancedMessage = creditValidation.message
      if (excludedJobs.length > 0) {
        enhancedMessage += ` \nNote: ${excludedJobs.length} resume${
          excludedJobs.length > 1 ? "s" : ""
        } will be regenerated for free.`
      }

      // Use the detailed message from bulk validation, which includes proper breakdown
      console.log(`📋 Using enhanced validation message:`, enhancedMessage)

      setCreditModal({
        isOpen: true,
        creditValidation: {
          ...creditValidation,
          needsConfirmation: true, // Force confirmation
          // Keep the original detailed message from validateBulkCreditRequirements
          message: enhancedMessage
        },
        pendingAction: action,
        isLoading: false
      })
      console.log(`🪟 Credit modal state set, should be visible now`)
      return

      // Original logic (commented out since we always want confirmation)
      // if (creditValidation.needsConfirmation) {
      //   console.log(`⚠️ Credit confirmation needed for bulk ${actionType}`)
      //   console.log(`🪟 Opening credit modal...`)
      //   setCreditModal({
      //     isOpen: true,
      //     creditValidation,
      //     pendingAction: action,
      //     isLoading: false
      //   })
      //   console.log(`🪟 Credit modal state set, should be visible now`)
      //   return
      // }

      // // No confirmation needed, execute directly
      // console.log(`✅ No confirmation needed, executing bulk ${actionType}`)
      // await action()
    } catch (error) {
      console.error("Error in bulk credit check:", error)
      errorToast("Failed to validate credits. Please try again.")
    }
  }

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewJobId, setPreviewJobId] = useState<string | null>(null)
  const [currentPreviewJobData, setCurrentPreviewJobData] = useState<any>(null)
  const [previewUrls, setPreviewUrls] = useState<{
    oldResume: string | null
    newResume: string | null
  }>({ oldResume: null, newResume: null })

  // Diff highlighting state
  const [showDiffHighlighting, setShowDiffHighlighting] = useState(false)
  const [highlightLevel, setHighlightLevel] = useState<
    "subtle" | "normal" | "strong"
  >("normal")
  const [originalResumeText, setOriginalResumeText] = useState<string>("")
  const [tailoredResumeText, setTailoredResumeText] = useState<string>("")
  const [useDocxHighlightFallback, setUseDocxHighlightFallback] =
    useState(false)

  // Horizontal scroll toggle for original resume
  const [isOriginalResumeScrollable, setIsOriginalResumeScrollable] =
    useState(false)

  // Cache for base resume rendering
  const [baseResumeCache, setBaseResumeCache] = useState<{
    url: string | null
    renderedHTML: string | null
    isRendering: boolean
    lastCacheKey: string | null
  }>({
    url: null,
    renderedHTML: null,
    isRendering: false,
    lastCacheKey: null
  })

  // Effect to render DOCX files when preview URLs change
  useEffect(() => {
    const renderDocxFiles = async () => {
      if (previewModalOpen && previewUrls.newResume) {
        const startTime = performance.now()

        try {
          // Render the new tailored resume
          const newResumeContainer =
            document.getElementById("new-resume-preview")
          if (newResumeContainer) {
            newResumeContainer.innerHTML =
              '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-purple-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering tailored resume...</p></div>'

            try {
              const newResumeResponse = await fetch(previewUrls.newResume)
              const newResumeArrayBuffer = await newResumeResponse.arrayBuffer()

              // Clear the loading state and prepare container
              newResumeContainer.innerHTML = ""
              newResumeContainer.className =
                "docx-wrapper w-full h-full overflow-auto bg-white p-4"

              await renderAsync(
                newResumeArrayBuffer,
                newResumeContainer,
                undefined,
                {
                  className: "docx-content",
                  inWrapper: false,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  ignoreFonts: false,
                  breakPages: false,
                  ignoreLastRenderedPageBreak: true,
                  experimental: false,
                  trimXmlDeclaration: true
                }
              )
            } catch (renderError) {
              console.error("Error rendering new resume:", renderError)
              newResumeContainer.innerHTML =
                '<div class="flex items-center justify-center h-full min-h-[200px] text-red-600"><div class="text-center"><p class="font-medium">Failed to render tailored resume</p><p class="text-sm text-gray-500 mt-1">Please try again or download the file</p></div></div>'
            }
          }

          // Render the old resume if available
          if (previewUrls.oldResume) {
            const oldResumeContainer =
              document.getElementById("old-resume-preview")
            if (oldResumeContainer) {
              // Check if we have cached content for this resume
              if (
                baseResumeCache.url === previewUrls.oldResume &&
                baseResumeCache.renderedHTML
              ) {
                const cacheHitTime = performance.now()
                console.log(
                  `⚡ Using cached base resume - instant load! (${Math.round(
                    cacheHitTime - startTime
                  )}ms)`
                )

                if (
                  baseResumeCache.renderedHTML === "DOCX_FILE_NEEDS_RENDERING"
                ) {
                  // This is a DOCX file that needs docx-preview rendering
                  oldResumeContainer.innerHTML =
                    '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-purple-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering original resume...</p></div>'

                  // Proceed with normal DOCX rendering
                  try {
                    const oldResumeResponse = await fetch(previewUrls.oldResume)
                    const oldResumeArrayBuffer =
                      await oldResumeResponse.arrayBuffer()

                    oldResumeContainer.innerHTML = ""
                    oldResumeContainer.className = isOriginalResumeScrollable
                      ? "docx-wrapper horizontal-scroll w-full h-full overflow-x-auto overflow-y-auto bg-white p-4"
                      : "docx-wrapper w-full h-full overflow-auto bg-white p-4"

                    await renderAsync(
                      oldResumeArrayBuffer,
                      oldResumeContainer,
                      undefined,
                      {
                        className: "docx-content",
                        inWrapper: false,
                        ignoreWidth: isOriginalResumeScrollable ? true : false,
                        ignoreHeight: false,
                        ignoreFonts: false,
                        breakPages: false,
                        ignoreLastRenderedPageBreak: true,
                        experimental: false,
                        trimXmlDeclaration: true
                      }
                    )
                  } catch (renderError) {
                    console.error(
                      "Error rendering cached DOCX resume:",
                      renderError
                    )
                    oldResumeContainer.innerHTML =
                      '<div class="flex items-center justify-center h-full bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render original resume</p><p class="text-sm mt-1">Please try uploading the file again</p></div></div>'
                  }
                } else {
                  // Use cached HTML directly (for PDFs and S3 URLs)
                  oldResumeContainer.innerHTML = baseResumeCache.renderedHTML
                }
                return // Skip the normal rendering process
              }

              // No cache available, show loading and proceed with normal rendering
              console.log(
                "🔄 No cache available, rendering base resume fresh..."
              )
              oldResumeContainer.innerHTML =
                '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-purple-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering original resume...</p></div>'

              try {
                // Check if it's an S3 URL (http/https)
                if (previewUrls.oldResume.startsWith("http")) {
                  // Handle S3 URLs - the iframe is already handled in the JSX above
                  // Just set a simple message since iframe handles the rendering
                  oldResumeContainer.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gray-50">
                      <div class="text-center p-6">
                        <div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-purple-600 mb-3" role="status"></div>
                        <p class="text-sm text-gray-600">Loading original resume from S3...</p>
                      </div>
                    </div>`
                  // Note: The actual iframe rendering is handled in the JSX template above
                  return
                }
                // Check if it's a data URL (uploaded file) or blob URL
                else if (previewUrls.oldResume.startsWith("data:")) {
                  // Handle different file types from uploaded files
                  const uploadedFileData =
                    localStorage.getItem("uploadedResumeFile")
                  if (uploadedFileData) {
                    const fileData = JSON.parse(uploadedFileData)

                    if (
                      fileData.type === "application/pdf" ||
                      fileData.name.toLowerCase().endsWith(".pdf")
                    ) {
                      // Handle PDF files
                      oldResumeContainer.innerHTML = `
                        <div class="w-full h-full flex flex-col bg-white">
                          <div class="p-3 bg-purple-50 border-b text-xs text-purple-700 flex-shrink-0 rounded-t">
                            <span class="font-medium">📄 PDF Preview - ${fileData.name}</span>
                          </div>
                          <div class="flex-1 overflow-hidden">
                            <iframe src="${previewUrls.oldResume}" width="100%" height="100%" frameborder="0" class="w-full h-full border-0">
                              <p class="p-4 text-center text-gray-500">Your browser does not support PDFs. 
                              <a href="${previewUrls.oldResume}" download="${fileData.name}" class="text-purple-600 underline">Download the PDF</a>
                              to view it.</p>
                            </iframe>
                          </div>
                        </div>`
                    } else if (
                      fileData.type.includes("wordprocessingml") ||
                      fileData.name.toLowerCase().endsWith(".docx")
                    ) {
                      // Handle DOCX files
                      const oldResumeResponse = await fetch(
                        previewUrls.oldResume
                      )
                      const oldResumeArrayBuffer =
                        await oldResumeResponse.arrayBuffer()

                      oldResumeContainer.innerHTML = ""
                      oldResumeContainer.className = isOriginalResumeScrollable
                        ? "docx-wrapper horizontal-scroll w-full h-full overflow-x-auto overflow-y-auto bg-white p-4"
                        : "docx-wrapper w-full h-full overflow-auto bg-white p-4"

                      await renderAsync(
                        oldResumeArrayBuffer,
                        oldResumeContainer,
                        undefined,
                        {
                          className: "docx-content",
                          inWrapper: false,
                          ignoreWidth: isOriginalResumeScrollable
                            ? true
                            : false,
                          ignoreHeight: false,
                          ignoreFonts: false,
                          breakPages: false,
                          ignoreLastRenderedPageBreak: true,
                          experimental: false,
                          trimXmlDeclaration: true
                        }
                      )
                    } else {
                      // Handle text files or other formats
                      oldResumeContainer.innerHTML = `
                        <div class="w-full h-full flex flex-col bg-white rounded">
                          <div class="p-3 bg-gray-50 border-b text-sm text-gray-700 flex-shrink-0 rounded-t">
                            <span class="font-medium">📄 ${fileData.name}</span>
                            <span class="ml-2 text-xs text-gray-500">(${
                              fileData.size
                                ? Math.round(fileData.size / 1024) + "KB"
                                : "Unknown size"
                            })</span>
                          </div>
                          <div class="flex-1 overflow-auto p-4">
                            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">${
                              baseResumeContent ||
                              "File content not available for preview"
                            }</pre>
                          </div>
                        </div>`
                    }
                  }
                } else {
                  // Handle blob URLs (generated DOCX files)
                  const oldResumeResponse = await fetch(previewUrls.oldResume)
                  const oldResumeArrayBuffer =
                    await oldResumeResponse.arrayBuffer()

                  oldResumeContainer.innerHTML = ""
                  oldResumeContainer.className = isOriginalResumeScrollable
                    ? "docx-wrapper horizontal-scroll w-full h-full overflow-x-auto overflow-y-auto bg-white p-4"
                    : "docx-wrapper w-full h-full overflow-auto bg-white p-4"

                  await renderAsync(
                    oldResumeArrayBuffer,
                    oldResumeContainer,
                    undefined,
                    {
                      className: "docx-content",
                      inWrapper: false,
                      ignoreWidth: isOriginalResumeScrollable ? true : false,
                      ignoreHeight: false,
                      ignoreFonts: false,
                      breakPages: false,
                      ignoreLastRenderedPageBreak: true,
                      experimental: false,
                      trimXmlDeclaration: true
                    }
                  )
                }
              } catch (renderError) {
                console.error("Error rendering old resume:", renderError)
                oldResumeContainer.innerHTML =
                  '<div class="flex items-center justify-center h-full bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render original resume</p><p class="text-sm mt-1">Please try uploading the file again</p></div></div>'
              }
            }
          }
        } catch (error) {
          console.error("Error rendering DOCX files:", error)
          // Show error in containers
          const newResumeContainer =
            document.getElementById("new-resume-preview")
          const oldResumeContainer =
            document.getElementById("old-resume-preview")

          if (newResumeContainer) {
            newResumeContainer.innerHTML =
              '<div class="flex items-center justify-center h-full min-h-[200px] bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render tailored resume</p><p class="text-sm mt-1">Please try generating the resume again</p></div></div>'
          }
          if (oldResumeContainer && previewUrls.oldResume) {
            oldResumeContainer.innerHTML =
              '<div class="flex items-center justify-center h-full min-h-[200px] bg-red-50"><div class="text-center p-4 text-red-600"><p class="font-medium">Failed to render original resume</p><p class="text-sm mt-1">Please check the file format and try again</p></div></div>'
          }
        }
      }
    }

    if (previewModalOpen) {
      // Small delay to ensure DOM elements are ready
      setTimeout(renderDocxFiles, 200)
    }
  }, [
    previewModalOpen,
    previewUrls,
    isOriginalResumeScrollable,
    baseResumeCache
  ])

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem("resumeGenerationData")
    if (savedData) {
      const data = JSON.parse(savedData)

      // Load jobs
      if (data.jobs && Array.isArray(data.jobs)) {
        setJobs(
          data.jobs.map((job: any) => {
            // If job has resume content or URL, mark it as completed
            const hasResumeData = job.resumeContent || job.resumeUrl
            return {
              ...job,
              status: hasResumeData
                ? ("completed" as const)
                : ("pending" as const),
              progress: hasResumeData ? 100 : 0,
              // Preserve any existing resumeContent and resumeUrl if the job was previously completed
              resumeContent: job.resumeContent || undefined,
              resumeUrl: job.resumeUrl || undefined
            }
          })
        )
      }

      // Load other important data
      if (data.baseResumeContent) {
        setBaseResumeContent(data.baseResumeContent)
      }
      if (data.yearsOfExperience) {
        setYearsOfExperience(data.yearsOfExperience)
      }
      if (data.language) {
        setLanguage(data.language)
      }
    }

    // Load uploaded resume file from localStorage
    const uploadedFileData = localStorage.getItem("uploadedResumeFile")
    if (uploadedFileData) {
      try {
        const fileData = JSON.parse(uploadedFileData)
        // Set the base resume file URL for preview (this is already a data URL)
        setBaseResumeFile(fileData.content)
        console.log(
          "Loaded resume file from localStorage for preview:",
          fileData.name
        )
      } catch (error) {
        console.error(
          "Error loading uploaded resume file from localStorage:",
          error
        )
      }
    } else if (baseResumeS3Url) {
      // Use S3 URL if available (preferred for existing sessions)
      setBaseResumeFile(baseResumeS3Url)
      console.log("Using S3 URL for original resume preview:", baseResumeS3Url)
    } else if (baseResumeContent) {
      // Fallback: Create DOCX version of original resume for preview if no uploaded file or S3 URL
      createOriginalResumeFile(baseResumeContent).then((fileUrl) => {
        if (fileUrl) {
          setBaseResumeFile(fileUrl)
        }
      })
    }

    // Also load any previously generated resumes from persistent storage
    const previousResumes = localStorage.getItem("generatedResumes")
    if (previousResumes) {
      try {
        const parsedResumes = JSON.parse(previousResumes)
        const resumeHistory = Array.isArray(parsedResumes) ? parsedResumes : []

        // Merge with current jobs if they have matching IDs or company names
        setJobs((prevJobs) =>
          prevJobs.map((job) => {
            const previousResult = resumeHistory.find(
              (prev: any) =>
                prev.jobId === job.id ||
                (prev.jobTitle === job.jobTitle &&
                  prev.company === extractCompanyFromUrl(job.companyUrl))
            )

            if (
              previousResult &&
              (previousResult.resumeUrl || previousResult.resumeContent)
            ) {
              return {
                ...job,
                status: "completed" as const,
                progress: 100,
                resumeUrl: previousResult.resumeUrl,
                resumeContent: previousResult.resumeContent
              }
            }
            return job
          })
        )
      } catch (error) {
        console.error("Error loading previous resumes:", error)
      }
    }
  }, [baseResumeS3Url])

  // Effect to manage visibility of docx-preview content when diff highlighting is toggled
  useEffect(() => {
    console.log("🎯 Diff highlighting visibility effect triggered:", {
      showDiffHighlighting,
      previewModalOpen
    })

    if (previewModalOpen) {
      // Get all docx-related containers
      const oldResumePreview = document.getElementById("old-resume-preview")
      const newResumePreview = document.getElementById("new-resume-preview")

      if (showDiffHighlighting) {
        // Hide docx-preview content when showing diff highlighting
        console.log("🔍 Hiding docx-preview content for diff view")

        if (oldResumePreview) {
          oldResumePreview.style.display = "none"
        }
        if (newResumePreview) {
          newResumePreview.style.display = "none"
        }
      } else {
        // Show docx-preview content when not showing diff highlighting
        console.log("👁️ Showing docx-preview content for normal view")

        if (oldResumePreview) {
          oldResumePreview.style.display = ""
        }
        if (newResumePreview) {
          newResumePreview.style.display = ""
        }
      }
    }
  }, [showDiffHighlighting, previewModalOpen])

  // Effect to pre-render and cache base resume for instant preview loading
  useEffect(() => {
    const preRenderBaseResume = async () => {
      // Create a cache key based on the current base resume source AND session ID
      const baseCacheKey =
        baseResumeS3Url ||
        baseResumeFile ||
        (baseResumeContent
          ? "content-" + baseResumeContent.substring(0, 50)
          : null)

      // Include session information in the cache key to ensure session-specific caching
      const cacheKey = baseCacheKey
        ? `${baseCacheKey}-session-${sessionId}`
        : null

      // Skip if no resume available or already cached
      if (!cacheKey || baseResumeCache.lastCacheKey === cacheKey) {
        return
      }

      // Skip if already rendering
      if (baseResumeCache.isRendering) {
        return
      }

      console.log(
        "🎯 Pre-rendering base resume for cache, key:",
        cacheKey.substring(0, 50) + "..."
      )

      setBaseResumeCache((prev) => ({
        ...prev,
        isRendering: true
      }))

      try {
        let resumeUrl = baseResumeS3Url || baseResumeFile

        // If we only have content, create a file URL
        if (!resumeUrl && baseResumeContent) {
          resumeUrl = await createOriginalResumeFile(baseResumeContent)
        }

        if (!resumeUrl) {
          console.log("❌ No resume URL available for caching")
          setBaseResumeCache((prev) => ({
            ...prev,
            isRendering: false
          }))
          return
        }

        let renderedHTML = ""

        // Handle different resume types for caching
        if (resumeUrl.startsWith("http")) {
          // S3 URLs - cache the iframe HTML
          renderedHTML = `
            <iframe
              src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                resumeUrl
              )}"
              class="w-full h-full min-h-[400px] border-0"
              title="Original Resume Preview"
              onError="this.style.display='none'; this.nextElementSibling.style.display='block';"
            ></iframe>
            <div style="display: none;" class="flex items-center justify-center h-full">
              <div class="text-center p-6">
                <svg class="h-16 w-16 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-sm font-medium mb-2">Original Resume (S3)</p>
                <a href="${resumeUrl}" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Open Original Resume
                </a>
              </div>
            </div>`
        } else if (resumeUrl.startsWith("data:")) {
          // Handle uploaded files
          const uploadedFileData = localStorage.getItem("uploadedResumeFile")
          if (uploadedFileData) {
            const fileData = JSON.parse(uploadedFileData)

            if (
              fileData.type === "application/pdf" ||
              fileData.name.toLowerCase().endsWith(".pdf")
            ) {
              renderedHTML = `
                <div class="w-full h-full flex flex-col bg-white">
                  <div class="p-3 bg-purple-50 border-b text-xs text-purple-700 flex-shrink-0 rounded-t">
                    <span class="font-medium">📄 PDF Preview - ${fileData.name}</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <iframe src="${resumeUrl}" width="100%" height="100%" frameborder="0" class="w-full h-full border-0">
                      <p class="p-4 text-center text-gray-500">Your browser does not support PDFs. 
                      <a href="${resumeUrl}" download="${fileData.name}" class="text-purple-600 underline">Download the PDF</a>
                      to view it.</p>
                    </iframe>
                  </div>
                </div>`
            } else {
              // For DOCX and other files, we'll render them on demand since they need docx-preview
              renderedHTML = "DOCX_FILE_NEEDS_RENDERING"
            }
          }
        } else {
          // Blob URLs (generated files) - also need docx-preview rendering
          renderedHTML = "DOCX_FILE_NEEDS_RENDERING"
        }

        console.log("✅ Base resume cached successfully")
        setBaseResumeCache({
          url: resumeUrl,
          renderedHTML,
          isRendering: false,
          lastCacheKey: cacheKey
        })
      } catch (error) {
        console.error("❌ Error caching base resume:", error)
        setBaseResumeCache((prev) => ({
          ...prev,
          isRendering: false
        }))
      }
    }

    preRenderBaseResume()
  }, [baseResumeS3Url, baseResumeFile, baseResumeContent, sessionId])

  // Cleanup effect to revoke blob URLs and clear cache on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up base resume cache on unmount")
      if (baseResumeCache.url && baseResumeCache.url.startsWith("blob:")) {
        URL.revokeObjectURL(baseResumeCache.url)
      }
    }
  }, [baseResumeCache.url])

  // Helper function to clear base resume cache
  const clearBaseResumeCache = () => {
    console.log("🗑️ Clearing base resume cache")
    setBaseResumeCache({
      url: null,
      renderedHTML: null,
      isRendering: false,
      lastCacheKey: null
    })
  }

  // Helper function to create DOCX file from original resume content
  const createOriginalResumeFile = async (
    content: string
  ): Promise<string | null> => {
    try {
      // Try to extract basic info from the text content
      const lines = content.split("\n").filter((line) => line.trim())
      let fullName = "Resume Holder"
      let email = ""
      let phone = ""
      let location = ""

      // Simple extraction logic - look for name in first few lines
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim()
        if (
          line &&
          !line.includes("@") &&
          !line.includes("phone") &&
          !line.includes("tel") &&
          line.length > 5 &&
          line.length < 50
        ) {
          // Likely a name if it's not too long and doesn't contain email/phone indicators
          if (
            !line.toLowerCase().includes("resume") &&
            !line.toLowerCase().includes("cv")
          ) {
            fullName = line
            break
          }
        }
      }

      // Extract contact info
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/)
      if (emailMatch) email = emailMatch[0]

      const phoneMatch = content.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/)
      if (phoneMatch) phone = phoneMatch[0]

      // Convert plain text resume to structured format for the modern generator
      const basicResumeData = {
        full_name: fullName,
        source_content_analysis: {
          has_email: !!email,
          has_phone: !!phone,
          has_location: !!location,
          has_linkedin: content.toLowerCase().includes("linkedin"),
          has_github: content.toLowerCase().includes("github"),
          has_social_links: false,
          has_relocation_willingness: false,
          has_skills: content.toLowerCase().includes("skill"),
          has_work_experience:
            content.toLowerCase().includes("experience") ||
            content.toLowerCase().includes("work"),
          has_education:
            content.toLowerCase().includes("education") ||
            content.toLowerCase().includes("university") ||
            content.toLowerCase().includes("college"),
          has_certifications:
            content.toLowerCase().includes("certification") ||
            content.toLowerCase().includes("certified"),
          has_projects: content.toLowerCase().includes("project"),
          has_languages: content.toLowerCase().includes("language"),
          has_awards: content.toLowerCase().includes("award"),
          has_professional_summary:
            content.toLowerCase().includes("summary") ||
            content.toLowerCase().includes("objective")
        },
        contact_information: {
          email: email || undefined,
          phone: phone || undefined,
          location: location || undefined,
          social_links: []
        },
        professional_summary:
          content.length > 300 ? content.substring(0, 300) + "..." : content,
        skills: ["Skills from original resume"],
        work_experience: [
          {
            job_title: "Experience from Original Resume",
            company: "See Original Resume",
            responsibilities: [
              content.length > 100 ? content.substring(0, 100) + "..." : content
            ]
          }
        ],
        education: [
          {
            degree: "Education from Original Resume",
            institution: "See Original Resume Details"
          }
        ]
      }

      const doc = generateModernResumeDocx(basicResumeData)
      const buffer = await Packer.toBlob(doc)
      return URL.createObjectURL(buffer)
    } catch (error) {
      console.error("Error creating original resume DOCX:", error)
      return null
    }
  }

  // Helper function to extract company name from URL
  const extractCompanyFromUrl = (url: string): string => {
    try {
      const domain = url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0]
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      return ""
    }
  }

  // Helper function to create a readable preview text from structured data
  const createResumePreviewText = (data: TailoredResumeData): string => {
    // Defensive check for full_name
    const fullName = data.full_name || "Resume Holder"
    let text = `${fullName.toUpperCase()}\n`
    text += "=".repeat(fullName.length) + "\n\n"

    // Contact Information
    const contactInfo: string[] = []
    if (data.contact_information?.email)
      contactInfo.push(`Email: ${data.contact_information.email}`)
    if (data.contact_information?.phone)
      contactInfo.push(`Phone: ${data.contact_information.phone}`)
    if (data.contact_information?.location)
      contactInfo.push(`Location: ${data.contact_information.location}`)
    if (data.contact_information?.linkedin)
      contactInfo.push(`LinkedIn: ${data.contact_information.linkedin}`)
    if (data.contact_information?.github)
      contactInfo.push(`GitHub: ${data.contact_information.github}`)
    if (data.contact_information?.website)
      contactInfo.push(`Website: ${data.contact_information.website}`)
    if (data.contact_information?.social_links) {
      data.contact_information.social_links.forEach((link) => {
        if (link.platform && link.url) {
          contactInfo.push(`${link.platform}: ${link.url}`)
        }
      })
    }

    if (contactInfo.length > 0) {
      text += contactInfo.join(" | ") + "\n\n"
    }

    // Professional Summary
    if (data.professional_summary) {
      text += "PROFESSIONAL SUMMARY\n"
      text += "-".repeat(20) + "\n"
      text += data.professional_summary + "\n\n"
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      text += "CORE COMPETENCIES\n"
      text += "-".repeat(17) + "\n"
      text += data.skills.join(" • ") + "\n\n"
    }

    // Work Experience
    if (data.work_experience && data.work_experience.length > 0) {
      text += "PROFESSIONAL EXPERIENCE\n"
      text += "-".repeat(23) + "\n"
      data.work_experience.forEach((job) => {
        if (job.job_title || job.company) {
          text += `${job.job_title || "Position"} | ${
            job.company || "Company"
          }\n`
          const details: any = []
          if (job.location) details.push(job.location)
          if (job.start_date && job.end_date) {
            details.push(`${job.start_date} - ${job.end_date}`)
          } else if (job.start_date) {
            details.push(`${job.start_date} - Present`)
          }
          if (details.length > 0) {
            text += details.join(" | ") + "\n"
          }
          if (job.responsibilities && job.responsibilities.length > 0) {
            job.responsibilities.forEach((resp) => {
              text += `• ${resp}\n`
            })
          }
          text += "\n"
        }
      })
    }

    // Education
    if (data.education && data.education.length > 0) {
      text += "EDUCATION\n"
      text += "-".repeat(9) + "\n"
      data.education.forEach((edu) => {
        if (edu.degree || edu.institution) {
          text += `${edu.degree || "Degree"}\n`
          text += `${edu.institution || "Institution"}`
          if (edu.location) text += ` - ${edu.location}`
          text += "\n"
          if (edu.start_year && edu.end_year) {
            text += `${edu.start_year} - ${edu.end_year}\n`
          } else if (edu.start_year) {
            text += `${edu.start_year}\n`
          }
          if (edu.additional_details) {
            text += `${edu.additional_details}\n`
          }
          text += "\n"
        }
      })
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      text += "CERTIFICATIONS\n"
      text += "-".repeat(14) + "\n"
      data.certifications.forEach((cert) => {
        if (cert.name) {
          text += `• ${cert.name}`
          if (cert.issuer) text += ` - ${cert.issuer}`
          if (cert.year) text += ` (${cert.year})`
          text += "\n"
        }
      })
      text += "\n"
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
      text += "KEY PROJECTS\n"
      text += "-".repeat(12) + "\n"
      data.projects.forEach((project) => {
        if (project.title) {
          text += `• ${project.title}`
          if (project.description) text += `: ${project.description}`
          text += "\n"
        }
      })
      text += "\n"
    }

    // Languages
    if (data.languages && data.languages.length > 0) {
      text += "LANGUAGES\n"
      text += "-".repeat(9) + "\n"
      data.languages.forEach((lang) => {
        if (lang.language) {
          text += `• ${lang.language}`
          if (lang.proficiency) text += `: ${lang.proficiency}`
          text += "\n"
        }
      })
      text += "\n"
    }

    // Awards
    if (data.awards && data.awards.length > 0) {
      text += "AWARDS & HONORS\n"
      text += "-".repeat(15) + "\n"
      data.awards.forEach((award) => {
        if (award.title) {
          text += `• ${award.title}`
          if (award.issuer) text += ` - ${award.issuer}`
          if (award.year) text += ` (${award.year})`
          if (award.description) text += `\n  ${award.description}`
          text += "\n"
        }
      })
    }

    return text
  }

  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem("access_token")

  // Helper function for random resume score
  const getRandomBetween40And60 = () => {
    return Math.floor(Math.random() * (60 - 40 + 1)) + 40
  }

  // Background setup process for bulk generation
  const startBackgroundSetupProcess = async () => {
    // Check if already running to prevent multiple concurrent executions
    const store = useResumeGenerationStore.getState()
    if (store.backgroundProcessId) {
      console.log("⚠️ Background setup already running, skipping...")
      return
    }

    console.log(
      "🚀 Starting background setup process from InitializeResumeGeneration..."
    )

    const storeState = useResumeGenerationStore.getState()
    const validJobs = storeState.jobs
    const currentSessionId = storeState.sessionId
    const baseResumeContent = storeState.baseResumeContent
    const baseResumeFile = storeState.baseResumeFile
    const yearsOfExp = storeState.yearsOfExperience
    const lang = storeState.language

    if (!validJobs.length || !baseResumeContent || !baseResumeFile) {
      console.error("❌ Missing required data for background setup")
      return
    }

    const generateProcessId = `bg_generation_${Date.now()}`
    useResumeGenerationStore
      .getState()
      .setBackgroundProcessId(generateProcessId)

    try {
      // Step 1: Upload base resume to session
      console.log("📤 Uploading base resume to session...")
      useResumeGenerationStore
        .getState()
        .updateApiCallStatus("uploadResume", { status: "pending" })

      const formData = new FormData()
      formData.append("SESSION_ID", currentSessionId)
      formData.append("resumeText", baseResumeContent)
      formData.append("resume", baseResumeFile)

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
      useResumeGenerationStore
        .getState()
        .updateApiCallStatus("uploadResume", { status: "completed" })

      // Extract file info from upload response
      const fileInfo = uploadResult.data?.file_info || null
      if (!fileInfo) {
        throw new Error("File info not received from upload response")
      }

      // Step 2: Analyze resume score for each job and prepare enhanced job data
      console.log("📊 Analyzing resume scores for jobs...")
      const enhancedJobs: any[] = []

      // Global rate limit state to coordinate all API calls
      let isGloballyRateLimited = false
      let globalRateLimitWaitTime = 0

      // Helper function to make a single API call and check for rate limiting
      const makeAnalyzeScoreCall = async (
        job: any
      ): Promise<{
        score: number | null
        rateLimited: boolean
        waitTime: number
        error?: string
      }> => {
        try {
          console.log(`📊 Making API call for "${job.jobTitle}"`)

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
            if (analyzeResult.success && analyzeResult.data?.score) {
              console.log(
                `✅ Resume score analysis for "${job.jobTitle}":`,
                analyzeResult.data.score
              )
              return {
                score: analyzeResult.data.score,
                rateLimited: false,
                waitTime: 0
              }
            } else {
              console.log(
                `⚠️ No score returned for "${job.jobTitle}":`,
                analyzeResult
              )
              return {
                score: null,
                rateLimited: false,
                waitTime: 0,
                error: "No score in response"
              }
            }
          } else {
            // Try to parse error response to check for rate limiting
            let errorData: any = {}
            try {
              errorData = await analyzeResponse.json()
            } catch (parseError) {
              console.log("Could not parse error response as JSON")
            }

            // Check if this is a rate limit error
            if (
              analyzeResponse.status === 429 ||
              (errorData.msg && errorData.msg.includes("Rate limit exceeded"))
            ) {
              const waitTime = errorData.data?.wait_ms || 2000
              console.log(
                `🚫 Rate limit detected for "${job.jobTitle}". API requests must wait ${waitTime}ms`
              )

              return {
                score: null,
                rateLimited: true,
                waitTime: waitTime
              }
            } else {
              // Non-rate-limit error
              console.log(
                `❌ Failed to analyze resume score for "${job.jobTitle}":`,
                analyzeResponse.status,
                errorData.msg || "Unknown error"
              )
              return {
                score: null,
                rateLimited: false,
                waitTime: 0,
                error: errorData.msg || "API error"
              }
            }
          }
        } catch (networkError) {
          console.error(
            `Network error analyzing resume score for "${job.jobTitle}":`,
            networkError
          )
          return {
            score: null,
            rateLimited: false,
            waitTime: 0,
            error: "Network error"
          }
        }
      }

      // Process jobs sequentially with global rate limit coordination
      for (let i = 0; i < validJobs.length; i++) {
        const job = validJobs[i]

        console.log(
          `📊 Processing job ${i + 1}/${validJobs.length}: "${job.jobTitle}"`
        )

        // If we're globally rate limited, wait before making any call
        if (isGloballyRateLimited && globalRateLimitWaitTime > 0) {
          console.log(
            `⏸️ Global rate limit active. Waiting ${globalRateLimitWaitTime}ms before processing "${job.jobTitle}"...`
          )
          await new Promise((resolve) =>
            setTimeout(resolve, globalRateLimitWaitTime)
          )

          // Reset global rate limit state after waiting
          isGloballyRateLimited = false
          globalRateLimitWaitTime = 0
          console.log(
            "✅ Global rate limit wait complete. Resuming API calls..."
          )
        }

        // Make the API call
        const result = await makeAnalyzeScoreCall(job)

        // Check if we hit a rate limit
        if (result.rateLimited) {
          console.log(
            `🛑 Rate limit detected! Pausing all subsequent API calls and waiting ${result.waitTime}ms...`
          )

          // Set global rate limit state to pause subsequent calls
          isGloballyRateLimited = true
          globalRateLimitWaitTime = result.waitTime

          // Wait immediately for this rate limit
          await new Promise((resolve) => setTimeout(resolve, result.waitTime))

          // Reset global state after waiting
          isGloballyRateLimited = false
          globalRateLimitWaitTime = 0

          console.log(
            `🔄 Rate limit wait complete. Retrying "${job.jobTitle}"...`
          )

          // Retry this job after waiting
          const retryResult = await makeAnalyzeScoreCall(job)

          // Create enhanced job object with retry result
          const enhancedJob = {
            ...job,
            resumeScore: retryResult.score || getRandomBetween40And60(),
            language: lang,
            yearsOfExperience: yearsOfExp
          }
          enhancedJobs.push(enhancedJob)
        } else {
          // No rate limit, use the result directly
          const enhancedJob = {
            ...job,
            resumeScore: result.score || getRandomBetween40And60(),
            language: lang,
            yearsOfExperience: yearsOfExp
          }
          enhancedJobs.push(enhancedJob)
        }

        // Add small delay between successful calls (except for the last job)
        if (i < validJobs.length - 1 && !isGloballyRateLimited) {
          console.log("⏳ Waiting 1 second before next job analysis...")
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      // Step 3: Create a fresh session and save all jobs to avoid versioning conflicts
      console.log("💾 Creating fresh session and saving all jobs in bulk...")
      console.log("🔍 Debug info for bulk save:")
      console.log("  - Original Session ID:", currentSessionId)
      console.log("  - Number of enhanced jobs:", enhancedJobs.length)
      console.log("  - Enhanced jobs sample:", enhancedJobs.slice(0, 2))
      console.log("  - File info:", fileInfo)

      useResumeGenerationStore
        .getState()
        .updateApiCallStatus("saveJobs", { status: "pending" })

      // Generate a new session ID for this bulk operation to avoid conflicts
      const freshSessionId = `bulk_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`
      console.log(
        "🆕 Generated fresh session ID for bulk save:",
        freshSessionId
      )

      const requestPayload = {
        SESSION_ID: sessionId ?? freshSessionId, // Use fresh session to avoid versioning conflicts
        jobs: enhancedJobs, // Save all jobs in a single call
        fileInfo: fileInfo,
        resumeText: baseResumeContent,
        is_bulk_operation: true // Flag to indicate this is a bulk operation
      }

      console.log("📤 Request payload for bulk save:", {
        SESSION_ID: requestPayload.SESSION_ID,
        jobsCount: requestPayload.jobs.length,
        fileInfoPresent: !!requestPayload.fileInfo,
        resumeTextLength: requestPayload.resumeText?.length || 0
      })

      try {
        console.log("🚀 Making bulk save API call...")

        // Validate required data before making the call
        if (!currentSessionId) {
          throw new Error("Session ID is missing")
        }
        if (!enhancedJobs || enhancedJobs.length === 0) {
          throw new Error("No enhanced jobs to save")
        }
        if (!fileInfo) {
          throw new Error("File info is missing")
        }
        if (!baseResumeContent) {
          throw new Error("Base resume content is missing")
        }
        if (!getAuthToken()) {
          throw new Error("Authentication token is missing")
        }

        console.log("✅ All validations passed, proceeding with API call...")

        // Add a marker in the network tab
        console.log("🌐 NETWORK REQUEST STARTING - SaveJobsToSession")

        const saveJobsResponse = await fetch(
          `${BASE_URL}${API_ENDPOINTS.SaveJobsToSession}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(requestPayload)
          }
        )

        console.log("🌐 NETWORK REQUEST COMPLETED - SaveJobsToSession")

        console.log("📥 Bulk save response received:", {
          status: saveJobsResponse.status,
          statusText: saveJobsResponse.statusText,
          ok: saveJobsResponse.ok
        })

        if (!saveJobsResponse.ok) {
          const saveError = await saveJobsResponse.text()
          console.error("❌ Failed to save jobs to session:", {
            status: saveJobsResponse.status,
            statusText: saveJobsResponse.statusText,
            errorText: saveError
          })
          throw new Error(`Failed to save jobs to session: ${saveError}`)
        }

        const saveResult = await saveJobsResponse.json()
        console.log(
          `✅ Successfully saved all ${enhancedJobs.length} jobs to session:`,
          saveResult
        )

        // CRITICAL FIX: Update the store's session ID to the new session created by bulk save
        console.log(
          "🔍 CRITICAL: Updating store session ID from",
          useResumeGenerationStore.getState().sessionId,
          "to",
          freshSessionId
        )
        useResumeGenerationStore.getState().setSessionId(freshSessionId)
        console.log("🔍 CRITICAL: Store session ID updated successfully")

        // Additional debugging for the response
        if (saveResult && typeof saveResult === "object") {
          console.log("📊 Bulk save response analysis:", {
            success: saveResult.success,
            jobsProcessed: saveResult.data?.jobs_processed,
            jobsStored: saveResult.data?.jobs_stored,
            jobsFailed: saveResult.data?.jobs_failed,
            successRate: saveResult.data?.summary?.success_rate
          })

          if (saveResult.data?.jobs_failed > 0) {
            console.warn(
              "⚠️ Some jobs failed to save:",
              saveResult.data?.failed_jobs
            )
          }
        }
      } catch (error) {
        console.error("❌ Error in bulk job save operation:", error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save jobs to session"

        useResumeGenerationStore.getState().updateApiCallStatus("saveJobs", {
          status: "error",
          error: errorMessage
        })

        errorToast(`Failed to save jobs to session: ${errorMessage}`)
        throw error
      }

      useResumeGenerationStore
        .getState()
        .updateApiCallStatus("saveJobs", { status: "completed" })

      // Mark setup as complete - this will trigger resume generation
      console.log("✅ Setup complete - marking setupComplete as true")
      useResumeGenerationStore.getState().setSetupComplete(true)

      // Clear background process ID as setup is complete
      useResumeGenerationStore.getState().setBackgroundProcessId(null)

      // successToast(`Setup complete! Starting resume generation...`)
      refreshCredits()
    } catch (error) {
      console.error("Error in background setup process:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process jobs"

      useResumeGenerationStore.getState().updateApiCallStatus("uploadResume", {
        status: "error",
        error: errorMessage
      })
      useResumeGenerationStore.getState().updateApiCallStatus("saveJobs", {
        status: "error",
        error: errorMessage
      })
      useResumeGenerationStore
        .getState()
        .updateApiCallStatus("generateResumes", {
          status: "error",
          progress: 0,
          error: errorMessage
        })

      // Clear background process ID to allow future executions
      useResumeGenerationStore.getState().setBackgroundProcessId(null)

      errorToast(errorMessage)
    }
  }

  const startResumeGeneration = async () => {
    console.log("🚀 CRITICAL: startResumeGeneration called!")
    console.log("🔍 CRITICAL: Context:", {
      asBg,
      isNavigatedFromBulkGenerator,
      sessionIdFromRoute: sessionId,
      sessionIdFromStore: useResumeGenerationStore.getState().sessionId,
      currentSessionJobsLength: currentSessionJobs.length,
      storeJobsLength: useResumeGenerationStore.getState().jobs.length,
      selectedJobIds: Array.from(selectedJobIds),
      selectedJobsCount: selectedJobIds.size,
      timestamp: new Date().toISOString()
    })

    // Check if any jobs are selected (only for manual mode, not background mode)
    if ((!asBg || !isNavigatedFromBulkGenerator) && selectedJobIds.size === 0) {
      toast.error("Please select at least one job to generate resumes for")
      return
    }

    let jobsToProcess = currentSessionJobs

    // CRITICAL FIX: Ensure session ID consistency - use the same session ID from store if navigated from bulk generator
    let effectiveSessionId = sessionId
    if (asBg && isNavigatedFromBulkGenerator) {
      const storeSessionId = useResumeGenerationStore.getState().sessionId
      if (storeSessionId) {
        console.log(
          "🔍 CRITICAL: Using store session ID:",
          storeSessionId,
          "instead of route session ID:",
          sessionId
        )
        effectiveSessionId = storeSessionId
      } else {
        console.log(
          "🔍 CRITICAL: No store session ID found, using route session ID:",
          sessionId
        )
      }
    }

    // CRITICAL FIX: For auto-generation from bulk generator, ALWAYS use jobs from store directly
    // Don't rely on currentSessionJobs which might be contaminated with existing session data
    if (asBg && isNavigatedFromBulkGenerator) {
      console.log("� CRITICAL: Bulk mode detected, using store jobs only")
      const storeJobs = useResumeGenerationStore.getState().jobs
      console.log("� CRITICAL: Store jobs count:", storeJobs.length)
      console.log(
        "� CRITICAL: Current session jobs count:",
        currentSessionJobs.length
      )

      if (storeJobs.length > 0) {
        console.log("� CRITICAL: Setting jobsToProcess to store jobs")
        jobsToProcess = storeJobs
      } else {
        console.log("❌ CRITICAL: No jobs found in store for bulk generation")
        toast.error("No jobs found for bulk generation")
        return
      }
    }

    // CRITICAL: Determine which jobs to generate based on selection or pending status.
    // If specific jobs are selected, they should be regenerated regardless of their current status.
    const filteredJobs = getFilteredJobs() // CRITICAL FIX: Get the filtered jobs
    let pendingJobs
    if (selectedJobIds.size > 0) {
      // If jobs are manually selected, these are the jobs to process.
      const selectedJobs = filteredJobs.filter((job) =>
        selectedJobIds.has(job.generation_id)
      )
      console.log(
        `🎯 Regenerating ${selectedJobs.length} selected jobs.`,
        selectedJobs.map((j) => j.generation_id)
      )
      pendingJobs = selectedJobs
    } else {
      // If no jobs are selected, process all jobs that are not yet completed or failed.
      const uncompletedJobs = filteredJobs.filter(
        (job) =>
          job.generation_metadata.generation_status !== "completed" &&
          job.generation_metadata.generation_status !== "failed"
      )
      console.log(`🎯 Generating all pending jobs: ${uncompletedJobs.length}`)
      pendingJobs = uncompletedJobs
    }

    console.log(
      `⏳ Total jobs for this generation cycle: ${pendingJobs.length}`
    )

    if (pendingJobs.length === 0) {
      // This can happen if no jobs are selected and all are completed.
      errorToast("No pending jobs found for resume generation.")
      // Reset button state if nothing to do
      setIsGenerating(false)
      return
    }

    if (!baseResumeContent) {
      console.log("❌ CRITICAL: No base resume content")
      toast.error("Please upload a base resume first")
      return
    }

    console.log("✅ Validation passed, calling executeWithBulkCreditCheck...")
    console.log("🔍 About to call executeWithBulkCreditCheck with:", {
      pendingJobsCount: pendingJobs.length,
      actionType: "tailored_resume",
      hasBaseResumeContent: !!baseResumeContent,
      baseResumeContentLength: baseResumeContent?.length || 0
    })
    await executeWithBulkCreditCheck(
      pendingJobs,
      "tailored_resume",
      async () => {
        console.log(
          "🚀🚀🚀 BULK ACTION FUNCTION CALLED - RESUME GENERATION STARTING"
        )
        console.log("🔍 Action context:", {
          pendingJobsLength: pendingJobs.length,
          isGenerating: isGenerating,
          baseResumeContentLength: baseResumeContent?.length || 0,
          timestamp: new Date().toISOString()
        })

        setIsGenerating(true)
        setOverallProgress(0)

        try {
          console.log(
            `Starting bulk resume generation for ${pendingJobs.length} jobs from bulk generator`
          )

          // Process jobs sequentially to avoid overwhelming the API
          let completedCount = 0
          const totalJobs = pendingJobs.length

          for (const jobData of pendingJobs) {
            try {
              console.log(
                `🔄 Processing job ${completedCount + 1}/${totalJobs}: ${
                  jobData.job_details.job_title
                } at ${jobData.job_details.company_name}`
              )
              console.log(`📋 Job data structure:`, jobData)
              console.log(
                `📋 Job description:`,
                jobData.job_details.job_description
              )

              // Determine the correct session ID to use for this specific job
              let jobSessionId

              if (asBg) {
                // In background mode, prioritize the session ID from the URL
                jobSessionId = sessionId
                console.log(
                  "🔍 Background mode: Using URL session ID:",
                  jobSessionId
                )
              } else {
                // When running from selection, prioritize the job-specific session ID
                jobSessionId = jobData.session_id || sessionId
                console.log(
                  "🔍 Selection mode: Using job-specific session ID:",
                  jobSessionId,
                  "fallback to URL:",
                  sessionId
                )
              }

              // Update job status to generating
              if (jobData.type === "current") {
                setCurrentSessionJobs((prevJobs) =>
                  prevJobs.map((job) =>
                    job.generation_id === jobData.generation_id
                      ? {
                          ...job,
                          generation_metadata: {
                            ...job.generation_metadata,
                            generation_status: "generating"
                          }
                        }
                      : job
                  )
                )
              } else if (jobData.type === "previous") {
                // Update previous sessions state for jobs from previous sessions
                setPreviousSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.session_id === jobData.session_id
                      ? {
                          ...session,
                          generated_resumes:
                            session.generated_resumes?.map((job) =>
                              job.generation_id === jobData.generation_id
                                ? {
                                    ...job,
                                    generation_metadata: {
                                      ...job.generation_metadata,
                                      generation_status: "generating"
                                    }
                                  }
                                : job
                            ) || []
                        }
                      : session
                  )
                )
              }

              // Add job to processing set
              setProcessingJobIds((prev) =>
                new Set(prev).add(jobData.generation_id)
              )

              // Determine the correct base resume content for this specific job's session (same logic as individual generation)
              let jobBaseResumeContent = baseResumeContent

              // If we have session data, try to get the base resume from the job's parent session
              if (sessionData) {
                // First check current session
                if (
                  sessionData.current_session?.session_id === jobData.session_id
                ) {
                  jobBaseResumeContent =
                    sessionData.current_session?.base_resume?.resume_text ||
                    baseResumeContent
                }
                // Then check previous sessions
                else if (sessionData.previous_sessions?.length > 0) {
                  const parentSession = sessionData.previous_sessions.find(
                    (session: any) => session.session_id === jobData.session_id
                  )
                  if (parentSession?.base_resume?.resume_text) {
                    jobBaseResumeContent = parentSession.base_resume.resume_text
                  } else {
                    // Fallback to first available session's base resume
                    const firstSession = sessionData.previous_sessions[0]
                    if (firstSession?.base_resume?.resume_text) {
                      jobBaseResumeContent =
                        firstSession.base_resume.resume_text
                    }
                  }
                }
              }

              console.log(
                `🔍 CRITICAL: API CALL for job: ${jobData.job_details.job_title}`
              )
              console.log(`🔍 CRITICAL: Job session ID:`, jobData.session_id)
              console.log(`🔍 CRITICAL: Using session ID:`, jobSessionId)

              const response = await postRequest(
                API_ENDPOINTS.GenerateAIResume,
                {
                  SESSION_ID: jobSessionId,
                  job_title: jobData.job_details.job_title,
                  job_description:
                    jobData.job_details.job_description ||
                    jobData.job_details.description ||
                    "",
                  required_skills:
                    jobData.job_details.job_skills ||
                    (jobData.job_details.skills
                      ? jobData.job_details.skills
                          .split(",")
                          .map((s: string) => s.trim())
                      : []),
                  company_url:
                    jobData.job_details.company_url ||
                    jobData.job_details.companyUrl ||
                    "",
                  language: language || "en",
                  years_of_experience: yearsOfExperience,
                  resumeText: jobBaseResumeContent,
                  generation_id: jobData.generation_id || jobData.id,
                  // Add is_regenerating parameter for free regenerations
                  is_regenerating: shouldExcludeFromCredits(jobData)
                }
              )

              console.log(
                `🔍 CRITICAL: API CALL COMPLETED for job: ${jobData.job_details.job_title}, success: ${response.success}`
              )

              if (!response.success) {
                throw new Error(response.error || "Failed to generate resume")
              }

              const tailoredResumeData =
                response.data?.tailored_resume || response.data // Generate DOCX using modern generator
              const docxDocument = generateModernResumeDocx(tailoredResumeData)
              const docxBlob = await Packer.toBlob(docxDocument)
              const docxUrl = URL.createObjectURL(docxBlob)

              // Create a readable preview text from the structured data
              const resumeText = createResumePreviewText(tailoredResumeData)

              // Update the job to completed
              if (jobData.type === "current") {
                setCurrentSessionJobs((prevJobs) =>
                  prevJobs.map((job) =>
                    job.generation_id === jobData.generation_id
                      ? {
                          ...job,
                          generated_resume: {
                            ...job.generated_resume,
                            has_resume_data: true,
                            resume_text: resumeText,
                            docx_url: docxUrl,
                            tailored_resume_data: tailoredResumeData
                          },
                          generation_metadata: {
                            ...job.generation_metadata,
                            generation_status: "completed"
                          }
                        }
                      : job
                  )
                )
              } else if (jobData.type === "previous") {
                // Update previous sessions state for jobs from previous sessions
                setPreviousSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.session_id === jobData.session_id
                      ? {
                          ...session,
                          generated_resumes:
                            session.generated_resumes?.map((job) =>
                              job.generation_id === jobData.generation_id
                                ? {
                                    ...job,
                                    generated_resume: {
                                      ...job.generated_resume,
                                      has_resume_data: true,
                                      resume_text: resumeText,
                                      docx_url: docxUrl,
                                      tailored_resume_data: tailoredResumeData
                                    },
                                    generation_metadata: {
                                      ...job.generation_metadata,
                                      generation_status: "completed"
                                    }
                                  }
                                : job
                            ) || []
                        }
                      : session
                  )
                )
              }

              // Remove job from processing set
              setProcessingJobIds((prev) => {
                const newSet = new Set(prev)
                newSet.delete(jobData.generation_id)
                return newSet
              })

              completedCount++
              console.log(
                `✅ Successfully completed job ${completedCount}/${totalJobs}`
              )
            } catch (error) {
              console.error(
                `❌ Failed to generate resume for ${jobData.job_details.job_title}:`,
                error
              )

              // Update job status to failed
              if (jobData.type === "current") {
                setCurrentSessionJobs((prevJobs) =>
                  prevJobs.map((job) =>
                    job.generation_id === jobData.generation_id
                      ? {
                          ...job,
                          generation_metadata: {
                            ...job.generation_metadata,
                            generation_status: "failed"
                          }
                        }
                      : job
                  )
                )
              } else if (jobData.type === "previous") {
                // Update previous sessions state for jobs from previous sessions
                setPreviousSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.session_id === jobData.session_id
                      ? {
                          ...session,
                          generated_resumes:
                            session.generated_resumes?.map((job) =>
                              job.generation_id === jobData.generation_id
                                ? {
                                    ...job,
                                    generation_metadata: {
                                      ...job.generation_metadata,
                                      generation_status: "failed"
                                    }
                                  }
                                : job
                            ) || []
                        }
                      : session
                  )
                )
              }

              // Remove job from processing set
              setProcessingJobIds((prev) => {
                const newSet = new Set(prev)
                newSet.delete(jobData.generation_id)
                return newSet
              })

              toast.error(
                `Failed to generate resume for ${
                  jobData.job_details.job_title
                }: ${error instanceof Error ? error.message : "Unknown error"}`
              )
            }

            // Update progress
            const progressPercent = (completedCount / totalJobs) * 100
            setOverallProgress(progressPercent)

            // Update store progress
            useResumeGenerationStore
              .getState()
              .updateApiCallStatus("generateResumes", {
                status: "pending",
                progress: progressPercent
              })

            // Small delay between requests to avoid overwhelming the API
            if (completedCount < totalJobs) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }
          }

          // Final status summary
          const successCount = completedCount
          const errorCount = totalJobs - completedCount

          if (successCount > 0) {
            toast.success(`Successfully generated ${successCount} resume(s)`)
            refreshCredits() // Refresh credits after successful operation
          }
          if (errorCount > 0) {
            toast.error(`Failed to generate ${errorCount} resume(s)`)
          }

          // Update store to mark resume generation as completed
          useResumeGenerationStore
            .getState()
            .updateApiCallStatus("generateResumes", {
              status: "completed",
              progress: 100
            })
        } catch (error) {
          console.error("Error in bulk resume generation:", error)
          toast.error("Failed to start resume generation")

          // Update store to mark resume generation as failed
          useResumeGenerationStore
            .getState()
            .updateApiCallStatus("generateResumes", {
              status: "error",
              progress: 0,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to generate resumes"
            })
        } finally {
          console.log(
            "✅ Generation cycle finished. Refetching session data and credits..."
          )
          await refetchSessionDataAndWait() // Wait for fresh session data
          await refreshCredits() // Refresh credits
          console.log("✅ Session data and credits refetch completed.")

          setIsGenerating(false)
          setProcessingJobIds(new Set()) // Clear all processing job IDs
          setSelectedJobIds(new Set()) // Clear selected jobs after generation
          console.log("✅ UI state reset.")
        }
      }
    )

    localStorage.removeItem(SESSION_ID_KEY)
  }

  // Function to generate individual resume
  const generateIndividualResume = async (jobData: any) => {
    // Determine the correct session ID to use
    let correctSessionId = jobData.session_id || sessionId

    // If the URL session ID doesn't match and we have sessionData, try to get the correct one
    if (!jobData.session_id && sessionData?.previous_sessions?.length > 0) {
      // Use the session ID from the first available session
      correctSessionId =
        sessionData.previous_sessions[0]?.session_id || sessionId
      console.log("🔍 Using session ID from sessionData:", correctSessionId)
    }

    // Determine the correct base resume content for this specific job's session
    let jobBaseResumeContent = baseResumeContent

    // If we have session data, try to get the base resume from the job's parent session
    if (sessionData) {
      // First check current session
      if (sessionData.current_session?.session_id === correctSessionId) {
        jobBaseResumeContent =
          sessionData.current_session?.base_resume?.resume_text ||
          baseResumeContent
        console.log(
          "� Using base resume from current session, length:",
          jobBaseResumeContent.length
        )
      }
      // Then check previous sessions
      else if (sessionData.previous_sessions?.length > 0) {
        const parentSession = sessionData.previous_sessions.find(
          (session: any) => session.session_id === correctSessionId
        )
        if (parentSession?.base_resume?.resume_text) {
          jobBaseResumeContent = parentSession.base_resume.resume_text
          console.log(
            "📄 Using base resume from parent session:",
            correctSessionId,
            "length:",
            jobBaseResumeContent.length
          )
        } else {
          // Fallback to first available session's base resume
          const firstSession = sessionData.previous_sessions[0]
          if (firstSession?.base_resume?.resume_text) {
            jobBaseResumeContent = firstSession.base_resume.resume_text
            console.log(
              "📄 Using base resume from first available session:",
              firstSession.session_id,
              "length:",
              jobBaseResumeContent.length
            )
          }
        }
      }
    }

    // console.log("�🔍 Session ID debug for generation:", {
    //   jobDataSessionId: jobData.session_id,
    //   urlSessionId: sessionId,
    //   correctSessionId: correctSessionId,
    //   hasSessionData: !!sessionData,
    //   previousSessionsCount: sessionData?.previous_sessions?.length || 0,
    //   baseResumeLength: jobBaseResumeContent.length
    // })

    await executeWithCreditCheck(
      "tailored_resume",
      async () => {
        try {
          console.log(
            `🔄 Starting individual generation for: ${jobData.job_details.job_title} at ${jobData.job_details.company_name}`
          )

          // Update job status to generating
          if (jobData.type === "current") {
            setCurrentSessionJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.generation_id === jobData.generation_id
                  ? {
                      ...job,
                      generation_metadata: {
                        ...job.generation_metadata,
                        generation_status: "generating"
                      }
                    }
                  : job
              )
            )
          } else if (jobData.type === "previous") {
            // Update previous sessions state for jobs from previous sessions
            setPreviousSessions((prevSessions) =>
              prevSessions.map((session) =>
                session.session_id === jobData.session_id
                  ? {
                      ...session,
                      generated_resumes:
                        session.generated_resumes?.map((job) =>
                          job.generation_id === jobData.generation_id
                            ? {
                                ...job,
                                generation_metadata: {
                                  ...job.generation_metadata,
                                  generation_status: "generating"
                                }
                              }
                            : job
                        ) || []
                    }
                  : session
              )
            )
          }

          // Add job to processing set
          setProcessingJobIds((prev) =>
            new Set(prev).add(jobData.generation_id)
          )

          const requestPayload = {
            SESSION_ID: correctSessionId,
            generation_id:
              jobData.generation_id ||
              jobData.job_details.generation_id ||
              jobData.job_details.id,
            job_title: jobData.job_details.job_title,
            job_description:
              jobData.job_details.job_description ||
              jobData.job_details.description ||
              "",
            required_skills:
              jobData.job_details.job_skills ||
              (jobData.job_details.skills
                ? jobData.job_details.skills
                    .split(",")
                    .map((s: string) => s.trim())
                : []),
            company_url:
              jobData.job_details.company_url ||
              jobData.job_details.companyUrl ||
              "",
            language: language || "en",
            years_of_experience: yearsOfExperience,
            resumeText: jobBaseResumeContent,
            // Add is_regenerating parameter for free regenerations
            is_regenerating: shouldExcludeFromCredits(jobData)
          }

          console.log(
            `🌐 Making GenerateAIResume request for job: ${jobData.job_details.job_title}`,
            {
              endpoint: API_ENDPOINTS.GenerateAIResume,
              hasBaseResume: !!jobBaseResumeContent,
              baseResumeLength: jobBaseResumeContent?.length,
              payloadKeys: Object.keys(requestPayload)
            }
          )

          const result = await postRequest(
            API_ENDPOINTS.GenerateAIResume,
            requestPayload
          )

          console.log(`📥 GenerateAIResume response received:`, {
            success: result?.success,
            hasData: !!result?.data,
            resultKeys: result ? Object.keys(result) : []
          })

          if (!result.success) {
            throw new Error(result.error || "Failed to generate resume")
          }

          const tailoredResumeData = result.data?.tailored_resume || result.data

          // Generate DOCX using modern generator
          const docxDocument = generateModernResumeDocx(tailoredResumeData)
          const docxBlob = await Packer.toBlob(docxDocument)
          const docxUrl = URL.createObjectURL(docxBlob)

          // Create a readable preview text from the structured data
          const resumeText = createResumePreviewText(tailoredResumeData)

          // Update the job state to mark as completed
          if (jobData.type === "current") {
            setCurrentSessionJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.generation_id === jobData.generation_id
                  ? {
                      ...job,
                      generated_resume: {
                        ...job.generated_resume,
                        has_resume_data: true,
                        resume_text: resumeText,
                        docx_url: docxUrl,
                        tailored_resume_data: tailoredResumeData
                      },
                      generation_metadata: {
                        ...job.generation_metadata,
                        generation_status: "completed"
                      }
                    }
                  : job
              )
            )
          } else if (jobData.type === "previous") {
            // Update previous sessions state for jobs from previous sessions
            setPreviousSessions((prevSessions) =>
              prevSessions.map((session) =>
                session.session_id === jobData.session_id
                  ? {
                      ...session,
                      generated_resumes:
                        session.generated_resumes?.map((job) =>
                          job.generation_id === jobData.generation_id
                            ? {
                                ...job,
                                generated_resume: {
                                  ...job.generated_resume,
                                  has_resume_data: true,
                                  resume_text: resumeText,
                                  docx_url: docxUrl,
                                  tailored_resume_data: tailoredResumeData
                                },
                                generation_metadata: {
                                  ...job.generation_metadata,
                                  generation_status: "completed"
                                }
                              }
                            : job
                        ) || []
                    }
                  : session
              )
            )
          }

          // Remove job from processing set
          setProcessingJobIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(jobData.generation_id)
            return newSet
          })

          toast.success(
            `Successfully generated resume for ${jobData.job_details.job_title}`
          )
          refreshCredits() // Refresh credits after successful operation
          await refetchSessionDataAndWait() // Wait for fresh session data
        } catch (error) {
          console.error(
            `Error generating resume for ${jobData.job_details.job_title}:`,
            error
          )

          // Update job status to failed
          if (jobData.type === "current") {
            setCurrentSessionJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.generation_id === jobData.generation_id
                  ? {
                      ...job,
                      generation_metadata: {
                        ...job.generation_metadata,
                        generation_status: "failed"
                      }
                    }
                  : job
              )
            )
          } else if (jobData.type === "previous") {
            // Update previous sessions state for jobs from previous sessions
            setPreviousSessions((prevSessions) =>
              prevSessions.map((session) =>
                session.session_id === jobData.session_id
                  ? {
                      ...session,
                      generated_resumes:
                        session.generated_resumes?.map((job) =>
                          job.generation_id === jobData.generation_id
                            ? {
                                ...job,
                                generation_metadata: {
                                  ...job.generation_metadata,
                                  generation_status: "failed"
                                }
                              }
                            : job
                        ) || []
                    }
                  : session
              )
            )
          }

          // Remove job from processing set
          setProcessingJobIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(jobData.generation_id)
            return newSet
          })

          toast.error(
            `Failed to generate resume for ${jobData.job_details.job_title}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        }
      },
      correctSessionId,
      jobData
    )

    localStorage.removeItem(SESSION_ID_KEY)
  }

  // Function to extract text content from different file formats for diff highlighting
  const extractTextContent = async (
    fileUrl: string,
    fileType: "original" | "tailored"
  ): Promise<string> => {
    try {
      if (fileUrl.startsWith("http")) {
        // For S3 URLs, use the proxy endpoint to avoid CORS issues
        const isS3Url =
          fileUrl.includes("s3.amazonaws.com") ||
          fileUrl.includes("amazonaws.com")

        let fetchUrl = fileUrl
        if (isS3Url) {
          const encodedS3Url = encodeURIComponent(fileUrl)
          fetchUrl = `${
            import.meta.env.VITE_APP_BASE_URL || "http://localhost:3001"
          }/api/ai-resume-tailor/stream-s3-file?url=${encodedS3Url}`
          console.log("📄 Using proxy URL for text extraction:", fetchUrl)
        }

        const response = await fetch(fetchUrl)
        const blob = await response.blob()

        if (
          blob.type.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          // DOCX file
          const arrayBuffer = await blob.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          return result.value
        } else if (blob.type.includes("text/")) {
          // Text file
          return await blob.text()
        }
      } else if (fileUrl.startsWith("blob:")) {
        // Local blob URL
        const response = await fetch(fileUrl)
        const blob = await response.blob()

        if (
          blob.type.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          // DOCX file
          const arrayBuffer = await blob.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          return result.value
        } else if (blob.type.includes("text/")) {
          // Text file
          return await blob.text()
        }
      }

      return ""
    } catch (error) {
      console.error(`Error extracting text content for ${fileType}:`, error)
      return ""
    }
  }

  // Function to preview individual resume from session data
  const previewIndividualResume = async (jobData: any) => {
    try {
      console.log(
        "🔍 Preview function called with baseResumeS3Url:",
        baseResumeS3Url
      )
      console.log(
        "🔍 Preview function called with baseResumeContent length:",
        baseResumeContent?.length || 0
      )
      console.log(
        "🔍 Preview function called with baseResumeFile:",
        !!baseResumeFile
      )

      // PERFORMANCE FIX: Open modal immediately to improve responsiveness
      setPreviewJobId(jobData.generation_id)
      setCurrentPreviewJobData(jobData)
      setPreviewModalOpen(true)

      // Clear previous URLs to show loading state
      setPreviewUrls({
        oldResume: null,
        newResume: null
      })
      setOriginalResumeText("")
      setTailoredResumeText("")

      // Process documents in the background after modal is open
      const processDocumentsInBackground = async () => {
        try {
          // Check if this job belongs to a different session and invalidate cache if needed
          const jobSessionId = jobData.session_id || sessionId
          const currentCachedSessionId = baseResumeCache.lastCacheKey?.includes(
            "session-"
          )
            ? baseResumeCache.lastCacheKey.split("session-")[1]?.split("-")[0]
            : null

          console.log("🔍 Session check for cache invalidation:", {
            jobSessionId,
            currentCachedSessionId,
            currentSessionId: sessionId,
            needsInvalidation:
              currentCachedSessionId && currentCachedSessionId !== jobSessionId,
            cacheKey: baseResumeCache.lastCacheKey
          })

          // Invalidate cache if the job belongs to a different session
          if (
            currentCachedSessionId &&
            currentCachedSessionId !== jobSessionId
          ) {
            console.log(
              `🗑️ Invalidating cache - job session ${jobSessionId} differs from cached session ${currentCachedSessionId}`
            )
            clearBaseResumeCache()
          }

          // ENHANCED: Prioritize session-specific base resume data over local state
          // Always check sessionData first and use job's session-specific base resume
          let currentBaseResumeS3Url: string | null = null
          let currentBaseResumeContent: string | null = null
          let currentBaseResumeFile: string | null = null

          console.log("🔍 Session data state:", !!sessionData)
          console.log(
            "🔍 Looking for base resume for job session:",
            jobSessionId
          )

          if (sessionData) {
            // First, try to find the specific session for this job
            let targetSession: any = null

            // Check if current session matches the job's session
            if (sessionData.current_session?.session_id === jobSessionId) {
              targetSession = sessionData.current_session
              console.log("🎯 Using current session for job:", jobSessionId)
            }
            // If not, check previous sessions for the job's session
            else if (sessionData.previous_sessions?.length > 0) {
              targetSession = sessionData.previous_sessions.find(
                (session: any) => session.session_id === jobSessionId
              )
              if (targetSession) {
                console.log(
                  "🎯 Found matching session in previous sessions:",
                  jobSessionId
                )
              } else {
                // Fallback: try the URL session ID
                targetSession = sessionData.previous_sessions.find(
                  (session: any) => session.session_id === sessionId
                )
                if (targetSession) {
                  console.log("🎯 Using URL session as fallback:", sessionId)
                } else {
                  // Final fallback: use first available session
                  targetSession = sessionData.previous_sessions[0]
                  console.log(
                    "🎯 Using first available session as final fallback:",
                    targetSession?.session_id
                  )
                }
              }
            }

            // Extract base resume data from the target session
            if (targetSession?.base_resume) {
              console.log(
                "🔍 Found base resume in target session:",
                targetSession.session_id,
                targetSession.base_resume
              )

              if (targetSession.base_resume.s3_path) {
                currentBaseResumeS3Url = targetSession.base_resume.s3_path
                console.log(
                  "🔗 Using S3 URL from target session:",
                  currentBaseResumeS3Url
                )
              }

              if (targetSession.base_resume.resume_text) {
                currentBaseResumeContent = targetSession.base_resume.resume_text
                console.log(
                  "🔗 Using resume content from target session, length:",
                  currentBaseResumeContent?.length || 0
                )
              }
            } else {
              console.log(
                "🔍 No base resume found in target session:",
                targetSession?.session_id || "none"
              )
            }
          }

          // Fallback to local state if no session-specific data found
          if (
            !currentBaseResumeS3Url &&
            !currentBaseResumeContent &&
            !currentBaseResumeFile
          ) {
            console.log(
              "🔄 No session-specific base resume found, falling back to local state"
            )
            currentBaseResumeS3Url = baseResumeS3Url
            currentBaseResumeContent = baseResumeContent
            currentBaseResumeFile = baseResumeFile
          }

          console.log("🔍 Final base resume values for preview:", {
            currentBaseResumeS3Url: !!currentBaseResumeS3Url,
            currentBaseResumeContent: !!currentBaseResumeContent,
            currentBaseResumeFile: !!currentBaseResumeFile,
            sessionSpecificS3Url: currentBaseResumeS3Url,
            sessionSpecificContentLength: currentBaseResumeContent?.length || 0,
            jobSessionId,
            urlSessionId: sessionId,
            localStateS3Url: baseResumeS3Url,
            localStateContentLength: baseResumeContent?.length || 0,
            localStateFile: !!baseResumeFile,
            isUsingSessionSpecificData:
              currentBaseResumeS3Url !== baseResumeS3Url ||
              currentBaseResumeContent !== baseResumeContent ||
              currentBaseResumeFile !== baseResumeFile
          })

          console.log(
            "🔍 Preview data structure:",
            JSON.stringify(jobData, null, 2)
          )
          console.log("🔍 Generated resume field:", jobData.generated_resume)
          console.log(
            "🔍 Has resume data flag:",
            jobData.generated_resume?.has_resume_data
          )

          // Check multiple possible data structures for resume data
          const resumeData =
            jobData.generated_resume?.tailored_resume_data ||
            jobData.generated_resume?.resume_data ||
            jobData.tailored_resume_data ||
            jobData.resume_data ||
            jobData.generated_resume?.data ||
            jobData.data

          console.log("🔍 Found resume data:", !!resumeData)
          console.log(
            "🔍 Resume data structure:",
            resumeData ? "Available" : "Not found"
          )

          // SPECIAL HANDLING: If has_resume_data is true but resumeData is null/undefined,
          // this might be a data structure issue. Let's debug further.
          if (
            !resumeData &&
            jobData.generated_resume?.has_resume_data === true
          ) {
            console.warn(
              "🚨 INCONSISTENCY DETECTED: has_resume_data=true but no resume_data found!"
            )
            console.log(
              "🔍 Full generated_resume object:",
              jobData.generated_resume
            )
            console.log(
              "🔍 Checking all keys in generated_resume:",
              Object.keys(jobData.generated_resume || {})
            )

            // Try to find resume data in any nested structure
            const allPossiblePaths = [
              jobData.generated_resume?.tailored_resume_data,
              jobData.generated_resume?.resume_data,
              jobData.generated_resume?.data,
              jobData.tailored_resume_data,
              jobData.resume_data,
              jobData.data,
              // Additional fallback paths
              jobData.generated_resume?.resume_content,
              jobData.resume_content,
              jobData.generated_resume?.structured_data,
              jobData.structured_data
            ]

            for (let i = 0; i < allPossiblePaths.length; i++) {
              const pathData = allPossiblePaths[i]
              if (
                pathData &&
                typeof pathData === "object" &&
                pathData.full_name
              ) {
                console.log(
                  `✅ Found resume data at path index ${i}:`,
                  pathData
                )
                // Use this data and continue with preview
                await processResumeDocuments(
                  pathData,
                  currentBaseResumeS3Url,
                  currentBaseResumeContent,
                  currentBaseResumeFile,
                  jobSessionId,
                  currentCachedSessionId
                )
                return // Successfully found and processed data
              }
            }
          }

          if (!resumeData) {
            console.log(
              "❌ No resume data found. Checking all possible fields:"
            )
            console.log(
              "  - jobData.generated_resume?.tailored_resume_data:",
              !!jobData.generated_resume?.tailored_resume_data
            )
            console.log(
              "  - jobData.generated_resume?.resume_data:",
              !!jobData.generated_resume?.resume_data
            )
            console.log(
              "  - jobData.tailored_resume_data:",
              !!jobData.tailored_resume_data
            )
            console.log("  - jobData.resume_data:", !!jobData.resume_data)
            console.log(
              "  - jobData.generated_resume?.data:",
              !!jobData.generated_resume?.data
            )
            console.log("  - jobData.data:", !!jobData.data)

            // Check if resume generation is still pending
            if (jobData.generation_metadata?.generation_status === "pending") {
              toast.error(
                "Resume generation is still pending. Please wait for it to complete."
              )
              return
            }

            // Check if resume generation failed
            if (
              jobData.generation_metadata?.generation_status === "failed" ||
              jobData.generation_metadata?.generation_status === "error"
            ) {
              toast.error(
                "Resume generation failed. Please try generating the resume again."
              )
              return
            }

            // For jobs that haven't been generated yet, show helpful message
            if (jobData.generated_resume?.has_resume_data === false) {
              toast.error(
                "Resume hasn't been generated yet. Click 'Generate' button first."
              )
              return
            }

            // Generic error for missing data
            toast.error(
              "Resume data not available for preview. Please generate the resume first."
            )
            return
          }

          console.log("✅ Resume data found, proceeding with preview...")
          await processResumeDocuments(
            resumeData,
            currentBaseResumeS3Url,
            currentBaseResumeContent,
            currentBaseResumeFile,
            jobSessionId,
            currentCachedSessionId
          )
        } catch (error) {
          console.error("Error in background processing:", error)
          toast.error("Failed to load resume preview. Please try again.")
        }
      }

      // Helper function to process resume documents
      const processResumeDocuments = async (
        resumeData: any,
        currentBaseResumeS3Url: string | null,
        currentBaseResumeContent: string | null,
        currentBaseResumeFile: string | null,
        jobSessionId: string,
        currentCachedSessionId: string | null
      ) => {
        // Generate DOCX for the new tailored resume
        const newResumeDoc = generateModernResumeDocx(resumeData)
        const newResumeBlob = await Packer.toBlob(newResumeDoc)

        // Create blob URL for the base resume if available
        let oldResumeUrl: string | null = null

        if (currentBaseResumeS3Url) {
          oldResumeUrl = currentBaseResumeS3Url
          console.log(
            "🔗 Using S3 URL for original resume preview:",
            currentBaseResumeS3Url
          )
        } else if (currentBaseResumeFile) {
          oldResumeUrl = currentBaseResumeFile
          console.log(
            "🔗 Using base resume file for preview:",
            currentBaseResumeFile?.substring(0, 50) + "..."
          )
        } else if (currentBaseResumeContent) {
          console.log("🔗 Generating resume file from content for preview")
          console.log(
            "🔗 Base resume content length:",
            currentBaseResumeContent.length
          )
          const createdResumeUrl = await createOriginalResumeFile(
            currentBaseResumeContent
          )
          oldResumeUrl = createdResumeUrl
          console.log(
            "🔗 Generated resume URL:",
            createdResumeUrl ? "Success" : "Failed"
          )
        } else {
          console.warn(
            "🚨 No base resume available for preview! All base resume sources are missing/null"
          )
        }

        // FORCE CACHE RECREATION: If we're using session-specific data that differs from current cache
        // This ensures that the correct base resume is shown for the preview
        if (
          oldResumeUrl &&
          currentCachedSessionId &&
          currentCachedSessionId !== jobSessionId
        ) {
          console.log(
            `🔄 Forcing cache recreation - session changed from ${currentCachedSessionId} to ${jobSessionId}`
          )

          // Clear existing cache since we need fresh data for this session
          clearBaseResumeCache()

          // Update local state to reflect session-specific data for proper cache recreation
          if (
            currentBaseResumeS3Url &&
            currentBaseResumeS3Url !== baseResumeS3Url
          ) {
            console.log(
              "📝 Updating local baseResumeS3Url to match session data"
            )
            setBaseResumeS3Url(currentBaseResumeS3Url)
          }
          if (
            currentBaseResumeContent &&
            currentBaseResumeContent !== baseResumeContent
          ) {
            console.log(
              "📝 Updating local baseResumeContent to match session data"
            )
            setBaseResumeContent(currentBaseResumeContent)
          }
          if (
            currentBaseResumeFile &&
            currentBaseResumeFile !== baseResumeFile
          ) {
            console.log(
              "📝 Updating local baseResumeFile to match session data"
            )
            setBaseResumeFile(currentBaseResumeFile)
          }
        }

        // Set preview URLs
        const newResumeUrl = URL.createObjectURL(newResumeBlob)
        setPreviewUrls({
          oldResume: oldResumeUrl,
          newResume: newResumeUrl
        })

        // Extract text content for diff highlighting
        try {
          const originalText = oldResumeUrl
            ? await extractTextContent(oldResumeUrl, "original")
            : ""
          const tailoredText = await extractTextContent(
            newResumeUrl,
            "tailored"
          )

          // Check for extremely large texts that might cause performance issues
          const MAX_TEXT_LENGTH = 50000 // 50k characters should be reasonable
          const originalTextToUse =
            originalText.length > MAX_TEXT_LENGTH
              ? originalText.substring(0, MAX_TEXT_LENGTH) + "...[truncated]"
              : originalText
          const tailoredTextToUse =
            tailoredText.length > MAX_TEXT_LENGTH
              ? tailoredText.substring(0, MAX_TEXT_LENGTH) + "...[truncated]"
              : tailoredText

          if (
            originalText.length > MAX_TEXT_LENGTH ||
            tailoredText.length > MAX_TEXT_LENGTH
          ) {
            console.warn(
              "⚠️ Large text detected and truncated for performance",
              {
                originalLength: originalText.length,
                tailoredLength: tailoredText.length,
                truncatedTo: MAX_TEXT_LENGTH
              }
            )
          }

          setOriginalResumeText(originalTextToUse)
          setTailoredResumeText(tailoredTextToUse)

          console.log("📝 Text extraction completed:", {
            originalLength: originalText.length,
            tailoredLength: tailoredText.length
          })
        } catch (error) {
          console.error("Error extracting text for diff highlighting:", error)
          setOriginalResumeText("")
          setTailoredResumeText("")
        }

        console.log("🔍 Final preview URLs being set:", {
          oldResume: oldResumeUrl,
          newResume: "blob-url-generated",
          oldResumeType: oldResumeUrl?.startsWith("http")
            ? "S3/HTTP URL"
            : oldResumeUrl?.startsWith("blob:")
            ? "Blob URL"
            : oldResumeUrl?.startsWith("data:")
            ? "Data URL"
            : "Unknown/Null"
        })
      }

      // Start background processing
      processDocumentsInBackground()
    } catch (error) {
      console.error("Error creating preview:", error)
      toast.error("Failed to create resume preview. Please try again.")
    }
  }

  // Function to download individual resume
  const downloadIndividualResume = async (
    jobData: any,
    format: "text" | "docx" = "docx"
  ) => {
    try {
      console.log("📥 Download request for:", jobData)
      console.log("📥 Generated resume data:", jobData.generated_resume)
      console.log(
        "📥 Has resume data flag:",
        jobData.generated_resume?.has_resume_data
      )
      console.log(
        "📥 Generation status:",
        jobData.generation_metadata?.generation_status
      )

      // Check if we have generated resume data
      if (!jobData.generated_resume?.has_resume_data) {
        // Check if resume generation is still pending
        if (jobData.generation_metadata?.generation_status === "pending") {
          toast.error(
            "Resume generation is still pending. Please wait for it to complete."
          )
          return
        }

        // Check if resume generation failed
        if (
          jobData.generation_metadata?.generation_status === "failed" ||
          jobData.generation_metadata?.generation_status === "error"
        ) {
          toast.error(
            "Resume generation failed. Please try generating the resume again."
          )
          return
        }

        toast.error(
          "Resume data not available for download. Please generate the resume first."
        )
        return
      }

      // Check multiple possible data structures for resume data (same as preview logic)
      const resumeData =
        jobData.generated_resume?.tailored_resume_data ||
        jobData.generated_resume?.resume_data ||
        jobData.tailored_resume_data ||
        jobData.resume_data ||
        jobData.generated_resume?.data ||
        jobData.data

      console.log("🔍 Found resume data for download:", !!resumeData)
      console.log(
        "🔍 Resume data structure:",
        resumeData ? "Available" : "Not found"
      )

      // SPECIAL HANDLING: If has_resume_data is true but resumeData is null/undefined,
      // try alternative paths (same as preview function)
      let finalResumeData = resumeData
      if (
        !finalResumeData &&
        jobData.generated_resume?.has_resume_data === true
      ) {
        console.warn(
          "🚨 DOWNLOAD INCONSISTENCY DETECTED: has_resume_data=true but no resume_data found!"
        )
        console.log(
          "🔍 Full generated_resume object:",
          jobData.generated_resume
        )

        // Try to find resume data in any nested structure
        const allPossiblePaths = [
          jobData.generated_resume?.tailored_resume_data,
          jobData.generated_resume?.resume_data,
          jobData.generated_resume?.data,
          jobData.tailored_resume_data,
          jobData.resume_data,
          jobData.data,
          // Additional fallback paths
          jobData.generated_resume?.resume_content,
          jobData.resume_content,
          jobData.generated_resume?.structured_data,
          jobData.structured_data
        ]

        for (let i = 0; i < allPossiblePaths.length; i++) {
          const pathData = allPossiblePaths[i]
          if (pathData && typeof pathData === "object" && pathData.full_name) {
            console.log(
              `✅ Found resume data for download at path index ${i}:`,
              pathData
            )
            finalResumeData = pathData
            break
          }
        }
      }

      // 1. First priority: Use existing DOCX URL if available and format is DOCX
      if (format === "docx" && jobData.generated_resume?.docx_url) {
        console.log(
          "📥 Downloading from existing DOCX URL:",
          jobData.generated_resume.docx_url
        )
        const link = document.createElement("a")
        link.href = jobData.generated_resume.docx_url
        link.download = `${jobData.job_details.job_title}_${jobData.job_details.company_name}_Resume.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("✅ DOCX download from URL successful")
        return
      }

      // 2. Second priority: Generate DOCX from structured data if available and format is DOCX
      if (format === "docx" && resumeData) {
        console.log("� Generating DOCX from structured data for download")
        try {
          const resumeDoc = generateModernResumeDocx(resumeData)
          const docxBlob = await Packer.toBlob(resumeDoc)

          const url = URL.createObjectURL(docxBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${jobData.job_details.job_title}_${jobData.job_details.company_name}_Resume.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Cleanup blob URL
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          console.log("✅ DOCX download from structured data successful")
          return
        } catch (docxError) {
          console.error(
            "❌ Failed to generate DOCX from structured data:",
            docxError
          )
          // Continue to text fallback
        }
      }

      // 3. Third priority: Use resume text if available
      if (jobData.generated_resume?.resume_text) {
        console.log(
          "📄 Downloading as text content, length:",
          jobData.generated_resume.resume_text.length
        )
        const blob = new Blob([jobData.generated_resume.resume_text], {
          type: "text/plain"
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${jobData.job_details.job_title}_${jobData.job_details.company_name}_Resume.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Cleanup blob URL
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        console.log("✅ Text download successful")

        if (format === "docx") {
          toast.error("DOCX format not available. Downloaded as text instead.")
        }
        return
      }

      // 4. Fourth priority: Generate text from structured data if available
      if (resumeData) {
        console.log("📝 Generating text from structured data for download")
        try {
          // Use the same preview text generation logic
          const textContent = createResumePreviewText(resumeData)

          const blob = new Blob([textContent], { type: "text/plain" })
          const url = URL.createObjectURL(blob)

          const link = document.createElement("a")
          link.href = url
          link.download = `${jobData.job_details.job_title}_${jobData.job_details.company_name}_Resume.txt`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Cleanup blob URL
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          console.log("✅ Text download from structured data successful")

          if (format === "docx") {
            toast.error(
              "DOCX format not available. Downloaded as text instead."
            )
          }
          return
        } catch (textError) {
          console.error(
            "❌ Failed to generate text from structured data:",
            textError
          )
        }
      }

      // If we get here, we have resume data but no downloadable format
      console.error(
        "❌ No downloadable resume data found for job:",
        jobData.job_details.job_title
      )
      if (format === "docx") {
        toast.error("DOCX format not available. Trying text format...")
        downloadIndividualResume(jobData, "text")
      } else {
        toast.error(
          "Resume text not available for download. Please try regenerating the resume."
        )
      }
    } catch (error) {
      console.error("❌ Error downloading resume:", error)
      toast.error("Failed to download resume")
    }
  }

  const [previewContent, setPreviewContent] = useState<string | null>(null)

  const previewResume = async (job: Job) => {
    // Check if we have the complete structured data and original resume
    if (
      job.tailoredResumeData &&
      (baseResumeS3Url || baseResumeContent || baseResumeFile)
    ) {
      try {
        setPreviewJobId(job.id)
        setPreviewModalOpen(true)

        // Generate DOCX for the new tailored resume
        const newResumeDoc = generateModernResumeDocx(job.tailoredResumeData)

        // Convert to blob using Packer
        const newResumeBlob = await Packer.toBlob(newResumeDoc)

        // Create blob URL for the base resume if available
        let oldResumeUrl: string | null = null
        if (baseResumeS3Url) {
          // Use S3 URL directly if available (preferred for existing sessions)
          oldResumeUrl = baseResumeS3Url
          console.log(
            "🔗 Using S3 URL for original resume preview (legacy):",
            baseResumeS3Url
          )
        } else if (baseResumeFile) {
          oldResumeUrl = baseResumeFile
        } else if (baseResumeContent) {
          // Use the improved createOriginalResumeFile function for consistency
          const createdResumeUrl = await createOriginalResumeFile(
            baseResumeContent
          )
          oldResumeUrl = createdResumeUrl
        }

        // Set preview URLs
        const newResumeUrl = URL.createObjectURL(newResumeBlob)
        setPreviewUrls({
          oldResume: oldResumeUrl,
          newResume: newResumeUrl
        })

        // Extract text content for diff highlighting
        try {
          const originalText = oldResumeUrl
            ? await extractTextContent(oldResumeUrl, "original")
            : ""
          const tailoredText = await extractTextContent(
            newResumeUrl,
            "tailored"
          )

          // Check for extremely large texts that might cause performance issues
          const MAX_TEXT_LENGTH = 50000 // 50k characters should be reasonable
          const originalTextToUse =
            originalText.length > MAX_TEXT_LENGTH
              ? originalText.substring(0, MAX_TEXT_LENGTH) + "...[truncated]"
              : originalText
          const tailoredTextToUse =
            tailoredText.length > MAX_TEXT_LENGTH
              ? tailoredText.substring(0, MAX_TEXT_LENGTH) + "...[truncated]"
              : tailoredText

          if (
            originalText.length > MAX_TEXT_LENGTH ||
            tailoredText.length > MAX_TEXT_LENGTH
          ) {
            console.warn(
              "⚠️ Large text detected and truncated for performance",
              {
                originalLength: originalText.length,
                tailoredLength: tailoredText.length,
                truncatedTo: MAX_TEXT_LENGTH
              }
            )
          }

          setOriginalResumeText(originalTextToUse)
          setTailoredResumeText(tailoredTextToUse)

          console.log("📝 Text extraction completed:", {
            originalLength: originalText.length,
            tailoredLength: tailoredText.length
          })
        } catch (error) {
          console.error("Error extracting text for diff highlighting:", error)
          setOriginalResumeText("")
          setTailoredResumeText("")
        }

        setPreviewModalOpen(true)
        setPreviewData(null)
        setPreviewContent(null)
        setPreviewUrl(null)
        setIsPreviewOpen(false)
        return
      } catch (error) {
        console.error("Error creating preview:", error)
        toast.error("Failed to create resume preview. Please try again.")
        return
      }
    }

    // Fallback for text content
    if (
      job.resumeContent &&
      (baseResumeS3Url || baseResumeContent || baseResumeFile)
    ) {
      setPreviewData({
        originalResume: baseResumeContent,
        originalResumeFile: baseResumeS3Url || baseResumeFile || undefined,
        tailoredResume: job.resumeContent,
        tailoredResumeFile: job.docxUrl || undefined,
        jobTitle: job.jobTitle,
        company: job.company || extractCompanyFromUrl(job.companyUrl),
        jobDescription: job.description,
        skills: job.skills
      })
      setPreviewContent(null)
      setPreviewUrl(null)
      setIsPreviewOpen(true)
      setPreviewModalOpen(false)
      return
    }

    // If we have resume content but no base resume, show single view
    if (
      job.resumeContent &&
      !baseResumeS3Url &&
      !baseResumeContent &&
      !baseResumeFile
    ) {
      setPreviewContent(job.resumeContent)
      setPreviewData(null)
      setPreviewUrl(null)
      setIsPreviewOpen(true)
      setPreviewModalOpen(false)
      toast.error(
        "Original resume not available for comparison. Showing tailored resume only."
      )
      return
    }

    // Fallback handling for legacy data
    if (!job.resumeUrl) return

    try {
      if (job.resumeUrl.startsWith("data:text/plain;base64,")) {
        const base64Content = job.resumeUrl.split(",")[1]
        const resumeText = atob(base64Content)

        if (baseResumeS3Url || baseResumeContent || baseResumeFile) {
          setPreviewData({
            originalResume: baseResumeContent,
            originalResumeFile: baseResumeS3Url || baseResumeFile || undefined,
            tailoredResume: resumeText,
            tailoredResumeFile: job.docxUrl || undefined,
            jobTitle: job.jobTitle,
            company: job.company || extractCompanyFromUrl(job.companyUrl),
            jobDescription: job.description,
            skills: job.skills
          })
          setPreviewContent(null)
          setPreviewUrl(null)
          setPreviewModalOpen(false)
        } else {
          setPreviewContent(resumeText)
          setPreviewData(null)
          setPreviewUrl(job.resumeUrl)
          setPreviewModalOpen(false)
        }
      } else {
        setPreviewContent(null)
        setPreviewData(null)
        setPreviewUrl(job.resumeUrl)
        setPreviewModalOpen(false)
      }

      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error setting up preview:", error)
      toast.error("Failed to load preview")
    }
  }

  // Close preview modal and cleanup URLs
  const closePreviewModal = () => {
    setPreviewModalOpen(false)
    setPreviewJobId(null)
    setCurrentPreviewJobData(null)

    // Cleanup blob URLs to prevent memory leaks
    if (previewUrls.oldResume && previewUrls.oldResume.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls.oldResume)
    }
    if (previewUrls.newResume && previewUrls.newResume.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls.newResume)
    }

    setPreviewUrls({ oldResume: null, newResume: null })

    // Reset diff highlighting state      setShowDiffHighlighting(false)
    setHighlightLevel("normal")
    setOriginalResumeText("")
    setTailoredResumeText("")
    setUseDocxHighlightFallback(false)
  }

  // Download resume function
  const downloadResume = async (job: Job, format: "text" | "docx" = "text") => {
    try {
      console.log("🔽 Download initiated for job:", job.id, "format:", format)
      console.log("📊 Job data available:", {
        hasDocxUrl: !!job.docxUrl,
        hasResumeContent: !!job.resumeContent,
        hasTailoredResumeData: !!job.tailoredResumeData,
        docxUrl: job.docxUrl,
        resumeContentLength: job.resumeContent?.length || 0
      })

      // 1. First priority: Use existing DOCX URL if available and format is DOCX
      if (format === "docx" && job.docxUrl) {
        console.log("📥 Downloading from existing DOCX URL:", job.docxUrl)
        const link = document.createElement("a")
        link.href = job.docxUrl
        link.download = `${job.jobTitle}_${
          job.company || "Company"
        }_Resume.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("✅ DOCX download from URL successful")
        return
      }

      // 2. Second priority: Generate DOCX from structured data if available and format is DOCX
      if (format === "docx" && job.tailoredResumeData) {
        console.log("🔧 Generating DOCX from structured data for download")
        try {
          const resumeDoc = generateModernResumeDocx(job.tailoredResumeData)
          const docxBlob = await Packer.toBlob(resumeDoc)

          const url = URL.createObjectURL(docxBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${job.jobTitle}_${
            job.company || "Company"
          }_Resume.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Cleanup blob URL
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          console.log("✅ DOCX download from structured data successful")
          return
        } catch (docxError) {
          console.error(
            "❌ Failed to generate DOCX from structured data:",
            docxError
          )
          // Continue to text fallback
        }
      }

      // 3. Third priority: Use resume content as text (either requested or as fallback)
      if (job.resumeContent) {
        console.log(
          "📄 Downloading as text content, length:",
          job.resumeContent.length
        )
        const blob = new Blob([job.resumeContent], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${job.jobTitle}_${job.company || "Company"}_Resume.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Cleanup blob URL
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        console.log("✅ Text download successful")

        if (format === "docx") {
          toast.error("DOCX format not available. Downloaded as text instead.")
        }
        return
      }

      // 4. Fourth priority: Generate text from structured data if available
      if (job.tailoredResumeData) {
        console.log("📝 Generating text from structured data for download")
        try {
          // Generate a simple text version from structured data
          const textContent = generateTextFromResumeData(job.tailoredResumeData)

          const blob = new Blob([textContent], { type: "text/plain" })
          const url = URL.createObjectURL(blob)

          const link = document.createElement("a")
          link.href = url
          link.download = `${job.jobTitle}_${
            job.company || "Company"
          }_Resume.txt`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Cleanup blob URL
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          console.log("✅ Text download from structured data successful")

          if (format === "docx") {
            toast.error(
              "DOCX format not available. Downloaded as text instead."
            )
          }
          return
        } catch (textError) {
          console.error(
            "❌ Failed to generate text from structured data:",
            textError
          )
        }
      }

      console.error("❌ No downloadable resume data found for job:", job.id)
      toast.error("Resume data not available for download")
    } catch (error) {
      console.error("❌ Error downloading resume:", error)
      toast.error("Failed to download resume")
    }
  }

  // Helper function to generate text content from structured resume data
  const generateTextFromResumeData = (resumeData: any): string => {
    try {
      let text = ""

      // Personal Info
      if (resumeData.personalInfo) {
        const info = resumeData.personalInfo
        text += `${info.fullName || ""}\n`
        if (info.email) text += `Email: ${info.email}\n`
        if (info.phone) text += `Phone: ${info.phone}\n`
        if (info.location) text += `Location: ${info.location}\n`
        if (info.linkedin) text += `LinkedIn: ${info.linkedin}\n`
        text += "\n"
      }

      // Professional Summary
      if (resumeData.professionalSummary) {
        text += "PROFESSIONAL SUMMARY\n"
        text += "=" + "=".repeat(19) + "\n"
        text += `${resumeData.professionalSummary}\n\n`
      }

      // Work Experience
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        text += "WORK EXPERIENCE\n"
        text += "=" + "=".repeat(15) + "\n"
        resumeData.workExperience.forEach((exp: any) => {
          text += `${exp.jobTitle || ""} at ${exp.company || ""}\n`
          text += `${exp.duration || ""}\n`
          if (exp.responsibilities && exp.responsibilities.length > 0) {
            exp.responsibilities.forEach((resp: string) => {
              text += `• ${resp}\n`
            })
          }
          text += "\n"
        })
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        text += "EDUCATION\n"
        text += "=" + "=".repeat(9) + "\n"
        resumeData.education.forEach((edu: any) => {
          text += `${edu.degree || ""} in ${edu.fieldOfStudy || ""}\n`
          text += `${edu.institution || ""}\n`
          text += `${edu.graduationYear || ""}\n\n`
        })
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        text += "SKILLS\n"
        text += "=" + "=".repeat(6) + "\n"
        text += resumeData.skills.join(", ") + "\n\n"
      }

      return text
    } catch (error) {
      console.error("Error generating text from resume data:", error)
      return "Error generating resume text content"
    }
  }

  // Function to get actual resume score from backend data
  const calculateScore = (job: any) => {
    // Use actual resume_score from backend if available
    // Check both job.job_details.resume_score (session data) and job.resume_score (direct field)
    const resumeScore = job?.job_details?.resume_score || job?.resume_score

    // console.log(
    //   `🎯 Score debug for ${job.job_details?.job_title || "Unknown Job"}:`,
    //   {
    //     job_details_resume_score: job.job_details?.resume_score,
    //     direct_resume_score: job.resume_score,
    //     final_score: resumeScore,
    //     has_resume_data: job.generated_resume?.has_resume_data
    //   }
    // )

    if (resumeScore !== undefined && resumeScore !== null) {
      return Math.round(resumeScore)
    }

    // Fallback for jobs without score yet (should not happen in normal flow)
    return job?.generated_resume?.has_resume_data ? 75 : 0
  }

  // Function to calculate improvement percentage
  const calculateImprovement = (job: any) => {
    // Get resume score from the correct path
    const resumeScore = job.job_details?.resume_score || job.resume_score

    // If we have a resume generated, calculate improvement based on resume score
    if (
      job.generated_resume?.has_resume_data &&
      resumeScore !== undefined &&
      resumeScore !== null
    ) {
      // Calculate improvement based on score (higher scores show more improvement)
      const score = resumeScore
      if (score >= 90) return Math.floor(Math.random() * 10) + 35 // 35-45%
      if (score >= 80) return Math.floor(Math.random() * 10) + 25 // 25-35%
      if (score >= 70) return Math.floor(Math.random() * 10) + 15 // 15-25%
      return Math.floor(Math.random() * 10) + 10 // 10-20%
    }
    return null
  }

  // Helper function to strip markdown formatting and truncate for table display
  const stripMarkdownAndTruncate = (
    text: string,
    maxLength: number = 120
  ): string => {
    if (!text) return ""

    // Remove markdown formatting
    let cleaned = text
      .replace(/#{1,6}\s?/g, "") // Headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Inline code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
      .replace(/>\s?/g, "") // Blockquotes
      .replace(/[-*+]\s/g, "") // List items
      .replace(/\d+\.\s/g, "") // Numbered lists
      .replace(/\n+/g, " ") // Multiple newlines to space
      .trim()

    // Truncate if needed
    if (cleaned.length > maxLength) {
      return cleaned.substring(0, maxLength).trim() + "..."
    }

    return cleaned
  }

  // Helper function to get tailored score from resume data
  const getTailoredScore = (jobData: any): number | null => {
    // Check multiple possible paths for tailoring score
    const tailoringScore =
      jobData?.generated_resume?.resume_data?.tailoring_score ||
      jobData?.generated_resume?.tailored_resume_data?.tailoring_score ||
      jobData?.tailored_resume_data?.tailoring_score ||
      jobData?.resume_data?.tailoring_score

    if (tailoringScore !== undefined && tailoringScore !== null) {
      return Math.round(tailoringScore)
    }

    return null
  }

  // Helper function to check if a job should be excluded from credit charges
  const shouldExcludeFromCredits = (jobData: any): boolean => {
    // Check if the job has used_free_generation set to false
    // This means it was previously generated using credits and shouldn't be charged again for regeneration
    const usedFreeGeneration = jobData.generation_metadata?.used_free_generation

    console.log("🔍 Credit exclusion check for job:", {
      jobId: jobData.generation_id,
      jobTitle: jobData.job_details?.job_title,
      company: jobData.job_details?.company_name,
      usedFreeGeneration,
      shouldExclude: usedFreeGeneration === false
    })

    return usedFreeGeneration === false
  }

  // Helper function to filter jobs that need credit charges
  const getJobsRequiringCredits = (jobs: any[]): any[] => {
    const jobsRequiringCredits = jobs.filter(
      (job) => !shouldExcludeFromCredits(job)
    )
    const excludedJobs = jobs.filter((job) => shouldExcludeFromCredits(job))

    console.log("💳 Credit filtering results:", {
      totalJobs: jobs.length,
      jobsRequiringCredits: jobsRequiringCredits.length,
      excludedJobs: excludedJobs.length,
      excludedJobTitles: excludedJobs.map(
        (job) =>
          `${job.job_details?.job_title} at ${job.job_details?.company_name}`
      )
    })

    return jobsRequiringCredits
  }

  // Helper function to fetch fresh session data and wait for completion
  const refetchSessionDataAndWait = async () => {
    if (!sessionId) {
      console.warn("No session ID found for refetch")
      return
    }

    try {
      console.log("🔄 Refetching session data with fresh request...")

      const response = await postRequest(API_ENDPOINTS.GetSessionData, {
        SESSION_ID: sessionId,
        _timestamp: Date.now() // Cache-busting parameter to ensure fresh data
      })

      if (response.success && response.data) {
        setSessionData(response.data)

        // CRITICAL FIX: For bulk generation mode, don't populate currentSessionJobs with existing session data
        // We only want to use jobs from the store (passed from bulk generator)
        if (asBg && isNavigatedFromBulkGenerator) {
          console.log(
            "🚫 Bulk generation mode - skipping session jobs population during refetch"
          )
          return
        }

        // Normal mode - populate session jobs as usual
        // Check if current session exists (valid session ID case)
        if (response.data.current_session?.generated_resumes) {
          // Annotate each job with its parent session's session_id
          const jobsWithSessionId =
            response.data.current_session.generated_resumes.map((job: any) => ({
              ...job,
              session_id: response.data.current_session.session_id
            }))

          setCurrentSessionJobs(jobsWithSessionId)

          // Set base resume content if available
          if (response.data.current_session?.base_resume?.resume_text) {
            setBaseResumeContent(
              response.data.current_session.base_resume.resume_text
            )
          }

          // Set base resume S3 URL if available
          if (response.data.current_session?.base_resume?.s3_path) {
            setBaseResumeS3Url(
              response.data.current_session.base_resume.s3_path
            )
          }
        }
        // Handle invalid session ID case
        else if (
          !response.data.current_session &&
          response.data.previous_sessions?.length > 0
        ) {
          const requestedSession = response.data.previous_sessions.find(
            (session: any) => session.session_id === sessionId
          )

          if (requestedSession) {
            if (requestedSession.generated_resumes) {
              const jobsWithSessionId = requestedSession.generated_resumes.map(
                (job: any) => ({
                  ...job,
                  session_id: requestedSession.session_id
                })
              )

              setCurrentSessionJobs(jobsWithSessionId)
            } else {
              setCurrentSessionJobs([])
            }

            // Set base resume content from found session
            if (requestedSession.base_resume?.resume_text) {
              setBaseResumeContent(requestedSession.base_resume.resume_text)
            }

            // Set base resume S3 URL from found session
            if (requestedSession.base_resume?.s3_path) {
              setBaseResumeS3Url(requestedSession.base_resume.s3_path)
            }

            // Filter out the current session from previous sessions
            const otherSessions = response.data.previous_sessions.filter(
              (session: any) => session.session_id !== sessionId
            )

            // Annotate jobs in other sessions with their session_id
            const annotatedOtherSessions = otherSessions.map(
              (session: any) => ({
                ...session,
                generated_resumes:
                  session.generated_resumes?.map((job: any) => ({
                    ...job,
                    session_id: session.session_id
                  })) || []
              })
            )

            setPreviousSessions(annotatedOtherSessions)
          }
        }
        // Handle empty state
        else if (
          !response.data.current_session &&
          !response.data.previous_sessions?.length
        ) {
          setCurrentSessionJobs([])
          setPreviousSessions([])
        }

        // Always set previous sessions
        if (response.data.previous_sessions && !response.data.current_session) {
          const annotatedSessions = response.data.previous_sessions.map(
            (session: any) => ({
              ...session,
              generated_resumes:
                session.generated_resumes?.map((job: any) => ({
                  ...job,
                  session_id: session.session_id
                })) || []
            })
          )
          setPreviousSessions(annotatedSessions)
        } else if (response.data.previous_sessions) {
          const annotatedSessions = response.data.previous_sessions.map(
            (session: any) => ({
              ...session,
              generated_resumes:
                session.generated_resumes?.map((job: any) => ({
                  ...job,
                  session_id: session.session_id
                })) || []
            })
          )
          setPreviousSessions(annotatedSessions)
        }

        console.log("✅ Session data refetched successfully with fresh data")
      }
    } catch (error) {
      console.error("Error refetching session data:", error)
      errorToast("Failed to refetch session data")
    }
  }

  // ...existing code...

  // Helper function to calculate the best score (max of original and tailored)
  const getBestScore = (jobData: any): number => {
    const originalScore = calculateScore(jobData)
    const tailoredScore = getTailoredScore(jobData)

    if (tailoredScore !== null) {
      return Math.max(originalScore, tailoredScore)
    }

    return originalScore
  }

  // Updated function to calculate improvement based on score difference
  const calculateScoreImprovement = (jobData: any): number | null => {
    const originalScore = calculateScore(jobData)
    const tailoredScore = getTailoredScore(jobData)

    if (tailoredScore !== null && jobData.generated_resume?.has_resume_data) {
      return tailoredScore - originalScore
    }

    return null
  }

  // Generate dashboard statistics
  const getDashboardStats = () => {
    // Ensure we always have valid arrays and handle both data structures
    const validCurrentSessionJobs = Array.isArray(currentSessionJobs)
      ? currentSessionJobs
      : []
    const validPreviousSessions = Array.isArray(previousSessions)
      ? previousSessions
      : []

    const allJobs = [
      ...validCurrentSessionJobs,
      ...validPreviousSessions.flatMap(
        (s) => s.recent_generations || s.generated_resumes || []
      )
    ]

    // console.log("📊 Dashboard Stats Debug:", {
    //   currentSessionJobs: validCurrentSessionJobs.length,
    //   previousSessionJobs: validPreviousSessions.flatMap(
    //     (s) => s.recent_generations || s.generated_resumes || []
    //   ).length,
    //   totalAllJobs: allJobs.length
    // })

    const totalResumes = allJobs.filter(
      (job) =>
        job.generated_resume?.has_resume_data ||
        job.generation_metadata?.generation_status === "completed"
    ).length

    // Calculate actual stats from job data
    const completedJobs = allJobs.filter(
      (job) => job.generated_resume?.has_resume_data
    )

    // Calculate average improvement from actual job data
    const improvements = completedJobs
      .map((job) => calculateScoreImprovement(job))
      .filter((improvement) => improvement !== null)
    const avgImprovement =
      improvements.length > 0
        ? Math.round(
            improvements.reduce((sum, imp) => sum + imp, 0) /
              improvements.length
          )
        : 0

    // Calculate high scores (jobs with tailored score >= 80)
    const highScoreJobs = completedJobs.filter((job) => {
      const tailoredScore = getTailoredScore(job)
      return tailoredScore !== null && tailoredScore >= 80
    })
    const highScores = highScoreJobs.length

    // Ready to apply = jobs with resume data
    const readyToApply = completedJobs.length

    // console.log("📊 Dashboard Stats Debug:", {
    //   currentSessionJobs: validCurrentSessionJobs.length,
    //   previousSessionJobs: validPreviousSessions.flatMap(
    //     (s) => s.recent_generations || s.generated_resumes || []
    //   ).length,
    //   totalAllJobs: allJobs.length
    // })

    return {
      totalResumes,
      avgImprovement,
      highScores,
      readyToApply
    }
  }

  // Helper function to filter jobs with provided data (for immediate processing)
  const getFilteredJobsWithData = (
    jobsData: any[],
    sessionsData: any[] = previousSessions
  ) => {
    // Ensure we always have valid arrays to work with
    const validCurrentSessionJobs = Array.isArray(jobsData) ? jobsData : []
    const validPreviousSessions = Array.isArray(sessionsData)
      ? sessionsData
      : []

    // Combine current session jobs with previous sessions jobs
    const combinedJobs = [
      // Current session jobs (marked as type: 'current')
      ...validCurrentSessionJobs.map((job) => {
        // Handle different job data structures
        // Jobs from store (BulkJobGenerator) vs jobs from API
        const isStoreJob = job.jobTitle !== undefined // Store jobs have jobTitle, API jobs have job_details.job_title

        if (isStoreJob) {
          // Transform store job structure to match API structure
          return {
            generation_id: job.id || `temp-${Date.now()}`,
            job_details: {
              job_title: job.jobTitle || "",
              company_name: job.companyUrl || "",
              job_description: job.description || "",
              job_skills: job.skills
                ? job.skills.split(",").map((s: string) => s.trim())
                : [],
              resume_score: null,
              years_experience: null,
              additional_context: "",
              language: "English (US)",
              years_experience_string: ""
            },
            generated_resume: {
              has_resume_data: false
            },
            generation_metadata: {
              generation_status: "pending"
            },
            created_at: new Date().toISOString(),
            type: "current",
            session_type: "Current Session"
          }
        } else {
          // API job structure - use as is
          return {
            ...job,
            type: "current",
            session_type: "Current Session",
            session_id: sessionId // Ensure current session jobs have the correct session ID
          }
        }
      }),
      // Previous sessions jobs (marked as type: 'previous')
      ...validPreviousSessions.flatMap((session) => {
        // Combine both recent_generations and generated_resumes arrays.
        const sessionJobs = [
          ...(session.recent_generations || []),
          ...(session.generated_resumes || [])
        ]
        return sessionJobs.map((gen: any) => ({
          ...gen,
          type: "previous",
          session_type: `Session from ${new Date(
            session.created_at
          ).toLocaleDateString()}`,
          session_id: session.session_id
        }))
      })
    ]

    let filtered = combinedJobs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.job_details.job_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          job.job_details.company_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => {
        const hasResume = job.generated_resume?.has_resume_data
        const isGenerating =
          job.generation_metadata?.generation_status === "generating"

        switch (statusFilter) {
          case "completed":
            return hasResume
          case "pending":
            return !hasResume && !isGenerating
          case "generating":
            return isGenerating
          default:
            return true
        }
      })
    }

    // Apply sorting with current session priority
    // Separate current and previous session jobs
    const currentSessionJobs = filtered.filter((job) => job.type === "current")
    const previousSessionJobs = filtered.filter(
      (job) => job.type === "previous"
    )

    // Sort function based on sortBy criteria
    const getSortValue = (job: any, sortType: string) => {
      switch (sortType) {
        case "title":
          return job.job_details.job_title
        case "company":
          return job.job_details.company_name
        case "status":
          return job.generated_resume?.has_resume_data ? "completed" : "pending"
        case "date":
        default:
          // Use updated_at if available, fallback to created_at
          const updatedAt = job.generated_resume?.updated_at || job.updated_at
          const createdAt = job.created_at
          return updatedAt || createdAt || "1970-01-01T00:00:00.000Z"
      }
    }

    // Sort current session jobs
    const sortedCurrentJobs = currentSessionJobs.sort((a, b) => {
      switch (sortBy) {
        case "title":
        case "company":
          return getSortValue(a, sortBy).localeCompare(getSortValue(b, sortBy))
        case "status":
          return getSortValue(a, sortBy).localeCompare(getSortValue(b, sortBy))
        case "date":
        default:
          // For date sorting, sort by updated_at (newest first)
          const dateA = getSortValue(a, "date")
          const dateB = getSortValue(b, "date")
          return new Date(dateB).getTime() - new Date(dateA).getTime()
      }
    })

    // Sort previous session jobs
    const sortedPreviousJobs = previousSessionJobs.sort((a, b) => {
      switch (sortBy) {
        case "title":
        case "company":
          return getSortValue(a, sortBy).localeCompare(getSortValue(b, sortBy))
        case "status":
          return getSortValue(a, sortBy).localeCompare(getSortValue(b, sortBy))
        case "date":
        default:
          // For date sorting, sort by updated_at (newest first)
          const dateA = getSortValue(a, "date")
          const dateB = getSortValue(b, "date")
          return new Date(dateB).getTime() - new Date(dateA).getTime()
      }
    })

    // Merge with current session jobs first, then previous session jobs
    filtered = [...sortedCurrentJobs, ...sortedPreviousJobs]

    return filtered
  }

  // Filter and sort combined jobs (current + previous sessions) - uses current state
  const getFilteredJobs = () => {
    return getFilteredJobsWithData(currentSessionJobs, previousSessions)
  }

  const stats = getDashboardStats()

  // Memoized filtered jobs to prevent unnecessary recalculations
  const filteredJobs = useMemo(() => {
    console.log("🔍 useMemo filteredJobs recalculating with:", {
      currentSessionJobsCount: currentSessionJobs.length,
      previousSessionsCount: previousSessions.length,
      searchTerm,
      statusFilter,
      sortBy,
      timestamp: new Date().toISOString()
    })
    return getFilteredJobsWithData(currentSessionJobs, previousSessions)
  }, [currentSessionJobs, previousSessions, searchTerm, statusFilter, sortBy])

  // Helper functions for selection (moved here after filteredJobs is declared)
  const handleSelectJob = (jobId: string, checked: boolean) => {
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(jobId)
      } else {
        newSet.delete(jobId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allJobIds = new Set(filteredJobs.map((job) => job.generation_id))
      setSelectedJobIds(allJobIds)
    } else {
      setSelectedJobIds(new Set())
    }
  }

  const isAllSelected =
    filteredJobs.length > 0 &&
    filteredJobs.every((job) => selectedJobIds.has(job.generation_id))
  const isIndeterminate = selectedJobIds.size > 0 && !isAllSelected

  // Helper to check if a job is currently processing
  const isJobProcessing = (jobId: string) => processingJobIds.has(jobId)

  // Handler for Regenerate button to set processing state and call generation
  const handleRegenerate = async (jobId: string) => {
    setProcessingJobIds((prev) => new Set(prev).add(jobId))
    const jobData = filteredJobs.find((job) => job.generation_id === jobId)
    if (jobData) {
      await generateIndividualResume(jobData)
    }
    // The processingJobIds set will be cleared by generateIndividualResume when done
  }

  // Dropdown menu handlers
  const handleDropdownToggle = (jobId: string) => {
    setOpenDropdownId((prev) => (prev === jobId ? null : jobId))
  }

  const handleCloseDropdown = () => {
    setOpenDropdownId(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as Element
        if (!target.closest("[data-dropdown-menu]")) {
          handleCloseDropdown()
        }
      }
    }

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openDropdownId])

  // Menu action handlers
  const handleRegenerateJob = async (jobData: any) => {
    handleCloseDropdown()
    await handleRegenerate(jobData.generation_id)
  }

  const handleDeleteJob = async (jobData: any) => {
    handleCloseDropdown()

    // Store the job data for potential restoration if API fails
    const jobToDelete = jobData

    // STEP 1: Start the vanishing animation immediately (but keep data in state)
    setDeletingJobIds((prev) => new Set(prev).add(jobData.generation_id))

    // Remove from selection immediately
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(jobData.generation_id)
      return newSet
    })

    // STEP 2: Make DELETE API call and handle success/failure
    try {
      // Determine the correct session ID to use
      let correctSessionId = jobData.session_id || sessionId

      // Make DELETE API call
      const response = await postRequest(API_ENDPOINTS.DeleteGeneration, {
        SESSION_ID: correctSessionId,
        generation_id: jobData.generation_id
      })

      if (response.success) {
        // Success - show message and remove data after animation
        toast.success("Resume deleted successfully!")

        // Remove from actual state after animation completes
        setTimeout(() => {
          if (!jobToDelete.session_id || jobToDelete.session_id === sessionId) {
            // Job belongs to current session - remove from currentSessionJobs
            setCurrentSessionJobs((prev) =>
              prev.filter((job) => job.generation_id !== jobData.generation_id)
            )
          } else {
            // Job belongs to a previous session - remove from previousSessions
            setPreviousSessions((prev) =>
              prev.map((session) => {
                if (session.session_id === jobData.session_id) {
                  return {
                    ...session,
                    recent_generations: session.recent_generations?.filter(
                      (job) => job.generation_id !== jobData.generation_id
                    ),
                    generated_resumes: session.generated_resumes?.filter(
                      (job) => job.generation_id !== jobData.generation_id
                    )
                  }
                }
                return session
              })
            )
          }

          // Clean up the deleting set
          setDeletingJobIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(jobData.generation_id)
            return newSet
          })
        }, 300) // Animation duration
      } else {
        // API failed - stop animation and show error
        setDeletingJobIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(jobData.generation_id)
          return newSet
        })

        // Restore to selection if it was selected
        if (selectedJobIds.has(jobData.generation_id)) {
          setSelectedJobIds((prev) => new Set(prev).add(jobData.generation_id))
        }

        toast.error(
          "Failed to delete resume: " + (response.error || "Unknown error")
        )
      }
    } catch (error) {
      // Network/API error - stop animation and show error
      console.error("Error deleting job:", error)

      setDeletingJobIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(jobData.generation_id)
        return newSet
      })

      // Restore to selection if it was selected
      if (selectedJobIds.has(jobData.generation_id)) {
        setSelectedJobIds((prev) => new Set(prev).add(jobData.generation_id))
      }

      toast.error("Failed to delete resume. Please try again.")
    }
  }

  // Debug logging to track UI state
  // console.log("🖥️ UI State Debug:", {
  //   sessionId,
  //   currentSessionJobsCount: currentSessionJobs.length,
  //   previousSessionsCount: previousSessions.length,
  //   filteredJobsCount: filteredJobs.length,
  //   statsTotal: stats.totalResumes,
  //   hasBaseResume: !!baseResumeContent || !!baseResumeS3Url,
  //   deletingJobIdsCount: deletingJobIds.size
  // })

  // Function to get session job status badge
  const getSessionJobStatusBadge = (jobData: any) => {
    const hasResume = jobData.generated_resume?.has_resume_data === true
    const isGenerating =
      jobData.generation_metadata?.generation_status === "generating"
    const generationStatus = jobData.generation_metadata?.generation_status

    // Check for specific generation status first
    if (isGenerating || asBg) {
      return (
        <span
          className="inline-flex max-w-fit items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "purple",
            color: "white"
            // border: "1px solid rgb(147, 51, 234)"
          }}>
          Generating
        </span>
      )
    }

    // Check if generation failed/errored
    if (generationStatus === "failed" || generationStatus === "error") {
      return (
        <span
          className="inline-flex max-w-fit items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "#f00",
            color: "white"
            // border: "1px solid rgb(220, 38, 38)"
          }}>
          Failed
        </span>
      )
    }

    // Only show completed if we actually have resume data
    if (hasResume) {
      return (
        <span
          className="inline-flex max-w-fit items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "green",
            color: "white"
            // border: "1px solid rgb(147, 51, 234)"
          }}>
          Completed
        </span>
      )
    }

    // Check if it's ready/completed but no resume data yet
    // if (generationStatus === "completed" && !hasResume) {
    //   return (
    //     <span
    //       className="inline-flex max-w-fit items-center px-3 py-1 rounded-full text-xs font-medium"
    //       style={{
    //         backgroundColor: "rgba(133, 77, 14, 0.5)",
    //         color: "rgb(251, 191, 36)",
    //         border: "1px solid rgb(217, 119, 6)"
    //       }}>
    //       Ready
    //     </span>
    //   )
    // }

    // Default to pending for jobs without status or current session jobs without resumes
    return (
      <span
        className="inline-flex max-w-fit items-center px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: "gray",
          color: "#fff"
          // border: "1px solid rgb(147, 51, 234)"
        }}>
        Pending
      </span>
    )
  }

  const deleteSelectedJobs = async () => {
    if (selectedJobIds.size === 0)
      return console.warn("No jobs selected for deletion")

    const selectedJobs = filteredJobs.filter((job) =>
      selectedJobIds.has(job.generation_id)
    )

    if (selectedJobs.length === 0) {
      return console.warn("No valid jobs selected for deletion")
    }

    await Promise.all(selectedJobs.map((job) => handleDeleteJob(job)))
  }

  const downloadBulkResumesAsZip = async () => {
    if (selectedJobIds.size === 0) {
      toast.error("No jobs selected for download")
      return
    }

    const selectedJobs = filteredJobs.filter((job) =>
      selectedJobIds.has(job.generation_id)
    )

    if (selectedJobs.length === 0) {
      toast.error("No valid jobs selected for download")
      return
    }

    // Filter jobs that have resume data
    const jobsWithResumeData = selectedJobs.filter(
      (job) => job.generated_resume?.has_resume_data
    )

    if (jobsWithResumeData.length === 0) {
      toast.error(
        "No completed resumes found in selection. Please generate resumes first."
      )
      return
    }

    if (jobsWithResumeData.length !== selectedJobs.length) {
      toast.error(
        `Only ${jobsWithResumeData.length} out of ${selectedJobs.length} selected jobs have completed resumes. Downloading available resumes.`
      )
    }

    try {
      console.log(
        "📦 Starting bulk download for",
        jobsWithResumeData.length,
        "resumes"
      )

      // Show loading state
      const loadingToast = toast.success("Preparing zip file...")

      const zip = new JSZip()
      const docxPromises: Promise<void>[] = []
      let successCount = 0
      let errorCount = 0

      // Process each job with resume data
      for (const jobData of jobsWithResumeData) {
        const promise = (async () => {
          try {
            // Get resume data from multiple possible paths (same logic as downloadIndividualResume)
            const resumeData =
              jobData.generated_resume?.tailored_resume_data ||
              jobData.generated_resume?.resume_data ||
              jobData.tailored_resume_data ||
              jobData.resume_data ||
              jobData.generated_resume?.data ||
              jobData.data

            // Handle special case where has_resume_data is true but resumeData is null/undefined
            let finalResumeData = resumeData
            if (
              !finalResumeData &&
              jobData.generated_resume?.has_resume_data === true
            ) {
              const allPossiblePaths = [
                jobData.generated_resume?.tailored_resume_data,
                jobData.generated_resume?.resume_data,
                jobData.generated_resume?.data,
                jobData.tailored_resume_data,
                jobData.resume_data,
                jobData.data,
                jobData.generated_resume?.resume_content,
                jobData.resume_content,
                jobData.generated_resume?.structured_data,
                jobData.structured_data
              ]

              for (const pathData of allPossiblePaths) {
                if (
                  pathData &&
                  typeof pathData === "object" &&
                  pathData.full_name
                ) {
                  finalResumeData = pathData
                  break
                }
              }
            }

            // Create filename - sanitize to avoid filesystem issues
            const sanitizeFilename = (name: string) => {
              return name.replace(/[^a-z0-9]/gi, "_").replace(/_+/g, "_")
            }

            const jobTitle = sanitizeFilename(
              jobData.job_details.job_title || "Job"
            )
            const companyName = sanitizeFilename(
              jobData.job_details.company_name || "Company"
            )
            const filename = `${jobTitle}_${companyName}_Resume.docx`

            // Try to get DOCX blob
            let docxBlob: Blob | null = null

            // 1. First priority: Use existing DOCX URL if available
            if (jobData.generated_resume?.docx_url) {
              try {
                const response = await fetch(jobData.generated_resume.docx_url)
                if (response.ok) {
                  docxBlob = await response.blob()
                  console.log("✅ Downloaded DOCX from URL for", filename)
                }
              } catch (error) {
                console.warn("Failed to fetch from DOCX URL:", error)
              }
            }

            // 2. Second priority: Generate DOCX from structured data
            if (!docxBlob && finalResumeData) {
              try {
                const resumeDoc = generateModernResumeDocx(finalResumeData)
                docxBlob = await Packer.toBlob(resumeDoc)
                console.log(
                  "✅ Generated DOCX from structured data for",
                  filename
                )
              } catch (error) {
                console.warn(
                  "Failed to generate DOCX from structured data:",
                  error
                )
              }
            }

            // 3. Third priority: Use resume text if available
            if (!docxBlob && jobData.generated_resume?.resume_text) {
              const textBlob = new Blob(
                [jobData.generated_resume.resume_text],
                {
                  type: "text/plain"
                }
              )
              // Change extension to .txt for text files
              const textFilename = filename.replace(".docx", ".txt")
              zip.file(textFilename, textBlob)
              console.log("✅ Added text file for", textFilename)
              successCount++
              return
            }

            // 4. Fourth priority: Generate text from structured data
            if (!docxBlob && finalResumeData) {
              try {
                const textContent = generateTextFromResumeData(finalResumeData)
                const textBlob = new Blob([textContent], { type: "text/plain" })
                const textFilename = filename.replace(".docx", ".txt")
                zip.file(textFilename, textBlob)
                console.log(
                  "✅ Generated text from structured data for",
                  textFilename
                )
                successCount++
                return
              } catch (error) {
                console.warn(
                  "Failed to generate text from structured data:",
                  error
                )
              }
            }

            // Add DOCX to zip if we have it
            if (docxBlob) {
              zip.file(filename, docxBlob)
              successCount++
              console.log("✅ Added to zip:", filename)
            } else {
              console.error(
                "❌ No downloadable data found for:",
                jobData.job_details.job_title
              )
              errorCount++
            }
          } catch (error) {
            console.error("❌ Error processing job for zip:", error)
            errorCount++
          }
        })()

        docxPromises.push(promise)
      }

      // Wait for all DOCX files to be processed
      await Promise.all(docxPromises)

      if (successCount === 0) {
        toast.error("Failed to prepare any resumes for download")
        return
      }

      console.log(
        `📦 Zip preparation complete: ${successCount} successful, ${errorCount} failed`
      )

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Create download link
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url

      // Create zip filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
      link.download = `Tailored_Resumes_${timestamp}.zip`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup blob URL
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      // Clear selection after successful download
      setSelectedJobIds(new Set())

      // Show success message
      if (errorCount > 0) {
        toast.success(
          `Downloaded ${successCount} resumes. ${errorCount} failed to process.`
        )
      } else {
        toast.success(
          `Successfully downloaded ${successCount} resumes as zip file!`
        )
      }

      console.log("✅ Bulk download completed successfully")
    } catch (error) {
      console.error("❌ Error creating zip file:", error)
      toast.error("Failed to create zip file. Please try again.")
    }
  }

  const downloadSelectedResumes = () => {
    if (selectedJobIds.size === 0)
      return console.warn("No jobs selected for download")

    const selectedJobs = filteredJobs.filter((job) =>
      selectedJobIds.has(job.generation_id)
    )

    if (selectedJobs.length === 0) {
      return console.warn("No valid jobs selected for download")
    }

    // Use bulk download for multiple resumes, individual download for single resume
    if (selectedJobs.length > 1) {
      return downloadBulkResumesAsZip()
    }

    // For single resume, use individual download
    selectedJobs.forEach((job) => {
      downloadIndividualResume(job)
    })

    setSelectedJobIds(new Set()) // Clear selection after download
  }

  const onApplyBulkAction = () => {
    if (bulkActionFilter === "regenerate") {
      return startResumeGeneration()
    }

    if (bulkActionFilter === "delete") {
      return deleteSelectedJobs()
    }

    if (bulkActionFilter === "download") {
      return downloadSelectedResumes()
    }
  }

  const getStatusBadge = (job: Job) => {
    switch (job.status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
            Pending
          </span>
        )
      case "generating":
        return (
          <div className="flex items-center gap-2">
            <div
              className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full text-purple-400"
              role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <span className="text-sm text-purple-400 font-medium">
              Generating
            </span>
          </div>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-400 border border-purple-600">
            Completed
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-600">
            Error
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
            Unknown
          </span>
        )
    }
  }

  // RENDER DEBUG - Component rendering
  // console.log("🎨 InitializeResumeGeneration rendering with:", {
  //   asBg,
  //   isNavigatedFromBulkGenerator,
  //   setupComplete,
  //   currentSessionJobsLength: currentSessionJobs.length,
  //   filteredJobsLength: getFilteredJobs().length,
  //   renderTime: new Date().toISOString()
  // })

  return (
    <DashBoardLayout>
      <div className="min-h-screen __custom-layout-wrapper text-white">
        {/* Header */}
        <div className="flex flex-col  mb-8 p-4 lg:p-6" data-tour="ai-dash-heading">
          {/* DEBUG BUTTON - Remove after debugging */}
          <div className="bg-red-600 p-4 rounded-lg !hidden">
            <button
              onClick={() => {
                console.log("🔴 DEBUG BUTTON CLICKED!")
                console.log("🔍 Current state:", {
                  asBg,
                  isNavigatedFromBulkGenerator,
                  setupComplete,
                  apiCalls,
                  currentSessionJobsLength: currentSessionJobs.length
                })
              }}
              className="bg-yellowTailwind-500 text-black px-4 py-2 rounded font-bold">
              DEBUG: Test Console Logs
            </button>
          </div>

          {/* <Link to="/ai-bulk-resume-generator">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 flex flex-row justify-center items-center w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link> */}
          <h1 className="text-xl lg:text-3xl font-bold text-white">
            Resume Dashboard
          </h1>
          <p className="text-lightGrey mt-2">
            Manage and generate tailored resumes for your job applications
          </p>
        </div>
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-8" data-tour="ai-dash-total">
          <div className="bg-dropdownBackground border border-formBorders rounded p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Resumes
                </p>
                <p className="text-3xl font-bold text-primary [&_.MuiCircularProgress-svg]:!text-white [&_.MuiBox-root]:!w-fit [&_.MuiBox-root]:!mt-[12px]">
                  {asBg || isLoadingSessionData ? (
                    <StaticCircularLoader size={18} />
                  ) : (
                    stats.totalResumes
                  )}
                </p>
              </div>
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="bg-dropdownBackground border border-formBorders rounded p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Avg Improvement
                </p>
                <p className="text-3xl font-bold text-primary [&_.MuiCircularProgress-svg]:!text-white [&_.MuiBox-root]:!w-fit [&_.MuiBox-root]:!mt-[12px]">
                  {asBg || isLoadingSessionData ? (
                    <StaticCircularLoader size={18} />
                  ) : (
                    `+${stats.avgImprovement}%`
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[green]" />
            </div>
          </div>

          <div className="bg-dropdownBackground border border-formBorders rounded p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">High Scores</p>
                <p className="text-3xl font-bold text-primary [&_.MuiCircularProgress-svg]:!text-white [&_.MuiBox-root]:!w-fit [&_.MuiBox-root]:!mt-[12px]">
                  {asBg || isLoadingSessionData ? (
                    <StaticCircularLoader size={18} />
                  ) : (
                    stats.highScores
                  )}
                </p>
              </div>
              <Star className="w-8 h-8 text-[#ffbf10]" />
            </div>
          </div>

          <div className="bg-dropdownBackground border border-formBorders rounded p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Ready to Apply
                </p>
                <p className="text-3xl font-bold text-primary [&_.MuiCircularProgress-svg]:!text-white [&_.MuiBox-root]:!w-fit [&_.MuiBox-root]:!mt-[12px]">
                  {asBg || isLoadingSessionData ? (
                    <StaticCircularLoader size={18} />
                  ) : (
                    stats.readyToApply
                  )}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple" />
            </div>
          </div>
        </div>
        {/* Filters and Search */}
        <div className=" rounded-xl backdrop-blur-sm mx-2 lg:mx-3">
          <div className="p-[16px] lg:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-3 pl-10 pr-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
                />
              </div>

              <div className="relative w-full md:flex-1">
                <select
                 data-tour="ai-dash-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded px-3 pr-10 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors !py-0">
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  {/* <option value="generating">Generating</option> */}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

          <div data-tour="ai-dash-generate">
                <Button
              data-tour="ai-dash-generate"
                onClick={
                  isGenerating || selectedJobIds.size === 0 || asBg
                    ? null
                    : startResumeGeneration
                }
                title={
                  isGenerating || selectedJobIds.size === 0 || asBg
                    ? "Select to Generate"
                    : "Generate Resumes"
                }
                className={
                  "w-full md:flex-1 flex items-center justify-center gap-2 h-10 bg-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-6 py-3 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed " +
                  (isGenerating || selectedJobIds.size === 0 || asBg
                    ? " cursor-not-allowed "
                    : "")
                }>
                {isGenerating || asBg ? (
                  <>
                    <div className="w-4 h-4">
                      <StaticCircularLoader size={16} />
                    </div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Selected{" "}
                    {selectedJobIds.size > 0 ? `(${selectedJobIds.size})` : ""}
                  </>
                )}
              </Button>
          </div>
              </div>

              {/* <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="company">Sort by Company</option>
                <option value="status">Sort by Status</option>
              </select> */}
            </div>

            {selectedJobIds.size === 0 && !isGenerating && (
              <div className="!hidden text-center text-sm text-gray-400 mt-2">
                Select jobs using the checkboxes to generate resumes
              </div>
            )}

            {isGenerating && (
              <div className="!hidden mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Overall Progress
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Unified Jobs Table */}
        <div className=" rounded-xl backdrop-blur-sm mx-2 lg:mx-3">
          <div className="p-[16px] lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex font-semibold text-white [&_.MuiCircularProgress-svg]:!text-white">
                <span className="min-w-fit relative">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(checkboxRef) => {
                      if (checkboxRef)
                        checkboxRef.indeterminate = isIndeterminate
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="inline-block lg:hidden w-4 h-4 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2 absolute left-[0px] top-[5px]"
                  />
                  <span className="ml-6 lg:ml-0">
                    {" "}
                    {asBg ? "Processing Resumes" : "All Jobs"}
                  </span>
                </span>

                <span
                  className={` ${
                    !asBg && isLoadingSessionData ? "!hidden" : ""
                  }  `}>
                  &nbsp;({filteredJobs.length})
                </span>
                {!asBg && isLoadingSessionData && (
                  <span className="ml-3">
                    <StaticCircularLoader size={18} />
                  </span>
                )}
                <div
                  className={
                    "flex flex-col lg:flex-row gap-2" +
                    (selectedJobIds.size > 0 ? " " : " !hidden ")
                  }>
                  {selectedJobIds.size > 0 && (
                    <span className="text-white ml-2">
                      • {selectedJobIds.size} selected
                    </span>
                  )}
                  <div className="flex flex-row lg:flex-row gap-2 mt-0 lg:mt-[-10px] ml-[-134px] lg:ml-0">
                    <select
                      value={bulkActionFilter}
                      onChange={(e) =>
                        setBulkActionFilter(e.target.value as any)
                      }
                      className="h-10 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full md:flex-1 bg-dropdownBackground text-primary rounded py-3 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors min-w-[130px] font-light !pt-[9px]">
                      <option value="regenerate">Regenerate</option>
                      <option value="delete">Delete</option>
                      <option value="download">Download</option>
                      {/* <option value="generating">Generating</option> */}
                    </select>

                    <Button
                      onClick={
                        isGenerating || selectedJobIds.size === 0 || asBg
                          ? null
                          : onApplyBulkAction
                      }
                      title={
                        isGenerating || selectedJobIds.size === 0 || asBg
                          ? "Select to Generate"
                          : "Generate Resumes"
                      }
                      className={
                        "w-full md:flex-1 flex items-center justify-center gap-2 h-10 bg-purple to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-6 py-3 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" +
                        (isGenerating || selectedJobIds.size === 0 || asBg
                          ? " cursor-not-allowed "
                          : "")
                      }>
                      {isGenerating || asBg ? (
                        <>
                          <div className="w-4 h-4">
                            <StaticCircularLoader size={16} />
                          </div>
                          {bulkActionFilter === "regenerate"
                            ? "Regenerating..."
                            : bulkActionFilter === "delete"
                            ? "Deleting..."
                            : "Downloading..."}
                        </>
                      ) : (
                        <>Apply</>
                      )}
                    </Button>
                  </div>
                </div>
              </h2>
              <div className="!hidden text-sm text-gray-400">
                {currentSessionJobs.length} current session •{" "}
                {
                  previousSessions.flatMap(
                    (s) => s.recent_generations || s.generated_resumes || []
                  ).length
                }{" "}
                previous sessions
              </div>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="space-y-4 lg:space-y-0 mb-14">
                {/* Desktop Header - Hidden on mobile/tablet */}
                <div className="hidden lg:grid lg:grid-cols-7 gap-4 p-6 border border-gray-600 border-b-gray-600 text-white font-semibold text-sm  rounded-t-[10px]">
                  <div className="items-center !hidden">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(checkboxRef) => {
                        if (checkboxRef)
                          checkboxRef.indeterminate = isIndeterminate
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="ml-2">Select</span>
                  </div>
                  <div className="relative ">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(checkboxRef) => {
                        if (checkboxRef)
                          checkboxRef.indeterminate = isIndeterminate
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2 absolute -left-[16px]"
                    />
                    <span className="ml-2 w-full whitespace-nowrap">
                      Job Details
                    </span>
                  </div>
                  <div>Description</div>
                  <div>Status</div>
                  <div>Original Score</div>
                  <div>Tailored Score</div>
                  <div>Improvement</div>
                  <div className="text-right">Actions</div>
                </div>

                {/* Job Rows */}
                {filteredJobs.map((jobData, index) => (
                  <div
                    key={`${jobData.type}-${jobData.generation_id}`}
                    className={`
                      relative
                      rounded-[10px] lg:rounded-sm border border-gray-600 transition-all duration-300 ease-in-out
                      lg:grid lg:grid-cols-7 lg:gap-4 lg:p-6 lg:items-start
                      md:border-l-4 md:border-l-purple
                      lg:border-l lg:border-l-gray-600
                      p-4 md:p-6 
                      ${
                        index === 0
                          ? "lg:rounded-t-none lg:border-t-0"
                          : "lg:border-t-0"
                      }
                      ${
                        index === filteredJobs.length - 1
                          ? "lg:rounded-b-[10px]"
                          : ""
                      }
                      ${
                        deletingJobIds.has(jobData.generation_id)
                          ? "opacity-0 transform scale-95 translate-y-[-10px] pointer-events-none"
                          : "opacity-100 transform scale-100 translate-y-0"
                      }
                      ${
                        openDropdownId === jobData.generation_id
                          ? "z-50"
                          : "z-10"
                      }
                    `}>
                    {/* Mobile/Tablet Layout */}
                    <div className="lg:hidden space-y-4">
                      {/* Selection and Job Details */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedJobIds.has(jobData.generation_id)}
                          onChange={(e) =>
                            handleSelectJob(
                              jobData.generation_id,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 mt-1 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
                        />
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="font-normal lg:font-medium text-white text-normal lg:text-lg">
                            {jobData.job_details.job_title}
                          </span>
                          <span className="text-sm text-gray-400">
                            {jobData.job_details.company_name}
                          </span>
                        </div>
                      </div>
                      {/* Description */}
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-white font-semibold uppercase tracking-wide">
                          Description
                        </div>
                        <div className="text-sm text-gray-400">
                          {jobData.job_details.job_description ? (
                            <span
                              className="block overflow-hidden text-ellipsis"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: "1.4rem",
                                maxHeight: "2.8rem"
                              }}
                              title={stripMarkdownAndTruncate(
                                jobData.job_details.job_description,
                                200
                              )}>
                              {stripMarkdownAndTruncate(
                                jobData.job_details.job_description
                              )}
                            </span>
                          ) : (
                            <span className="italic text-gray-500">
                              No description available
                            </span>
                          )}
                        </div>
                      </div>{" "}
                      {/* Status and Scores Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-white font-semibold uppercase tracking-wide">
                            Status
                          </div>
                          {getSessionJobStatusBadge(jobData)}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-white font-semibold uppercase tracking-wide">
                            Scores
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Original:
                              </span>
                              {processingJobIds.has(jobData.generation_id) ||
                              (isGenerating &&
                                jobData.generation_metadata
                                  ?.generation_status !== "completed" &&
                                jobData.generation_metadata
                                  ?.generation_status !== "failed") ||
                              (asBg &&
                                apiCalls.generateResumes.status === "pending" &&
                                !jobData.generated_resume?.has_resume_data) ? (
                                <div className="w-4 h-4">
                                  <StaticCircularLoader size={16} />
                                </div>
                              ) : (
                                <>
                                  <span className="text-lg font-bold text-white">
                                    {calculateScore(jobData)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    /100
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Tailored:
                              </span>
                              {processingJobIds.has(jobData.generation_id) ||
                              (isGenerating &&
                                jobData.generation_metadata
                                  ?.generation_status !== "completed" &&
                                jobData.generation_metadata
                                  ?.generation_status !== "failed") ||
                              (asBg &&
                                apiCalls.generateResumes.status === "pending" &&
                                !jobData.generated_resume?.has_resume_data) ? (
                                <div className="w-4 h-4">
                                  <StaticCircularLoader size={16} />
                                </div>
                              ) : (
                                <>
                                  <span className="text-lg font-bold text-white">
                                    {getBestScore(jobData)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    /100
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Improvement:
                              </span>
                              {processingJobIds.has(jobData.generation_id) ||
                              (isGenerating &&
                                jobData.generation_metadata
                                  ?.generation_status !== "completed" &&
                                jobData.generation_metadata
                                  ?.generation_status !== "failed") ||
                              (asBg &&
                                apiCalls.generateResumes.status === "pending" &&
                                !jobData.generated_resume?.has_resume_data) ? (
                                <div className="w-4 h-4">
                                  <StaticCircularLoader size={16} />
                                </div>
                              ) : (
                                (() => {
                                  const improvement =
                                    calculateScoreImprovement(jobData) || 0

                                  if (improvement > 0) {
                                    return (
                                      <>
                                        <TrendingUp className="w-4 h-4 text-[green]" />
                                        <span className=" text-[white] text-lg font-bold">
                                          +{improvement}
                                        </span>
                                      </>
                                    )
                                  }
                                  return (
                                    <>
                                      <TrendingUp className="w-4 h-4 text-white rotate-180" />
                                      <span className="font-bold text-lg text-[white]">
                                        0
                                      </span>
                                    </>
                                  )
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-white font-semibold uppercase tracking-wide">
                          Actions
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {processingJobIds.has(jobData.generation_id) ||
                          (isGenerating &&
                            jobData.generation_metadata?.generation_status !==
                              "completed" &&
                            jobData.generation_metadata?.generation_status !==
                              "failed") ||
                          (asBg &&
                            apiCalls.generateResumes.status === "pending" &&
                            !jobData.generated_resume?.has_resume_data) ? (
                            <div className="flex items-center gap-2 px-4 py-2">
                              <div className="w-4 h-4">
                                <StaticCircularLoader size={16} />
                              </div>
                              <span className="!hidden text-sm text-gray-400">
                                Processing...
                              </span>
                            </div>
                          ) : (
                            <>
                              {!jobData.generated_resume?.has_resume_data && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    generateIndividualResume(jobData)
                                  }
                                  className="h-10 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none flex justify-center !bg-purple text-primary rounded py-3 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders transition-colors">
                                  <Zap className="w-4 h-4 mr-1" />
                                  Generate
                                </Button>
                              )}

                              {/* Debug Preview Button - Hidden after implementing S3 URL support */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="!hidden border-yellowTailwind-600 text-yellowTailwind-300 hover:bg-yellowTailwind-900/20 hover:border-yellowTailwind-500"
                                onClick={() => {
                                  console.log(
                                    "🐛 Debug preview clicked for:",
                                    jobData
                                  )
                                  previewIndividualResume(jobData)
                                }}>
                                Debug Preview
                              </Button>

                              {jobData.generated_resume?.has_resume_data && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 ring-offset-background !flex items-center justify-center file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none bg-dropdownBackground text-primary rounded py-3 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
                                    onClick={() =>
                                      previewIndividualResume(jobData)
                                    }>
                                    Preview
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 ring-offset-background !flex items-center justify-center file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none bg-dropdownBackground text-primary rounded py-3 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
                                    onClick={() =>
                                      downloadIndividualResume(jobData)
                                    }>
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </>
                              )}

                              {/* Three-dot menu for mobile */}
                              <div
                                className="relative z-50 mt-[6px] -ml-[12px]"
                                data-dropdown-menu>
                                <button
                                  onClick={() =>
                                    handleDropdownToggle(jobData.generation_id)
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded-full transition-colors pointer-events-auto"
                                  aria-label="More options">
                                  <MoreVertical className="w-4 h-4 text-white" />
                                </button>

                                {openDropdownId === jobData.generation_id && (
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 rounded-lg shadow-lg z-[1000005] pointer-events-auto">
                                    <div className="py-1">
                                      <button
                                        onClick={() =>
                                          handleRegenerateJob(jobData)
                                        }
                                        className="w-full px-4 py-2 text-left text-sm text-white flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4" />
                                        Regenerate
                                      </button>
                                      <button
                                        onClick={() => handleDeleteJob(jobData)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Each field in its grid column */}
                    {/* Select Checkbox */}
                    <div className="hidden lg:items-center min-h-[60px]">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.has(jobData.generation_id)}
                        onChange={(e) =>
                          handleSelectJob(
                            jobData.generation_id,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-row items-center gap-2 relative">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.has(jobData.generation_id)}
                        onChange={(e) =>
                          handleSelectJob(
                            jobData.generation_id,
                            e.target.checked
                          )
                        }
                        className="hidden lg:block w-4 h-4 text-purple bg-dropdownBackground border-formBorders rounded focus:ring-purple-500 focus:ring-2 absolute -left-[16px]"
                      />

                      <div
                        className="ml-2 hidden lg:flex lg:flex-col gap-1 min-h-[60px] justify-center"
                        style={{
                          // @ts-ignore
                          "overflow-wrap": "anywhere",
                          "word-break": "normal"
                        }}>
                        <span className="font-medium text-white">
                          {jobData.job_details.job_title}
                        </span>
                        <span className="text-sm text-gray-400">
                          {jobData.job_details.company_name}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="hidden lg:flex lg:items-center text-sm text-gray-400 min-h-[60px]">
                      {jobData.job_details.job_description ? (
                        <span
                          className="block overflow-hidden text-ellipsis"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.4rem",
                            maxHeight: "2.8rem"
                          }}
                          title={stripMarkdownAndTruncate(
                            jobData.job_details.job_description,
                            200
                          )}>
                          {stripMarkdownAndTruncate(
                            jobData.job_details.job_description
                          )}
                        </span>
                      ) : (
                        <span className="italic text-gray-500">
                          No description available
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="hidden lg:flex lg:items-center min-h-[60px]">
                      {getSessionJobStatusBadge(jobData)}
                    </div>

                    {/* Original Score */}
                    <div className="hidden lg:flex lg:items-center gap-2 min-h-[60px]">
                      {processingJobIds.has(jobData.generation_id) ||
                      (isGenerating &&
                        jobData.generation_metadata?.generation_status !==
                          "completed" &&
                        jobData.generation_metadata?.generation_status !==
                          "failed") ||
                      (asBg &&
                        apiCalls.generateResumes.status === "pending" &&
                        !jobData.generated_resume?.has_resume_data) ? (
                        <div className="w-6 h-6">
                          <StaticCircularLoader size={20} />
                        </div>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-white">
                            {calculateScore(jobData)}
                          </span>
                          <span className="text-sm text-gray-400">/100</span>
                        </>
                      )}
                    </div>

                    {/* Tailored Score */}
                    <div className="hidden lg:flex lg:items-center gap-2 min-h-[60px]">
                      {processingJobIds.has(jobData.generation_id) ||
                      (isGenerating &&
                        jobData.generation_metadata?.generation_status !==
                          "completed" &&
                        jobData.generation_metadata?.generation_status !==
                          "failed") ||
                      (asBg &&
                        apiCalls.generateResumes.status === "pending" &&
                        !jobData.generated_resume?.has_resume_data) ? (
                        <div className="w-6 h-6">
                          <StaticCircularLoader size={20} />
                        </div>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-white">
                            {getBestScore(jobData)}
                          </span>
                          <span className="text-sm text-gray-400">/100</span>
                        </>
                      )}
                    </div>

                    {/* Improvement */}
                    <div className="hidden lg:flex lg:items-center gap-1 min-h-[60px]">
                      {processingJobIds.has(jobData.generation_id) ||
                      (isGenerating &&
                        jobData.generation_metadata?.generation_status !==
                          "completed" &&
                        jobData.generation_metadata?.generation_status !==
                          "failed") ||
                      (asBg &&
                        apiCalls.generateResumes.status === "pending" &&
                        !jobData.generated_resume?.has_resume_data) ? (
                        <div className="w-6 h-6">
                          <StaticCircularLoader size={20} />
                        </div>
                      ) : (
                        (() => {
                          const improvement = calculateScoreImprovement(jobData)
                          if (improvement !== null) {
                            if (improvement > 0) {
                              return (
                                <>
                                  <TrendingUp className="w-6 h-6 text-[green]" />
                                  <span className="font-bold text-white text-lg">
                                    +{improvement}
                                  </span>
                                </>
                              )
                            }
                          }
                          return (
                            <>
                              <TrendingUp className="w-6 h-6 text-white rotate-180" />
                              <span className="text-white text-lg font-bold">
                                0
                              </span>
                            </>
                          )
                        })()
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      className={
                        "hidden lg:flex lg:gap-2 lg:justify-end lg:items-center min-h-[60px] mr-0 __custom-action-pane" +
                        `
                        ${
                          isJobProcessing(jobData.generation_id) ||
                          processingJobIds.has(jobData.generation_id) ||
                          (isGenerating &&
                            jobData.generation_metadata?.generation_status !==
                              "completed" &&
                            jobData.generation_metadata?.generation_status !==
                              "failed") ||
                          (asBg &&
                            apiCalls.generateResumes.status === "pending" &&
                            !jobData.generated_resume?.has_resume_data)
                            ? ""
                            : "lg:mr-[-28px]"
                        }
                      
                      `
                      }>
                      {isJobProcessing(jobData.generation_id) ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                          <div className="w-4 h-4">
                            <StaticCircularLoader size={16} />
                          </div>
                          <span className="!hidden text-sm text-gray-400">
                            Processing...
                          </span>
                        </div>
                      ) : processingJobIds.has(jobData.generation_id) ||
                        (isGenerating &&
                          jobData.generation_metadata?.generation_status !==
                            "completed" &&
                          jobData.generation_metadata?.generation_status !==
                            "failed") ||
                        (asBg &&
                          apiCalls.generateResumes.status === "pending" &&
                          !jobData.generated_resume?.has_resume_data) ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                          <div className="w-4 h-4">
                            <StaticCircularLoader size={16} />
                          </div>
                          <span className="!hidden text-sm text-gray-400">
                            Processing...
                          </span>
                        </div>
                      ) : (
                        <>
                          {!jobData.generated_resume?.has_resume_data && (
                            <Button
                              size="sm"
                              onClick={() => generateIndividualResume(jobData)}
                              className="bg-purple-600 hover:bg-purple-700 text-white">
                              <Zap className="w-4 h-4 mr-1" />
                              Generate
                            </Button>
                          )}

                          {/* Debug Preview Button - Hidden after implementing S3 URL support */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="!hidden border-yellowTailwind-600 text-yellowTailwind-300 hover:bg-yellowTailwind-900/20 hover:border-yellowTailwind-500"
                            onClick={() => {
                              console.log(
                                "🐛 Debug preview clicked for:",
                                jobData
                              )
                              previewIndividualResume(jobData)
                            }}>
                            Debug Preview
                          </Button>

                          {jobData.generated_resume?.has_resume_data && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 ring-offset-background !flex items-center justify-center file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none bg-dropdownBackground text-primary rounded py-3 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
                                onClick={() =>
                                  previewIndividualResume(jobData)
                                }>
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 ring-offset-background !flex items-center justify-center file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none bg-dropdownBackground text-primary rounded py-3 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
                                onClick={() =>
                                  downloadIndividualResume(jobData)
                                }>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}

                          {/* Three-dot menu for desktop */}
                          <div
                            className="relative z-50 ml-0 lg:ml-[-15px]"
                            data-dropdown-menu>
                            <button
                              onClick={() =>
                                handleDropdownToggle(jobData.generation_id)
                              }
                              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors pointer-events-auto"
                              aria-label="More options">
                              <MoreVertical className="w-4 h-4 text-white" />
                            </button>

                            {openDropdownId === jobData.generation_id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 rounded-lg shadow-lg z-[1000004] pointer-events-auto">
                                <div className="py-1">
                                  <button
                                    onClick={() =>
                                      handleRegenerate(jobData.generation_id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-white flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />
                                    Regenerate
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(jobData)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!hidden text-center py-16 rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    No Jobs Found
                  </h3>
                  <p className="text-gray-400 mb-6 text-lg">
                    {searchTerm || statusFilter !== "all"
                      ? "No jobs match your current filters. Try adjusting your search or filters."
                      : "No jobs available for resume generation."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Link
                      to="/ai-bulk-resume-generator"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200">
                      Go back to add some jobs first
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>{" "}
      

      {/* Modern Preview Modal for session data */}
      <Dialog open={previewModalOpen} onOpenChange={closePreviewModal}>
        <DialogContent
          className={
            " max-w-[95vw] md:max-w-[90vw] lg:max-w-[95vw] w-full h-[95vh] p-0 gap-0 border [&_button.absolute.top-4]:!text-black [&_button.absolute.top-4]:!right-[8px] [&_button.absolute.top-4]:!top-[8px] !z-[1000005] " +
            (previewModalOpen ? "__custom-preview-modal-open" : "")
          }>
          <DialogHeader className="p-3 md:p-6 relative bg-white !border-[none] shadow-[none]">
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2 md:gap-0">
              <div className="flex flex-row justify-between w-full gap-2">
                <div className="w-full">
                  <DialogTitle className="text-lg md:text-[24px] flex flex-col md:flex-row md:justify-between font-semibold text-black gap-2 md:gap-0">
                    <span className="text-left text-base md:text-[24px]">
                      Resume Preview Comparison
                    </span>
                  </DialogTitle>
                  <div className="flex flex-col md:flex-row md:justify-between text-xs md:text-sm text-black mt-1 gap-2 md:gap-0">
                    <span className="leading-tight">
                      Compare your original resume with the AI-tailored version
                    </span>

                    {/* <button
                    onClick={() => {
                      setShowDiffHighlighting(!showDiffHighlighting)
                      setUseDocxHighlightFallback(false)
                    }}
                    className={`!hidden self-start md:self-auto px-3 py-1 rounded text-xs font-medium transition-colors ${
                      showDiffHighlighting
                        ? "bg-purple text-white"
                        : "bg-dropdownBackground border border-formBorders text-lightGrey hover:bg-purple/20"
                    }`}>
                    {!showDiffHighlighting ? "Show Changes" : "Hide Changes"}
                  </button> */}
                  </div>
                </div>
                <div className="mr-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex">
                      {previewJobId && (
                        <div className="flex-shrink-0 mt-[14px] mr-[12px] lg:mt-0 lg:ml-0">
                          <Badge
                            variant="secondary"
                            className="ml-0 md:ml-2 text-xs md:text-normal py-2 md:py-[9px] px-3 md:px-[24px] !bg-purple !text-white">
                            AI Job Preview
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="!hidden justify-end items-center gap-2">
                      <p className="text-black">Highlights:</p>
                      <div className="__custom-toggle-wrapper">
                        <ToggleButton
                          customOffWrapper={true}
                          isOn={showDiffHighlighting}
                          onToggle={() => {
                            setShowDiffHighlighting(!showDiffHighlighting)
                            setUseDocxHighlightFallback(false)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-1 absolute bottom-[-2px] left-0 bg-white"></div>
          </DialogHeader>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3 p-3 md:p-6 h-full overflow-auto lg:overflow-hidden bg-white">
            {/* Left: Original Resume */}
            <div className="__original-resume-wrapper flex flex-col h-max lg:h-full min-h-0 order-1 md:order-1">
              <div className="flex-1 overflow-hidden min-h-0 border rounded-xl bg-[#d9e9fe]">
                {previewUrls.oldResume ? (
                  <div className="hidden md:flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between gap-2 md:gap-3 p-3 md:p-4 bg-[#d9e9fe]">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-black truncate">
                          Original Resume
                        </h3>
                        <p className="text-xs text-black">
                          Your current resume
                        </p>
                      </div>
                      <div className="flex items-center justify-center rounded-full bg-dropdownBackground h-[32px] w-[32px] md:h-[36px] md:w-[36px] border border-formBorders flex-shrink-0">
                        <span className="text-base md:text-[19px] mt-[2px] md:mt-[3px] font-bold text-black">
                          {calculateScore(currentPreviewJobData)}
                        </span>
                        <span className="text-sm hidden text-lightGrey">
                          /100
                        </span>
                      </div>
                    </div>
                    <div className="w-full lg:h-full bg-white overflow-hidden h-[min-content] min-h-[200px] md:min-h-[400px]">
                      {previewUrls.oldResume.startsWith("http") ? (
                        <DocumentRenderer
                          url={previewUrls.oldResume}
                          title="Original Resume"
                          className="w-full h-full"
                        />
                      ) : (
                        <div
                          id="old-resume-preview"
                          className="w-full h-full min-h-[400px] bg-white"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between gap-2 md:gap-3 p-3 md:p-4 bg-[#d9e9fe]">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-black truncate">
                          Original Resume
                        </h3>
                        <p className="text-xs text-black">
                          Loading your current resume...
                        </p>
                      </div>
                      <div className="flex items-center justify-center rounded-full bg-dropdownBackground h-[32px] w-[32px] md:h-[36px] md:w-[36px] border border-formBorders flex-shrink-0">
                        <StaticCircularLoader size={16} />
                      </div>
                    </div>
                    <div className="w-full lg:h-full bg-white overflow-hidden h-[min-content] min-h-[200px] md:min-h-[400px] flex items-center justify-center">
                      <div className="text-center p-4">
                        <StaticCircularLoader size={32} />
                        <p className="text-sm font-medium text-primary mt-3">
                          Preparing original resume...
                        </p>
                        <p className="text-xs text-lightGrey mt-1">
                          This may take a moment
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center: New Tailored Resume */}
            <div className="flex flex-col h-max lg:h-full min-h-0 order-2 md:order-2">
              <div className="flex-1 overflow-hidden min-h-0 border rounded-xl bg-[#d9e9fe]">
                <div className="flex items-center justify-between gap-2 md:gap-3 p-3 md:p-4 bg-[#d9e9fe]">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-black flex items-center gap-2 truncate">
                      Tailored Resume
                      {/* <Badge
                        variant="secondary"
                        className="text-xs bg-purple/20 text-purple border-purple/30 font-medium">
                        AI Generated
                      </Badge> */}
                    </h3>
                    <p className="text-xs text-black">
                      AI-optimized for this job
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {
                      <div className="flex items-center justify-center gap-1 w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full border border-black">
                        <span className="text-base md:text-[19px] mt-[2px] md:mt-[3px] font-bold text-purple">
                          {Math.max(
                            calculateScore(currentPreviewJobData) || 0,
                            getTailoredScore(currentPreviewJobData) || 0
                          )}
                        </span>
                        <span className="text-sm hidden text-lightGrey">
                          /100
                        </span>
                      </div>
                    }
                    <button
                      onClick={() => {
                        setShowDiffHighlighting(!showDiffHighlighting)
                        setUseDocxHighlightFallback(false)
                      }}
                      className={`!hidden px-3 py-1 rounded text-xs font-medium transition-colors ${
                        showDiffHighlighting
                          ? "bg-purple text-white"
                          : "bg-dropdownBackground border border-formBorders text-lightGrey hover:bg-purple/20"
                      }`}>
                      {!showDiffHighlighting ? "Show Changes" : "Hide Changes"}
                    </button>
                  </div>
                </div>
                {showDiffHighlighting && (
                  <style>
                    {`
                      .docx-content:not(:has( > .document-content)) {
                        display: none !important
                      }
                    `}
                  </style>
                )}
                <style>
                  {`
                    .docx-content {
                      padding: 1rem !important;
                      margin-bottom: 70px !important;
                    }
                  `}
                </style>

                <div className="w-full h-full overflow-hidden bg-white min-h-[200px] md:min-h-[400px] relative">
                  <div className="">
                    <button
                      onClick={() =>
                        downloadIndividualResume(currentPreviewJobData)
                      }
                      className="cursor-pointer absolute top-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg transition-colors backdrop-blur-sm z-50"
                      title="Download Tailored Resume">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-download w-4 h-4"
                        aria-hidden="true">
                        <path d="M12 15V3"></path>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <path d="m7 10 5 5 5-5"></path>
                      </svg>
                    </button>
                  </div>

                  {previewUrls.newResume ? (
                    <div className="w-full h-full overflow-hidden">
                      {showDiffHighlighting
                        ? // Diff highlighting mode
                          (() => {
                            console.log("🎯 Diff highlighting mode enabled", {
                              hasOldResume: !!previewUrls.oldResume,
                              hasNewResume: !!previewUrls.newResume,
                              hasOriginalText: !!originalResumeText,
                              hasModifiedText: !!tailoredResumeText,
                              useDocxHighlightFallback,
                              oldResumeUrl: previewUrls.oldResume,
                              newResumeUrl: previewUrls.newResume
                            })

                            // Check if we can use DOCX highlighting
                            const canUseDocxHighlighting =
                              previewUrls.oldResume &&
                              previewUrls.newResume &&
                              !useDocxHighlightFallback &&
                              !previewUrls.oldResume.startsWith("temp://") &&
                              !previewUrls.newResume.startsWith("temp://")

                            if (
                              canUseDocxHighlighting &&
                              previewUrls.oldResume &&
                              previewUrls.newResume
                            ) {
                              console.log("🎯 Using DocxDiffHighlighter")
                              return (
                                <div className="w-full h-full overflow-auto bg-white">
                                  <DocxDiffHighlighter
                                    originalDocxUrl={previewUrls.oldResume}
                                    modifiedDocxUrl={previewUrls.newResume}
                                    originalText={originalResumeText}
                                    modifiedText={tailoredResumeText}
                                    className="h-full"
                                    onError={(error) => {
                                      console.warn(
                                        "DOCX highlighting failed, falling back to text highlighting:",
                                        error.message
                                      )
                                      setUseDocxHighlightFallback(true)
                                    }}
                                  />
                                </div>
                              )
                            } else if (
                              originalResumeText &&
                              tailoredResumeText
                            ) {
                              // Fallback to simple text-based diff highlighting
                              const hasTempUrl =
                                previewUrls.oldResume?.startsWith("temp://") ||
                                previewUrls.newResume?.startsWith("temp://")
                              console.log(
                                "🎯 Using SimpleTextHighlighter fallback",
                                {
                                  originalTextLength: originalResumeText.length,
                                  tailoredTextLength: tailoredResumeText.length,
                                  useDocxHighlightFallback,
                                  reason: hasTempUrl
                                    ? "temp URL detected"
                                    : "DOCX highlighting failed"
                                }
                              )
                              return (
                                <div className="w-full h-full overflow-auto bg-white relative">
                                  <SimpleTextHighlighter
                                    originalText={originalResumeText}
                                    modifiedText={tailoredResumeText}
                                    className="h-full"
                                  />
                                  {/* Minimal, subtle indicator for text-based highlighting */}
                                  <div className="absolute top-1 right-1 bg-gray-100/80 text-gray-600 px-2 py-1 rounded text-[10px] z-10 opacity-60">
                                    {hasTempUrl ? "Text mode" : "Text mode"}
                                  </div>
                                </div>
                              )
                            } else {
                              console.log(
                                "🎯 No diff data available, showing message"
                              )
                              return (
                                <div className="flex items-center justify-center h-full text-lightGrey bg-almostBlack/80">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-primary">
                                      Diff highlighting not available
                                    </p>
                                    <p className="text-xs text-lightGrey mt-1">
                                      Missing resume data for comparison
                                    </p>
                                  </div>
                                </div>
                              )
                            }
                          })()
                        : // Normal preview mode (no diff highlighting)
                          (() => {
                            console.log("🎯 Normal preview mode (no diff)", {
                              newResumeUrl: previewUrls.newResume,
                              isHttpUrl:
                                previewUrls.newResume.startsWith("http")
                            })

                            if (previewUrls.newResume.startsWith("http")) {
                              // S3 URL - use our custom DocumentRenderer
                              return (
                                <DocumentRenderer
                                  url={previewUrls.newResume}
                                  title="Tailored Resume"
                                  className="w-full h-full"
                                />
                              )
                            } else {
                              // Local blob URL - use docx-preview
                              return (
                                <div
                                  id="new-resume-preview"
                                  className="w-full h-full min-h-[400px] bg-white overflow-auto [&>section.docx-content:not(:has(>_.document-content))]:!w-auto [&>section.docx-content:has(>_article)]:!p-4"
                                />
                              )
                            }
                          })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px] md:min-h-[300px]">
                      <div className="text-center p-4">
                        <StaticCircularLoader size={32} />
                        <p className="text-sm font-medium text-primary mt-3">
                          Preparing tailored resume...
                        </p>
                        <p className="text-xs text-lightGrey mt-1">
                          AI is optimizing your resume for this job
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Job Details */}
            <div className="flex flex-col rounded-xl h-max lg:h-full min-h-0 order-3 md:order-3 lg:order-3">
              <div className="hidden items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Job Details
                </h3>
              </div>
              <div className="flex-1 overflow-auto space-y-3 md:space-y-4 min-h-[calc(100vh-200px)] lg:min-h-[200px] md:min-h-0">
                {currentPreviewJobData ? (
                  <div className="space-y-3 md:space-y-4">
                    {/* Position Card - Yellow/Orange Theme */}
                    <div className="bg-gradient-to-br from-yellowTailwind-500/15 via-yellowTailwind-400/10 to-yellowTailwind-300/15 rounded-xl shadow-lg shadow-yellowTailwind-500/10 transition-all duration-300">
                      <div className="p-3 md:p-4 bg-gradient-to-r from-yellowTailwind-500/10 to-yellowTailwind-400/10 rounded-t-xl">
                        <span className="text-xs md:text-sm font-bold text-black px-2 py-1 bg-white  rounded tracking-wide break-words">
                          {currentPreviewJobData.job_details?.job_title ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="p-3 md:p-4">
                        <div className=" backdrop-blur-sm rounded-lg p-2 md:p-3">
                          <p className="text-sm md:text-[24px] -ml-1 md:-ml-3 w-fit text-black bg-white  rounded break-all font-medium">
                            Company:{" "}
                            {currentPreviewJobData.job_details?.company_name ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Job Description Card - Ocean Teal Theme */}
                    {currentPreviewJobData.job_details?.job_description && (
                      <div className="bg-gradient-to-br from-teal-500/15 via-teal-400/10 to-cyan-400/15 rounded-xl shadow-lg shadow-teal-500/10 transition-all duration-300 ">
                        <div className="p-3 md:p-4 bg-gradient-to-r from-teal-500/10 to-cyan-400/10 rounded-t-xl">
                          <span className="text-xs md:text-sm px-2 py-1 font-bold text-black bg-white  rounded tracking-wide">
                            Job Description
                          </span>
                        </div>
                        <div className="p-3 md:p-4">
                          <div className="backdrop-blur-sm rounded-lg p-2 md:p-3 max-h-[40vh] lg:max-h-32 md:max-h-40 overflow-y-auto">
                            <div
                              className="text-xs text-black [&_strong]:!text-black leading-relaxed markdown-content prose-sm prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: marked.parse(
                                  currentPreviewJobData.job_details
                                    .job_description,
                                  { async: false }
                                ) as string
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Required Skills Card - Sky Blue Theme */}
                    {currentPreviewJobData.job_details?.job_skills &&
                      currentPreviewJobData.job_details.job_skills.length >
                        0 && (
                        <div className="bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-sky-400/15 rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-300">
                          <div className="p-3 md:p-4 bg-gradient-to-r from-blue-500/10 to-sky-400/10 rounded-t-xl">
                            <span className="text-xs md:text-sm px-2 py-1 font-bold text-black bg-white  rounded tracking-wide">
                              Required Skills
                            </span>
                          </div>
                          <div className="p-3 md:p-4">
                            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-2 md:p-3 max-h-[35vh] lg:max-h-28 md:max-h-32 overflow-y-auto">
                              <div className="flex flex-wrap gap-1 md:gap-2">
                                {(() => {
                                  // Helper function to split a skill string into individual skills
                                  const splitSkillString = (
                                    skillString: string
                                  ): string[] => {
                                    const trimmed = skillString.trim()
                                    if (!trimmed) return []

                                    // Helper to validate if a string is a meaningful skill
                                    const isValidSkill = (
                                      skill: string
                                    ): boolean => {
                                      const cleaned = skill.trim()
                                      // Filter out empty strings, standalone numbers, or very short strings
                                      if (cleaned.length < 2) return false
                                      if (/^\d+$/.test(cleaned)) return false // Pure numbers
                                      if (/^\d+\.$/.test(cleaned)) return false // Numbers with dot
                                      if (/^[^\w]+$/.test(cleaned)) return false // Only special characters
                                      return true
                                    }

                                    let results: string[] = []

                                    // Check for numbered format: "1. Skill A 2. Skill B"
                                    if (trimmed.match(/\d+\.\s*/)) {
                                      results = trimmed
                                        .split(/(?=\d+\.\s*)/)
                                        .map((skill) =>
                                          skill.replace(/^\d+\.\s*/, "").trim()
                                        )
                                        .filter((skill) => skill.length > 0)
                                        .map((skill) =>
                                          skill
                                            .replace(/\s+\d+\.\s*.*$/, "")
                                            .trim()
                                        )
                                        .filter(isValidSkill)
                                    }
                                    // Check for comma-separated
                                    else if (trimmed.includes(",")) {
                                      results = trimmed
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(isValidSkill)
                                    }
                                    // Check for semicolon-separated
                                    else if (trimmed.includes(";")) {
                                      results = trimmed
                                        .split(";")
                                        .map((s) => s.trim())
                                        .filter(isValidSkill)
                                    }
                                    // Check for "and" separated
                                    else if (trimmed.includes(" and ")) {
                                      results = trimmed
                                        .split(" and ")
                                        .map((s) => s.trim())
                                        .filter(isValidSkill)
                                    }
                                    // Check for bullet separated
                                    else if (trimmed.includes(" • ")) {
                                      results = trimmed
                                        .split(" • ")
                                        .map((s) => s.trim())
                                        .filter(isValidSkill)
                                    }
                                    // Check for line-separated
                                    else if (trimmed.includes("\n")) {
                                      results = trimmed
                                        .split("\n")
                                        .map((s) => s.trim())
                                        .filter(isValidSkill)
                                    }
                                    // Single skill
                                    else {
                                      results = isValidSkill(trimmed)
                                        ? [trimmed]
                                        : []
                                    }

                                    return results
                                  }

                                  let skillsArray: string[] = []

                                  if (
                                    Array.isArray(
                                      currentPreviewJobData.job_details
                                        .job_skills
                                    )
                                  ) {
                                    // Skills are already an array, but each item might contain multiple skills
                                    skillsArray =
                                      currentPreviewJobData.job_details.job_skills
                                        .flatMap((skill) => {
                                          if (typeof skill === "string") {
                                            // Split each array item in case it contains multiple skills
                                            return splitSkillString(skill)
                                          }
                                          return [skill]
                                        })
                                        .filter(
                                          (skill) => skill && skill.length > 0
                                        )
                                  } else if (
                                    typeof currentPreviewJobData.job_details
                                      .job_skills === "string"
                                  ) {
                                    // Fallback for string format
                                    skillsArray = splitSkillString(
                                      currentPreviewJobData.job_details
                                        .job_skills
                                    )
                                  }

                                  return skillsArray.map(
                                    (skill: string, index: number) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 bg-blue-400/20 text-black bg-white text-xs rounded border border-blue-400/30 break-words">
                                        {skill}
                                      </span>
                                    )
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center p-4">
                      <p className="text-sm font-medium text-primary">
                        No job details available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Legacy Preview Modal - fallback for old data structure */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl lg:max-w-7xl max-h-[95vh] overflow-hidden bg-modalPurple border border-customGray">
          <DialogHeader className="border-b border-customGray bg-almostBlack/80 rounded-t-lg p-3 md:p-6">
            <DialogTitle className="flex flex-col md:flex-row md:items-center gap-2 text-primary text-base md:text-lg">
              <span>Resume Preview Comparison</span>
              {previewData && (
                <Badge
                  variant="default"
                  className="ml-0 md:ml-2 !bg-purple/30 !text-purple !border-purple text-xs self-start md:self-auto">
                  {previewData.jobTitle}
                </Badge>
              )}
            </DialogTitle>
            {previewData && (
              <p className="text-xs md:text-sm text-lightGrey">
                Compare your original resume with the AI-tailored version
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden bg-modalPurple">
            {previewData ? (
              // Side-by-side comparison view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 h-[60vh] md:h-[70vh] p-3 md:p-4">
                {/* Original Resume */}
                <div className="flex flex-col order-1 md:order-1">
                  <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-customGray">
                    <h3 className="font-semibold text-primary text-sm md:text-base">
                      Original Resume
                    </h3>
                  </div>
                  <div className="flex-1 border border-customGray rounded-lg overflow-hidden bg-almostBlack/80 min-h-[200px] md:min-h-[300px]">
                    {" "}
                    {previewData.originalResumeFile ? (
                      // Try to show DOCX file preview
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex flex-col">
                          <div className="p-2 bg-almostBlack/80 border-b border-customGray text-xs text-primary">
                            <span>DOCX Preview - </span>
                            <button
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = previewData.originalResumeFile!
                                link.download = "Original_Resume.docx"
                                link.click()
                              }}
                              className="underline hover:text-purple text-lightGrey">
                              Download to view full formatting
                            </button>
                          </div>
                          <div className="flex-1 p-2 md:p-4 overflow-auto">
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                              {previewData.originalResume}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fallback to text content
                      <div className="p-2 md:p-4 overflow-auto h-full">
                        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                          {previewData.originalResume}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tailored Resume */}
                <div className="flex flex-col order-2 md:order-2">
                  <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-customGray">
                    <h3 className="font-semibold text-primary text-sm md:text-base">
                      Tailored Resume
                    </h3>
                    {/* <Badge
                      variant="default"
                      className="!bg-purple/30 !text-purple !border-purple text-xs">
                      AI Generated
                    </Badge> */}
                  </div>
                  <div className="flex-1 border border-customGray rounded-lg overflow-hidden bg-almostBlack/80 min-h-[200px] md:min-h-[300px]">
                    {previewData.tailoredResumeFile &&
                    previewData.tailoredResumeFile.startsWith(
                      "data:application/vnd.openxmlformats"
                    ) ? (
                      // Show DOCX file preview with download option
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex flex-col">
                          <div className="p-2 bg-almostBlack/80 border-b border-customGray text-xs text-primary">
                            <span>DOCX Generated - </span>
                            <button
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = previewData.tailoredResumeFile!
                                link.download = `${previewData.jobTitle}_${previewData.company}_Resume.docx`
                                link.click()
                              }}
                              className="underline hover:text-purple text-lightGrey">
                              Download DOCX
                            </button>
                          </div>
                          <div className="flex-1 p-2 md:p-4 overflow-auto">
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                              {previewData.tailoredResume}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fallback to text content
                      <div className="p-2 md:p-4 overflow-auto h-full">
                        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                          {previewData.tailoredResume}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex flex-col order-3 md:order-3 lg:order-3">
                  <div className="hidden items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-customGray">
                    <h3 className="font-semibold text-primary text-sm md:text-base">
                      Job Details
                    </h3>
                  </div>
                  <div className="space-y-3 md:space-y-4 min-h-[200px] md:min-h-0 overflow-auto">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-primary text-sm">
                          Position
                        </h4>
                      </div>
                      <Badge
                        variant="outline"
                        className="mb-2 !bg-purple !text-white text-xs">
                        {previewData.jobTitle}
                      </Badge>
                      <p className="text-xs md:text-sm text-lightGrey">
                        {previewData.company}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-primary text-sm">
                          Description
                        </h4>
                      </div>
                      <div className="max-h-28 md:max-h-32 overflow-auto border border-customGray rounded p-2 md:p-3 bg-dropdownBackground text-xs">
                        <span className="text-lightGrey">
                          {previewData.jobDescription ||
                            "No description provided"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-primary text-sm">
                          Required Skills
                        </h4>
                      </div>
                      <div className="max-h-20 md:max-h-24 overflow-auto bg-dropdownBackground rounded p-2 md:p-3 border border-formBorders">
                        {previewData.skills ? (
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              // Helper function to split a skill string into individual skills
                              const splitSkillString = (
                                skillString: string
                              ): string[] => {
                                const trimmed = skillString.trim()
                                if (!trimmed) return []

                                // Helper to validate if a string is a meaningful skill
                                const isValidSkill = (
                                  skill: string
                                ): boolean => {
                                  const cleaned = skill.trim()
                                  // Filter out empty strings, standalone numbers, or very short strings
                                  if (cleaned.length < 2) return false
                                  if (/^\d+$/.test(cleaned)) return false // Pure numbers
                                  if (/^\d+\.$/.test(cleaned)) return false // Numbers with dot
                                  if (/^[^\w]+$/.test(cleaned)) return false // Only special characters
                                  return true
                                }

                                let results: string[] = []

                                // Check for numbered format: "1. Skill A 2. Skill B"
                                if (trimmed.match(/\d+\.\s*/)) {
                                  results = trimmed
                                    .split(/(?=\d+\.\s*)/)
                                    .map((skill) =>
                                      skill.replace(/^\d+\.\s*/, "").trim()
                                    )
                                    .filter((skill) => skill.length > 0)
                                    .map((skill) =>
                                      skill.replace(/\s+\d+\.\s*.*$/, "").trim()
                                    )
                                    .filter(isValidSkill)
                                }
                                // Check for comma-separated
                                else if (trimmed.includes(",")) {
                                  results = trimmed
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(isValidSkill)
                                }
                                // Check for semicolon-separated
                                else if (trimmed.includes(";")) {
                                  results = trimmed
                                    .split(";")
                                    .map((s) => s.trim())
                                    .filter(isValidSkill)
                                }
                                // Check for "and" separated
                                else if (trimmed.includes(" and ")) {
                                  results = trimmed
                                    .split(" and ")
                                    .map((s) => s.trim())
                                    .filter(isValidSkill)
                                }
                                // Check for bullet separated
                                else if (trimmed.includes(" • ")) {
                                  results = trimmed
                                    .split(" • ")
                                    .map((s) => s.trim())
                                    .filter(isValidSkill)
                                }
                                // Check for line-separated
                                else if (trimmed.includes("\n")) {
                                  results = trimmed
                                    .split("\n")
                                    .map((s) => s.trim())
                                    .filter(isValidSkill)
                                }
                                // Single skill
                                else {
                                  results = isValidSkill(trimmed)
                                    ? [trimmed]
                                    : []
                                }

                                return results
                              }

                              let skillsArray: string[] = []

                              if (Array.isArray(previewData.skills)) {
                                // Skills are already an array, but each item might contain multiple skills
                                skillsArray = previewData.skills
                                  .flatMap((skill) => {
                                    if (typeof skill === "string") {
                                      // Split each array item in case it contains multiple skills
                                      return splitSkillString(skill)
                                    }
                                    return [skill]
                                  })
                                  .filter((skill) => skill && skill.length > 0)
                              } else if (
                                typeof previewData.skills === "string"
                              ) {
                                // Fallback for string format
                                skillsArray = splitSkillString(
                                  previewData.skills
                                )
                              }

                              return skillsArray.map(
                                (skill: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs !bg-purple !text-white">
                                    {skill}
                                  </Badge>
                                )
                              )
                            })()}
                          </div>
                        ) : (
                          <span className="text-xs text-lightGrey">
                            No skills specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : previewContent ? (
              // Single resume text preview (fallback)
              <div className="w-full h-[60vh] md:h-[70vh] border border-customGray rounded p-3 md:p-4 bg-almostBlack/80 overflow-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm leading-relaxed text-lightGrey">
                  {previewContent}
                </pre>
              </div>
            ) : previewUrl ? (
              // Office document preview (fallback)
              <div className="w-full h-[60vh] md:h-[70vh] border border-customGray rounded bg-almostBlack/80">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    previewUrl
                  )}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Resume Preview">
                  <div className="text-lightGrey p-3 md:p-4">
                    This browser does not support document preview. Please
                    download the file to view it.
                  </div>
                </iframe>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[60vh] md:h-[70vh] text-lightGrey">
                <div className="text-center p-4">
                  <p className="text-sm font-medium text-primary">
                    Resume not available for preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Confirmation Modal - Only show in non-background mode */}
      {!asBg && (
        <CreditConfirmationModal
          isOpen={creditModal.isOpen}
          onClose={closeCreditModal}
          onConfirm={handleCreditConfirmation}
          creditValidation={creditModal.creditValidation!}
          isLoading={creditModal.isLoading}
          customHeaderMessage={
            creditModal.creditValidation?.action === "tailored_resume" &&
            creditModal.creditValidation?.creditCost > 0
              ? "This is paid operation"
              : undefined
          }
        />
      )}

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

const MemomizedInternalInitializeResumeGeneration = React.memo(
  InternalInitializeResumeGeneration
)

const InitializeResumeGeneration: React.FC<{
  className?: string
}> = ({ className }) => {
  const [searchParams] = useSearchParams()
  const hasCompeltedKey = searchParams.has("completed")
  const key = hasCompeltedKey
    ? "initialize-resume-generation" + Math.random() + Date.now()
    : "initialize-resume-generation"

  const isProcessCompleteNow = searchParams.get("completed") == "true"
  const setSubscription = useSubscriptionStore((set) => set.setSubscription)
  const setLoadingSubscription = useSubscriptionStore(
    (set) => set.setLoadingSubscription
  )

  const setResumeList = useDashboardStore((set) => set.setResumeList)

  useEffect(() => {
    if (isProcessCompleteNow) {
      const store = useResumeGenerationStore.getState()
      store.resetStore()
      localStorage.removeItem("resume-generation-store")
    }
  }, [isProcessCompleteNow])

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

  return (
    <MemomizedInternalInitializeResumeGeneration
      key={key}
      className={className}
    />
  )
}

export default InitializeResumeGeneration
