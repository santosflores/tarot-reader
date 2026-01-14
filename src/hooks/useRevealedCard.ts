/**
 * Revealed Cards Store
 * Manages the state of revealed tarot cards overlay and spread configuration
 */

import { create } from 'zustand';
import type { TarotCard } from '../types/tarot.ts';
import type { SpreadType } from '../types/tarotSpread.ts';
import { getSpreadConfig, inferSpreadType } from '../types/tarotSpread.ts';

/**
 * State interface for revealed cards management
 */
interface RevealedCardsState {
  revealedCards: TarotCard[];
  currentSpreadType: SpreadType | null;
  isSpreadComplete: boolean;

  addRevealedCard: (card: TarotCard) => void;
  removeRevealedCard: (cardId: string) => void;
  clearRevealedCards: () => void;
  setSpreadType: (type: SpreadType | null) => void;
  startNewReading: (spreadType: SpreadType) => void;
}

/**
 * Zustand store for managing the revealed cards overlay state
 */
export const useRevealedCard = create<RevealedCardsState>((set) => ({
  revealedCards: [],
  currentSpreadType: null,
  isSpreadComplete: false,

  addRevealedCard: (card) => {
    set((state) => {
      // Avoid duplicates by checking if card is already revealed
      if (state.revealedCards.some((c) => c.id === card.id)) {
        return state;
      }

      const newCards = [...state.revealedCards, card];

      // Auto-infer spread type if not set
      let spreadType = state.currentSpreadType;
      if (!spreadType) {
        spreadType = inferSpreadType(newCards.length);
      }

      // Check if spread is complete
      const config = spreadType ? getSpreadConfig(spreadType) : null;
      const isComplete = config ? newCards.length >= config.cardCount : false;

      return {
        revealedCards: newCards,
        currentSpreadType: spreadType,
        isSpreadComplete: isComplete,
      };
    });
  },

  removeRevealedCard: (cardId) => {
    set((state) => {
      const newCards = state.revealedCards.filter((c) => c.id !== cardId);
      const config = state.currentSpreadType ? getSpreadConfig(state.currentSpreadType) : null;
      const isComplete = config ? newCards.length >= config.cardCount : false;

      return {
        revealedCards: newCards,
        isSpreadComplete: isComplete,
      };
    });
  },

  clearRevealedCards: () => {
    set({
      revealedCards: [],
      currentSpreadType: null,
      isSpreadComplete: false,
    });
  },

  setSpreadType: (type) => {
    set((state) => {
      const config = type ? getSpreadConfig(type) : null;
      const isComplete = config ? state.revealedCards.length >= config.cardCount : false;

      return {
        currentSpreadType: type,
        isSpreadComplete: isComplete,
      };
    });
  },

  startNewReading: (spreadType) => {
    set({
      revealedCards: [],
      currentSpreadType: spreadType,
      isSpreadComplete: false,
    });
  },
}));
