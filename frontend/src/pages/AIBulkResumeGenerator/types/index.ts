export interface JobRow {
  id: string
  companyUrl: string
  jobTitle: string
  description: string
  skills: string
}

export interface BulkJobGeneratorProps {
  className?: string
  onJobsGenerated?: (jobs: JobRow[]) => void
}

export interface APIRequestBody {
  company_url: string
  context?: string
  target_role?: string
  years_experience?: number
  language?: string
  job_title?: string
  job_description?: string
  generate_type?: string
}

export interface APIError {
  message: string
  status: number
  waitMs?: number
  isRateLimit?: boolean
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIError
}

export interface RetryState {
  [jobId: string]: {
    [field: string]: {
      canRetry: boolean
      waitMs: number
      retryAfter: number
    }
  }
}

export interface FieldErrors {
  [jobId: string]: {
    [field: string]: string
  }
}

// API Response data structures
export interface JobDescriptionData {
  job_description: string
  company: string
  job_title: string
  metadata: {
    company_url: string
    years_experience: string
    language: string
    context: string
    generated_at: string
    tokens_used: number
  }
}

export interface JobSkillsData {
  skills: string
  skills_string: string
  skills_array: string[]
  company: string
  job_title: string
  metadata: {
    company_url: string
    years_experience: string
    language: string
    job_description: string
    generated_at: string
    tokens_used: number
  }
}

export interface JobTitleData {
  job_title: string
  company: string
  metadata: {
    company_url: string
    years_experience: string
    language: string
    context: string
    generated_at: string
    tokens_used: number
  }
}

// Credit Status Types
export interface CreditStatusResponse {
  msg: string
  success: boolean
  data: {
    credit_status: {
      planName: string
      planIdentifier: string
      monthlyCreditsLimit: number
      monthlyCreditsUsed: number
      extraCredits: number
      totalCreditsAvailable: number
      usage: {
        jobDescriptionGenerations: number
        jobSkillsGenerations: number
        jobTitleGenerations: number
        tailoredResumesUsed: number
        generationsWithoutTailoring: number
      }
      trialStatus: {
        isTrialActive: boolean
        isTrialExpired: boolean
        hasCreditsRemaining: boolean
        daysSinceStart: number
        daysRemaining: number
        creditsRemaining: number
        shouldLockFeatures: boolean
      }
      freeUsageLimits: {
        JOB_DESCRIPTION_GENERATION: number
        JOB_SKILLS_GENERATION: number
        JOB_TITLE_GENERATION: number
        TAILORED_RESUME: number
      }
    }
    action_types: {
      [key: string]: {
        action_name: string
        credit_cost: number
        free_limit: number
        description: string
      }
    }
    session_info: {
      active_sessions: ActiveSession[]
      session_stats: {
        _id: string | null
        total_sessions: number
        total_generations: number
        total_credits_used: number
        total_tokens_used: number
        avg_generations_per_session: number
      }
      recent_generations: any[]
    }
    summary: {
      total_credits_available: number
      active_sessions_count: number
      total_sessions_ever: number
      total_generations_ever: number
      recent_generations_count: number
      free_generations_status: {
        any_free_limits_exceeded: boolean
        sessions_with_free_usage: number
      }
    }
  }
}

export interface ActiveSession {
  session_id: string
  status: string
  total_generations: number
  total_credits_used: number
  created_at: string
  expires_at: string
  base_resume: {
    original_filename: string
    file_format: string
    uploaded_at: string
  }
  free_generation_stats: {
    job_title_used: boolean
    job_description_used: boolean
    job_skills_used: boolean
    free_limits_exceeded: boolean
  }
}

export interface CreditValidationResult {
  canProceed: boolean
  needsConfirmation: boolean
  action: string
  creditCost: number
  freeUsed: boolean
  message: string
  shouldShowUpgradeModal?: boolean
}

export type ActionType =
  | "job_title_generation"
  | "job_description_generation"
  | "job_skills_generation"
  | "tailored_resume"
