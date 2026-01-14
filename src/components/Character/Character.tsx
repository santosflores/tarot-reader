/**
 * Character component
 * Main component for rendering and animating the 3D character
 */

import { useFBX, useGLTF, Html } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  // Load 3D model
  const { scene } = useGLTF(MODEL_PATHS.CHARACTER);

  // Load all animations (hooks must be called at top level)
  // Using individual calls as required by React's rules of hooks
  const idleAnim = useFBX(ANIMATION_CONFIG.Idle);
  const talkingAnim = useFBX(ANIMATION_CONFIG.Talking);
  const talking2Anim = useFBX(ANIMATION_CONFIG.Talking2);
  const talking3Anim = useFBX(ANIMATION_CONFIG.Talking3);
  const talking4Anim = useFBX(ANIMATION_CONFIG.Talking4);
  const talking5Anim = useFBX(ANIMATION_CONFIG.Talking5);

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
  const { currentAnimation } = useAnimation();

  // Find skinned meshes for morph targets using utility function
  const avatarSkinnedMeshes = useMemo(() => findSkinnedMeshes(scene), [scene]);

  // Component refs
  const group = useRef<THREE.Group>(null);

  // Check if all resources are loaded
  useEffect(() => {
    // Check if model and all animations are loaded
    const allAnimationsLoaded = [
      idleAnim,
      talkingAnim,
      talking2Anim,
      talking3Anim,
      talking4Anim,
      talking5Anim,
    ].every((anim) => anim && anim.animations && anim.animations.length > 0);

    const modelLoaded = scene && scene.children.length > 0;

    if (allAnimationsLoaded && modelLoaded) {
      // Add a small delay to ensure everything is fully initialized
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    scene,
    idleAnim,
    talkingAnim,
    talking2Anim,
    talking3Anim,
    talking4Anim,
    talking5Anim,
  ]);

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
      {/* Loading Banner */}
      {isLoading && (
        <Html
          position={[0, 2.5, 0]}
          center
          distanceFactor={2}
          transform
          occlude
        >
          <div className="bg-gradient-to-r from-purple-500/90 to-indigo-500/90 backdrop-blur-xl border border-purple-400/50 rounded-lg px-4 py-2 shadow-2xl shadow-purple-900/50">
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-white text-sm font-medium">
                Loading Avatar...
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload(MODEL_PATHS.CHARACTER);

