import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import useSettings from '../hooks/useSettings'
import { languageOptions } from '../../setting/Copilot'

interface Props {
    open: boolean
    onClose: () => void
}

// Define the settings interface to match Copilot component
interface CopilotSettings {
    verbosity: 'concise' | 'default' | 'lengthy'
    language: string
    temperature: 'low' | 'default' | 'high'
    performance: 'speed' | 'quality'
}

export default function CopilotSettingsModal({ open, onClose }: Props) {
    const { permissions, requestAudio, requestVideo, requestNotifications } = useSettings()
    const [activeTab, setActiveTab] = useState<'copilot' | 'permission'>('copilot')

    // Initialize settings from localStorage or use defaults
    const getInitialSettings = (): CopilotSettings => {
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

    const [settings, setSettings] = useState<CopilotSettings>(getInitialSettings)

    // Update a single setting and save to localStorage
    const updateSettings = (partial: Partial<CopilotSettings>) => {
        const newSettings = { ...settings, ...partial }
        setSettings(newSettings)
        localStorage.setItem('copilotSettings', JSON.stringify(newSettings))
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-200">Settings</h3>
                    <button className="p-1 rounded hover:bg-[#3a3a3a]" onClick={onClose}>
                        <X className="w-4 h-4 text-gray-300" />
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setActiveTab('copilot')} className={`px-3 py-1.5 rounded-full text-xs ${activeTab === 'copilot' ? 'text-white' : 'bg-[#3a3a3a] text-gray-300'}`} style={activeTab === 'copilot' ? { backgroundColor: '#9333ea' } : undefined}>Copilot</button>
                    <button onClick={() => setActiveTab('permission')} className={`px-3 py-1.5 rounded-full text-xs ${activeTab === 'permission' ? 'text-white' : 'bg-[#3a3a3a] text-gray-300'}`} style={activeTab === 'permission' ? { backgroundColor: '#9333ea' } : undefined}>Permission</button>
                </div>
                <div className="text-xs text-gray-400 mb-3">The following settings will affect all interviews, while the settings within each interview will only affect that specific interview.</div>
                {activeTab === 'copilot' ? (
                    <>
                        {/* Verbosity */}
                        <div className="mb-3">
                            <div className="text-xs text-gray-300 mb-1">Verbosity</div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['concise', 'default', 'lengthy'] as const).map(v => (
                                    <button key={v} onClick={() => updateSettings({ verbosity: v })}
                                        className={`px-3 py-2 rounded ${settings.verbosity === v ? 'text-white' : 'bg-[#3a3a3a] text-gray-300'}`}
                                        style={settings.verbosity === v ? { backgroundColor: '#9333ea' } : undefined}
                                    >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="mb-3">
                            <div className="text-xs text-gray-300 mb-1">Language for Copilot responses</div>
                            <select value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })}
                                className="w-full bg-[#3a3a3a] outline-none text-gray-200 text-sm rounded px-3 py-2 border border-gray-600"
                                style={{ boxShadow: '0 0 0 1px transparent' }}
                            >
                                {languageOptions.map(language => (
                                    <option key={language} value={language}>{language}</option>
                                ))} 
                            </select>
                        </div>

                        {/* Transcription Delay removed by request */}

                        {/* Temperature */}
                        <div className="mb-3">
                            <div className="text-xs text-gray-300 mb-1">Copilot Temperature</div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['low', 'default', 'high'] as const).map(v => (
                                    <button key={v} onClick={() => updateSettings({ temperature: v })}
                                        className={`px-3 py-2 rounded ${settings.temperature === v ? 'text-white' : 'bg-[#3a3a3a] text-gray-300'}`}
                                        style={settings.temperature === v ? { backgroundColor: '#9333ea' } : undefined}
                                    >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                ))}
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-300 mb-1">Performance Preference</div>
                            <div className="grid grid-cols-2 gap-2">
                                {(['speed', 'quality'] as const).map(v => (
                                    <button key={v} onClick={() => updateSettings({ performance: v })}
                                        className={`px-3 py-2 rounded ${settings.performance === v ? 'text-white' : 'bg-[#3a3a3a] text-gray-300'}`}
                                        style={settings.performance === v ? { backgroundColor: '#9333ea' } : undefined}
                                    >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-xs text-gray-400 mb-2">Permission</div>
                        <div className="space-y-3 mb-4">
                            <div className="bg-[#303030] rounded border border-gray-700 p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-200">Audio</div>
                                    <div className="text-xs text-gray-400">Allow AI to hear you for feedback.</div>
                                </div>
                                <button onClick={requestAudio} className={`text-xs px-3 py-1 rounded ${permissions.audio ? 'text-white' : 'bg-[#3a3a3a] text-gray-200'}`} style={permissions.audio ? { backgroundColor: '#16a34a' } : undefined}>{permissions.audio ? 'Granted' : 'Request'}</button>
                            </div>
                            <div className="bg-[#303030] rounded border border-gray-700 p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-200">Video</div>
                                    <div className="text-xs text-gray-400">Enable camera for realism of mock interview.</div>
                                </div>
                                <button onClick={requestVideo} className={`text-xs px-3 py-1 rounded ${permissions.video ? 'text-white' : 'bg-[#3a3a3a] text-gray-200'}`} style={permissions.video ? { backgroundColor: '#16a34a' } : undefined}>{permissions.video ? 'Granted' : 'Request'}</button>
                            </div>
                            <div className="bg-[#303030] rounded border border-gray-700 p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-200">Browser Notifications</div>
                                    <div className="text-xs text-gray-400">Receive updates on interview progress.</div>
                                </div>
                                <button onClick={requestNotifications} className={`text-xs px-3 py-1 rounded ${permissions.notifications ? 'text-white' : 'bg-[#3a3a3a] text-gray-200'}`} style={permissions.notifications ? { backgroundColor: '#16a34a' } : undefined}>{permissions.notifications ? 'Granted' : 'Request'}</button>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex items-center justify-end gap-2">
                    <button className="px-4 py-2 text-sm rounded bg-[#3a3a3a] text-gray-300" onClick={onClose}>Cancel</button>
                    <button className="px-4 py-2 text-sm rounded text-white" style={{ backgroundColor: '#9333ea' }} onClick={onClose}>Confirm</button>
                </div>
            </div>
        </div>
    )
}


