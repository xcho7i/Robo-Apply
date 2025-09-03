import { useState, useEffect, useRef } from 'react';
import { MousePointerClickIcon } from 'lucide-react';
import { useInterviewState } from '../context/InterviewStateContext';
import InterviewControlBar from './InterviewControlBar';
import CopilotSettingsModal from './CopilotSettingsModal';

export default function ScreenSharePreview({ onLeaveCall, onEndCall, isMock = false }: { onLeaveCall?: () => void; onEndCall?: () => void; isMock?: boolean }) {
    const { systemStream, isSharing, startShare, stopShare, cameraStream } = useInterviewState();
    const shareVideoRef = useRef<HTMLVideoElement>(null);
    const [timer, setTimer] = useState<number>(0);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSharing) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        } else {
            setTimer(0); // Reset timer when not sharing
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSharing]);


    useEffect(() => {
        const video = shareVideoRef.current;
        if (!video) return;
        if (systemStream) {
            (video as any).srcObject = systemStream;

            video.play().catch(() => { /* ignore */ });
        } else {
            (video as any).srcObject = null;
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
    }, [systemStream]);

    return (
        <div className="w-full flex flex-col items-center relative justify-center">
            <InterviewControlBar
                timerSeconds={timer}
                onToggleShare={() => (isSharing ? stopShare() : startShare())}
                onLeaveCall={async () => { try { if (isSharing) stopShare(); } finally { try { await onLeaveCall?.() } catch { } } }}
                onEndCall={async () => { try { if (isSharing) stopShare(); } finally { try { await onEndCall?.() } catch { } } }}
                onOpenSettings={() => setSettingsOpen(true)}
            />
            <CopilotSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {isSharing ? (
                <div className="bg-[#0f0f0f] border border-gray-700 rounded-md overflow-hidden w-full">
                    <div className="relative">
                        <video
                            ref={shareVideoRef}
                            className="w-full object-contain bg-black"
                            autoPlay
                            muted
                            playsInline
                        />

                        {(!systemStream || systemStream.getVideoTracks().length === 0) && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 bg-black/60">
                                No video in shared stream. Select a Tab or Window (and enable \"Share audio\") in the picker.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-[#484848] border border-gray-700 h-[200px] rounded-md overflow-hidden w-full flex flex-col items-center justify-center">
                    <div className="px-3 py-2 text-xs text-gray-300">
                        {isMock ? 'Mock interview' : 'Select your interview meeting room'}
                    </div>
                    {!isMock && (
                        <button
                            onClick={startShare}
                            className="text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors hover:opacity-90"
                            style={{ backgroundColor: '#8b5cf6' }}
                        >
                            <MousePointerClickIcon className="w-4 h-4" />
                            Select
                        </button>
                    )}
                </div>
            )}
            {/* PiP camera preview */}
            {cameraStream ? (
                <video
                    className="absolute bottom-0 right-0 w-40 h-28 bg-black/60 rounded-md object-cover"
                    autoPlay
                    muted
                    playsInline
                    ref={el => { if (el && !el.srcObject) el.srcObject = cameraStream as any; }}
                />
            ) : null}
        </div>
    );
}