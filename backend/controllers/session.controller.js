const { sessionCache } = require('../services/sessionCache.js')
const { fetchSessionFromMain, completeSessionOnMain, generateMockInterviewerQuestion } = require('../services/mainProjectApi.mock.js')
const { claudeService } = require('../services/claude.service.js')
const { chatMemory } = require('../sockets/chatMemory.js')

function validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        throw new Error('sessionId is required and must be a non-empty string')
    }
    return sessionId.trim()
}

function extractSessionId(req) {
    // Try to extract sessionId from query params
    if (req.query && req.query.sessionId) {
        try {
            return { sessionId: validateSessionId(req.query.sessionId) }
        } catch {
            // Continue to next method
        }
    }

    // Try to extract sessionId from request body
    if (req.body && req.body.sessionId) {
        try {
            return { sessionId: validateSessionId(req.body.sessionId) }
        } catch {
            // Continue to next method
        }
    }

    // Fallback for axios.post({ params: { sessionId } })
    try {
        const possible = (req.body && req.body.params) || {}
        if (possible.sessionId) {
            return { sessionId: validateSessionId(possible.sessionId) }
        }
    } catch {
        // Continue
    }

    throw new Error('sessionId is required')
}

async function getSession(req, res, next) {
    try {
        const { sessionId } = extractSessionId(req)
        // 1) Check cache
        const cached = sessionCache.get(sessionId)
        if (cached) {
            return res.json({ ok: true, data: cached })
        }
        // 2) Fetch from main (mock for now), store as-is
        const data = await fetchSessionFromMain(sessionId)
        const normalized = {
            ...data,
            // Ensure empty strings if absent
            resume: typeof data.resume === 'string' ? data.resume : '',
            jobDescription: typeof data.jobDescription === 'string' ? data.jobDescription : '',
            context: typeof data.context === 'string' ? data.context : '',
        }
        sessionCache.set(sessionId, normalized)
        // Set on Claude service immediately
        claudeService.setDefaultContext({
            resume: normalized.resume,
            jobDescription: normalized.jobDescription,
            additionalContext: normalized.context,
        })
        return res.json({ ok: true, data: sessionCache.get(sessionId) })
    } catch (err) {
        next(err)
    }
}

function validateCompleteSessionInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const { sessionId, socketId, history, stats } = body

    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        throw new Error('sessionId is required and must be a non-empty string')
    }

    // Validate socketId (optional)
    if (socketId !== undefined && typeof socketId !== 'string') {
        throw new Error('socketId must be a string')
    }

    // Validate history (optional array)
    if (history !== undefined) {
        if (!Array.isArray(history)) {
            throw new Error('history must be an array')
        }
        history.forEach((item, index) => {
            if (!item || typeof item !== 'object') {
                throw new Error(`history[${index}] must be an object`)
            }
            if (!['user', 'interviewer'].includes(item.role)) {
                throw new Error(`history[${index}].role must be 'user' or 'interviewer'`)
            }
            if (!item.content || typeof item.content !== 'string' || item.content.trim().length === 0) {
                throw new Error(`history[${index}].content is required and must be a non-empty string`)
            }
        })
    }

    // Validate stats (optional object)
    if (stats !== undefined) {
        if (typeof stats !== 'object') {
            throw new Error('stats must be an object')
        }

        const statFields = ['totalTranscriptions', 'totalAIResponses', 'totalTokensUsed', 'averageTranscriptionTime', 'averageResponseTime']
        statFields.forEach(field => {
            if (stats[field] !== undefined) {
                if (typeof stats[field] !== 'number' || stats[field] < 0) {
                    throw new Error(`stats.${field} must be a non-negative number`)
                }
            }
        })
    }

    return {
        sessionId: sessionId.trim(),
        socketId,
        history: history || [],
        stats: stats || { totalTranscriptions: 0, totalAIResponses: 0, totalTokensUsed: 0, averageTranscriptionTime: 0, averageResponseTime: 0 }
    }
}

async function completeSession(req, res, next) {
    try {
        // Accept body or nested body.params
        let payload = null
        try {
            payload = validateCompleteSessionInput(req.body)
        } catch {
            try {
                payload = validateCompleteSessionInput(req.body?.params || {})
            } catch {
                res.status(400).json({ ok: false, error: 'invalid payload' })
                return
            }
        }
        const { sessionId, socketId, history, stats } = payload
        let finalHistory = history
        if ((!finalHistory || finalHistory.length === 0) && socketId) {
            try {
                finalHistory = chatMemory.getAll(socketId)
            } catch { finalHistory = [] }
        }
        let record = sessionCache.get(sessionId)
        if (!record) {
            const fetched = await fetchSessionFromMain(sessionId)
            record = {
                ...fetched,
                resume: fetched.resume || '',
                jobDescription: fetched.jobDescription || '',
                context: fetched.context || '',
            }
        }
        const nowIso = new Date().toISOString()
        const updated = {
            ...(record || { sessionId, resume: '', jobDescription: '', context: '' }),
            status: 'completed',
            endedAt: nowIso,
            updatedAt: nowIso,
            totalTranscriptions: stats.totalTranscriptions,
            totalAIResponses: stats.totalAIResponses,
            totalTokensUsed: stats.totalTokensUsed,
            averageTranscriptionTime: stats.averageTranscriptionTime,
            averageResponseTime: stats.averageResponseTime,
            history: finalHistory,
        }
        sessionCache.set(sessionId, updated)
        await completeSessionOnMain(sessionId, updated)
        return res.json({ ok: true, data: updated })
    } catch (err) {
        next(err)
    }
}

function validateNextMockQuestionInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const { sessionId, lastAnswer } = body

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        throw new Error('sessionId is required and must be a non-empty string')
    }

    if (lastAnswer !== undefined && typeof lastAnswer !== 'string') {
        throw new Error('lastAnswer must be a string')
    }

    return {
        sessionId: sessionId.trim(),
        lastAnswer: lastAnswer || undefined
    }
}

async function nextMockQuestion(req, res, next) {
    try {
        let parsed = null
        try {
            parsed = validateNextMockQuestionInput(req.body)
        } catch {
            try {
                parsed = validateNextMockQuestionInput(req.body?.params || {})
            } catch {
                res.status(400).json({ ok: false, error: 'invalid payload' })
                return
            }
        }
        const { sessionId, lastAnswer } = parsed
        let record = sessionCache.get(sessionId)
        if (!record) record = await fetchSessionFromMain(sessionId)
        if ((record?.type || 'live') !== 'mock') {
            res.status(400).json({ ok: false, error: 'Session is not mock type' })
            return
        }

        // Prefer OpenAI-powered interviewer questions when configured; fallback to simple mock generator
        let question = null
        try {
            const seed = (lastAnswer && lastAnswer.trim())
                ? `User just answered: "${lastAnswer.trim()}". Ask a relevant next interview question.`
                : `Start a mock interview${record.jobDescription ? ' based on the job description' : ''}${record.resume ? ' and resume' : ''}. Ask a strong opening question.`

            // Avoid repeating recently asked mock questions by remembering them in the session cache
            const prev = Array.isArray(record.lastMockQuestions) ? record.lastMockQuestions : []

            // Try to get up to three options and pick the first not in prev
            const options = await claudeService.suggestNextQuestionsFromUtterance(seed, {
                resume: record.resume,
                jobDescription: record.jobDescription,
                additionalContext: record.context,
            })
            const pick = options.find(q => !prev.some(p => p.toLowerCase() === q.toLowerCase())) || options[0]
            question = (pick || '').trim() || null

            // Persist chosen question for dedupe next round
            const updatedPrev = [...prev, question].slice(-10)
            sessionCache.set(sessionId, { ...record, lastMockQuestions: updatedPrev, updatedAt: new Date().toISOString() })
        } catch {
            // Fallback lightweight generator when Claude not configured or errors
            const q = await generateMockInterviewerQuestion({ session: record, lastAnswer: lastAnswer || '' })
            question = q
            sessionCache.set(sessionId, { ...record, updatedAt: new Date().toISOString() })
        }

        res.json({ ok: true, question: question || '' })
    } catch (err) {
        next(err)
    }
}

function validateRegisterSessionInput(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object')
    }

    const raw = body
    const params = (raw && raw.params) || {}

    const sessionId = String(
        raw.sessionId ?? raw.sessionID ?? params.sessionId ?? params.sessionID ?? ''
    ).trim()

    if (!sessionId) {
        throw new Error('sessionId is required')
    }

    const resume = (() => {
        const r = raw.resume ?? raw.resume_textcontent ?? params.resume ?? ''
        return typeof r === 'string' ? r : ''
    })()

    const jobDescription = (() => {
        const jd = raw.jobDescription ?? raw.role ?? params.jobDescription ?? ''
        return typeof jd === 'string' ? jd : ''
    })()

    const additionalContext = (() => {
        const c = raw.additionalContext ?? params.additionalContext ?? ''
        return typeof c === 'string' ? c : ''
    })()

    const type = (() => {
        const t = raw.type ?? params.type
        return t === 'mock' || t === 'coding' || t === 'live' ? t : undefined
    })()

    return {
        sessionId,
        resume,
        jobDescription,
        additionalContext,
        type
    }
}

async function registerSession(req, res, next) {
    try {
        const { sessionId, resume, jobDescription, additionalContext, type } = validateRegisterSessionInput(req.body)

        const prev = sessionCache.get(sessionId)
        const normalized = {
            ...(prev || { sessionId, status: 'active' }),
            sessionId,
            resume,
            jobDescription,
            additionalContext,
            type: type || prev?.type || 'live',
            updatedAt: new Date().toISOString(),
        }
        sessionCache.set(sessionId, normalized)
        claudeService.setDefaultContext({
            resume: normalized.resume,
            jobDescription: normalized.jobDescription,
            additionalContext: normalized.additionalContext,
        })
        console.log('registerSession', { sessionId, len: { resume: resume.length, jobDescription: jobDescription.length, context: additionalContext.length } })
        res.json({ ok: true, data: normalized })
    } catch (err) {
        next(err)
    }
}

module.exports = { getSession, completeSession, nextMockQuestion, registerSession }
