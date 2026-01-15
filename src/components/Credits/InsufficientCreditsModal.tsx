/**
 * Insufficient Credits Modal
 * Shown when user attempts to start a session with insufficient credits
 */

import { useCredits } from '@/stores/creditsStore';

interface InsufficientCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InsufficientCreditsModal({ isOpen, onClose }: InsufficientCreditsModalProps) {
    const balance = useCredits((state) => state.balance);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-w-md w-full mx-4 bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/30 p-6 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-50" />

                <div className="relative">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        The Spirits Require Tribute
                    </h2>

                    {/* Description */}
                    <p className="text-gray-400 mb-4">
                        You have <span className="text-red-400 font-semibold">{balance}</span> credits remaining.
                        <br />
                        A reading requires at least <span className="text-purple-400 font-semibold">10 credits</span>.
                    </p>

                    {/* Pricing info */}
                    <div className="bg-purple-900/20 rounded-lg p-4 mb-6 border border-purple-500/20">
                        <p className="text-sm text-gray-300">
                            <span className="text-purple-300 font-medium">10 credits</span> = 1 minute of conversation
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
                        >
                            Get More Credits (Coming Soon)
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 px-4 text-gray-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
