/**
 * Store to control ElevenLabsOverlay expansion from external components
 */

import { create } from 'zustand';
import type { OverlayStore } from '../../types/store';

export const useOverlayStore = create<OverlayStore>((set) => ({
  expandRequested: false,
  requestExpand: () => set({ expandRequested: true }),
  clearRequest: () => set({ expandRequested: false }),
}));
