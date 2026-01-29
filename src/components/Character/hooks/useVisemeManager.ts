/**
 * Custom hook for managing viseme (lip sync) animations
 * Handles mouth morph targets based on audio playback (file or WebRTC)
 */

import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { VISEME_VALUES } from '../../../utils/webrtcLipsync';
import { useChatbot } from '../../../hooks/useChatbot';
import { ANIMATION_CONSTANTS } from '../../../config/animations';
import type { SkinnedMeshArray, AudioSourceType, LipsyncManager, WebRTCLipsyncManager } from '../../../types';
import type { SkinnedMesh } from 'three';

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
  const isAgentSpeaking = useChatbot((state) => state.isAgentSpeaking);

  // Use refs to track values for useFrame (avoid accessing store in render loop)
  const lipsyncManagerRef = useRef<LipsyncManager | null>(lipsyncManager);
  const webrtcLipsyncManagerRef = useRef<WebRTCLipsyncManager | null>(webrtcLipsyncManager);
  const isAudioPlayingRef = useRef(isAudioPlaying);
  const audioPlayerRef = useRef(audioPlayer);
  const audioSourceTypeRef = useRef<AudioSourceType>(audioSourceType);
  const isAgentSpeakingRef = useRef(isAgentSpeaking);

  // Optimization: Track if visemes are settled (all zero) to skip processing
  const visemesSettledRef = useRef(false);

  // Update refs when values change
  useEffect(() => {
    lipsyncManagerRef.current = lipsyncManager;
    webrtcLipsyncManagerRef.current = webrtcLipsyncManager;
    isAudioPlayingRef.current = isAudioPlaying;
    audioPlayerRef.current = audioPlayer;
    audioSourceTypeRef.current = audioSourceType;
    isAgentSpeakingRef.current = isAgentSpeaking;
  }, [lipsyncManager, webrtcLipsyncManager, isAudioPlaying, audioPlayer, audioSourceType, isAgentSpeaking]);

  // Reset settled state when meshes change to ensure we clear any existing values
  useEffect(() => {
    visemesSettledRef.current = false;
  }, [avatarSkinnedMeshes]);

  /**
   * Optimization: Cache the mapping from viseme name to morph target indices for each mesh.
   * This avoids looking up `skinnedMesh.morphTargetDictionary[target]` in every frame loop.
   */
  const morphTargetCache = useMemo(() => {
    const cache: Record<string, Array<{ mesh: SkinnedMesh; index: number }>> = {};

    VISEME_VALUES.forEach((viseme) => {
      cache[viseme] = [];
      avatarSkinnedMeshes.forEach((mesh) => {
        if (mesh.morphTargetDictionary && mesh.morphTargetDictionary[viseme] !== undefined) {
          cache[viseme].push({
            mesh,
            index: mesh.morphTargetDictionary[viseme],
          });
        }
      });
    });

    return cache;
  }, [avatarSkinnedMeshes]);

  /**
   * Update a morph target value with smoothing
   */
  const updateMorphTarget = useCallback(
    (target: string, targetValue: number): void => {
      const targets = morphTargetCache[target];
      if (!targets) return;

      for (let i = 0; i < targets.length; i++) {
        const { mesh, index } = targets[i];
        if (
          mesh.morphTargetInfluences &&
          typeof mesh.morphTargetInfluences[index] === 'number'
        ) {
          const currentValue = mesh.morphTargetInfluences[index];

          // Optimization: Skip update if already close enough to target
          // This prevents unnecessary calculations and three.js updates for stable values
          if (Math.abs(currentValue - targetValue) < 0.001) {
            if (currentValue !== targetValue) {
              mesh.morphTargetInfluences[index] = targetValue;
            }
            continue;
          }

          const smoothing =
            targetValue > currentValue
              ? ANIMATION_CONSTANTS.VISEME_ACTIVATION_SMOOTHING
              : ANIMATION_CONSTANTS.VISEME_DEACTIVATION_SMOOTHING;

          mesh.morphTargetInfluences[index] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      }
    },
    [morphTargetCache]
  );

  // Debug logging ref to avoid spamming
  const lastLogTimeRef = useRef(0);

  useFrame(() => {
    const currentIsAudioPlaying = isAudioPlayingRef.current;
    const currentSourceType = audioSourceTypeRef.current;
    const currentAudioPlayer = audioPlayerRef.current;
    const currentIsAgentSpeaking = isAgentSpeakingRef.current;
    
    // Get the appropriate lipsync manager based on source type
    const currentLipsyncManager = currentSourceType === 'webrtc'
      ? webrtcLipsyncManagerRef.current
      : lipsyncManagerRef.current;

    // Check if audio is actually playing
    // For WebRTC, we rely on isAudioPlaying state and the analyzer connection
    // For file audio, we check the audio element state AND if agent is speaking
    const isPlaying = currentSourceType === 'webrtc'
      ? currentIsAudioPlaying && currentLipsyncManager
      : currentAudioPlayer &&
        !currentAudioPlayer.paused &&
        !currentAudioPlayer.ended &&
        currentAudioPlayer.currentTime > 0 &&
        currentIsAgentSpeaking; // Only lipsync when agent is speaking

    if (isPlaying && currentIsAudioPlaying && currentLipsyncManager) {
      visemesSettledRef.current = false; // Active, so not settled

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

      VISEME_VALUES.forEach((viseme) => {
        const targetValue = viseme === currentViseme ? 1 : 0;
        updateMorphTarget(viseme, targetValue);
      });
    } else {
      // Optimization: Skip processing if already settled
      if (visemesSettledRef.current) return;

      let allSettled = true;
      VISEME_VALUES.forEach((viseme) => {
        updateMorphTarget(viseme, 0);

        // Check if this viseme is effectively zero for all affected meshes
        // This validation ensures we truly stop when all targets are settled
        const targets = morphTargetCache[viseme];
        if (targets) {
          for (let i = 0; i < targets.length; i++) {
             const { mesh, index } = targets[i];
             if (mesh.morphTargetInfluences && mesh.morphTargetInfluences[index] > 0.001) {
               allSettled = false;
             }
          }
        }
      });

      if (allSettled) {
        visemesSettledRef.current = true;
      }
    }
  });
};
