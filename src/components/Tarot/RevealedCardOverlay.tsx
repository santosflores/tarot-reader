/**
 * RevealedCardOverlay Component
 * Displays revealed tarot cards in spread layouts with flip animations
 * Supports both spread mode (structured layout) and single card mode
 */

import { useState, useEffect, useRef } from 'react';
import { useRevealedCard } from '../../hooks/useRevealedCard';
import { isMajorArcana } from '../../types/tarot';
import type { TarotCard } from '../../types/tarot';
import { getCardImagePath } from '../../utils/tarot';
import { TarotSpreadDisplay } from './TarotSpreadDisplay';

/**
 * Main scene card display component (for single card view when clicking from drawer)
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
      className={`fixed left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 z-[160] pointer-events-auto transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : isFadingIn ? 'opacity-100' : 'opacity-100'
        }`}
      style={{
        animation: isFadingIn ? 'cardReveal 0.5s ease-out forwards' : 'none',
      }}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl opacity-60" />

      {/* Close Button - positioned at top right corner of container */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 p-2 rounded-full bg-slate-800/95 hover:bg-slate-700/95 backdrop-blur-sm border-2 border-white/30 text-white hover:text-white transition-all hover:scale-110 hover:border-white/50 shadow-xl shadow-purple-900/50 z-20"
        title="Close"
        aria-label="Close card"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="relative bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-slate-900/98 backdrop-blur-2xl border-2 border-purple-400/40 rounded-3xl p-8 shadow-2xl min-w-[320px] max-w-[380px] overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl border-2 border-purple-300/20 animate-pulse-slow pointer-events-none" />

        {/* Card Content */}
        <div className="text-center relative z-10 pt-2">
          {/* Card Image */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-2xl blur-xl -z-10" />
            <img
              src={getCardImagePath(card)}
              alt={card.name}
              className="w-56 h-auto mx-auto rounded-2xl shadow-2xl shadow-purple-900/50 border-2 border-purple-300/20 transition-transform hover:scale-[1.02]"
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
          <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 mb-4 tracking-wide drop-shadow-lg">
            {card.name}
          </h3>

          {/* Card Type Badge */}
          <div className="text-sm">
            {isMajor ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-amber-500/30 text-amber-100 rounded-full font-semibold border border-amber-400/40 shadow-lg shadow-amber-900/30 backdrop-blur-sm">
                <span className="text-amber-300">✨</span>
                Major Arcana • {card.number}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/30 via-indigo-400/20 to-indigo-500/30 text-indigo-100 rounded-full font-semibold border border-indigo-400/40 shadow-lg shadow-indigo-900/30 backdrop-blur-sm">
                <span className="text-indigo-300">🃏</span>
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
      className="bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-purple-400/30 rounded-xl p-3 shadow-lg shadow-purple-900/40 relative group cursor-pointer hover:border-purple-300/60 hover:shadow-xl hover:shadow-purple-900/50 hover:scale-105 transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/90 hover:bg-red-600/80 backdrop-blur-sm border border-purple-400/30 hover:border-red-400/50 text-gray-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 hover:scale-110 shadow-lg"
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
        <div className="mb-2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg blur-sm -z-10" />
          <img
            src={getCardImagePath(card)}
            alt={card.name}
            className="w-full h-auto mx-auto rounded-lg shadow-lg shadow-purple-900/40 border border-purple-300/20 group-hover:border-purple-200/40 transition-all"
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
        <h3 className="text-sm font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 mb-1.5 truncate">
          {card.name}
        </h3>

        {/* Card Type Badge */}
        <div className="text-xs">
          {isMajor ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500/25 to-amber-400/15 text-amber-200 rounded-full font-semibold border border-amber-400/40 shadow-md backdrop-blur-sm">
              ✨ Major • {card.number}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-indigo-500/25 to-indigo-400/15 text-indigo-200 rounded-full font-semibold border border-indigo-400/40 shadow-md backdrop-blur-sm">
              🃏 {card.suit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main overlay component for displaying tarot reading spreads and card drawer
 */
export function RevealedCardOverlay() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mainSceneCard, setMainSceneCard] = useState<TarotCard | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [shouldPopIcon, setShouldPopIcon] = useState(false);
  const [showSpread, setShowSpread] = useState(false);

  const revealedCards = useRevealedCard((state) => state.revealedCards);
  const currentSpreadType = useRevealedCard((state) => state.currentSpreadType);
  const removeRevealedCard = useRevealedCard((state) => state.removeRevealedCard);
  const clearRevealedCards = useRevealedCard((state) => state.clearRevealedCards);

  const prevCardCountRef = useRef(0);
  const isInitializedRef = useRef(false);

  // Initialize the card count ref on mount to prevent auto-showing existing cards
  useEffect(() => {
    if (!isInitializedRef.current) {
      prevCardCountRef.current = revealedCards.length;
      isInitializedRef.current = true;
      return;
    }
  });

  // Handle new card reveal - show spread display when cards are added
  useEffect(() => {
    // Don't run if not initialized yet
    if (!isInitializedRef.current) {
      return;
    }

    if (revealedCards.length > prevCardCountRef.current) {
      // Show the spread display when cards are revealed
      if (currentSpreadType) {
        setShowSpread(true);
        setMainSceneCard(null); // Clear any single card view
      }

      // Pop the drawer icon when first card is added
      if (prevCardCountRef.current === 0) {
        setShouldPopIcon(true);
        setTimeout(() => setShouldPopIcon(false), 600);
      }
    }
    prevCardCountRef.current = revealedCards.length;
  }, [revealedCards.length, revealedCards, currentSpreadType]);

  // Handle clicking a card in the drawer to view details
  const handleDrawerCardClick = (card: TarotCard) => {
    // Close drawer and show the card in detail view
    setIsDrawerOpen(false);

    if (mainSceneCard?.id === card.id) {
      return;
    }

    if (mainSceneCard) {
      setIsFadingOut(true);
      setTimeout(() => {
        setMainSceneCard(card);
        setIsFadingOut(false);
        setIsFadingIn(true);
        setTimeout(() => setIsFadingIn(false), 500);
      }, 300);
    } else {
      setMainSceneCard(card);
      setIsFadingIn(true);
      setTimeout(() => setIsFadingIn(false), 500);
    }
  };

  const handleCloseMainCard = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setMainSceneCard(null);
      setIsFadingOut(false);
    }, 300);
  };

  const handleCloseSpread = () => {
    setShowSpread(false);
  };

  const handleSpreadCardClick = (card: TarotCard) => {
    // Show the card in detail view when clicked in spread
    setMainSceneCard(card);
    setIsFadingIn(true);
    setTimeout(() => setIsFadingIn(false), 500);
  };

  const hasCards = revealedCards.length > 0;

  return (
    <>
      {/* Spread Display - shown at bottom of screen */}
      {showSpread && currentSpreadType && hasCards && (
        <TarotSpreadDisplay
          cards={revealedCards}
          spreadType={currentSpreadType}
          onCardClick={handleSpreadCardClick}
          onClose={handleCloseSpread}
        />
      )}

      {/* Main Scene Card Display - for viewing single card details */}
      {mainSceneCard && !showSpread && (
        <MainSceneCard
          card={mainSceneCard}
          onClose={handleCloseMainCard}
          isFadingOut={isFadingOut}
          isFadingIn={isFadingIn}
        />
      )}

      {/* Toggle Button - Always visible when cards exist, hidden when drawer is open */}
      {hasCards && !isDrawerOpen && !showSpread && (
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`fixed right-4 top-4 z-[150] w-14 h-14 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-purple-400/40 rounded-full shadow-xl shadow-purple-900/50 flex items-center justify-center transition-all hover:scale-110 hover:border-purple-300/60 hover:shadow-2xl hover:shadow-purple-900/60 ${shouldPopIcon ? 'animate-pop' : ''
            }`}
          title={`Show cards (${revealedCards.length})`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-purple-200 drop-shadow-lg"
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
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg shadow-purple-900/50">
              {revealedCards.length}
            </span>
          )}
        </button>
      )}

      {/* Show Spread Button - visible when cards exist but spread is closed */}
      {hasCards && !showSpread && currentSpreadType && !isDrawerOpen && (
        <button
          onClick={() => setShowSpread(true)}
          className="fixed right-20 top-4 z-[150] px-4 py-2 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-xl border border-purple-400/40 rounded-full shadow-xl shadow-purple-900/50 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:border-purple-300/60"
          title="View spread"
        >
          <span>🎴</span>
          <span>View Spread</span>
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900/98 via-purple-900/95 to-slate-900/98 backdrop-blur-2xl border-l-2 border-purple-400/40 shadow-2xl shadow-purple-900/50 z-[140] transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Drawer Header */}
        <div className="relative p-5 border-b border-purple-400/30 bg-gradient-to-r from-purple-900/30 to-transparent flex items-center justify-between backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 flex items-center gap-2">
              <span className="text-2xl drop-shadow-lg">🃏</span>
              Revealed Cards
            </h2>
            <p className="text-sm text-purple-300/80 mt-1 font-medium">
              {revealedCards.length} card{revealedCards.length !== 1 ? 's' : ''} drawn
            </p>
          </div>
          <div className="flex items-center gap-2">
            {revealedCards.length > 0 && (
              <button
                onClick={clearRevealedCards}
                className="p-2 rounded-lg bg-slate-800/90 hover:bg-red-600/80 backdrop-blur-sm border border-purple-400/30 hover:border-red-400/50 text-gray-300 hover:text-white transition-all hover:scale-110 shadow-lg"
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
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-gray-300 hover:text-white transition-all hover:scale-110 shadow-lg"
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
        <div className="relative overflow-y-auto h-[calc(100vh-100px)] p-5">
          {revealedCards.length === 0 ? (
            <div className="text-center text-purple-300/60 mt-12">
              <div className="text-5xl mb-4 opacity-50">🃏</div>
              <p className="text-sm font-medium">No cards revealed yet</p>
              <p className="text-xs text-purple-400/50 mt-1">Draw cards to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {revealedCards.map((card) => (
                <CardDisplay
                  key={card.id}
                  card={card}
                  onClose={() => removeRevealedCard(card.id)}
                  onClick={() => handleDrawerCardClick(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop when drawer is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[130]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85);
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
            transform: scale(1.25);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-pop {
          animation: pop 0.6s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
