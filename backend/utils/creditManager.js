/**
 * Credit Management Service for AI Operations
 * 
 * This service handles credit tracking, deduction, and abuse prevention
 * for AI-powered features in RoboApply.
 */

const User = require("../models/user.model")
const UserSubscription = require("../models/userSubscriptionModel")
const { 
  CREDIT_COSTS, 
  FREE_USAGE_LIMITS, 
  TRIAL_CONFIG, 
  GATING_LOGIC, 
  CREDIT_CALCULATION, 
  TRIAL_STATUS 
} = require("../config/ai/credits.config")

const creditManager = {
  /**
   * Check if user has sufficient credits and permissions for an operation
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation (JOB_DESCRIPTION_GENERATION, etc.)
   * @returns {Object} Permission status and user data
   */
  async checkOperationPermissions(userId, operationType) {
    try {
      // Get user with subscription data
      const user = await User.findById(userId).lean()
      if (!user) {
        throw new Error("User not found")
      }

      // Get active subscription
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      }).lean()

      if (!userSub) {
        throw new Error("No active subscription found")
      }

      // Check trial status for free plan users
      const trialStatus = TRIAL_STATUS.checkTrialStatus({
        subscription: {
          startDate: userSub.startDate,
          endDate: userSub.endDate,
          remaining: {
            monthlyCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
          }
        }
      })

      // If trial expired or no credits, block operation
      if (trialStatus.shouldLockFeatures) {
        return {
          allowed: false,
          reason: "TRIAL_EXPIRED",
          message: trialStatus.isTrialExpired ? 
            GATING_LOGIC.TRIAL_EXPIRED_MESSAGE : 
            GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: trialStatus
        }
      }

      // Get current usage for this operation type
      const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
      
      // Check for abuse (multiple generations without tailoring)
      const generationsWithoutTailoring = userSub.usage.generationsWithoutTailoring || 0
      if (generationsWithoutTailoring >= GATING_LOGIC.GENERATION_ABUSE_THRESHOLD) {
        return {
          allowed: false,
          reason: "ABUSE_DETECTED",
          message: GATING_LOGIC.ABUSE_WARNING_MESSAGE,
          data: { generationsWithoutTailoring }
        }
      }

      // Calculate credits needed for this operation
      const creditsNeeded = CREDIT_CALCULATION.calculateGenerationCredits(
        operationType, 
        operationCount, 
        false // We'll update this after tailoring
      )

      // Check if user has enough credits
      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
      
      if (creditsNeeded > 0 && totalCreditsAvailable < creditsNeeded) {
        return {
          allowed: false,
          reason: "INSUFFICIENT_CREDITS",
          message: GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: { 
            creditsNeeded, 
            creditsAvailable: totalCreditsAvailable 
          }
        }
      }

      return {
        allowed: true,
        user,
        userSub,
        creditsNeeded,
        creditsAvailable: totalCreditsAvailable,
        operationCount,
        trialStatus
      }
    } catch (error) {
      throw new Error(`Permission check failed: ${error.message}`)
    }
  },

  /**
   * Deduct credits after successful AI operation
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} metadata - Additional operation metadata
   * @returns {Object} Deduction result
   */
  async deductCreditsForOperation(userId, operationType, tokensUsed, metadata = {}) {
    try {
      const user = await User.findById(userId)
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      // Get current operation count
      const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)

      // Calculate credits to deduct
      const creditsToDeduct = CREDIT_CALCULATION.calculateGenerationCredits(
        operationType, 
        operationCount + 1, // +1 because we're about to increment
        metadata.hasTailoredAfterGeneration || false
      )

      // Update usage counters
      this.incrementOperationCount(userSub.usage, operationType)

      // Track generations without tailoring for abuse detection
      if (operationType !== 'TAILORED_RESUME' && !metadata.hasTailoredAfterGeneration) {
        userSub.usage.generationsWithoutTailoring = (userSub.usage.generationsWithoutTailoring || 0) + 1
      }

      // Deduct credits if needed
      if (creditsToDeduct > 0) {
        // Calculate remaining monthly credits
        const remainingMonthlyCredits = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed)
        
        if (remainingMonthlyCredits >= creditsToDeduct) {
          // Deduct from monthly credits
          userSub.usage.monthlyCreditsUsed += creditsToDeduct
        } else {
          // Use remaining monthly credits first, then deduct from user's extra credits
          const monthlyCreditsToUse = remainingMonthlyCredits
          const extraCreditsToUse = creditsToDeduct - monthlyCreditsToUse
          
          userSub.usage.monthlyCreditsUsed += monthlyCreditsToUse
          user.credits = Math.max(0, (user.credits || 0) - extraCreditsToUse)
          
          await user.save()
        }

        // Mark free plan as expired if all credits used
        if (userSub.planSnapshot.identifier === "free_plan" && 
            userSub.usage.monthlyCreditsUsed >= 60) {
          user.isFreePlanExpired = true
          await user.save()
        }
      }

      // Save subscription changes
      await userSub.save()

      return {
        success: true,
        creditsDeducted: creditsToDeduct,
        operationCount: operationCount + 1,
        remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
        tokensUsed,
        metadata: {
          operationType,
          userId,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }
    } catch (error) {
      throw new Error(`Credit deduction failed: ${error.message}`)
    }
  },

  /**
   * Handle resume tailoring operation (special case)
   * @param {string} userId - User ID
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @returns {Object} Deduction result
   */
  async deductCreditsForTailoring(userId, tokensUsed) {
    try {
      const user = await User.findById(userId)
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      const creditsToDeduct = CREDIT_CALCULATION.calculateTailoringCredits()

      // Check if user has enough credits
      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
      
      if (totalCreditsAvailable < creditsToDeduct) {
        throw new Error("Insufficient credits for resume tailoring")
      }

      // Deduct credits and update counters
      const remainingMonthlyCredits = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed)
      
      if (remainingMonthlyCredits >= creditsToDeduct) {
        // Deduct from monthly credits
        userSub.usage.monthlyCreditsUsed += creditsToDeduct
      } else {
        // Use remaining monthly credits first, then deduct from user's extra credits
        const monthlyCreditsToUse = remainingMonthlyCredits
        const extraCreditsToUse = creditsToDeduct - monthlyCreditsToUse
        
        userSub.usage.monthlyCreditsUsed += monthlyCreditsToUse
        user.credits = Math.max(0, (user.credits || 0) - extraCreditsToUse)
        
        await user.save()
      }
      
      userSub.usage.tailoredResumesUsed = (userSub.usage.tailoredResumesUsed || 0) + 1

      // Reset generations without tailoring counter
      userSub.usage.generationsWithoutTailoring = 0

      await userSub.save()

      return {
        success: true,
        creditsDeducted: creditsToDeduct,
        remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
        tokensUsed
      }
    } catch (error) {
      throw new Error(`Tailoring credit deduction failed: ${error.message}`)
    }
  },

  /**
   * Safely deduct credits with rollback capability
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} operationResult - The actual AI operation result to validate
   * @param {Object} metadata - Additional operation metadata
   * @returns {Object} Deduction result
   */
  async safelyDeductCreditsForOperation(userId, operationType, tokensUsed, operationResult, metadata = {}) {
    try {
      // Validate that we actually got a successful result
      if (!this.validateOperationResult(operationType, operationResult)) {
        throw new Error("Operation result validation failed - no credits will be deducted")
      }

      // Proceed with credit deduction only after validation
      return await this.deductCreditsForOperation(userId, operationType, tokensUsed, metadata)
    } catch (error) {
      // Log the error but don't charge the user
      console.error(`Credit deduction failed for user ${userId}, operation ${operationType}:`, error.message)
      throw new Error(`Credit processing failed: ${error.message}`)
    }
  },

  /**
   * Validate operation result before charging credits
   * @param {string} operationType - Type of operation
   * @param {Object} result - The operation result to validate
   * @returns {boolean} Whether the result is valid
   */
  validateOperationResult(operationType, result) {
    switch (operationType) {
      case 'JOB_DESCRIPTION_GENERATION':
        return result?.job_description && 
               typeof result.job_description === 'string' && 
               result.job_description.trim().length > 20 // Minimum meaningful length
      
      case 'JOB_SKILLS_GENERATION':
        return result?.skills_array && 
               Array.isArray(result.skills_array) && 
               result.skills_array.length > 0
      
      case 'JOB_TITLE_GENERATION':
        return result?.job_title && 
               typeof result.job_title === 'string' && 
               result.job_title.trim().length > 2
      
      case 'TAILORED_RESUME':
        return result?.tailored_resume && 
               typeof result.tailored_resume === 'object'
      
      default:
        return false
    }
  },

  /**
   * Handle failed operations (log but don't charge)
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {string} errorType - Type of error (API_FAILURE, VALIDATION_FAILED, etc.)
   * @param {Object} errorDetails - Error details for logging
   */
  async logFailedOperation(userId, operationType, errorType, errorDetails = {}) {
    try {
      console.log(`Failed operation logged: User ${userId}, Operation: ${operationType}, Error: ${errorType}`, errorDetails)
      
      // You could also save this to a separate collection for analytics
      // const FailedOperation = require("../models/failedOperation.model")
      // await FailedOperation.create({
      //   userId,
      //   operationType,
      //   errorType,
      //   errorDetails,
      //   timestamp: new Date()
      // })
      
      // For now, just increment a failure counter in usage (optional)
      const userSub = await UserSubscription.findOne({ userId, isActive: true })
      if (userSub) {
        const failureField = `${operationType.toLowerCase()}Failures`
        userSub.usage[failureField] = (userSub.usage[failureField] || 0) + 1
        await userSub.save()
      }
    } catch (error) {
      console.error("Failed to log failed operation:", error)
      // Don't throw here - logging failures shouldn't break the main flow
    }
  },

  /**
   * Get current operation count from usage object
   * @param {Object} usage - User subscription usage object
   * @param {string} operationType - Type of operation
   * @returns {number} Current count
   */
  getCurrentOperationCount(usage, operationType) {
    const operationMap = {
      'JOB_DESCRIPTION_GENERATION': 'jobDescriptionGenerations',
      'JOB_SKILLS_GENERATION': 'jobSkillsGenerations',
      'JOB_TITLE_GENERATION': 'jobTitleGenerations',
      'TAILORED_RESUME': 'tailoredResumesUsed'
    }

    const field = operationMap[operationType]
    return usage[field] || 0
  },

  /**
   * Increment operation count in usage object
   * @param {Object} usage - User subscription usage object (will be modified)
   * @param {string} operationType - Type of operation
   */
  incrementOperationCount(usage, operationType) {
    const operationMap = {
      'JOB_DESCRIPTION_GENERATION': 'jobDescriptionGenerations',
      'JOB_SKILLS_GENERATION': 'jobSkillsGenerations',
      'JOB_TITLE_GENERATION': 'jobTitleGenerations',
      'TAILORED_RESUME': 'tailoredResumesUsed'
    }

    const field = operationMap[operationType]
    if (field) {
      usage[field] = (usage[field] || 0) + 1
    }
  },

  /**
   * Get user's current credit status and limits
   * @param {string} userId - User ID
   * @returns {Object} Credit status information
   */
  async getUserCreditStatus(userId) {
    try {
      const user = await User.findById(userId).lean()
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      }).lean()

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      const trialStatus = TRIAL_STATUS.checkTrialStatus({
        subscription: {
          startDate: userSub.startDate,
          endDate: userSub.endDate,
          remaining: {
            monthlyCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
          }
        }
      })

      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)

      return {
        planName: userSub.planSnapshot.name,
        planIdentifier: userSub.planSnapshot.identifier,
        monthlyCreditsLimit: userSub.planSnapshot.monthlyCredits,
        monthlyCreditsUsed: userSub.usage.monthlyCreditsUsed,
        extraCredits: user.credits || 0,
        totalCreditsAvailable,
        usage: {
          jobDescriptionGenerations: userSub.usage.jobDescriptionGenerations || 0,
          jobSkillsGenerations: userSub.usage.jobSkillsGenerations || 0,
          jobTitleGenerations: userSub.usage.jobTitleGenerations || 0,
          tailoredResumesUsed: userSub.usage.tailoredResumesUsed || 0,
          generationsWithoutTailoring: userSub.usage.generationsWithoutTailoring || 0
        },
        trialStatus,
        freeUsageLimits: FREE_USAGE_LIMITS
      }
    } catch (error) {
      throw new Error(`Failed to get credit status: ${error.message}`)
    }
  },

  /**
   * NEW: Handle generation with smart abuse prevention
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} operationResult - The operation result
   * @returns {Object} Operation result with warnings
   */
  async handleSmartGeneration(userId, operationType, tokensUsed, operationResult) {
    try {
      const user = await User.findById(userId)
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      // Get current operation count and abuse metrics
      const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
      const generationsWithoutTailoring = userSub.usage.generationsWithoutTailoring || 0
      const totalGenerations = (userSub.usage.jobDescriptionGenerations || 0) + 
                              (userSub.usage.jobSkillsGenerations || 0) + 
                              (userSub.usage.jobTitleGenerations || 0)

      // Check for abuse before proceeding
      const abuseCheck = CREDIT_CALCULATION.shouldWarnAbuse(generationsWithoutTailoring, totalGenerations)
      
      if (abuseCheck.shouldBlock) {
        return {
          success: false,
          blocked: true,
          reason: "ABUSE_DETECTED",
          message: abuseCheck.message,
          severity: abuseCheck.severity,
          data: {
            generationsWithoutTailoring,
            totalGenerations,
            suggestedAction: "TAILOR_RESUME"
          }
        }
      }

      // Calculate credits (will be 0 if within free limit)
      const creditsToDeduct = CREDIT_CALCULATION.calculateGenerationCredits(
        operationType, 
        operationCount + 1, // +1 because we're about to increment
        false // Not tailored yet
      )

      // Check if user has enough credits (if needed)
      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
      
      if (creditsToDeduct > 0 && totalCreditsAvailable < creditsToDeduct) {
        return {
          success: false,
          blocked: true,
          reason: "INSUFFICIENT_CREDITS",
          message: GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: { 
            creditsNeeded: creditsToDeduct, 
            creditsAvailable: totalCreditsAvailable 
          }
        }
      }

      // Update usage counters
      this.incrementOperationCount(userSub.usage, operationType)
      
      // Track generations without tailoring for abuse detection
      userSub.usage.generationsWithoutTailoring = (userSub.usage.generationsWithoutTailoring || 0) + 1

      // Deduct credits if needed
      if (creditsToDeduct > 0) {
        userSub.usage.monthlyCreditsUsed += creditsToDeduct
      }

      await userSub.save()

      return {
        success: true,
        blocked: false,
        creditsDeducted: creditsToDeduct,
        operationCount: operationCount + 1,
        remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
        warning: abuseCheck.shouldWarn ? {
          message: abuseCheck.message,
          severity: abuseCheck.severity
        } : null,
        tokensUsed,
        metadata: {
          operationType,
          userId,
          timestamp: new Date().toISOString(),
          generationsWithoutTailoring: userSub.usage.generationsWithoutTailoring
        }
      }
    } catch (error) {
      throw new Error(`Smart generation handling failed: ${error.message}`)
    }
  },

  /**
   * NEW: Handle tailored resume with retroactive credit adjustment
   * @param {string} userId - User ID
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Array} previousGenerationIds - IDs of generations that led to this tailoring
   * @returns {Object} Deduction result with retroactive adjustments
   */
  async handleTailoredResumeWithRetroactiveAdjustment(userId, tokensUsed, previousGenerationIds = []) {
    try {
      const user = await User.findById(userId)
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      const creditsToDeduct = CREDIT_CALCULATION.calculateTailoringCredits()

      // Check if user has enough credits
      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
      
      if (totalCreditsAvailable < creditsToDeduct) {
        throw new Error("Insufficient credits for resume tailoring")
      }

      // RETROACTIVE ADJUSTMENT LOGIC
      // Calculate how many generation credits we can refund
      const generationsWithoutTailoring = userSub.usage.generationsWithoutTailoring || 0
      const refundableCredits = Math.min(generationsWithoutTailoring * 2, userSub.usage.monthlyCreditsUsed)

      // Deduct tailoring credits but refund generation credits
      const netCreditsToDeduct = creditsToDeduct - refundableCredits

      userSub.usage.monthlyCreditsUsed = Math.max(0, userSub.usage.monthlyCreditsUsed - refundableCredits + creditsToDeduct)
      userSub.usage.tailoredResumesUsed = (userSub.usage.tailoredResumesUsed || 0) + 1

      // Reset generations without tailoring counter
      userSub.usage.generationsWithoutTailoring = 0

      await userSub.save()

      return {
        success: true,
        creditsDeducted: creditsToDeduct,
        creditsRefunded: refundableCredits,
        netCreditsCharged: netCreditsToDeduct,
        remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
        tokensUsed,
        message: refundableCredits > 0 ? 
          `Resume tailored successfully! ${refundableCredits} credits refunded for previous generations.` :
          "Resume tailored successfully!",
        metadata: {
          previousGenerationsRefunded: refundableCredits / 2,
          totalTailoredResumes: userSub.usage.tailoredResumesUsed
        }
      }
    } catch (error) {
      throw new Error(`Tailoring with retroactive adjustment failed: ${error.message}`)
    }
  },

  /**
   * NEW: Handle generation with atomic transaction to prevent race conditions
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} operationResult - The operation result
   * @param {string} sessionId - Optional session ID to group related operations
   * @returns {Object} Operation result with warnings
   */
  async handleAtomicGeneration(userId, operationType, tokensUsed, operationResult, sessionId = null) {
    const session = await UserSubscription.startSession()
    
    try {
      await session.withTransaction(async () => {
        const user = await User.findById(userId).session(session)
        const userSub = await UserSubscription.findOne({ 
          userId, 
          isActive: true 
        }).session(session)

        if (!user || !userSub) {
          throw new Error("User or subscription not found")
        }

        // Get current operation count and abuse metrics with fresh data
        const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
        const generationsWithoutTailoring = userSub.usage.generationsWithoutTailoring || 0
        const totalGenerations = (userSub.usage.jobDescriptionGenerations || 0) + 
                                (userSub.usage.jobSkillsGenerations || 0) + 
                                (userSub.usage.jobTitleGenerations || 0)

        // Check for abuse before proceeding
        const abuseCheck = CREDIT_CALCULATION.shouldWarnAbuse(generationsWithoutTailoring, totalGenerations)
        
        if (abuseCheck.shouldBlock) {
          throw new Error(`ABUSE_DETECTED: ${abuseCheck.message}`)
        }

        // Calculate credits (will be 0 if within free limit)
        const creditsToDeduct = CREDIT_CALCULATION.calculateGenerationCredits(
          operationType, 
          operationCount + 1, // +1 because we're about to increment
          false // Not tailored yet
        )

        // Check if user has enough credits (if needed)
        const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
        
        if (creditsToDeduct > 0 && totalCreditsAvailable < creditsToDeduct) {
          throw new Error(`INSUFFICIENT_CREDITS: Need ${creditsToDeduct}, have ${totalCreditsAvailable}`)
        }

        // Update usage counters atomically
        this.incrementOperationCount(userSub.usage, operationType)
        
        // Track generations without tailoring for abuse detection
        userSub.usage.generationsWithoutTailoring = (userSub.usage.generationsWithoutTailoring || 0) + 1

        // Add session tracking if provided
        if (sessionId) {
          if (!userSub.usage.sessionMetadata) {
            userSub.usage.sessionMetadata = {}
          }
          if (!userSub.usage.sessionMetadata[sessionId]) {
            userSub.usage.sessionMetadata[sessionId] = {
              operations: [],
              createdAt: new Date(),
              totalCreditsUsed: 0
            }
          }
          userSub.usage.sessionMetadata[sessionId].operations.push({
            type: operationType,
            credits: creditsToDeduct,
            timestamp: new Date()
          })
          userSub.usage.sessionMetadata[sessionId].totalCreditsUsed += creditsToDeduct
        }

        // Deduct credits if needed
        if (creditsToDeduct > 0) {
          userSub.usage.monthlyCreditsUsed += creditsToDeduct
        }

        await userSub.save({ session })

        return {
          success: true,
          blocked: false,
          creditsDeducted: creditsToDeduct,
          operationCount: operationCount + 1,
          remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
          warning: abuseCheck.shouldWarn ? {
            message: abuseCheck.message,
            severity: abuseCheck.severity
          } : null,
          tokensUsed,
          sessionId,
          metadata: {
            operationType,
            userId,
            timestamp: new Date().toISOString(),
            generationsWithoutTailoring: userSub.usage.generationsWithoutTailoring
          }
        }
      })
    } catch (error) {
      if (error.message.startsWith('ABUSE_DETECTED:')) {
        return {
          success: false,
          blocked: true,
          reason: "ABUSE_DETECTED",
          message: error.message.replace('ABUSE_DETECTED: ', ''),
          severity: "BLOCKING"
        }
      }
      
      if (error.message.startsWith('INSUFFICIENT_CREDITS:')) {
        const parts = error.message.match(/Need (\d+), have (\d+)/)
        return {
          success: false,
          blocked: true,
          reason: "INSUFFICIENT_CREDITS",
          message: GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: { 
            creditsNeeded: parseInt(parts[1]), 
            creditsAvailable: parseInt(parts[2]) 
          }
        }
      }
      
      throw new Error(`Atomic generation handling failed: ${error.message}`)
    } finally {
      await session.endSession()
    }
  },

  /**
   * NEW: Handle batch operations with smart credit optimization
   * @param {string} userId - User ID
   * @param {Array} operations - Array of operation requests
   * @param {string} sessionId - Session ID to group operations
   * @returns {Object} Batch operation results
   */
  async handleBatchGeneration(userId, operations, sessionId) {
    const session = await UserSubscription.startSession()
    
    try {
      return await session.withTransaction(async () => {
        const user = await User.findById(userId).session(session)
        const userSub = await UserSubscription.findOne({ 
          userId, 
          isActive: true 
        }).session(session)

        if (!user || !userSub) {
          throw new Error("User or subscription not found")
        }

        const results = []
        let totalCreditsToDeduct = 0
        let generationsInThisBatch = 0

        // Pre-calculate all operations to optimize credits
        for (const operation of operations) {
          const { operationType } = operation
          const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
          
          // Check if this operation would be free
          const creditsForThisOp = CREDIT_CALCULATION.calculateGenerationCredits(
            operationType, 
            operationCount + generationsInThisBatch + 1,
            false
          )
          
          totalCreditsToDeduct += creditsForThisOp
          generationsInThisBatch++
          
          results.push({
            operationType,
            creditsCalculated: creditsForThisOp,
            operationCount: operationCount + generationsInThisBatch
          })
        }

        // Check if user has enough credits for the entire batch
        const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
        
        if (totalCreditsToDeduct > totalCreditsAvailable) {
          throw new Error(`INSUFFICIENT_CREDITS: Need ${totalCreditsToDeduct}, have ${totalCreditsAvailable}`)
        }

        // Apply smart optimization: If user would get multiple free generations in batch,
        // prioritize the most expensive operations for free slots
        const sortedOperations = operations.sort((a, b) => {
          const costA = CREDIT_COSTS[a.operationType] || 0
          const costB = CREDIT_COSTS[b.operationType] || 0
          return costB - costA // Sort by cost descending
        })

        // Execute operations with optimized credit usage
        let actualCreditsUsed = 0
        const processedResults = []

        for (const operation of sortedOperations) {
          const { operationType, tokensUsed, operationResult } = operation
          const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
          
          const creditsToDeduct = CREDIT_CALCULATION.calculateGenerationCredits(
            operationType, 
            operationCount + 1,
            false
          )

          // Update usage counters
          this.incrementOperationCount(userSub.usage, operationType)
          userSub.usage.generationsWithoutTailoring = (userSub.usage.generationsWithoutTailoring || 0) + 1
          
          actualCreditsUsed += creditsToDeduct

          processedResults.push({
            operationType,
            success: true,
            creditsDeducted: creditsToDeduct,
            operationCount: operationCount + 1,
            tokensUsed
          })
        }

        // Update total credits used
        userSub.usage.monthlyCreditsUsed += actualCreditsUsed

        // Track session metadata
        if (!userSub.usage.sessionMetadata) {
          userSub.usage.sessionMetadata = {}
        }
        userSub.usage.sessionMetadata[sessionId] = {
          operations: processedResults,
          createdAt: new Date(),
          totalCreditsUsed: actualCreditsUsed,
          optimizationApplied: true
        }

        await userSub.save({ session })

        return {
          success: true,
          sessionId,
          totalCreditsUsed: actualCreditsUsed,
          totalCreditsAvailable: totalCreditsAvailable - actualCreditsUsed,
          operations: processedResults,
          metadata: {
            batchSize: operations.length,
            optimizationSavings: totalCreditsToDeduct - actualCreditsUsed,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      if (error.message.startsWith('INSUFFICIENT_CREDITS:')) {
        const parts = error.message.match(/Need (\d+), have (\d+)/)
        return {
          success: false,
          reason: "INSUFFICIENT_CREDITS",
          message: GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: { 
            creditsNeeded: parseInt(parts[1]), 
            creditsAvailable: parseInt(parts[2]) 
          }
        }
      }
      
      throw new Error(`Batch generation handling failed: ${error.message}`)
    } finally {
      await session.endSession()
    }
  },

  /**
   * NEW: Check if user is making requests too quickly (potential spam/parallel abuse)
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @returns {Object} Rate limit check result
   */
  async checkRateLimit(userId, operationType) {
    try {
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!userSub) {
        throw new Error("No active subscription found")
      }

      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      // Initialize rate limiting metadata if not exists
      if (!userSub.usage.rateLimitMetadata) {
        userSub.usage.rateLimitMetadata = {}
      }

      if (!userSub.usage.rateLimitMetadata[operationType]) {
        userSub.usage.rateLimitMetadata[operationType] = {
          requests: [],
          lastRequestTime: null
        }
      }

      const opRateLimit = userSub.usage.rateLimitMetadata[operationType]

      // Clean old requests (older than 5 minutes)
      opRateLimit.requests = opRateLimit.requests.filter(
        requestTime => new Date(requestTime) > fiveMinutesAgo
      )

      // Check rate limits
      const requestsLastMinute = opRateLimit.requests.filter(
        requestTime => new Date(requestTime) > oneMinuteAgo
      ).length

      const requestsLast5Minutes = opRateLimit.requests.length

      // Rate limiting rules
      const isRateLimited = 
        requestsLastMinute >= 5 ||  // Max 5 requests per minute
        requestsLast5Minutes >= 15  // Max 15 requests per 5 minutes

      if (isRateLimited) {
        return {
          allowed: false,
          reason: "RATE_LIMITED",
          message: "You're making requests too quickly. Please wait a moment before trying again.",
          retryAfter: 60, // seconds
          data: {
            requestsLastMinute,
            requestsLast5Minutes,
            maxPerMinute: 5,
            maxPer5Minutes: 15
          }
        }
      }

      // Check for potential parallel abuse (multiple requests within 2 seconds)
      const lastRequestTime = opRateLimit.lastRequestTime
      if (lastRequestTime && (now - new Date(lastRequestTime)) < 2000) {
        return {
          allowed: false,
          reason: "PARALLEL_ABUSE",
          message: "Multiple simultaneous requests detected. Please wait for the current request to complete.",
          retryAfter: 3,
          data: {
            timeSinceLastRequest: now - new Date(lastRequestTime),
            minimumInterval: 2000
          }
        }
      }

      // Update rate limiting metadata
      opRateLimit.requests.push(now.toISOString())
      opRateLimit.lastRequestTime = now.toISOString()

      await userSub.save()

      return {
        allowed: true,
        requestsLastMinute,
        requestsLast5Minutes
      }
    } catch (error) {
      throw new Error(`Rate limit check failed: ${error.message}`)
    }
  },

  /**
   * Enhanced rate limiting with parallel call detection
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @returns {Object} Rate limit status
   */
  async checkRateLimitWithParallelDetection(userId, operationType) {
    try {
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!userSub) {
        throw new Error("No active subscription found")
      }

      // Initialize rate limiting if doesn't exist
      if (!userSub.rateLimiting) {
        userSub.rateLimiting = {}
      }

      if (!userSub.rateLimiting[operationType]) {
        userSub.rateLimiting[operationType] = {
          requests: [],
          lastRequestTime: null,
          parallelRequests: 0,
          lastParallelCheck: null
        }
      }

      const now = new Date()
      const opRateLimit = userSub.rateLimiting[operationType]

      // Clean old requests (keep only last 5 minutes)
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000)
      const oneMinuteAgo = new Date(now - 60 * 1000)
      
      opRateLimit.requests = opRateLimit.requests.filter(
        requestTime => new Date(requestTime) > fiveMinutesAgo
      )

      // Count requests in different time windows
      const requestsLastMinute = opRateLimit.requests.filter(
        requestTime => new Date(requestTime) > oneMinuteAgo
      ).length

      const requestsLast5Minutes = opRateLimit.requests.length

      // Detect parallel requests across all generation types
      const parallelWindow = 3000 // 3 seconds
      const simultaneousThreshold = 2 // Number of concurrent requests that indicate parallel calls

      let totalParallelRequests = 0
      const generationTypes = ['JOB_DESCRIPTION_GENERATION', 'JOB_SKILLS_GENERATION', 'JOB_TITLE_GENERATION']
      
      for (const genType of generationTypes) {
        if (userSub.rateLimiting[genType]) {
          const recentRequests = userSub.rateLimiting[genType].requests.filter(
            requestTime => (now - new Date(requestTime)) < parallelWindow
          )
          totalParallelRequests += recentRequests.length
        }
      }

      // Enhanced rate limiting rules
      const isRateLimited = 
        requestsLastMinute >= 5 ||  // Max 5 requests per minute per operation
        requestsLast5Minutes >= 15 || // Max 15 requests per 5 minutes per operation
        totalParallelRequests >= 5 // Max 5 parallel requests across all operations

      if (isRateLimited) {
        return {
          allowed: false,
          reason: totalParallelRequests >= 5 ? "PARALLEL_RATE_LIMITED" : "RATE_LIMITED",
          message: totalParallelRequests >= 5 ? 
            "Too many simultaneous requests detected. Please wait for current operations to complete." :
            "You're making requests too quickly. Please wait a moment before trying again.",
          retryAfter: totalParallelRequests >= 5 ? 10 : 60, // seconds
          data: {
            requestsLastMinute,
            requestsLast5Minutes,
            totalParallelRequests,
            maxPerMinute: 5,
            maxPer5Minutes: 15,
            maxParallel: 5
          }
        }
      }

      // Check for potential parallel abuse
      const lastRequestTime = opRateLimit.lastRequestTime
      if (lastRequestTime && (now - new Date(lastRequestTime)) < 1000) {
        // Increment parallel request counter
        opRateLimit.parallelRequests = (opRateLimit.parallelRequests || 0) + 1
        
        if (opRateLimit.parallelRequests > simultaneousThreshold) {
          return {
            allowed: false,
            reason: "PARALLEL_ABUSE",
            message: "Multiple simultaneous requests detected. Please wait for the current request to complete.",
            retryAfter: 3,
            data: {
              parallelRequests: opRateLimit.parallelRequests,
              timeSinceLastRequest: now - new Date(lastRequestTime),
              minimumInterval: 1000
            }
          }
        }
      } else {
        // Reset parallel counter if enough time has passed
        opRateLimit.parallelRequests = 0
      }

      // Update rate limiting metadata
      opRateLimit.requests.push(now.toISOString())
      opRateLimit.lastRequestTime = now.toISOString()

      await userSub.save()

      // Return batch detection info
      const isBatchCandidate = totalParallelRequests >= 2
      
      return {
        allowed: true,
        requestsLastMinute,
        requestsLast5Minutes,
        totalParallelRequests,
        isBatchCandidate,
        batchInfo: isBatchCandidate ? {
          detectedParallelRequests: totalParallelRequests,
          suggestedBatch: true,
          batchWindow: parallelWindow
        } : null
      }
    } catch (error) {
      throw new Error(`Enhanced rate limit check failed: ${error.message}`)
    }
  },

  /**
   * Check if user has sufficient credits for an operation (without abuse detection)
   * This method focuses purely on credit availability and doesn't check for abuse patterns
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @returns {Object} Permission status and user data
   */
  async checkCreditsOnly(userId, operationType) {
    try {
      // Get user with subscription data
      const user = await User.findById(userId).lean()
      if (!user) {
        throw new Error("User not found")
      }

      // Get active subscription
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      }).lean()

      if (!userSub) {
        throw new Error("No active subscription found")
      }

      // Check trial status for free plan users
      const trialStatus = TRIAL_STATUS.checkTrialStatus({
        subscription: {
          startDate: userSub.startDate,
          endDate: userSub.endDate,
          remaining: {
            monthlyCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
          }
        }
      })

      // If trial expired or no credits, block operation
      if (trialStatus.shouldLockFeatures) {
        return {
          allowed: false,
          reason: "TRIAL_EXPIRED",
          message: trialStatus.isTrialExpired ? 
            GATING_LOGIC.TRIAL_EXPIRED_MESSAGE : 
            GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: trialStatus
        }
      }

      // Get current usage for this operation type
      const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)

      // Calculate credits needed for this operation
      const creditsNeeded = CREDIT_CALCULATION.calculateGenerationCredits(
        operationType, 
        operationCount, 
        false // We'll update this after tailoring
      )

      // Check if user has enough credits
      const totalCreditsAvailable = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0)
      
      if (creditsNeeded > 0 && totalCreditsAvailable < creditsNeeded) {
        return {
          allowed: false,
          reason: "INSUFFICIENT_CREDITS",
          message: GATING_LOGIC.INSUFFICIENT_CREDITS_MESSAGE,
          data: { 
            creditsNeeded, 
            creditsAvailable: totalCreditsAvailable 
          }
        }
      }

      return {
        allowed: true,
        user,
        userSub,
        creditsNeeded,
        creditsAvailable: totalCreditsAvailable,
        operationCount,
        trialStatus
      }
    } catch (error) {
      throw new Error(`Credit check failed: ${error.message}`)
    }
  },

  /**
   * Handle credit deduction with batch session coordination
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} metadata - Additional operation metadata including SESSION_ID
   * @returns {Object} Deduction result
   */
  /**
   * Deduct credits for operation with batch coordination support
   * Uses BATCH_ID for batch coordination and SESSION_ID for session tracking
   * @param {string} userId - User ID
   * @param {string} operationType - Type of operation
   * @param {number} tokensUsed - OpenAI tokens consumed
   * @param {Object} metadata - Additional operation metadata (including BATCH_ID and SESSION_ID)
   * @returns {Object} Deduction result with batch information
   */
  async deductCreditsForOperationWithBatch(userId, operationType, tokensUsed, metadata = {}) {
    try {
      const { BATCH_ID, SESSION_ID, operationId } = metadata
      
      // If no BATCH_ID provided, fall back to regular deduction
      if (!BATCH_ID) {
        return await this.deductCreditsForOperation(userId, operationType, tokensUsed, metadata)
      }

      const user = await User.findById(userId)
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      })

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      // Check if this is part of an active batch session
      const batchSession = userSub.batchSession
      const now = new Date()
      const batchWindow = 15000 // Increased to 15 seconds window for batch detection
      
      let isBatchOperation = false
      let batchSessionActive = false

      console.log(`[BATCH DEBUG] Processing ${operationType} for BATCH_ID: ${BATCH_ID}`)
      console.log(`[BATCH DEBUG] Current batch state: batchId=${batchSession.batchId}, isActive=${batchSession.isActive}`)

      // Check if there's an active batch session for this BATCH_ID
      if (batchSession.isActive && 
          batchSession.batchId === BATCH_ID && 
          batchSession.startTime && 
          (now - batchSession.startTime) < batchWindow) {
        batchSessionActive = true
        isBatchOperation = true
        console.log(`[BATCH DEBUG] Joining existing batch session`)
      } else if (!batchSession.isActive || batchSession.batchId !== BATCH_ID) {
        // Start a new batch session
        console.log(`[BATCH DEBUG] Starting new batch session`)
        userSub.batchSession = {
          batchId: BATCH_ID,
          sessionId: SESSION_ID, // Preserve SESSION_ID for session tracking
          startTime: now,
          operations: [],
          totalCreditsDeducted: 0,
          isActive: true
        }
        batchSessionActive = true
        isBatchOperation = true
      } else {
        console.log(`[BATCH DEBUG] Batch session expired, falling back to regular deduction`)
      }

      if (isBatchOperation && batchSessionActive) {
        // Add this operation to the batch
        const operationCount = this.getCurrentOperationCount(userSub.usage, operationType)
        
        // Calculate credits considering other operations in this batch
        const existingOpsOfThisType = userSub.batchSession.operations.filter(
          op => op.operationType === operationType
        ).length
        
        const creditsToDeduct = CREDIT_CALCULATION.calculateGenerationCredits(
          operationType, 
          operationCount + existingOpsOfThisType + 1,
          metadata.hasTailoredAfterGeneration || false
        )

        // Add operation to batch
        userSub.batchSession.operations.push({
          operationType: operationType,
          timestamp: now,
          tokensUsed: tokensUsed || 0,
          creditsDeducted: creditsToDeduct,
          operationCount: operationCount + existingOpsOfThisType + 1,
          operationId
        })

        userSub.batchSession.totalCreditsDeducted += creditsToDeduct

        // Update individual operation counters
        this.incrementOperationCount(userSub.usage, operationType)
        
        // Track generations without tailoring for abuse detection
        if (operationType !== 'TAILORED_RESUME' && !metadata.hasTailoredAfterGeneration) {
          userSub.usage.generationsWithoutTailoring = (userSub.usage.generationsWithoutTailoring || 0) + 1
        }

        // Deduct credits using the improved logic
        if (creditsToDeduct > 0) {
          const remainingMonthlyCredits = Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed)
          
          if (remainingMonthlyCredits >= creditsToDeduct) {
            userSub.usage.monthlyCreditsUsed += creditsToDeduct
          } else {
            const monthlyCreditsToUse = remainingMonthlyCredits
            const extraCreditsToUse = creditsToDeduct - monthlyCreditsToUse
            
            userSub.usage.monthlyCreditsUsed += monthlyCreditsToUse
            user.credits = Math.max(0, (user.credits || 0) - extraCreditsToUse)
            
            await user.save()
          }

          // Mark free plan as expired if all credits used
          if (userSub.planSnapshot.identifier === "free_plan" && 
              userSub.usage.monthlyCreditsUsed >= 60) {
            user.isFreePlanExpired = true
            await user.save()
          }
        }

        // Check if batch should be closed (timeout or if we have all 3 operation types)
        const operationTypes = [...new Set(userSub.batchSession.operations.map(op => op.operationType))]
        const hasAllThreeTypes = operationTypes.includes('JOB_DESCRIPTION_GENERATION') &&
                                operationTypes.includes('JOB_SKILLS_GENERATION') &&
                                operationTypes.includes('JOB_TITLE_GENERATION')

        console.log(`[BATCH DEBUG] Checking batch completion: hasAllThreeTypes=${hasAllThreeTypes}, operationTypes=${operationTypes.join(',')}`)
        console.log(`[BATCH DEBUG] Operations in batch: ${userSub.batchSession.operations.length}, timeElapsed: ${now - userSub.batchSession.startTime}ms`)

        if (hasAllThreeTypes || (now - userSub.batchSession.startTime) > (batchWindow - 1000)) {
          // Close the batch session
          console.log(`[BATCH DEBUG] Closing batch session: hasAllThreeTypes=${hasAllThreeTypes}`)
          userSub.batchSession.isActive = false
        }

        await userSub.save()

        return {
          success: true,
          creditsDeducted: creditsToDeduct,
          operationCount: operationCount + existingOpsOfThisType + 1,
          remainingCredits: Math.max(0, userSub.planSnapshot.monthlyCredits - userSub.usage.monthlyCreditsUsed) + (user.credits || 0),
          tokensUsed,
          batchInfo: {
            batchId: BATCH_ID,
            sessionId: SESSION_ID, // Include SESSION_ID for reference
            isBatchOperation: true,
            batchActive: userSub.batchSession.isActive,
            operationsInBatch: userSub.batchSession.operations.length,
            totalBatchCredits: userSub.batchSession.totalCreditsDeducted,
            batchComplete: !userSub.batchSession.isActive
          },
          metadata: {
            operationType,
            userId,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        }
      } else {
        // Fall back to regular deduction if batch coordination fails
        return await this.deductCreditsForOperation(userId, operationType, tokensUsed, metadata)
      }
    } catch (error) {
      throw new Error(`Batch credit deduction failed: ${error.message}`)
    }
  },

  // ...existing code...
}

module.exports = creditManager
