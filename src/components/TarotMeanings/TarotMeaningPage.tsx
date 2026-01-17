/**
 * TarotMeaningPage Component
 * Individual tarot card detail page with full meaning
 * Public SEO page - fetches from database with static fallback
 */

import { JSX, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { findCardById, TAROT_MEANINGS, getCardImageFromMeaning } from '../../data';
import { ELEMENT_INFO, TarotCardMeaning } from '../../types/tarotMeaning';
import { supabase } from '../../lib/supabase';

interface DbTarotCard {
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    number: number | null;
    suit: string | null;
    rank: string | null;
    element: string;
    zodiac_sign: string | null;
    content: string;
}

interface CardData {
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    number?: number;
    suit?: string;
    rank?: string;
    element: string;
    zodiacSign?: string;
    content: string;
}

function mapDbToCardData(dbCard: DbTarotCard): CardData {
    return {
        id: dbCard.id,
        name: dbCard.name,
        arcana: dbCard.arcana,
        number: dbCard.number ?? undefined,
        suit: dbCard.suit ?? undefined,
        rank: dbCard.rank ?? undefined,
        element: dbCard.element,
        zodiacSign: dbCard.zodiac_sign ?? undefined,
        content: dbCard.content,
    };
}

function mapStaticToCardData(staticCard: TarotCardMeaning): CardData {
    // Build content from static data
    const content = `## Overview

${staticCard.keywords.join(', ')}

## Upright Meaning

**Keywords:** ${staticCard.uprightMeaning.keywords.join(', ')}

${staticCard.uprightMeaning.description}

## Reversed Meaning

**Keywords:** ${staticCard.reversedMeaning.keywords.join(', ')}

${staticCard.reversedMeaning.description}`;

    return {
        id: staticCard.id,
        name: staticCard.name,
        arcana: staticCard.arcana,
        number: staticCard.number,
        suit: staticCard.suit,
        rank: staticCard.rank,
        element: staticCard.element,
        zodiacSign: staticCard.zodiacSign,
        content,
    };
}

/**
 * Simple markdown renderer for content
 * Renders headers, bold, paragraphs
 */
function MarkdownContent({ content }: { content: string }) {
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        let currentParagraph: string[] = [];
        let key = 0;

        const flushParagraph = () => {
            if (currentParagraph.length > 0) {
                const paragraphText = currentParagraph.join(' ').trim();
                if (paragraphText) {
                    elements.push(
                        <p key={key++} className="text-slate-300 leading-relaxed mb-4">
                            {renderInlineMarkdown(paragraphText)}
                        </p>
                    );
                }
                currentParagraph = [];
            }
        };

        const renderInlineMarkdown = (text: string) => {
            // Handle bold text
            const parts = text.split(/\*\*(.*?)\*\*/g);
            return parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
            );
        };

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine === '') {
                flushParagraph();
                continue;
            }

            // H1 headers (render as H2 style for hierarchy)
            if (trimmedLine.startsWith('# ')) {
                flushParagraph();
                elements.push(
                    <h2 key={key++} className="text-xl font-semibold text-white mt-6 mb-3">
                        {trimmedLine.slice(2)}
                    </h2>
                );
                continue;
            }

            // H2 headers
            if (trimmedLine.startsWith('## ')) {
                flushParagraph();
                elements.push(
                    <h2 key={key++} className="text-xl font-semibold text-white mt-6 mb-3">
                        {trimmedLine.slice(3)}
                    </h2>
                );
                continue;
            }

            // H3 headers
            if (trimmedLine.startsWith('### ')) {
                flushParagraph();
                elements.push(
                    <h3 key={key++} className="text-lg font-semibold text-white mt-4 mb-2">
                        {trimmedLine.slice(4)}
                    </h3>
                );
                continue;
            }

            // Bullet points
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                flushParagraph();
                elements.push(
                    <li key={key++} className="text-slate-300 ml-4 mb-1">
                        {renderInlineMarkdown(trimmedLine.slice(2))}
                    </li>
                );
                continue;
            }

            // Regular text - add to current paragraph
            currentParagraph.push(trimmedLine);
        }

        flushParagraph();
        return elements;
    };

    return <div className="prose-content">{renderMarkdown(content)}</div>;
}

export function TarotMeaningPage() {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [dbCard, setDbCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch from database
    useEffect(() => {
        async function fetchCard() {
            if (!cardId) return;

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('tarot_card_meanings')
                    .select('*')
                    .eq('id', cardId)
                    .single();

                if (!error && data) {
                    setDbCard(mapDbToCardData(data as DbTarotCard));
                }
            } catch (e) {
                console.error('Error fetching tarot card:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchCard();
    }, [cardId]);

    // Use database card if available, otherwise fall back to static
    const staticCard = useMemo(() => {
        if (!cardId) return null;
        const found = findCardById(cardId);
        return found ? mapStaticToCardData(found) : null;
    }, [cardId]);

    const card = dbCard || staticCard;

    // Get static card for image lookup
    const staticCardForImage = useMemo(() => {
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
                    `Learn the meaning of ${card.name}. Discover upright and reversed interpretations for this ${card.arcana} arcana card.`
                );
            }
        }
    }, [card]);

    // Redirect if card not found
    useEffect(() => {
        if (cardId && !loading && !card) {
            navigate('/tarot-card-meaning', { replace: true });
        }
    }, [cardId, card, loading, navigate]);

    // Scroll to top on navigation
    useEffect(() => {
        globalThis.scrollTo(0, 0);
    }, [cardId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="animate-pulse text-purple-400">Loading...</div>
            </div>
        );
    }

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

    const elementInfo = ELEMENT_INFO[card.element as keyof typeof ELEMENT_INFO];

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
                    {elementInfo && (
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
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                    {/* Card Image */}
                    <div className="flex flex-col items-center md:items-start">
                        <button
                            type="button"
                            onClick={() => setIsImageOpen(true)}
                            className="relative group cursor-zoom-in"
                        >
                            {staticCardForImage && (
                                <img
                                    src={getCardImageFromMeaning(staticCardForImage)}
                                    alt={`${card.name} tarot card meaning`}
                                    className="w-full max-w-[280px] rounded-xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] border-2 border-purple-500/30 transition-all group-hover:scale-[1.02] group-hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] group-hover:border-purple-400/50"
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-3 py-1.5 bg-black/70 text-white text-sm rounded-full">
                                    Click to enlarge
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Card Content - Markdown rendered */}
                    <div>
                        <MarkdownContent content={card.content} />
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
            {isImageOpen && staticCardForImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={getCardImageFromMeaning(staticCardForImage)}
                        alt={`${card.name} tarot card`}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
