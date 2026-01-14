/**
 * CardLauncher Component
 * Displays revealed tarot cards in a curved arc launcher around the microphone button
 * Clicking a card shows it prominently in the main scene
 */

import { useState, useEffect, useRef } from 'react';
import { useRevealedCard } from '../../hooks/useRevealedCard';
import type { TarotCard } from '../../types/tarot';
import { isMajorArcana } from '../../types/tarot';
import { getCardImagePath } from '../../utils/tarot';

/**
 * Card thumbnail in the launcher arc
 */
interface LauncherCardProps {
    card: TarotCard;
    index: number;
    totalCards: number;
    isActive: boolean;
    onClick: () => void;
    onRemove: () => void;
}

function LauncherCard({ card, index, totalCards, isActive, onClick, onRemove }: LauncherCardProps) {
    const isMajor = isMajorArcana(card);

    // Calculate position in arc around microphone button
    // Cards spread in an arc above the mic button (from -60° to +60°)
    const arcSpan = Math.min(120, totalCards * 35); // Max 120 degrees, 35 per card
    const startAngle = -arcSpan / 2;
    const angleStep = totalCards > 1 ? arcSpan / (totalCards - 1) : 0;
    const angle = startAngle + (index * angleStep);
    const angleRad = (angle - 90) * (Math.PI / 180); // -90 to start from top

    // Distance from center (mic button)
    const radius = 85; // pixels from center
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    return (
        <div
            className={`absolute transition-all duration-300 ease-out cursor-pointer group ${isActive ? 'z-20 scale-110' : 'z-10 hover:z-20 hover:scale-105'
                }`}
            style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                left: '50%',
                top: '50%',
            }}
            onClick={onClick}
        >
            {/* Remove button - shown on hover */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg text-xs font-bold"
                title="Remove card"
            >
                ×
            </button>

            {/* Card thumbnail */}
            <div
                className={`w-12 h-18 rounded-lg overflow-hidden shadow-lg shadow-purple-900/50 border-2 transition-all ${isActive
                    ? 'border-purple-400 shadow-purple-500/60'
                    : 'border-purple-400/40 hover:border-purple-300/60'
                    }`}
                style={{ aspectRatio: '2/3' }}
            >
                <img
                    src={getCardImagePath(card)}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling;
                        if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                    }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-2xl">
                    {isMajor ? '⭐' : '🌙'}
                </div>
            </div>

            {/* Card name tooltip */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-purple-100 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {card.name}
            </div>
        </div>
    );
}

/**
 * Main scene card display - shown when clicking a card from launcher
 */
interface MainCardDisplayProps {
    card: TarotCard;
    onClose: () => void;
}

function MainCardDisplay({ card, onClose }: MainCardDisplayProps) {
    const isMajor = isMajorArcana(card);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed top-[15%] left-1/2 -translate-x-1/2 z-[100] pointer-events-auto transition-all duration-400 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                }`}
        >
            {/* Subtle backdrop glow */}
            <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-purple-500/15 blur-2xl" />

            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute -top-2 -right-2 p-2 rounded-full bg-slate-800/95 hover:bg-slate-700 backdrop-blur-sm border border-white/20 text-white transition-all hover:scale-110 shadow-xl z-20"
                title="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Card container */}
            <div className="backdrop-blur-2xl border border-purple-300/20 border-2 rounded-xl p-5 shadow-2xl shadow-purple-900/40 overflow-hidden">
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

                <div className="text-center relative z-10">
                    {/* Card Image */}
                    <div className="mb-4 relative">

                        <img
                            src={getCardImagePath(card)}
                            alt={card.name}
                            className="w-60 h-auto mx-auto rounded-xl"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden text-5xl py-20">{isMajor ? '⭐' : '🌙'}</div>
                    </div>

                    {/* Card Name */}
                    <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 mb-3">
                        {card.name}
                    </h3>

                    {/* Card Type Badge */}
                    <div className="text-sm">
                        {isMajor ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/25 to-amber-400/15 text-amber-100 rounded-full font-semibold border border-amber-400/30 shadow-md backdrop-blur-sm">
                                <span className="text-amber-300">✨</span>
                                Major Arcana • {card.number}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/25 to-indigo-400/15 text-indigo-100 rounded-full font-semibold border border-indigo-400/30 shadow-md backdrop-blur-sm">
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
 * Main CardLauncher component
 * Wraps around the microphone button area with revealed cards in an arc
 */
export function CardLauncher() {
    const [activeCard, setActiveCard] = useState<TarotCard | null>(null);
    const [shouldPopIn, setShouldPopIn] = useState(false);

    const revealedCards = useRevealedCard((state) => state.revealedCards);
    const removeRevealedCard = useRevealedCard((state) => state.removeRevealedCard);

    const prevCountRef = useRef(revealedCards.length);

    // Animate new cards
    useEffect(() => {
        if (revealedCards.length > prevCountRef.current) {
            setShouldPopIn(true);
            setTimeout(() => setShouldPopIn(false), 500);

            // Auto-show the newly revealed card
            const newCard = revealedCards[revealedCards.length - 1];
            setActiveCard(newCard);
        }
        prevCountRef.current = revealedCards.length;
    }, [revealedCards]);

    const handleCardClick = (card: TarotCard) => {
        if (activeCard?.id === card.id) {
            setActiveCard(null);
        } else {
            setActiveCard(card);
        }
    };

    const handleCloseMainCard = () => {
        setActiveCard(null);
    };

    const hasCards = revealedCards.length > 0;

    if (!hasCards) return null;

    return (
        <>
            {/* Card Launcher Arc - positioned around mic button */}
            <div
                className={`fixed left-1/2 -translate-x-1/2 z-[190] pointer-events-auto ${shouldPopIn ? 'animate-pop' : ''
                    }`}
                style={{
                    bottom: 'calc(var(--mic-bottom-mobile, 2rem) + env(safe-area-inset-bottom, 0px) + 40px)',
                    width: '200px',
                    height: '80px',
                }}
            >
                {revealedCards.map((card, index) => (
                    <LauncherCard
                        key={card.id}
                        card={card}
                        index={index}
                        totalCards={revealedCards.length}
                        isActive={activeCard?.id === card.id}
                        onClick={() => handleCardClick(card)}
                        onRemove={() => removeRevealedCard(card.id)}
                    />
                ))}
            </div>

            {/* Main Card Display */}
            {activeCard && (
                <MainCardDisplay card={activeCard} onClose={handleCloseMainCard} />
            )}

            {/* Animation keyframes */}
            <style>{`
        @keyframes pop {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
      `}</style>
        </>
    );
}

export default CardLauncher;
