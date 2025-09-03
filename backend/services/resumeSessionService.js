/**
 * Resume Generation Session Service
 * 
 * Provides business logic for managing resume generation sessions
 */

const ResumeGenerationSession = require("../models/resumeGenerationSession.model")
const mongoose = require("mongoose")

const resumeSessionService = {
  
  /**
   * Create a new resume generation session
   */
  async createSession(userId, baseResumeData, sessionMetadata = {}) {
    try {
      const sessionData = {
        user_id: userId,
        base_resume: {
          s3_path: baseResumeData.s3_path,
          original_filename: baseResumeData.original_filename,
          file_format: baseResumeData.file_format,
          file_size: baseResumeData.file_size,
          extracted_text: baseResumeData.extracted_text,
          base_resume_text: baseResumeData.base_resume_text
        },
        analytics: {
          ip_address: sessionMetadata.ip_address,
          user_agent: sessionMetadata.user_agent,
          referrer: sessionMetadata.referrer,
          device_type: sessionMetadata.device_type || 'unknown'
        }
      }
      
      const session = new ResumeGenerationSession(sessionData)
      await session.save()
      
      return {
        success: true,
        session_id: session.session_id,
        session: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Create a session with a specific ID (for unified tracking)
   * If session already exists, return the existing session instead of failing
   */
  async createSessionWithId(sessionId, sessionData) {
    try {
      // First check if session already exists
      const existingSession = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (existingSession) {
        // Session already exists, return it
        console.log(`Session ${sessionId} already exists, returning existing session`)
        return {
          success: true,
          session_id: existingSession.session_id,
          session: existingSession,
          existed: true
        }
      }
      
      const newSessionData = {
        session_id: sessionId, // Override the auto-generated ID
        user_id: sessionData.userId,
        analytics: {
          ip_address: sessionData.analytics?.ipAddress,
          user_agent: sessionData.analytics?.userAgent,
          referrer: sessionData.analytics?.referrer,
          device_type: sessionData.analytics?.deviceType || 'unknown'
        }
      }
      
      // Only include base_resume if resume data is provided and valid
      if (sessionData.baseResumeS3Path || sessionData.baseResumeText) {
        const baseResumeData = {}
        
        if (sessionData.baseResumeS3Path) {
          baseResumeData.s3_path = sessionData.baseResumeS3Path
        }
        
        if (sessionData.baseResumeText) {
          baseResumeData.base_resume_text = sessionData.baseResumeText
        }
        
        if (sessionData.originalFilename) {
          baseResumeData.original_filename = sessionData.originalFilename
        }
        
        if (sessionData.fileFormat) {
          baseResumeData.file_format = sessionData.fileFormat
        }
        
        if (sessionData.fileSize !== undefined && sessionData.fileSize !== null) {
          baseResumeData.file_size = sessionData.fileSize
        }
        
        // Only set base_resume if we have actual data
        if (Object.keys(baseResumeData).length > 0) {
          newSessionData.base_resume = baseResumeData
        }
      }
      
      const session = new ResumeGenerationSession(newSessionData)
      await session.save()
      
      return {
        success: true,
        session_id: session.session_id,
        session: session,
        existed: false
      }
    } catch (error) {
      // If it's a duplicate key error, try to get the existing session
      if (error.message && error.message.includes('E11000 duplicate key error')) {
        try {
          const existingSession = await ResumeGenerationSession.findBySessionId(sessionId)
          if (existingSession) {
            console.log(`Duplicate key error resolved: found existing session ${sessionId}`)
            return {
              success: true,
              session_id: existingSession.session_id,
              session: existingSession,
              existed: true
            }
          }
        } catch (findError) {
          console.error(`Error finding existing session after duplicate key error:`, findError)
        }
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Unified createSession method that handles the controller's data format
   */
  async createSessionUnified(sessionData) {
    try {
      const newSessionData = {
        user_id: sessionData.userId,
        base_resume: {
          s3_path: sessionData.baseResumeS3Path,
          original_filename: sessionData.originalFilename,
          file_format: sessionData.fileFormat,
          file_size: sessionData.fileSize,
          base_resume_text: sessionData.baseResumeText
        },
        analytics: {
          ip_address: sessionData.analytics?.ipAddress,
          user_agent: sessionData.analytics?.userAgent,
          referrer: sessionData.analytics?.referrer,
          device_type: sessionData.analytics?.deviceType || 'unknown'
        }
      }
      
      const session = new ResumeGenerationSession(newSessionData)
      await session.save()
      
      return {
        success: true,
        sessionId: session.session_id,
        session: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Add a new generated resume to an existing session
   */
  async addGeneratedResume(sessionId, generationData) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        throw new Error("Session not found")
      }
      
      if (session.isExpired()) {
        throw new Error("Session has expired")
      }

      // Extract generation type from metadata
      const generationType = generationData.metadata?.generationType
      
      // Generate unique generation ID to avoid duplicate key errors
      const generationId = generationData.id || `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Check if this is a free generation and if it's allowed
      let usedFreeGeneration = false
      if (generationType) {
        // First check if user has exceeded global free limits
        const canUseFreeGlobally = await this.checkGlobalFreeUsageLimit(session.user_id, generationType)
        
        // Only allow session-based free generation if global limits haven't been exceeded
        if (canUseFreeGlobally && session.canUseFreeGeneration(generationType)) {
          usedFreeGeneration = true
          await session.markFreeGenerationUsed(generationType)
        }
      }
      
      const resumeData = {
        generation_id: generationId, // Explicitly set unique generation ID
        job_details: {
          job_title: generationData.jobTitle,
          job_description: generationData.jobDescription,
          company_name: generationData.companyName,
          company_url: generationData.companyUrl,
          job_skills: generationData.jobSkills || [],
          years_experience: generationData.yearsExperience || 0,
          additional_context: generationData.additionalContext,
          // New fields for enhanced job tracking
          resume_score: generationData.metadata?.resumeScore || null,
          language: generationData.metadata?.language || 'English (US)',
          years_experience_string: generationData.metadata?.yearsOfExperience || null,
          // Original job ID fields for flexible lookup
          original_job_id: generationData.metadata?.original_job_id || generationData.metadata?.originalJobId || null,
          original_id: generationData.metadata?.original_id || generationData.metadata?.originalJobId || null
        },
        generated_resume: {
          s3_path: generationData.s3Path,
          resume_data: generationData.resumeData,
          format: generationData.format || 'JSON',
          file_size: generationData.fileSize
        },
        generation_metadata: {
          model_used: generationData.metadata?.modelUsed || 'gpt-4o',
          generation_type: generationType,
          tokens_used: generationData.metadata?.tokensUsed || 0,
          credits_used: generationData.metadata?.creditsUsed || 0,
          used_free_generation: usedFreeGeneration,
          generation_time_ms: generationData.metadata?.generationTimeMs,
          generation_status: generationData.metadata?.status || 'completed',
          error_details: generationData.metadata?.errorDetails
        }
      }
      
      await session.addGeneratedResume(resumeData)
      
      // Check and mark if free limits exceeded
      await session.checkAndMarkFreeLimitExceeded()
      
      // Return the generation ID for tracking
      const addedGeneration = session.generated_resumes[session.generated_resumes.length - 1]
      
      return {
        success: true,
        generation_id: addedGeneration.generation_id,
        session_id: session.session_id,
        session: session,
        used_free_generation: usedFreeGeneration,
        free_generation_stats: session.getFreeGenerationStats()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Get session by session ID with optional population
   */
  async getSession(sessionId, includeGenerations = true) {
    try {
      let query = ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!includeGenerations) {
        query = query.select('-generated_resumes')
      }
      
      // Remove populate to avoid missing User model error
      const session = await query
      
      if (!session) {
        throw new Error("Session not found")
      }
      
      return {
        success: true,
        session: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId, limit = 10, includeResumeData = false) {
    try {
      let query = ResumeGenerationSession.findActiveSessionsByUser(userId)
        .limit(limit)
      
      // Only exclude resume data if specifically requested (for performance)
      if (!includeResumeData) {
        query = query.select('-generated_resumes.generated_resume.resume_data')
      }
      
      const sessions = await query
      
      return {
        success: true,
        sessions: sessions,
        count: sessions.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Get a specific generated resume by generation ID
   */
  async getGeneratedResume(generationId) {
    try {
      const session = await ResumeGenerationSession.findByGenerationId(generationId)
      
      if (!session) {
        throw new Error("Generation not found")
      }
      
      const generation = session.generated_resumes.find(
        resume => resume.generation_id === generationId
      )
      
      return {
        success: true,
        generation: generation,
        session_id: session.session_id,
        base_resume: session.base_resume
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Update generation status (pending -> processing -> completed/failed)
   */
  async updateGenerationStatus(generationId, status, errorDetails = null) {
    try {
      const session = await ResumeGenerationSession.findByGenerationId(generationId)
      
      if (!session) {
        throw new Error("Generation not found")
      }
      
      await session.updateGenerationStatus(generationId, status, errorDetails)
      
      return {
        success: true,
        generation_id: generationId,
        status: status
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Update generated resume data for an existing generation
   */
  async updateGeneratedResumeData(sessionId, generationId, resumeData, metadata = {}) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        throw new Error("Session not found")
      }
      
      console.log("Before update - Generation exists:", {
        sessionId,
        generationId,
        generationExists: !!session.generated_resumes.find(r => r.generation_id === generationId),
        resumeDataSize: JSON.stringify(resumeData).length
      })
      
      await session.updateGeneratedResumeData(generationId, resumeData, metadata)
      
      // Verify the update was successful
      const updatedGeneration = session.generated_resumes.find(r => r.generation_id === generationId)
      console.log("After update - Verification:", {
        hasResumeData: !!updatedGeneration?.generated_resume?.resume_data,
        resumeDataSize: updatedGeneration?.generated_resume?.resume_data ? 
          JSON.stringify(updatedGeneration.generated_resume.resume_data).length : 0
      })
      
      return {
        success: true,
        session_id: sessionId,
        generation_id: generationId,
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Get session statistics for a user
   */
  async getUserSessionStats(userId, startDate = null, endDate = null) {
    try {
      const stats = await ResumeGenerationSession.getSessionStats(userId, startDate, endDate)
      
      return {
        success: true,
        stats: stats[0] || {
          total_sessions: 0,
          total_generations: 0,
          total_credits_used: 0,
          total_tokens_used: 0,
          avg_generations_per_session: 0
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Archive old sessions (mark as archived, don't delete)
   */
  async archiveOldSessions(daysOld = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      const result = await ResumeGenerationSession.updateMany(
        {
          createdAt: { $lt: cutoffDate },
          'session_metadata.status': { $ne: 'archived' }
        },
        {
          $set: { 'session_metadata.status': 'archived' }
        }
      )
      
      return {
        success: true,
        archived_count: result.modifiedCount
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const result = await ResumeGenerationSession.updateMany(
        {
          'session_metadata.expires_at': { $lt: new Date() },
          'session_metadata.status': 'active'
        },
        {
          $set: { 'session_metadata.status': 'expired' }
        }
      )
      
      return {
        success: true,
        expired_count: result.modifiedCount
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Search sessions by job title or company name
   */
  async searchSessions(userId, searchQuery, limit = 20) {
    try {
      const sessions = await ResumeGenerationSession.find({
        user_id: userId,
        $or: [
          { 'generated_resumes.job_details.job_title': { $regex: searchQuery, $options: 'i' } },
          { 'generated_resumes.job_details.company_name': { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-generated_resumes.generated_resume.resume_data')
      
      return {
        success: true,
        sessions: sessions,
        count: sessions.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Get generations by status across all sessions for a user
   */
  async getGenerationsByStatus(userId, status) {
    try {
      const sessions = await ResumeGenerationSession.find({
        user_id: userId,
        'generated_resumes.generation_metadata.generation_status': status
      }).populate('user_id', 'email name')
      
      const generations = []
      sessions.forEach(session => {
        const matchingGenerations = session.generated_resumes.filter(
          resume => resume.generation_metadata.generation_status === status
        )
        matchingGenerations.forEach(generation => {
          generations.push({
            session_id: session.session_id,
            generation_id: generation.generation_id,
            job_title: generation.job_details.job_title,
            company_name: generation.job_details.company_name,
            created_at: generation.created_at,
            generation_metadata: generation.generation_metadata
          })
        })
      })
      
      return {
        success: true,
        generations: generations,
        count: generations.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  /**
   * Check if a session can use a free generation for a specific type
   */
  async checkFreeGenerationEligibility(sessionId, generationType) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        return {
          success: false,
          eligible: false,
          error: "Session not found"
        }
      }
      
      if (session.isExpired()) {
        return {
          success: false,
          eligible: false,
          error: "Session has expired"
        }
      }
      
      const canUseFree = session.canUseFreeGeneration(generationType)
      const freeStats = session.getFreeGenerationStats()
      
      return {
        success: true,
        eligible: canUseFree,
        free_generation_stats: freeStats,
        session_id: sessionId
      }
    } catch (error) {
      return {
        success: false,
        eligible: false,
        error: error.message
      }
    }
  },

  /**
   * Mark a free generation as used for a specific type
   */
  async markFreeGenerationUsed(sessionId, generationType) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        throw new Error("Session not found")
      }
      
      await session.markFreeGenerationUsed(generationType)
      await session.checkAndMarkFreeLimitExceeded()
      
      return {
        success: true,
        session_id: sessionId,
        free_generation_stats: session.getFreeGenerationStats()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Update base resume data for an existing session
   */
  async updateBaseResume(sessionId, baseResumeData) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        throw new Error("Session not found")
      }
      
      // Initialize base_resume if it doesn't exist
      if (!session.base_resume) {
        session.base_resume = {}
      }
      
      // Handle both old parameter names (from controller) and new parameter names
      // Controller passes: baseResumeS3Path, originalFilename, fileFormat, fileSize, baseResumeText
      // Model expects: s3_path, original_filename, file_format, file_size, base_resume_text
      
      if (baseResumeData.baseResumeS3Path !== undefined) {
        session.base_resume.s3_path = baseResumeData.baseResumeS3Path
      }
      if (baseResumeData.s3_path !== undefined) {
        session.base_resume.s3_path = baseResumeData.s3_path
      }
      
      if (baseResumeData.originalFilename !== undefined) {
        session.base_resume.original_filename = baseResumeData.originalFilename
      }
      if (baseResumeData.original_filename !== undefined) {
        session.base_resume.original_filename = baseResumeData.original_filename
      }
      
      if (baseResumeData.fileFormat !== undefined) {
        session.base_resume.file_format = baseResumeData.fileFormat
      }
      if (baseResumeData.file_format !== undefined) {
        session.base_resume.file_format = baseResumeData.file_format
      }
      
      if (baseResumeData.fileSize !== undefined) {
        session.base_resume.file_size = baseResumeData.fileSize
      }
      if (baseResumeData.file_size !== undefined) {
        session.base_resume.file_size = baseResumeData.file_size
      }
      
      if (baseResumeData.baseResumeText !== undefined) {
        session.base_resume.base_resume_text = baseResumeData.baseResumeText
      }
      if (baseResumeData.base_resume_text !== undefined) {
        session.base_resume.base_resume_text = baseResumeData.base_resume_text
      }
      
      if (baseResumeData.extracted_text !== undefined) {
        session.base_resume.extracted_text = baseResumeData.extracted_text
      }
      
      // Set upload timestamp
      session.base_resume.uploaded_at = new Date()
      
      await session.save()
      
      return {
        success: true,
        session_id: session.session_id,
        session: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Check if user can still use free generations globally
   * @param {string} userId - User ID
   * @param {string} generationType - Type of generation (JOB_TITLE_GENERATION, etc.)
   * @returns {boolean} Whether user can still use free generations for this type
   */
  async checkGlobalFreeUsageLimit(userId, generationType) {
    try {
      const { FREE_USAGE_LIMITS } = require('../config/ai/credits.config')
      const UserSubscription = require('../models/userSubscriptionModel')
      
      // Get user's current usage
      const userSub = await UserSubscription.findOne({ 
        userId, 
        isActive: true 
      }).lean()
      
      if (!userSub) {
        return false // No subscription, no free usage
      }
      
      // Get current operation count for this type
      let currentCount = 0
      switch(generationType) {
        case 'JOB_TITLE':
        case 'JOB_TITLE_GENERATION':
          currentCount = userSub.usage.jobTitleGenerations || 0
          break
        case 'JOB_DESCRIPTION':
        case 'JOB_DESCRIPTION_GENERATION':
          currentCount = userSub.usage.jobDescriptionGenerations || 0
          break
        case 'JOB_SKILLS':
        case 'JOB_SKILLS_GENERATION':
          currentCount = userSub.usage.jobSkillsGenerations || 0
          break
        default:
          return false
      }
      
      // Get free limit for this operation type
      const freeLimit = FREE_USAGE_LIMITS[generationType] || 0
      
      // Return true if user hasn't exceeded global free limit
      return currentCount < freeLimit
      
    } catch (error) {
      console.error('Error checking global free usage limit:', error)
      return false // On error, don't allow free usage
    }
  },

  /**
   * Get generation history for a specific generation within a session
   */
  async getGenerationHistory(sessionId, generationId) {
    try {
      const session = await ResumeGenerationSession.findBySessionId(sessionId)
      
      if (!session) {
        return {
          success: false,
          error: "Session not found"
        }
      }
      
      try {
        const history = session.getGenerationHistory(generationId)
        return {
          success: true,
          history: history
        }
      } catch (error) {
        return {
          success: false,
          error: error.message
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Delete a session completely
   */
  async deleteSession(sessionId) {
    try {
      const result = await ResumeGenerationSession.findOneAndDelete({ 
        session_id: sessionId 
      })
      
      if (!result) {
        return {
          success: false,
          error: "Session not found"
        }
      }
      
      return {
        success: true,
        deleted_session_id: sessionId,
        deleted_at: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },
}

module.exports = resumeSessionService
