/**
 * HoroscopeIndex component
 * Displays a grid of all zodiac signs for a given date
 * Public page for SEO
 */

import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ZodiacCard } from './ZodiacCard';
import { ZODIAC_SIGNS, Persona } from '../../types/horoscope';

interface HoroscopePreview {
    zodiac_sign: string;
    content: string;
}

export function HoroscopeIndex() {
    const { date } = useParams<{ date?: string }>();
    const navigate = useNavigate();

    const [horoscopes, setHoroscopes] = useState<HoroscopePreview[]>([]);
    const [persona, setPersona] = useState<Persona | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use provided date or default to today
    const today = new Date().toISOString().split('T')[0];
    const displayDate = date || today;

    // Format date for display
    const formattedDate = new Date(displayDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        async function fetchHoroscopes() {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('horoscopes')
                .select(`
          zodiac_sign,
          content,
          persona:personas(id, name, slug, description, avatar_url)
        `)
                .eq('publish_date', displayDate)
                .eq('status', 'published');

            if (fetchError) {
                setError('Unable to load horoscopes. Please try again later.');
                setLoading(false);
                return;
            }

            if (data && data.length > 0) {
                setHoroscopes(data.map(h => ({
                    zodiac_sign: h.zodiac_sign,
                    content: h.content,
                })));
                // All horoscopes for a day share the same persona
                if (data[0].persona) {
                    setPersona(data[0].persona as unknown as Persona);
                }
            }

            setLoading(false);
        }

        fetchHoroscopes();
    }, [displayDate]);

    // SEO meta tags
    useEffect(() => {
        document.title = `Daily Horoscopes for ${formattedDate} | Virtual Tarot`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content',
                `Read your daily horoscope for ${formattedDate}. Personalized guidance for all 12 zodiac signs from our cosmic advisors.`
            );
        }
    }, [formattedDate]);

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
                        <span className="text-slate-200">Horoscopes</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Daily Horoscopes
                    </h1>

                    <p className="text-xl text-slate-300 mb-6">
                        {formattedDate}
                    </p>

                    {persona && (
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="text-purple-400">✦</span>
                            <span>
                                Written by <strong className="text-slate-200">{persona.name}</strong>
                            </span>
                        </div>
                    )}

                    {/* Date Navigation */}
                    <div className="mt-8 flex items-center gap-4">
                        <button
                            onClick={() => {
                                const prevDate = new Date(displayDate);
                                prevDate.setDate(prevDate.getDate() - 1);
                                navigate(`/horoscope/${prevDate.toISOString().split('T')[0]}`);
                            }}
                            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            ← Previous Day
                        </button>
                        {displayDate !== today && (
                            <Link
                                to="/horoscope"
                                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                            >
                                Today's Horoscopes
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : horoscopes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 mb-4">
                            No horoscopes available for this date yet.
                        </p>
                        <Link
                            to="/horoscope"
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors inline-block"
                        >
                            View Today's Horoscopes
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Zodiac Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ZODIAC_SIGNS.map((sign) => {
                                const horoscope = horoscopes.find(h => h.zodiac_sign === sign);
                                return (
                                    <ZodiacCard
                                        key={sign}
                                        sign={sign}
                                        date={displayDate}
                                        preview={horoscope?.content.slice(0, 80) + '...'}
                                    />
                                );
                            })}
                        </div>

                        {/* CTA to Tarot Reader */}
                        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Want Deeper Insights?
                            </h2>
                            <p className="text-slate-300 mb-6 max-w-md mx-auto">
                                Get a personalized tarot reading from our AI Oracle.
                                Discover what the cards reveal about your path.
                            </p>
                            <Link
                                to="/app"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                            >
                                Start Your Reading <span>→</span>
                            </Link>
                        </div>
                    </>
                )}
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
