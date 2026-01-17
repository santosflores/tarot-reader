/**
 * TarotMeaningCard Component
 * Displays a tarot card preview in the grid
 */

import { Link } from 'react-router-dom';
import type { TarotCardMeaning } from '../../types/tarotMeaning';
import { ELEMENT_INFO } from '../../types/tarotMeaning';
import { getCardImageFromMeaning } from '../../data';

interface TarotMeaningCardProps {
    card: TarotCardMeaning;
}

export function TarotMeaningCard({ card }: TarotMeaningCardProps) {
    const elementInfo = ELEMENT_INFO[card.element];

    return (
        <Link
            to={`/tarot-card-meaning/${card.id}`}
            className="group block bg-gradient-to-br from-purple-900/40 to-indigo-900/40 
                 rounded-xl border border-purple-500/30 overflow-hidden
                 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20
                 transition-all duration-300 transform hover:-translate-y-1"
        >
            {/* Card Image */}
            <div className="relative aspect-[2/3] overflow-hidden bg-black/30">
                <img
                    src={getCardImageFromMeaning(card)}
                    alt={`${card.name} tarot card meaning`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {/* Element Badge */}
                <div
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                     bg-black/60 backdrop-blur-sm flex items-center gap-1"
                    style={{ color: elementInfo.color }}
                >
                    <span>{elementInfo.emoji}</span>
                    <span>{card.element}</span>
                </div>
            </div>

            {/* Card Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {card.name}
                </h3>
                <p className="text-sm text-purple-300/70 mb-2">
                    {card.arcana === 'major'
                        ? `Major Arcana • ${card.number}`
                        : `${card.suit} • ${card.rank}`}
                </p>
                <div className="flex flex-wrap gap-1">
                    {card.keywords.slice(0, 3).map((keyword) => (
                        <span
                            key={keyword}
                            className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
