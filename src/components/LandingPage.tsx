import { Link } from 'react-router-dom';
import { PricingTable } from './UI/components/PricingTable';
import { BusinessInfo } from './UI/components/BusinessInfo';

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
                        ✨ UNLOCK YOUR DESTINY
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-none animate-fade-in-delay">
                        Discover What <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-serif italic">the Cards Reveal</span>
                    </h1>

                    {/* The Lead (First Sentence) */}
                    <p className="text-xl md:text-2xl text-slate-300 mb-6 leading-relaxed max-w-2xl mx-auto font-light">
                        You have a question that keeps you up at night.
                    </p>

                    {/* Curiosity & Connection */}
                    <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
                        We combine ancient wisdom with AI to guide you.
                    </p>

                    {/* Call to Action */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                        <Link
                            to="/app"
                            className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Begin Your Reading <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </Link>
                        <a href="#pricing" className="text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-slate-400 pb-0.5">
                            See Pricing
                        </a>
                    </div>

                    {/* Daily Horoscopes Link */}
                    <div className="mb-20">
                        <Link
                            to="/horoscope"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <span>✦</span>
                            <span className="border-b border-purple-400/30 hover:border-purple-300">Read Today's Horoscopes</span>
                            <span>→</span>
                        </Link>
                    </div>

                    {/* Social Proof / Credibility */}
                    <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-slate-800 pt-8 opacity-70">
                        <div>
                            <div className="font-bold text-white text-2xl">24/7</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Availability</div>
                        </div>
                        <div>
                            <div className="font-bold text-white text-2xl">100%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Private</div>
                        </div>
                        <div>
                            <div className="font-bold text-white text-2xl">∞</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Possibilities</div>
                        </div>
                    </div>

                </div>
            </header>

            {/* Trust & Community Section */}
            <section className="py-20 relative border-t border-slate-800/50">
                <div className="absolute inset-0 bg-purple-900/5 mix-blend-overlay pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 relative z-10">

                    {/* Stats */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold mb-6">
                            <span>🚀</span> <span>Trusted by Thousands</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">+4,000 Readings</span> Delivered
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Join a growing community of seekers finding clarity, direction, and peace through our AI-powered guidance.
                        </p>
                    </div>

                    {/* Testimonials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Testimonial 1 */}
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
                            <p className="text-slate-300 mb-4 italic">"I was skeptical about AI tarot, but the accuracy was chilling. It picked up on exactly what I was going through."</p>
                            <div className="text-sm">
                                <span className="font-semibold text-white block">Sarah M.</span>
                                <span className="text-slate-500">New York, NY</span>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
                            <p className="text-slate-300 mb-4 italic">"The voice interaction makes it feel so real. It's like having a spiritual advisor in my pocket 24/7."</p>
                            <div className="text-sm">
                                <span className="font-semibold text-white block">James R.</span>
                                <span className="text-slate-500">London, UK</span>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                            <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
                            <p className="text-slate-300 mb-4 italic">"Daily horoscopes are spot on. This app has become part of my morning ritual for mindfulness."</p>
                            <div className="text-sm">
                                <span className="font-semibold text-white block">Elena K.</span>
                                <span className="text-slate-500">Toronto, CA</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Business Info / Science of Magic */}
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
                <div className="text-slate-600 text-sm mb-4">
                    © {new Date().getFullYear()} Tarot Reader. Unlock the mysteries of your path.
                </div>
                <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
                    <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a>
                </div>
            </footer>

        </div>
    );
}
