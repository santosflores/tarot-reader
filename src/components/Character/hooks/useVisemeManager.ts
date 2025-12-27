/**
 * Custom hook for managing viseme (lip sync) animations
 * Handles mouth morph targets based on audio playback
 */

import { useCallback, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { VISEMES } from 'wawa-lipsync';
import { useChatbot } from '../../../hooks/useChatbot';
import { ANIMATION_CONSTANTS } from '../../../config/animations';
import type { SkinnedMeshArray } from '../../../types';

interface UseVisemeManagerParams {
  avatarSkinnedMeshes: SkinnedMeshArray;
}

/**
 * Manages viseme (lip sync) morph targets for character mouth animation
 * @param avatarSkinnedMeshes - Array of skinned meshes with morph targets
 */
export const useVisemeManager = ({ avatarSkinnedMeshes }: UseVisemeManagerParams): void => {
  // Use proper hook selectors at component level instead of getState() in useFrame
  const lipsyncManager = useChatbot((state) => state.lipsyncManager);
  const isAudioPlaying = useChatbot((state) => state.isAudioPlaying);
  const audioPlayer = useChatbot((state) => state.audioPlayer);

  // Use refs to track values for useFrame (avoid accessing store in render loop)
  const lipsyncManagerRef = useRef(lipsyncManager);
  const isAudioPlayingRef = useRef(isAudioPlaying);
  const audioPlayerRef = useRef(audioPlayer);

  // Update refs when values change
  useEffect(() => {
    lipsyncManagerRef.current = lipsyncManager;
    isAudioPlayingRef.current = isAudioPlaying;
    audioPlayerRef.current = audioPlayer;
  }, [lipsyncManager, isAudioPlaying, audioPlayer]);

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

  useFrame(() => {
    const currentAudioPlayer = audioPlayerRef.current;
    const currentIsAudioPlaying = isAudioPlayingRef.current;
    const currentLipsyncManager = lipsyncManagerRef.current;

    const isPlaying =
      currentAudioPlayer &&
      !currentAudioPlayer.paused &&
      !currentAudioPlayer.ended &&
      currentAudioPlayer.currentTime > 0;

    if (isPlaying && currentIsAudioPlaying && currentLipsyncManager) {
      currentLipsyncManager.processAudio();
      const currentViseme = currentLipsyncManager.viseme;

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

