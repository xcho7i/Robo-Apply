import { getSocket } from './backend'

export type DeepgramTranscript = {
    text: string
    isFinal: boolean
}

class DeepgramService {
    isConfigured(): boolean {
        // Backend manages credentials
        return true
    }

    startLiveFromStream(
        stream: MediaStream,
        {
            timesliceMs = 250,
            onTranscript,
            onError,
        }: {
            timesliceMs?: number
            onTranscript: (t: DeepgramTranscript) => void
            onError?: (err: any) => void
        }
    ): () => void {
        const socket = getSocket()

        // Socket debug logs centralized in backend.ts singleton
        try {
            socket.on('deepgram:open', () => console.log('[deepgram] session open'))
            socket.on('deepgram:closed', () => console.log('[deepgram] session closed'))
        } catch { }

        let recorder: MediaRecorder | null = null

        const handleTranscript = (payload: any) => {
            try {
                console.log('[deepgram] transcript', payload?.text, payload?.isFinal)
                onTranscript({ text: String(payload?.text || ''), isFinal: !!payload?.isFinal })
            } catch (err) { console.error(err) }
        }
        const handleError = (e: any) => { onError?.(e) }

        socket.on('deepgram:transcript', handleTranscript)
        socket.on('deepgram:error', (e) => { console.error('[deepgram] error', e); handleError(e) })

        // Backend automatically starts Deepgram on socket connection
        // No need to emit 'deepgram:start' anymore

        const mimeCandidates = [
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'audio/webm;codecs=opus',
            'audio/webm',
        ]
        const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m))
        try {
            recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
        } catch {
            recorder = new MediaRecorder(stream)
        }
        recorder.ondataavailable = async (e) => {
            if (e.data && e.data.size > 0) {
                try {
                    const ab = await e.data.arrayBuffer()
                    socket.emit('deepgram:audio', ab)
                } catch { }
            }
        }
        try { recorder.start(timesliceMs) } catch { try { recorder.start(250) } catch { } }

        return () => {
            try { recorder && recorder.state !== 'inactive' && recorder.stop() } catch { }
            try {
                // No need to emit 'deepgram:stop' - backend keeps session alive
                socket.off('deepgram:transcript', handleTranscript)
                socket.off('deepgram:error', handleError)
            } catch { }
        }
    }
}

export const deepgramService = new DeepgramService()
export default deepgramService