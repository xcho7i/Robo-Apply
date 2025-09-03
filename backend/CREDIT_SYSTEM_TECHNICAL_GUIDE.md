# RoboApply Credit System - Technical Implementation Guide

## Quick Reference

### Key Files
```
backend/
├── config/ai/credits.config.js          # Credit costs, limits, gating logic
├── utils/creditManager.js               # Core credit management logic
├── models/userSubscriptionModel.js      # Database schema for subscriptions
├── controllers/aiResumeTailor.controller.js  # AI generation endpoints
└── routes/aiResumeTailor.route.js       # API route definitions
```

### Core Functions

#### Credit Management (`utils/creditManager.js`)
```javascript
// Permission & Rate Limiting
checkOperationPermissions(userId, operationType)
checkRateLimitWithParallelDetection(userId, operationType)

// Individual Operations
handleAtomicGeneration(userId, operationType, tokensUsed, result)
handleSmartGeneration(userId, operationType, tokensUsed, result)

// Batch Operations  
handleBatchGeneration(userId, operationType, tokensUsed, result)
deductCreditsForTailoringWithBatchRefund(userId, tokensUsed)

// Utility Functions
getCurrentOperationCount(usage, operationType)
getUserCreditStatus(userId)
logFailedOperation(userId, operationType, errorType, details)
```

## Implementation Patterns

### 1. Controller Pattern for AI Endpoints

```javascript
// Standard pattern for all AI generation endpoints
async generateSomething(req, res) {
  try {
    // 1. Extract and validate input
    const { param1, param2 } = req.body
    const userId = req.token._id

    if (!requiredParam) {
      return res.status(400).json({
        msg: "Required parameter missing",
        success: false,
        error: "Missing required field: requiredParam"
      })
    }

    // 2. Enhanced rate limiting with parallel detection
    const rateLimitCheck = await creditManager.checkRateLimitWithParallelDetection(
      userId, 'OPERATION_TYPE'
    )
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        msg: rateLimitCheck.message,
        success: false,
        error: rateLimitCheck.reason,
        data: rateLimitCheck.data
      })
    }

    // 3. Credit permissions check
    const permissionCheck = await creditManager.checkOperationPermissions(
      userId, 'OPERATION_TYPE'
    )
    if (!permissionCheck.allowed) {
      return res.status(402).json({
        msg: permissionCheck.message,
        success: false,
        error: permissionCheck.reason,
        data: permissionCheck.data
      })
    }

    // 4. AI generation with prompts
    const systemPrompt = generateSystemPrompt(params)
    const userPrompt = generateUserPrompt(params)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or appropriate model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.7
    })

    // 5. Validate AI response
    const generatedContent = completion.choices[0]?.message?.content?.trim()
    if (!generatedContent) {
      await creditManager.logFailedOperation(
        userId, 'OPERATION_TYPE', 'EMPTY_RESPONSE',
        { tokensUsed: completion.usage?.total_tokens || 0 }
      )
      throw new Error("No content generated")
    }

    // 6. Prepare result for validation
    const operationResult = {
      result_field: generatedContent
    }

    // 7. Atomic credit handling with batch optimization
    const atomicResult = await creditManager.handleAtomicGeneration(
      userId,
      'OPERATION_TYPE',
      completion.usage?.total_tokens || 0,
      operationResult
    )

    // 8. Check if blocked
    if (atomicResult.blocked) {
      return res.status(atomicResult.reason === 'ABUSE_DETECTED' ? 429 : 402).json({
        msg: atomicResult.message,
        success: false,
        error: atomicResult.reason,
        data: atomicResult.data
      })
    }

    // 9. Success response with metadata
    const data = {
      result_field: generatedContent,
      metadata: {
        generated_at: new Date().toISOString(),
        tokens_used: completion.usage?.total_tokens || 0,
        credits_used: atomicResult.creditsDeducted,
        remaining_credits: atomicResult.remainingCredits,
        operation_count: atomicResult.operationCount,
        batch_info: atomicResult.batchInfo || null,
        warning: atomicResult.warning
      }
    }

    return res.status(200).json({
      msg: "Operation completed successfully",
      success: true,
      data
    })

  } catch (error) {
    // 10. Error handling with logging
    await creditManager.logFailedOperation(
      req.token._id, 'OPERATION_TYPE',
      error.status === 429 ? 'RATE_LIMIT' : 'API_ERROR',
      { 
        errorMessage: error.message,
        statusCode: error.status
      }
    )

    if (error.status === 429) {
      return res.status(429).json({
        msg: "Rate limit exceeded. Please wait and try again.",
        success: false,
        data: { wait_ms: 60000 }
      })
    }

    return res.status(500).json({
      msg: "Failed to generate content",
      success: false,
      error: error.message
    })
  }
}
```

### 2. Batch Session Detection Logic

```javascript
// In handleBatchGeneration function
const detectBatchSession = (userSub, operationType, now) => {
  const BATCH_WINDOW_MS = 10000
  const MAX_BATCH_SIZE = 5

  // Initialize batch session if doesn't exist
  if (!userSub.batchSession) {
    userSub.batchSession = {
      sessionId: null,
      startTime: null,
      operations: [],
      totalCreditsDeducted: 0,
      isActive: false
    }
  }

  // Check if within active batch window
  const isWithinBatchWindow = userSub.batchSession.isActive && 
    userSub.batchSession.startTime &&
    (now - new Date(userSub.batchSession.startTime)) < BATCH_WINDOW_MS

  const isBatch = isWithinBatchWindow || 
    userSub.batchSession.operations.length > 0

  if (!isBatch) {
    return { isBatch: false }
  }

  // Start new batch session if needed
  if (!userSub.batchSession.isActive) {
    userSub.batchSession = {
      sessionId: `batch_${userId}_${now.getTime()}`,
      startTime: now,
      operations: [],
      totalCreditsDeducted: 0,
      isActive: true
    }
  }

  // Check batch size limits
  if (userSub.batchSession.operations.length >= MAX_BATCH_SIZE) {
    return {
      isBatch: true,
      blocked: true,
      reason: 'BATCH_SIZE_EXCEEDED',
      message: `Maximum batch size (${MAX_BATCH_SIZE}) exceeded.`
    }
  }

  return { isBatch: true, blocked: false }
}
```

### 3. Credit Deduction with Atomic Transactions

```javascript
// MongoDB transaction for race-condition safety
const handleAtomicGeneration = async (userId, operationType, tokensUsed, result) => {
  const session = await UserSubscription.startSession()
  
  try {
    return await session.withTransaction(async () => {
      // Get fresh data within transaction
      const user = await User.findById(userId).session(session)
      const userSub = await UserSubscription.findOne({ 
        userId, isActive: true 
      }).session(session)

      if (!user || !userSub) {
        throw new Error("User or subscription not found")
      }

      // Calculate credits with current counts
      const operationCount = getCurrentOperationCount(userSub.usage, operationType)
      const creditsToDeduct = calculateGenerationCredits(
        operationType, operationCount + 1, false
      )

      // Abuse and credit checks
      // ... validation logic ...

      // Update counters atomically
      incrementOperationCount(userSub.usage, operationType)
      userSub.usage.generationsWithoutTailoring += 1

      if (creditsToDeduct > 0) {
        userSub.usage.monthlyCreditsUsed += creditsToDeduct
      }

      await userSub.save({ session })

      return {
        success: true,
        creditsDeducted: creditsToDeduct,
        operationCount: operationCount + 1,
        // ... other result data
      }
    })
  } catch (error) {
    // Handle transaction errors
    throw new Error(`Atomic operation failed: ${error.message}`)
  } finally {
    await session.endSession()
  }
}
```

### 4. Enhanced Rate Limiting Implementation

```javascript
const checkRateLimitWithParallelDetection = async (userId, operationType) => {
  const userSub = await UserSubscription.findOne({ userId, isActive: true })
  
  // Initialize rate limiting structure
  if (!userSub.rateLimiting) {
    userSub.rateLimiting = {}
  }
  if (!userSub.rateLimiting[operationType]) {
    userSub.rateLimiting[operationType] = {
      requests: [],
      lastRequestTime: null,
      parallelRequests: 0
    }
  }

  const now = new Date()
  const oneMinuteAgo = new Date(now - 60 * 1000)
  const fiveMinutesAgo = new Date(now - 5 * 60 * 1000)

  // Clean old requests
  userSub.rateLimiting[operationType].requests = 
    userSub.rateLimiting[operationType].requests.filter(
      requestTime => new Date(requestTime) > fiveMinutesAgo
    )

  // Count recent requests
  const requestsLastMinute = userSub.rateLimiting[operationType].requests.filter(
    requestTime => new Date(requestTime) > oneMinuteAgo
  ).length

  // Check parallel requests across all generation types
  const generationTypes = ['JOB_DESCRIPTION_GENERATION', 'JOB_SKILLS_GENERATION', 'JOB_TITLE_GENERATION']
  let totalParallelRequests = 0
  
  for (const genType of generationTypes) {
    if (userSub.rateLimiting[genType]) {
      const recentRequests = userSub.rateLimiting[genType].requests.filter(
        requestTime => (now - new Date(requestTime)) < 3000 // 3 second window
      )
      totalParallelRequests += recentRequests.length
    }
  }

  // Rate limiting rules
  if (requestsLastMinute >= 5 || totalParallelRequests >= 5) {
    return {
      allowed: false,
      reason: totalParallelRequests >= 5 ? "PARALLEL_RATE_LIMITED" : "RATE_LIMITED",
      message: totalParallelRequests >= 5 ? 
        "Too many simultaneous requests detected." : 
        "You're making requests too quickly.",
      retryAfter: totalParallelRequests >= 5 ? 10 : 60,
      data: { requestsLastMinute, totalParallelRequests }
    }
  }

  // Update metadata
  userSub.rateLimiting[operationType].requests.push(now.toISOString())
  userSub.rateLimiting[operationType].lastRequestTime = now.toISOString()
  await userSub.save()

  return {
    allowed: true,
    isBatchCandidate: totalParallelRequests >= 2
  }
}
```

## Configuration Examples

### Credit Costs Configuration
```javascript
// config/ai/credits.config.js
const CREDIT_COSTS = {
  // AI Generation Features (2 credits each after free limit)
  JOB_DESCRIPTION_GENERATION: 2,
  JOB_SKILLS_GENERATION: 2,
  JOB_TITLE_GENERATION: 2,
  
  // Premium Features
  TAILORED_RESUME: 13,    // High cost, retroactive refunds
  AUTO_APPLY: 5,          // Medium cost
  AI_COVER_LETTER: 3,     // Medium cost
  
  // Basic Features  
  RESUME_BUILDER: 1,      // Low cost
  RESUME_SCORE: 1,        // Low cost
  INTERVIEW_BUDDY: 2      // Low cost
}

const FREE_USAGE_LIMITS = {
  // 3 free generations per type for trial users
  JOB_DESCRIPTION_GENERATION: 3,
  JOB_SKILLS_GENERATION: 3,
  JOB_TITLE_GENERATION: 3
  // All others default to 0 (no free usage)
}

const CREDIT_CALCULATION = {
  calculateGenerationCredits: (operationType, operationCount, hasTailoredAfterGeneration) => {
    const freeLimit = FREE_USAGE_LIMITS[operationType] || 0
    
    if (operationCount <= freeLimit) return 0
    if (hasTailoredAfterGeneration) return 0
    
    return CREDIT_COSTS[operationType] || 2
  },
  
  calculateTailoringCredits: () => CREDIT_COSTS.TAILORED_RESUME,
  
  shouldWarnAbuse: (generationsWithoutTailoring, totalGenerations) => {
    if (generationsWithoutTailoring >= 5) {
      return {
        shouldBlock: true,
        message: "Too many generations without tailoring. Please create a tailored resume first.",
        severity: "BLOCKING"
      }
    }
    
    if (generationsWithoutTailoring >= 3) {
      return {
        shouldWarn: true,
        message: `You've generated ${generationsWithoutTailoring} items. Consider running a tailored resume to optimize your credits.`,
        severity: "WARNING"
      }
    }
    
    return { shouldWarn: false, shouldBlock: false }
  }
}
```

### Trial Configuration
```javascript
const TRIAL_CONFIG = {
  DURATION_DAYS: 3,
  INITIAL_CREDITS: 60
}

const TRIAL_STATUS = {
  checkTrialStatus: (subscription) => {
    const now = new Date()
    const startDate = new Date(subscription.startDate)
    const trialEndDate = new Date(startDate.getTime() + (TRIAL_CONFIG.DURATION_DAYS * 24 * 60 * 60 * 1000))
    
    const isTrialExpired = now > trialEndDate
    const hasCredits = subscription.remaining.monthlyCredits > 0
    
    return {
      isTrialActive: !isTrialExpired && hasCredits,
      isTrialExpired,
      daysRemaining: Math.max(0, Math.ceil((trialEndDate - now) / (24 * 60 * 60 * 1000))),
      shouldLockFeatures: isTrialExpired || !hasCredits
    }
  }
}
```

## Database Initialization

### User Creation with Free Plan
```javascript
// In user.controller.js - createUser function
const createUser = async (userData) => {
  // Create user
  const user = await User.create({
    ...userData,
    credits: 0,
    isFreePlanExpired: false
  })

  // Get free plan
  const freePlan = await SubscriptionPlan.findOne({ identifier: "free_plan" })
  
  // Create subscription with trial
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + (3 * 24 * 60 * 60 * 1000)) // 3 days

  await UserSubscription.create({
    userId: user._id,
    subscriptionPlanId: freePlan._id,
    planSnapshot: {
      name: freePlan.name,
      identifier: freePlan.identifier,
      monthlyCredits: 60, // TRIAL_CONFIG.INITIAL_CREDITS
      // ... other plan details
    },
    usage: {
      monthlyCreditsUsed: 0,
      jobDescriptionGenerations: 0,
      jobSkillsGenerations: 0,
      jobTitleGenerations: 0,
      tailoredResumesUsed: 0,
      generationsWithoutTailoring: 0
    },
    batchSession: {
      sessionId: null,
      startTime: null,
      operations: [],
      totalCreditsDeducted: 0,
      isActive: false
    },
    startDate,
    endDate,
    isActive: true
  })

  return user
}
```

## Testing Examples

### Unit Tests for Credit Functions
```javascript
// test/creditManager.test.js
describe('Credit Manager', () => {
  describe('calculateGenerationCredits', () => {
    it('should return 0 for operations within free limit', () => {
      const credits = CREDIT_CALCULATION.calculateGenerationCredits(
        'JOB_DESCRIPTION_GENERATION', 2, false
      )
      expect(credits).toBe(0)
    })

    it('should return cost for operations beyond free limit', () => {
      const credits = CREDIT_CALCULATION.calculateGenerationCredits(
        'JOB_DESCRIPTION_GENERATION', 4, false
      )
      expect(credits).toBe(2)
    })

    it('should return 0 for operations with retroactive tailoring', () => {
      const credits = CREDIT_CALCULATION.calculateGenerationCredits(
        'JOB_DESCRIPTION_GENERATION', 4, true
      )
      expect(credits).toBe(0)
    })
  })

  describe('handleAtomicGeneration', () => {
    it('should handle concurrent requests safely', async () => {
      // Simulate multiple simultaneous requests
      const promises = Array(3).fill().map(() => 
        creditManager.handleAtomicGeneration(
          userId, 'JOB_DESCRIPTION_GENERATION', 100, { job_description: 'test' }
        )
      )
      
      const results = await Promise.all(promises)
      
      // Verify no double-charging occurred
      const totalCreditsCharged = results.reduce((sum, result) => 
        sum + result.creditsDeducted, 0
      )
      
      expect(totalCreditsCharged).toBeLessThanOrEqual(6) // Max 3 * 2 credits
    })
  })
})
```

### Integration Tests for Batch Sessions
```javascript
describe('Batch Session Management', () => {
  it('should create batch session for parallel requests', async () => {
    const startTime = Date.now()
    
    // Make 3 requests within 3 seconds
    const request1 = supertest(app)
      .post('/api/ai-resume-tailor/generate-job-description')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ company_url: 'https://example.com' })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const request2 = supertest(app)
      .post('/api/ai-resume-tailor/generate-job-skills')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ company_url: 'https://example.com' })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const request3 = supertest(app)
      .post('/api/ai-resume-tailor/generate-job-title')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ company_url: 'https://example.com' })
    
    const [response1, response2, response3] = await Promise.all([request1, request2, request3])
    
    // Verify batch session was created
    expect(response2.body.data.metadata.batch_info).toBeDefined()
    expect(response3.body.data.metadata.batch_info).toBeDefined()
    
    // Verify session ID is consistent
    expect(response2.body.data.metadata.batch_info.sessionId)
      .toBe(response3.body.data.metadata.batch_info.sessionId)
  })
})
```

## Monitoring Queries

### MongoDB Aggregation for Usage Analytics
```javascript
// Get user credit usage patterns
db.usersubscriptions.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $group: {
      _id: "$planSnapshot.identifier",
      totalUsers: { $sum: 1 },
      avgCreditsUsed: { $avg: "$usage.monthlyCreditsUsed" },
      totalGenerations: {
        $sum: {
          $add: [
            "$usage.jobDescriptionGenerations",
            "$usage.jobSkillsGenerations", 
            "$usage.jobTitleGenerations"
          ]
        }
      },
      totalTailoredResumes: { $sum: "$usage.tailoredResumesUsed" },
      avgGenerationsWithoutTailoring: { $avg: "$usage.generationsWithoutTailoring" }
    }
  }
])

// Get batch session statistics
db.usersubscriptions.aggregate([
  {
    $match: { 
      "batchSession.operations": { $exists: true, $ne: [] }
    }
  },
  {
    $project: {
      userId: 1,
      batchOperationCount: { $size: "$batchSession.operations" },
      batchCreditsUsed: "$batchSession.totalCreditsDeducted",
      batchDuration: {
        $subtract: [
          { $max: "$batchSession.operations.timestamp" },
          { $min: "$batchSession.operations.timestamp" }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      totalBatchSessions: { $sum: 1 },
      avgOperationsPerBatch: { $avg: "$batchOperationCount" },
      avgCreditsPerBatch: { $avg: "$batchCreditsUsed" },
      avgBatchDuration: { $avg: "$batchDuration" }
    }
  }
])
```

This technical guide provides the implementation patterns and examples needed to understand and extend the credit system with batch session management.
