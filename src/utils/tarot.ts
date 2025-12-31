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

/**
 * Finds a card by name in a deck
 * Performs case-insensitive matching
 * @param deck - The deck to search in
 * @param name - The card name to search for
 * @returns The matching card or null if not found
 */
export function findCardByName(deck: TarotDeck, name: string): TarotCard | null {
  const normalizedName = name.toLowerCase().trim();
  return deck.find((card) => card.name.toLowerCase() === normalizedName) ?? null;
}

/**
 * Special filename mappings for cards with non-standard filenames
 * Maps card names to their actual image filenames (without extension)
 */
const CARD_FILENAME_OVERRIDES: Record<string, string> = {
  'The Hierophant': 'the_heirophant', // Note: filename has typo
};

/**
 * Maps digit ranks to their written-out word equivalents for filenames
 */
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

/**
 * Gets the image path for a tarot card
 * Converts card name to the corresponding image filename in /images/tarot/
 * @param card - The tarot card to get the image path for
 * @returns The path to the card's image (e.g., "/images/tarot/the_fool.png")
 */
export function getCardImagePath(card: TarotCard): string {
  // Check for filename overrides first
  if (CARD_FILENAME_OVERRIDES[card.name]) {
    return `/images/tarot/${CARD_FILENAME_OVERRIDES[card.name]}.png`;
  }

  let cardName = card.name;

  // For Minor Arcana cards with numeric ranks, convert digit to word
  // e.g., "9 of Cups" → "Nine of Cups"
  if (card.arcana === 'minor') {
    const numericRank = card.rank;
    if (RANK_NUMBER_TO_WORD[numericRank]) {
      cardName = cardName.replace(numericRank, RANK_NUMBER_TO_WORD[numericRank]);
    }
  }

  // Convert card name to filename format:
  // - Convert to lowercase
  // - Replace spaces with underscores
  const filename = cardName.toLowerCase().replace(/\s+/g, '_');

  return `/images/tarot/${filename}.png`;
}
