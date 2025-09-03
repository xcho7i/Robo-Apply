import { MessageCircle, Clock, HelpCircle, Bot } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

interface ConversationItem {
    id: string;
    type: 'transcript' | 'question' | 'response';
    content: string;
    timestamp: Date;
    isFinalTranscript?: boolean;
}

interface ConversationHistoryProps {
    conversations: ConversationItem[];
    onClearHistory: () => void;
}

function ConversationHistory({ conversations, onClearHistory }: ConversationHistoryProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [conversations]);

    const visibleItems = conversations;

    const items = useMemo(() => {
        return visibleItems.map((item) => (
            <div
                key={item.id}
                className={`flex gap-3 p-3 rounded-lg transition-all hover:shadow-sm bg-[#404040] border-l-4`}
                style={{ borderLeftColor: item.type === 'question' ? '#3b82f6' : item.type === 'response' ? '#a855f7' : '#eab308', borderLeftWidth: 4 }}
            >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white`}
                    style={{ backgroundColor: item.type === 'question' ? '#3b82f6' : item.type === 'response' ? '#a855f7' : '#eab308' }}>
                    {item.type === 'question' ? <HelpCircle className="h-4 w-4" /> : item.type === 'response' ? <Bot className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium`}
                            style={{ color: item.type === 'question' ? '#60a5fa' : item.type === 'response' ? '#c084fc' : '#ca8a04' }}>
                            {item.type === 'question' ? 'Question' : item.type === 'response' ? 'GPT Response' : 'Live Transcript'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(item.timestamp)}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed break-words">
                        {item.content}
                        {item.type === 'transcript' && !item.isFinalTranscript && (
                            <span className="ml-2 text-xs" style={{ color: '#eab308' }}>(listening...)</span>
                        )}
                    </p>
                </div>
            </div>
        ));
    }, [visibleItems]);

    return (
        <div className="bg-[#2c2c2c] rounded-md shadow-lg border border-gray-500 p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    Conversation History(With AI)
                </h3>
                {visibleItems.length > 0 && (
                    <button
                        onClick={onClearHistory}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                        Clear ({visibleItems.length})
                    </button>
                )}
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
                {visibleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-center">No conversation history yet</p>
                        <p className="text-sm text-center">Start speaking to see conversation history.</p>
                    </div>
                ) : (
                    items
                )}
            </div>
        </div>
    );
}

export default React.memo(ConversationHistory);