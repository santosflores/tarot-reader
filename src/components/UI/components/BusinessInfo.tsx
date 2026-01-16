
export function BusinessInfo() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-sm font-bold text-purple-400 uppercase tracking-[0.2em] mb-3 animate-fade-in">
                        How It Works
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 font-serif">
                        AI-Powered Tarot Readings
                    </h3>
                    <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
                        Experience personalized guidance through our immersive 3D tarot experience.
                        Every reading is uniquely crafted for you.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-12 mb-24">

                    {/* Feature 1 */}
                    <div className="group">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-purple-500/50 transition-colors duration-300">
                            <span className="text-3xl">🧠</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-purple-300 transition-colors">
                            Personalized Insights
                        </h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Our AI synthesizes card meanings, positions, and <strong>your specific question</strong>
                            to deliver readings that feel genuinely personal and meaningful.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-indigo-500/50 transition-colors duration-300">
                            <span className="text-3xl">⚛️</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-indigo-300 transition-colors">
                            Immersive 3D Experience
                        </h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Watch cards shuffle, draw, and reveal in a stunning 3D environment.
                            Every spread is uniquely generated for you in real-time.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-pink-500/50 transition-colors duration-300">
                            <span className="text-3xl">🛡️</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-pink-300 transition-colors">
                            100% Private
                        </h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Your questions deserve absolute privacy. All sessions are encrypted
                            and your history is accessible only to you.
                        </p>
                    </div>
                </div>

                {/* The Credit System - How it Works */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">
                                Simple & Transparent Pricing
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">1</div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-1">Get Credits</h5>
                                        <p className="text-slate-400 text-sm">Purchase credits anytime. No subscriptions required.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">2</div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-1">Enter the Session</h5>
                                        <p className="text-slate-400 text-sm">Connect with the AI avatar. The connection costs <span className="text-white font-bold">10 credits per minute</span>.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm shrink-0">3</div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-1">Receive Wisdom</h5>
                                        <p className="text-slate-400 text-sm">Ask clarifying questions. Dig deeper. You only pay for the time you use.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Decorative Card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                    <span className="text-slate-400 font-mono text-xs">SESSION_STATUS</span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-green-500 text-xs font-bold tracking-wider">LIVE</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-2 bg-slate-800 rounded w-full"></div>
                                    <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                                </div>

                                <div className="flex items-center justify-between bg-slate-950 rounded-lg p-3 border border-slate-800">
                                    <div className="text-xs text-slate-500">Rate</div>
                                    <div className="text-sm font-mono text-purple-400">10 CREDITS / MIN</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
