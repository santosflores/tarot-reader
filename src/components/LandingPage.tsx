import React from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-mono selection:bg-purple-500/30">
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">

                {/* Header Profile Section */}
                <header className="flex flex-col items-center text-center mb-16 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20 ring-4 ring-slate-800">
                        <span className="text-4xl">🔮</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Tarot Reader</h1>
                    <p className="text-slate-400 text-lg">AI-Powered Mystical Guidance System</p>
                </header>

                {/* Main Links Container */}
                <main className="space-y-4 mb-16">

                    <Link
                        to="/app"
                        className="group block bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🚀</span>
                                <div>
                                    <h2 className="font-bold text-white">Enter the Application</h2>
                                    <p className="text-sm text-slate-400">Launch the 3D Tarot Experience</p>
                                </div>
                            </div>
                            <div className="text-slate-500 group-hover:text-purple-400 transition-colors">→</div>
                        </div>
                    </Link>

                    <a
                        href="#"
                        className="group block bg-slate-800/30 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">⚡️</span>
                            <div>
                                <h2 className="font-bold text-slate-200">Features</h2>
                                <p className="text-sm text-slate-400">Real-time 3D, Voice Synthesis, LLM Readings</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="#"
                        className="group block bg-slate-800/30 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">📱</span>
                            <div>
                                <h2 className="font-bold text-slate-200">Mobile Optimized</h2>
                                <p className="text-sm text-slate-400">Works on all your devices</p>
                            </div>
                        </div>
                    </a>

                </main>

                {/* Projects / Status Grid */}
                <section className="mb-16">
                    <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-6">Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/20 border border-slate-800 rounded-lg p-4">
                            <div className="text-green-400 text-xs font-bold mb-1">● ONLINE</div>
                            <div className="text-slate-300 text-sm">System Operational</div>
                        </div>
                        <div className="bg-slate-800/20 border border-slate-800 rounded-lg p-4">
                            <div className="text-purple-400 text-xs font-bold mb-1">v1.0.0</div>
                            <div className="text-slate-300 text-sm">Latest Release</div>
                        </div>
                    </div>
                </section>

                {/* Footer / Socials */}
                <footer className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-6 text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Email</a>
                    </div>
                    <div className="text-slate-600 text-sm">
                        © {new Date().getFullYear()} Tarot Reader. All rights reserved.
                    </div>
                </footer>

            </div>
        </div>
    );
}
