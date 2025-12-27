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
import type { CharacterProps, AnimationMap } from '../../types';
import * as THREE from 'three';

export const Character = ({ ...props }: CharacterProps) => {
  // Load 3D model
  const { scene } = useGLTF(MODEL_PATHS.CHARACTER);

  // Load all animations individually (required for proper hook usage)
  const idleAnim = useFBX(ANIMATION_CONFIG.Idle);
  const sitTalkingAnim = useFBX(ANIMATION_CONFIG.Sit_Talking);
  const sitTalking2Anim = useFBX(ANIMATION_CONFIG.Sit_Talking2);
  const sitTalking3Anim = useFBX(ANIMATION_CONFIG.Sit_Talking3);
  const talkingAnim = useFBX(ANIMATION_CONFIG.Talking);
  const talking2Anim = useFBX(ANIMATION_CONFIG.Talking2);
  const talking3Anim = useFBX(ANIMATION_CONFIG.Talking3);
  const talking4Anim = useFBX(ANIMATION_CONFIG.Talking4);
  const talking5Anim = useFBX(ANIMATION_CONFIG.Talking5);

  // Map animations with proper naming
  const animations: AnimationMap = useMemo(
    () => ({
      Idle: idleAnim.animations,
      Sit_Talking: sitTalkingAnim.animations,
      Sit_Talking2: sitTalking2Anim.animations,
      Sit_Talking3: sitTalking3Anim.animations,
      Talking: talkingAnim.animations,
      Talking2: talking2Anim.animations,
      Talking3: talking3Anim.animations,
      Talking4: talking4Anim.animations,
      Talking5: talking5Anim.animations,
    }),
    [
      idleAnim,
      sitTalkingAnim,
      sitTalking2Anim,
      sitTalking3Anim,
      talkingAnim,
      talking2Anim,
      talking3Anim,
      talking4Anim,
      talking5Anim,
    ]
  );

  // Get selected animation from UI controls
  const { currentAnimation } = useAnimation();

  // Find skinned meshes for morph targets
  const avatarSkinnedMeshes = useMemo(() => {
    const skinnedMeshes: THREE.SkinnedMesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        skinnedMeshes.push(child);
      }
    });
    return skinnedMeshes;
  }, [scene]);

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

