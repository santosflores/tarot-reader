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
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <header className="relative pt-16 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900/0 to-slate-900/0" />

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm text-slate-400">
                        <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
                        <span className="mx-2">›</span>
                        <span className="text-slate-200">Tarot Card Meanings</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Tarot Card Meaning
                    </h1>

                    <p className="text-xl text-slate-300 mb-8">
                        Explore the meaning of all 78 tarot cards
                    </p>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        {/* Arcana Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleArcanaChange('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${arcanaFilter === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                All Cards
                            </button>
                            <button
                                onClick={() => handleArcanaChange('major')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${arcanaFilter === 'major'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                Major Arcana
                            </button>
                            <button
                                onClick={() => handleArcanaChange('minor')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${arcanaFilter === 'minor'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${suitFilter === 'all'
                                            ? 'bg-slate-700 text-white'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    All Suits
                                </button>
                                {SUITS.map((suit) => (
                                    <button
                                        key={suit}
                                        onClick={() => setSuitFilter(suit)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${suitFilter === suit
                                                ? 'bg-slate-700 text-white'
                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {suit}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 pb-20">
                {/* Card Count */}
                <p className="text-slate-400 mb-6">
                    Showing {filteredCards.length} cards
                </p>

                {/* Card Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCards.map((card) => (
                        <TarotMeaningCard key={card.id} card={card} />
                    ))}
                </div>

                {/* CTA to Tarot Reader */}
                <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Ready for a Personal Reading?
                    </h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        Understanding the cards is just the beginning. Experience a live tarot reading with our AI psychic.
                    </p>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                    >
                        Get Your Tarot Reading <span>→</span>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center border-t border-slate-800">
                <Link to="/" className="text-slate-400 hover:text-purple-400 transition-colors">
                    ← Back to Home
                </Link>
            </footer>
        </div>
    );
}
