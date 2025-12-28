/**
 * Shared TypeScript type definitions
 * Centralized type definitions for the application
 */

import type { RefObject } from "react";
import type {
  AnimationClip,
  AnimationMixer,
  AnimationAction,
  SkinnedMesh,
  Vector3Tuple,
} from "three";

/**
 * Animation name type - all available animation names
 */
export type AnimationName =
  | "Idle"
  | "Sit_Talking"
  | "Sit_Talking2"
  | "Sit_Talking3"
  | "Talking"
  | "Talking2"
  | "Talking3"
  | "Talking4"
  | "Talking5";

/**
 * Camera position type
 */
export type CameraPosition = Vector3Tuple;

/**
 * Audio playback state
 */
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

/**
 * Camera store state
 */
export interface CameraState {
  cameraPosition: CameraPosition;
  cameraFov: number;
  setCameraPosition: (position: CameraPosition) => void;
  setCameraFov: (fov: number) => void;
}

/**
 * Animation store state
 */
export interface AnimationState {
  currentAnimation: AnimationName;
  availableAnimations: AnimationName[];
  setCurrentAnimation: (animation: AnimationName) => void;
  addAnimation: (animation: AnimationName) => void;
  registerAnimation: (name: AnimationName, filePath: string) => void;
  animationFiles?: Record<string, string>;
}

/**
 * LipsyncManager interface
 * Type definition for wawa-lipsync Lipsync instance
 */
export interface LipsyncManager {
  connectAudio: (audioElement: HTMLAudioElement) => void;
  processAudio: () => void;
  viseme: string;
}

/**
 * Chatbot/Audio store state
 */
export interface ChatbotState {
  audioPlayer: HTMLAudioElement | null;
  lipsyncManager: LipsyncManager | null;
  isAudioPlaying: boolean;
  setupAudioPlayer: () => void;
  playAudio: (url: string) => void;
  cleanup: () => void;
}

/**
 * Character component props
 */
export interface CharacterProps {
  [key: string]: unknown;
}

/**
 * Animation map type
 */
export type AnimationMap = Record<AnimationName, AnimationClip[]>;

/**
 * Animation mixer refs
 */
export interface AnimationRefs {
  mixerRef: RefObject<AnimationMixer | null>;
  currentActionRef: RefObject<AnimationAction | null>;
}

/**
 * Skinned mesh array type
 */
export type SkinnedMeshArray = SkinnedMesh[];
