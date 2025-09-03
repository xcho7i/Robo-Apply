import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { useInterviewState } from '../context/InterviewStateContext';
import type { TextToSpeechProps, TextToSpeechRef } from '../types/speech';

const TextToSpeech = forwardRef<TextToSpeechRef, TextToSpeechProps>(({ text, autoPlay = false, onStateChange }, ref) => {
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<number>(0);
    const [rate] = useState(1);
    const [pitch] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const { settings } = useInterviewState();

    const languageToBcp47 = (name?: string): string => {
        const n = String(name || '').toLowerCase();
        const map: Record<string, string> = {
            'english (global)': 'en', 'english (us)': 'en-US', 'english (uk)': 'en-GB',
            'spanish': 'es', 'french': 'fr', 'german': 'de', 'italian': 'it', 'portuguese': 'pt', 'russian': 'ru',
            'chinese (simplified)': 'zh-CN', 'chinese (traditional)': 'zh-TW', 'japanese': 'ja', 'korean': 'ko',
            'hindi': 'hi', 'bengali': 'bn', 'arabic': 'ar', 'turkish': 'tr', 'vietnamese': 'vi', 'indonesian': 'id',
            'thai': 'th', 'polish': 'pl', 'ukrainian': 'uk', 'romanian': 'ro', 'greek': 'el', 'hungarian': 'hu',
            'dutch': 'nl', 'swedish': 'sv', 'norwegian': 'nb', 'danish': 'da', 'finnish': 'fi', 'czech': 'cs',
            'slovak': 'sk', 'hebrew': 'he', 'malay': 'ms', 'filipino': 'fil', 'serbian': 'sr', 'croatian': 'hr',
            'bulgarian': 'bg', 'persian (farsi)': 'fa', 'swahili': 'sw',
        };
        return map[n] || 'en';
    };

    const pickVoiceIndex = (list: SpeechSynthesisVoice[], langPref: string): number => {
        if (!Array.isArray(list) || list.length === 0) return 0;
        // Exact language match
        let idx = list.findIndex(v => v.lang && v.lang.toLowerCase() === langPref.toLowerCase());
        if (idx !== -1) return idx;
        // Prefix match (e.g., en matches en-US)
        const prefix = langPref.split('-')[0];
        idx = list.findIndex(v => (v.lang || '').toLowerCase().startsWith(prefix));
        if (idx !== -1) return idx;
        // Fallback to an English female voice for readability
        idx = list.findIndex(v => (v.lang || '').toLowerCase().startsWith('en') && /female/i.test(v.name));
        if (idx !== -1) return idx;
        // Default to first
        return 0;
    };

    // Keep a live ref of mute state to avoid stale closures in event callbacks
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);

            const loadVoices = () => {
                const availableVoices = speechSynthesis.getVoices();
                setVoices(availableVoices);
                const langPref = languageToBcp47(settings?.language);
                const idx = pickVoiceIndex(availableVoices, langPref);
                setSelectedVoice(idx);
            };

            loadVoices();
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    useEffect(() => {
        if (autoPlay && text && isSupported && !isMutedRef.current) {
            speak();
        }
    }, [text, autoPlay, isSupported, settings?.language]);

    const speak = () => {
        if (!text || !isSupported || isMuted) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (voices[selectedVoice]) {
            utterance.voice = voices[selectedVoice];
        }

        // Set utterance language to match preference
        try { utterance.lang = languageToBcp47(settings?.language); } catch { }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.8;

        utterance.onstart = () => {
            onStateChange?.(true, isMutedRef.current);
        };

        utterance.onend = () => {
            onStateChange?.(false, isMutedRef.current);
        };

        utterance.onerror = () => {
            onStateChange?.(false, isMutedRef.current);
        };

        speechSynthesis.speak(utterance);
    };

    const stop = () => {
        speechSynthesis.cancel();
        onStateChange?.(false, isMutedRef.current);
    };

    const toggleMute = () => {
        const newMutedState = !isMutedRef.current;
        setIsMuted(newMutedState);
        isMutedRef.current = newMutedState;

        if (newMutedState) {
            // Mute by stopping speech
            speechSynthesis.cancel();
            onStateChange?.(false, newMutedState);
        } else {
            // Unmute: do not auto-resume; report current speaking state
            onStateChange?.(speechSynthesis.speaking, newMutedState);
        }
    };

    const setMuted = (muted: boolean) => {
        setIsMuted(muted);
        isMutedRef.current = muted;

        if (muted) {
            // Mute by stopping speech
            speechSynthesis.cancel();
            onStateChange?.(false, muted);
        } else {
            // Do not auto-resume; report current speaking state
            onStateChange?.(speechSynthesis.speaking, muted);
        }
    };

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
        stop,
        speak,
        toggleMute,
        setMuted
    }));

    return null;
});

TextToSpeech.displayName = 'TextToSpeech';

export default TextToSpeech;