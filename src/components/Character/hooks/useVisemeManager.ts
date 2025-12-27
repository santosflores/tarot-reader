/**
 * Custom hook for managing viseme (lip sync) animations
 * Handles mouth morph targets based on audio playback
 */

import { useCallback } from 'react';
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
  const lipsyncManager = useChatbot((state) => state.lipsyncManager);
  const isAudioPlaying = useChatbot((state) => state.isAudioPlaying);

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
    const audioPlayer = useChatbot.getState().audioPlayer;
    const isPlaying = audioPlayer && !audioPlayer.paused && !audioPlayer.ended && audioPlayer.currentTime > 0;

    if (isPlaying && isAudioPlaying && lipsyncManager) {
      lipsyncManager.processAudio();
      const currentViseme = lipsyncManager.viseme;

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

