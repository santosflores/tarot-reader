/**
 * Character component
 * Main component for rendering and animating the 3D character
 */

import { useFBX, useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import { ANIMATION_CONFIG } from '../../config/animations';
import { MODEL_PATHS } from '../../config/constants';
import { useCharacterAnimation } from './hooks/useCharacterAnimation';
import { useVisemeManager } from './hooks/useVisemeManager';
import { findSkinnedMeshes } from '../../utils/three';
import type { CharacterProps, AnimationMap, AnimationName } from '../../types';
import * as THREE from 'three';

export const Character = ({ ...props }: CharacterProps) => {
  // Load 3D model
  const { scene } = useGLTF(MODEL_PATHS.CHARACTER);

  // Load all animations (hooks must be called at top level)
  // Using individual calls as required by React's rules of hooks
  const idleAnim = useFBX(ANIMATION_CONFIG.Idle);
  const sitTalkingAnim = useFBX(ANIMATION_CONFIG.Sit_Talking);
  const sitTalking2Anim = useFBX(ANIMATION_CONFIG.Sit_Talking2);
  const sitTalking3Anim = useFBX(ANIMATION_CONFIG.Sit_Talking3);
  const talkingAnim = useFBX(ANIMATION_CONFIG.Talking);
  const talking2Anim = useFBX(ANIMATION_CONFIG.Talking2);
  const talking3Anim = useFBX(ANIMATION_CONFIG.Talking3);
  const talking4Anim = useFBX(ANIMATION_CONFIG.Talking4);
  const talking5Anim = useFBX(ANIMATION_CONFIG.Talking5);

  // Map animations dynamically from config to reduce duplication in mapping logic
  const animations: AnimationMap = useMemo(() => {
    const loadedAnimations = {
      Idle: idleAnim,
      Sit_Talking: sitTalkingAnim,
      Sit_Talking2: sitTalking2Anim,
      Sit_Talking3: sitTalking3Anim,
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
    sitTalkingAnim,
    sitTalking2Anim,
    sitTalking3Anim,
    talkingAnim,
    talking2Anim,
    talking3Anim,
    talking4Anim,
    talking5Anim,
  ]);

  // Get selected animation from UI controls
  const { currentAnimation } = useAnimation();

  // Find skinned meshes for morph targets using utility function
  const avatarSkinnedMeshes = useMemo(() => findSkinnedMeshes(scene), [scene]);

  // Component refs
  const group = useRef<THREE.Group>(null);

  // Custom hooks for separation of concerns
  useCharacterAnimation({
    animationMap: animations,
    currentAnimation,
    groupRef: group,
  });

  useVisemeManager({ avatarSkinnedMeshes });

  return (
    <group {...props} ref={group}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the model
useGLTF.preload(MODEL_PATHS.CHARACTER);

