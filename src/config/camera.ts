/**
 * Camera configuration and constants
 * Default camera settings and constraints
 */

import type { Vector3Tuple } from 'three';

/**
 * Default camera position [x, y, z]
 * Positioned for close-up face shot
 */
export const DEFAULT_CAMERA_POSITION: Vector3Tuple = [0, 1.5, 1.5];

/**
 * Default camera field of view (FOV)
 * Lower values = more zoomed in
 */
export const DEFAULT_CAMERA_FOV = 50;

/**
 * Character head position for camera targeting
 * Used to make camera look at the character's face
 */
export const CHARACTER_HEAD_POSITION: Vector3Tuple = [0, 1.5, 0];

/**
 * Camera constraints for OrbitControls
 */
export const CAMERA_CONSTRAINTS = {
  /** Minimum distance from target */
  MIN_DISTANCE: 1,
  /** Maximum distance from target */
  MAX_DISTANCE: 10,
  /** Default target position */
  TARGET: [0, 1.5, 0] as Vector3Tuple,
} as const;

/**
 * Camera position limits for manual controls
 */
export const CAMERA_POSITION_LIMITS = {
  X: { min: -10, max: 10 },
  Y: { min: -10, max: 10 },
  Z: { min: 0, max: 20 },
} as const;

/**
 * Camera FOV limits
 */
export const CAMERA_FOV_LIMITS = {
  min: 10,
  max: 120,
} as const;

/**
 * Default camera reset position
 */
export const DEFAULT_CAMERA_RESET_POSITION: Vector3Tuple = [0, 0, 10];

