/**
 * Three.js utility functions
 * Helper functions for working with Three.js objects
 */

import * as THREE from "three";
import type { SkinnedMeshArray } from "../types";

/**
 * Find all skinned meshes in a scene
 * @param scene - The Three.js scene or object to traverse
 * @returns Array of skinned meshes
 */
export const findSkinnedMeshes = (
  scene: THREE.Object3D
): THREE.SkinnedMesh[] => {
  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      skinnedMeshes.push(child);
    }
  });
  return skinnedMeshes;
};

/**
 * Check if an object has morph targets
 * @param mesh - The mesh to check
 * @returns True if the mesh has morph targets
 */
export const hasMorphTargets = (mesh: THREE.SkinnedMesh): boolean => {
  return (
    mesh.morphTargetDictionary !== undefined &&
    mesh.morphTargetInfluences !== undefined &&
    Object.keys(mesh.morphTargetDictionary).length > 0
  );
};

/**
 * Get morph target value
 * @param mesh - The skinned mesh
 * @param targetName - Name of the morph target
 * @returns Current influence value (0-1) or undefined if not found
 */
export const getMorphTargetValue = (
  mesh: THREE.SkinnedMesh,
  targetName: string
): number | undefined => {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
    return undefined;
  }
  const index = mesh.morphTargetDictionary[targetName];
  if (index === undefined) {
    return undefined;
  }
  return mesh.morphTargetInfluences[index];
};

/**
 * Set morph target value
 * @param mesh - The skinned mesh
 * @param targetName - Name of the morph target
 * @param value - Influence value (0-1)
 * @returns True if successful, false if target not found
 */
export const setMorphTargetValue = (
  mesh: THREE.SkinnedMesh,
  targetName: string,
  value: number
): boolean => {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
    return false;
  }
  const index = mesh.morphTargetDictionary[targetName];
  if (index === undefined) {
    return false;
  }
  mesh.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
  return true;
};

/**
 * Reset all morph targets to zero
 * @param meshes - Array of skinned meshes
 */
export const resetAllMorphTargets = (meshes: SkinnedMeshArray): void => {
  meshes.forEach((mesh) => {
    if (mesh.morphTargetInfluences) {
      mesh.morphTargetInfluences.fill(0);
    }
  });
};

/**
 * Create a Vector3 from an array
 * @param array - Array of 3 numbers [x, y, z]
 * @returns Vector3 instance
 */
export const vector3FromArray = (
  array: [number, number, number]
): THREE.Vector3 => {
  return new THREE.Vector3(...array);
};
