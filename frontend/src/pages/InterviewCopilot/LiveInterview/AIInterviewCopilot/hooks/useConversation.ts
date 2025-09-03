import { useState, useCallback } from 'react';

export interface ConversationItem {
    id: string;
    type: 'question' | 'response' | 'transcript';
    content: string;
    timestamp: Date;
    isFinalTranscript?: boolean;
}

export const useConversation = () => {
    const [conversations, setConversations] = useState<ConversationItem[]>([]);

    const addQuestion = useCallback((q: string) => {
        setConversations(prev => ([
            ...prev,
            { id: `q-${Date.now()}`, type: 'question', content: q, timestamp: new Date() } as ConversationItem,
        ]));
    }, []);

    const addResponse = useCallback((r: string) => {
        setConversations(prev => ([
            ...prev,
            { id: `r-${Date.now()}`, type: 'response', content: r, timestamp: new Date() } as ConversationItem,
        ]));
    }, []);

    const clearHistory = useCallback(() => {
        setConversations([]);
    }, []);

    const addOrUpdateTranscript = useCallback((text: string, isFinal: boolean) => {
        setConversations(prev => {
            // Update the latest transcript item if it exists and isn't final yet
            for (let i = prev.length - 1; i >= 0; i--) {
                const item = prev[i];
                if (item.type === 'transcript' && !item.isFinalTranscript) {
                    const updated = [...prev];
                    updated[i] = { ...item, content: text, isFinalTranscript: isFinal, timestamp: new Date() };
                    return updated;
                }
            }
            // Otherwise append a new transcript item
            return [
                ...prev,
                {
                    id: `t-${Date.now()}`,
                    type: 'transcript',
                    content: text,
                    timestamp: new Date(),
                    isFinalTranscript: isFinal,
                } as ConversationItem,
            ];
        });
    }, []);

    return {
        conversations,
        addQuestion,
        addResponse,
        addOrUpdateTranscript,
        clearHistory,
    };
};
