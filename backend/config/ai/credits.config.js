/**
 * RoboApply Credit System Configuration
 * 
 * This configuration defines the credit costs, free usage limits, and gating logic
 * for the AI-powered resume tailoring platform.
 */

// Credit costs for each feature/endpoint
const CREDIT_COSTS = {
  // AI Resume Tailor endpoints (current file)
  JOB_DESCRIPTION_GENERATION: 0,  // After 3 free uses
  JOB_SKILLS_GENERATION: 0,       // After 3 free uses  
  JOB_TITLE_GENERATION: 0,        // After 3 free uses
  TAILORED_RESUME: 15,             // Full resume tailoring
  
  // Other platform features (for future reference)
  AUTO_APPLY: 6,
  AI_COVER_LETTER: 7,
  RESUME_BUILDER: 9,
  RESUME_SCORE: 8,
  INTERVIEW_BUDDY: 15
}

// Free usage limits before credit deduction begins
const FREE_USAGE_LIMITS = {
  JOB_DESCRIPTION_GENERATION: 3,
  JOB_SKILLS_GENERATION: 3,
  JOB_TITLE_GENERATION: 3,
  TAILORED_RESUME: 0  // No free uses - always costs credits
}

// Trial configuration for new users
const TRIAL_CONFIG = {
  INITIAL_CREDITS: 60,
  TRIAL_DURATION_DAYS: 3,
  MAX_FULL_APPLICATION_FLOWS: 3  // Based on 60 credits / ~20 credits per flow
}

// Smart gating logic configuration
const GATING_LOGIC = {
  // Threshold for showing abuse warning
  GENERATION_ABUSE_THRESHOLD: 3,  // Show warning after 3 generations without tailoring
  
  // Warning messages
  ABUSE_WARNING_MESSAGE: "Looks like you've generated job descriptions several times without tailoring a resume. To continue, you'll need to use credits or proceed with tailoring.",
  
  // Credit insufficient messages
  INSUFFICIENT_CREDITS_MESSAGE: "Insufficient credits. Please upgrade your plan to continue using AI features.",
  
  // Trial expired messages
  TRIAL_EXPIRED_MESSAGE: "Your 3-day trial has expired. Please subscribe to a paid plan to continue using RoboApply features.",
  
  // Feature locked messages
  FEATURE_LOCKED_MESSAGE: "This feature is locked. Please subscribe to unlock all features and access your history."
}

// Credit calculation logic
const CREDIT_CALCULATION = {
  /**
   * Calculate credits needed for a job generation operation
   * @param {string} operationType - Type of operation (JOB_DESCRIPTION_GENERATION, etc.)
   * @param {number} userGenerationCount - How many times user has used this feature
   * @param {boolean} hasTailoredAfterGeneration - Whether user tailored resume after generation
   * @returns {number} Credits to deduct
   */
  calculateGenerationCredits: (operationType, userGenerationCount, hasTailoredAfterGeneration = false) => {
    const freeLimit = FREE_USAGE_LIMITS[operationType] || 0
    const creditCost = CREDIT_COSTS[operationType] || 0
    
    // If within free usage limit, no credits needed
    if (userGenerationCount <= freeLimit) {
      return 0
    }
    
    // KEY FIX: If they tailored a resume after generation, no extra charge for the generation
    if (hasTailoredAfterGeneration) {
      return 0
    }
    
    // Otherwise, charge the credit cost
    return creditCost
  },
  
  /**
   * Calculate credits for tailored resume operation
   * @returns {number} Credits to deduct
   */
  calculateTailoringCredits: () => {
    return CREDIT_COSTS.TAILORED_RESUME
  },
  
  /**
   * NEW: Calculate if user should be warned about abuse
   * @param {number} generationsWithoutTailoring - Count of generations without tailoring
   * @param {number} totalGenerations - Total generations this session
   * @returns {Object} Warning status and message
   */
  shouldWarnAbuse: (generationsWithoutTailoring, totalGenerations) => {
    // Progressive warnings based on generations without tailoring
    if (generationsWithoutTailoring >= 5) {
      return {
        shouldWarn: true,
        shouldBlock: true,
        message: "You've generated job descriptions several times without tailoring a resume. To continue, you'll need to use credits or proceed with tailoring.",
        severity: "BLOCKING"
      }
    } else if (generationsWithoutTailoring >= 3) {
      return {
        shouldWarn: true,
        shouldBlock: false,
        message: "Consider tailoring a resume to get the most value from your generations. Continued use without tailoring will consume credits.",
        severity: "WARNING"
      }
    }
    
    return {
      shouldWarn: false,
      shouldBlock: false,
      message: null,
      severity: "NONE"
    }
  }
}

// Usage tracking configuration
const USAGE_TRACKING = {
  // Fields to track in user subscription.usage
  TRACKED_OPERATIONS: [
    'jobDescriptionGenerations',
    'jobSkillsGenerations', 
    'jobTitleGenerations',
    'tailoredResumesUsed',
    'generationsWithoutTailoring'  // For abuse detection
  ],
  
  // Reset periods
  DAILY_RESET_OPERATIONS: [],  // Operations that reset daily
  MONTHLY_RESET_OPERATIONS: [  // Operations that reset monthly
    'jobDescriptionGenerations',
    'jobSkillsGenerations',
    'jobTitleGenerations',
    'tailoredResumesUsed'
  ]
}

// Trial status checking
const TRIAL_STATUS = {
  /**
   * Check if user's trial is still valid
   * @param {Object} user - User object with subscription data
   * @returns {Object} Trial status information
   */
  checkTrialStatus: (user) => {
    const now = new Date()
    const trialStart = new Date(user.subscription?.startDate)
    const trialEnd = new Date(user.subscription?.endDate)
    const creditsRemaining = user.subscription?.remaining?.monthlyCredits || 0
    
    const isTrialExpired = now > trialEnd
    const hasCreditsRemaining = creditsRemaining > 0
    const daysSinceStart = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
    
    return {
      isTrialActive: !isTrialExpired && hasCreditsRemaining,
      isTrialExpired,
      hasCreditsRemaining,
      daysSinceStart,
      daysRemaining: Math.max(0, TRIAL_CONFIG.TRIAL_DURATION_DAYS - daysSinceStart),
      creditsRemaining,
      shouldLockFeatures: isTrialExpired || !hasCreditsRemaining
    }
  }
}

// Export configuration
module.exports = {
  CREDIT_COSTS,
  FREE_USAGE_LIMITS,
  TRIAL_CONFIG,
  GATING_LOGIC,
  CREDIT_CALCULATION,
  USAGE_TRACKING,
  TRIAL_STATUS
}
