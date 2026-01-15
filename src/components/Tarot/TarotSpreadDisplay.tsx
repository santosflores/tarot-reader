/**
 * TarotSpreadDisplay Component
 * Displays tarot cards in structured spread layouts with flip animations
 * Supports horizontal scrolling for mobile-friendly viewing
 */

import { useState, useEffect, useRef } from 'react';
import type { TarotCard } from '../../types/tarot.ts';
import type { SpreadType, SpreadPosition } from '../../types/tarotSpread.ts';
import { getSpreadConfig } from '../../types/tarotSpread.ts';
import { isMajorArcana } from '../../types/tarot.ts';
import { getCardImagePath } from '../../utils/tarot.ts';

interface TarotSpreadDisplayProps {
    cards: TarotCard[];
    spreadType: SpreadType;
    onCardClick?: (card: TarotCard, index: number) => void;
    onClose?: () => void;
}

interface SpreadCardProps {
    card: TarotCard;
    position: SpreadPosition;
    index: number;
    isRevealed: boolean;
    onClick?: () => void;
}

/**
 * Individual card in the spread with flip animation
 */
function SpreadCard({ card, position, index, isRevealed, onClick }: SpreadCardProps) {
    const isMajor = isMajorArcana(card);
    const [hasFlipped, setHasFlipped] = useState(false);

    // Stagger the reveal animation
    useEffect(() => {
        if (isRevealed && !hasFlipped) {
            const delay = index * 400; // 400ms delay between each card
            const timer = setTimeout(() => {
                setHasFlipped(true);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [isRevealed, index, hasFlipped]);

    return (
        <div
            className="spread-card-container"
            style={{
                '--card-x': `${position.x}%`,
                '--card-y': `${position.y}%`,
                '--card-rotation': `${position.rotation}deg`,
                '--card-delay': `${index * 0.1}s`,
            } as React.CSSProperties}
            onClick={onClick}
        >
            {/* Position Label */}
            <div className="spread-card-label">
                {position.label}
            </div>

            {/* Card with flip effect */}
            <div className={`spread-card ${hasFlipped ? 'is-flipped' : ''}`}>
                {/* Card Back */}
                <div className="spread-card-face spread-card-back">
                    <img
                        src="/images/tarot/card_back.png"
                        alt="Card Back"
                        className="spread-card-image"
                        onError={(e) => {
                            // Fallback gradient if card_back.png not found
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                        }}
                    />
                    <div className="hidden spread-card-back-fallback">
                        <span className="text-4xl">🎴</span>
                    </div>
                </div>

                {/* Card Front */}
                <div className="spread-card-face spread-card-front">
                    <img
                        src={getCardImagePath(card)}
                        alt={card.name}
                        className="spread-card-image"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                        }}
                    />
                    <div className="hidden spread-card-emoji-fallback">
                        {isMajor ? '⭐' : '🌙'}
                    </div>
                </div>
            </div>

            {/* Card Name (shown after flip) */}
            <div className={`spread-card-name ${hasFlipped ? 'is-visible' : ''}`}>
                {card.name}
            </div>
        </div>
    );
}

/**
 * Main spread display component with horizontal scrolling
 */
export function TarotSpreadDisplay({ cards, spreadType, onCardClick, onClose }: TarotSpreadDisplayProps) {
    const [isRevealing, setIsRevealing] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const config = getSpreadConfig(spreadType);

    // Start reveal animation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRevealing(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Get positions for current cards (up to the spread's card count)
    const cardPositions = cards.slice(0, config.cardCount).map((card, index) => ({
        card,
        position: config.positions[index],
        index,
    }));

    return (
        <div className="tarot-spread-overlay">
            {/* Header with spread name and close button */}
            <div className="spread-header">
                <div className="spread-info">
                    <h2 className="spread-title">{config.name}</h2>
                    <p className="spread-description">{config.description}</p>
                    <p className="spread-progress">
                        {cards.length} / {config.cardCount} cards revealed
                    </p>
                </div>
                {onClose && (
                    <button
                        type='button'
                        onClick={onClose}
                        className="spread-close-btn"
                        aria-label="Close spread"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
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
                )}
            </div>

            {/* Horizontal scrollable spread container */}
            <div
                ref={scrollContainerRef}
                className="spread-scroll-container"
            >
                <div className={`spread-layout spread-${spreadType.toLowerCase()}`}>
                    {cardPositions.map(({ card, position, index }) => (
                        <SpreadCard
                            key={card.id}
                            card={card}
                            position={position}
                            index={index}
                            isRevealed={isRevealing}
                            onClick={() => onCardClick?.(card, index)}
                        />
                    ))}

                    {/* Empty slots for unrevealed cards */}
                    {Array.from({ length: config.cardCount - cards.length }, (_, i) => {
                        const index = cards.length + i;
                        const position = config.positions[index];
                        if (!position) return null;

                        return (
                            <div
                                key={`empty-${index}`}
                                className="spread-card-container spread-card-empty"
                                style={{
                                    '--card-x': `${position.x}%`,
                                    '--card-y': `${position.y}%`,
                                    '--card-rotation': `${position.rotation}deg`,
                                } as React.CSSProperties}
                            >
                                <div className="spread-card-label spread-card-label-empty">
                                    {position.label}
                                </div>
                                <div className="spread-card-placeholder">
                                    <span className="text-2xl opacity-30">?</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scroll hint for mobile */}
            <div className="spread-scroll-hint">
                <span className="text-purple-300/60 text-sm">← Scroll to see all cards →</span>
            </div>
        </div>
    );
}

export default TarotSpreadDisplay;
