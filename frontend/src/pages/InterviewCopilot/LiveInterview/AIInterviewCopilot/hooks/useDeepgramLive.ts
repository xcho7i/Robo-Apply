import { useEffect, useRef } from 'react'
import deepgramService, { type DeepgramTranscript } from '../services/deepgram'

export interface UseDeepgramLiveOptions {
    stream: MediaStream | null
    enabled: boolean
    onTranscript: (t: DeepgramTranscript) => void
}

// Very simple hook: starts/stops a single Deepgram session for a stream
export interface UseDeepgramLiveReturn { }

/**
 * Manages a Deepgram live session for a given MediaStream. Starts/stops with `enabled`.
 */
export const useDeepgramLive = ({ stream, enabled, onTranscript }: UseDeepgramLiveOptions): UseDeepgramLiveReturn => {
    // Stabilize handler to avoid reconnects on every render
    const handlerRef = useRef<(t: DeepgramTranscript) => void>(() => { })
    useEffect(() => { handlerRef.current = onTranscript }, [onTranscript])

    useEffect(() => {
        if (!enabled || !stream || !deepgramService.isConfigured()) return;
        let canceled = false;
        let stop: (() => void) | null = null;
        try {
            stop = deepgramService.startLiveFromStream(stream, {
                timesliceMs: 250,
                onTranscript: (t) => { if (!canceled) handlerRef.current(t); },
                onError: () => { }
            });
        } catch { }
        return () => { canceled = true; try { stop && stop(); } catch { } };
    }, [enabled, stream]);

    return {}
}

export default useDeepgramLive



