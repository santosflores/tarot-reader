
interface PricingTierProps {
    name: string;
    price: string;
    credits: number;
    features: string[];
    isPopular?: boolean;
    color: string;
}

const PricingTier = ({ name, price, credits, features, isPopular, color }: PricingTierProps) => {
    return (
        <div className={`relative p-8 rounded-2xl border ${isPopular ? 'border-purple-500/50 bg-slate-800/60' : 'border-slate-700/50 bg-slate-900/40'} backdrop-blur-md flex flex-col transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20 group`}>

            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg border border-purple-400/30">
                    MOST POPULAR
                </div>
            )}

            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-${color}-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="mb-8 text-center relative z-10">
                <h3 className={`text-xl font-bold text-${color}-400 mb-2 uppercase tracking-wider`}>{name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-slate-400">/ pack</span>
                </div>
                <div className="mt-4 inline-block bg-slate-800/80 px-4 py-1 rounded-lg border border-slate-700/50">
                    <span className={`text-${color}-300 font-bold`}>{credits} Credits</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1 relative z-10">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-300 text-sm">
                        <span className={`text-${color}-400 mt-0.5`}>✦</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group/btn ${isPopular ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Purchase Pack <span className="text-lg">→</span>
                </span>
                {isPopular && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />}
            </button>

            <p className="text-center text-xs text-slate-500 mt-3 relative z-10">
                Credits never expire
            </p>
        </div>
    );
};

export function PricingTable() {
    const tiers = [
        {
            name: "Spark",
            price: "4.99",
            credits: 500,
            color: "blue",
            features: [
                "~50 Minutes of Insight",
                "Full 3D Avatar Experience",
                "Save Conversation History",
                "Access to All Reading Modes"
            ]
        },
        {
            name: "Cosmic",
            price: "14.99",
            credits: 2000,
            color: "purple",
            isPopular: true,
            features: [
                "~200 Minutes of Wisdom",
                "Full 3D Avatar Experience",
                "Save Conversation History",
                "Access to All Reading Modes",
                "33% Bonus Credits"
            ]
        },
        {
            name: "Infinity",
            price: "29.99",
            credits: 5000,
            color: "amber",
            features: [
                "~500 Minutes of Enlightenment",
                "Full 3D Avatar Experience",
                "Save Conversation History",
                "Access to All Reading Modes",
                "66% Bonus Credits"
            ]
        }
    ];

    return (
        <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-100 to-purple-200 mb-6 font-serif uppercase tracking-tighter">
                    Invest in Your Destiny
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg mb-8 leading-relaxed">
                    One-time energy transfers for casual seekers. No commitments, just pure wisdom.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {tiers.map((tier) => (
                    <PricingTier
                        key={tier.name}
                        {...tier}
                    />
                ))}
            </div>

            <div className="mt-12 text-center text-slate-500 text-sm max-w-2xl mx-auto italic">
                * All energy exchanges are processed through encrypted spiritual channels.
            </div>
        </section>
    );
}


