/**
 * Application-wide constants
 * Shared constants used across the application
 */

/**
 * UI styling constants
 */
export const UI_CONSTANTS = {
  /** Z-index for UI overlay */
  Z_INDEX: 100,
  /** Background color for UI panels */
  BACKGROUND_COLOR: 'rgba(255,255,255,0.9)',
  /** Border radius for UI panels */
  BORDER_RADIUS: '8px',
  /** Padding for UI panels */
  PADDING: '15px',
  /** Spacing between UI sections */
  SECTION_SPACING: '15px',
  /** Font sizes */
  FONT_SIZE: {
    SMALL: '12px',
    MEDIUM: '14px',
  },
  /** Control widths */
  CONTROL_WIDTH: '150px',
} as const;

/**
 * Model paths
 */
export const MODEL_PATHS = {
  CHARACTER: '/models/Witch.glb',
} as const;

/**
 * Audio paths
 */
export const AUDIO_PATHS = {
  WELCOME: 'audios/welcome.mp3',
} as const;

/**
 * Canvas/Scene constants
 */
export const SCENE_CONSTANTS = {
  /** Default background color */
  BACKGROUND_COLOR: '#ececec',
  /** Default camera position */
  DEFAULT_CAMERA_POSITION: [0, 0, 10] as const,
  /** Default camera FOV */
  DEFAULT_CAMERA_FOV: 75,
} as const;

