export type SpeakerId = 'me' | 'them'

export interface AttributionDecision {
    speaker: SpeakerId
    accept: boolean
}

export interface CreateAudioAttributionOptions {
    // Called to determine if system/tab sharing is currently active
    isSystemActive: () => boolean
    // Optional: time window (ms) that biases toward 'them' right after a system utterance
    systemBiasMs?: number
    vadThreshold?: number
}

export const createAudioAttribution = ({ isSystemActive, systemBiasMs = 300, vadThreshold = 0.06 }: CreateAudioAttributionOptions) => {
    let lastSystemTs = 0

    const now = () => Date.now()

    const recordSystemEvent = () => {
        lastSystemTs = now()
    }

    const classifySystem = (): AttributionDecision => {
        recordSystemEvent()
        return { speaker: 'them', accept: true }
    }

    const classifyMic = ({ isFinal, rms }: { isFinal: boolean; rms?: number | null }): AttributionDecision => {
        const systemActive = isSystemActive()
        if (!systemActive) {
            // No system audio: always accept mic as 'me'
            return { speaker: 'me', accept: true }
        }

        // System audio is active. Reduce echo by:
        // - ignoring interims
        // - applying a short bias window after a system event
        if (!isFinal) return { speaker: 'me', accept: false }

        const elapsed = now() - lastSystemTs
        if (elapsed <= systemBiasMs) return { speaker: 'me', accept: false }

        // Optional VAD gating: only apply if an RMS value was actually provided
        if (typeof rms === 'number') {
            if (rms < vadThreshold) return { speaker: 'me', accept: false }
        }

        return { speaker: 'me', accept: true }
    }

    return {
        classifySystem,
        classifyMic,
        recordSystemEvent,
    }
}

export default createAudioAttribution