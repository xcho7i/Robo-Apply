const { Router } = require('express')

// Import controllers
const {
    getSession,
    completeSession,
    nextMockQuestion,
    registerSession
} = require('../controllers/session.controller.js')

const {
    detect: claudeDetect,
    generate: claudeGenerate,
    jobDescription: claudeJobDescription,
} = require('../controllers/claude.controller.js')

const router = Router()

// Session routes
router.get('/session', getSession)
router.post('/session/complete', completeSession)
router.post('/session/mock/next-question', nextMockQuestion)
router.post('/session/register', registerSession)


// Claude routes
router.post('/claude/generate', claudeGenerate)
router.post('/claude/detect', claudeDetect)
router.post('/claude/job-description', claudeJobDescription)

// Health routes
router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'backend', status: 'healthy' })
})

module.exports = router
