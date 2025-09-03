const { createClient, LiveClient, LiveTranscriptionEvents } = require('@deepgram/sdk')
const { env } = require('../config/env.js')

const { claudeService } = require('../services/claude.service.js')
const { chatMemory } = require('./chatMemory.js')
const { randomUUID } = require('node:crypto')



const reconnectState = new Map()

function scheduleDeepgramReconnect(socket, sessions) {
    try {
        if (!socket.connected) return

        const state = reconnectState.get(socket.id) || { attempts: 0, timer: null }
        if (state.timer) return

        state.attempts += 1
        const base = 1000
        const max = 10000
        const jitterPct = 0.25
        const expDelay = Math.min(base * Math.pow(2, state.attempts - 1), max)
        const jitter = 1 + (Math.random() * 2 - 1) * jitterPct // 0.75 - 1.25
        const delay = Math.floor(expDelay * jitter)

        console.log({ socketId: socket.id, attempt: state.attempts, delay }, 'Scheduling Deepgram reconnect')

        state.timer = setTimeout(() => {
            state.timer = null
            try {
                if (!socket.connected) return
                const newSession = createDeepgramSession(socket, sessions)
                if (newSession) {
                    sessions.set(socket.id, newSession)
                    reconnectState.delete(socket.id)
                    console.log({ socketId: socket.id }, 'Deepgram reconnected')
                } else {
                    // Retry again with increased backoff
                    reconnectState.set(socket.id, state)
                    scheduleDeepgramReconnect(socket, sessions)
                }
            } catch (err) {
                console.error({ err, socketId: socket.id }, 'Deepgram reconnect attempt failed unexpectedly')
                reconnectState.set(socket.id, state)
                scheduleDeepgramReconnect(socket, sessions)
            }
        }, delay)

        reconnectState.set(socket.id, state)
    } catch (err) {
        console.error({ err, socketId: socket.id }, 'Failed to schedule Deepgram reconnect')
    }
}

function coerceToArrayBuffer(data) {
    try {
        if (!data) {
            console.warn('Data is null or undefined')
            return null
        }

        if (Buffer.isBuffer(data)) {
            const buf = data
            const result = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
            return result
        }

        if (data instanceof ArrayBuffer) {
            return data
        }

        if (ArrayBuffer.isView(data)) {
            const view = data
            const result = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)
            return result
        }

        if (typeof data === 'string') {
            // assume base64 string
            console.log({ stringLength: data.length }, 'Converting base64 string to ArrayBuffer')
            const buf = Buffer.from(data, 'base64')
            const result = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
            return result
        }

        console.warn({ dataType: typeof data }, 'Unknown data type, cannot convert to ArrayBuffer')
        return null
    } catch (err) {
        console.error({ err, dataType: typeof data }, 'Error coercing data to ArrayBuffer')
        return null
    }
}

function createDeepgramSession(socket, sessions) {
    try {
        if (!env.DEEPGRAM_API_KEY) {
            socket.emit('deepgram:error', { message: 'Deepgram not configured' })
            return null
        }

        const dg = createClient(env.DEEPGRAM_API_KEY)
        const live = dg.listen.live({
            model: env.DEEPGRAM_MODEL,
            interim_results: true,
            punctuate: true,
            smart_format: true,
            endpointing: env.DEEPGRAM_ENDPOINTING,
        })

        const session = { live }

        // Basic event wiring (no internal reconnection/keepalive/heartbeat logic)
        live.on(LiveTranscriptionEvents.Open, () => {
            console.log({ socketId: socket.id }, 'Deepgram session opened')
            try { reconnectState.delete(socket.id) } catch { }
            try { socket.emit('deepgram:open') } catch { }
        })

        live.on(LiveTranscriptionEvents.Transcript, async (evt) => {
            try {
                const alternative = evt?.channel?.alternatives?.[0]
                const text = alternative?.transcript || ''
                const isFinal = !!evt?.is_final

                if (!text) {
                    console.warn({ socketId: socket.id }, 'Empty transcript received from Deepgram')
                    return
                }

                socket.emit('deepgram:transcript', { text, isFinal })
                if (!isFinal) return

                try {
                    // Record interviewer utterance as part of chat memory
                    chatMemory.appendInterviewer(socket.id, text)
                    const detection = await claudeService.detectQuestionAndAnswer(text)
                    if (detection.isQuestion && detection.question) {
                        const id = randomUUID()
                        socket.emit('detect:question', { id, question: detection.question, source: 'speech' })
                    }
                    // Emit proactive suggestions from final segment
                    try {
                        const suggestions = await claudeService.suggestNextQuestionsFromUtterance(text)
                        if (suggestions.length) {
                            socket.emit('claude:chat:suggestions', suggestions)
                        }
                    } catch { }
                } catch (err) {
                    console.warn({ err }, 'claude detect failed for deepgram transcript')
                }
            } catch (err) {
                console.error({ err }, 'deepgram transcript handler error')
            }
        })

        live.on(LiveTranscriptionEvents.Error, (err) => {
            console.error({ err, socketId: socket.id }, 'Deepgram error')
            try { socket.emit('deepgram:error', { message: err?.message || 'Deepgram error' }) } catch { }
            try { sessions.delete(socket.id) } catch { }
            scheduleDeepgramReconnect(socket, sessions)
        })

        live.on(LiveTranscriptionEvents.Close, () => {
            console.log({ socketId: socket.id }, 'Deepgram session closed')
            try { socket.emit('deepgram:closed') } catch { }
            try { sessions.delete(socket.id) } catch { }
            if (socket.connected) {
                scheduleDeepgramReconnect(socket, sessions)
            }
        })

        return session
    } catch (err) {
        console.error({ err, socketId: socket.id }, 'Failed to create Deepgram session')
        socket.emit('deepgram:error', { message: err?.message || 'failed to start deepgram' })
        return null
    }
}

function registerDeepgramSocket(io) {
    const sessions = new Map()

    io.on('connection', (socket) => {
        // Start Deepgram when socket connects
        const session = createDeepgramSession(socket, sessions)
        if (session) {
            sessions.set(socket.id, session)
        }

        // Handle incoming audio chunks
        socket.on('deepgram:audio', (chunk) => {
            const sess = sessions.get(socket.id)
            if (!sess) {
                console.log({ socketId: socket.id, hasSession: !!sess }, 'Ignoring audio chunk - no session')
                return
            }

            try {
                const ab = coerceToArrayBuffer(chunk)
                if (ab && ab.byteLength > 0) {
                    sess.live.send(ab)
                } else {
                    console.warn({
                        socketId: socket.id,
                        chunkType: typeof chunk,
                        abExists: !!ab,
                        abByteLength: ab?.byteLength
                    }, 'Invalid audio chunk - empty or null')
                }
            } catch (err) {
                console.error({ err, socketId: socket.id, chunkType: typeof chunk }, 'Failed to send audio chunk to Deepgram')
            }
        })

        // Handle disconnect - clean up session
        socket.on('disconnect', () => {
            const sess = sessions.get(socket.id)
            if (sess) {
                console.log({ socketId: socket.id }, 'Socket disconnected, cleaning up Deepgram session')
                try { sess.live.finish?.() } catch (err) { console.log({ err }, 'Error finishing Deepgram session') }
                sessions.delete(socket.id)
            }
            const state = reconnectState.get(socket.id)
            if (state?.timer) {
                try { clearTimeout(state.timer) } catch { }
            }
            reconnectState.delete(socket.id)
        })
    })
}


module.exports = { registerDeepgramSocket }


