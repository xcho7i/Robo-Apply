const mongoose = require("mongoose")

/**
 * Resume Generation Session Model
 * 
 * Stores resume generation requests against a specific session ID
 * Tracks base resume (S3 path) and multiple generated resumes for different job applications
 */

// Sub-schema for generated resume entries
const generatedResumeSchema = new mongoose.Schema({
  // Unique identifier for this specific generation
  generation_id: {
    type: String,
    required: true,
    default: () => `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Job application details
  job_details: {
    job_title: {
      type: String,
      required: true,
      trim: true
    },
    job_description: {
      type: String,
      required: true
    },
    company_name: {
      type: String,
      trim: true
    },
    company_url: {
      type: String,
      trim: true
    },
    job_skills: [{
      type: String,
      trim: true
    }],
    years_experience: {
      type: Number,
      default: 0
    },
    additional_context: {
      type: String,
      trim: true
    },
    // New fields for enhanced job tracking
    resume_score: {
      type: Number,
      min: 0,
      max: 100
    },
    language: {
      type: String,
      trim: true,
      default: 'English (US)'
    },
    years_experience_string: {
      type: String,
      trim: true
    },
    // Original job ID fields for flexible lookup
    original_job_id: {
      type: String,
      trim: true
    },
    original_id: {
      type: String,
      trim: true
    }
  },
  
  // Generated resume data
  generated_resume: {
    // S3 path or direct storage of tailored resume
    s3_path: {
      type: String,
      trim: true
    },
    // Structured resume data (JSON format)
    resume_data: {
      type: mongoose.Schema.Types.Mixed
    },
    // Resume format (PDF, DOCX, HTML, etc.)
    format: {
      type: String,
      enum: ['PDF', 'DOCX', 'HTML', 'JSON'],
      default: 'JSON'
    },
    // File size in bytes
    file_size: {
      type: Number
    }
  },
  
  // Previous generations history
  previous_generations: [{
    // Timestamp when this version was created
    generated_at: {
      type: Date,
      required: true
    },
    // The previous resume data before it was overwritten
    resume_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    // Generation metadata from when this version was active
    generation_metadata: {
      model_used: {
        type: String,
        default: 'gpt-4o'
      },
      tokens_used: {
        type: Number,
        default: 0
      },
      credits_used: {
        type: Number,
        default: 0
      },
      generation_time_ms: {
        type: Number
      },
      format: {
        type: String,
        enum: ['PDF', 'DOCX', 'HTML', 'JSON'],
        default: 'JSON'
      }
    },
    // Version number for easy tracking
    version_number: {
      type: Number,
      required: true
    }
  }],
  
  // Generation metadata
  generation_metadata: {
    // AI model used for generation
    model_used: {
      type: String,
      default: 'gpt-4o'
    },
    // Type of generation performed
    generation_type: {
      type: String,
      enum: ['JOB_TITLE', 'JOB_DESCRIPTION', 'JOB_SKILLS', 'TAILORED_RESUME'],
      required: true
    },
    // Tokens consumed
    tokens_used: {
      type: Number,
      default: 0
    },
    // Credits deducted
    credits_used: {
      type: Number,
      default: 0
    },
    // Whether this generation used a free quota
    used_free_generation: {
      type: Boolean,
      default: false
    },
    // Whether this generation has used free regeneration
    has_used_free_regeneration: {
      type: Boolean,
      default: false
    },
    // Generation time in milliseconds
    generation_time_ms: {
      type: Number
    },
    // Success status
    generation_status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'processing'],
      default: 'pending'
    },
    // Error details if generation failed
    error_details: {
      type: String
    }
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true,
  timestamps: false // We handle timestamps manually
})

// Main session schema
const resumeGenerationSessionSchema = new mongoose.Schema({
  // Unique session identifier
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // User who owns this session
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Base resume information (optional - for job-only sessions)
  base_resume: {
    type: {
      // S3 path to the uploaded base resume (optional for text-only resumes)
      s3_path: {
        type: String,
        required: false,
        trim: true
      },
      // Original filename
      original_filename: {
        type: String,
        required: false,
        trim: true
      },
      // File format of base resume
      file_format: {
        type: String,
        enum: ['PDF', 'DOCX', 'TXT', 'HTML'],
        required: false
      },
      // File size in bytes
      file_size: {
        type: Number,
        required: false
      },
      // Extracted text content for AI processing
      extracted_text: {
        type: String
      },
      // Base resume text content provided directly (alternative to file upload)
      base_resume_text: {
        type: String,
        trim: true
      },
      // Upload timestamp
      uploaded_at: {
        type: Date,
        default: Date.now
      }
    },
    required: false
  },
  
  // Array of generated resumes for different job applications
  generated_resumes: [generatedResumeSchema],
  
  // Session metadata
  session_metadata: {
    // Session status
    status: {
      type: String,
      enum: ['active', 'completed', 'archived', 'expired'],
      default: 'active'
    },
    // Total generations in this session
    total_generations: {
      type: Number,
      default: 0
    },
    // Total credits used in this session
    total_credits_used: {
      type: Number,
      default: 0
    },
    // Total tokens consumed in this session
    total_tokens_used: {
      type: Number,
      default: 0
    },
    // Free generation tracking - prevents abuse of free generation limits
    free_generations_used: {
      // Track if job title generation was used (typically 1 free per session)
      job_title_generated: {
        type: Boolean,
        default: false
      },
      // Track if job description generation was used (typically 1 free per session)
      job_description_generated: {
        type: Boolean,
        default: false
      },
      // Track if job skills generation was used (typically 1 free per session)
      job_skills_generated: {
        type: Boolean,
        default: false
      },
      // Count of each generation type used in this session
      generation_counts: {
        job_title: {
          type: Number,
          default: 0
        },
        job_description: {
          type: Number,
          default: 0
        },
        job_skills: {
          type: Number,
          default: 0
        },
        tailored_resume: {
          type: Number,
          default: 0
        }
      },
      // Timestamp when first free generation was used
      first_free_generation_at: {
        type: Date
      },
      // Track if user has exceeded free limits in this session
      free_limits_exceeded: {
        type: Boolean,
        default: false
      }
    },
    // Session expiry date
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  
  // Tracking and analytics
  analytics: {
    // IP address of user
    ip_address: {
      type: String
    },
    // User agent
    user_agent: {
      type: String
    },
    // Referrer URL
    referrer: {
      type: String
    },
    // Device type
    device_type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'resume_generation_sessions'
})

// Indexes for performance
resumeGenerationSessionSchema.index({ user_id: 1, createdAt: -1 })
resumeGenerationSessionSchema.index({ session_id: 1 })
resumeGenerationSessionSchema.index({ 'session_metadata.status': 1 })
resumeGenerationSessionSchema.index({ 'session_metadata.expires_at': 1 })
// Sparse unique index - only enforces uniqueness on non-null values
resumeGenerationSessionSchema.index({ 'generated_resumes.generation_id': 1 }, { unique: true, sparse: true })

// Pre-save middleware to update session metadata
resumeGenerationSessionSchema.pre('save', function(next) {
  // Update total generations count
  this.session_metadata.total_generations = this.generated_resumes.length
  
  // Calculate total credits and tokens used
  this.session_metadata.total_credits_used = this.generated_resumes.reduce(
    (total, resume) => total + (resume.generation_metadata.credits_used || 0), 0
  )
  this.session_metadata.total_tokens_used = this.generated_resumes.reduce(
    (total, resume) => total + (resume.generation_metadata.tokens_used || 0), 0
  )
  
  // Update generation counts based on actual generated resumes
  const generationCounts = {
    job_title: 0,
    job_description: 0,
    job_skills: 0,
    tailored_resume: 0
  }
  
  this.generated_resumes.forEach(resume => {
    const generationType = resume.generation_metadata.generation_type
    if (generationType) {
      switch(generationType) {
        case 'JOB_TITLE':
          generationCounts.job_title += 1
          break
        case 'JOB_DESCRIPTION':
          generationCounts.job_description += 1
          break
        case 'JOB_SKILLS':
          generationCounts.job_skills += 1
          break
        case 'TAILORED_RESUME':
          generationCounts.tailored_resume += 1
          break
      }
    }
  })
  
  // Update the generation counts in metadata
  this.session_metadata.free_generations_used.generation_counts = generationCounts
  
  // Update timestamps for generated resumes
  this.generated_resumes.forEach(resume => {
    if (resume.isNew) {
      resume.created_at = new Date()
    }
    resume.updated_at = new Date()
  })
  
  next()
})

// Instance methods
resumeGenerationSessionSchema.methods.addGeneratedResume = function(resumeData) {
  this.generated_resumes.push(resumeData)
  return this.save()
}

resumeGenerationSessionSchema.methods.updateGenerationStatus = function(generationId, status, errorDetails = null) {
  const generation = this.generated_resumes.find(
    resume => resume.generation_id === generationId
  )
  
  if (generation) {
    generation.generation_metadata.generation_status = status
    if (errorDetails) {
      generation.generation_metadata.error_details = errorDetails
    }
    generation.updated_at = new Date()
    return this.save()
  }
  
  throw new Error(`Generation with ID ${generationId} not found`)
}

resumeGenerationSessionSchema.methods.updateGeneratedResumeData = function(generationId, resumeData, metadata = {}) {
  const generation = this.generated_resumes.find(
    resume => resume.generation_id === generationId
  )
  
  if (!generation) {
    throw new Error(`Generation with ID ${generationId} not found`)
  }
  
  console.log("Model update - before:", {
    generationId,
    hadResumeData: !!generation.generated_resume.resume_data,
    incomingDataSize: JSON.stringify(resumeData).length,
    previousGenerationsCount: generation.previous_generations?.length || 0
  })
  
  // If there's existing resume data, preserve it in the history before overwriting
  if (generation.generated_resume.resume_data) {
    // Initialize previous_generations array if it doesn't exist
    if (!generation.previous_generations) {
      generation.previous_generations = []
    }
    
    // Calculate the next version number
    const nextVersionNumber = generation.previous_generations.length + 1
    
    // Create a historical record of the current data before overwriting
    const previousVersion = {
      generated_at: generation.updated_at || new Date(),
      resume_data: generation.generated_resume.resume_data,
      generation_metadata: {
        model_used: generation.generation_metadata.model_used,
        tokens_used: generation.generation_metadata.tokens_used,
        credits_used: generation.generation_metadata.credits_used,
        generation_time_ms: generation.generation_metadata.generation_time_ms,
        format: generation.generated_resume.format
      },
      version_number: nextVersionNumber
    }
    
    // Add to history
    generation.previous_generations.push(previousVersion)
    
    console.log("Preserved previous generation:", {
      generationId,
      versionNumber: nextVersionNumber,
      preservedDataSize: JSON.stringify(previousVersion.resume_data).length,
      totalHistoryCount: generation.previous_generations.length
    })
  }
  
  // Update the generated resume data with new content
  generation.generated_resume.resume_data = resumeData
  generation.generated_resume.format = metadata.format || generation.generated_resume.format
  generation.generated_resume.file_size = metadata.file_size || generation.generated_resume.file_size
  
  // Update generation metadata
  if (metadata.tokens_used !== undefined) {
    generation.generation_metadata.tokens_used = metadata.tokens_used
  }
  if (metadata.credits_used !== undefined) {
    generation.generation_metadata.credits_used = metadata.credits_used
  }
  if (metadata.model_used) {
    generation.generation_metadata.model_used = metadata.model_used
  }
  if (metadata.generation_time_ms !== undefined) {
    generation.generation_metadata.generation_time_ms = metadata.generation_time_ms
  }
  if (metadata.has_used_free_regeneration !== undefined) {
    generation.generation_metadata.has_used_free_regeneration = metadata.has_used_free_regeneration
  }
  if (metadata.used_free_generation !== undefined) {
    generation.generation_metadata.used_free_generation = metadata.used_free_generation
  }
  
  // Update timestamps - handle both manual and automatic setting
  if (metadata.updated_at) {
    generation.updated_at = new Date(metadata.updated_at)
  } else {
    generation.updated_at = new Date()
  }
  
  // Set created_at if provided in metadata (for new generations) or if it doesn't exist
  if (metadata.created_at) {
    generation.created_at = new Date(metadata.created_at)
  } else if (!generation.created_at) {
    generation.created_at = new Date()
  }
  
  // Update status to completed
  generation.generation_metadata.generation_status = 'completed'
  
  console.log("Model update - after assignment:", {
    generationId,
    hasResumeData: !!generation.generated_resume.resume_data,
    resumeDataSize: JSON.stringify(generation.generated_resume.resume_data).length,
    totalHistoryVersions: generation.previous_generations?.length || 0
  })
  
  // Mark the nested paths as modified to ensure save works
  this.markModified('generated_resumes')
  
  return this.save()
}

resumeGenerationSessionSchema.methods.getGenerationHistory = function(generationId) {
  const generation = this.generated_resumes.find(
    resume => resume.generation_id === generationId
  )
  
  if (!generation) {
    throw new Error(`Generation with ID ${generationId} not found`)
  }
  
  return {
    generation_id: generationId,
    current_version: {
      resume_data: generation.generated_resume.resume_data,
      generated_at: generation.updated_at,
      metadata: generation.generation_metadata,
      format: generation.generated_resume.format,
      version_number: (generation.previous_generations?.length || 0) + 1
    },
    previous_versions: generation.previous_generations || [],
    total_versions: (generation.previous_generations?.length || 0) + 1,
    regeneration_count: generation.previous_generations?.length || 0
  }
}

resumeGenerationSessionSchema.methods.getCompletedGenerations = function() {
  return this.generated_resumes.filter(
    resume => resume.generation_metadata.generation_status === 'completed'
  )
}

resumeGenerationSessionSchema.methods.getFailedGenerations = function() {
  return this.generated_resumes.filter(
    resume => resume.generation_metadata.generation_status === 'failed'
  )
}

resumeGenerationSessionSchema.methods.isExpired = function() {
  return new Date() > this.session_metadata.expires_at
}

// Free generation tracking methods
resumeGenerationSessionSchema.methods.canUseFreeGeneration = function(generationType) {
  const freeGen = this.session_metadata.free_generations_used
  
  switch(generationType) {
    case 'JOB_TITLE':
    case 'JOB_TITLE_GENERATION':
      return !freeGen.job_title_generated
    case 'JOB_DESCRIPTION':
    case 'JOB_DESCRIPTION_GENERATION':
      return !freeGen.job_description_generated
    case 'JOB_SKILLS':
    case 'JOB_SKILLS_GENERATION':
      return !freeGen.job_skills_generated
    default:
      return false
  }
}

resumeGenerationSessionSchema.methods.markFreeGenerationUsed = function(generationType) {
  const freeGen = this.session_metadata.free_generations_used
  
  // Set first free generation timestamp if this is the first one
  if (!freeGen.first_free_generation_at) {
    freeGen.first_free_generation_at = new Date()
  }
  
  switch(generationType) {
    case 'JOB_TITLE':
    case 'JOB_TITLE_GENERATION':
      freeGen.job_title_generated = true
      freeGen.generation_counts.job_title += 1
      break
    case 'JOB_DESCRIPTION':
    case 'JOB_DESCRIPTION_GENERATION':
      freeGen.job_description_generated = true
      freeGen.generation_counts.job_description += 1
      break
    case 'JOB_SKILLS':
    case 'JOB_SKILLS_GENERATION':
      freeGen.job_skills_generated = true
      freeGen.generation_counts.job_skills += 1
      break
    case 'TAILORED_RESUME':
      freeGen.generation_counts.tailored_resume += 1
      break
  }
  
  return this.save()
}

resumeGenerationSessionSchema.methods.getFreeGenerationStats = function() {
  const freeGen = this.session_metadata.free_generations_used
  
  return {
    job_title_used: freeGen.job_title_generated,
    job_description_used: freeGen.job_description_generated,
    job_skills_used: freeGen.job_skills_generated,
    total_generations: freeGen.generation_counts,
    first_generation_at: freeGen.first_free_generation_at,
    free_limits_exceeded: freeGen.free_limits_exceeded,
    remaining_free_generations: {
      job_title: freeGen.job_title_generated ? 0 : 1,
      job_description: freeGen.job_description_generated ? 0 : 1,
      job_skills: freeGen.job_skills_generated ? 0 : 1
    }
  }
}

resumeGenerationSessionSchema.methods.checkAndMarkFreeLimitExceeded = function() {
  const freeGen = this.session_metadata.free_generations_used
  const counts = freeGen.generation_counts
  
  // Define free limits (can be configurable)
  const FREE_LIMITS = {
    job_title: 1,
    job_description: 1,
    job_skills: 1
  }
  
  const exceeded = (
    counts.job_title > FREE_LIMITS.job_title ||
    counts.job_description > FREE_LIMITS.job_description ||
    counts.job_skills > FREE_LIMITS.job_skills
  )
  
  if (exceeded && !freeGen.free_limits_exceeded) {
    freeGen.free_limits_exceeded = true
    return this.save()
  }
  
  return Promise.resolve(this)
}

// Static methods
resumeGenerationSessionSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ session_id: sessionId })
}

resumeGenerationSessionSchema.statics.findActiveSessionsByUser = function(userId) {
  return this.find({ 
    user_id: userId, 
    'session_metadata.status': 'active',
    'session_metadata.expires_at': { $gt: new Date() }
  }).sort({ createdAt: -1 })
}

resumeGenerationSessionSchema.statics.findByGenerationId = function(generationId) {
  return this.findOne({ 
    'generated_resumes.generation_id': generationId 
  })
}

resumeGenerationSessionSchema.statics.getSessionStats = function(userId, startDate, endDate) {
  const matchStage = {
    user_id: new mongoose.Types.ObjectId(userId)
  }
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total_sessions: { $sum: 1 },
        total_generations: { $sum: '$session_metadata.total_generations' },
        total_credits_used: { $sum: '$session_metadata.total_credits_used' },
        total_tokens_used: { $sum: '$session_metadata.total_tokens_used' },
        avg_generations_per_session: { $avg: '$session_metadata.total_generations' }
      }
    }
  ])
}

// Virtual for session age
resumeGenerationSessionSchema.virtual('session_age_days').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Virtual for active generation count
resumeGenerationSessionSchema.virtual('active_generations_count').get(function() {
  return this.generated_resumes.filter(
    resume => ['pending', 'processing'].includes(resume.generation_metadata.generation_status)
  ).length
})

// Custom validation to ensure required fields when base_resume is provided
// Note: This validation only applies if base_resume object exists (allows job-only sessions)
resumeGenerationSessionSchema.pre('save', function(next) {
  // Only validate if base_resume exists (allows sessions without base resume for job storage)
  if (this.base_resume && Object.keys(this.base_resume).length > 0) {
    // Ensure at least one content source is provided
    if (!this.base_resume.s3_path && !this.base_resume.base_resume_text) {
      return next(new Error('Either s3_path or base_resume_text must be provided for base_resume'))
    }
    
    // If s3_path is provided, ensure required file metadata is present
    if (this.base_resume.s3_path) {
      if (!this.base_resume.original_filename) {
        return next(new Error('original_filename is required when s3_path is provided'))
      }
      if (!this.base_resume.file_format) {
        return next(new Error('file_format is required when s3_path is provided'))
      }
      if (this.base_resume.file_size === undefined || this.base_resume.file_size === null) {
        return next(new Error('file_size is required when s3_path is provided'))
      }
    }
    
    // If base_resume_text is provided without s3_path, set default metadata
    if (this.base_resume.base_resume_text && !this.base_resume.s3_path) {
      if (!this.base_resume.original_filename) {
        this.base_resume.original_filename = 'text_resume.txt'
      }
      if (!this.base_resume.file_format) {
        this.base_resume.file_format = 'TXT'
      }
      if (this.base_resume.file_size === undefined || this.base_resume.file_size === null) {
        this.base_resume.file_size = Buffer.byteLength(this.base_resume.base_resume_text, 'utf8')
      }
    }
  }
  next()
})

const ResumeGenerationSession = mongoose.model('ResumeGenerationSession', resumeGenerationSessionSchema)

module.exports = ResumeGenerationSession
