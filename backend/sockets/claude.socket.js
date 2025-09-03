const { claudeService } = require('../services/claude.service.js')
const { randomUUID } = require('node:crypto')
const { chatMemory } = require('./chatMemory.js')
const { sessionCache } = require('../services/sessionCache.js')

function registerClaudeSocket(io) {
    io.on('connection', (socket) => {
        let summary = ''

        const getHistory = () => chatMemory.getRecent(socket.id, 12)
        const getAllHistory = () => chatMemory.getAll(socket.id)

        const append = (entry) => {
            try {
                if (entry.type === 'them') {
                    chatMemory.appendUser(socket.id, entry.text)
                }
            } catch { }
        }

        socket.on('claude:detect:utterance', async (payload) => {
            try {
                const { utterance, context, source, sessionId } = payload || {}
                if (!utterance) return
                append({ type: 'them', text: utterance })
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
                const result = await claudeService.detectQuestionAndAnswer(utterance, context)
                if (result.isQuestion && result.question) {
                    const detectedId = randomUUID()
                    socket.emit('detect:question', { id: detectedId, question: result.question, source: source || 'typed' })
                }
            } catch (err) {
                socket.emit('detect:error', { message: err?.message || 'detect error' })
            }
        })

        socket.on('claude:chat:start', async (payload) => {
            try {
                const { question, context, sessionId } = payload || {}
                chatMemory.appendUser(socket.id, question)
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

                const perf = (context && context.performance) || 'quality'
                if (perf !== 'speed') {
                    ; (async () => {
                        try {
                            const SUMMARIZE_AFTER = 30
                            const RECENT_KEEP = 10
                            if (getAllHistory().length >= SUMMARIZE_AFTER) {
                                const newSummary = await claudeService.generateInterviewResponse(
                                    `Summarize the conversation so far in <=1800 characters as compact bullet-like sentences without bullets.\nPrev:\n${summary}\n\nTranscript:\n${getAllHistory().map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'User'}: ${h.content}`).join('\n')}`,
                                    context
                                )
                                if (typeof newSummary === 'string' && newSummary.trim()) {
                                    summary = newSummary.trim()
                                    chatMemory.pruneRecent(socket.id, RECENT_KEEP)
                                }
                            }
                        } catch { }
                    })()

                        ; (async () => {
                            try {
                                const suggestions = await claudeService.suggestFollowUpQuestions(question, context)
                                if (suggestions.length) {
                                    append({ type: 'suggestions', data: suggestions })
                                    socket.emit('claude:chat:suggestions', suggestions)
                                }
                            } catch { }
                        })()
                }

                // Add timeout protection and buffer management for streaming
                let lastActivity = Date.now()
                const streamTimeout = setTimeout(() => {
                    if (!socket.disconnected) {
                        socket.emit('claude:chat:delta', '\n\n[Response timed out - please try again]')
                        socket.emit('claude:chat:done')
                    }
                }, 180000) // 3 minute timeout (increased)

                // Buffer to accumulate content for potential recovery
                let accumulatedContent = ''
                let isStreamComplete = false

                try {
                    let hasEmitted = false
                    for await (const delta of claudeService.streamChat(question, context, getHistory(), summary)) {
                        lastActivity = Date.now()
                        clearTimeout(streamTimeout)

                        hasEmitted = true
                        accumulatedContent += delta

                        if (socket.disconnected) {
                            console.log('Socket disconnected during streaming, accumulated content length:', accumulatedContent.length)
                            break
                        }

                        socket.emit('claude:chat:delta', delta)

                        // Reset activity timeout
                        setTimeout(() => {
                            if (!socket.disconnected && !isStreamComplete) {
                                socket.emit('claude:chat:delta', '\n\n[Stream appears stalled - please try again]')
                                socket.emit('claude:chat:done')
                            }
                        }, 45000) // 45 second activity timeout
                    }

                    clearTimeout(streamTimeout)
                    isStreamComplete = true

                    if (hasEmitted && !socket.disconnected) {
                        socket.emit('claude:chat:done')
                    }

                    console.log('Streaming completed successfully, total length:', accumulatedContent.length)

                } catch (streamErr) {
                    clearTimeout(streamTimeout)
                    isStreamComplete = true
                    console.error({ err: streamErr }, 'Streaming error')

                    if (!socket.disconnected) {
                        // Try to send any accumulated content before error
                        if (accumulatedContent) {
                            socket.emit('claude:chat:delta', '\n\n[Stream interrupted but partial response preserved above]')
                        } else {
                            socket.emit('claude:chat:delta', '\n\n[Streaming error occurred]')
                        }
                        socket.emit('claude:chat:done')
                    }
                }
            } catch (err) {
                socket.emit('claude:chat:error', { message: err?.message || 'stream error' })
            }
        })

        socket.on('disconnect', () => {
            try { chatMemory.clear(socket.id) } catch { }
        })
    })
}

module.exports = { registerClaudeSocket }
