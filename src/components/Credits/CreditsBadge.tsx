/**
 * Credits Badge Component
 * Displays current credit balance with visual feedback for low balance
 * Fixed position in top-right corner with yellow theme
 */

import { useCredits } from '@/stores/creditsStore';

export function CreditsBadge() {
    const balance = useCredits((state) => state.balance);
    const isLoading = useCredits((state) => state.isLoading);

    // Visual states
    const isLow = balance < 50;
    const isCritical = balance < 20;

    return (
        <div
            className={`
        fixed top-4 right-4 z-[150]
        flex items-center gap-2 px-4 py-2 rounded-full
        text-sm font-bold transition-all duration-300
        shadow-lg backdrop-blur-sm
        ${isCritical
                    ? 'bg-red-500/20 text-red-300 animate-pulse border-2 border-red-500/50 shadow-red-500/30'
                    : isLow
                        ? 'bg-yellow-500/30 text-yellow-200 border-2 border-yellow-400/50 shadow-yellow-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/40 shadow-yellow-500/20'
                }
      `}
            title={`${balance} credits remaining`}
        >
            {/* Coin Emoji */}
            <span className={`text-lg ${isCritical ? 'animate-bounce' : ''}`}>
                🪙
            </span>

            {/* Balance */}
            <span className="tabular-nums">
                {isLoading ? '...' : balance}
            </span>
        </div>
    );
}
