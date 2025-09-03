import { api } from './backend'
import { getSocket } from './backend'

class ClaudeService {
    isConfigured(): boolean {
        return true;
    }

    async generateInterviewResponse(
        question: string,
        context?: { resume?: string; jobDescription?: string; additionalContext?: string },
        sessionId?: string,
    ): Promise<string> {
        const resp = await api.post('/api/ai-interview-copilot/claude/generate', { question, context, sessionId });
        const text = resp.data?.text || '';
        if (!text) throw new Error('No response generated from server');
        return text;
    }

    async generateJobDescription(
        jobTitle: string,
        industry?: string,
        companyName?: string,
        experienceLevel?: string,
        keySkills?: string[]
    ): Promise<string> {
        const resp = await api.post('/api/ai-interview-copilot/claude/job-description', { jobTitle, industry, companyName, experienceLevel, keySkills });
        const text = resp.data?.text || '';
        if (!text) throw new Error('No response generated from server');
        return text;
    }

    async detectQuestionAndAnswer(
        utterance: string,
        context?: { resume?: string; jobDescription?: string; additionalContext?: string },
        sessionId?: string,
    ): Promise<{ isQuestion: boolean; question: string | null; answer: string | null }> {
        const resp = await api.post('/api/ai-interview-copilot/claude/detect', { utterance, context, sessionId });
        const { isQuestion, question, answer } = resp.data || {};
        return { isQuestion: !!isQuestion, question: question ?? null, answer: answer ?? null };
    }

    async generateFollowUpQuestions(originalQuestion: string, response: string): Promise<string[]> {
        const meta = `Based on this interview question and response, suggest 2-3 relevant follow-up questions. One per line.`;
        const combined = `${meta}\n\nOriginal Question: ${originalQuestion}\nResponse: ${response}`;
        const text = await this.generateInterviewResponse(combined);
        return text.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    async streamAnswer(params: {
        question: string;
        context?: { resume?: string; jobDescription?: string; additionalContext?: string; verbosity?: 'concise' | 'default' | 'lengthy'; language?: string; temperature?: 'low' | 'default' | 'high'; performance?: 'speed' | 'quality' };
        sessionId?: string;
        onDelta: (delta: string) => void;
        onDone?: () => void;
        onError?: (message: string) => void;
        onSuggestions?: (suggestions: string[]) => void;
    }): Promise<() => void> {
        const socket = getSocket();
        const handleDelta = (d: string) => params.onDelta(d || '');
        const handleDone = () => params.onDone?.();
        const handleError = (e: any) => params.onError?.(e?.message || 'stream error');
        const handleSuggestions = (payload: any) => {
            try {
                const list = Array.isArray(payload) ? payload : (payload?.suggestions || []);
                params.onSuggestions?.(list.map((s: any) => String(s || '')).filter(Boolean).slice(0, 3));
            } catch { }
        };
        socket.on('claude:chat:delta', handleDelta);
        socket.on('claude:chat:done', handleDone);
        socket.on('claude:chat:error', handleError);
        socket.on('claude:chat:suggestions', handleSuggestions);

        // Add connection monitoring
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;

        const handleDisconnect = () => {
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Stream connection lost, attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts}`);
                setTimeout(() => {
                    if (!socket.connected) {
                        socket.connect();
                        // Re-emit the request after reconnection
                        setTimeout(() => {
                            if (socket.connected) {
                                socket.emit('claude:chat:start', { question: params.question, context: params.context, sessionId: params.sessionId });
                            }
                        }, 1000);
                    }
                }, 1000 * reconnectAttempts);
            } else {
                params.onError?.('Connection lost - please try again');
            }
        };

        socket.on('disconnect', handleDisconnect);
        socket.emit('claude:chat:start', { question: params.question, context: params.context, sessionId: params.sessionId });
        return () => {
            try {
                socket.off('claude:chat:delta', handleDelta);
                socket.off('claude:chat:done', handleDone);
                socket.off('claude:chat:error', handleError);
                socket.off('claude:chat:suggestions', handleSuggestions);
                socket.off('disconnect', handleDisconnect);
            } catch { }
        };
    }

    getUsageInfo(): { configured: boolean; model: string; maxTokens: number; source: string } {
        return { configured: true, model: 'server', maxTokens: 0, source: 'backend' };
    }
}

export const claudeService = new ClaudeService();
export default claudeService;


