const store = new Map()

const ensure = (socketId) => {
    let rec = store.get(socketId)
    if (!rec) {
        rec = { history: [], summary: '' }
        store.set(socketId, rec)
    }
    return rec
}

const chatMemory = {
    appendUser(socketId, text) {
        const t = String(text || '').trim()
        if (!t) return
        const rec = ensure(socketId)
        const last = rec.history[rec.history.length - 1]
        if (last && last.role === 'user' && last.content === t) return
        rec.history.push({ role: 'user', content: t })
        // Hard cap to avoid unbounded growth; summarization will keep it useful
        if (rec.history.length > 1000) rec.history = rec.history.slice(-1000)
    },
    appendInterviewer(socketId, text) {
        const t = String(text || '').trim()
        if (!t) return
        const rec = ensure(socketId)
        const last = rec.history[rec.history.length - 1]
        if (last && last.role === 'interviewer' && last.content === t) return
        rec.history.push({ role: 'interviewer', content: t })
        if (rec.history.length > 1000) rec.history = rec.history.slice(-1000)
    },
    getRecent(socketId, n = 12) {
        const rec = ensure(socketId)
        return rec.history.slice(-n)
    },
    getAll(socketId) {
        const rec = ensure(socketId)
        return rec.history.slice()
    },
    pruneRecent(socketId, keep) {
        const rec = ensure(socketId)
        if (keep <= 0) { rec.history = []; return }
        if (rec.history.length > keep) rec.history = rec.history.slice(-keep)
    },
    getSummary(socketId) {
        const rec = ensure(socketId)
        return rec.summary
    },
    setSummary(socketId, s) {
        const rec = ensure(socketId)
        rec.summary = String(s || '').trim()
    },
    clear(socketId) {
        store.delete(socketId)
    },
}

module.exports = { chatMemory }
module.exports.default = chatMemory
