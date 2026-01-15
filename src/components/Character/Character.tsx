/**
 * Character component
 * Main component for rendering and animating the 3D character
 */

import { useGLTF } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useAnimation } from '../../hooks/useAnimation';
import { ANIMATION_CONFIG } from '../../config/animations';
import { MODEL_PATHS } from '../../config/constants';
import { useCharacterAnimation } from './hooks/useCharacterAnimation';
import { useVisemeManager } from './hooks/useVisemeManager';
import { useBlinkManager } from './hooks/useBlinkManager';
import { findSkinnedMeshes } from '../../utils/three';
import type { CharacterProps, AnimationMap, AnimationName } from '../../types';
import * as THREE from 'three';

export const Character = ({ ...props }: CharacterProps) => {
  // removed isLoading state

  // Load 3D model
  const { scene } = useGLTF(MODEL_PATHS.CHARACTER);

  // Load all animations in parallel using useLoader with an array
  const [
    idleAnim,
    talkingAnim,
    talking2Anim,
    talking3Anim,
    talking4Anim,
    talking5Anim,
  ] = useLoader(FBXLoader, [
    ANIMATION_CONFIG.Idle,
    ANIMATION_CONFIG.Talking,
    ANIMATION_CONFIG.Talking2,
    ANIMATION_CONFIG.Talking3,
    ANIMATION_CONFIG.Talking4,
    ANIMATION_CONFIG.Talking5,
  ]);

  // Map animations dynamically from config to reduce duplication in mapping logic
  const animations: AnimationMap = useMemo(() => {
    const loadedAnimations = {
      Idle: idleAnim,
      Talking: talkingAnim,
      Talking2: talking2Anim,
      Talking3: talking3Anim,
      Talking4: talking4Anim,
      Talking5: talking5Anim,
    };

    const animationMap: Partial<AnimationMap> = {};
    (Object.keys(ANIMATION_CONFIG) as AnimationName[]).forEach((name) => {
      const loadedAnim = loadedAnimations[name];
      if (loadedAnim) {
        animationMap[name] = loadedAnim.animations;
      }
    });
    return animationMap as AnimationMap;
  }, [
    idleAnim,
    talkingAnim,
    talking2Anim,
    talking3Anim,
    talking4Anim,
    talking5Anim,
  ]);

  // Get selected animation from UI controls
  const currentAnimation = useAnimation((state) => state.currentAnimation);

  // Find skinned meshes for morph targets using utility function
  const avatarSkinnedMeshes = useMemo(() => findSkinnedMeshes(scene), [scene]);

  // Component refs
  const group = useRef<THREE.Group>(null);

  // removed loading check useEffect

  // Custom hooks for separation of concerns
  useCharacterAnimation({
    animationMap: animations,
    currentAnimation,
    groupRef: group,
  });

  useVisemeManager({ avatarSkinnedMeshes });
  useBlinkManager({ avatarSkinnedMeshes });

  return (
    <group {...props} ref={group}>
      <primitive object={scene} />
// removed Html loading banner
    </group>
  );
};

// Preload the model
useGLTF.preload(MODEL_PATHS.CHARACTER);

