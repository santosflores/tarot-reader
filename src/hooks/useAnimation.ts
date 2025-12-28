/**
 * Animation store for managing character animations
 * Separated from camera store for better organization
 */

import { create } from 'zustand';
import type { AnimationState, AnimationName } from '../types';
import { DEFAULT_ANIMATION, AVAILABLE_ANIMATIONS } from '../config/animations';

interface AnimationStore extends AnimationState {
  animationFiles?: Record<string, string>;
}

export const useAnimation = create<AnimationStore>((set, get) => ({
  currentAnimation: DEFAULT_ANIMATION,
  availableAnimations: AVAILABLE_ANIMATIONS as AnimationName[],
  animationFiles: {},

  setCurrentAnimation: (animation: AnimationName) => {
    set({ currentAnimation: animation });
  },

  addAnimation: (animation: AnimationName) => {
    set((state) => {
      if (!state.availableAnimations.includes(animation)) {
        return {
          availableAnimations: [...state.availableAnimations, animation],
        };
      }
      return state;
    });
  },

  registerAnimation: (name: AnimationName, filePath: string) => {
    const state = get();
    if (!state.availableAnimations.includes(name)) {
      set({
        availableAnimations: [...state.availableAnimations, name],
        animationFiles: {
          ...state.animationFiles,
          [name]: filePath,
        },
      });
    }
  },
}));

