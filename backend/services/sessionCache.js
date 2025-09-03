class SessionCache {
    constructor() {
        this.byId = new Map()
    }

    get(sessionId) {
        return this.byId.get(sessionId)
    }

    set(sessionId, data) {
        this.byId.set(sessionId, data)
    }
}

const sessionCache = new SessionCache()

module.exports = { sessionCache }
