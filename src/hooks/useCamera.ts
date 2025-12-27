/**
 * Camera store for managing camera position and FOV
 * Separated from animation store for better organization
 */

import { create } from 'zustand';
import type { CameraState } from '../types';
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_FOV,
} from '@/config/camera';

export const useCamera = create<CameraState>((set) => ({
  cameraPosition: DEFAULT_CAMERA_POSITION,
  cameraFov: DEFAULT_CAMERA_FOV,

  setCameraPosition: (position) => {
    set({ cameraPosition: position });
  },

  setCameraFov: (fov) => {
    set({ cameraFov: fov });
  },
}));

