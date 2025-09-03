import nlp from 'compromise'

export const QUESTION_PATTERNS = {
    questionWords: ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'whose', "what's", "how's", "why's", "when's", "where's", "who's", "which's", "whose's"],
    modalVerbs: ['can', 'could', 'would', 'should', 'might', 'may', 'must', 'will'],
    questionPhrases: ['do you', 'can you', 'could you', 'would you', 'should you', 'tell me', 'please tell'],
    endsWithQuestion: (text: string) => text.trim().endsWith('?'),
}

const heuristicIsQuestion = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim()
    if (!lowerText) return false
    if (QUESTION_PATTERNS.endsWithQuestion(lowerText)) return true
    const words = lowerText.split(' ')
    if (QUESTION_PATTERNS.questionWords.includes(words[0])) return true
    if (QUESTION_PATTERNS.modalVerbs.includes(words[0])) return true
    if (QUESTION_PATTERNS.questionPhrases.some((p) => lowerText.includes(p))) return true
    try {
        const doc = (nlp as any)(text)
        if (doc && typeof doc.has === 'function') {
            if (doc.has('#Question')) return true
        }
    } catch { }
    return false
}

export const isQuestion = (text: string): boolean => {
    return heuristicIsQuestion(text)
}
