/**
 * Custom hook for capturing audio from ElevenLabs WebRTC conversation
 * and connecting it to the lipsync system
 */

import { useEffect, useRef, useCallback } from 'react';
import { useChatbot } from './useChatbot';

interface UseElevenLabsAudioOptions {
  /** Whether the conversation is connected */
  isConnected: boolean;
  /** Current mode of the agent (speaking/listening) */
  mode?: 'speaking' | 'listening' | null;
}

interface UseElevenLabsAudioReturn {
  /** Prepare for audio capture (call before starting session) */
  prepareCapture: () => void;
  /** Stop capturing audio */
  stopCapture: () => void;
}

// Store original RTCPeerConnection for restoration
let OriginalRTCPeerConnection: typeof RTCPeerConnection | null = null;
// Track if patched
let isPatchActive = false;
// Callback to notify when audio track is received
let onAudioTrackCallback: ((stream: MediaStream) => void) | null = null;

/**
 * Patches RTCPeerConnection to intercept audio tracks
 * This is necessary because ElevenLabs SDK doesn't expose the connection directly
 * MUST be called BEFORE starting the WebRTC session
 */
function patchRTCPeerConnection(): void {
  if (isPatchActive) return; // Already patched

  OriginalRTCPeerConnection = window.RTCPeerConnection;
  isPatchActive = true;

  // Create a patched version
  const PatchedRTCPeerConnection = function (
    this: RTCPeerConnection,
    config?: RTCConfiguration
  ): RTCPeerConnection {
    const connection = new OriginalRTCPeerConnection!(config);

    if (import.meta.env.DEV) {
      console.log('[RTCPeerConnection Patch] New connection created');
    }

    // Listen for incoming tracks
    connection.addEventListener('track', (event: RTCTrackEvent) => {
      if (import.meta.env.DEV) {
        console.log('[RTCPeerConnection Patch] Track received:', event.track.kind);
      }
      
      if (event.track.kind === 'audio') {
        // Get or create stream from the track
        const stream = event.streams[0] || new MediaStream([event.track]);
        
        if (onAudioTrackCallback) {
          onAudioTrackCallback(stream);
        }
      }
    });

    return connection;
  } as unknown as typeof RTCPeerConnection;

  // Copy static properties and prototype
  PatchedRTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
  Object.setPrototypeOf(PatchedRTCPeerConnection, OriginalRTCPeerConnection);

  // Copy static methods
  PatchedRTCPeerConnection.generateCertificate = OriginalRTCPeerConnection.generateCertificate;

  window.RTCPeerConnection = PatchedRTCPeerConnection;

  if (import.meta.env.DEV) {
    console.log('[RTCPeerConnection Patch] Patch applied');
  }
}

/**
 * Restores the original RTCPeerConnection
 */
function restoreRTCPeerConnection(): void {
  if (OriginalRTCPeerConnection && isPatchActive) {
    window.RTCPeerConnection = OriginalRTCPeerConnection;
    OriginalRTCPeerConnection = null;
    isPatchActive = false;
    onAudioTrackCallback = null;

    if (import.meta.env.DEV) {
      console.log('[RTCPeerConnection Patch] Patch removed');
    }
  }
}

/**
 * Hook to capture and manage ElevenLabs WebRTC audio for lipsync
 */
export function useElevenLabsAudio({
  isConnected,
  mode,
}: UseElevenLabsAudioOptions): UseElevenLabsAudioReturn {
  const connectWebRTCAudio = useChatbot((state) => state.connectWebRTCAudio);
  const disconnectWebRTCAudio = useChatbot((state) => state.disconnectWebRTCAudio);
  
  const audioStreamRef = useRef<MediaStream | null>(null);
  const hasConnectedRef = useRef(false);

  // Handle audio track received from WebRTC
  const handleAudioTrack = useCallback((stream: MediaStream) => {
    if (hasConnectedRef.current) return; // Only connect once per session
    
    audioStreamRef.current = stream;
    hasConnectedRef.current = true;
    connectWebRTCAudio(stream);
    
    if (import.meta.env.DEV) {
      console.log('[useElevenLabsAudio] Audio stream captured from WebRTC', {
        tracks: stream.getAudioTracks().length,
        active: stream.active,
      });
    }
  }, [connectWebRTCAudio]);

  // Prepare for capture - call this BEFORE starting the session
  const prepareCapture = useCallback(() => {
    onAudioTrackCallback = handleAudioTrack;
    patchRTCPeerConnection();
    
    if (import.meta.env.DEV) {
      console.log('[useElevenLabsAudio] Prepared for audio capture');
    }
  }, [handleAudioTrack]);

  // Stop capturing
  const stopCapture = useCallback(() => {
    hasConnectedRef.current = false;
    
    if (audioStreamRef.current) {
      disconnectWebRTCAudio();
      audioStreamRef.current = null;
    }
    
    restoreRTCPeerConnection();
    
    if (import.meta.env.DEV) {
      console.log('[useElevenLabsAudio] Stopped audio capture');
    }
  }, [disconnectWebRTCAudio]);

  // Patch RTCPeerConnection on mount to capture connections created by SDK
  useEffect(() => {
    prepareCapture();
    
    return () => {
      stopCapture();
    };
  }, [prepareCapture, stopCapture]);

  // Cleanup when disconnected
  useEffect(() => {
    if (!isConnected && hasConnectedRef.current) {
      stopCapture();
    }
  }, [isConnected, stopCapture]);

  // Update audio playing state based on agent mode
  useEffect(() => {
    if (mode === 'speaking' && audioStreamRef.current) {
      // Agent is speaking - ensure audio is marked as playing
      useChatbot.setState({ isAudioPlaying: true, audioSourceType: 'webrtc' });
    } else if (mode === 'listening') {
      // Agent stopped speaking
      useChatbot.setState({ isAudioPlaying: false });
    }
  }, [mode]);

  return {
    prepareCapture,
    stopCapture,
  };
}
