/**
 * TarotMeaningPage Component
 * Individual tarot card detail page with full meaning
 * Public SEO page
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { findCardById, TAROT_MEANINGS, getCardImageFromMeaning } from '../../data';
import { ELEMENT_INFO } from '../../types/tarotMeaning';

export function TarotMeaningPage() {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();
    const [isImageOpen, setIsImageOpen] = useState(false);

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
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-300 mb-4">Card not found</p>
                    <Link
                        to="/tarot-card-meaning"
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors inline-block"
                    >
                        View All Cards
                    </Link>
                </div>
            </div>
        );
    }

    const elementInfo = ELEMENT_INFO[card.element];

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
                        <Link to="/tarot-card-meaning" className="hover:text-purple-400 transition-colors">Tarot Card Meanings</Link>
                        <span className="mx-2">›</span>
                        <span className="text-slate-200">{card.name}</span>
                    </nav>

                    {/* Card Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        {card.name}
                    </h1>

                    <p className="text-lg text-slate-400 mb-2">
                        {card.arcana === 'major'
                            ? `Major Arcana • Card ${card.number}`
                            : `Minor Arcana • ${card.suit} • ${card.rank}`}
                    </p>

                    {/* Element Badge */}
                    <div
                        className="inline-flex items-center gap-2 text-lg mt-2"
                        style={{ color: elementInfo.color }}
                    >
                        <span className="text-2xl">{elementInfo.emoji}</span>
                        <span className="font-medium">{card.element} Element</span>
                        {card.zodiacSign && (
                            <>
                                <span className="text-slate-600 mx-2">•</span>
                                <span className="text-slate-300">{card.zodiacSign}</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                    {/* Card Image */}
                    <div className="flex flex-col items-center md:items-start">
                        <button
                            onClick={() => setIsImageOpen(true)}
                            className="relative group cursor-zoom-in"
                        >
                            <img
                                src={getCardImageFromMeaning(card)}
                                alt={`${card.name} tarot card meaning`}
                                className="w-full max-w-[280px] rounded-xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] border-2 border-purple-500/30 transition-all group-hover:scale-[1.02] group-hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] group-hover:border-purple-400/50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-3 py-1.5 bg-black/70 text-white text-sm rounded-full">
                                    Click to enlarge
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-8">
                        {/* Keywords */}
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-3">Keywords</h2>
                            <div className="flex flex-wrap gap-2">
                                {card.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Upright Meaning */}
                        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">☀️</span>
                                <h2 className="text-xl font-semibold text-white">Upright Meaning</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {card.uprightMeaning.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-2 py-1 text-sm rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/30"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-300 leading-relaxed">{card.uprightMeaning.description}</p>
                        </div>

                        {/* Reversed Meaning */}
                        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🌙</span>
                                <h2 className="text-xl font-semibold text-white">Reversed Meaning</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {card.reversedMeaning.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-2 py-1 text-sm rounded-full bg-rose-900/30 text-rose-300 border border-rose-700/30"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-300 leading-relaxed">{card.reversedMeaning.description}</p>
                        </div>
                    </div>
                </div>

                {/* Card Navigation */}
                <div className="flex justify-between items-center mt-12 mb-12">
                    {prevCard ? (
                        <Link
                            to={`/tarot-card-meaning/${prevCard.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <span>←</span>
                            <span>{prevCard.name}</span>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextCard && (
                        <Link
                            to={`/tarot-card-meaning/${nextCard.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <span>{nextCard.name}</span>
                            <span>→</span>
                        </Link>
                    )}
                </div>

                {/* CTA to Tarot Reader */}
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Seek Deeper Guidance
                    </h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        Understanding {card.name} is just the beginning. Get a personalized tarot reading for your unique situation.
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
                <div className="flex items-center justify-center gap-6">
                    <Link to="/tarot-card-meaning" className="text-slate-400 hover:text-purple-400 transition-colors">
                        All Cards
                    </Link>
                    <Link to="/" className="text-slate-400 hover:text-purple-400 transition-colors">
                        Home
                    </Link>
                </div>
            </footer>
            {/* Full-screen Image Modal */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={getCardImageFromMeaning(card)}
                        alt={`${card.name} tarot card`}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
