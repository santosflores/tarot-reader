/**
 * Revealed Cards Store
 * Manages the state of revealed tarot cards overlay
 */

import { create } from 'zustand';
import type { TarotCard } from '../types/tarot';

/**
 * State interface for revealed cards management
 */
interface RevealedCardsState {
  revealedCards: TarotCard[];
  addRevealedCard: (card: TarotCard) => void;
  removeRevealedCard: (cardId: string) => void;
  clearRevealedCards: () => void;
}

/**
 * Zustand store for managing the revealed cards overlay state
 */
export const useRevealedCard = create<RevealedCardsState>((set) => ({
  revealedCards: [],

  addRevealedCard: (card) => {
    set((state) => {
      // Avoid duplicates by checking if card is already revealed
      if (state.revealedCards.some((c) => c.id === card.id)) {
        return state;
      }
      return { revealedCards: [...state.revealedCards, card] };
    });
  },

  removeRevealedCard: (cardId) => {
    set((state) => ({
      revealedCards: state.revealedCards.filter((c) => c.id !== cardId),
    }));
  },

  clearRevealedCards: () => {
    set({ revealedCards: [] });
  },
}));
