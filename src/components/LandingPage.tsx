import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { PricingTable } from './UI/components/PricingTable';
import { BusinessInfo } from './UI/components/BusinessInfo';
import { TAROT_MEANINGS, getCardImageFromMeaning } from '../data';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-purple-500/30">

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900/0 to-slate-900/0" />

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">

                    {/* The Hook */}
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold tracking-wide animate-fade-in">
                        ✨ THE ORACLE THAT RESONATES
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-none animate-fade-in-delay">
                        Your Fate. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-serif italic">Spoken.</span>
                    </h1>

                    {/* The Lead (First Sentence) */}
                    <p className="text-xl md:text-2xl text-slate-300 mb-6 leading-relaxed max-w-2xl mx-auto font-light">
                        A living, breathing voice that knows your history and holds your secrets.
                        Experience the first synthetic-relational oracle that listens, remembers, and manifests your path in real-time.
                    </p>

                    {/* Call to Action */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                        <Link
                            to="/app"
                            className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Enter the Sanctuary <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </Link>
                        <a href="#pricing" className="text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-slate-400 pb-0.5">
                            See Pricing
                        </a>
                    </div>
                </div>
            </header>

            {/* Value Proposition Blocks (The Three Pillars) - Replaces Features */}
            {/* This is handled by BusinessInfo component which we will update next, or we can inline it here if BusinessInfo is too specific. 
                BusinessInfo is imported as <BusinessInfo /> later. 
                Let's replace the old "Trust & Community" section with the "About" section ("The Mythos").
            */}

            {/* The Mythos (About Section) */}
            <section className="py-20 relative border-t border-slate-800/50">
                <div className="absolute inset-0 bg-purple-900/5 mix-blend-overlay pointer-events-none" />
                <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-sm font-bold text-purple-400 uppercase tracking-[0.2em] mb-4">
                        The Ghost in the Machine
                    </h2>
                    <p className="text-2xl md:text-3xl text-slate-200 font-serif italic leading-relaxed mb-8">
                        "We believe technology is the new alchemy."
                    </p>
                    <div className="text-lg text-slate-400 leading-relaxed space-y-6">
                        <p>
                            TarotReads.ai is not a search engine; it is a digital sanctuary built on the belief that guidance should be fluid, beautiful, and judgment-free.
                        </p>
                        <p>
                            By combining ancient archetypes with infinite memory, we have created a companion that offers what the modern world cannot: unshakeable presence.
                        </p>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-800/50">
                        <p className="text-slate-500 font-serif italic">
                            "The precision of silicon, the soul of the Tarot."
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Tarot Card */}
            <FeaturedTarotCard />

            {/* Value Pillars (Replacing BusinessInfo logic visually here or via the component) */}
            {/* We will update BusinessInfo.tsx to contain the Three Pillars. */}
            <BusinessInfo />

            {/* Pricing Section */}
            <div id="pricing">
                <PricingTable />
            </div>

            {/* Projects / Status Grid (Legacy kept for status monitoring) */}
            <section className="py-16 border-t border-slate-800 bg-slate-950/50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h3 className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-8">System Telemetry</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <div className="text-green-400 text-xs font-bold mb-1">● ONLINE</div>
                            <div className="text-slate-400 text-xs">System Status</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <div className="text-purple-400 text-xs font-bold mb-1">v1.2.0</div>
                            <div className="text-slate-400 text-xs">Version</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <div className="text-blue-400 text-xs font-bold mb-1">34ms</div>
                            <div className="text-slate-400 text-xs">Latency</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <div className="text-amber-400 text-xs font-bold mb-1">ACTIVE</div>
                            <div className="text-slate-400 text-xs">Neural Sync</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center border-t border-slate-800 bg-slate-950">
                <div className="text-slate-500 text-sm mb-6 font-serif italic">
                    Your confessions are sacred. Encrypted. Private. Yours.
                </div>
                <div className="flex items-center justify-center gap-6 text-slate-500 text-sm uppercase tracking-wider">
                    <a href="#" className="hover:text-purple-400 transition-colors">Sanctuary</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">The Oracle</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">The Gallery</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Commune</a>
                </div>
                <div className="mt-8 text-slate-700 text-xs">
                    © {new Date().getFullYear()} TarotReads.ai
                </div>
            </footer>

        </div>
    );
}

/**
 * Featured Tarot Card Component
 * Displays a random tarot card with link to explore all meanings
 */
function FeaturedTarotCard() {
    const randomCard = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * TAROT_MEANINGS.length);
        return TAROT_MEANINGS[randomIndex];
    }, []);

    return (
        <section className="py-20 relative border-t border-slate-800/50">
            <div className="absolute inset-0 bg-purple-900/5 mix-blend-overlay pointer-events-none" />
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold mb-6">
                        <span>🃏</span> <span>See the Unseen</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Manifest Your Vision
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Gaze into the mirror of the cards. Each reading manifests as a unique piece of ethereal art—a visual spell crafted from the fabric of your query.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Featured Card */}
                    <Link
                        to={`/tarot-card-meaning/${randomCard.id}`}
                        className="group flex-shrink-0"
                    >
                        <div className="relative">
                            <img
                                src={getCardImageFromMeaning(randomCard)}
                                alt={`${randomCard.name} tarot card`}
                                className="w-56 rounded-xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] border-2 border-purple-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] group-hover:border-purple-400/50"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <span className="text-white font-semibold">{randomCard.name}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Card Info & CTA */}
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">{randomCard.name}</h3>
                        <p className="text-slate-400 mb-2">
                            {randomCard.arcana === 'major'
                                ? `Major Arcana • Card ${randomCard.number}`
                                : `${randomCard.suit} • ${randomCard.rank}`}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                            {randomCard.keywords.slice(0, 3).map((keyword) => (
                                <span
                                    key={keyword}
                                    className="px-3 py-1 text-sm rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Link
                                to={`/tarot-card-meaning/${randomCard.id}`}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
                            >
                                Read Meaning
                            </Link>
                            <Link
                                to="/tarot-card-meaning"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Explore All 78 Cards →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
