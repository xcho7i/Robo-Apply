import {
  JobRow,
  APIError,
  APIResponse,
  CreditStatusResponse,
  CreditValidationResult,
  ActionType,
  ActiveSession
} from "../types"
import { BASE_URL } from "../../../api"
import API_ENDPOINTS from "../../../api/endpoints"
import { generateTitleContext, formatCompanyUrl } from "./fileUtils"

/**
 * Generate UUID v4
 */
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("access_token")
}

// Track if credit status has been checked in current operation
let creditStatusChecked = false
let creditStatusData: CreditStatusResponse | null = null

/**
 * Check AI resume tailor credit status - only called once per operation
 */
const checkCreditStatus = async (): Promise<CreditStatusResponse | null> => {
  if (creditStatusChecked && creditStatusData) {
    console.log(
      "💳 Credit status already checked in this operation, returning cached data..."
    )
    return creditStatusData
  }

  try {
    console.log("💳 Checking AI resume tailor credit status...")
    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.AIResumeTailorCreditStatus}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        }
      }
    )

    if (!response.ok) {
      console.error("💳 Credit status API error:", response.status)
      return null
    }

    const data: CreditStatusResponse = await response.json()
    console.log("💳 Credit status response:", data)

    // Validate the response has the expected structure
    if (!data || !data.success || !data.data || !data.data.session_info) {
      console.error("💳 Invalid credit status response format:", data)
      return null
    }

    // Cache the response and mark as checked
    creditStatusData = data
    creditStatusChecked = true

    return data
  } catch (error) {
    console.error("💳 Failed to check credit status:", error)
    // Still mark as checked to prevent retries on error
    creditStatusChecked = true
    return null
  }
}

/**
 * Validate if user can proceed with an action based on credit status
 */
const validateCreditForAction = async (
  actionType: ActionType,
  sessionId: string,
  forceFresh: boolean = false
): Promise<CreditValidationResult> => {
  // If we need fresh data (e.g., before showing modal), reset the cache
  if (forceFresh) {
    creditStatusChecked = false
    creditStatusData = null
  }

  const creditStatus = await checkCreditStatus()

  if (!creditStatus || !creditStatus.success) {
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: 0,
      freeUsed: false,
      message: "Unable to check credit status. Please try again."
    }
  }

  const { data } = creditStatus
  const actionInfo = data.action_types[actionType]

  if (!actionInfo) {
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: 0,
      freeUsed: false,
      message: "Unknown action type."
    }
  }

  // Check if user has zero credits - if so, show upgrade modal
  if (data.credit_status.totalCreditsAvailable === 0) {
    console.log("💳 Zero credits detected - should show upgrade modal")
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: actionInfo.credit_cost,
      freeUsed: true,
      message:
        "You have no credits remaining. Please upgrade your plan to continue.",
      shouldShowUpgradeModal: true
    }
  }

  // Find the current session
  if (!data.session_info || !data.session_info.active_sessions) {
    console.error("💳 Missing session_info in credit status response")
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: 0,
      freeUsed: false,
      message: "Unable to check session status. Please refresh and try again."
    }
  }

  const currentSession = data.session_info.active_sessions.find(
    (session: ActiveSession) => session.session_id === sessionId
  )

  if (!currentSession) {
    console.error(`💳 Session ${sessionId} not found in active sessions`)
    console.log(
      `💳 Available active sessions:`,
      data.session_info.active_sessions.map((s) => s.session_id)
    )

    // For sessions from previous_sessions that are not in active_sessions,
    // we'll assume they are valid and allow the operation to proceed
    // This handles the case where jobs come from previous_sessions
    console.log(
      `💳 Session not found in active sessions. Assuming valid session from previous_sessions.`
    )

    const creditsAvailable =
      +(
        document.querySelector("#__credits-available-number")?.textContent ||
        "0"
      ) || data.credit_status.totalCreditsAvailable

    // For tailored_resume generation, always proceed with credit charge
    if (actionType === "tailored_resume") {
      const hasCredits =
        data.credit_status.totalCreditsAvailable >= actionInfo.credit_cost

      if (!hasCredits) {
        return {
          canProceed: false,
          needsConfirmation: false,
          action: actionType,
          creditCost: actionInfo.credit_cost,
          freeUsed: true,
          message: `Insufficient credits. You need ${actionInfo.credit_cost} credits for ${actionInfo.action_name}. Available: ${creditsAvailable}`,
          shouldShowUpgradeModal: true
        }
      }

      return {
        canProceed: true,
        needsConfirmation: false,
        action: actionType,
        creditCost: actionInfo.credit_cost,
        freeUsed: true,
        message: `This will cost ${actionInfo.credit_cost} credits. Available: ${creditsAvailable}`
      }
    }

    // For other action types, return session not found error
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: actionInfo.credit_cost,
      freeUsed: false,
      message: "Session not found. Please refresh and try again."
    }
  }

  // Check if free generation is used for this action
  let freeUsed = false

  // Log the session info for debugging
  console.log(
    `💳 Session ${sessionId} free generation stats:`,
    currentSession.free_generation_stats
  )

  switch (actionType) {
    case "job_title_generation":
      freeUsed = currentSession.free_generation_stats.job_title_used === true
      break
    case "job_description_generation":
      freeUsed =
        currentSession.free_generation_stats.job_description_used === true
      break
    case "job_skills_generation":
      freeUsed = currentSession.free_generation_stats.job_skills_used === true
      break
    case "tailored_resume":
      freeUsed = true // Always charged for tailored resume
      break
  }

  console.log(`💳 Action ${actionType} free used: ${freeUsed}`)

  // Check if user has sufficient credits
  const hasCredits =
    data.credit_status.totalCreditsAvailable >= actionInfo.credit_cost

  const creditsAvailable =
    +(
      document.querySelector("#__credits-available-number")?.textContent || "0"
    ) || data.credit_status.totalCreditsAvailable

  if (freeUsed && !hasCredits) {
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: actionInfo.credit_cost,
      freeUsed: true,
      message: `Insufficient credits. You need ${actionInfo.credit_cost} credits for ${actionInfo.action_name}. Available: ${creditsAvailable}`,
      shouldShowUpgradeModal: true
    }
  }

  if (freeUsed && actionInfo.credit_cost > 0) {
    return {
      canProceed: true,
      needsConfirmation: true,
      action: actionType,
      creditCost: actionInfo.credit_cost,
      freeUsed: true,
      message: `You have used your free ${actionInfo.action_name}. This action will cost ${actionInfo.credit_cost} credits. Continue?`
    }
  }

  // Free generation available or action costs 0 credits - no confirmation needed
  return {
    canProceed: true,
    needsConfirmation: false,
    action: actionType,
    creditCost: 0,
    freeUsed: false,
    message: `Free ${actionInfo.action_name} available.`
  }
}

/**
 * Clean markdown formatting and convert to plain text
 * Simple, reliable approach that handles all common markdown syntax
 */
const cleanMarkdownFormatting = (text: string): string => {
  if (!text) return ""

  return (
    text
      // Remove markdown headers (# ## ### etc.)
      .replace(/^#{1,6}\s+(.*)$/gm, "$1")
      // Remove bold (**text** or __text__)
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      // Remove italic (*text* or _text_)
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove strikethrough (~~text~~)
      .replace(/~~(.*?)~~/g, "$1")
      // Remove code blocks (```...```)
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code (`text`)
      .replace(/`([^`]+)`/g, "$1")
      // Remove links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove reference links [text][ref]
      .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
      // Remove images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove horizontal rules (--- or ***)
      .replace(/^(---|\*\*\*|___)\s*$/gm, "")
      // Remove blockquotes (> text)
      .replace(/^>\s+/gm, "")
      // Remove unordered list markers (- * + •)
      .replace(/^[\s]*[-\*\+•]\s+/gm, "")
      // Remove ordered list markers (1. 2. etc.)
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Remove table separators |---|---|
      .replace(/\|.*\|/g, "")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Clean up multiple spaces (but preserve single spaces)
      .replace(/[ \t]+/g, " ")
      // Clean up multiple consecutive line breaks (more than 2)
      .replace(/\n{3,}/g, "\n\n")
      // Remove leading/trailing whitespace from each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Trim overall whitespace
      .trim()
  )
}
const handleAPIResponse = async (response: Response): Promise<any> => {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error: APIError = {
      message: data.msg || data.message || `API Error: ${response.status}`,
      status: response.status,
      isRateLimit: response.status === 429
    }

    // Extract wait time for rate limit errors - check both direct and nested locations
    if (response.status === 429) {
      error.waitMs =
        data.wait_ms || data.data?.wait_ms || data.retry_after || 60000 // Default 1 minute
    }

    throw error
  }

  return data
}

/**
 * Create API response wrapper
 */
const createAPIResponse = async <T>(
  apiCall: () => Promise<Response>
): Promise<APIResponse<T>> => {
  try {
    const response = await apiCall()
    const data = await handleAPIResponse(response)
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error || (error as any).status) {
      return {
        success: false,
        error: error as APIError
      }
    }
    return {
      success: false,
      error: {
        message: "Unknown error occurred",
        status: 500
      }
    }
  }
}

/**
 * Generate job titles using AI
 */
export const generateJobTitles = async (
  job: JobRow,
  allJobs: JobRow[],
  targetRole: string,
  yearsExperience: string,
  language: string,
  sessionId: string,
  skipCreditCheck: boolean = false,
  batchId?: string
): Promise<
  APIResponse<string> & { creditValidation?: CreditValidationResult }
> => {
  console.log(
    `🚀 generateJobTitles called with skipCreditCheck: ${skipCreditCheck}`
  )

  // Validate credit status before making API call - only if not skipping
  if (!skipCreditCheck) {
    console.log("💳 Performing credit check for job title generation...")
    const creditValidation = await validateCreditForAction(
      "job_title_generation",
      sessionId,
      true // Always fetch fresh data before showing modal
    )
    if (!creditValidation.canProceed) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
    if (creditValidation.needsConfirmation) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
  } else {
    console.log(
      "🚀 Skipping credit check for job title generation - proceeding directly to API"
    )
  }

  console.log("🔥 Making actual API call for job title generation...")
  const context = generateTitleContext(allJobs)
  const companyUrl = formatCompanyUrl(job.companyUrl)

  const job_title =
    allJobs.find((j) => typeof j.jobTitle == "string" && j.jobTitle?.length)
      ?.jobTitle || ""

  const response = await createAPIResponse<any>(async () => {
    const requestBody: any = {
      company_url: companyUrl,
      context,
      target_role: targetRole,
      years_experience: yearsExperience,
      language,
      SESSION_ID: sessionId,
      job_title,
      original_id: job.id // Include original job ID for context
    }

    // Add BATCH_ID if provided (for batch/parallel operations)
    if (batchId) {
      requestBody.BATCH_ID = batchId
    }

    return fetch(`${BASE_URL}${API_ENDPOINTS.GenerateSingleAIJobTitle}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })
  })

  if (response.success && response.data) {
    console.log("🔍 generateJobTitles - Raw API response:", response.data)
    console.log(
      "🔍 generateJobTitles - Response.data.data:",
      response.data.data
    )
    const title =
      response.data.data?.job_title ||
      response.data.job_title ||
      response.data.title ||
      response.data.generated_title ||
      ""
    console.log("🔍 generateJobTitles - Extracted title:", title)
    return { ...response, data: title }
  }

  return response as APIResponse<string>
}

/**
 * Generate job descriptions using AI
 */
export const generateJobDescriptions = async (
  job: JobRow,
  targetRole: string,
  yearsExperience: string,
  language: string,
  sessionId: string,
  skipCreditCheck: boolean = false,
  batchId?: string
): Promise<
  APIResponse<string> & { creditValidation?: CreditValidationResult }
> => {
  console.log(
    `🚀 generateJobDescriptions called with skipCreditCheck: ${skipCreditCheck}`
  )

  // Validate credit status before making API call - only if not skipping
  if (!skipCreditCheck) {
    console.log("💳 Performing credit check for job description generation...")
    const creditValidation = await validateCreditForAction(
      "job_description_generation",
      sessionId,
      true // Always fetch fresh data before showing modal
    )
    if (!creditValidation.canProceed) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
    if (creditValidation.needsConfirmation) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
  } else {
    console.log(
      "🚀 Skipping credit check for job description generation - proceeding directly to API"
    )
  }

  console.log("🔥 Making actual API call for job description generation...")
  const companyUrl = formatCompanyUrl(job.companyUrl)

  const response = await createAPIResponse<any>(async () => {
    const requestBody: any = {
      company_url: companyUrl,
      job_title: job.jobTitle,
      target_role: targetRole,
      years_experience: yearsExperience,
      language,
      SESSION_ID: sessionId,
      original_id: job.id // Include original job ID for context
    }

    // Add BATCH_ID if provided (for batch/parallel operations)
    if (batchId) {
      requestBody.BATCH_ID = batchId
    }

    return fetch(
      `${BASE_URL}${API_ENDPOINTS.GenerateSingleAIJobDescriptionV2}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(requestBody)
      }
    )
  })

  if (response.success && response.data) {
    console.log("🔍 generateJobDescriptions - Raw API response:", response.data)
    console.log(
      "🔍 generateJobDescriptions - Data keys:",
      Object.keys(response.data)
    )
    console.log("🔍 generateJobDescriptions - Data.data:", response.data.data)
    console.log(
      "🔍 generateJobDescriptions - Data.data keys:",
      response.data.data ? Object.keys(response.data.data) : "null"
    )

    const _description =
      response.data.data?.job_description ||
      response.data.job_description ||
      response.data.description ||
      response.data.generated_description ||
      ""

    const description = cleanMarkdownFormatting(_description)
    console.log(
      "🔍 generateJobDescriptions - Extracted description:",
      description
    )
    return { ...response, data: description }
  }

  return response as APIResponse<string>
}

/**
 * Generate job skills using AI
 */
export const generateJobSkills = async (
  job: JobRow,
  targetRole: string,
  yearsExperience: string,
  language: string,
  sessionId: string,
  skipCreditCheck: boolean = false,
  batchId?: string
): Promise<
  APIResponse<string> & { creditValidation?: CreditValidationResult }
> => {
  console.log(
    `🚀 generateJobSkills called with skipCreditCheck: ${skipCreditCheck}`
  )

  // Validate credit status before making API call - only if not skipping
  if (!skipCreditCheck) {
    console.log("💳 Performing credit check for job skills generation...")
    const creditValidation = await validateCreditForAction(
      "job_skills_generation",
      sessionId,
      true // Always fetch fresh data before showing modal
    )
    if (!creditValidation.canProceed) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
    if (creditValidation.needsConfirmation) {
      return {
        success: false,
        error: {
          message: creditValidation.message,
          status: 402 // Payment Required
        },
        creditValidation
      }
    }
  } else {
    console.log(
      "🚀 Skipping credit check for job skills generation - proceeding directly to API"
    )
  }

  console.log("🔥 Making actual API call for job skills generation...")
  const companyUrl = formatCompanyUrl(job.companyUrl)

  const response = await createAPIResponse<any>(async () => {
    const requestBody: any = {
      company_url: companyUrl,
      job_title: job.jobTitle,
      job_description: job.description,
      target_role: targetRole,
      years_experience: yearsExperience,
      language,
      SESSION_ID: sessionId,
      original_id: job.id // Include original job ID for context
    }

    // Add BATCH_ID if provided (for batch/parallel operations)
    if (batchId) {
      requestBody.BATCH_ID = batchId
    }

    return fetch(`${BASE_URL}${API_ENDPOINTS.GenerateSingleAISkill}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })
  })

  if (response.success && response.data) {
    console.log("🔍 generateJobSkills - Raw API response:", response.data)
    console.log("🔍 generateJobSkills - Data keys:", Object.keys(response.data))
    console.log("🔍 generateJobSkills - Data.data:", response.data.data)
    console.log(
      "🔍 generateJobSkills - Data.data keys:",
      response.data.data ? Object.keys(response.data.data) : "null"
    )

    const skills =
      response.data.data?.skills ||
      response.data.skills ||
      response.data.generated_skills ||
      ""
    console.log("🔍 generateJobSkills - Extracted skills:", skills)
    return { ...response, data: skills }
  }

  return response as APIResponse<string>
}

/**
 * Generate complete row AI content with parallel API calls
 */
export const generateCompleteRowAI = async (
  job: JobRow,
  allJobs: JobRow[],
  targetRole: string,
  yearsExperience: string,
  language: string,
  sessionId: string,
  skipCreditCheck: boolean = false,
  batchId?: string
): Promise<{
  title?: {
    data?: string
    error?: APIError
    creditValidation?: CreditValidationResult
  }
  description?: {
    data?: string
    error?: APIError
    creditValidation?: CreditValidationResult
  }
  skills?: {
    data?: string
    error?: APIError
    creditValidation?: CreditValidationResult
  }
}> => {
  console.log("🔄 generateCompleteRowAI - Starting for job:", job.id)
  console.log("📋 Current job state:", {
    companyUrl: job.companyUrl,
    jobTitle: job.jobTitle,
    description: job.description,
    skills: job.skills
  })

  // For bulk operations, credit validation is handled at a higher level
  // This should only be called with skipCreditCheck=true from bulk operations
  if (!skipCreditCheck) {
    console.warn("⚠️ generateCompleteRowAI called without skipCreditCheck flag")
  }

  // Check credit status before making any API calls
  await checkCreditStatus()

  const generatedItems: {
    title?: {
      data?: string
      error?: APIError
      creditValidation?: CreditValidationResult
    }
    description?: {
      data?: string
      error?: APIError
      creditValidation?: CreditValidationResult
    }
    skills?: {
      data?: string
      error?: APIError
      creditValidation?: CreditValidationResult
    }
  } = {}

  // Prepare parallel API calls
  const apiCalls: Promise<void>[] = []

  // Generate title if missing
  if (!job.jobTitle.trim()) {
    console.log("📝 Will generate title for job:", job.id)
    apiCalls.push(
      generateJobTitles(
        job,
        allJobs,
        targetRole,
        yearsExperience,
        language,
        sessionId,
        true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
        batchId // Pass batchId for batch/parallel operations
      )
        .then((titleResponse) => {
          generatedItems.title = titleResponse.success
            ? { data: titleResponse.data }
            : { error: titleResponse.error }
        })
        .catch((error) => {
          console.error("Failed to generate title:", error)
          generatedItems.title = {
            error: {
              message: "Failed to generate title",
              status: 500
            }
          }
        })
    )
  }

  // Generate description if missing
  if (!job.description.trim()) {
    console.log("📄 Will generate description for job:", job.id)
    apiCalls.push(
      generateJobDescriptions(
        job,
        targetRole,
        yearsExperience,
        language,
        sessionId,
        true, // skipCreditCheck - bulk operations handle credit validation at the bulk level
        batchId // Pass batchId for batch/parallel operations
      )
        .then((descriptionResponse) => {
          generatedItems.description = descriptionResponse.success
            ? { data: descriptionResponse.data }
            : { error: descriptionResponse.error }
        })
        .catch((error) => {
          console.error("Failed to generate description:", error)
          generatedItems.description = {
            error: {
              message: "Failed to generate description",
              status: 500
            }
          }
        })
    )
  }

  // Generate skills if missing
  if (!job.skills.trim()) {
    console.log("🎯 Will generate skills for job:", job.id)
    apiCalls.push(
      generateJobSkills(
        job,
        targetRole,
        yearsExperience,
        language,
        sessionId,
        true, // skipCreditCheck
        batchId // Pass batchId for batch/parallel operations
      )
        .then((skillsResponse) => {
          generatedItems.skills = skillsResponse.success
            ? { data: skillsResponse.data }
            : { error: skillsResponse.error }
        })
        .catch((error) => {
          console.error("Failed to generate skills:", error)
          generatedItems.skills = {
            error: {
              message: "Failed to generate skills",
              status: 500
            }
          }
        })
    )
  }

  // Wait for all API calls to complete in parallel
  console.log(
    `🚀 Starting ${apiCalls.length} parallel API calls for job:`,
    job.id
  )
  await Promise.all(apiCalls)

  console.log(
    "✅ generateCompleteRowAI - Results for job:",
    job.id,
    generatedItems
  )
  return generatedItems
}

/**
 * Start a new operation - resets credit status check flag
 */
export const startNewOperation = (): void => {
  console.log("🔄 startNewOperation called - clearing credit cache")
  console.log("🔄 Before reset:", {
    creditStatusChecked,
    creditStatusData: !!creditStatusData
  })
  creditStatusChecked = false
  creditStatusData = null
  console.log("🔄 After reset:", {
    creditStatusChecked,
    creditStatusData: !!creditStatusData
  })
  console.log("🔄 Starting new operation - credit status check flag reset")
}

/**
 * Reset credit status check flag and cached data - useful for testing or when needed
 */
export const resetCreditStatusCheck = (): void => {
  creditStatusChecked = false
  creditStatusData = null
  console.log("💳 Credit status check flag and cached data reset")
}

/**
 * Export credit validation function for use in components
 */
export const validateCreditForActionExport = async (
  actionType: ActionType,
  sessionId: string,
  forceFresh: boolean = true
) => {
  console.log(
    `🔍 Validating credits for ${actionType}, forceFresh=${forceFresh}`
  )
  return await validateCreditForAction(actionType, sessionId, forceFresh)
}

/**
 * Process bulk generation with parallel requests
 */
export const processBulkGeneration = async <T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  delay: number = 100
): Promise<void> => {
  // Process all items in parallel with a small delay between batches to prevent overwhelming the server
  const batchSize = 5 // Process 5 items at a time
  const batches: T[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    // Process batch in parallel
    await Promise.all(batch.map(processor))

    // Add delay between batches (except for the last one)
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

/**
 * Calculate bulk credit requirements for multiple jobs and actions
 */
export const calculateBulkCreditRequirements = async (
  jobs: JobRow[],
  actionTypes: ActionType[],
  sessionId: string
): Promise<{
  canProceed: boolean
  needsConfirmation: boolean
  totalCreditCost: number
  freeUsed: boolean
  message: string
  shouldShowUpgradeModal?: boolean
  breakdown: {
    [actionType: string]: {
      jobsRequiringGeneration: number
      creditCostPerJob: number
      totalCreditsForAction: number
      freeAvailable: boolean
    }
  }
}> => {
  const creditStatus = await checkCreditStatus()

  if (!creditStatus || !creditStatus.success) {
    return {
      canProceed: false,
      needsConfirmation: false,
      totalCreditCost: 0,
      freeUsed: false,
      message: "Unable to check credit status. Please try again.",
      breakdown: {}
    }
  }

  const { data } = creditStatus
  const currentSession = data.session_info.active_sessions.find(
    (session: ActiveSession) => session.session_id === sessionId
  )

  if (!currentSession) {
    console.error(
      `💳 Session ${sessionId} not found in active sessions for bulk calculation`
    )
    console.log(
      `💳 Available active sessions:`,
      data.session_info.active_sessions.map((s) => s.session_id)
    )

    // For sessions from previous_sessions, we'll proceed with credit calculation
    // assuming all actions require credits (no free generations available)
    console.log(
      `💳 Session not found in active sessions. Assuming valid session from previous_sessions for bulk calculation.`
    )

    let totalCreditCost = 0
    const breakdown: {
      [actionType: string]: {
        jobsRequiringGeneration: number
        creditCostPerJob: number
        totalCreditsForAction: number
        freeAvailable: boolean
      }
    } = {}

    for (const actionType of actionTypes) {
      const actionInfo = data.action_types[actionType]
      if (!actionInfo) continue

      // For sessions not in active_sessions, assume no free generations available
      const jobsRequiringGeneration = jobs.length
      const creditCostForAction =
        jobsRequiringGeneration * actionInfo.credit_cost
      totalCreditCost += creditCostForAction

      breakdown[actionType] = {
        jobsRequiringGeneration,
        creditCostPerJob: actionInfo.credit_cost,
        totalCreditsForAction: creditCostForAction,
        freeAvailable: false
      }
    }

    const hasCredits =
      data.credit_status.totalCreditsAvailable >= totalCreditCost

    // For tailored_resume actions, always require confirmation in bulk operations
    const needsConfirmation =
      actionTypes.includes("tailored_resume") && totalCreditCost > 0

    const creditsAvailable =
      +(
        document.querySelector("#__credits-available-number")?.textContent ||
        "0"
      ) || data.credit_status.totalCreditsAvailable

    if (
      data.credit_status.totalCreditsAvailable === 0 ||
      totalCreditCost > data.credit_status.totalCreditsAvailable ||
      !hasCredits
    ) {
      console.log("💳 Zero credits detected - should show upgrade modal")
      return {
        canProceed: hasCredits,
        needsConfirmation,
        totalCreditCost,
        freeUsed: true,

        breakdown,

        message:
          "You have no credits remaining. Please upgrade your plan to continue.",
        shouldShowUpgradeModal: true
      }
    }

    return {
      canProceed: hasCredits,
      needsConfirmation,
      totalCreditCost,
      freeUsed: true,
      message: hasCredits
        ? `This will cost ${totalCreditCost} credits total. Available: ${creditsAvailable}`
        : `Insufficient credits. You need ${totalCreditCost} credits total. Available: ${creditsAvailable}`,
      breakdown,
      shouldShowUpgradeModal:
        !hasCredits ||
        totalCreditCost > data.credit_status.totalCreditsAvailable ||
        data.credit_status.totalCreditsAvailable === 0
    }
  }

  let totalCreditCost = 0
  let anyFreeUsed = false
  let anyNeedsConfirmation = false
  const breakdown: {
    [actionType: string]: {
      jobsRequiringGeneration: number
      creditCostPerJob: number
      totalCreditsForAction: number
      freeAvailable: boolean
    }
  } = {}

  // Calculate requirements for each action type
  for (const actionType of actionTypes) {
    const actionInfo = data.action_types[actionType]

    // Special handling for tailored_resume if not found in API response
    if (!actionInfo && actionType === "tailored_resume") {
      console.log(
        "💳 tailored_resume not found in API response, using fallback logic"
      )

      const jobsRequiringGeneration = jobs.length
      const creditCostPerJob = 1 // Assume 1 credit per tailored resume
      const creditsForThisAction = jobsRequiringGeneration * creditCostPerJob

      totalCreditCost += creditsForThisAction
      anyFreeUsed = false // No free generations for tailored resumes
      anyNeedsConfirmation = true // Always need confirmation for paid operations

      breakdown[actionType] = {
        jobsRequiringGeneration,
        creditCostPerJob,
        totalCreditsForAction: creditsForThisAction,
        freeAvailable: false
      }

      continue
    }

    if (!actionInfo) continue

    let jobsRequiringGeneration = 0

    // Count jobs that need generation based on action type
    switch (actionType) {
      case "job_title_generation":
        jobsRequiringGeneration = jobs.filter(
          (job) => job.companyUrl.trim() && !job.jobTitle.trim()
        ).length
        break
      case "job_description_generation":
        jobsRequiringGeneration = jobs.filter(
          (job) => job.companyUrl.trim() && !job.description.trim()
        ).length
        break
      case "job_skills_generation":
        jobsRequiringGeneration = jobs.filter(
          (job) => job.companyUrl.trim() && !job.skills.trim()
        ).length
        break
      case "tailored_resume":
        // For bulk resume generation, count all jobs provided
        jobsRequiringGeneration = jobs.length
        break
    }

    if (jobsRequiringGeneration === 0) continue

    // Check if free generation is available for this action
    let freeAvailable = false
    switch (actionType) {
      case "job_title_generation":
        freeAvailable = !currentSession.free_generation_stats.job_title_used
        break
      case "job_description_generation":
        freeAvailable =
          !currentSession.free_generation_stats.job_description_used
        break
      case "job_skills_generation":
        freeAvailable = !currentSession.free_generation_stats.job_skills_used
        break
      case "tailored_resume":
        freeAvailable = false // Always charged
        break
    }

    // Calculate credits needed for this action
    let creditsForThisAction = 0
    if (freeAvailable && jobsRequiringGeneration > 0) {
      // First job is free, rest require credits
      creditsForThisAction =
        (jobsRequiringGeneration - 1) * actionInfo.credit_cost
      anyFreeUsed = true
      if (jobsRequiringGeneration > 1) {
        anyNeedsConfirmation = true
      }
    } else {
      // All jobs require credits
      creditsForThisAction = jobsRequiringGeneration * actionInfo.credit_cost
      anyFreeUsed = true
      anyNeedsConfirmation = true
    }

    totalCreditCost += creditsForThisAction

    breakdown[actionType] = {
      jobsRequiringGeneration,
      creditCostPerJob: actionInfo.credit_cost,
      totalCreditsForAction: creditsForThisAction,
      freeAvailable
    }
  }

  // Check if user has sufficient credits
  const hasCredits = data.credit_status.totalCreditsAvailable >= totalCreditCost

  const creditsAvailable =
    +(
      document.querySelector("#__credits-available-number")?.textContent || "0"
    ) || data.credit_status.totalCreditsAvailable

  if (
    (totalCreditCost > 0 && !hasCredits) ||
    totalCreditCost > creditsAvailable
  ) {
    return {
      canProceed: false,
      needsConfirmation: false,
      totalCreditCost,
      freeUsed: anyFreeUsed,
      message: `Insufficient credits. You need ${totalCreditCost} credits for this bulk operation. Available: ${creditsAvailable}`,
      breakdown,
      shouldShowUpgradeModal: true
    }
  }

  // Generate detailed message
  let message = ""
  if (anyNeedsConfirmation && totalCreditCost > 0) {
    const actionMessages: string[] = []

    for (const [actionType, info] of Object.entries(breakdown)) {
      if (info.jobsRequiringGeneration === 0) continue

      // Get action name from API or use fallback for tailored_resume
      let actionName = data.action_types[actionType]?.action_name
      if (!actionName) {
        if (actionType === "tailored_resume") {
          actionName = "Tailored Resume Generation"
        } else {
          actionName = actionType.replace(/_/g, " ")
        }
      }

      if (info.freeAvailable && info.jobsRequiringGeneration === 1) {
        actionMessages.push(`${actionName} (1 job - FREE)`)
      } else if (info.freeAvailable && info.jobsRequiringGeneration > 1) {
        actionMessages.push(
          `${actionName} (${info.jobsRequiringGeneration} jobs: 1 FREE + ${
            info.jobsRequiringGeneration - 1
          } × ${info.creditCostPerJob} credits = ${
            info.totalCreditsForAction
          } credits)`
        )
      } else {
        actionMessages.push(
          `${actionName} (${info.jobsRequiringGeneration} jobs × ${info.creditCostPerJob} credits = ${info.totalCreditsForAction} credits)`
        )
      }
    }

    message = `This operation will process:\n\n${actionMessages.join(
      "\n"
    )}\n\nTotal credits required: ${totalCreditCost}\nContinue?`
  } else {
    message = "All generations are free for this operation."
  }

  // For tailored_resume in bulk operations, always require confirmation
  const forceConfirmationForTailoredResume =
    actionTypes.includes("tailored_resume")

  return {
    canProceed: true,
    needsConfirmation:
      forceConfirmationForTailoredResume ||
      (anyNeedsConfirmation && totalCreditCost > 0),
    totalCreditCost,
    freeUsed: anyFreeUsed,
    message,
    breakdown
  }
}

/**
 * Validate credit requirements for bulk operations with detailed breakdown
 */
export const validateBulkCreditRequirements = async (
  jobs: JobRow[],
  actionType: ActionType,
  sessionId: string
): Promise<CreditValidationResult & { bulkBreakdown?: any }> => {
  const bulkResult = await calculateBulkCreditRequirements(
    jobs,
    [actionType],
    sessionId
  )

  if (!bulkResult.canProceed) {
    return {
      canProceed: false,
      needsConfirmation: false,
      action: actionType,
      creditCost: bulkResult.totalCreditCost,
      freeUsed: bulkResult.freeUsed,
      message: bulkResult.message,
      bulkBreakdown: bulkResult.breakdown,
      shouldShowUpgradeModal: bulkResult.shouldShowUpgradeModal
    }
  }

  return {
    canProceed: true,
    needsConfirmation: bulkResult.needsConfirmation,
    action: actionType,
    creditCost: bulkResult.totalCreditCost,
    freeUsed: bulkResult.freeUsed,
    message: bulkResult.message,
    bulkBreakdown: bulkResult.breakdown,
    shouldShowUpgradeModal: bulkResult.shouldShowUpgradeModal
  }
}
