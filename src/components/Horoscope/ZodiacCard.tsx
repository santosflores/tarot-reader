/**
 * ZodiacCard component
 * Displays a zodiac sign card with symbol, name, and dates
 */

import { Link } from 'react-router-dom';
import { ZodiacSign, ZODIAC_INFO } from '../../types/horoscope';

interface ZodiacCardProps {
    sign: ZodiacSign;
    date: string; // YYYY-MM-DD format
    preview?: string; // Optional preview text
}

const ELEMENT_COLORS: Record<string, string> = {
    Fire: 'from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-400/50',
    Earth: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/50',
    Air: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 hover:border-sky-400/50',
    Water: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-400/50',
};

export function ZodiacCard({ sign, date, preview }: ZodiacCardProps) {
    const info = ZODIAC_INFO[sign];
    const elementStyle = ELEMENT_COLORS[info.element];

    return (
        <Link
            to={`/horoscope/${date}/${sign}`}
            className={`
        group relative block p-6 rounded-2xl
        bg-gradient-to-br ${elementStyle}
        border backdrop-blur-sm
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10
      `}
        >
            {/* Zodiac Symbol */}
            <div className="text-5xl mb-3 text-white/90 group-hover:scale-110 transition-transform">
                {info.symbol}
            </div>

            {/* Name & Dates */}
            <h3 className="text-xl font-bold text-white mb-1">
                {info.name}
            </h3>
            <p className="text-sm text-slate-400 mb-3">
                {info.dates}
            </p>

            {/* Element Badge */}
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-slate-300 bg-white/10 rounded-full">
                {info.element}
            </span>

            {/* Preview Text */}
            {preview && (
                <p className="mt-4 text-sm text-slate-300 line-clamp-2">
                    {preview}
                </p>
            )}

            {/* Arrow indicator */}
            <div className="absolute top-6 right-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                →
            </div>
        </Link>
    );
}
