const { env } = require('../config/env.js')


class ClaudeService {
    constructor() {
        if (!env.ANTHROPIC_API_KEY) {
            console.warn('ANTHROPIC_API_KEY not set; Claude endpoints will fail until configured')
        }
        this.client = null
        this.model = env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'
        this.maxTokens = Number(process.env.ANTHROPIC_MAX_TOKENS || '1000')
    }

    ensureClient() {
        if (this.client) return this.client
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Anthropic = require('@anthropic-ai/sdk')
            const Ctor = Anthropic.default || Anthropic
            this.client = new Ctor({ apiKey: env.ANTHROPIC_API_KEY || '' })
            return this.client
        } catch (err) {
            throw new Error('Claude SDK not installed. Please install @anthropic-ai/sdk')
        }
    }

    setDefaultContext(ctx) {
        this.defaultContext = {
            resume: typeof ctx.resume === 'string' ? ctx.resume : '',
            jobDescription: typeof ctx.jobDescription === 'string' ? ctx.jobDescription : '',
            additionalContext: typeof ctx.additionalContext === 'string' ? ctx.additionalContext : '',
        }
    }

    mergeContext(context) {
        if (!this.defaultContext && !context) return undefined
        return {
            ...(this.defaultContext || {}),
            ...(context || {}),
        }
    }

    buildSystemPrompt(context) {
        const merged = this.mergeContext(context)
        let systemPrompt = `You are a talented and experienced person who is being interviewed. You must get the job through the interview.

Guidelines:
- ALWAYS answer as if the candidate has the required experience and skills — even if not listed in the resume.
- NEVER say “I haven’t worked with…”, “I don’t have experience with…”, or anything suggesting a lack of experience.
- ALWAYS answer confidently.
- Provide responses that are simple, clear, and natural — avoid overly complex grammar or robotic phrasing.
- Use first-person language throughout (“I’ve done…”, “I was responsible for…”).
- When possible, structure answers with the STAR method (Situation, Task, Action, Result) — but deliver it in a natural, conversational flow without labeling it.
- Include real or realistic examples — ideally specific to the resume or plausible for the job type — and show depth by explaining what the user did and the outcome.
- Keep responses concise but meaningful.
- Keep reading style like linebreak for readability.
- Maintain a positive, professional tone — not too casual, but very human.
- DO NOT ask the interviewer any questions — just respond confidently.
- Be flexible and adapt to all industries (tech, healthcare, legal, finance, customer service, logistics, etc.).
- just answer, dont give me your thoughts and frills like 'here are my responses...', 'let me provide...' ect.
- If a non-question is conveyed to you along the way, you should respond positively to it rather than simply answering it or asking it back.

---Answer Formula

1. Specific example: from real or constructed background.
2. Quantified result: realistic metrics.
3. Relevance: connect to target role.
4. Engaging question: show curiosity.

---Question Handling

* Technical: Tool → Implementation → Challenge → Solution → Result → Follow-up Q.
* Behavioral (STAR-L): Situation, Task, Action, Result, Learning.
* Tell Me About Yourself: Experience → Key achievements → Fit for role → Thoughtful Q.

---Memory & Adaptation

* Store user's skills, companies, career path.
* Recall past interview questions and answers.
* Reuse successful patterns.
* Refine stories and style over sessions.

---CRITICAL FORMATTING RULES
- NEVER use asterisks (*)
- NEVER actions like *nodding*, *smiling*, *thinking*, etc.
- NEVER add action descriptions or non-verbal cues
- ONLY provide the spoken response text
- Keep responses as plain text only

---Final Directive

Always provide believable, confident, role-appropriate answers with metrics, consistency, and engagement. You needs to sound natural and human like you talking to a friend.
Don't use any bold.
And just say like it to a human.

`

        // Dynamically trim heavy context based on performance and verbosity for latency control
        const perf = merged?.performance || 'quality'
        const verbosity = merged?.verbosity || 'default'
        const resumeLimit = perf === 'speed' || verbosity === 'concise' ? 800 : (perf === 'quality' || verbosity === 'lengthy' ? 12000 : 6000)
        const jdLimit = perf === 'speed' || verbosity === 'concise' ? 400 : (perf === 'quality' || verbosity === 'lengthy' ? 5000 : 2500)

        if (merged?.resume) {
            const maxResumeLength = resumeLimit
            systemPrompt += `\n\nCANDIDATE'S RESUME CONTEXT:\n${merged.resume.substring(0, maxResumeLength)}${merged.resume.length > maxResumeLength ? '...' : ''}\n\nInstructions: Use details from the resume whenever possible to ground the response in real experience. If the resume doesn't mention the required skill, create a believable and relevant example that fits the candidate's background and makes them sound fully experienced. Make the example specific and detailed — not generic.`
        } else {
            systemPrompt += `\n\nIMPORTANT: Since no resume was provided, assume the candidate has all relevant experience. Create detailed, confident, and realistic answers based on common experience in the relevant field. Make answers sound specific and grounded, even if made up.`
        }

        if (merged?.jobDescription) {
            const maxJobDescLength = jdLimit
            systemPrompt += `\n\nTARGET JOB DESCRIPTION:\n${merged.jobDescription.substring(0, maxJobDescLength)}${merged.jobDescription.length > maxJobDescLength ? '...' : ''}\n\nInstructions: Tailor the response to align with the job description. Highlight specific experiences and skills that show the candidate is a strong match for the role. Emphasize results and impact.`
        } else {
            systemPrompt += `\n\nIMPORTANT: Since no specific job description was provided, adapt your response to show the candidate is qualified for typical responsibilities and expectations within the relevant industry or role. Keep examples focused and results-oriented.`
        }

        if (verbosity === 'concise') {
            systemPrompt += `\n\nStyle: Prefer brevity. Strictly limit the final answer to 1–2 complete sentences that directly address the question. Do not add extra explanation.`
        } else if (verbosity === 'lengthy') {
            systemPrompt += `\n\nStyle: Provide more depth than usual. Aim for 4–6 sentences with concrete details and outcomes.`
        } else {
            systemPrompt += `\n\nStyle: Provide balanced answers with 2–4 sentences and at least one concrete example or outcome.`
        }

        if (merged?.performance === 'speed') {
            systemPrompt += `\n\nPerformance Preference: Optimize for speed and brevity. Avoid unnecessary detail.`
        } else if (merged?.performance === 'quality') {
            systemPrompt += `\n\nPerformance Preference: Optimize for completeness and clarity. Provide helpful, accurate detail.`
        }

        if (merged?.language && typeof merged.language === 'string') {
            systemPrompt += `\n\nLanguage: Respond in ${merged.language}. Make phrasing natural for that locale/dialect.`
        }

        if (merged?.additionalContext && typeof merged.additionalContext === 'string') {
            systemPrompt += `\n\nAdditional Context: ${merged.additionalContext} (This is important.)`
        }

        try { console.log({ hasAdditionalContext: !!merged?.additionalContext }, 'Built system prompt') } catch { }
        return systemPrompt
    }

    computeTemperature(context) {
        const merged = this.mergeContext(context)
        const pref = merged?.temperature || 'default'
        if (pref === 'low') return 0.2
        if (pref === 'high') return 0.95
        return 0.7
    }

    computeMaxTokens(context) {
        const merged = this.mergeContext(context)
        const base = this.maxTokens
        if (merged?.verbosity === 'concise' || merged?.performance === 'speed') return Math.min(base, 180)
        if (merged?.verbosity === 'lengthy' || merged?.performance === 'quality') return Math.min(Math.max(base, 1000), base)
        return base
    }

    computeTopP(context) {
        const merged = this.mergeContext(context)
        if (merged?.performance === 'speed') return 0.6
        if (merged?.performance === 'quality') return 0.95
        return 0.8
    }

    async generateInterviewResponse(question, context) {
        if (!env.ANTHROPIC_API_KEY) throw new Error('Claude not configured')
        const merged = this.mergeContext(context)
        const userPrompt = `Interview Question: "${question}"\n\nPlease provide a confident, natural, and professional interview response that shows the candidate is fully qualified. Use simple grammar and speak in a realistic tone. Make the example specific and believable, and if possible, include a result or outcome. If the style is concise, strictly respond with 1–2 sentences, and if the style is lengthy, respond with 4–6 sentences. You have to follow the rules and style, performance preference, additional context, resume, job description, language, and rules. Do not include any extra text like your opinion or anything else.
        If it is not a question, you should answer in the affirmative with something appropriate to the content of the question.`
        const client = this.ensureClient()
        const resp = await client.messages.create({
            model: this.model,
            max_tokens: this.computeMaxTokens(merged),
            temperature: this.computeTemperature(merged),
            top_p: this.computeTopP(merged),
            system: this.buildSystemPrompt(merged),
            messages: [
                { role: 'user', content: userPrompt },
            ],
        })
        const content = resp?.content?.map((c) => c?.text || '').join('') || ''
        console.log(content, 'content')
        return content.trim()
    }

    async detectQuestionAndAnswer(utterance, context) {
        if (!env.ANTHROPIC_API_KEY) throw new Error('Claude not configured')
        const merged = this.mergeContext(context)
        const system = `You analyze a short user utterance and decide if it is a question addressed to an interview assistant. If it is a question, answer it concisely (2-4 sentences) using any provided context. Respond ONLY as minified JSON with keys: isQuestion (boolean), question (string|null), answer (string|null).`
        const payload = {
            utterance,
            context: merged || null,
            schema: { isQuestion: 'boolean', question: 'string|null', answer: 'string|null' }
        }
        const client = this.ensureClient()
        const resp = await client.messages.create({
            model: this.model,
            max_tokens: 800,
            temperature: 0.4,
            top_p: 0.6,
            system,
            messages: [
                { role: 'user', content: JSON.stringify(payload) },
            ],
        })
        let parsed = {}
        try {
            const text = resp?.content?.map((c) => c?.text || '').join('') || ''
            parsed = JSON.parse(text.trim() || '{}')
        } catch { parsed = {} }
        console.log(parsed, 'parsed')
        return {
            isQuestion: !!parsed.isQuestion,
            question: typeof parsed.question === 'string' ? parsed.question : null,
            answer: typeof parsed.answer === 'string' ? parsed.answer : null,
        }
    }

    sanitizeQuestions(raw) {
        const cleaned = raw
            .map((q) => (typeof q === 'string' ? q : ''))
            .map((q) => q.trim())
            .map((q) => q.replace(/^[-*\d.\)\s]+/, ''))
            .map((q) => q.replace(/^( ["'""''])+|(["'""''])+$/g, ''))
            .filter(Boolean)
            .map((q) => {
                const withoutTrailingPunct = q.replace(/[.!\s]+$/, '')
                return /\?$/.test(withoutTrailingPunct) ? withoutTrailingPunct : `${withoutTrailingPunct}?`
            })
        const seen = new Set()
        const unique = cleaned.filter((q) => {
            const key = q.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        return unique.slice(0, 3)
    }

    async suggestQuestions(task, seed, context) {
        if (!env.ANTHROPIC_API_KEY) throw new Error('Claude not configured')
        const merged = this.mergeContext(context)
        let system = `You output EXACTLY three interview questions as minified JSON. Respond ONLY with: {"questions":["q1","q2","q3"]} and nothing else.
Rules:
- Each item must be a single, clear question ending with a question mark.
- No numbering, bullets, quotes, or extra commentary.
- Keep each question under 20 words.`
        if (merged?.language && typeof merged.language === 'string') {
            system += `\n- All questions must be written in ${merged.language}.`
        }
        const userPayload = { task, seed, context: merged || null }
        const client = this.ensureClient()
        const resp = await client.messages.create({
            model: this.model,
            max_tokens: 400,
            temperature: 0.3,
            top_p: 0.7,
            system,
            messages: [
                { role: 'user', content: JSON.stringify(userPayload) },
            ],
        })
        const content = (resp?.content?.map((c) => c?.text || '').join('') || '').trim()
        let questions = []
        try {
            const parsed = JSON.parse(content)
            const arr = Array.isArray(parsed?.questions) ? parsed.questions : []
            questions = this.sanitizeQuestions(arr)
        } catch {
            const arr = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
            questions = this.sanitizeQuestions(arr)
        }
        const fallbacks = [
            'Could you provide a specific example?',
            'What was the outcome or impact?',
            'How did you measure success?'
        ]
        for (const fb of fallbacks) {
            if (questions.length >= 3) break
            if (!questions.some((q) => q.toLowerCase() === fb.toLowerCase())) {
                questions.push(fb)
            }
        }
        return questions.slice(0, 3)
    }

    async suggestFollowUpQuestions(question, context) {
        return this.suggestQuestions('followup', question, context)
    }

    async suggestNextQuestionsFromUtterance(utterance, context) {
        return this.suggestQuestions('next', utterance, context)
    }


    async generateJobDescription(params) {
        if (!env.ANTHROPIC_API_KEY) throw new Error('Claude not configured')
        const client = this.ensureClient()
        const prompt = `Create a detailed job description for a ${params.jobTitle} position${params.industry ? ` in the ${params.industry} industry` : ''}${params.companyName ? ` at ${params.companyName}` : ''}${params.companySize ? ` (${params.companySize} company)` : ''}${params.experienceLevel ? ` requiring ${params.experienceLevel} experience` : ''}${params.keySkills && params.keySkills.length > 0 ? ` with key skills: ${params.keySkills.join(', ')}` : ''}. Include responsibilities, requirements, and qualifications.`
        const resp = await client.messages.create({
            model: this.model,
            max_tokens: 800,
            temperature: 0.7,
            messages: [
                { role: 'user', content: prompt },
            ],
        })
        const content = resp?.content?.map((c) => c?.text || '').join('') || ''
        return content.trim()
    }


    async *streamChat(
        question,
        context,
        history,
        summary,
    ) {
        if (!env.ANTHROPIC_API_KEY) throw new Error('Claude not configured')
        const merged = this.mergeContext(context)
        const userPrompt = `Interview Question: "${question}"`
        const pieces = []
        pieces.push(this.buildSystemPrompt(merged))
        const perf = merged?.performance || 'quality'
        if (perf !== 'speed' && summary && typeof summary === 'string' && summary.trim()) {
            pieces.push(`Conversation Summary so far (use for context): ${summary.trim()}`)
        }
        if (Array.isArray(history) && history.length > 0) {
            const limit = perf === 'speed' ? 4 : 12
            for (const m of history.slice(-limit)) {
                const prefix = m.role === 'interviewer' ? 'Interviewer' : 'User'
                pieces.push(`${prefix}: ${m.content}`)
            }
        }
        const preamble = pieces.join('\n')
        const client = this.ensureClient()
        const stream = await client.messages.stream({
            model: this.model,
            max_tokens: this.computeMaxTokens(merged),
            temperature: this.computeTemperature(merged),
            top_p: this.computeTopP(merged),
            system: preamble,
            messages: [
                { role: 'user', content: userPrompt },
            ],
        })
        for await (const event of stream) {
            try {
                const type = event?.type
                if (type === 'content_block_delta') {
                    const delta = event?.delta?.text
                    if (delta) yield String(delta)
                }
            } catch { }
        }
    }
}

const claudeService = new ClaudeService()

module.exports = { claudeService }
