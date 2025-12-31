/**
 * Revealed Card Store
 * Manages the state of the currently revealed tarot card overlay
 */

import { create } from 'zustand';
import type { TarotCard } from '../types/tarot';

/**
 * State interface for revealed card management
 */
interface RevealedCardState {
  revealedCard: TarotCard | null;
  setRevealedCard: (card: TarotCard | null) => void;
  clearRevealedCard: () => void;
}

/**
 * Zustand store for managing the revealed card overlay state
 */
export const useRevealedCard = create<RevealedCardState>((set) => ({
  revealedCard: null,

  setRevealedCard: (card) => {
    set({ revealedCard: card });
  },

  clearRevealedCard: () => {
    set({ revealedCard: null });
  },
}));
