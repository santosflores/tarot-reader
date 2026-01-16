/**
 * Horoscope types for the SEO horoscope feature
 */

export const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export interface ZodiacInfo {
    name: string;
    dates: string;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    symbol: string;
    emoji: string;
}

export const ZODIAC_INFO: Record<ZodiacSign, ZodiacInfo> = {
    aries: { name: 'Aries', dates: 'Mar 21 - Apr 19', element: 'Fire', symbol: '♈', emoji: '🐏' },
    taurus: { name: 'Taurus', dates: 'Apr 20 - May 20', element: 'Earth', symbol: '♉', emoji: '🐂' },
    gemini: { name: 'Gemini', dates: 'May 21 - Jun 20', element: 'Air', symbol: '♊', emoji: '👯' },
    cancer: { name: 'Cancer', dates: 'Jun 21 - Jul 22', element: 'Water', symbol: '♋', emoji: '🦀' },
    leo: { name: 'Leo', dates: 'Jul 23 - Aug 22', element: 'Fire', symbol: '♌', emoji: '🦁' },
    virgo: { name: 'Virgo', dates: 'Aug 23 - Sep 22', element: 'Earth', symbol: '♍', emoji: '👧' },
    libra: { name: 'Libra', dates: 'Sep 23 - Oct 22', element: 'Air', symbol: '♎', emoji: '⚖️' },
    scorpio: { name: 'Scorpio', dates: 'Oct 23 - Nov 21', element: 'Water', symbol: '♏', emoji: '🦂' },
    sagittarius: { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', element: 'Fire', symbol: '♐', emoji: '🏹' },
    capricorn: { name: 'Capricorn', dates: 'Dec 22 - Jan 19', element: 'Earth', symbol: '♑', emoji: '🐐' },
    aquarius: { name: 'Aquarius', dates: 'Jan 20 - Feb 18', element: 'Air', symbol: '♒', emoji: '🏺' },
    pisces: { name: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', symbol: '♓', emoji: '🐟' },
};

export interface Persona {
    id: string;
    name: string;
    slug: string;
    description: string;
    avatar_url: string | null;
}

export interface Horoscope {
    id: string;
    zodiac_sign: ZodiacSign;
    persona_id: string;
    publish_date: string;
    content: string;
    title: string;
    meta_description: string;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    persona?: Persona;
}

export interface HoroscopeWithPersona extends Horoscope {
    persona: Persona;
}
