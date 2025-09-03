import { useInterviewState } from '../context/InterviewStateContext'
import { __setPermissionsInternal, __setSettingsInternal } from '../providers/InterviewProvider'

// Define the settings interface to match both components
interface CopilotSettings {
    verbosity: 'concise' | 'default' | 'lengthy'
    language: string
    temperature: 'low' | 'default' | 'high'
    performance: 'speed' | 'quality'
}

export default function useSettings() {
    const ctx = useInterviewState()

    // Settings helpers - now using localStorage
    const updateSettings = (partial: Partial<CopilotSettings>) => {
        const savedSettings = localStorage.getItem('copilotSettings')
        const currentSettings = savedSettings ? JSON.parse(savedSettings) : {
            verbosity: 'default',
            language: 'English (Global)',
            temperature: 'default',
            performance: 'quality'
        }
        const newSettings = { ...currentSettings, ...partial }
        localStorage.setItem('copilotSettings', JSON.stringify(newSettings))

        // Also update context if available
        if (__setSettingsInternal) __setSettingsInternal({ ...ctx.settings, ...partial } as any)
    }

    // Get settings from localStorage
    const getSettings = (): CopilotSettings => {
        const savedSettings = localStorage.getItem('copilotSettings')
        if (savedSettings) {
            return JSON.parse(savedSettings)
        }
        return {
            verbosity: 'default',
            language: 'English (Global)',
            temperature: 'default',
            performance: 'quality'
        }
    }

    // Permission helpers
    const updatePermissions = (partial: Partial<typeof ctx.permissions>) => {
        if (__setPermissionsInternal) __setPermissionsInternal({ ...ctx.permissions, ...partial } as any)
    }

    const requestAudio = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia not supported')
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            try { stream.getTracks().forEach(t => t.stop()) } catch { }
            updatePermissions({ audio: true })
        } catch {
            try {
                const status: any = await (navigator as any).permissions?.query?.({ name: 'microphone' as any })
                updatePermissions({ audio: status?.state === 'granted' })
            } catch {
                updatePermissions({ audio: false })
            }
        }
    }
    const requestVideo = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia not supported')
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            try { stream.getTracks().forEach(t => t.stop()) } catch { }
            updatePermissions({ video: true })
        } catch {
            try {
                const status: any = await (navigator as any).permissions?.query?.({ name: 'camera' as any })
                updatePermissions({ video: status?.state === 'granted' })
            } catch {
                updatePermissions({ video: false })
            }
        }
    }
    const requestNotifications = async () => {
        try {
            const res = await Notification.requestPermission()
            updatePermissions({ notifications: res === 'granted' })
        } catch {
            try {
                const status: any = await (navigator as any).permissions?.query?.({ name: 'notifications' as any })
                updatePermissions({ notifications: status?.state === 'granted' })
            } catch {
                updatePermissions({ notifications: false })
            }
        }
    }

    return {
        settings: getSettings(),
        permissions: ctx.permissions,
        updateSettings,
        updatePermissions,
        requestAudio,
        requestVideo,
        requestNotifications,
    }
}


