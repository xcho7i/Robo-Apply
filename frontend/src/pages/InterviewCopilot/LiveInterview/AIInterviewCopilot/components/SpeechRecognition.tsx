import { useState, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { useInterviewState } from '../context/InterviewStateContext';

interface SpeechRecognitionProps {
    onQuestionDetected?: (question: string) => void;
    onStopResponse?: () => void;
    isResponsePlaying?: boolean;
}

export default function SpeechRecognition({
    onStopResponse,
    isResponsePlaying = false,
}: SpeechRecognitionProps) {
    const [isSupported, setIsSupported] = useState(false);
    const { isListening, toggleListening, isMicActive, transcript } = useInterviewState();

    const displayTranscript = transcript || '';

    useEffect(() => {
        // Check if speech recognition is supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
        }
    }, []);

    if (!isSupported) {
        return (
            <div className="bg-[#2c2c2c] border border-red-200 rounded-xl p-6 text-center">
                <Mic className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-700 font-medium">Speech Recognition Not Supported</p>
                <p className="text-red-600 text-sm mt-1">
                    Please use a modern browser like Chrome or Edge
                </p>
            </div>
        );
    }


    return (
        <div className="bg-[#2c2c2c] rounded-md shadow-lg border border-gray-500 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Mic className="h-5 w-5 text-blue-600" />
                    Voice Input
                </h3>
                <div className="flex items-center gap-2">
                    {/* Response Control Buttons */}
                    {isResponsePlaying && onStopResponse && (
                        <button
                            onClick={onStopResponse}
                            className="p-2 rounded-lg text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                            style={{ backgroundColor: '#ef4444', boxShadow: '0 10px 15px -3px rgb(239 68 68 / 0.25), 0 4px 6px -4px rgb(239 68 68 / 0.25)' }}
                            title="Stop Response"
                        >
                            <Square className="h-4 w-4" />
                        </button>
                    )}

                    {/* Microphone Button */}
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 text-white shadow-lg`}
                        style={isListening ? { backgroundColor: '#3b82f6', boxShadow: '0 10px 15px -3px rgb(59 130 246 / 0.25), 0 4px 6px -4px rgb(59 130 246 / 0.25)' } : { backgroundColor: '#ef4444', boxShadow: '0 10px 15px -3px rgb(239 68 68 / 0.25), 0 4px 6px -4px rgb(239 68 68 / 0.25)' }}
                        title={isListening ? 'Stop Listening' : 'Start Listening'}
                    >
                        {!isListening ? (
                            <MicOff className="h-6 w-6" />
                        ) : (
                            <Mic className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm ${isListening ? '' : 'text-gray-400'}`} style={isListening ? { color: '#16a34a' } : undefined}>
                        <div className={`w-2 h-2 rounded-full ${isListening ? 'animate-pulse' : ''}`} style={{ backgroundColor: isMicActive ? '#22c55e' : '#ef4444' }} />
                        {isMicActive
                            ? (isListening ? 'Listening for questions...' : 'Microphone ready - click to listen')
                            : 'Initializing microphone...'
                        }
                    </div>

                    {/* Response Status */}
                    {isResponsePlaying && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#16a34a' }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                            🔊 Speaking answer...
                        </div>
                    )}
                </div>

                {displayTranscript && (
                    <div className="bg-[#2c2c2c] rounded-lg p-3 border-l-4" style={{ borderLeftColor: '#ef4444' }}>
                        <p className="text-sm text-gray-400 mb-1">Last heard:</p>
                        <p className="text-gray-200">{displayTranscript}</p>
                    </div>
                )}
            </div>
        </div>
    );
}