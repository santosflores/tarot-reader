/**
 * Tarot Deck Hook
 * Custom React hook for managing Tarot deck state
 */

import { useState, useCallback } from 'react';
import type { TarotDeck, TarotCard, UseTarotDeckReturn } from '../types/tarot';
import {
  createTarotDeck,
  shuffleDeck,
  drawCards as drawCardsUtil,
} from '../utils/tarot';

/**
 * Custom hook for managing Tarot deck state
 * Provides functions to initialize, shuffle, draw cards, and reset the deck
 * @returns Deck state and control functions
 */
export function useTarotDeck(): UseTarotDeckReturn {
  const [deck, setDeck] = useState<TarotDeck | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if the deck has been initialized
   */
  const isInitialized = deck !== null;

  /**
   * Get the count of remaining cards in the deck
   */
  const remainingCount = deck?.length ?? 0;

  /**
   * Initialize a new unshuffled deck
   * Clears any previously drawn cards
   */
  const initializeDeck = useCallback(() => {
    setError(null);
    const newDeck = createTarotDeck();
    setDeck(newDeck);
    setDrawnCards([]);
    setIsShuffled(false);
  }, []);

  /**
   * Shuffle the current deck
   * Only works if a deck has been initialized
   */
  const shuffle = useCallback(() => {
    setError(null);

    if (!deck) {
      setError('Cannot shuffle: No deck has been initialized');
      return;
    }

    const shuffledDeck = shuffleDeck(deck);
    setDeck(shuffledDeck);
    setIsShuffled(true);
  }, [deck]);

  /**
   * Draw a specified number of cards from the deck
   * Adds drawn cards to the drawnCards array
   * @param count - Number of cards to draw
   */
  const drawCards = useCallback(
    (count: number) => {
      setError(null);

      if (!deck) {
        setError('Cannot draw cards: No deck has been initialized');
        return;
      }

      if (count < 1) {
        setError('Draw count must be at least 1');
        return;
      }

      if (count > deck.length) {
        setError(
          `Cannot draw ${count} cards. Only ${deck.length} cards remaining in the deck.`
        );
        return;
      }

      try {
        const result = drawCardsUtil(deck, count);
        setDeck(result.remaining);
        setDrawnCards((prev) => [...prev, ...result.drawn]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to draw cards');
      }
    },
    [deck]
  );

  /**
   * Reset the deck to its initial state
   * Clears all drawn cards and creates a fresh unshuffled deck
   */
  const reset = useCallback(() => {
    setError(null);
    setDeck(null);
    setDrawnCards([]);
    setIsShuffled(false);
  }, []);

  return {
    deck,
    drawnCards,
    isShuffled,
    isInitialized,
    error,
    remainingCount,
    initializeDeck,
    shuffle,
    drawCards,
    reset,
  };
}
