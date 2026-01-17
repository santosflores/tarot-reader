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
            className="group block p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 
                 hover:border-purple-500/30 hover:bg-slate-800
                 transition-all duration-200"
        >
            {/* Card Image */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-3 bg-slate-900">
                <img
                    src={getCardImageFromMeaning(card)}
                    alt={`${card.name} tarot card meaning`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {/* Element Badge */}
                <div
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                     bg-slate-900/80 backdrop-blur-sm flex items-center gap-1"
                    style={{ color: elementInfo.color }}
                >
                    <span>{elementInfo.emoji}</span>
                </div>
            </div>

            {/* Card Info */}
            <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                {card.name}
            </h3>
            <p className="text-sm text-slate-400 mb-2">
                {card.arcana === 'major'
                    ? `Major • ${card.number}`
                    : `${card.suit}`}
            </p>
            <div className="flex flex-wrap gap-1">
                {card.keywords.slice(0, 2).map((keyword) => (
                    <span
                        key={keyword}
                        className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300"
                    >
                        {keyword}
                    </span>
                ))}
            </div>
        </Link>
    );
}
