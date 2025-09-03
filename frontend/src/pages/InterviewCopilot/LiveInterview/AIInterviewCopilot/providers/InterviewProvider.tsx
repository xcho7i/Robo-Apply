import { type ReactNode, useEffect, useState } from 'react';
import { InterviewStateProvider, type CopilotSettings, type CopilotPermissions } from '../context/InterviewStateContext';
import { useMicrophone } from '../hooks/useMicrophone';
import { useSystemAudio } from '../hooks/useSystemAudio';

export type MicEngine = 'webspeech';
export type ShareEngine = 'displayMedia';

// Internal setters exposed for hooks (not part of context contract)
export let __setSettingsInternal: ((s: CopilotSettings) => void) | null = null;
export let __setPermissionsInternal: ((p: CopilotPermissions) => void) | null = null;

export default function InterviewProvider({
    children,
}: {
    children: ReactNode;
}) {
    // Mic variant (currently only webspeech)
    const mic = useMicrophone({ onQuestionDetected: () => { } });

    // System audio share variant (currently only getDisplayMedia)
    const sys = useSystemAudio({ onQuestionDetected: () => { } });

    // Global UI state flags
    const [isGenerating, setIsGenerating] = useState(false);
    const [settings, setSettings] = useState({
        verbosity: 'default' as const,
        language: 'English (Global)',
        transcriptionDelay: 'default' as const,
        temperature: 'default' as const,
        performance: 'quality' as const,
    });
    const [permissions, setPermissions] = useState<CopilotPermissions>({ audio: false, video: false, notifications: false, extension: false });
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

    // Wire internal setters for hooks
    __setSettingsInternal = (next) => setSettings(next as any);
    __setPermissionsInternal = (next) => setPermissions(next);

    // Persist settings to localStorage and hydrate on mount
    useEffect(() => {
        const STORAGE_KEY = 'copilotSettings';
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const normalize = (s: any): CopilotSettings => {
                const isOneOf = (v: any, arr: readonly string[]) => arr.includes(String(v));
                return {
                    verbosity: isOneOf(s?.verbosity, ['concise', 'default', 'lengthy']) ? s.verbosity : 'default',
                    language: typeof s?.language === 'string' ? s.language : 'English (Global)',
                    transcriptionDelay: isOneOf(s?.transcriptionDelay, ['low', 'default', 'high']) ? s.transcriptionDelay : 'default',
                    temperature: isOneOf(s?.temperature, ['low', 'default', 'high']) ? s.temperature : 'default',
                    performance: isOneOf(s?.performance, ['speed', 'quality']) ? s.performance : 'quality',
                } as CopilotSettings;
            };
            const next = normalize(parsed);
            setSettings({
                verbosity: next.verbosity,
                language: next.language,
                transcriptionDelay: next.transcriptionDelay,
                temperature: next.temperature,
                performance: next.performance,
            } as any);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const STORAGE_KEY = 'copilotSettings';
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    }, [settings]);

    // Permissions persistence
    useEffect(() => {
        try {
            const raw = localStorage.getItem('copilotPermissions');
            if (raw) setPermissions({ ...permissions, ...JSON.parse(raw) });
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        try { localStorage.setItem('copilotPermissions', JSON.stringify(permissions)); } catch { }
    }, [permissions]);

    // Keep permissions in sync with the browser's permission state when available
    useEffect(() => {
        const perms: any = (navigator as any).permissions
        if (!perms?.query) return

        let micStatus: any, camStatus: any, notifStatus: any

        const sync = () => {
            try {
                setPermissions((prev) => ({
                    ...prev,
                    audio: micStatus?.state === 'granted' ? true : prev.audio,
                    video: camStatus?.state === 'granted' ? true : prev.video,
                    notifications: notifStatus?.state === 'granted' ? true : prev.notifications,
                }))
            } catch { }
        }

        Promise.all([
            perms.query({ name: 'microphone' as any }).catch(() => null),
            perms.query({ name: 'camera' as any }).catch(() => null),
            perms.query({ name: 'notifications' as any }).catch(() => null),
        ]).then(([m, c, n]) => {
            micStatus = m; camStatus = c; notifStatus = n
            sync()
            try { if (micStatus) micStatus.onchange = sync } catch { }
            try { if (camStatus) camStatus.onchange = sync } catch { }
            try { if (notifStatus) notifStatus.onchange = sync } catch { }
        })

        return () => {
            try { if (micStatus) micStatus.onchange = null } catch { }
            try { if (camStatus) camStatus.onchange = null } catch { }
            try { if (notifStatus) notifStatus.onchange = null } catch { }
        }
    }, [])

    // Expose a safe setter for camera preview via window; hooks/buttons will call this
    useEffect(() => {
        (window as any).__setCamera = (on: boolean, stream: MediaStream | null) => {
            try {
                if (!on) {
                    setIsCameraOn(false)
                    setCameraStream(prev => { try { prev?.getTracks().forEach(t => t.stop()) } catch { } return null })
                    return
                }
                setIsCameraOn(true)
                setCameraStream(prev => { try { prev?.getTracks().forEach(t => t.stop()) } catch { } return stream })
            } catch { }
        }
        return () => { try { delete (window as any).__setCamera } catch { } }
    }, [])

    return (
        <InterviewStateProvider
            value={{
                // mic
                isListening: mic.isListening,
                toggleListening: mic.toggleListening,
                startListening: mic.startListening,
                stopListening: mic.stopListening,
                isMicActive: mic.isMicActive,
                transcript: mic.transcript,
                // system share
                isSharing: sys.isSharing,
                startShare: sys.startShare,
                stopShare: sys.stopShare,
                systemStream: sys.stream ?? null,
                setSystemListening: sys.setListening,
                // global flags
                isGenerating,
                setGenerating: setIsGenerating,
                settings: settings as any,
                permissions,
                isCameraOn,
                cameraStream,
            }}
        >
            {children}
        </InterviewStateProvider>
    );
}


