/**
 * Custom hook for managing eye blinking animation
 * Creates natural-looking blink behavior using morph targets
 */

import { useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import type { SkinnedMeshArray } from '../../../types';

interface UseBlinkManagerParams {
  avatarSkinnedMeshes: SkinnedMeshArray;
}

/**
 * Blinking configuration constants
 */
const BLINK_CONFIG = {
  /** Minimum time between blinks in seconds */
  MIN_INTERVAL: 2.0,
  /** Maximum time between blinks in seconds */
  MAX_INTERVAL: 6.0,
  /** Duration of the blink animation (closing + opening) in seconds */
  BLINK_DURATION: 0.15,
  /** How fast eyes close (higher = faster) */
  CLOSE_SPEED: 0.4,
  /** How fast eyes open (higher = faster) */
  OPEN_SPEED: 0.25,
} as const;

/**
 * Common morph target names for eye blinking
 * Different models may use different naming conventions
 */
const BLINK_MORPH_TARGETS = [
  'eyesClosed',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'EyeBlink_L',
  'EyeBlink_R',
  'eyeBlink_L',
  'eyeBlink_R',
  'Blink_Left',
  'Blink_Right',
] as const;

/**
 * Manages eye blinking animation using morph targets
 * @param avatarSkinnedMeshes - Array of skinned meshes with morph targets
 */
export const useBlinkManager = ({ avatarSkinnedMeshes }: UseBlinkManagerParams): void => {
  // Track blink state
  const nextBlinkTime = useRef<number>(getRandomBlinkInterval());
  const isBlinking = useRef<boolean>(false);
  const blinkProgress = useRef<number>(0);
  const elapsedTime = useRef<number>(0);

  /**
   * Get a random interval for the next blink
   */
  function getRandomBlinkInterval(): number {
    return MathUtils.randFloat(BLINK_CONFIG.MIN_INTERVAL, BLINK_CONFIG.MAX_INTERVAL);
  }

  /**
   * Update a morph target value with smoothing
   */
  const updateMorphTarget = useCallback(
    (target: string, targetValue: number, speed: number): void => {
      avatarSkinnedMeshes.forEach((skinnedMesh) => {
        if (!skinnedMesh.morphTargetDictionary) return;
        const morphIndex = skinnedMesh.morphTargetDictionary[target];
        if (
          morphIndex !== undefined &&
          skinnedMesh.morphTargetInfluences &&
          typeof skinnedMesh.morphTargetInfluences[morphIndex] === 'number'
        ) {
          const currentValue = skinnedMesh.morphTargetInfluences[morphIndex];
          skinnedMesh.morphTargetInfluences[morphIndex] = MathUtils.lerp(
            currentValue,
            targetValue,
            speed
          );
        }
      });
    },
    [avatarSkinnedMeshes]
  );

  /**
   * Update all blink morph targets
   */
  const updateBlinkTargets = useCallback(
    (targetValue: number, speed: number): void => {
      BLINK_MORPH_TARGETS.forEach((target) => {
        updateMorphTarget(target, targetValue, speed);
      });
    },
    [updateMorphTarget]
  );

  useFrame((_state, delta) => {
    elapsedTime.current += delta;

    // Check if it's time to blink
    if (!isBlinking.current && elapsedTime.current >= nextBlinkTime.current) {
      isBlinking.current = true;
      blinkProgress.current = 0;
    }

    if (isBlinking.current) {
      blinkProgress.current += delta;

      // First half: eyes closing
      if (blinkProgress.current < BLINK_CONFIG.BLINK_DURATION) {
        updateBlinkTargets(1, BLINK_CONFIG.CLOSE_SPEED);
      }
      // Second half: eyes opening
      else if (blinkProgress.current < BLINK_CONFIG.BLINK_DURATION * 2) {
        updateBlinkTargets(0, BLINK_CONFIG.OPEN_SPEED);
      }
      // Blink complete
      else {
        updateBlinkTargets(0, BLINK_CONFIG.OPEN_SPEED);
        isBlinking.current = false;
        blinkProgress.current = 0;
        elapsedTime.current = 0;
        nextBlinkTime.current = getRandomBlinkInterval();
      }
    } else {
      // Ensure eyes are open when not blinking
      updateBlinkTargets(0, BLINK_CONFIG.OPEN_SPEED);
    }
  });
};
