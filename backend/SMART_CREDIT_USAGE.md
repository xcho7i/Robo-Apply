## Smart Credit Usage for Parallel AI Generation Endpoints

This document outlines the solution for handling smart credit usage when users call multiple AI generation endpoints (`/generate-job-skills`, `/generate-job-title`, `/generate-job-description`) individually or in parallel.

### Problem Scenarios

1. **Individual Calls**: User calls each endpoint separately over time
2. **Parallel Calls**: User calls multiple endpoints simultaneously  
3. **Batch Calls**: User calls endpoints in rapid succession (within seconds)
4. **Mixed Usage**: Combination of the above patterns

### Solution: Session-Based Batch Optimization

#### 1. **Batch Detection Logic**

- **Batch Window**: 10-second window to detect related calls
- **Parallel Detection**: Calls within 3 seconds are considered parallel
- **Maximum Batch Size**: 5 operations per batch session
- **Session Management**: Automatic session creation and cleanup

#### 2. **Smart Credit Optimization**

**Individual Calls (Normal Behavior)**:
- First 3 calls per operation type: **FREE**
- Subsequent calls: **2 credits each**

**Batch/Parallel Calls (Optimized)**:
- Detected automatically when multiple calls occur within batch window
- Credits calculated upfront for the entire batch
- Session tracking prevents double-charging
- Retroactive refunds apply to entire batch when tailoring is run

**Retroactive Refund Logic**:
- **Individual Refund**: Refunds last 5 non-free generations per type
- **Batch Refund**: Refunds entire batch session if within 5-minute window
- **Combined Logic**: Both individual and batch refunds can apply

#### 3. **Implementation Features**

**Enhanced Rate Limiting**:
```javascript
// Detects parallel calls across all generation types
const rateLimitCheck = await creditManager.checkRateLimitWithParallelDetection(userId, operationType)

// Provides batch candidate information
if (rateLimitCheck.isBatchCandidate) {
  // Handle as potential batch operation
}
```

**Atomic Generation Handling**:
```javascript
// Race-condition safe credit deduction
const atomicResult = await creditManager.handleAtomicGeneration(
  userId, operationType, tokensUsed, result
)

// Returns batch information if applicable
if (atomicResult.batchInfo) {
  // Include batch metadata in response
}
```

**Batch Session Management**:
```javascript
// Session-based optimization for parallel calls
{
  sessionId: "batch_userId_timestamp",
  startTime: Date,
  operations: [
    {
      type: "JOB_DESCRIPTION_GENERATION",
      timestamp: Date,
      creditsDeducted: 2,
      operationCount: 4
    }
  ],
  totalCreditsDeducted: 6,
  isActive: true
}
```

#### 4. **User Experience Benefits**

**Real-Time Feedback**:
- Batch detection notifications
- Credit optimization alerts
- Parallel request warnings
- Progress tracking

**Smart Billing**:
- No duplicate charges for parallel requests
- Automatic batch discounting
- Enhanced retroactive refunds
- Transparent credit usage

**Abuse Prevention**:
- Rate limiting across all endpoints
- Parallel abuse detection
- Session-based throttling
- Smart warnings and blocks

#### 5. **API Response Enhancements**

**Individual Generation Response**:
```json
{
  "msg": "Job description generated successfully",
  "success": true,
  "data": {
    "job_description": "...",
    "metadata": {
      "credits_used": 2,
      "remaining_credits": 45,
      "operation_count": 4,
      "batch_info": {
        "sessionId": "batch_user123_1234567890",
        "operationNumber": 2,
        "totalBatchCredits": 4,
        "isActiveBatch": true
      },
      "warning": "You've generated 4 job descriptions. Consider running a tailored resume to optimize your credits."
    }
  }
}
```

**Batch Optimization Response**:
```json
{
  "msg": "Multiple generations detected - optimizing credits",
  "success": true,
  "data": {
    "batch_session": {
      "sessionId": "batch_user123_1234567890",
      "operations_in_batch": 3,
      "total_credits_optimized": 6,
      "potential_refund_on_tailoring": 6
    }
  }
}
```

**Tailored Resume with Batch Refund**:
```json
{
  "msg": "Tailored resume generated with 6 credits refunded from recent generations",
  "success": true,
  "data": {
    "tailored_resume": {...},
    "metadata": {
      "credits_used": 13,
      "credits_refunded": 6,
      "batch_refund": 4,
      "individual_refund": 2,
      "batch_operations_refunded": 2,
      "individual_generations_refunded": 1,
      "final_cost": 7,
      "remaining_credits": 38
    }
  }
}
```

#### 6. **Database Schema Updates**

**User Subscription Model** - Added `batchSession` field:
```javascript
batchSession: {
  sessionId: String,
  startTime: Date,
  operations: [{
    type: String,
    timestamp: Date,
    tokensUsed: Number,
    creditsDeducted: Number,
    operationCount: Number,
    result: Mixed
  }],
  totalCreditsDeducted: Number,
  isActive: Boolean
}
```

#### 7. **Edge Cases Handled**

1. **Race Conditions**: Atomic operations with retry logic
2. **Session Cleanup**: Automatic expiration and cleanup
3. **Failed Operations**: No credit charges on API failures
4. **Mixed Timeframes**: Proper session boundary detection
5. **Concurrent Users**: Per-user session isolation
6. **Storage Optimization**: Automatic old session cleanup

#### 8. **Monitoring and Analytics**

- Batch session creation/completion tracking
- Parallel request pattern analysis
- Credit optimization effectiveness metrics
- User behavior pattern insights
- Abuse detection statistics

### Summary

This solution provides intelligent credit management for parallel AI generation calls while maintaining fair usage policies and preventing abuse. Users benefit from:

- **Transparent billing** with batch optimization
- **Smart retroactive refunds** across individual and batch operations  
- **Real-time feedback** on credit usage patterns
- **Abuse prevention** without impacting legitimate usage
- **Race condition protection** for reliable credit deduction

The system automatically detects usage patterns and optimizes credit charging accordingly, providing the best possible user experience while maintaining system integrity.
