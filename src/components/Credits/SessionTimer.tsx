/**
 * Session Timer Component
 * Displays elapsed time during an active conversation session
 * Positioned below the CreditsBadge in top-right corner
 */

import { useState, useEffect } from 'react';
import { useCredits } from '@/stores/creditsStore';

export function SessionTimer() {
    const sessionStartTime = useCredits((state) => state.sessionStartTime);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!sessionStartTime) {
            setElapsed(0);
            return;
        }

        // Update every second
        const interval = setInterval(() => {
            const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
            setElapsed(seconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStartTime]);

    // Don't render if no active session
    if (!sessionStartTime) return null;

    // Format time as MM:SS
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div
            className="fixed top-16 right-4 z-[150] flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-bold bg-red-500/20 text-red-300 border-2 border-red-500/40 shadow-lg shadow-red-500/20 backdrop-blur-sm animate-pulse"
            title="Session duration"
        >
            {/* Recording indicator */}
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />

            {/* Timer */}
            <span className="tabular-nums">{formattedTime}</span>
        </div>
    );
}
