/**
 * Animation configuration and constants
 * Centralized configuration for all character animations
 */

/**
 * Animation file paths mapping
 * Maps animation names to their file paths
 */
export const ANIMATION_CONFIG = {
  Idle: '/animations/Idle.fbx',
  Sit_Talking: '/animations/Sit_Talking.fbx',
  Sit_Talking2: '/animations/Sit_Talking2.fbx',
  Sit_Talking3: '/animations/Sit_Talking3.fbx',
  Talking: '/animations/Talking.fbx',
  Talking2: '/animations/Talking2.fbx',
  Talking3: '/animations/Talking3.fbx',
  Talking4: '/animations/Talking4.fbx',
  Talking5: '/animations/Talking5.fbx',
} as const;

/**
 * Animation timing and behavior constants
 */
export const ANIMATION_CONSTANTS = {
  /** Duration in seconds for crossfading between animations */
  CROSSFADE_DURATION: 0.5,
  /** Smoothing factor for viseme activation (0-1, higher = faster) */
  VISEME_ACTIVATION_SMOOTHING: 0.35,
  /** Smoothing factor for viseme deactivation (0-1, higher = faster) */
  VISEME_DEACTIVATION_SMOOTHING: 0.45,
} as const;

/**
 * Default animation name
 */
export const DEFAULT_ANIMATION = 'Idle' as const;

/**
 * Available animation names as array
 */
export const AVAILABLE_ANIMATIONS = Object.keys(ANIMATION_CONFIG) as Array<keyof typeof ANIMATION_CONFIG>;

