import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
export type SpeakerId = 'me' | 'them'

export interface TranscriptSegment {
    id: string
    speaker: SpeakerId
    text: string
    isFinal: boolean
    startMs?: number
    endMs?: number
}

interface LiveTranscriptProps {
    segments: TranscriptSegment[]
}

function LiveTranscript({ segments }: LiveTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const workerRef = useRef<Worker | null>(null)
    const [rowsFromWorker, setRowsFromWorker] = useState<{ key: string; speaker: SpeakerId; text: string; interim?: string }[] | null>(null)

    // Added: sentence splitting and copy helper
    const splitIntoSentences = (text: string): string[] => {
        const normalized = (text || '').replace(/\s+/g, ' ').trim()
        if (!normalized) return []
        const matches = normalized.match(/[^.!?。？！…।]+[.!?。？！…।]+|[^.!?。？！…।]+$/g)
        return (matches || [normalized]).map(s => s.trim()).filter(Boolean)
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            try {
                const ta = document.createElement('textarea')
                ta.value = text
                ta.style.position = 'fixed'
                ta.style.left = '-9999px'
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            } catch { }
        }
    }

    // Build display rows: all finalized utterances (merged by consecutive speaker), plus one latest interim
    const finalizedRows: { key: string; speaker: SpeakerId; text: string; interim?: string }[] = []
    for (const s of segments) {
        if (!s.isFinal) continue
        const last = finalizedRows[finalizedRows.length - 1]
        const incoming = s.text.replace(/\s+/g, ' ').trim()
        const incomingCmp = incoming.toLowerCase()
        if (last && last.speaker === s.speaker) {
            // Prefer the longer phrase when one contains the other to avoid duplicated tails
            const prev = last.text
            const prevCmp = prev.toLowerCase()
            if (incomingCmp.startsWith(prevCmp) || incomingCmp.includes(prevCmp)) {
                last.text = incoming
            } else if (prevCmp.includes(incomingCmp)) {
                last.text = prev
            } else {
                last.text = `${prev} ${incoming}`.replace(/\s+/g, ' ').trim()
            }
        } else {
            finalizedRows.push({ key: s.id, speaker: s.speaker, text: incoming })
        }
    }

    // Find the most recent interim (if any), prefer mic ('me') so your speech is visible while sharing
    let interimRow: { key: string; speaker: SpeakerId; text: string } | null = null
    // First pass: prefer 'me'
    for (let i = segments.length - 1; i >= 0; i--) {
        const s = segments[i]
        if (!s.isFinal && s.speaker === 'me') {
            interimRow = { key: s.id, speaker: s.speaker, text: s.text }
            break
        }
    }
    // Fallback: any interim
    if (!interimRow) {
        for (let i = segments.length - 1; i >= 0; i--) {
            const s = segments[i]
            if (!s.isFinal) {
                interimRow = { key: s.id, speaker: s.speaker, text: s.text }
                break
            }
        }
    }

    useEffect(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [finalizedRows.length, interimRow?.key, interimRow?.text])

    // Build final display rows, concatenating interim text into the latest row of the same speaker
    const displayRows = useMemo(() => {
        if (rowsFromWorker) return rowsFromWorker
        const rows = finalizedRows.map((r) => ({ ...r }))
        if (interimRow) {
            let idx = -1
            for (let i = rows.length - 1; i >= 0; i--) {
                if (rows[i].speaker === interimRow.speaker) { idx = i; break }
            }
            if (idx >= 0) rows[idx].interim = interimRow.text
            else rows.push({ key: interimRow.key, speaker: interimRow.speaker, text: '', interim: interimRow.text })
        }
        return rows
    }, [rowsFromWorker, finalizedRows.length, interimRow?.key, interimRow?.text])

    useEffect(() => {
        if (!workerRef.current) {
            try {
                workerRef.current = new Worker(new URL('../workers/transcriptWorker.ts', import.meta.url), { type: 'module' })
                workerRef.current.onmessage = (e: MessageEvent) => {
                    if (e.data?.type === 'rows') setRowsFromWorker(e.data.rows)
                }
            } catch {
            }
        }
        try { workerRef.current?.postMessage({ type: 'build', segments }) } catch { }
    }, [segments])

    return (
        <div className="bg-[#2c2c2c] rounded-md shadow-lg border border-gray-700 p-4 h-full overflow-y-auto" ref={scrollRef}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" style={{ color: '#a855f7' }} />
                    Live Transcript
                </h3>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                    <div className="text-xs text-gray-500">
                        Ready
                    </div>
                </div>
            </div>
            {displayRows.length === 0 ? (
                <p className="text-sm text-gray-500">Live transcript will appear here.</p>
            ) : (
                <div className="space-y-2">
                    {displayRows.map((r) => {
                        const isUser = r.speaker === 'me'
                        const sentences = splitIntoSentences(r.text)
                        return (
                            <div key={r.key} className="flex gap-2 items-start">
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white`}
                                    style={{ backgroundColor: isUser ? '#2563eb' : '#16a34a' }}>
                                    {isUser ? 'You' : 'Other'}
                                </span>
                                <div className="text-sm text-gray-200 flex flex-row flex-wrap">
                                    {sentences.map((s, idx) => (
                                        <button
                                            key={`${r.key}-s-${idx}`}
                                            onClick={() => copyToClipboard(s)}
                                            title="Click to copy"
                                            className="cursor-pointer text-left hover:bg-[#3a3a3a] active:bg-[#4a4a4a] rounded px-1"
                                            style={{ lineHeight: '1.5' }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                    {r.interim ? <span className="italic text-gray-400"> {r.interim}</span> : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
};

export default React.memo(LiveTranscript)