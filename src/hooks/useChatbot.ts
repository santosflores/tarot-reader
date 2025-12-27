/**
 * Chatbot/Audio store for managing audio playback and lipsync
 * Handles audio player initialization and lipsync manager
 */

import { create } from 'zustand';
import { Lipsync } from 'wawa-lipsync';
import type { ChatbotState } from '../types';

interface ChatbotStore extends ChatbotState {
  lipsyncManagerInitialized: boolean;
}

export const useChatbot = create<ChatbotStore>((set, get) => ({
  audioPlayer: null,
  lipsyncManager: null,
  isAudioPlaying: false,
  lipsyncManagerInitialized: false,

  setupAudioPlayer: () => {
    // Prevent re-initialization
    if (get().audioPlayer) {
      return;
    }

    if (typeof Audio === 'undefined') {
      console.warn('Audio API not available');
      return;
    }

    const audioPlayer = new Audio();
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.preload = 'auto';

    const lipsyncManager = new Lipsync();

    audioPlayer.onplaying = () => {
      const state = get();
      if (!state.lipsyncManagerInitialized && state.lipsyncManager) {
        state.lipsyncManager.connectAudio(audioPlayer);
        set({ lipsyncManagerInitialized: true });
      }
      set({ isAudioPlaying: true });
    };

    audioPlayer.onended = () => {
      set({ isAudioPlaying: false });
    };

    audioPlayer.onpause = () => {
      set({ isAudioPlaying: false });
    };

    set({ audioPlayer, lipsyncManager });
  },

  playAudio: (url: string) => {
    const audioPlayer = get().audioPlayer;
    if (!audioPlayer) {
      console.warn('Audio player not initialized. Call setupAudioPlayer() first.');
      return;
    }
    audioPlayer.src = url;
    audioPlayer.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  },
}));

// Note: setupAudioPlayer() should be called in a component's useEffect or App initialization
// Removed module-level side effect for better control

