import { useState } from 'react';

interface PricingTierProps {
    name: string;
    price: string;
    credits: number;
    features: string[];
    isPopular?: boolean;
    color: string;
    billingCycle: 'monthly' | 'yearly';
}

const PricingTier = ({ name, price, credits, features, isPopular, color, billingCycle }: PricingTierProps) => {
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
                    <span className="text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <div className="mt-4 inline-block bg-slate-800/80 px-4 py-1 rounded-lg border border-slate-700/50">
                    <span className={`text-${color}-300 font-bold`}>{credits} Credits / mo</span>
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
                    Start Membership <span className="text-lg">→</span>
                </span>
                {isPopular && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />}
            </button>

            <p className="text-center text-xs text-slate-500 mt-3 relative z-10">
                {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
            </p>
        </div>
    );
};

export function PricingTable() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const tiers = [
        {
            name: "Apprentice",
            monthlyPrice: "9.99",
            yearlyPrice: "99.99",
            credits: 100,
            color: "blue",
            features: [
                "10 Minutes of Insight / mo",
                "Basic Interpretation",
                "Standard Avatar Mode",
                "Save 5 Readings"
            ]
        },
        {
            name: "Mystic",
            monthlyPrice: "29.99",
            yearlyPrice: "299.99",
            credits: 350,
            color: "purple",
            isPopular: true,
            features: [
                "35 Minutes of Wisdom / mo",
                "Deep Psychic Connection",
                "Full 3D Avatar Experience",
                "Unlimited Saved Readings",
                "Priority Access"
            ]
        },
        {
            name: "Oracle",
            monthlyPrice: "79.99",
            yearlyPrice: "799.99",
            credits: 1000,
            color: "amber",
            features: [
                "100 Minutes of Enlightenment / mo",
                "Master Level Interpretation",
                "Exclusive 'Void' Mode",
                "Future Predictions Report",
                "Direct Channel Access"
            ]
        }
    ];

    return (
        <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-100 to-purple-200 mb-6 font-serif">
                    Invest in Your Destiny
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg mb-8">
                    Knowledge is power. Clarity is priceless. Choose the vessel for your journey.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-8 bg-slate-800 rounded-full p-1 relative border border-slate-700 transition-colors hover:border-purple-500/50"
                    >
                        <div className={`w-6 h-6 bg-purple-500 rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                        Yearly <span className="text-purple-400 text-xs ml-1">(Save ~15%)</span>
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {tiers.map((tier) => (
                    <PricingTier
                        key={tier.name}
                        {...tier}
                        price={billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice}
                        billingCycle={billingCycle}
                    />
                ))}
            </div>

            <div className="mt-12 text-center text-slate-500 text-sm max-w-2xl mx-auto italic">
                * "Minutes" are approximate based on a standard 10 credits/minute burn rate.
                Unused credits roll over up to 2x your monthly limit.
            </div>
        </section>
    );
}
