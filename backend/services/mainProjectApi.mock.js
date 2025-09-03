// Replace with real API later. For now, fabricate predictable data.
async function fetchSessionFromMain(sessionId) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 50))
    // Mocked payload. Upstream will supply these fields; keep empty strings when not provided.
    return {
        sessionId,
        userId: 'mock-user',
        status: 'active',
        resume: '',
        jobDescription: '',
        additionalContext: '',
        type: 'mock',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

async function completeSessionOnMain(sessionId, data) {
    // Mock: pretend to send to main backend and succeed
    await new Promise((r) => setTimeout(r, 50))
}

async function generateMockInterviewerQuestion(params) {
    // Very simple mock logic: tailor based on jobDescription or resume keywords
    const jd = (params.session.jobDescription || '').toLowerCase()
    const ctx = (params.session.context || '').toLowerCase()
    const resume = (params.session.resume || '').toLowerCase()
    const pool = []
    if (/react|frontend|typescript/.test(jd + resume + ctx)) {
        pool.push(
            'Can you explain how you manage state in large React applications?',
            'Tell me about a challenging performance issue you solved in a React app.',
            'How do you structure a scalable component architecture in React?',
        )
    }
    if (/node|backend|api|express/.test(jd + resume + ctx)) {
        pool.push(
            'Describe how you design and secure REST APIs in Node.js.',
            'Tell me about a time you optimized a slow backend endpoint.',
            'How do you structure logging and monitoring for production services?'
        )
    }
    if (pool.length === 0) {
        pool.push(
            'Tell me about a time you faced a tough problem at work and how you solved it.',
            'What accomplishment are you most proud of, and why?',
            'How do you prioritize tasks when deadlines are tight?'
        )
    }
    return pool[Math.floor(Math.random() * pool.length)]
}

module.exports = { fetchSessionFromMain, completeSessionOnMain, generateMockInterviewerQuestion }
