/**
 * HoroscopePage component
 * Displays a single horoscope for a zodiac sign on a specific date
 * Includes SEO meta tags and view tracking
 */

import { track } from '@vercel/analytics';
import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ZODIAC_SIGNS, ZODIAC_INFO, Horoscope, Persona, ZodiacSign } from '../../types/horoscope';

interface HoroscopeWithPersona extends Horoscope {
    persona: Persona;
}

export function HoroscopePage() {
    const { date, sign } = useParams<{ date: string; sign: string }>();

    const [horoscope, setHoroscope] = useState<HoroscopeWithPersona | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const viewTrackedRef = useRef(false);
    const sessionStartRef = useRef<number>(Date.now());

    // Validate zodiac sign
    const validSign = sign && ZODIAC_SIGNS.includes(sign as ZodiacSign);
    const zodiacInfo = validSign ? ZODIAC_INFO[sign as ZodiacSign] : null;

    // Format date for display
    const formattedDate = date
        ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    useEffect(() => {
        if (!validSign || !date) {
            setError('Invalid zodiac sign or date');
            setLoading(false);
            return;
        }

        async function fetchHoroscope() {
            if (!date || !sign) return;

            console.log('Fetching horoscope for:', date, sign);
            setLoading(true);
            setError(null);
            setHoroscope(null);

            const { data, error: fetchError } = await supabase
                .from('horoscopes')
                .select(`
          *,
          persona:personas(id, name, slug, description, avatar_url)
        `)
                .eq('publish_date', date)
                .eq('zodiac_sign', sign)
                .eq('status', 'published')
                .single();

            console.log('Fetch result:', { data, fetchError });

            if (fetchError || !data) {
                console.error('Error fetching horoscope:', fetchError);
                setError('Horoscope not found for this date and sign.');
                setLoading(false);
                return;
            }

            setHoroscope({
                ...data,
                status: data.status as 'draft' | 'published',
                zodiac_sign: data.zodiac_sign as ZodiacSign,
                persona: data.persona as unknown as Persona,
            });
            setLoading(false);
        }

        fetchHoroscope();
        sessionStartRef.current = Date.now();
        viewTrackedRef.current = false;
    }, [date, sign, validSign]);

    // Track view after horoscope loads
    useEffect(() => {
        if (horoscope && !viewTrackedRef.current) {
            viewTrackedRef.current = true;
            trackView(horoscope.id);

            // Vercel Analytics Event
            track('horoscope_view', {
                sign: horoscope.zodiac_sign,
                persona: horoscope.persona.name,
                date: horoscope.publish_date
            });
        }
    }, [horoscope]);

    // ... existing code ...

    function handleTarotClick() {
        // Track CTA click
        if (horoscope) {
            // Vercel Analytics Event
            track('tarot_cta_click', {
                sign: horoscope.zodiac_sign,
                persona: horoscope.persona.name,
                source: 'horoscope_page'
            });

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            fetch(`${supabaseUrl}/functions/v1/track-horoscope-view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    horoscope_id: horoscope.id,
                    referrer: document.referrer || null,
                    clicked_tarot_cta: true,
                    session_duration_seconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
                }),
            }).catch(console.error);
        }
    }

    // Get adjacent signs for navigation
    const currentIndex = ZODIAC_SIGNS.indexOf(sign as ZodiacSign);
    const prevSign = currentIndex > 0 ? ZODIAC_SIGNS[currentIndex - 1] : ZODIAC_SIGNS[11];
    const nextSign = currentIndex < 11 ? ZODIAC_SIGNS[currentIndex + 1] : ZODIAC_SIGNS[0];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <header className="relative pt-16 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900/0 to-slate-900/0" />

                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm text-slate-400">
                        <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
                        <span className="mx-2">›</span>
                        <Link to={`/horoscope/${date}`} className="hover:text-purple-400 transition-colors">Horoscopes</Link>
                        <span className="mx-2">›</span>
                        <span className="text-slate-200">{zodiacInfo?.name}</span>
                    </nav>

                    {zodiacInfo && (
                        <>
                            {/* Zodiac Symbol */}
                            <div className="text-7xl mb-4">{zodiacInfo.symbol}</div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {zodiacInfo.name} Horoscope
                            </h1>

                            <p className="text-lg text-slate-400 mb-2">
                                {zodiacInfo.dates} • {zodiacInfo.element} Sign
                            </p>

                            <p className="text-xl text-slate-300">
                                {formattedDate}
                            </p>
                        </>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link
                            to={`/horoscope/${date}`}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors inline-block"
                        >
                            View All Horoscopes
                        </Link>
                    </div>
                ) : horoscope ? (
                    <>
                        {/* Horoscope Content */}
                        <article className="prose prose-invert prose-lg max-w-none mb-12">
                            <div className="text-xl leading-relaxed text-slate-200 whitespace-pre-line">
                                {horoscope.content}
                            </div>
                        </article>

                        {/* Persona Attribution */}
                        <div className="flex items-center gap-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700 mb-12">
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">
                                ✦
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Written by</p>
                                <p className="font-semibold text-white">{horoscope.persona.name}</p>
                                <p className="text-sm text-slate-400">{horoscope.persona.description}</p>
                            </div>
                        </div>

                        {/* Sign Navigation */}
                        <div className="flex justify-between items-center mb-12">
                            <Link
                                to={`/horoscope/${date}/${prevSign}`}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <span>←</span>
                                <span>{ZODIAC_INFO[prevSign].symbol} {ZODIAC_INFO[prevSign].name}</span>
                            </Link>
                            <Link
                                to={`/horoscope/${date}/${nextSign}`}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <span>{ZODIAC_INFO[nextSign].symbol} {ZODIAC_INFO[nextSign].name}</span>
                                <span>→</span>
                            </Link>
                        </div>

                        {/* CTA to Tarot Reader */}
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Seek Deeper Guidance
                            </h2>
                            <p className="text-slate-300 mb-6 max-w-md mx-auto">
                                Your daily horoscope offers a glimpse. A personalized tarot reading
                                reveals the full picture of your destiny.
                            </p>
                            <Link
                                to="/app"
                                onClick={handleTarotClick}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                            >
                                Get Your Tarot Reading <span>→</span>
                            </Link>
                        </div>
                    </>
                ) : null}
            </main>

            {/* Footer */}
            <footer className="py-8 text-center border-t border-slate-800">
                <div className="flex items-center justify-center gap-6">
                    <Link to={`/horoscope/${date}`} className="text-slate-400 hover:text-purple-400 transition-colors">
                        All Signs
                    </Link>
                    <Link to="/" className="text-slate-400 hover:text-purple-400 transition-colors">
                        Home
                    </Link>
                </div>
            </footer>
        </div>
    );
}

// Helper to update/create meta tags
function updateMetaTag(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}
