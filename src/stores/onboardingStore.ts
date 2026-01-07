/**
 * Onboarding Store
 * Zustand store to control onboarding tooltip visibility
 */

import { create } from 'zustand';

// Store to control tooltip visibility from outside
interface OnboardingStore {
  showRequested: boolean;
  requestShow: () => void;
  clearRequest: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  showRequested: false,
  requestShow: () => set({ showRequested: true }),
  clearRequest: () => set({ showRequested: false }),
}));
