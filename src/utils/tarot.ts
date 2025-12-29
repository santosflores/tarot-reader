/**
 * Tarot Deck Utilities
 * Pure functions for Tarot deck operations
 */

import type {
  TarotCard,
  TarotDeck,
  TarotSuit,
  MinorArcanaRank,
  MajorArcanaNumber,
  MajorArcanaCard,
  MinorArcanaCard,
  DrawCardsResult,
} from '../types/tarot';

/**
 * Major Arcana card names in order (0-21)
 */
const MAJOR_ARCANA_NAMES: readonly string[] = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
] as const;

/**
 * Minor Arcana suits in order
 */
const SUITS: readonly TarotSuit[] = ['Cups', 'Pentacles', 'Swords', 'Wands'] as const;

/**
 * Minor Arcana ranks in order
 */
const RANKS: readonly MinorArcanaRank[] = [
  'Ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Page',
  'Knight',
  'Queen',
  'King',
] as const;

/**
 * Creates the 22 Major Arcana cards
 * @returns Array of Major Arcana cards
 */
function createMajorArcana(): MajorArcanaCard[] {
  return MAJOR_ARCANA_NAMES.map((name, index) => ({
    id: `major-${index}`,
    name,
    arcana: 'major' as const,
    number: index as MajorArcanaNumber,
  }));
}

/**
 * Creates the 56 Minor Arcana cards (14 cards × 4 suits)
 * @returns Array of Minor Arcana cards
 */
function createMinorArcana(): MinorArcanaCard[] {
  const cards: MinorArcanaCard[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `minor-${suit.toLowerCase()}-${rank.toLowerCase()}`,
        name: `${rank} of ${suit}`,
        arcana: 'minor' as const,
        suit,
        rank,
      });
    }
  }

  return cards;
}

/**
 * Creates a complete 78-card Tarot deck
 * The deck is returned in standard order (not shuffled)
 * @returns Complete Tarot deck with 22 Major Arcana and 56 Minor Arcana cards
 */
export function createTarotDeck(): TarotDeck {
  const majorArcana = createMajorArcana();
  const minorArcana = createMinorArcana();
  return [...majorArcana, ...minorArcana];
}

/**
 * Shuffles a Tarot deck using the Fisher-Yates algorithm
 * This is a pure function that returns a new shuffled array
 * @param deck - The deck to shuffle
 * @returns A new shuffled deck (original deck is not modified)
 */
export function shuffleDeck(deck: TarotDeck): TarotDeck {
  // Create a copy to avoid mutating the original
  const shuffled = [...deck];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Draws a specified number of cards from the top of the deck
 * This is a pure function that returns both the drawn cards and the remaining deck
 * @param deck - The deck to draw from
 * @param count - Number of cards to draw
 * @returns Object containing drawn cards and remaining deck
 * @throws Error if count is invalid or exceeds deck size
 */
export function drawCards(deck: TarotDeck, count: number): DrawCardsResult {
  if (count < 1) {
    throw new Error('Draw count must be at least 1');
  }

  if (count > deck.length) {
    throw new Error(
      `Cannot draw ${count} cards from a deck with only ${deck.length} cards`
    );
  }

  // Draw from the top of the deck (beginning of array)
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);

  return { drawn, remaining };
}

/**
 * Creates a fresh unshuffled deck (alias for createTarotDeck)
 * Useful for resetting the deck to its initial state
 * @returns A new 78-card Tarot deck in standard order
 */
export function resetDeck(): TarotDeck {
  return createTarotDeck();
}

/**
 * Gets the display name for a card
 * @param card - The card to get the display name for
 * @returns Formatted display name
 */
export function getCardDisplayName(card: TarotCard): string {
  return card.name;
}

/**
 * Gets a short identifier for a card
 * @param card - The card to get the identifier for
 * @returns Short identifier (e.g., "0-Fool" or "Cups-Ace")
 */
export function getCardShortId(card: TarotCard): string {
  if (card.arcana === 'major') {
    return `${card.number}-${card.name.replace(/^The\s+/, '')}`;
  }
  return `${card.suit}-${card.rank}`;
}
