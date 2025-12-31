/**
 * Custom hook for managing viseme (lip sync) animations
 * Handles mouth morph targets based on audio playback (file or WebRTC)
 */

import { useCallback, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { VISEMES } from 'wawa-lipsync';
import { useChatbot } from '../../../hooks/useChatbot';
import { ANIMATION_CONSTANTS } from '../../../config/animations';
import type { SkinnedMeshArray, AudioSourceType, LipsyncManager, WebRTCLipsyncManager } from '../../../types';

interface UseVisemeManagerParams {
  avatarSkinnedMeshes: SkinnedMeshArray;
}

/**
 * Manages viseme (lip sync) morph targets for character mouth animation
 * Supports both file-based audio and WebRTC audio streams
 * @param avatarSkinnedMeshes - Array of skinned meshes with morph targets
 */
export const useVisemeManager = ({ avatarSkinnedMeshes }: UseVisemeManagerParams): void => {
  // Use proper hook selectors at component level instead of getState() in useFrame
  const lipsyncManager = useChatbot((state) => state.lipsyncManager);
  const webrtcLipsyncManager = useChatbot((state) => state.webrtcLipsyncManager);
  const isAudioPlaying = useChatbot((state) => state.isAudioPlaying);
  const audioPlayer = useChatbot((state) => state.audioPlayer);
  const audioSourceType = useChatbot((state) => state.audioSourceType);

  // Use refs to track values for useFrame (avoid accessing store in render loop)
  const lipsyncManagerRef = useRef<LipsyncManager | null>(lipsyncManager);
  const webrtcLipsyncManagerRef = useRef<WebRTCLipsyncManager | null>(webrtcLipsyncManager);
  const isAudioPlayingRef = useRef(isAudioPlaying);
  const audioPlayerRef = useRef(audioPlayer);
  const audioSourceTypeRef = useRef<AudioSourceType>(audioSourceType);

  // Update refs when values change
  useEffect(() => {
    lipsyncManagerRef.current = lipsyncManager;
    webrtcLipsyncManagerRef.current = webrtcLipsyncManager;
    isAudioPlayingRef.current = isAudioPlaying;
    audioPlayerRef.current = audioPlayer;
    audioSourceTypeRef.current = audioSourceType;
  }, [lipsyncManager, webrtcLipsyncManager, isAudioPlaying, audioPlayer, audioSourceType]);

  /**
   * Update a morph target value with smoothing
   */
  const updateMorphTarget = useCallback(
    (target: string, targetValue: number): void => {
      avatarSkinnedMeshes.forEach((skinnedMesh) => {
        if (!skinnedMesh.morphTargetDictionary) return;
        const morphIndex = skinnedMesh.morphTargetDictionary[target];
        if (
          morphIndex !== undefined &&
          skinnedMesh.morphTargetInfluences &&
          typeof skinnedMesh.morphTargetInfluences[morphIndex] === 'number'
        ) {
          const currentValue = skinnedMesh.morphTargetInfluences[morphIndex];
          const smoothing =
            targetValue > currentValue
              ? ANIMATION_CONSTANTS.VISEME_ACTIVATION_SMOOTHING
              : ANIMATION_CONSTANTS.VISEME_DEACTIVATION_SMOOTHING;

          skinnedMesh.morphTargetInfluences[morphIndex] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      });
    },
    [avatarSkinnedMeshes]
  );

  // Debug logging ref to avoid spamming
  const lastLogTimeRef = useRef(0);

  useFrame(() => {
    const currentIsAudioPlaying = isAudioPlayingRef.current;
    const currentSourceType = audioSourceTypeRef.current;
    const currentAudioPlayer = audioPlayerRef.current;
    
    // Get the appropriate lipsync manager based on source type
    const currentLipsyncManager = currentSourceType === 'webrtc'
      ? webrtcLipsyncManagerRef.current
      : lipsyncManagerRef.current;

    // Check if audio is actually playing
    // For WebRTC, we rely on isAudioPlaying state and the analyzer connection
    // For file audio, we check the audio element state
    const isPlaying = currentSourceType === 'webrtc'
      ? currentIsAudioPlaying && currentLipsyncManager
      : currentAudioPlayer &&
        !currentAudioPlayer.paused &&
        !currentAudioPlayer.ended &&
        currentAudioPlayer.currentTime > 0;

    if (isPlaying && currentIsAudioPlaying && currentLipsyncManager) {
      currentLipsyncManager.processAudio();
      const currentViseme = currentLipsyncManager.viseme;

      // Debug logging (throttled to once per second)
      if (import.meta.env.DEV) {
        const now = Date.now();
        if (now - lastLogTimeRef.current > 1000) {
          console.log('[useVisemeManager] Processing audio', {
            sourceType: currentSourceType,
            viseme: currentViseme,
            isWebRTC: currentSourceType === 'webrtc',
          });
          lastLogTimeRef.current = now;
        }
      }

      Object.values(VISEMES).forEach((viseme) => {
        const targetValue = viseme === currentViseme ? 1 : 0;
        updateMorphTarget(viseme, targetValue);
      });
    } else {
      // Reset all visemes when not playing
      Object.values(VISEMES).forEach((viseme) => {
        updateMorphTarget(viseme, 0);
      });
    }
  });
};

