/**
 * RevealedCardOverlay Component
 * Displays revealed tarot cards as overlays on top of the 3D scene
 * Positioned at bottom center with manual dismissal for each card
 */

import { useRevealedCard } from '../../hooks/useRevealedCard';
import { isMajorArcana } from '../../types/tarot';
import type { TarotCard } from '../../types/tarot';

/**
 * Individual card component
 */
interface CardDisplayProps {
  card: TarotCard;
  onClose: () => void;
}

function CardDisplay({ card, onClose }: CardDisplayProps) {
  const isMajor = isMajorArcana(card);

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-900/40 min-w-[200px] max-w-[240px] animate-fade-in relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
        title="Close"
        aria-label="Close card"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
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
      <div className="text-center pt-2">
        {/* Card Icon */}
        <div className="text-4xl mb-2">
          {isMajor ? '⭐' : '🌙'}
        </div>

        {/* Card Name */}
        <h3 className="text-lg font-serif font-bold text-white mb-2">
          {card.name}
        </h3>

        {/* Card Type Badge */}
        <div className="text-sm">
          {isMajor ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium border border-amber-500/30">
              Major Arcana • {card.number}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs font-medium border border-indigo-500/30">
              {card.suit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Overlay component that displays all revealed tarot cards
 * Only renders when cards have been revealed via the revealCard client tool
 */
export function RevealedCardOverlay() {
  const revealedCards = useRevealedCard((state) => state.revealedCards);
  const removeRevealedCard = useRevealedCard((state) => state.removeRevealedCard);
  const clearRevealedCards = useRevealedCard((state) => state.clearRevealedCards);

  // Don't render if no cards are revealed
  if (revealedCards.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[150]">
      {/* Clear All Button (shown when multiple cards) */}
      {revealedCards.length > 1 && (
        <div className="flex justify-center mb-2">
          <button
            onClick={clearRevealedCards}
            className="px-3 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full transition-colors border border-slate-600/50"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Cards Container */}
      <div className="flex gap-3 flex-wrap justify-center max-w-[90vw]">
        {revealedCards.map((card) => (
          <CardDisplay
            key={card.id}
            card={card}
            onClose={() => removeRevealedCard(card.id)}
          />
        ))}
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
