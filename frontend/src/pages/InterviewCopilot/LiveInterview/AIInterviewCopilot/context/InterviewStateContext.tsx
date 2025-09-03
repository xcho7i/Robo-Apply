import { createContext, useContext, type ReactNode } from 'react';

export interface InterviewState {
    isListening: boolean;
    toggleListening: () => void;
    startListening: () => void;
    stopListening: () => void;
    isMicActive: boolean;

    isSharing: boolean;
    startShare: () => void;
    stopShare: () => void;
    systemStream: MediaStream | null;
    setSystemListening: (listening: boolean) => void;

    transcript: string;

    // Global UI flags
    isGenerating: boolean;
    setGenerating: (value: boolean) => void;

    // Copilot settings
    settings: CopilotSettings;

    // Permissions
    permissions: CopilotPermissions;

    // Camera preview variables
    isCameraOn?: boolean;
    cameraStream?: MediaStream | null;
}

export interface CopilotSettings {
    verbosity: 'concise' | 'default' | 'lengthy';
    language: string;
    transcriptionDelay: 'low' | 'default' | 'high';
    temperature: 'low' | 'default' | 'high';
    performance: 'speed' | 'quality';
}

export interface CopilotPermissions {
    audio: boolean;
    video: boolean;
    notifications: boolean;
    extension: boolean;
}

const InterviewStateContext = createContext<InterviewState | undefined>(undefined);

export const InterviewStateProvider = ({ value, children }: { value: InterviewState; children: ReactNode }) => {
    return (
        <InterviewStateContext.Provider value={value}>
            {children}
        </InterviewStateContext.Provider>
    );
};

export const useInterviewState = (): InterviewState => {
    const ctx = useContext(InterviewStateContext);
    if (!ctx) {
        throw new Error('useInterviewState must be used within an InterviewStateProvider');
    }
    return ctx;
};

export default InterviewStateContext;


