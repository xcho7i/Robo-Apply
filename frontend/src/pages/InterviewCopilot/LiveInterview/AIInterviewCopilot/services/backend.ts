import API_ENDPOINTS from '@/src/api/endpoints'
import axios from 'axios'
import { io, type Socket } from 'socket.io-client'
import { BASE_URL } from '@/src/api'


export const api = axios.create({
    baseURL: BASE_URL,
})

let socket: Socket | null = null
let debugBound = false

export function getSocket(): Socket {
    if (socket && socket.connected) return socket
    if (!socket) {
        socket = io(BASE_URL, { withCredentials: true, autoConnect: true })
        if (!debugBound) {
            debugBound = true
            try {
                socket.on('connect', () => console.log('[socket] connected', socket?.id))
                socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason))
                socket.on('connect_error', (err) => console.log('[socket] connect_error', err))
            } catch { }
        }
    } else if (!socket.connected) {
        try { socket.connect() } catch { }
    }
    return socket
}

export function getApiBaseUrl(): string {
    return BASE_URL
}

function getOrCreateSessionId(sessionId?: string): string {
    const trimmed = (sessionId || '').trim()
    if (trimmed) return trimmed
    try {
        const KEY = 'mock:sessionId'
        const existing = localStorage.getItem(KEY)
        if (existing && existing.trim()) return existing.trim()
        const generated = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        localStorage.setItem(KEY, generated)
        return generated
    } catch {
        return `mock-${Date.now()}`
    }
}

export async function fetchSession(sessionId: string): Promise<{ sessionId: string; resume: string; jobDescription: string; context: string; specialization?: string; type?: string }> {
    const resp = await api.get(`${API_ENDPOINTS.GetInterviewSessions}/${sessionId}`)
    const data = resp.data?.data || {}
    const specialization = String((data.specialization ?? data.type ?? '') || '')
    return {
        sessionId: String(data.sessionId || ''),
        resume: String(data.resume ?? ''),
        jobDescription: String(data.jobDescription ?? ''),
        context: String(data.context ?? ''),
        specialization,
        type: specialization,
    }
}

export async function fetchMainSession(sessionId: string): Promise<{ sessionId: string; resume: string; jobDescription: string; context: string; type?: string }> {
    const resp = await api.get(`${API_ENDPOINTS.GetInterviewSessions}/${sessionId}`)
    const raw = resp.data?.data || {}
    return {
        sessionId: String(raw.sessionId || ''),
        resume: String(raw.resume_textcontent ?? ''),
        jobDescription: String(raw.job_description ?? ''),
        context: String(raw.context ?? ''),
        type: raw.specialization,
    }
}

// Upsert interview session state to primary API
export async function updateSession(params: {
    sessionId: string
    status?: 'active' | 'completed'
    conversation_history?: "{ role: 'user' | 'interviewer'; content: string }[]"
}) {
    let res = await api.post(API_ENDPOINTS.UpdateInterviewSession, params)
    console.log('updateSession => ', res)
    return res.data
}


export async function getNextMockQuestion(sessionId: string, lastAnswer?: string): Promise<string> {
    const sid = getOrCreateSessionId(sessionId)
    const resp = await api.post(`/api/ai-interview-copilot/session/mock/next-question`, { sessionId: sid, lastAnswer })
    return String(resp.data?.question || '')
}

export async function registerSessionToBackend(payload: { sessionId: string; resume?: string; jobDescription?: string; additionalContext?: string; type?: 'live' | 'mock' | 'coding' }): Promise<void> {
    try {
        const sid = getOrCreateSessionId(payload.sessionId)
        await api.post(`/api/ai-interview-copilot/session/register`, { ...payload, sessionId: sid })
    } catch (error) {
        console.error('Error registering session to backend', error)
    }
}