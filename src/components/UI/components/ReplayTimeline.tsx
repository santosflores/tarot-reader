
import { useRef } from "react";


interface ReplayTimelineProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

export function ReplayTimeline({
    currentTime,
    duration,
    onSeek,
}: ReplayTimelineProps) {
    const progressBarRef = useRef<HTMLDivElement>(null);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || duration === 0) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        onSeek(percentage * duration);
    };

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] flex flex-col gap-2">
            {/* Timeline Controls */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-full px-4 py-2 shadow-xl flex items-center gap-3 mt-4">
                <div className="text-xs font-medium text-purple-200 w-10 text-right">
                    {formatTime(currentTime)}
                </div>

                <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="flex-1 h-2 bg-slate-700/50 rounded-full cursor-pointer relative group"
                >
                    {/* Progress fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Playhead handle (visible on hover) */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    />
                </div>

                <div className="text-xs font-medium text-purple-200/60 w-10">
                    {formatTime(duration)}
                </div>
            </div>
        </div>
    );
}
