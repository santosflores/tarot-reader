/**
 * Tarot Card Meaning Types
 * Extended types for tarot card meanings with interpretations
 */

import type { TarotSuit, MinorArcanaRank } from './tarot';

/**
 * Element associations for tarot cards
 */
export type TarotElement = 'Fire' | 'Earth' | 'Air' | 'Water' | 'Spirit';

/**
 * Meaning interpretation (upright or reversed)
 */
export interface CardInterpretation {
    keywords: string[];
    description: string;
}

/**
 * Complete tarot card meaning with all metadata
 */
export interface TarotCardMeaning {
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    number?: number;
    suit?: TarotSuit;
    rank?: MinorArcanaRank;
    element: TarotElement;
    zodiacSign?: string;
    keywords: string[];
    uprightMeaning: CardInterpretation;
    reversedMeaning: CardInterpretation;
}

/**
 * Arcana filter options
 */
export type ArcanaFilter = 'all' | 'major' | 'minor';

/**
 * Suit filter options (including 'all')
 */
export type SuitFilter = 'all' | TarotSuit;

/**
 * Element display info
 */
export const ELEMENT_INFO: Record<TarotElement, { emoji: string; color: string }> = {
    Fire: { emoji: '🔥', color: '#ef4444' },
    Earth: { emoji: '🌍', color: '#22c55e' },
    Air: { emoji: '💨', color: '#3b82f6' },
    Water: { emoji: '💧', color: '#06b6d4' },
    Spirit: { emoji: '✨', color: '#a855f7' },
};
