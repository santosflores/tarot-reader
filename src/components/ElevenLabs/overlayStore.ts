/**
 * Store to control ElevenLabsOverlay expansion from external components
 */

import { create } from 'zustand';

interface OverlayStore {
  expandRequested: boolean;
  requestExpand: () => void;
  clearRequest: () => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  expandRequested: false,
  requestExpand: () => set({ expandRequested: true }),
  clearRequest: () => set({ expandRequested: false }),
}));
