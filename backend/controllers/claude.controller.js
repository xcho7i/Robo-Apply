const { claudeService } = require('../services/claude.service.js')
const { sessionCache } = require('../services/sessionCache.js')

// Validation helper functions
function validateGenerateInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const { question, context, sessionId } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new Error('question is required and must be a non-empty string')
    }

    if (context !== undefined && context !== null) {
        if (typeof context !== 'object') {
            throw new Error('context must be an object')
        }

        // Validate context properties
        if (context.resume !== undefined && typeof context.resume !== 'string') {
            throw new Error('context.resume must be a string')
        }
        if (context.jobDescription !== undefined && typeof context.jobDescription !== 'string') {
            throw new Error('context.jobDescription must be a string')
        }
        if (context.additionalContext !== undefined && typeof context.additionalContext !== 'string') {
            throw new Error('context.additionalContext must be a string')
        }
        if (context.verbosity !== undefined && !['concise', 'default', 'lengthy'].includes(context.verbosity)) {
            throw new Error('context.verbosity must be one of: concise, default, lengthy')
        }
        if (context.language !== undefined && typeof context.language !== 'string') {
            throw new Error('context.language must be a string')
        }
        if (context.temperature !== undefined && !['low', 'default', 'high'].includes(context.temperature)) {
            throw new Error('context.temperature must be one of: low, default, high')
        }
        if (context.performance !== undefined && !['speed', 'quality'].includes(context.performance)) {
            throw new Error('context.performance must be one of: speed, quality')
        }
    }

    if (sessionId !== undefined && typeof sessionId !== 'string') {
        throw new Error('sessionId must be a string')
    }

    return { question, context, sessionId }
}

async function generate(req, res, next) {
    try {
        const { question, context, sessionId } = validateGenerateInput(req.body)
        const ctx = (() => {
            if (!context) return undefined
            const out = {}
            if (typeof context.resume === 'string') out.resume = context.resume
            if (typeof context.jobDescription === 'string') out.jobDescription = context.jobDescription
            if (typeof context.additionalContext === 'string') out.additionalContext = context.additionalContext
            if (context.verbosity === 'concise' || context.verbosity === 'default' || context.verbosity === 'lengthy') out.verbosity = context.verbosity
            if (typeof context.language === 'string') out.language = context.language
            if (context.temperature === 'low' || context.temperature === 'default' || context.temperature === 'high') out.temperature = context.temperature
            if (context.performance === 'speed' || context.performance === 'quality') out.performance = context.performance
            return out
        })()
        if (sessionId) {
            const s = sessionCache.get(sessionId)
            if (s) {
                claudeService.setDefaultContext({
                    resume: s.resume,
                    jobDescription: s.jobDescription,
                    additionalContext: s.context,
                })
            }
        }
        const text = await claudeService.generateInterviewResponse(question, ctx)
        res.json({ ok: true, text })
    } catch (err) {
        next(err)
    }
}

function validateDetectInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const { utterance, context, sessionId } = body

    if (!utterance || typeof utterance !== 'string' || utterance.trim().length === 0) {
        throw new Error('utterance is required and must be a non-empty string')
    }

    if (context !== undefined && context !== null) {
        if (typeof context !== 'object') {
            throw new Error('context must be an object')
        }

        // Validate context properties
        if (context.resume !== undefined && typeof context.resume !== 'string') {
            throw new Error('context.resume must be a string')
        }
        if (context.jobDescription !== undefined && typeof context.jobDescription !== 'string') {
            throw new Error('context.jobDescription must be a string')
        }
        if (context.additionalContext !== undefined && typeof context.additionalContext !== 'string') {
            throw new Error('context.additionalContext must be a string')
        }
        if (context.verbosity !== undefined && !['concise', 'default', 'lengthy'].includes(context.verbosity)) {
            throw new Error('context.verbosity must be one of: concise, default, lengthy')
        }
        if (context.language !== undefined && typeof context.language !== 'string') {
            throw new Error('context.language must be a string')
        }
        if (context.temperature !== undefined && !['low', 'default', 'high'].includes(context.temperature)) {
            throw new Error('context.temperature must be one of: low, default, high')
        }
        if (context.performance !== undefined && !['speed', 'quality'].includes(context.performance)) {
            throw new Error('context.performance must be one of: speed, quality')
        }
    }

    if (sessionId !== undefined && typeof sessionId !== 'string') {
        throw new Error('sessionId must be a string')
    }

    return { utterance, context, sessionId }
}

async function detect(req, res, next) {
    try {
        const { utterance, context, sessionId } = validateDetectInput(req.body)
        const ctx = (() => {
            if (!context) return undefined
            const out = {}
            if (typeof context.resume === 'string') out.resume = context.resume
            if (typeof context.jobDescription === 'string') out.jobDescription = context.jobDescription
            if (typeof context.additionalContext === 'string') out.additionalContext = context.additionalContext
            if (context.verbosity === 'concise' || context.verbosity === 'default' || context.verbosity === 'lengthy') out.verbosity = context.verbosity
            if (typeof context.language === 'string') out.language = context.language
            if (context.temperature === 'low' || context.temperature === 'default' || context.temperature === 'high') out.temperature = context.temperature
            if (context.performance === 'speed' || context.performance === 'quality') out.performance = context.performance
            return out
        })()
        if (sessionId) {
            const s = sessionCache.get(sessionId)
            if (s) {
                claudeService.setDefaultContext({
                    resume: s.resume,
                    jobDescription: s.jobDescription,
                    additionalContext: s.context,
                })
            }
        }
        const result = await claudeService.detectQuestionAndAnswer(utterance, ctx)
        res.json({ ok: true, ...result })
    } catch (err) {
        next(err)
    }
}

function validateJobDescriptionInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const { jobTitle, industry, companyName, companySize, experienceLevel, keySkills } = body

    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
        throw new Error('jobTitle is required and must be a non-empty string')
    }

    if (industry !== undefined && typeof industry !== 'string') {
        throw new Error('industry must be a string')
    }

    if (companyName !== undefined && typeof companyName !== 'string') {
        throw new Error('companyName must be a string')
    }

    if (companySize !== undefined && typeof companySize !== 'string') {
        throw new Error('companySize must be a string')
    }

    if (experienceLevel !== undefined && typeof experienceLevel !== 'string') {
        throw new Error('experienceLevel must be a string')
    }

    if (keySkills !== undefined) {
        if (!Array.isArray(keySkills)) {
            throw new Error('keySkills must be an array')
        }
        if (!keySkills.every(skill => typeof skill === 'string')) {
            throw new Error('keySkills must be an array of strings')
        }
    }

    return { jobTitle, industry, companyName, companySize, experienceLevel, keySkills }
}

async function jobDescription(req, res, next) {
    try {
        const params = validateJobDescriptionInput(req.body)
        const text = await claudeService.generateJobDescription(params)
        res.json({ ok: true, text })
    } catch (err) {
        next(err)
    }
}

async function transcribe(_req, res) {
    // Claude does not provide transcription. Keep endpoint for API compatibility.
    res.status(501).json({ ok: false, error: 'Transcription not supported by Claude' })
}

module.exports = { detect, generate, jobDescription, transcribe }
