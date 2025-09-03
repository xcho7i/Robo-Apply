import { useState, useEffect, useRef, useCallback } from 'react';
import { isQuestion } from '../utils/questionDetection';

interface UseSpeechRecognitionOptions {
    onQuestionDetected: (question: string) => void;
}

export const useSpeechRecognition = ({ onQuestionDetected }: UseSpeechRecognitionOptions) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    // Use the cleaner question detection function
                    if (isQuestion(finalTranscript)) {
                        onQuestionDetected(finalTranscript);
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.log('Speech recognition error:', event.error);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onQuestionDetected]);

    useEffect(() => {
        try {
            if (recognitionRef.current) {
                if (isListening) {
                    recognitionRef.current.start();
                } else {
                    recognitionRef.current.stop();
                }
            }
        } catch (error) {
            console.log('Error starting/stopping speech recognition:', error);
        }
    }, [isListening]);

    const toggleListening = useCallback(() => {
        setIsListening(prev => !prev);
    }, []);

    const startListening = useCallback(() => {
        setIsListening(true);
    }, []);

    const stopListening = useCallback(() => {
        setIsListening(false);
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        toggleListening,
        startListening,
        stopListening
    };
};
