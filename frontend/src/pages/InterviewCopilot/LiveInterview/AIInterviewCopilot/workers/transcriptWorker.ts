// Minimal worker to merge finalized segments and one interim
// Message format:
// { type: 'build', segments: Array<{ id: string; speaker: 'me'|'them'; text: string; isFinal: boolean }> }

self.onmessage = (e: MessageEvent) => {
    const data = e.data as any
    if (!data || data.type !== 'build') return
    const segments = Array.isArray(data.segments) ? data.segments : []

    const finalizedRows: { key: string; speaker: 'me' | 'them'; text: string }[] = []
    for (const s of segments) {
        if (!s.isFinal) continue
        const last = finalizedRows[finalizedRows.length - 1]
        const incoming = String(s.text || '').replace(/\s+/g, ' ').trim()
        const incomingCmp = incoming.toLowerCase()
        if (last && last.speaker === s.speaker) {
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

    // Latest interim (prefer 'me')
    let interim: { key: string; speaker: 'me' | 'them'; text: string } | null = null
    for (let i = segments.length - 1; i >= 0; i--) {
        const s = segments[i]
        if (!s.isFinal && s.speaker === 'me') { interim = { key: s.id, speaker: s.speaker, text: s.text }; break }
    }
    if (!interim) {
        for (let i = segments.length - 1; i >= 0; i--) {
            const s = segments[i]
            if (!s.isFinal) { interim = { key: s.id, speaker: s.speaker, text: s.text }; break }
        }
    }

    const rows = finalizedRows.map(r => ({ ...r })) as any[]
    if (interim) {
        let idx = -1
        for (let i = rows.length - 1; i >= 0; i--) {
            if (rows[i].speaker === interim.speaker) { idx = i; break }
        }
        if (idx >= 0) rows[idx].interim = interim.text
        else rows.push({ key: interim.key, speaker: interim.speaker, text: '', interim: interim.text })
    }

    ; (self as any).postMessage({ type: 'rows', rows })
}


