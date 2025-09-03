import { useEffect, useRef, useState } from 'react'
import { ClockIcon, VideoOff, Settings, Mic, MicOff, ChevronDown, Phone, Video, LogOut, PhoneOff } from 'lucide-react'
import { useInterviewState } from '../context/InterviewStateContext'

interface InterviewControlBarProps {
    timerSeconds: number
    onToggleShare: () => void
    onOpenSettings?: () => void
    onLeaveCall?: () => void
    onEndCall?: () => void

}

export default function InterviewControlBar({ timerSeconds, onToggleShare, onOpenSettings, onLeaveCall, onEndCall }: InterviewControlBarProps) {
    const { isListening, toggleListening, isMicActive, isCameraOn, isSharing } = useInterviewState()
    const [menuOpen, setMenuOpen] = useState(false as boolean)
    const menuRef = useRef<HTMLDivElement | null>(null)

    // Close the dropdown on outside click
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!menuRef.current) return
            if (menuRef.current.contains(e.target as Node)) return
            setMenuOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])
    const enableCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            try { (window as any).__setCamera?.(true, stream) } catch { }
        } catch {
            try { (window as any).__setCamera?.(false, null) } catch { }
        }
    }
    const disableCamera = () => {
        try { (window as any).__setCamera?.(false, null) } catch { }
    }
    const mm = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
    const ss = (timerSeconds % 60).toString().padStart(2, '0')

    return (
        <div className="w-full flex items-center justify-between px-2 py-2 flex-wrap gap-2">
            <div className="flex items-center gap-3">
                <span className="text-white px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: '#9333ea' }}>Premium</span>
                <div className="text-xs text-gray-300 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {mm}:{ss}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={isCameraOn ? disableCamera : enableCamera}
                    className={`w-8 h-8 rounded-full bg-[#2a2a2a] ${isCameraOn ? 'hover:opacity-90' : 'hover:bg-[#3a3a3a]'} text-gray-300 flex items-center justify-center`}
                    style={isCameraOn ? { backgroundColor: '#16a34a' } : undefined}
                    title="Disable Camera" aria-label="Disable Camera"
                >
                    {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button onClick={onOpenSettings} className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 flex items-center justify-center" title="Settings" aria-label="Settings">
                    <Settings className="w-4 h-4" />
                </button>
                <button
                    disabled={!isMicActive}
                    onClick={toggleListening}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'text-white hover:opacity-90' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300'} ${!isMicActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={isListening ? { backgroundColor: '#16a34a' } : undefined}
                    title={isListening ? 'Mute microphone' : 'Unmute microphone'}
                    aria-label={isListening ? 'Mute microphone' : 'Unmute microphone'}
                >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <div className="relative" ref={menuRef as any}>
                    {isSharing ? (
                        <>
                            <button
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="ml-3 flex items-center gap-2 text-white text-xs px-3 py-2 rounded-md hover:opacity-90"
                                style={{ backgroundColor: '#dc2626' }}
                                title="End Interview"
                                aria-label="End Interview"
                            >
                                <Phone className="w-4 h-4 rotate-[135deg]" />
                                End Interview
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#2c2c2c] border border-gray-700 shadow-lg p-2 z-20">
                                    <button
                                        onClick={() => { setMenuOpen(false); (onLeaveCall || onToggleShare)() }}
                                        className="w-full flex items-center justify-between text-sm text-white hover:bg-[#3a3a3a] px-3 py-2 rounded-md"
                                    >
                                        <span>Leave Call</span>
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); (onEndCall || onToggleShare)() }}
                                        className="w-full flex items-center justify-between text-sm text-white hover:bg-[#3a3a3a] px-3 py-2 rounded-md mt-1"
                                    >
                                        <span>End Call</span>
                                        <PhoneOff className="w-4 h-4" style={{ color: '#f87171' }} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="ml-3 flex items-center gap-2 text-white text-xs px-3 py-2 rounded-md hover:opacity-90"
                                style={{ backgroundColor: '#22c55e' }}
                                title="Start Interview Options"
                                aria-label="Start Interview Options"
                            >
                                <Phone className="w-4 h-4" />
                                Start Interview
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#2c2c2c] border border-gray-700 shadow-lg p-2 z-20">
                                    <button
                                        onClick={() => { setMenuOpen(false); onToggleShare() }}
                                        className="w-full flex items-center justify-between text-sm text-white hover:bg-[#3a3a3a] px-3 py-2 rounded-md"
                                    >
                                        <span>Start Interview</span>
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); (onLeaveCall || onToggleShare)() }}
                                        className="w-full flex items-center justify-between text-sm text-white hover:bg-[#3a3a3a] px-3 py-2 rounded-md mt-1"
                                    >
                                        <span>Leave Call</span>
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}


