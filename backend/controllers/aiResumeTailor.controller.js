const {
  generateSystemPrompt,
  generateUserPrompt
} = require("../config/ai/prompts/resume.prompt")
const {
  generateJobDescriptionSystemPrompt,
  generateJobDescriptionUserPrompt
} = require("../config/ai/prompts/jobDescription.prompt")
const {
  generateJobSkillsSystemPrompt,
  generateJobSkillsUserPrompt
} = require("../config/ai/prompts/jobSkills.prompt")
const {
  generateJobTitleSystemPrompt,
  generateJobTitleUserPrompt
} = require("../config/ai/prompts/jobTitle.prompt")
const { TAILORED_RESUME_SCHEMA } = require("../config/ai/schema/resume.schema")

const { openai } = require("../config/ai")
const {
  CREDIT_COSTS,
  FREE_USAGE_LIMITS
} = require("../config/ai/credits.config")
const creditManager = require("../utils/creditManager")
const resumeSessionService = require("../services/resumeSessionService")
const utils = require("../utils")

// Helper function to handle session creation/update with improved duplicate handling
const handleSessionCreateOrUpdate = async (
  sessionId,
  sessionData,
  updateData = null
) => {
  try {
    // First, try to create or get existing session
    const sessionResult = await resumeSessionService.createSessionWithId(
      sessionId,
      sessionData
    )

    if (!sessionResult.success) {
      return sessionResult
    }

    // If we have update data and need to update base resume
    if (updateData) {
      console.log(`Updating base resume for session ${sessionId}`)
      return await resumeSessionService.updateBaseResume(sessionId, updateData)
    }

    // Return the session result (either newly created or existing)
    console.log(
      `Session ${sessionId} ${
        sessionResult.existed ? "existed" : "created"
      } successfully`
    )
    return sessionResult
  } catch (error) {
    console.error(
      `Error in handleSessionCreateOrUpdate for session ${sessionId}:`,
      error
    )
    return {
      success: false,
      error: error.message || "Session operation failed"
    }
  }
}

const methods = {
  generateJobDescription: async (req, res) => {
    try {
      const {
        company_url,
        job_title = "",
        context = "",
        years_experience = 0,
        language = "English",
        SESSION_ID = null, // Session tracking
        BATCH_ID = null, // Batch coordination
        original_id = null, // Original job ID from frontend
        original_job_id = null // Alternative field name for original job ID
      } = req.body

      // Validate required fields
      if (!company_url) {
        return res.status(400).json({
          msg: "Company URL is required",
          success: false,
          error: "Missing required field: company_url"
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Check credit availability (without abuse detection)
      // let permissionCheck
      // try {
      //   permissionCheck = await creditManager.checkCreditsOnly(
      //     userId,
      //     "JOB_DESCRIPTION_GENERATION"
      //   )

      //   if (!permissionCheck.allowed) {
      //     return res
      //       .status(
      //         permissionCheck.reason === "INSUFFICIENT_CREDITS" ? 402 : 429
      //       )
      //       .json({
      //         msg: permissionCheck.message,
      //         success: false,
      //         error: permissionCheck.reason,
      //         out_of_credits: permissionCheck.reason === "INSUFFICIENT_CREDITS",
      //         data: permissionCheck.data
      //       })
      //   }
      // } catch (creditError) {
      //   console.error(
      //     "Credit manager error in job description generation:",
      //     creditError
      //   )
      //   return res.status(500).json({
      //     msg: "Credit system temporarily unavailable",
      //     success: false,
      //     error: "Please try again later"
      //   })
      // }

      // Extract company name from URL
      const domain = company_url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0]
      const companyName = domain.charAt(0).toUpperCase() + domain.slice(1)

      // Generate AI prompts using config functions
      const systemPrompt = generateJobDescriptionSystemPrompt()
      const userPrompt = generateJobDescriptionUserPrompt({
        job_title,
        companyName,
        years_experience,
        context
      })

      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })

      const generatedDescription =
        completion.choices[0]?.message?.content?.trim()

      if (!generatedDescription) {
        throw new Error("No job description generated")
      }

      // Deduct credits after successful AI operation (with batch coordination if BATCH_ID provided)
      let creditResult
      try {
        if (BATCH_ID) {
          // Use batch-aware credit deduction for coordinated operations
          creditResult = await creditManager.deductCreditsForOperationWithBatch(
            userId,
            "JOB_DESCRIPTION_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_description_generation",
              BATCH_ID: BATCH_ID,
              SESSION_ID: SESSION_ID
            }
          )
        } else {
          // Use regular credit deduction for standalone operations
          creditResult = await creditManager.deductCreditsForOperation(
            userId,
            "JOB_DESCRIPTION_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_description_generation",
              SESSION_ID: SESSION_ID
            }
          )
        }
      } catch (creditError) {
        console.error("Credit deduction error in job description:", creditError)
        return res.status(500).json({
          msg: "Credit processing failed",
          success: false,
          error: "Please try again later"
        })
      }

      // Optional: Track this generation in a session if SESSION_ID is provided
      let sessionTracking = null
      /* 
      // DISABLED: Database session tracking to prevent duplicate entries
      // Only storeJobDetails should create database entries
      if (SESSION_ID) {
        try {
          // Check if session exists, if not create it
          let sessionExists = await resumeSessionService.getSession(
            SESSION_ID,
            false
          )
          if (!sessionExists.success) {
            // Create a minimal session for job description generation
            const sessionData = {
              userId,
              baseResumeS3Path: `temp://job-description-generation/${SESSION_ID}`,
              originalFilename: "job-description-session.txt",
              fileFormat: "TXT",
              fileSize: 0,
              extractedText: "Session created for job description generation",
              analytics: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                referrer: req.get("Referer"),
                deviceType: "unknown"
              }
            }

            // Override the session ID to match the provided one
            const createResult = await resumeSessionService.createSessionWithId(
              SESSION_ID,
              sessionData
            )

            if (!createResult.success) {
              console.error(
                `Failed to create session ${SESSION_ID} in generateJobDescription:`,
                createResult.error
              )
              // Continue without session tracking rather than failing the main operation
            }
          }

          // Check if an entry with the same original_id already exists
          let sessionResult
          const originalJobId = original_id || original_job_id
          
          if (originalJobId) {
            // Get the session with generations to check for existing entry
            const sessionWithGenerations = await resumeSessionService.getSession(SESSION_ID, true)
            
            if (sessionWithGenerations.success) {
              const existingGeneration = sessionWithGenerations.session.generated_resumes?.find(
                (gen) => 
                  gen.job_details?.original_job_id === originalJobId ||
                  gen.job_details?.original_id === originalJobId ||
                  gen.metadata?.originalJobId === originalJobId ||
                  gen.metadata?.original_job_id === originalJobId ||
                  gen.metadata?.original_id === originalJobId
              )

              if (existingGeneration) {
                // Entry already exists - skip creating new one for job description
                console.log(`Found existing generation ${existingGeneration.generation_id} for original_id ${originalJobId}, skipping job description creation`)
                
                sessionTracking = {
                  sessionId: SESSION_ID,
                  generationId: existingGeneration.generation_id,
                  skipped: true,
                  reason: "Job description entry already exists for this original_id",
                  totalGenerations: sessionWithGenerations.session?.session_metadata?.total_generations || 0
                }
              } else {
                // No existing entry found, create new one
                sessionResult = await resumeSessionService.addGeneratedResume(
                  SESSION_ID,
                  {
                    jobTitle: job_title || "Software Engineer",
                    jobDescription: generatedDescription,
                    companyName: companyName,
                    companyUrl: company_url,
                    jobSkills: [],
                    yearsExperience: years_experience,
                    additionalContext: context,
                    resumeData: null, // No resume data generated, only job description
                    format: "JSON",
                    metadata: {
                      modelUsed: "gpt-4o-mini",
                      tokensUsed: completion.usage?.total_tokens || 0,
                      creditsUsed: creditResult?.creditsDeducted || 0,
                      status: "completed",
                      generationType: "JOB_DESCRIPTION",
                      originalJobId: originalJobId,
                      original_job_id: originalJobId,
                      original_id: originalJobId
                    }
                  }
                )

                if (sessionResult.success) {
                  sessionTracking = {
                    sessionId: SESSION_ID,
                    generationId: sessionResult.generationId,
                    created: true,
                    totalGenerations: sessionResult.session?.session_metadata?.total_generations || 0,
                    usedFreeGeneration: sessionResult.used_free_generation,
                    freeGenerationStats: sessionResult.free_generation_stats
                  }
                }
              }
            }
          } else {
            // No original_id provided, create new entry anyway
            sessionResult = await resumeSessionService.addGeneratedResume(
              SESSION_ID,
              {
                jobTitle: job_title || "Software Engineer",
                jobDescription: generatedDescription,
                companyName: companyName,
                companyUrl: company_url,
                jobSkills: [],
                yearsExperience: years_experience,
                additionalContext: context,
                resumeData: null, // No resume data generated, only job description
                format: "JSON",
                metadata: {
                  modelUsed: "gpt-4o-mini",
                  tokensUsed: completion.usage?.total_tokens || 0,
                  creditsUsed: creditResult?.creditsDeducted || 0,
                  status: "completed",
                  generationType: "JOB_DESCRIPTION"
                }
              }
            )

            if (sessionResult.success) {
              sessionTracking = {
                sessionId: SESSION_ID,
                generationId: sessionResult.generationId,
                created: true,
                totalGenerations: sessionResult.session?.session_metadata?.total_generations || 0,
                usedFreeGeneration: sessionResult.used_free_generation,
                freeGenerationStats: sessionResult.free_generation_stats
              }
            }
          }

          if (sessionResult && !sessionResult.success) {
            console.error(
              `Failed to add job description generation to session ${SESSION_ID}:`,
              sessionResult.error
            )
          }
        } catch (sessionError) {
          console.warn(
            `Failed to track job description generation in session ${SESSION_ID}:`,
            sessionError.message
          )
          // Don't fail the main operation if session tracking fails
        }
      }
      */

      const data = {
        job_description: generatedDescription,
        company: companyName,
        job_title: job_title || "Software Engineer",
        metadata: {
          company_url,
          years_experience,
          language,
          context,
          generated_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
          credits_used: creditResult?.creditsDeducted || 0,
          remaining_credits: creditResult?.remainingCredits || 0,
          operation_count: creditResult?.operationCount || 0,
          // Include batch information if available
          batch_info: creditResult?.batchInfo || null,
          // Include session tracking information if available
          session_tracking: sessionTracking
        }
      }

      return res.status(200).json({
        msg: "Job description generated successfully",
        success: true,
        data
      })
    } catch (error) {
      if (error.status === 429) {
        let waitMs = 1000 // Base delay of 1 second

        if (error.headers && error.headers["retry-after"]) {
          waitMs = parseFloat(error.headers["retry-after"]) * 1000
        } else if (error.headers && error.headers["retry-after-ms"]) {
          waitMs = parseFloat(error.headers["retry-after-ms"])
        }

        return res.status(429).json({
          msg: `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds and try again.`,
          success: false,
          data: {
            wait_ms: waitMs + 1000
          }
        })
      }

      return res.status(500).json({
        msg: "An error occurred while generating the job description.",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  generateJobSkills: async (req, res) => {
    try {
      const {
        company_url,
        job_title = "",
        job_description = "",
        years_experience = 0,
        language = "English",
        SESSION_ID = null, // Session tracking
        BATCH_ID = null, // Batch coordination
        original_id = null, // Original job ID from frontend
        original_job_id = null // Alternative field name for original job ID
      } = req.body

      // Validate required fields
      if (!company_url) {
        return res.status(400).json({
          msg: "Company URL is required",
          success: false,
          error: "Missing required field: company_url"
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Check credit availability (without abuse detection)
      // let permissionCheck
      // try {
      //   permissionCheck = await creditManager.checkCreditsOnly(
      //     userId,
      //     "JOB_SKILLS_GENERATION"
      //   )

      //   if (!permissionCheck.allowed) {
      //     return res
      //       .status(
      //         permissionCheck.reason === "INSUFFICIENT_CREDITS" ? 402 : 429
      //       )
      //       .json({
      //         msg: permissionCheck.message,
      //         success: false,
      //         error: permissionCheck.reason,
      //         out_of_credits: permissionCheck.reason === "INSUFFICIENT_CREDITS",
      //         data: permissionCheck.data
      //       })
      //   }
      // } catch (creditError) {
      //   console.error(
      //     "Credit manager error in job skills generation:",
      //     creditError
      //   )
      //   return res.status(500).json({
      //     msg: "Credit system temporarily unavailable",
      //     success: false,
      //     error: "Please try again later"
      //   })
      // }

      // Extract company name from URL
      const domain = company_url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0]
      const companyName = domain.charAt(0).toUpperCase() + domain.slice(1)

      // Generate AI prompts using config functions
      const systemPrompt = generateJobSkillsSystemPrompt()
      const userPrompt = generateJobSkillsUserPrompt({
        job_title,
        companyName,
        years_experience,
        job_description
      })

      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.6
      })

      const generatedSkills = completion.choices[0]?.message?.content?.trim()

      if (!generatedSkills) {
        throw new Error("No job skills generated")
      }

      // Parse the comma-separated skills into an array
      const skillsArray = generatedSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      // Deduct credits after successful AI operation (with batch coordination if BATCH_ID provided)
      let creditResult
      try {
        if (BATCH_ID) {
          // Use batch-aware credit deduction for coordinated operations
          creditResult = await creditManager.deductCreditsForOperationWithBatch(
            userId,
            "JOB_SKILLS_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_skills_generation",
              BATCH_ID: BATCH_ID,
              SESSION_ID: SESSION_ID
            }
          )
        } else {
          // Use regular credit deduction for standalone operations
          creditResult = await creditManager.deductCreditsForOperation(
            userId,
            "JOB_SKILLS_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_skills_generation",
              SESSION_ID: SESSION_ID
            }
          )
        }
      } catch (creditError) {
        console.error("Credit deduction error in job skills:", creditError)
        return res.status(500).json({
          msg: "Credit processing failed",
          success: false,
          error: "Please try again later"
        })
      }

      // Optional: Track this generation in a session if SESSION_ID is provided
      let sessionTracking = null
      /* 
      // DISABLED: Database session tracking to prevent duplicate entries
      // Only storeJobDetails should create database entries
      if (SESSION_ID) {
        try {
          // Check if session exists, if not create it
          let sessionExists = await resumeSessionService.getSession(
            SESSION_ID,
            false
          )
          if (!sessionExists.success) {
            // Create a minimal session for job skills generation
            const sessionData = {
              userId,
              baseResumeS3Path: `temp://job-skills-generation/${SESSION_ID}`,
              originalFilename: "job-skills-session.txt",
              fileFormat: "TXT",
              fileSize: 0,
              extractedText: "Session created for job skills generation",
              analytics: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                referrer: req.get("Referer"),
                deviceType: "unknown"
              }
            }

            const createResult = await resumeSessionService.createSessionWithId(
              SESSION_ID,
              sessionData
            )

            if (!createResult.success) {
              console.error(
                `Failed to create session ${SESSION_ID} in generateJobSkills:`,
                createResult.error
              )
              // Continue without session tracking rather than failing the main operation
            }
          }

          // Add this job skills generation to the session
          const sessionResult = await resumeSessionService.addGeneratedResume(
            SESSION_ID,
            {
              jobTitle: job_title || "Software Engineer",
              jobDescription: job_description,
              companyName: companyName,
              companyUrl: company_url,
              jobSkills: skillsArray,
              yearsExperience: years_experience,
              additionalContext: `Skills generated for ${companyName}`,
              resumeData: {
                job_skills: skillsArray,
                skills_string: skillsArray.join(", ")
              },
              format: "JSON",
              metadata: {
                modelUsed: "gpt-4o-mini",
                tokensUsed: completion.usage?.total_tokens || 0,
                creditsUsed: creditResult?.creditsDeducted || 0,
                status: "completed",
                generationType: "JOB_SKILLS",
                originalJobId: original_id || original_job_id,
                original_job_id: original_id || original_job_id,
                original_id: original_id || original_job_id
              }
            }
          )

          if (sessionResult.success) {
            sessionTracking = {
              sessionId: SESSION_ID,
              generationId: sessionResult.generationId,
              totalGenerations:
                sessionResult.session?.session_metadata?.total_generations || 0,
              usedFreeGeneration: sessionResult.used_free_generation,
              freeGenerationStats: sessionResult.free_generation_stats
            }
          } else {
            console.error(
              `Failed to add job skills generation to session ${SESSION_ID}:`,
              sessionResult.error
            )
          }
        } catch (sessionError) {
          console.warn(
            `Failed to track job skills generation in session ${SESSION_ID}:`,
            sessionError.message
          )
          // Don't fail the main operation if session tracking fails
        }
      }
      */

      const data = {
        skills: skillsArray.join(", "),
        skills_string: skillsArray.join(", "), // Add this field for compatibility
        skills_array: skillsArray,
        company: companyName,
        job_title: job_title || "Software Engineer",
        metadata: {
          company_url,
          years_experience,
          language,
          job_description: job_description
            ? job_description.substring(0, 100) + "..."
            : "",
          generated_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
          credits_used: creditResult?.creditsDeducted || 0,
          remaining_credits: creditResult?.remainingCredits || 0,
          operation_count: creditResult?.operationCount || 0,
          // Include batch information if available
          batch_info: creditResult?.batchInfo || null,
          // Include session tracking information if available
          session_tracking: sessionTracking
        }
      }

      return res.status(200).json({
        msg: "Job skills generated successfully",
        success: true,
        data
      })
    } catch (error) {
      if (error.status === 429) {
        let waitMs = 1000 // Base delay of 1 second

        if (error.headers && error.headers["retry-after"]) {
          waitMs = parseFloat(error.headers["retry-after"]) * 1000
        } else if (error.headers && error.headers["retry-after-ms"]) {
          waitMs = parseFloat(error.headers["retry-after-ms"])
        }

        return res.status(429).json({
          msg: `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds and try again.`,
          success: false,
          data: {
            wait_ms: waitMs + 1000
          }
        })
      }

      return res.status(500).json({
        msg: "An error occurred while generating job skills.",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  generateJobTitle: async (req, res) => {
    try {
      const {
        company_url,
        job_title = "",
        context = "",
        target_role = "",
        years_experience = 0,
        language = "English",
        SESSION_ID = null, // Session tracking
        BATCH_ID = null, // Batch coordination
        original_id = null, // Original job ID from frontend
        original_job_id = null // Alternative field name for original job ID
      } = req.body

      // Validate required fields
      if (!company_url) {
        return res.status(400).json({
          msg: "Company URL is required",
          success: false,
          error: "Missing required field: company_url"
        })
      }

            // Extract company name from URL for context
      const domain = company_url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0]
      const companyName = domain.charAt(0).toUpperCase() + domain.slice(1)


      // return the response right here
      if (job_title) {
        // Remove company name from job_title if present (case insensitive)
        let cleanedJobTitle = job_title
        if (companyName && job_title.toLowerCase().includes(companyName.toLowerCase())) {
          // Create regex to match company name with optional separators
          const companyRegex = new RegExp(`\\b${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
          cleanedJobTitle = job_title
            .replace(companyRegex, '')
            .replace(/^\s*[-–—|,]\s*/, '') // Remove leading separators
            .replace(/\s*[-–—|,]\s*$/, '') // Remove trailing separators
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
        }

        return res.status(200).json({
          msg: "Job title generated successfully",
          success: true,
          data: {
            job_title: cleanedJobTitle,
            company: companyName,
            metadata: {
              company_url: company_url,
              target_role: target_role,
              years_experience: years_experience,
              language: language,
              context:
                "",
              generated_at: new Date().toISOString(),
              tokens_used: 0,
              credits_used: 0,
              remaining_credits: Infinity,
              operation_count: 16,
              batch_info: {
                batchId: BATCH_ID,
                sessionId: SESSION_ID,
                isBatchOperation: true,
                batchActive: true,
                operationsInBatch: 1,
                totalBatchCredits: 0,
                batchComplete: false
              },
              session_tracking: null
            }
          }
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Check credit availability (without abuse detection)
      // let permissionCheck
      // try {
      //   permissionCheck = await creditManager.checkCreditsOnly(
      //     userId,
      //     "JOB_TITLE_GENERATION"
      //   )

      //   if (!permissionCheck.allowed) {
      //     return res
      //       .status(
      //         permissionCheck.reason === "INSUFFICIENT_CREDITS" ? 402 : 429
      //       )
      //       .json({
      //         msg: permissionCheck.message,
      //         success: false,
      //         error: permissionCheck.reason,
      //         out_of_credits: permissionCheck.reason === "INSUFFICIENT_CREDITS",
      //         data: permissionCheck.data
      //       })
      //   }
      // } catch (creditError) {
      //   console.error(
      //     "Credit manager error in job title generation:",
      //     creditError
      //   )
      //   return res.status(500).json({
      //     msg: "Credit system temporarily unavailable",
      //     success: false,
      //     error: "Please try again later"
      //   })
      // }


      // Generate AI prompts using config functions
      const systemPrompt = generateJobTitleSystemPrompt()
      const userPrompt = generateJobTitleUserPrompt({
        companyName,
        target_role,
        years_experience,
        context
      })

      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7
      })

      const generatedTitle = completion.choices[0]?.message?.content?.trim()

      if (!generatedTitle) {
        throw new Error("No job title generated")
      }

      // Deduct credits after successful AI operation (with batch coordination if BATCH_ID provided)
      let creditResult
      try {
        if (BATCH_ID) {
          // Use batch-aware credit deduction for coordinated operations
          creditResult = await creditManager.deductCreditsForOperationWithBatch(
            userId,
            "JOB_TITLE_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_title_generation",
              BATCH_ID: BATCH_ID,
              SESSION_ID: SESSION_ID
            }
          )
        } else {
          // Use regular credit deduction for standalone operations
          creditResult = await creditManager.deductCreditsForOperation(
            userId,
            "JOB_TITLE_GENERATION",
            completion.usage?.total_tokens || 0,
            {
              operationId: "job_title_generation",
              SESSION_ID: SESSION_ID
            }
          )
        }
      } catch (creditError) {
        console.error("Credit deduction error in job title:", creditError)
        return res.status(500).json({
          msg: "Credit processing failed",
          success: false,
          error: "Please try again later"
        })
      }

      // Optional: Track this generation in a session if SESSION_ID is provided
      let sessionTracking = null
      /* 
      // DISABLED: Database session tracking to prevent duplicate entries
      // Only storeJobDetails should create database entries
      if (SESSION_ID) {
        try {
          // Check if session exists, if not create it
          let sessionExists = await resumeSessionService.getSession(
            SESSION_ID,
            false
          )
          if (!sessionExists.success) {
            // Create a minimal session for job title generation
            const sessionData = {
              userId,
              baseResumeS3Path: `temp://job-title-generation/${SESSION_ID}`,
              originalFilename: "job-title-session.txt",
              fileFormat: "TXT",
              fileSize: 0,
              extractedText: "Session created for job title generation",
              analytics: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                referrer: req.get("Referer"),
                deviceType: "unknown"
              }
            }

            const createResult = await resumeSessionService.createSessionWithId(
              SESSION_ID,
              sessionData
            )

            if (!createResult.success) {
              console.error(
                `Failed to create session ${SESSION_ID} in generateJobTitle:`,
                createResult.error
              )
              // Continue without session tracking rather than failing the main operation
            }
          }

          // Add this job title generation to the session
          const sessionResult = await resumeSessionService.addGeneratedResume(
            SESSION_ID,
            {
              jobTitle: generatedTitle,
              jobDescription: `Generated title: ${generatedTitle} for ${companyName}`,
              companyName: companyName,
              companyUrl: company_url,
              jobSkills: [],
              yearsExperience: years_experience,
              additionalContext: context,
              resumeData: { job_title: generatedTitle, target_role, context },
              format: "JSON",
              metadata: {
                modelUsed: "gpt-4o-mini",
                tokensUsed: completion.usage?.total_tokens || 0,
                creditsUsed: creditResult?.creditsDeducted || 0,
                status: "completed",
                generationType: "JOB_TITLE",
                originalJobId: original_id || original_job_id,
                original_job_id: original_id || original_job_id,
                original_id: original_id || original_job_id
              }
            }
          )

          if (sessionResult.success) {
            sessionTracking = {
              sessionId: SESSION_ID,
              generationId: sessionResult.generationId,
              totalGenerations:
                sessionResult.session?.session_metadata?.total_generations || 0,
              usedFreeGeneration: sessionResult.used_free_generation,
              freeGenerationStats: sessionResult.free_generation_stats
            }
          } else {
            console.error(
              `Failed to add job title generation to session ${SESSION_ID}:`,
              sessionResult.error
            )
          }
        } catch (sessionError) {
          console.warn(
            `Failed to track job title generation in session ${SESSION_ID}:`,
            sessionError.message
          )
          // Don't fail the main operation if session tracking fails
        }
      }
      */

      const data = {
        job_title: generatedTitle,
        company: companyName,
        metadata: {
          company_url,
          target_role,
          years_experience,
          language,
          context,
          generated_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
          credits_used: creditResult?.creditsDeducted || 0,
          remaining_credits: creditResult?.remainingCredits || 0,
          operation_count: creditResult?.operationCount || 0,
          // Include batch information if available
          batch_info: creditResult?.batchInfo || null,
          // Include session tracking information if available
          session_tracking: sessionTracking
        }
      }

      return res.status(200).json({
        msg: "Job title generated successfully",
        success: true,
        data
      })
    } catch (error) {
      if (error.status === 429) {
        let waitMs = 1000 // Base delay of 1 second

        if (error.headers && error.headers["retry-after"]) {
          waitMs = parseFloat(error.headers["retry-after"]) * 1000
        } else if (error.headers && error.headers["retry-after-ms"]) {
          waitMs = parseFloat(error.headers["retry-after-ms"])
        }

        return res.status(429).json({
          msg: `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds and try again.`,
          success: false,
          data: {
            wait_ms: waitMs + 1000
          }
        })
      }

      return res.status(500).json({
        msg: "An error occurred while generating job title.",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  generateTailoredResume: async (req, res) => {
    try {
      const {
        job_title,
        job_description,
        original_resume,
        resumeText,
        additional_context,
        SESSION_ID, // Required - session to update

        company_name = "",
        company_url = "",
        job_skills = [],
        years_experience = 0,
        is_regenerating: _is_regenerating = false
      } = req.body

      let { generation_id } = req.body

      // Check for regeneration parameter
      const is_regenerating = (req.query.is_regenerating === 'true' || _is_regenerating)

      // Handle legacy format - support both old and new parameter names
      const resume = original_resume || resumeText
      const jobDescription = job_description

      // Validate required fields
      if (!resume) {
        return res.status(400).json({
          msg: "Resume and job description are required",
          success: false,
          error: "Missing required fields"
        })
      }

      if (!SESSION_ID) {
        return res.status(400).json({
          msg: "SESSION_ID is required",
          success: false,
          error: "Missing required field: SESSION_ID"
        })
      }

      if (!generation_id) {
        return res.status(400).json({
          msg: "generation_id is required",
          success: false,
          error: "Missing required field: generation_id"
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Validate session exists
      const sessionCheck = await resumeSessionService.getSession(
        SESSION_ID,
        false
      )
      if (!sessionCheck.success) {
        return res.status(422).json({
          msg: "Session not found",
          success: false,
          error: "The specified SESSION_ID does not exist"
        })
      }

      // Validate generation exists within the session - now with flexible ID checking
      const generationCheck = await resumeSessionService.getGeneratedResume(
        generation_id
      )
      
      let targetGenerationRecord = null
      
      if (!generationCheck.success) {
        // If not found by generation_id, check the session for alternative IDs
        const sessionData = await resumeSessionService.getSession(
          SESSION_ID,
          true
        )
        if (sessionData.success) {
          // Look for a matching generation using any of the ID fields
          const matchingGeneration =
            sessionData.session.generated_resumes?.find(
              (gen) =>
                gen.generation_id === generation_id ||
                gen.job_details?.original_job_id === generation_id ||
                gen.job_details?.original_id === generation_id ||
                gen.metadata?.originalJobId === generation_id ||
                gen.metadata?.original_job_id === generation_id ||
                gen.metadata?.original_id === generation_id
            )

          if (matchingGeneration) {
            // Use the found generation's actual generation_id
            generation_id = matchingGeneration.generation_id
            targetGenerationRecord = matchingGeneration
            console.log(
              `Found matching generation using alternative ID. Using generation_id: ${generation_id}`
            )
          } else {
            return res.status(404).json({
              msg: "Generation not found",
              success: false,
              error:
                "The specified ID does not match any generation in this session"
            })
          }
        } else {
          return res.status(404).json({
            msg: "Generation not found",
            success: false,
            error: "The specified generation_id does not exist"
          })
        }
      } else {
        // Get the generation record for regeneration logic
        const sessionData = await resumeSessionService.getSession(
          SESSION_ID,
          true
        )
        if (sessionData.success) {
          targetGenerationRecord = sessionData.session.generated_resumes?.find(
            (gen) => gen.generation_id === generation_id
          )
        }
      }

      // Handle regeneration logic
      let shouldChargeCredits = true
      let shouldUpdateFreeRegenerationFlag = false
      
      if (is_regenerating && targetGenerationRecord) {
        const hasUsedFreeRegeneration = targetGenerationRecord.generation_metadata?.has_used_free_regeneration || false
        
        console.log(`Regeneration logic for ${generation_id}:`, {
          is_regenerating,
          hasUsedFreeRegeneration,
          currentUsedFreeGeneration: targetGenerationRecord?.generation_metadata?.used_free_generation,
          currentCreditsUsed: targetGenerationRecord?.generation_metadata?.credits_used
        })
        
        if (!hasUsedFreeRegeneration) {
          // User hasn't used free regeneration for this generation - don't charge credits
          shouldChargeCredits = false
          shouldUpdateFreeRegenerationFlag = true
          console.log(`Free regeneration available for generation ${generation_id}`)
        } else {
          // User has already used free regeneration - charge for this regeneration
          shouldChargeCredits = true
          console.log(`Free regeneration already used for generation ${generation_id}, charging credits`)
        }
      }

      // Check credit availability only if we need to charge credits
      let permissionCheck
      if (shouldChargeCredits) {
        try {
          permissionCheck = await creditManager.checkCreditsOnly(
            userId,
            "TAILORED_RESUME"
          )

          if (!permissionCheck.allowed) {
            return res
              .status(
                permissionCheck.reason === "INSUFFICIENT_CREDITS" ? 402 : 429
              )
              .json({
                msg: permissionCheck.message,
                success: false,
                error: permissionCheck.reason,
                out_of_credits: permissionCheck.reason === "INSUFFICIENT_CREDITS",
                data: permissionCheck.data
              })
          }
        } catch (creditError) {
          console.error(
            "Credit manager error in tailored resume generation:",
            creditError
          )
          return res.status(500).json({
            msg: "Credit system temporarily unavailable",
            success: false,
            error: "Please try again later"
          })
        }
      }

      const systemPrompt = generateSystemPrompt({
        job_title,
        job_description: jobDescription,
        resumeContent: resume,
        additional_context,
        company_name,
        company_url,
        job_skills,
        years_experience,
      })

      const userPrompt = generateUserPrompt()

      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        functions: [TAILORED_RESUME_SCHEMA],
        function_call: { name: "generate_tailored_resume" },
        temperature: 0.2,
        max_tokens: 16384
      })

      // Extract the function call response
      const functionCall = completion.choices[0].message.function_call

      if (!functionCall || !functionCall.arguments) {
        // Log failed operation but don't charge credits
        await creditManager.logFailedOperation(
          userId,
          "TAILORED_RESUME",
          "EMPTY_RESPONSE",
          { tokensUsed: completion.usage?.total_tokens || 0 }
        )
        throw new Error(
          "Function call response is missing or invalid. Please check the request parameters."
        )
      }

      const tailoredResume = JSON.parse(functionCall.arguments)

      // Always set has_professional_summary to true since we always generate it
      if (tailoredResume.source_content_analysis) {
        tailoredResume.source_content_analysis.has_professional_summary = true
      }

      if (tailoredResume.tailoring_score >= 98) {
        tailoredResume.tailoring_score = 98
      }

      // Deduct credits after successful AI operation (only if charging)
      let creditResult = null
      if (shouldChargeCredits) {
        console.log(`🔴 CHARGING CREDITS for generation ${generation_id} - not a free regeneration`)
        try {
          creditResult = await creditManager.deductCreditsForTailoring(
            userId,
            completion.usage?.total_tokens || 0
          )
          console.log(`💰 Credits charged successfully:`, {
            generationId: generation_id,
            creditsDeducted: creditResult?.creditsDeducted || 0,
            remainingCredits: creditResult?.remainingCredits || 0
          })
        } catch (creditError) {
          console.error("Credit deduction error in tailored resume:", creditError)
          return res.status(500).json({
            msg: "Credit processing failed",
            success: false,
            error: "Please try again later"
          })
        }
      } else {
        console.log(`🟢 FREE REGENERATION for generation ${generation_id} - NO CREDITS CHARGED`)
        // No credits charged for free regeneration - get current credit status
        try {
          const currentCreditStatus = await creditManager.getUserCreditStatus(userId)
          creditResult = {
            creditsDeducted: 0,
            remainingCredits: currentCreditStatus.totalCreditsAvailable || 0,
            wasCharged: false,
            freeRegeneration: true
          }
          console.log(`✅ Free regeneration result - NO CREDITS DEDUCTED:`, {
            generationId: generation_id,
            creditsDeducted: 0,
            remainingCredits: creditResult.remainingCredits,
            freeRegeneration: true,
            wasCharged: false
          })
        } catch (error) {
          console.warn(`Failed to get credit status for free regeneration:`, error.message)
          // Fallback if credit status check fails
          creditResult = {
            creditsDeducted: 0,
            remainingCredits: 0,
            wasCharged: false,
            freeRegeneration: true
          }
        }
      }

      // Update the existing generation record with OpenAI response
      let updateResult
      try {
        const startTime = Date.now()

        console.log("Updating generation with tailored resume data:", {
          sessionId: SESSION_ID,
          generationId: generation_id,
          resumeDataSize: JSON.stringify(tailoredResume).length,
          hasResumeData: !!tailoredResume,
          shouldChargeCredits,
          shouldUpdateFreeRegenerationFlag,
          is_regenerating
        })

        const updateMetadata = {
          format: "JSON",
          tokens_used: completion.usage?.total_tokens || 0,
          credits_used: shouldChargeCredits ? (creditResult?.creditsDeducted || 0) : 0, // Ensure 0 for free regenerations
          model_used: "gpt-4o",
          generation_time_ms: Date.now() - startTime,
          has_used_free_regeneration: shouldUpdateFreeRegenerationFlag ? true : 
            (targetGenerationRecord?.generation_metadata?.has_used_free_regeneration || false),
          // used_free_generation should be true if:
          // 1. This was a free regeneration (!shouldChargeCredits && is_regenerating)
          // 2. OR it was already true from before
          used_free_generation: (!shouldChargeCredits && is_regenerating) || 
            (targetGenerationRecord?.generation_metadata?.used_free_generation || false),
          // Ensure timestamps are properly set
          updated_at: new Date(),
          // If this is a new generation (not a regeneration), set created_at
          ...(targetGenerationRecord?.created_at ? {} : { created_at: new Date() })
        }

        console.log("Update metadata being passed:", updateMetadata)
        console.log("Credit charging summary:", {
          generationId: generation_id,
          shouldChargeCredits,
          actualCreditsUsed: updateMetadata.credits_used,
          isFreeRegeneration: !shouldChargeCredits && is_regenerating,
          wasCharged: shouldChargeCredits,
          // Additional validation
          creditValidation: {
            expectedCreditsUsed: shouldChargeCredits ? (creditResult?.creditsDeducted || 0) : 0,
            actualCreditsUsed: updateMetadata.credits_used,
            isValid: updateMetadata.credits_used === (shouldChargeCredits ? (creditResult?.creditsDeducted || 0) : 0)
          }
        })

        // Additional safety check - ensure we never accidentally charge for free regenerations
        if (!shouldChargeCredits && is_regenerating && updateMetadata.credits_used > 0) {
          console.error(`🚨 CRITICAL ERROR: Credits charged during free regeneration!`, {
            generationId: generation_id,
            shouldChargeCredits,
            creditsUsed: updateMetadata.credits_used,
            isFreeRegeneration: true
          })
          // Force credits_used to 0 for free regenerations
          updateMetadata.credits_used = 0
        }

        updateResult = await resumeSessionService.updateGeneratedResumeData(
          SESSION_ID,
          generation_id,
          tailoredResume,
          updateMetadata
        )

        console.log("Update result:", updateResult)

        if (!updateResult.success) {
          throw new Error(
            updateResult.error || "Failed to update generation record"
          )
        }

        // Verify that the data was actually saved by querying the session again
        const verificationResult = await resumeSessionService.getSession(
          SESSION_ID,
          true
        )
        if (verificationResult.success) {
          const verificationGeneration =
            verificationResult.session.generated_resumes.find(
              (r) => r.generation_id === generation_id
            )
          if (verificationGeneration?.generated_resume?.resume_data) {
            console.log("Verification successful - resume data was persisted")
          } else {
            console.warn(
              "Verification failed - resume data was not persisted properly"
            )
          }
        }
      } catch (updateError) {
        console.error(
          `Failed to update generation ${generation_id} in session ${SESSION_ID}:`,
          updateError.message
        )
        return res.status(500).json({
          msg: "Failed to update generation record",
          success: false,
          error: updateError.message
        })
      }

      // Get generation history for response
      let generationHistory = null
      try {
        const sessionWithHistory = await resumeSessionService.getSession(
          SESSION_ID,
          true
        )
        if (sessionWithHistory.success) {
          const sessionInstance = sessionWithHistory.session
          generationHistory = sessionInstance.getGenerationHistory(generation_id)
        }
      } catch (historyError) {
        console.warn(`Failed to retrieve generation history: ${historyError.message}`)
        // Don't fail the main operation if history retrieval fails
      }

      const data = {
        tailored_resume: tailoredResume,
        tailored_data: tailoredResume, // Support both legacy and new response format
        metadata: {
          job_title,
          generated_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
          credits_used: shouldChargeCredits ? (creditResult?.creditsDeducted || 0) : 0, // Ensure 0 for free regenerations
          remaining_credits: creditResult?.remainingCredits || 0,
          // Include generation tracking information
          session_id: SESSION_ID,
          generation_id: generation_id,
          updated_at: updateResult.updated_at,
          // Include created_at and updated_at timestamps
          created_at: targetGenerationRecord?.created_at?.toISOString() || new Date().toISOString(),
          // Regeneration information
          is_regenerating: is_regenerating,
          was_free_regeneration: !shouldChargeCredits && is_regenerating,
          has_used_free_regeneration: shouldUpdateFreeRegenerationFlag ? true : 
            (targetGenerationRecord?.generation_metadata?.has_used_free_regeneration || false),
          used_free_generation: (!shouldChargeCredits && is_regenerating) || 
            (targetGenerationRecord?.generation_metadata?.used_free_generation || false),
          // Generation history information
          generation_history: generationHistory ? {
            current_version_number: generationHistory.current_version.version_number,
            total_versions: generationHistory.total_versions,
            regeneration_count: generationHistory.regeneration_count,
            has_previous_versions: generationHistory.regeneration_count > 0
          } : null
        }
      }

      return res.status(200).json({
        msg: is_regenerating ? 
          (shouldChargeCredits ? "Resume regenerated successfully (charged)" : "Resume regenerated successfully (free regeneration used)") :
          "Tailored resume generated successfully",
        success: true,
        data
      })
    } catch (error) {
      // Log failed operation for analytics (no credits charged)
      await creditManager.logFailedOperation(
        req.token._id,
        "TAILORED_RESUME",
        error.status === 429 ? "RATE_LIMIT" : "API_ERROR",
        {
          errorMessage: error.message,
          statusCode: error.status,
          headers: error.headers
        }
      )

      if (error.status === 429) {
        let waitMs = 1000

        if (error.headers && error.headers["retry-after"]) {
          waitMs = parseFloat(error.headers["retry-after"]) * 1000
        } else if (error.headers && error.headers["retry-after-ms"]) {
          waitMs = parseFloat(error.headers["retry-after-ms"])
        }

        return res.status(429).json({
          msg: `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds and try again.`,
          success: false,
          data: {
            wait_ms: waitMs + 1000
          }
        })
      }

      return res.status(500).json({
        msg: "An error occurred while generating the tailored resume.",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  getGenerationHistory: async (req, res) => {
    try {
      const { SESSION_ID, generation_id } = req.params

      // Validate required parameters
      if (!SESSION_ID) {
        return res.status(400).json({
          msg: "SESSION_ID is required",
          success: false,
          error: "Missing required parameter: SESSION_ID"
        })
      }

      if (!generation_id) {
        return res.status(400).json({
          msg: "generation_id is required", 
          success: false,
          error: "Missing required parameter: generation_id"
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Validate session exists and user has access
      const sessionResult = await resumeSessionService.getSession(
        SESSION_ID,
        true
      )
      
      if (!sessionResult.success) {
        return res.status(404).json({
          msg: "Session not found",
          success: false,
          error: "The specified SESSION_ID does not exist"
        })
      }

      // Verify user owns this session
      if (sessionResult.session.user_id.toString() !== userId.toString()) {
        return res.status(403).json({
          msg: "Access denied",
          success: false,
          error: "You don't have permission to access this session"
        })
      }

      // Get generation history
      let generationHistory
      try {
        generationHistory = sessionResult.session.getGenerationHistory(generation_id)
      } catch (error) {
        return res.status(404).json({
          msg: "Generation not found",
          success: false,
          error: error.message
        })
      }

      // Format the response
      const data = {
        session_id: SESSION_ID,
        generation_id: generation_id,
        current_version: {
          version_number: generationHistory.current_version.version_number,
          resume_data: generationHistory.current_version.resume_data,
          generated_at: generationHistory.current_version.generated_at,
          metadata: {
            model_used: generationHistory.current_version.metadata.model_used,
            tokens_used: generationHistory.current_version.metadata.tokens_used,
            credits_used: generationHistory.current_version.metadata.credits_used,
            generation_time_ms: generationHistory.current_version.metadata.generation_time_ms,
            format: generationHistory.current_version.format
          }
        },
        previous_versions: generationHistory.previous_versions.map((version, index) => ({
          version_number: version.version_number,
          generated_at: version.generated_at,
          metadata: {
            model_used: version.generation_metadata.model_used,
            tokens_used: version.generation_metadata.tokens_used,
            credits_used: version.generation_metadata.credits_used,
            generation_time_ms: version.generation_metadata.generation_time_ms,
            format: version.generation_metadata.format
          },
          // Only include resume_data if specifically requested
          ...(req.query.include_data === 'true' && { resume_data: version.resume_data })
        })),
        summary: {
          total_versions: generationHistory.total_versions,
          regeneration_count: generationHistory.regeneration_count,
          has_previous_versions: generationHistory.regeneration_count > 0,
          first_generated_at: generationHistory.previous_versions[0]?.generated_at || generationHistory.current_version.generated_at,
          last_regenerated_at: generationHistory.current_version.generated_at
        }
      }

      return res.status(200).json({
        msg: "Generation history retrieved successfully",
        success: true,
        data
      })
    } catch (error) {
      console.error("Error retrieving generation history:", error)
      return res.status(500).json({
        msg: "An error occurred while retrieving generation history",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  getUserCreditStatus: async (req, res) => {
    try {
      const userId = req.token._id

      // Get credit status
      const creditStatus = await creditManager.getUserCreditStatus(userId)

      // Get session information
      let sessionInfo = {
        active_sessions: [],
        session_stats: {},
        recent_generations: []
      }

      try {
        // Get active sessions (last 5)
        const activeSessionsResult =
          await resumeSessionService.getUserActiveSessions(userId, 5)
        if (activeSessionsResult.success) {
          sessionInfo.active_sessions = activeSessionsResult.sessions.map(
            (session) => ({
              session_id: session.session_id,
              status: session.session_metadata.status,
              total_generations: session.session_metadata.total_generations,
              total_credits_used: session.session_metadata.total_credits_used,
              created_at: session.createdAt,
              expires_at: session.session_metadata.expires_at,
              base_resume: {
                original_filename: session.base_resume?.original_filename,
                file_format: session.base_resume?.file_format,
                uploaded_at: session.base_resume?.uploaded_at
              },
              free_generation_stats: session.session_metadata
                .free_generations_used
                ? {
                    job_title_used:
                      session.session_metadata.free_generations_used
                        .job_title_generated,
                    job_description_used:
                      session.session_metadata.free_generations_used
                        .job_description_generated,
                    job_skills_used:
                      session.session_metadata.free_generations_used
                        .job_skills_generated,
                    free_limits_exceeded:
                      session.session_metadata.free_generations_used
                        .free_limits_exceeded
                  }
                : null
            })
          )
        }

        // Get session statistics
        const sessionStatsResult =
          await resumeSessionService.getUserSessionStats(userId)
        if (sessionStatsResult.success) {
          sessionInfo.session_stats = sessionStatsResult.stats
        }

        // Get recent generations summary from active sessions
        if (
          activeSessionsResult.success &&
          activeSessionsResult.sessions.length > 0
        ) {
          const recentGenerations = []

          activeSessionsResult.sessions.forEach((session) => {
            if (
              session.generated_resumes &&
              session.generated_resumes.length > 0
            ) {
              // Get the 3 most recent generations from each session
              const sortedGenerations = session.generated_resumes
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3)

              sortedGenerations.forEach((generation) => {
                recentGenerations.push({
                  generation_id: generation.generation_id,
                  session_id: session.session_id,
                  generation_type:
                    generation.generation_metadata.generation_type,
                  job_title: generation.job_details.job_title,
                  company_name: generation.job_details.company_name,
                  status: generation.generation_metadata.generation_status,
                  credits_used: generation.generation_metadata.credits_used,
                  created_at: generation.created_at,
                  used_free_generation:
                    generation.generation_metadata.used_free_generation
                })
              })
            }
          })

          // Sort all recent generations by date and take the 10 most recent
          sessionInfo.recent_generations = recentGenerations
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
        }
      } catch (sessionError) {
        console.warn(
          "Failed to fetch session information:",
          sessionError.message
        )
        // Don't fail the main request if session info fails
      }

      // Get action type information with credit costs
      const actionTypes = {
        job_title_generation: {
          action_name: "Job Title Generation",
          credit_cost: CREDIT_COSTS.JOB_TITLE_GENERATION,
          free_limit: FREE_USAGE_LIMITS.JOB_TITLE_GENERATION,
          description: "Generate relevant job titles from job descriptions"
        },
        job_description_generation: {
          action_name: "Job Description Enhancement",
          credit_cost: CREDIT_COSTS.JOB_DESCRIPTION_GENERATION,
          free_limit: FREE_USAGE_LIMITS.JOB_DESCRIPTION_GENERATION,
          description: "Enhance and standardize job descriptions"
        },
        job_skills_generation: {
          action_name: "Job Skills Extraction",
          credit_cost: CREDIT_COSTS.JOB_SKILLS_GENERATION,
          free_limit: FREE_USAGE_LIMITS.JOB_SKILLS_GENERATION,
          description: "Extract and categorize required job skills"
        },
        tailored_resume: {
          action_name: "Tailored Resume Generation",
          credit_cost: CREDIT_COSTS.TAILORED_RESUME,
          free_limit: FREE_USAGE_LIMITS.TAILORED_RESUME,
          description: "Generate complete tailored resume for specific job"
        }
      }

      // Combine credit status with session info
      const data = {
        credit_status: creditStatus,
        action_types: actionTypes,
        session_info: sessionInfo,
        summary: {
          total_credits_available: creditStatus.totalCreditsAvailable,
          active_sessions_count: sessionInfo.active_sessions.length,
          total_sessions_ever: sessionInfo.session_stats.total_sessions || 0,
          total_generations_ever:
            sessionInfo.session_stats.total_generations || 0,
          recent_generations_count: sessionInfo.recent_generations.length,
          free_generations_status: {
            any_free_limits_exceeded: sessionInfo.active_sessions.some(
              (session) => session.free_generation_stats?.free_limits_exceeded
            ),
            sessions_with_free_usage: sessionInfo.active_sessions.filter(
              (session) =>
                session.free_generation_stats &&
                (session.free_generation_stats.job_title_used ||
                  session.free_generation_stats.job_description_used ||
                  session.free_generation_stats.job_skills_used)
            ).length
          }
        }
      }

      return res.status(200).json({
        msg: "Credit status and session info retrieved successfully",
        success: true,
        data
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to get credit status and session info",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  uploadBaseResume: async (req, res) => {
    try {
      // Validate that file was uploaded
      if (!req.files || !req.files.resume) {
        return res.status(400).json({
          msg: "Resume file upload is required",
          success: false,
          error: "Please upload a resume file"
        })
      }

      const resumeFile = req.files.resume
      let s3Path = null
      let s3Key = null
      let isPublic = false

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ]

      if (!allowedTypes.includes(resumeFile.mimetype)) {
        return res.status(400).json({
          msg: "Invalid file type",
          success: false,
          error: "Please upload a PDF, DOC, DOCX, or TXT file"
        })
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (resumeFile.size > maxSize) {
        return res.status(400).json({
          msg: "File too large",
          success: false,
          error: "File size must be less than 10MB"
        })
      }

      // Determine file format
      let fileFormat = "TXT"
      if (resumeFile.mimetype === "application/pdf") {
        fileFormat = "PDF"
      } else if (resumeFile.mimetype.includes("word")) {
        fileFormat = "DOCX"
      }

      try {
        // Upload file to S3
        const fileLocation = await utils.uploadFile(resumeFile, "Private")
        s3Path = fileLocation.Location
        s3Key = utils.extractS3Key(s3Path)
        isPublic = fileLocation.isPublic || false
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError)
        return res.status(500).json({
          msg: "Failed to upload resume to storage",
          success: false,
          error: uploadError.message || "Storage upload failed"
        })
      }

      // Return file upload information
      const data = {
        file_info: {
          s3_path: s3Path,
          s3_key: s3Key,
          original_filename: resumeFile.name,
          file_format: fileFormat,
          file_size: resumeFile.size,
          mime_type: resumeFile.mimetype,
          is_public: isPublic,
          access_note: isPublic
            ? "File is publicly accessible"
            : "File is private - use pre-signed URL for access"
        },
        metadata: {
          uploaded_at: new Date().toISOString(),
          file_type: resumeFile.mimetype
        }
      }

      return res.status(201).json({
        msg: "Resume file uploaded successfully to S3",
        success: true,
        data
      })
    } catch (error) {
      console.error("Resume upload error:", error)
      return res.status(500).json({
        msg: "An error occurred while uploading the resume",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  // Generate pre-signed URL for accessing uploaded resume
  generateResumeAccessUrl: async (req, res) => {
    try {
      const { session_id, expires_in = 3600 } = req.body // expires_in in seconds, default 1 hour

      if (!session_id) {
        return res.status(400).json({
          msg: "Session ID is required",
          success: false,
          error: "Missing required field: session_id"
        })
      }

      const userId = req.token._id

      // Get the session to retrieve S3 path
      const sessionResult = await resumeSessionService.getSession(
        session_id,
        true
      )

      if (!sessionResult.success) {
        return res.status(404).json({
          msg: "Session not found",
          success: false,
          error: "Invalid session ID or session does not exist"
        })
      }

      // Verify session belongs to the user
      if (sessionResult.session.user_id.toString() !== userId.toString()) {
        return res.status(403).json({
          msg: "Access denied",
          success: false,
          error: "You do not have permission to access this session"
        })
      }

      const session = sessionResult.session

      // Check if session has resume data (should have both file and text for new sessions)
      if (
        !session.base_resume ||
        (!session.base_resume.s3_path && !session.base_resume.base_resume_text)
      ) {
        return res.status(404).json({
          msg: "No resume data found in session",
          success: false,
          error: "Session does not contain resume data"
        })
      }

      // For sessions with S3 path, generate pre-signed URL and include text if available
      if (session.base_resume.s3_path) {
        const s3Key = utils.extractS3Key(session.base_resume.s3_path)

        // Generate pre-signed URL
        const urlResult = await utils.generatePresignedUrl(s3Key, expires_in)

        if (!urlResult.success) {
          return res.status(500).json({
            msg: "Failed to generate access URL",
            success: false,
            error: urlResult.error
          })
        }

        const data = {
          access_url: urlResult.url,
          expires_in: urlResult.expiresIn,
          expires_at: urlResult.expiresAt,
          file_info: {
            original_filename: session.base_resume.original_filename,
            file_format: session.base_resume.file_format,
            file_size: session.base_resume.file_size,
            uploaded_at: session.base_resume.uploaded_at
          },
          resume_source: session.base_resume.base_resume_text
            ? "file_and_text"
            : "file_upload",
          // Include resume text if available (for new sessions created with both)
          resume_text: session.base_resume.base_resume_text || null,
          has_text: !!session.base_resume.base_resume_text
        }

        return res.status(200).json({
          msg: "Resume access data retrieved successfully",
          success: true,
          data
        })
      } else {
        // Legacy text-only session - return text directly
        const data = {
          resume_text: session.base_resume.base_resume_text,
          file_info: {
            original_filename: session.base_resume.original_filename,
            file_format: session.base_resume.file_format,
            file_size: session.base_resume.file_size,
            uploaded_at: session.base_resume.uploaded_at
          },
          resume_source: "direct_text"
        }

        return res.status(200).json({
          msg: "Resume text retrieved successfully",
          success: true,
          data
        })
      }
    } catch (error) {
      console.error("Generate resume access URL error:", error)
      return res.status(500).json({
        msg: "An error occurred while generating access URL",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  // Get complete session data and user's previous sessions
  getSessionData: async (req, res) => {
    try {
      const { SESSION_ID } = req.body
      const userId = req.token._id

      // Initialize variables for session handling
      let currentSession = null
      let sessionError = null
      let hasValidSession = false

      // Try to get the specific session data if SESSION_ID is provided
      if (SESSION_ID) {
        try {
          const sessionResult = await resumeSessionService.getSession(
            SESSION_ID,
            true
          )

          if (sessionResult.success) {
            // Verify session belongs to the user
            if (
              sessionResult.session.user_id.toString() === userId.toString()
            ) {
              currentSession = sessionResult.session
              hasValidSession = true
            } else {
              sessionError = {
                type: "ACCESS_DENIED",
                message: "You do not have permission to access this session"
              }
            }
          } else {
            sessionError = {
              type: "SESSION_NOT_FOUND",
              message: "Invalid session ID or session does not exist"
            }
          }
        } catch (error) {
          sessionError = {
            type: "SESSION_ERROR",
            message: error.message || "Error retrieving session"
          }
        }
      } else {
        sessionError = {
          type: "MISSING_SESSION_ID",
          message: "Session ID not provided"
        }
      }

      // Get all user's sessions (if no valid session ID, treat all as previous sessions)
      let previousSessions = []
      try {
        const allSessionsResult =
          await resumeSessionService.getUserActiveSessions(userId, 50, true) // Include resume data
        if (allSessionsResult.success) {
          previousSessions = allSessionsResult.sessions
            // Only exclude current session if we have a valid SESSION_ID
            .filter(
              (session) => !hasValidSession || session.session_id !== SESSION_ID
            )
            // Only include sessions that have at least one generated resume with job details
            .filter(
              (session) =>
                session.generated_resumes &&
                session.generated_resumes.length > 0 &&
                session.generated_resumes.some((gen) => gen.job_details)
            )
            .map((session) => ({
              session_id: session.session_id,
              user_id: session.user_id,
              status: session.session_metadata.status,
              created_at: session.createdAt,
              updated_at: session.updatedAt,
              expires_at: session.session_metadata.expires_at,

              // Complete base resume information (same as current_session)
              base_resume: {
                original_filename: session.base_resume?.original_filename,
                file_format: session.base_resume?.file_format,
                file_size: session.base_resume?.file_size,
                uploaded_at: session.base_resume?.uploaded_at,
                s3_path: session.base_resume?.s3_path,
                has_file: !!session.base_resume?.s3_path,
                has_text: !!session.base_resume?.base_resume_text,
                resume_source:
                  session.base_resume?.s3_path &&
                  session.base_resume?.base_resume_text
                    ? "file_and_text"
                    : session.base_resume?.s3_path
                    ? "file_upload"
                    : "direct_text",
                // Include resume text if available
                resume_text: session.base_resume?.base_resume_text || null
              },

              // Complete session metadata and statistics (same as current_session)
              session_metadata: {
                total_generations: session.session_metadata.total_generations,
                total_credits_used: session.session_metadata.total_credits_used,
                total_tokens_used: session.session_metadata.total_tokens_used,
                free_generations_used: session.session_metadata
                  .free_generations_used || {
                  job_title_generated: false,
                  job_description_generated: false,
                  job_skills_generated: false,
                  generation_counts: {
                    job_title: 0,
                    job_description: 0,
                    job_skills: 0,
                    tailored_resume: 0
                  }
                }
              },

              // All generated resumes in this session with complete data (same as current_session)
              generated_resumes: session.generated_resumes
                ? session.generated_resumes
                    // Only include generations that have job details
                    .filter((generation) => generation.job_details)
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((generation) => ({
                      generation_id: generation.generation_id,
                      created_at: generation.created_at,
                      updated_at: generation.updated_at,

                      // Complete job details
                      job_details: {
                        job_title: generation.job_details.job_title,
                        company_name: generation.job_details.company_name,
                        company_url: generation.job_details.company_url,
                        job_skills: generation.job_details.job_skills,
                        years_experience:
                          generation.job_details.years_experience,
                        additional_context:
                          generation.job_details.additional_context,
                        job_description: generation.job_details.job_description || null,
                        // Include new fields
                        resume_score:
                          generation.job_details.resume_score || null,
                        language: generation.job_details.language || null,
                        years_experience_string:
                          generation.job_details.years_experience_string || null
                      },

                      // Complete generation metadata
                      generation_metadata: {
                        model_used: generation.generation_metadata.model_used,
                        generation_type:
                          generation.generation_metadata.generation_type,
                        tokens_used: generation.generation_metadata.tokens_used,
                        credits_used:
                          generation.generation_metadata.credits_used,
                        used_free_generation:
                          generation.generation_metadata.used_free_generation,
                        generation_status:
                          generation.generation_metadata.generation_status ||
                          "completed"
                      },

                      // Complete resume data (include the full resume_data from OpenAI)
                      generated_resume: {
                        format: generation.generated_resume.format,
                        file_size: generation.generated_resume.file_size,
                        s3_path: generation.generated_resume.s3_path,
                        has_resume_data:
                          !!generation.generated_resume.resume_data,
                        resume_data:
                          generation.generated_resume.resume_data || null
                      }
                    }))
                : [],

              // Complete analytics data
              analytics: session.analytics || {}
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by most recent first
        }
      } catch (sessionError) {
        console.warn("Failed to fetch previous sessions:", sessionError.message)
        // Don't fail the main request if previous sessions fetch fails
      }

      // Format current session data with complete information (only if we have a valid session)
      let currentSessionData = null
      if (hasValidSession && currentSession) {
        currentSessionData = {
          session_id: currentSession.session_id,
          user_id: currentSession.user_id,
          status: currentSession.session_metadata.status,
          created_at: currentSession.createdAt,
          updated_at: currentSession.updatedAt,
          expires_at: currentSession.session_metadata.expires_at,

          // Base resume information
          base_resume: {
            original_filename: currentSession.base_resume?.original_filename,
            file_format: currentSession.base_resume?.file_format,
            file_size: currentSession.base_resume?.file_size,
            uploaded_at: currentSession.base_resume?.uploaded_at,
            s3_path: currentSession.base_resume?.s3_path,
            has_file: !!currentSession.base_resume?.s3_path,
            has_text: !!currentSession.base_resume?.base_resume_text,
            resume_source:
              currentSession.base_resume?.s3_path &&
              currentSession.base_resume?.base_resume_text
                ? "file_and_text"
                : currentSession.base_resume?.s3_path
                ? "file_upload"
                : "direct_text",
            // Include resume text if available
            resume_text: currentSession.base_resume?.base_resume_text || null
          },

          // Session metadata and statistics
          session_metadata: {
            total_generations:
              currentSession.session_metadata.total_generations,
            total_credits_used:
              currentSession.session_metadata.total_credits_used,
            total_tokens_used:
              currentSession.session_metadata.total_tokens_used,
            free_generations_used: currentSession.session_metadata
              .free_generations_used || {
              job_title_generated: false,
              job_description_generated: false,
              job_skills_generated: false,
              generation_counts: {
                job_title: 0,
                job_description: 0,
                job_skills: 0,
                tailored_resume: 0
              }
            }
          },

          // All generated resumes in this session (only those with job details)
          generated_resumes: currentSession.generated_resumes
            ? currentSession.generated_resumes
                // Only include generations that have job details
                .filter((generation) => generation.job_details)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((generation) => ({
                  generation_id: generation.generation_id,
                  created_at: generation.created_at,
                  updated_at: generation.updated_at,

                  // Job details
                  job_details: {
                    job_title: generation.job_details.job_title,
                    company_name: generation.job_details.company_name,
                    company_url: generation.job_details.company_url,
                    job_skills: generation.job_details.job_skills,
                    years_experience: generation.job_details.years_experience,
                    additional_context:
                      generation.job_details.additional_context,
                    job_description: generation.job_details.job_description || null,
                    // Include new fields
                    resume_score: generation.job_details.resume_score || null,
                    language: generation.job_details.language || null,
                    years_experience_string:
                      generation.job_details.years_experience_string || null
                  },

                  // Generation metadata
                  generation_metadata: {
                    model_used: generation.generation_metadata.model_used,
                    generation_type:
                      generation.generation_metadata.generation_type,
                    tokens_used: generation.generation_metadata.tokens_used,
                    credits_used: generation.generation_metadata.credits_used,
                    used_free_generation:
                      generation.generation_metadata.used_free_generation,
                    generation_status:
                      generation.generation_metadata.generation_status ||
                      "completed"
                  },

                  // Resume data (include the full resume_data from OpenAI)
                  generated_resume: {
                    format: generation.generated_resume.format,
                    file_size: generation.generated_resume.file_size,
                    s3_path: generation.generated_resume.s3_path,
                    has_resume_data: !!generation.generated_resume.resume_data,
                    resume_data: generation.generated_resume.resume_data || null
                  }
                }))
            : [],

          // Analytics data
          analytics: currentSession.analytics || {}
        }
      }

      // Get user's overall session statistics
      let userStats = {}
      try {
        const statsResult = await resumeSessionService.getUserSessionStats(
          userId
        )
        if (statsResult.success) {
          userStats = statsResult.stats
        }
      } catch (statsError) {
        console.warn("Failed to fetch user statistics:", statsError.message)
      }

      const data = {
        current_session: currentSessionData, // Will be null if session is invalid/not found
        previous_sessions: previousSessions,
        user_statistics: {
          total_sessions: userStats.total_sessions || 0,
          total_generations: userStats.total_generations || 0,
          total_credits_used: userStats.total_credits_used || 0,
          total_tokens_used: userStats.total_tokens_used || 0,
          average_generations_per_session:
            userStats.avg_generations_per_session || 0,
          previous_sessions_count: previousSessions.length
        },
        metadata: {
          retrieved_at: new Date().toISOString(),
          session_found: hasValidSession,
          user_has_access: hasValidSession,
          previous_sessions_included: previousSessions.length,
          session_error: sessionError, // Include error details if any
          requested_session_id: SESSION_ID || null
        }
      }

      // Determine response message based on session status
      let responseMessage = "Session data retrieved successfully"
      let statusCode = 200

      if (!hasValidSession) {
        if (sessionError?.type === "MISSING_SESSION_ID") {
          responseMessage =
            "User data retrieved successfully (no specific session requested)"
        } else if (sessionError?.type === "SESSION_NOT_FOUND") {
          responseMessage =
            "User data retrieved successfully (requested session not found)"
        } else if (sessionError?.type === "ACCESS_DENIED") {
          responseMessage =
            "User data retrieved successfully (access denied to requested session)"
        } else {
          responseMessage =
            "User data retrieved successfully (error with requested session)"
        }
      }

      return res.status(statusCode).json({
        msg: responseMessage,
        success: true,
        data
      })
    } catch (error) {
      console.error("Get session data error:", error)
      return res.status(500).json({
        msg: "An error occurred while retrieving session data",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  // Store multiple job details in session without generating resumes
  storeJobDetails: async (req, res) => {
    try {
      const { SESSION_ID, jobs, resumeText, fileInfo } = req.body

      // Validate required fields
      if (!SESSION_ID) {
        return res.status(400).json({
          msg: "Session ID is required",
          success: false,
          error: "Missing required field: SESSION_ID"
        })
      }

      if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
        return res.status(400).json({
          msg: "Jobs array is required",
          success: false,
          error: "Please provide an array of job objects"
        })
      }

      // Validate each job object
      const requiredFields = [
        "id",
        "companyUrl",
        "jobTitle",
        "description",
        "skills"
      ]
      const optionalFields = ["resumeScore", "language", "yearsOfExperience"]

      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i]

        // Check required fields
        for (const field of requiredFields) {
          if (
            !job[field] ||
            (typeof job[field] === "string" && job[field].trim() === "")
          ) {
            return res.status(400).json({
              msg: `Invalid job data at index ${i}`,
              success: false,
              error: `Missing or empty required field: ${field}`
            })
          }
        }

        // Validate optional fields if provided
        if (job.resumeScore !== undefined) {
          if (
            typeof job.resumeScore !== "number" ||
            job.resumeScore < 0 ||
            job.resumeScore > 100
          ) {
            return res.status(400).json({
              msg: `Invalid job data at index ${i}`,
              success: false,
              error: `resumeScore must be a number between 0 and 100`
            })
          }
        }

        if (
          job.language !== undefined &&
          (typeof job.language !== "string" || job.language.trim() === "")
        ) {
          return res.status(400).json({
            msg: `Invalid job data at index ${i}`,
            success: false,
            error: `language must be a non-empty string`
          })
        }

        if (
          job.yearsOfExperience !== undefined &&
          (typeof job.yearsOfExperience !== "string" ||
            job.yearsOfExperience.trim() === "")
        ) {
          return res.status(400).json({
            msg: `Invalid job data at index ${i}`,
            success: false,
            error: `yearsOfExperience must be a non-empty string`
          })
        }
      }

      const userId = req.token._id

      // Validate resume data - at least one of resumeText or fileInfo should be provided
      const hasResumeText = resumeText && resumeText.trim() !== ""
      const hasFileInfo =
        fileInfo && fileInfo.s3_path && fileInfo.original_filename

      if (!hasResumeText && !hasFileInfo) {
        return res.status(400).json({
          msg: "Resume data is required",
          success: false,
          error:
            "Please provide either resumeText or fileInfo with S3 upload details"
        })
      }

      // If fileInfo is provided, validate required fields
      if (hasFileInfo) {
        const requiredFileFields = [
          "s3_path",
          "s3_key",
          "original_filename",
          "file_format",
          "file_size"
        ]
        for (const field of requiredFileFields) {
          if (!fileInfo[field]) {
            return res.status(400).json({
              msg: "Invalid file information",
              success: false,
              error: `Missing required file field: ${field}`
            })
          }
        }

        // Validate optional fields if provided
        if (
          fileInfo.mime_type !== undefined &&
          (typeof fileInfo.mime_type !== "string" ||
            fileInfo.mime_type.trim() === "")
        ) {
          return res.status(400).json({
            msg: "Invalid file information",
            success: false,
            error: "mime_type must be a non-empty string if provided"
          })
        }

        if (
          fileInfo.is_public !== undefined &&
          typeof fileInfo.is_public !== "boolean"
        ) {
          return res.status(400).json({
            msg: "Invalid file information",
            success: false,
            error: "is_public must be a boolean if provided"
          })
        }
      }

      // Get the session to verify ownership and existence, or create if doesn't exist
      console.log(`Checking if session ${SESSION_ID} exists for job storage...`)

      // Prepare session data with resume information
      const sessionData = {
        userId,
        analytics: {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          referrer: req.get("Referer"),
          deviceType: "unknown",
          createdFrom: "job_storage_with_resume"
        }
      }

      // Add resume data to session if provided
      if (hasFileInfo || hasResumeText) {
        sessionData.baseResumeS3Path = hasFileInfo ? fileInfo.s3_path : null
        sessionData.originalFilename = hasFileInfo
          ? fileInfo.original_filename
          : "resume_text_only.txt"
        sessionData.fileFormat = hasFileInfo ? fileInfo.file_format : "TXT"
        sessionData.fileSize = hasFileInfo
          ? fileInfo.file_size
          : resumeText
          ? resumeText.length
          : 0
        sessionData.baseResumeText = hasResumeText ? resumeText.trim() : null
      }

      // Use helper function to handle session creation with duplicate key protection
      let sessionResult = await handleSessionCreateOrUpdate(
        SESSION_ID,
        sessionData,
        // If session exists and we have resume data, update it
        hasFileInfo || hasResumeText
          ? {
              baseResumeS3Path: sessionData.baseResumeS3Path,
              originalFilename: sessionData.originalFilename,
              fileFormat: sessionData.fileFormat,
              fileSize: sessionData.fileSize,
              baseResumeText: sessionData.baseResumeText
            }
          : null
      )

      if (!sessionResult.success) {
        console.error(
          `Failed to create or retrieve session ${SESSION_ID}:`,
          sessionResult.error
        )
        return res.status(500).json({
          msg: "Failed to create or retrieve session",
          success: false,
          error: sessionResult.error || "Session operation failed"
        })
      }

      // Verify session belongs to the user
      if (sessionResult.session.user_id.toString() !== userId.toString()) {
        return res.status(403).json({
          msg: "Access denied",
          success: false,
          error: "You do not have permission to access this session"
        })
      }

      let storedJobs = []
      let failedJobs = []

      // Process each job
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i]

        try {
          // Extract company name from URL
          const domain = job.companyUrl
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split(".")[0]
          const companyName = domain.charAt(0).toUpperCase() + domain.slice(1)

          // Parse skills (handle both string and array)
          let skillsArray = []
          if (typeof job.skills === "string") {
            skillsArray = job.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill.length > 0)
          } else if (Array.isArray(job.skills)) {
            skillsArray = job.skills
              .map((skill) => String(skill).trim())
              .filter((skill) => skill.length > 0)
          }

          // Parse years of experience to number if provided
          let yearsExperienceNum = 0
          if (job.yearsOfExperience) {
            // Try to extract a number from the string (e.g., "2-5" -> 2, "3+" -> 3)
            const match = job.yearsOfExperience.match(/(\d+)/)
            if (match) {
              yearsExperienceNum = parseInt(match[1], 10)
            }
          }

          // Prepare job data for storage with correct structure expected by addGeneratedResume
          const jobData = {
            jobTitle: job.jobTitle.trim(),
            jobDescription: job.description.trim(),
            companyName: companyName,
            companyUrl: job.companyUrl.trim(),
            jobSkills: skillsArray,
            yearsExperience: yearsExperienceNum,
            additionalContext: `Job stored from batch upload. Score: ${
              job.resumeScore || "N/A"
            }. Language: ${job.language || "N/A"}. Experience: ${
              job.yearsOfExperience || "N/A"
            }.`,
            resumeData: null, // No resume generated yet
            format: "JSON", // Use valid enum value
            metadata: {
              modelUsed: null,
              tokensUsed: 0,
              creditsUsed: 0,
              status: "pending", // Use valid enum value for generation_status
              generationType: "JOB_TITLE", // Use valid enum value for generation_type (temporary for storage)
              originalJobId: job.id,
              original_job_id: job.id,
              original_id: job.id,
              resumeScore: job.resumeScore || null,
              language: job.language || "English (US)",
              yearsOfExperience: job.yearsOfExperience || null,
              storedAt: new Date().toISOString()
            }
          }

          // Add to session
          const addResult = await resumeSessionService.addGeneratedResume(
            SESSION_ID,
            jobData
          )

          if (addResult.success) {
            storedJobs.push({
              original_id: job.id,
              original_job_id: job.id,
              generation_id: job.id || addResult.generationId,
              job_title: job.jobTitle,
              company_name: companyName,
              company_url: job.companyUrl,
              skills_count: skillsArray.length,
              resume_score: job.resumeScore || null,
              language: job.language || "English (US)",
              years_of_experience: job.yearsOfExperience || null,
              years_experience_numeric: yearsExperienceNum,
              status: "stored"
            })
          } else {
            failedJobs.push({
              original_id: job.id,
              job_title: job.jobTitle,
              error: addResult.error || "Failed to store job"
            })
          }
        } catch (jobError) {
          console.error(`Error processing job ${job.id}:`, jobError)
          failedJobs.push({
            original_id: job.id,
            job_title: job.jobTitle || "Unknown",
            error: jobError.message || "Processing error"
          })
        }
      }

      // Verify data was stored correctly by fetching the session again
      let verification = null
      if (storedJobs.length > 0) {
        try {
          const verificationResult = await resumeSessionService.getSession(
            SESSION_ID,
            true
          )
          if (verificationResult.success) {
            const storedGenerations =
              verificationResult.session.generated_resumes || []
            const recentGenerations = storedGenerations
              .filter((gen) =>
                storedJobs.some(
                  (job) => job.generation_id === gen.generation_id
                )
              )
              .map((gen) => ({
                generation_id: gen.generation_id,
                has_resume_score: gen.job_details?.resume_score !== undefined,
                has_language: gen.job_details?.language !== undefined,
                has_years_experience:
                  gen.job_details?.years_of_experience !== undefined,
                resume_score: gen.job_details?.resume_score || null,
                language: gen.job_details?.language || null,
                years_experience: gen.job_details?.years_of_experience || null
              }))

            verification = {
              verified_count: recentGenerations.length,
              all_fields_stored: recentGenerations.every(
                (gen) =>
                  gen.has_resume_score &&
                  gen.has_language &&
                  gen.has_years_experience
              ),
              sample_generation: recentGenerations[0] || null
            }
          }
        } catch (verifyError) {
          console.warn("Failed to verify stored data:", verifyError.message)
          verification = { error: "Verification failed" }
        }
      }

      // Prepare response data
      const data = {
        session_id: SESSION_ID,
        jobs_processed: jobs.length,
        jobs_stored: storedJobs.length,
        jobs_failed: failedJobs.length,
        stored_jobs: storedJobs,
        failed_jobs: failedJobs,
        resume_data: {
          has_file: hasFileInfo,
          has_text: hasResumeText,
          resume_source:
            hasFileInfo && hasResumeText
              ? "file_and_text"
              : hasFileInfo
              ? "file_upload"
              : "text_only",
          file_info: hasFileInfo
            ? {
                s3_path: fileInfo.s3_path,
                s3_key: fileInfo.s3_key,
                original_filename: fileInfo.original_filename,
                file_format: fileInfo.file_format,
                file_size: fileInfo.file_size,
                mime_type: fileInfo.mime_type || null,
                is_public: fileInfo.is_public || false,
                access_note: fileInfo.access_note || null
              }
            : null,
          text_provided: hasResumeText
        },
        summary: {
          success_rate:
            ((storedJobs.length / jobs.length) * 100).toFixed(1) + "%",
          total_skills_extracted: storedJobs.reduce(
            (sum, job) => sum + job.skills_count,
            0
          ),
          average_resume_score:
            storedJobs.length > 0
              ? (
                  storedJobs.reduce(
                    (sum, job) => sum + (job.resume_score || 0),
                    0
                  ) / storedJobs.length
                ).toFixed(1)
              : null,
          languages_provided: [
            ...new Set(storedJobs.map((job) => job.language).filter(Boolean))
          ],
          experience_ranges: [
            ...new Set(
              storedJobs.map((job) => job.years_of_experience).filter(Boolean)
            )
          ],
          resume_uploaded: hasFileInfo || hasResumeText
        },
        verification: verification,
        metadata: {
          stored_at: new Date().toISOString(),
          session_updated: storedJobs.length > 0,
          resume_updated: hasFileInfo || hasResumeText,
          data_verified: verification !== null
        }
      }

      // Determine response status and message based on results
      let statusCode = 200
      let message = "Job details and resume data stored successfully"

      if (failedJobs.length === jobs.length) {
        statusCode = 500
        message = "Failed to store any job details"
      } else if (failedJobs.length > 0) {
        statusCode = 207 // Multi-status
        message = `Partially successful: ${storedJobs.length} stored, ${failedJobs.length} failed`
      }

      return res.status(statusCode).json({
        msg: message,
        success: storedJobs.length > 0,
        data
      })
    } catch (error) {
      console.error("Store job details error:", error)
      return res.status(500).json({
        msg: "An error occurred while storing job details",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  // Analyze resume match score for a specific job
  analyzeResumeJobMatch: async (req, res) => {
    try {
      const { resumeText, jobTitle, jobDescription, skills } = req.body

      // Validate required fields
      if (!resumeText || !jobTitle || !jobDescription || !skills) {
        return res.status(400).json({
          msg: "Missing required fields",
          success: false,
          error:
            "Please provide resumeText, jobTitle, jobDescription, and skills"
        })
      }

      // Validate field types and content
      if (typeof resumeText !== "string" || resumeText.trim() === "") {
        return res.status(400).json({
          msg: "Invalid resume text",
          success: false,
          error: "resumeText must be a non-empty string"
        })
      }

      if (typeof jobTitle !== "string" || jobTitle.trim() === "") {
        return res.status(400).json({
          msg: "Invalid job title",
          success: false,
          error: "jobTitle must be a non-empty string"
        })
      }

      if (typeof jobDescription !== "string" || jobDescription.trim() === "") {
        return res.status(400).json({
          msg: "Invalid job description",
          success: false,
          error: "jobDescription must be a non-empty string"
        })
      }

      // Skills can be array or string
      if (
        !skills ||
        (Array.isArray(skills) && skills.length === 0) ||
        (typeof skills === "string" && skills.trim() === "")
      ) {
        return res.status(400).json({
          msg: "Invalid skills",
          success: false,
          error: "skills must be a non-empty array or string"
        })
      }

      const userId = req.token._id

      // Import the prompt generation functions
      const {
        generateSystemPrompt,
        generateUserPrompt
      } = require("../config/ai/prompts/resumeAnalysis.prompt")

      // Generate prompts
      const systemPrompt = generateSystemPrompt()
      const userPrompt = generateUserPrompt({
        resumeText: resumeText.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        skills
      })

      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent scoring
        max_tokens: 10, // We only need a number
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      // Extract the response
      const response = completion.choices[0].message.content?.trim()

      if (!response) {
        throw new Error("No response received from AI analysis")
      }

      // Parse the score from the response
      let score = parseInt(response.replace(/[^0-9]/g, ""), 10)

      // Validate score is within expected range
      if (isNaN(score) || score < 0 || score > 100) {
        throw new Error("Invalid score received from AI analysis")
      }

      const data = {
        score: score,
        metadata: {
          job_title: jobTitle.trim(),
          analyzed_at: new Date().toISOString(),
          tokens_used: completion.usage?.total_tokens || 0,
          is_free: true
        }
      }

      return res.status(200).json({
        msg: "Resume analysis completed successfully",
        success: true,
        data
      })
    } catch (error) {
      if (error.status === 429) {
        let waitMs = 1000

        if (error.headers?.["retry-after"]) {
          waitMs = parseFloat(error.headers["retry-after"]) * 1000
        } else if (error.headers?.["retry-after-ms"]) {
          waitMs = parseFloat(error.headers["retry-after-ms"])
        }

        return res.status(429).json({
          msg: `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds and try again.`,
          success: false,
          data: {
            wait_ms: waitMs + 1000
          }
        })
      }

      return res.status(500).json({
        msg: "An error occurred while analyzing resume match",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },

  // Stream S3 file - Public endpoint with CORS support
  streamS3File: async (req, res) => {
    try {
      const { url } = req.query

      // Set CORS headers for all origins
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD")
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      )

      // Handle preflight OPTIONS request
      if (req.method === "OPTIONS") {
        return res.sendStatus(200)
      }

      // Validate URL parameter
      if (!url) {
        return res.status(400).json({
          msg: "Missing required parameter",
          success: false,
          error: "Please provide 'url' query parameter with encoded S3 URL"
        })
      }

      let decodedUrl
      try {
        decodedUrl = decodeURIComponent(url)
      } catch (decodeError) {
        return res.status(400).json({
          msg: "Invalid URL encoding",
          success: false,
          error: "Failed to decode the provided URL"
        })
      }

      // Validate that it's an S3 URL
      if (
        !decodedUrl.includes("s3.amazonaws.com") &&
        !decodedUrl.includes(".s3.")
      ) {
        return res.status(400).json({
          msg: "Invalid S3 URL",
          success: false,
          error: "URL must be a valid S3 URL"
        })
      }

      // Parse S3 URL to extract bucket and key
      let bucketName, objectKey
      try {
        const urlObj = new URL(decodedUrl)

        if (decodedUrl.includes(".s3.amazonaws.com/")) {
          // Format: https://bucket-name.s3.amazonaws.com/path/to/file
          bucketName = urlObj.hostname.split(".")[0]
          objectKey = urlObj.pathname.substring(1) // Remove leading slash
        } else if (decodedUrl.includes("s3.amazonaws.com/")) {
          // Format: https://s3.amazonaws.com/bucket-name/path/to/file
          const pathParts = urlObj.pathname.substring(1).split("/") // Remove leading slash and split
          bucketName = pathParts[0]
          objectKey = pathParts.slice(1).join("/")
        } else {
          throw new Error("Unsupported S3 URL format")
        }

        if (!bucketName || !objectKey) {
          throw new Error(
            "Could not extract bucket name or object key from URL"
          )
        }
      } catch (parseError) {
        return res.status(400).json({
          msg: "Invalid S3 URL format",
          success: false,
          error: `Failed to parse S3 URL: ${parseError.message}`
        })
      }

      // Import AWS SDK
      const AWS = require("aws-sdk")

      // Configure AWS SDK (it will use environment variables or IAM roles)
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION || "us-east-1"
      })

      try {
        // For HEAD requests, just return the object metadata
        if (req.method === "HEAD") {
          const headResult = await s3
            .headObject({
              Bucket: bucketName,
              Key: objectKey
            })
            .promise()

          // Set response headers
          res.setHeader(
            "Content-Type",
            headResult.ContentType || "application/octet-stream"
          )
          res.setHeader("Content-Length", headResult.ContentLength)
          res.setHeader("ETag", headResult.ETag)
          res.setHeader("Last-Modified", headResult.LastModified)
          res.setHeader("Cache-Control", "public, max-age=3600")

          return res.status(200).end()
        }

        // For GET requests, stream the file
        const getObjectParams = {
          Bucket: bucketName,
          Key: objectKey
        }

        // Get object metadata first to set headers
        const headResult = await s3.headObject(getObjectParams).promise()

        // Set response headers
        res.setHeader(
          "Content-Type",
          headResult.ContentType || "application/octet-stream"
        )
        res.setHeader("Content-Length", headResult.ContentLength)
        res.setHeader("ETag", headResult.ETag)
        res.setHeader("Last-Modified", headResult.LastModified)
        res.setHeader("Cache-Control", "public, max-age=3600")

        // Create a readable stream from S3
        const s3Stream = s3.getObject(getObjectParams).createReadStream()

        // Handle stream errors
        s3Stream.on("error", (streamError) => {
          console.error("S3 stream error:", streamError)
          if (!res.headersSent) {
            res.status(500).json({
              msg: "Error streaming file from S3",
              success: false,
              error: streamError.message
            })
          }
        })

        // Stream the file to the response
        s3Stream.pipe(res)
      } catch (awsError) {
        console.error("AWS S3 error:", awsError)

        // Handle specific AWS errors
        if (awsError.code === "NoSuchKey") {
          return res.status(404).json({
            msg: "File not found",
            success: false,
            error: "The specified file does not exist in S3"
          })
        } else if (awsError.code === "NoSuchBucket") {
          return res.status(404).json({
            msg: "Bucket not found",
            success: false,
            error: "The specified S3 bucket does not exist"
          })
        } else if (awsError.code === "AccessDenied") {
          return res.status(403).json({
            msg: "Access denied",
            success: false,
            error: "Insufficient permissions to access the S3 file"
          })
        } else {
          return res.status(500).json({
            msg: "Failed to access S3 file",
            success: false,
            error: awsError.message || "Unknown AWS error"
          })
        }
      }
    } catch (error) {
      console.error("Stream S3 file error:", error)

      // Make sure we set CORS headers even for errors
      if (!res.headersSent) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD")
        res.header(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        )
      }

      return res.status(500).json({
        msg: "An error occurred while streaming the file",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  },
  // Delete Generation From Session
  deleteGenerationFromSession: async (req, res) => {
    try {
      const { SESSION_ID, generation_id } = req.body

      // Validate required fields
      if (!SESSION_ID) {
        return res.status(400).json({
          msg: "SESSION_ID is required",
          success: false,
          error: "Missing required field: SESSION_ID"
        })
      }

      if (!generation_id) {
        return res.status(400).json({
          msg: "generation_id is required",
          success: false,
          error: "Missing required field: generation_id"
        })
      }

      // Get user ID from auth middleware
      const userId = req.token._id

      // Validate session exists and user has access
      const sessionResult = await resumeSessionService.getSession(
        SESSION_ID,
        true
      )
      
      if (!sessionResult.success) {
        return res.status(404).json({
          msg: "Session not found",
          success: false,
          error: "The specified SESSION_ID does not exist"
        })
      }

      // Verify user owns this session
      if (sessionResult.session.user_id.toString() !== userId.toString()) {
        return res.status(403).json({
          msg: "Access denied",
          success: false,
          error: "You don't have permission to access this session"
        })
      }

      const session = sessionResult.session

      // Find the generation to delete using flexible ID matching
      const generationIndex = session.generated_resumes.findIndex(
        (gen) =>
          gen.generation_id === generation_id ||
          gen.job_details?.original_job_id === generation_id ||
          gen.job_details?.original_id === generation_id ||
          gen.metadata?.originalJobId === generation_id ||
          gen.metadata?.original_job_id === generation_id ||
          gen.metadata?.original_id === generation_id
      )

      if (generationIndex === -1) {
        return res.status(404).json({
          msg: "Generation not found",
          success: false,
          error: "The specified generation_id does not match any generation in this session"
        })
      }

      const deletedGeneration = session.generated_resumes[generationIndex]

      // Remove the generation from the array
      session.generated_resumes.splice(generationIndex, 1)

      // Check if session is now empty
      const remainingGenerations = session.generated_resumes.length
      let sessionDeleted = false

      if (remainingGenerations === 0) {
        // Delete the entire session since it's empty
        try {
          const deleteResult = await resumeSessionService.deleteSession(SESSION_ID)
          if (deleteResult.success) {
            sessionDeleted = true
            console.log(`Session ${SESSION_ID} deleted as it became empty after generation deletion`)
          } else {
            console.warn(`Failed to delete empty session ${SESSION_ID}: ${deleteResult.error}`)
            // Continue with generation deletion even if session deletion fails
          }
        } catch (deleteError) {
          console.warn(`Error deleting empty session ${SESSION_ID}: ${deleteError.message}`)
          // Continue with generation deletion even if session deletion fails
        }
      }

      if (!sessionDeleted) {
        // Save the updated session if it wasn't deleted
        try {
          await session.save()
          console.log(`Generation ${deletedGeneration.generation_id} deleted from session ${SESSION_ID}. Remaining generations: ${remainingGenerations}`)
        } catch (saveError) {
          console.error(`Failed to save session after generation deletion: ${saveError.message}`)
          return res.status(500).json({
            msg: "Failed to update session after deletion",
            success: false,
            error: saveError.message
          })
        }
      }

      // Prepare response data
      const data = {
        session_id: SESSION_ID,
        deleted_generation: {
          generation_id: deletedGeneration.generation_id,
          job_title: deletedGeneration.job_details?.job_title,
          company_name: deletedGeneration.job_details?.company_name,
          original_job_id: deletedGeneration.job_details?.original_job_id || 
                           deletedGeneration.job_details?.original_id ||
                           deletedGeneration.metadata?.originalJobId ||
                           deletedGeneration.metadata?.original_job_id ||
                           deletedGeneration.metadata?.original_id,
          created_at: deletedGeneration.created_at
        },
        session_status: {
          session_deleted: sessionDeleted,
          remaining_generations: sessionDeleted ? 0 : remainingGenerations,
          was_empty_after_deletion: remainingGenerations === 0
        },
        metadata: {
          deleted_at: new Date().toISOString(),
          deletion_reason: sessionDeleted ? "session_became_empty" : "generation_removal_only"
        }
      }

      return res.status(200).json({
        msg: sessionDeleted 
          ? "Generation deleted and session removed (session became empty)"
          : "Generation deleted successfully",
        success: true,
        data
      })

    } catch (error) {
      console.error("Error deleting generation from session:", error)
      return res.status(500).json({
        msg: "An error occurred while deleting the generation",
        success: false,
        error: error.message || "Internal Server Error"
      })
    }
  }
}

module.exports = methods
