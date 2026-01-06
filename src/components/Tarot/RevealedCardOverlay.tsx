/**
 * RevealedCardOverlay Component
 * Displays revealed tarot cards in a drawer that can be toggled
 * Cards are stored and can be viewed/hidden during the session
 */

import { useState, useEffect, useRef } from 'react';
import { useRevealedCard } from '../../hooks/useRevealedCard';
import { isMajorArcana } from '../../types/tarot';
import type { TarotCard } from '../../types/tarot';
import { getCardImagePath } from '../../utils/tarot';

/**
 * Main scene card display component
 */
interface MainSceneCardProps {
  card: TarotCard;
  onClose: () => void;
  isFadingOut?: boolean;
  isFadingIn?: boolean;
}

function MainSceneCard({ card, onClose, isFadingOut = false, isFadingIn = false }: MainSceneCardProps) {
  const isMajor = isMajorArcana(card);

  return (
    <div 
      className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[160] pointer-events-auto transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : isFadingIn ? 'opacity-100' : 'opacity-100'
      }`}
      style={{
        animation: isFadingIn ? 'cardReveal 0.5s ease-out forwards' : 'none',
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-purple-900/40 min-w-[280px] max-w-[320px] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          title="Close"
          aria-label="Close card"
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
          {/* Card Image */}
          <div className="mb-4">
            <img
              src={getCardImagePath(card)}
              alt={card.name}
              className="w-48 h-auto mx-auto rounded-lg shadow-lg shadow-purple-900/30"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden text-4xl">
              {isMajor ? '⭐' : '🌙'}
            </div>
          </div>

          {/* Card Name */}
          <h3 className="text-xl font-serif font-bold text-white mb-3">
            {card.name}
          </h3>

          {/* Card Type Badge */}
          <div className="text-sm">
            {isMajor ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-200 rounded-full font-medium border border-amber-500/30">
                Major Arcana • {card.number}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-full font-medium border border-indigo-500/30">
                {card.suit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual card component for drawer display
 */
interface CardDisplayProps {
  card: TarotCard;
  onClose: () => void;
  onClick: () => void;
}

function CardDisplay({ card, onClose, onClick }: CardDisplayProps) {
  const isMajor = isMajorArcana(card);

  return (
    <div 
      className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 shadow-lg shadow-purple-900/40 relative group cursor-pointer hover:border-purple-400/50 transition-all"
      onClick={onClick}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
        title="Remove card"
        aria-label="Remove card"
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
      <div className="text-center">
        {/* Card Image */}
        <div className="mb-2">
          <img
            src={getCardImagePath(card)}
            alt={card.name}
            className="w-full h-auto mx-auto rounded-lg shadow-lg shadow-purple-900/30"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden text-4xl">
            {isMajor ? '⭐' : '🌙'}
          </div>
        </div>

        {/* Card Name */}
        <h3 className="text-sm font-serif font-bold text-white mb-1 truncate">
          {card.name}
        </h3>

        {/* Card Type Badge */}
        <div className="text-xs">
          {isMajor ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-200 rounded-full font-medium border border-amber-500/30">
              Major • {card.number}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-200 rounded-full font-medium border border-indigo-500/30">
              {card.suit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Drawer component that displays all revealed tarot cards
 * Can be toggled to show/hide cards drawn during the session
 */
export function RevealedCardOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [mainSceneCard, setMainSceneCard] = useState<TarotCard | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [shouldPopIcon, setShouldPopIcon] = useState(false);
  const revealedCards = useRevealedCard((state) => state.revealedCards);
  const removeRevealedCard = useRevealedCard((state) => state.removeRevealedCard);
  const clearRevealedCards = useRevealedCard((state) => state.clearRevealedCards);
  const prevCardCountRef = useRef(0);
  const currentCardRef = useRef<TarotCard | null>(null);

  // Handle new card reveal - show in main scene with fade transition
  useEffect(() => {
    if (revealedCards.length > prevCardCountRef.current) {
      const newCard = revealedCards[revealedCards.length - 1];
      const hasCurrentCard = currentCardRef.current !== null;
      
      // If there's already a card showing, fade it out first
      if (hasCurrentCard) {
        setIsFadingOut(true);
        // After fadeout completes, show new card with fade in
        setTimeout(() => {
          currentCardRef.current = newCard;
          setMainSceneCard(newCard);
          setIsFadingOut(false);
          setIsFadingIn(true);
          // Reset fade in flag after animation
          setTimeout(() => setIsFadingIn(false), 500);
        }, 300); // Match fadeout duration
      } else {
        // No card currently showing, just fade in the new one
        currentCardRef.current = newCard;
        setMainSceneCard(newCard);
        setIsFadingIn(true);
        setTimeout(() => setIsFadingIn(false), 500);
      }
      
      // Pop the drawer icon when first card is added
      if (prevCardCountRef.current === 0) {
        setShouldPopIcon(true);
        setTimeout(() => setShouldPopIcon(false), 600);
      }
    }
    prevCardCountRef.current = revealedCards.length;
  }, [revealedCards.length, revealedCards]);

  const handleCardClick = (card: TarotCard) => {
    // If clicking the same card, do nothing
    if (currentCardRef.current?.id === card.id) {
      return;
    }
    
    // If there's already a card showing, fade it out first
    if (currentCardRef.current) {
      setIsFadingOut(true);
      setTimeout(() => {
        currentCardRef.current = card;
        setMainSceneCard(card);
        setIsFadingOut(false);
        setIsFadingIn(true);
        setTimeout(() => setIsFadingIn(false), 500);
      }, 300);
    } else {
      // No card currently showing, just fade in
      currentCardRef.current = card;
      setMainSceneCard(card);
      setIsFadingIn(true);
      setTimeout(() => setIsFadingIn(false), 500);
    }
  };

  const handleCloseCard = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      currentCardRef.current = null;
      setMainSceneCard(null);
      setIsFadingOut(false);
    }, 300);
  };

  const hasCards = revealedCards.length > 0;

  return (
    <>
      {/* Main Scene Card Display */}
      {mainSceneCard && (
        <MainSceneCard
          card={mainSceneCard}
          onClose={handleCloseCard}
          isFadingOut={isFadingOut}
          isFadingIn={isFadingIn}
        />
      )}

      {/* Toggle Button - Always visible when cards exist */}
      {hasCards && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed right-4 top-20 z-[150] w-12 h-12 bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-110 hover:bg-slate-800/90 ${
            shouldPopIcon ? 'animate-pop' : ''
          }`}
          title={isOpen ? 'Hide cards' : `Show cards (${revealedCards.length})`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-purple-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {/* Badge showing card count */}
          {revealedCards.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
              {revealedCards.length}
            </span>
          )}
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-l border-purple-500/30 shadow-2xl shadow-purple-900/50 z-[140] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
              <span className="text-xl">🃏</span>
              Revealed Cards
            </h2>
            <p className="text-xs text-purple-300/70 mt-0.5">
              {revealedCards.length} card{revealedCards.length !== 1 ? 's' : ''} drawn
            </p>
          </div>
          <div className="flex items-center gap-2">
            {revealedCards.length > 0 && (
              <button
                onClick={clearRevealedCards}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                title="Clear all cards"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              title="Close drawer"
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
          </div>
        </div>

        {/* Cards List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
          {revealedCards.length === 0 ? (
            <div className="text-center text-purple-300/50 mt-8">
              <p className="text-sm">No cards revealed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {revealedCards.map((card) => (
                <CardDisplay
                  key={card.id}
                  card={card}
                  onClose={() => removeRevealedCard(card.id)}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[130]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pop {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .animate-pop {
          animation: pop 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
