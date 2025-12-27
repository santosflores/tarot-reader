/**
 * Chatbot/Audio store for managing audio playback and lipsync
 * Handles audio player initialization and lipsync manager
 */

import { create } from 'zustand';
import { Lipsync } from 'wawa-lipsync';
import type { ChatbotState, LipsyncManager } from '../types';
import { logError } from '../utils/errors';

interface ChatbotStore extends ChatbotState {
  lipsyncManagerInitialized: boolean;
}

// Store event handlers for cleanup
let audioEventHandlers: {
  onplaying: (() => void) | null;
  onended: (() => void) | null;
  onpause: (() => void) | null;
} = {
  onplaying: null,
  onended: null,
  onpause: null,
};

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
      logError(new Error('Audio API not available'), { context: 'useChatbot.setupAudioPlayer' });
      return;
    }

    const audioPlayer = new Audio();
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.preload = 'auto';

    const lipsyncManager = new Lipsync() as LipsyncManager;

    // Create event handlers
    const handlePlaying = () => {
      const state = get();
      if (!state.lipsyncManagerInitialized && state.lipsyncManager) {
        state.lipsyncManager.connectAudio(audioPlayer);
        set({ lipsyncManagerInitialized: true });
      }
      set({ isAudioPlaying: true });
    };

    const handleEnded = () => {
      set({ isAudioPlaying: false });
    };

    const handlePause = () => {
      set({ isAudioPlaying: false });
    };

    // Store handlers for cleanup
    audioEventHandlers.onplaying = handlePlaying;
    audioEventHandlers.onended = handleEnded;
    audioEventHandlers.onpause = handlePause;

    // Attach event handlers
    audioPlayer.onplaying = handlePlaying;
    audioPlayer.onended = handleEnded;
    audioPlayer.onpause = handlePause;

    set({ audioPlayer, lipsyncManager });
  },

  playAudio: (url: string) => {
    const audioPlayer = get().audioPlayer;
    if (!audioPlayer) {
      logError(new Error('Audio player not initialized. Call setupAudioPlayer() first.'), {
        context: 'useChatbot.playAudio',
      });
      return;
    }
    audioPlayer.src = url;
    audioPlayer.play().catch((error) => {
      logError(error, { context: 'useChatbot.playAudio', url });
    });
  },

  cleanup: () => {
    const { audioPlayer } = get();
    if (audioPlayer) {
      // Remove event handlers
      if (audioEventHandlers.onplaying) {
        audioPlayer.onplaying = null;
      }
      if (audioEventHandlers.onended) {
        audioPlayer.onended = null;
      }
      if (audioEventHandlers.onpause) {
        audioPlayer.onpause = null;
      }

      // Pause and reset audio
      audioPlayer.pause();
      audioPlayer.src = '';

      // Reset handlers
      audioEventHandlers = {
        onplaying: null,
        onended: null,
        onpause: null,
      };

      // Reset state
      set({
        audioPlayer: null,
        lipsyncManager: null,
        isAudioPlaying: false,
        lipsyncManagerInitialized: false,
      });
    }
  },
}));

// Note: setupAudioPlayer() should be called in a component's useEffect or App initialization
// Removed module-level side effect for better control

