/**
 * Tarot Meanings Data Index
 * Aggregates all 78 tarot card meanings
 */

import type { TarotCardMeaning } from '../types/tarotMeaning';
import { MAJOR_ARCANA_MEANINGS } from './majorArcanaMeanings';
import { CUPS_MEANINGS } from './cupsMeanings';
import { PENTACLES_MEANINGS } from './pentaclesMeanings';
import { SWORDS_MEANINGS } from './swordsMeanings';
import { WANDS_MEANINGS } from './wandsMeanings';

/**
 * Complete deck of 78 tarot card meanings
 */
export const TAROT_MEANINGS: TarotCardMeaning[] = [
    ...MAJOR_ARCANA_MEANINGS,
    ...CUPS_MEANINGS,
    ...PENTACLES_MEANINGS,
    ...SWORDS_MEANINGS,
    ...WANDS_MEANINGS,
];

/**
 * Find a card meaning by ID
 */
export function findCardById(id: string): TarotCardMeaning | undefined {
    return TAROT_MEANINGS.find((card) => card.id === id);
}

/**
 * Get all Major Arcana cards
 */
export function getMajorArcana(): TarotCardMeaning[] {
    return MAJOR_ARCANA_MEANINGS;
}

/**
 * Get all Minor Arcana cards
 */
export function getMinorArcana(): TarotCardMeaning[] {
    return [...CUPS_MEANINGS, ...PENTACLES_MEANINGS, ...SWORDS_MEANINGS, ...WANDS_MEANINGS];
}

/**
 * Get cards by suit
 */
export function getCardsBySuit(suit: 'Cups' | 'Pentacles' | 'Swords' | 'Wands'): TarotCardMeaning[] {
    switch (suit) {
        case 'Cups':
            return CUPS_MEANINGS;
        case 'Pentacles':
            return PENTACLES_MEANINGS;
        case 'Swords':
            return SWORDS_MEANINGS;
        case 'Wands':
            return WANDS_MEANINGS;
    }
}

/**
 * Get card image path from card meaning
 */
export function getCardImageFromMeaning(card: TarotCardMeaning): string {
    // Reuse the filename logic from utils/tarot.ts
    const RANK_NUMBER_TO_WORD: Record<string, string> = {
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine',
        '10': 'ten',
    };

    const CARD_FILENAME_OVERRIDES: Record<string, string> = {
        'The Hierophant': 'the_heirophant',
    };

    // Check for filename overrides first
    if (CARD_FILENAME_OVERRIDES[card.name]) {
        return `/images/tarot/${CARD_FILENAME_OVERRIDES[card.name]}.png`;
    }

    let cardName = card.name;

    // For Minor Arcana cards with numeric ranks, convert digit to word
    if (card.arcana === 'minor' && card.rank) {
        if (RANK_NUMBER_TO_WORD[card.rank]) {
            cardName = cardName.replace(card.rank, RANK_NUMBER_TO_WORD[card.rank]);
        }
    }

    // Convert card name to filename format
    const filename = cardName.toLowerCase().replace(/\s+/g, '_');
    return `/images/tarot/${filename}.png`;
}

// Re-export individual data files
export { MAJOR_ARCANA_MEANINGS } from './majorArcanaMeanings';
export { CUPS_MEANINGS } from './cupsMeanings';
export { PENTACLES_MEANINGS } from './pentaclesMeanings';
export { SWORDS_MEANINGS } from './swordsMeanings';
export { WANDS_MEANINGS } from './wandsMeanings';
