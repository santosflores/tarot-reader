/**
 * Custom hook for managing character body animations
 * Handles animation initialization, switching, and crossfading
 */

import { useRef } from 'react';
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
   * Initialize an animation action
   */
  const initializeAnimation = (animationData: THREE.AnimationClip[]): THREE.AnimationAction | null => {
    if (!mixerRef.current && groupRef.current) {
      mixerRef.current = new THREE.AnimationMixer(groupRef.current);
    }

    if (!mixerRef.current) return null;

    const clip = animationData[0];
    const action = mixerRef.current.clipAction(clip);

    action.setLoop(THREE.LoopRepeat, Infinity);
    action.reset();
    action.fadeIn(ANIMATION_CONSTANTS.CROSSFADE_DURATION);
    action.play();
    action.paused = false;

    return action;
  };

  /**
   * Switch to a new animation with crossfading
   */
  const switchAnimation = (newAnimationData: THREE.AnimationClip[]): void => {
    // Store current action for fading out
    if (currentActionRef.current) {
      previousActionRef.current = currentActionRef.current;
      previousActionRef.current.fadeOut(ANIMATION_CONSTANTS.CROSSFADE_DURATION);
    }

    // Initialize new animation
    currentActionRef.current = initializeAnimation(newAnimationData);
    animationInitialized.current = true;
  };

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

