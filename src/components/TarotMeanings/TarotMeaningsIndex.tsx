/**
 * TarotMeaningsIndex Component
 * Displays a grid of all 78 tarot cards with filtering
 * Public SEO page
 */

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TAROT_MEANINGS, getMajorArcana, getMinorArcana, getCardsBySuit } from '../../data';
import { TarotMeaningCard } from './TarotMeaningCard';
import type { ArcanaFilter, SuitFilter } from '../../types/tarotMeaning';
import type { TarotSuit } from '../../types/tarot';

const SUITS: TarotSuit[] = ['Cups', 'Pentacles', 'Swords', 'Wands'];

export function TarotMeaningsIndex() {
    const [arcanaFilter, setArcanaFilter] = useState<ArcanaFilter>('all');
    const [suitFilter, setSuitFilter] = useState<SuitFilter>('all');

    // SEO meta tags
    useEffect(() => {
        document.title = 'Tarot Card Meaning - Complete Guide to All 78 Cards';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Discover the meaning of all 78 tarot cards. Explore Major and Minor Arcana with detailed upright and reversed interpretations, keywords, and elemental associations.'
            );
        }
    }, []);

    // Filter cards based on selection
    const filteredCards = useMemo(() => {
        if (arcanaFilter === 'major') {
            return getMajorArcana();
        }

        if (arcanaFilter === 'minor') {
            if (suitFilter === 'all') {
                return getMinorArcana();
            }
            return getCardsBySuit(suitFilter as TarotSuit);
        }

        // All cards
        if (suitFilter !== 'all') {
            return getCardsBySuit(suitFilter as TarotSuit);
        }

        return TAROT_MEANINGS;
    }, [arcanaFilter, suitFilter]);

    // Reset suit filter when switching arcana
    const handleArcanaChange = (filter: ArcanaFilter) => {
        setArcanaFilter(filter);
        if (filter === 'major') {
            setSuitFilter('all');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            to="/"
                            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                        >
                            <span>←</span>
                            <span>Home</span>
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Tarot Card Meaning
                    </h1>
                    <p className="text-purple-300/70">
                        Explore the meaning of all 78 tarot cards
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    {/* Arcana Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleArcanaChange('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${arcanaFilter === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
                                }`}
                        >
                            All Cards
                        </button>
                        <button
                            onClick={() => handleArcanaChange('major')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${arcanaFilter === 'major'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
                                }`}
                        >
                            Major Arcana
                        </button>
                        <button
                            onClick={() => handleArcanaChange('minor')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${arcanaFilter === 'minor'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
                                }`}
                        >
                            Minor Arcana
                        </button>
                    </div>

                    {/* Suit Filter (only for Minor Arcana or All) */}
                    {arcanaFilter !== 'major' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSuitFilter('all')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${suitFilter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/40'
                                    }`}
                            >
                                All Suits
                            </button>
                            {SUITS.map((suit) => (
                                <button
                                    key={suit}
                                    onClick={() => setSuitFilter(suit)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${suitFilter === suit
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/40'
                                        }`}
                                >
                                    {suit}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Card Count */}
                <p className="text-purple-400/60 mb-6">
                    Showing {filteredCards.length} cards
                </p>

                {/* Card Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredCards.map((card) => (
                        <TarotMeaningCard key={card.id} card={card} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 py-12 text-center">
                <p className="text-purple-400/50 text-sm">
                    Learn the tarot card meaning for each of the 78 cards in the deck.
                    <br />
                    Click on any card to see its detailed interpretation.
                </p>
            </footer>
        </div>
    );
}
