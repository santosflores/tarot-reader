/**
 * RevealedCardOverlay Component
 * Displays a tarot card overlay on top of the 3D scene
 * Positioned at bottom center with manual dismissal
 */

import { useRevealedCard } from '../../hooks/useRevealedCard';
import { isMajorArcana } from '../../types/tarot';

/**
 * Overlay component that displays the currently revealed tarot card
 * Only renders when a card has been revealed via the revealCard client tool
 */
export function RevealedCardOverlay() {
  const revealedCard = useRevealedCard((state) => state.revealedCard);
  const clearRevealedCard = useRevealedCard((state) => state.clearRevealedCard);

  // Don't render if no card is revealed
  if (!revealedCard) {
    return null;
  }

  const isMajor = isMajorArcana(revealedCard);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[150]">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-purple-900/40 min-w-[280px] max-w-[320px] animate-fade-in">
        {/* Close Button */}
        <button
          onClick={clearRevealedCard}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          title="Close"
          aria-label="Close card overlay"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Card Content */}
        <div className="text-center">
          {/* Card Icon */}
          <div className="text-5xl mb-3">
            {isMajor ? '⭐' : '🌙'}
          </div>

          {/* Card Name */}
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            {revealedCard.name}
          </h3>

          {/* Card Type Badge */}
          <div className="text-sm">
            {isMajor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-200 rounded-full text-sm font-medium border border-amber-500/30">
                Major Arcana • {revealedCard.number}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-full text-sm font-medium border border-indigo-500/30">
                {revealedCard.suit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
