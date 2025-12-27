/**
 * Custom hook for managing character body animations
 * Handles animation initialization, switching, and crossfading
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AnimationMap, AnimationName, AnimationRefs } from '../../../types';
import { ANIMATION_CONSTANTS } from '../../../config/animations';

interface UseCharacterAnimationParams {
  animationMap: AnimationMap;
  currentAnimation: AnimationName;
  groupRef: React.RefObject<THREE.Group | null>;
}

/**
 * Manages character body animations with crossfading support
 * @param animationMap - Map of animation names to AnimationClip arrays
 * @param currentAnimation - Currently selected animation name
 * @param groupRef - Reference to the character group object
 * @returns Animation refs for mixer and current action
 */
export const useCharacterAnimation = ({
  animationMap,
  currentAnimation,
  groupRef,
}: UseCharacterAnimationParams): AnimationRefs => {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const previousActionRef = useRef<THREE.AnimationAction | null>(null);
  const animationInitialized = useRef(false);
  const currentAnimationRef = useRef<AnimationName>(currentAnimation);

  /**
   * Initialize animation mixer if it doesn't exist
   */
  const initializeMixer = useCallback((): THREE.AnimationMixer | null => {
    if (!mixerRef.current && groupRef.current) {
      mixerRef.current = new THREE.AnimationMixer(groupRef.current);
    }
    return mixerRef.current;
  }, [groupRef]);

  /**
   * Initialize an animation action
   */
  const initializeAnimation = useCallback(
    (animationData: THREE.AnimationClip[]): THREE.AnimationAction | null => {
      const mixer = initializeMixer();
      if (!mixer || !animationData[0]) return null;

      const clip = animationData[0];
      const action = mixer.clipAction(clip);

      action.setLoop(THREE.LoopRepeat, Infinity);
      action.reset();
      action.fadeIn(ANIMATION_CONSTANTS.CROSSFADE_DURATION);
      action.play();
      action.paused = false;

      return action;
    },
    [initializeMixer]
  );

  /**
   * Switch to a new animation with crossfading
   */
  const switchAnimation = useCallback(
    (newAnimationData: THREE.AnimationClip[]): void => {
      // Store current action for fading out
      if (currentActionRef.current) {
        previousActionRef.current = currentActionRef.current;
        previousActionRef.current.fadeOut(ANIMATION_CONSTANTS.CROSSFADE_DURATION);
      }

      // Initialize new animation
      currentActionRef.current = initializeAnimation(newAnimationData);
      animationInitialized.current = true;
    },
    [initializeAnimation]
  );

  // Cleanup mixer on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        // Stop all actions
        mixerRef.current.stopAllAction();
        // Dispose of the mixer
        mixerRef.current = null;
      }
      currentActionRef.current = null;
      previousActionRef.current = null;
      animationInitialized.current = false;
    };
  }, []);

  useFrame((_state, delta) => {
    // Check for animation changes
    const animationChanged = currentAnimationRef.current !== currentAnimation;

    if (animationChanged && animationInitialized.current) {
      const newAnimationData = animationMap[currentAnimation];
      if (newAnimationData) {
        switchAnimation(newAnimationData);
        currentAnimationRef.current = currentAnimation;
      }
    }

    // Initialize first animation
    if (!animationInitialized.current && animationMap[currentAnimation]) {
      const animationData = animationMap[currentAnimation];
      if (animationData && groupRef.current) {
        currentActionRef.current = initializeAnimation(animationData);
        animationInitialized.current = true;
        currentAnimationRef.current = currentAnimation;
      }
    }

    // Update mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Cleanup completed fade-outs
    if (previousActionRef.current && !previousActionRef.current.isRunning()) {
      previousActionRef.current.stop();
      previousActionRef.current = null;
    }

    // Ensure current animation keeps running
    if (currentActionRef.current && !currentActionRef.current.isRunning()) {
      currentActionRef.current.play();
      currentActionRef.current.paused = false;
    }
  });

  return { mixerRef, currentActionRef };
};

