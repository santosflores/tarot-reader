/**
 * TarotMeaningPage Component
 * Individual tarot card detail page with full meaning
 * Public SEO page
 */

import { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { findCardById, TAROT_MEANINGS, getCardImageFromMeaning } from '../../data';
import { ELEMENT_INFO } from '../../types/tarotMeaning';

export function TarotMeaningPage() {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();

    const card = useMemo(() => {
        if (!cardId) return null;
        return findCardById(cardId);
    }, [cardId]);

    // Navigation to prev/next card
    const { prevCard, nextCard } = useMemo(() => {
        if (!card) return { prevCard: null, nextCard: null };
        const currentIndex = TAROT_MEANINGS.findIndex((c) => c.id === card.id);
        return {
            prevCard: currentIndex > 0 ? TAROT_MEANINGS[currentIndex - 1] : null,
            nextCard: currentIndex < TAROT_MEANINGS.length - 1 ? TAROT_MEANINGS[currentIndex + 1] : null,
        };
    }, [card]);

    // SEO meta tags
    useEffect(() => {
        if (card) {
            document.title = `${card.name} Tarot Card Meaning - Upright & Reversed`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute(
                    'content',
                    `Learn the meaning of ${card.name}. Keywords: ${card.keywords.join(', ')}. Discover upright and reversed interpretations.`
                );
            }
        }
    }, [card]);

    // Redirect if card not found
    useEffect(() => {
        if (cardId && !card) {
            navigate('/tarot-card-meaning', { replace: true });
        }
    }, [cardId, card, navigate]);

    if (!card) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-purple-300 mb-4">Card not found</p>
                    <Link to="/tarot-card-meaning" className="text-purple-400 hover:text-purple-300">
                        ← Back to all cards
                    </Link>
                </div>
            </div>
        );
    }

    const elementInfo = ELEMENT_INFO[card.element];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/tarot-card-meaning"
                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>All Cards</span>
                    </Link>
                    <div className="flex gap-2">
                        {prevCard && (
                            <Link
                                to={`/tarot-card-meaning/${prevCard.id}`}
                                className="px-3 py-1.5 text-sm bg-purple-900/30 text-purple-300 rounded-lg hover:bg-purple-800/40 transition-colors"
                            >
                                ← Prev
                            </Link>
                        )}
                        {nextCard && (
                            <Link
                                to={`/tarot-card-meaning/${nextCard.id}`}
                                className="px-3 py-1.5 text-sm bg-purple-900/30 text-purple-300 rounded-lg hover:bg-purple-800/40 transition-colors"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-[300px_1fr] gap-8">
                    {/* Card Image */}
                    <div className="flex flex-col items-center">
                        <div className="sticky top-24">
                            <img
                                src={getCardImageFromMeaning(card)}
                                alt={`${card.name} tarot card meaning`}
                                className="w-full max-w-[300px] rounded-xl shadow-2xl shadow-purple-500/20"
                            />
                            {/* Element Badge */}
                            <div
                                className="mt-4 flex items-center justify-center gap-2 text-lg"
                                style={{ color: elementInfo.color }}
                            >
                                <span className="text-2xl">{elementInfo.emoji}</span>
                                <span className="font-medium">{card.element} Element</span>
                            </div>
                        </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-8">
                        {/* Title & Meta */}
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{card.name}</h1>
                            <p className="text-xl text-purple-300/70 mb-4">
                                {card.arcana === 'major'
                                    ? `Major Arcana • Card ${card.number}`
                                    : `Minor Arcana • ${card.suit} • ${card.rank}`}
                            </p>
                            {card.zodiacSign && (
                                <p className="text-purple-400/60">
                                    Associated with: <span className="text-purple-300">{card.zodiacSign}</span>
                                </p>
                            )}
                        </div>

                        {/* Keywords */}
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-3">Keywords</h2>
                            <div className="flex flex-wrap gap-2">
                                {card.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Upright Meaning */}
                        <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-xl p-6 border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">☀️</span>
                                <h2 className="text-xl font-semibold text-emerald-300">Upright Meaning</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {card.uprightMeaning.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-2 py-1 text-sm rounded-full bg-emerald-500/20 text-emerald-200"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-200 leading-relaxed">{card.uprightMeaning.description}</p>
                        </div>

                        {/* Reversed Meaning */}
                        <div className="bg-gradient-to-br from-rose-900/30 to-red-900/20 rounded-xl p-6 border border-rose-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🌙</span>
                                <h2 className="text-xl font-semibold text-rose-300">Reversed Meaning</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {card.reversedMeaning.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-2 py-1 text-sm rounded-full bg-rose-500/20 text-rose-200"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-200 leading-relaxed">{card.reversedMeaning.description}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-12 pt-8 border-t border-purple-500/20 flex justify-between">
                    {prevCard ? (
                        <Link
                            to={`/tarot-card-meaning/${prevCard.id}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            ← {prevCard.name}
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextCard && (
                        <Link
                            to={`/tarot-card-meaning/${nextCard.id}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            {nextCard.name} →
                        </Link>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-5xl mx-auto px-4 py-12 text-center">
                <Link
                    to="/tarot-card-meaning"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                    View All Tarot Card Meanings
                </Link>
            </footer>
        </div>
    );
}
