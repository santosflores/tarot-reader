/**
 * Chatbot/Audio store for managing audio playback and lipsync
 * Handles audio player initialization, file playback, and WebRTC audio streams
 */

import { create } from 'zustand';
import { Lipsync } from 'wawa-lipsync';
import type { ChatbotState, LipsyncManager, AudioSourceType } from '../types';
import { logError } from '../utils/errors';
import { createWebRTCLipsyncAnalyzer } from '../utils/webrtcLipsync';

interface ChatbotStore extends ChatbotState {
  lipsyncManagerInitialized: boolean;
  webrtcLipsyncInitialized: boolean;
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
  webrtcAudioPlayer: null,
  lipsyncManager: null,
  webrtcLipsyncManager: null,
  isAudioPlaying: false,
  audioSourceType: null,
  lipsyncManagerInitialized: false,
  webrtcLipsyncInitialized: false,

  setupAudioPlayer: () => {
    // Prevent re-initialization of file audio player
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

    // Create event handlers for file-based audio
    const handlePlaying = () => {
      const state = get();
      if (!state.lipsyncManagerInitialized && state.lipsyncManager) {
        state.lipsyncManager.connectAudio(audioPlayer);
        set({ lipsyncManagerInitialized: true });
      }
      set({ isAudioPlaying: true, audioSourceType: 'file' });
    };

    const handleEnded = () => {
      set({ isAudioPlaying: false, audioSourceType: null });
    };

    const handlePause = () => {
      set({ isAudioPlaying: false, audioSourceType: null });
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
    const { audioPlayer, webrtcAudioPlayer } = get();
    
    // Disconnect WebRTC audio if active
    if (webrtcAudioPlayer) {
      get().disconnectWebRTCAudio();
    }
    
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

  connectWebRTCAudio: (mediaStream: MediaStream) => {
    const state = get();
    
    if (import.meta.env.DEV) {
      console.log('[useChatbot] Connecting WebRTC audio', {
        tracks: mediaStream.getAudioTracks().length,
        active: mediaStream.active,
      });
    }

    // Disconnect existing WebRTC audio if any
    if (state.webrtcLipsyncManager) {
      get().disconnectWebRTCAudio();
    }

    // Create our custom WebRTC lipsync analyzer
    // This works directly with the MediaStream without needing an audio element
    const webrtcLipsyncManager = createWebRTCLipsyncAnalyzer();
    webrtcLipsyncManager.connectStream(mediaStream);

    if (import.meta.env.DEV) {
      console.log('[useChatbot] WebRTC lipsync analyzer connected');
    }

    set({ 
      webrtcAudioPlayer: null, // We don't need an audio element for WebRTC
      webrtcLipsyncManager,
      webrtcLipsyncInitialized: true,
      isAudioPlaying: true,
      audioSourceType: 'webrtc'
    });
  },

  disconnectWebRTCAudio: () => {
    const { webrtcLipsyncManager } = get();
    
    if (webrtcLipsyncManager) {
      webrtcLipsyncManager.disconnect();
      
      if (import.meta.env.DEV) {
        console.log('[useChatbot] WebRTC lipsync analyzer disconnected');
      }

      set({
        webrtcAudioPlayer: null,
        webrtcLipsyncManager: null,
        webrtcLipsyncInitialized: false,
        isAudioPlaying: false,
        audioSourceType: null,
      });
    }
  },

  cleanup: () => {
    const { audioPlayer, webrtcAudioPlayer } = get();
    
    // Clean up WebRTC audio
    if (webrtcAudioPlayer) {
      get().disconnectWebRTCAudio();
    }
    
    // Clean up file audio
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
        audioSourceType: null,
        lipsyncManagerInitialized: false,
      });
    }
  },
}));

// Note: setupAudioPlayer() should be called in a component's useEffect or App initialization
// Removed module-level side effect for better control

