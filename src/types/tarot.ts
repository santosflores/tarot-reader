/**
 * Tarot Card Type Definitions
 * TypeScript interfaces and types for Tarot deck operations
 */

/**
 * Minor Arcana suits
 */
export type TarotSuit = 'Cups' | 'Pentacles' | 'Swords' | 'Wands';

/**
 * Card arcana type
 */
export type TarotArcana = 'major' | 'minor';

/**
 * Minor Arcana card ranks
 */
export type MinorArcanaRank =
  | 'Ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'Page'
  | 'Knight'
  | 'Queen'
  | 'King';

/**
 * Major Arcana card numbers (0-21)
 */
export type MajorArcanaNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21;

/**
 * Major Arcana card interface
 */
export interface MajorArcanaCard {
  id: string;
  name: string;
  arcana: 'major';
  number: MajorArcanaNumber;
  description?: string;
}

/**
 * Minor Arcana card interface
 */
export interface MinorArcanaCard {
  id: string;
  name: string;
  arcana: 'minor';
  suit: TarotSuit;
  rank: MinorArcanaRank;
  description?: string;
}

/**
 * Union type for any Tarot card
 */
export type TarotCard = MajorArcanaCard | MinorArcanaCard;

/**
 * Type guard to check if a card is Major Arcana
 */
export function isMajorArcana(card: TarotCard): card is MajorArcanaCard {
  return card.arcana === 'major';
}

/**
 * Type guard to check if a card is Minor Arcana
 */
export function isMinorArcana(card: TarotCard): card is MinorArcanaCard {
  return card.arcana === 'minor';
}

/**
 * Tarot deck type (array of cards)
 */
export type TarotDeck = TarotCard[];

/**
 * Result of drawing cards from the deck
 */
export interface DrawCardsResult {
  drawn: TarotCard[];
  remaining: TarotDeck;
}

/**
 * State interface for deck management
 */
export interface TarotDeckState {
  deck: TarotDeck | null;
  drawnCards: TarotCard[];
  isShuffled: boolean;
  isInitialized: boolean;
}

/**
 * Hook return type for useTarotDeck
 */
export interface UseTarotDeckReturn extends TarotDeckState {
  initializeDeck: () => void;
  shuffle: () => void;
  drawCards: (count: number) => void;
  reset: () => void;
  error: string | null;
  remainingCount: number;
}
