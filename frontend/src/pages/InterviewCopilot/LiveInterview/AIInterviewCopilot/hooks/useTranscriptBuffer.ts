import { useCallback, useRef, useState } from 'react'
import type { TranscriptSegment, SpeakerId } from '../components/LiveTranscript'

interface UpsertArgs {
    speaker: SpeakerId
    text: string
    isFinal: boolean
}

export default function useTranscriptBuffer() {
    const [segments, setSegments] = useState<TranscriptSegment[]>([])

    // Minimal state: finals + interim text per speaker
    const finalRows = useRef<TranscriptSegment[]>([])
    const interimText = useRef<Partial<Record<SpeakerId, string>>>({})
    const scheduled = useRef(false)

    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()

    const flush = () => {
        scheduled.current = false
        // Build display list: all finals + one interim per speaker (if any)
        const rows: TranscriptSegment[] = [...finalRows.current]
        const pushOrUpdateInterim = (speaker: SpeakerId, text: string) => {
            if (!text) return
            const id = `${speaker}-interim`
            const idx = rows.findIndex(r => r.id === id)
            const seg = { id, speaker, text, isFinal: false as const }
            if (idx >= 0) rows[idx] = seg
            else rows.push(seg)
        }

            ; (Object.keys(interimText.current) as SpeakerId[]).forEach(sp => {
                const txt = interimText.current[sp]
                if (typeof txt === 'string') pushOrUpdateInterim(sp, txt)
            })

        // Keep a reasonable cap
        const MAX_ROWS = 300
        if (rows.length > MAX_ROWS) rows.splice(0, rows.length - MAX_ROWS)

        setSegments(rows)
    }

    const scheduleFlush = () => {
        if (scheduled.current) return
        scheduled.current = true
        // Use setTimeout to avoid background-tab rAF throttling
        setTimeout(flush, 0)
    }

    const upsertTranscript = useCallback(({ speaker, text, isFinal }: UpsertArgs) => {
        const incoming = normalize(text)
        const incomingCmp = incoming.toLowerCase()
        if (!incoming) return
        const timestamp = Date.now()

        if (isFinal) {
            // If the last final for this speaker is a prefix/contained, replace it instead of pushing a new row
            const lastIdx = (() => {
                for (let i = finalRows.current.length - 1; i >= 0; i--) {
                    if (finalRows.current[i].speaker === speaker) return i
                }
                return -1
            })()
            if (lastIdx >= 0) {
                const prev = finalRows.current[lastIdx].text
                const prevCmp = prev.toLowerCase()
                if (prev === incoming) {
                    // No change; avoid duplicate updates
                    interimText.current[speaker] = ''
                    scheduleFlush()
                    return
                }
                if (incomingCmp.startsWith(prevCmp) || incomingCmp.includes(prevCmp)) {
                    finalRows.current[lastIdx] = { id: `${speaker}-final-${timestamp}`, speaker, text: incoming, isFinal: true }
                } else if (prevCmp.includes(incomingCmp)) {
                    // keep prev, as it's already more complete
                    finalRows.current[lastIdx] = { id: `${speaker}-final-${timestamp}`, speaker, text: prev, isFinal: true }
                } else {
                    // distinct sentence: append a new row
                    finalRows.current.push({ id: `${speaker}-final-${timestamp}`, speaker, text: incoming, isFinal: true })
                }
            } else {
                finalRows.current.push({ id: `${speaker}-final-${timestamp}`, speaker, text: incoming, isFinal: true })
            }
            interimText.current[speaker] = ''
            // Render finals immediately for snappier UI
            flush()
        } else {
            interimText.current[speaker] = incoming
            scheduleFlush()
        }
    }, [])

    const clear = useCallback(() => {
        interimText.current = {}
        finalRows.current = []
        setSegments([])
    }, [])

    return { segments, upsertTranscript, clear }
}