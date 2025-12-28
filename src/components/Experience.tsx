/**
 * Experience component
 * Main 3D scene container with character, camera, and environment
 */

import { Environment, OrbitControls } from '@react-three/drei';
import { Character } from './Character/Character';
import { CameraController } from './CameraController';
import { CAMERA_CONSTRAINTS } from '../config/camera';

export const Experience = () => {
  return (
    <>
      <CameraController />
      <OrbitControls
        target={CAMERA_CONSTRAINTS.TARGET}
        minDistance={CAMERA_CONSTRAINTS.MIN_DISTANCE}
        maxDistance={CAMERA_CONSTRAINTS.MAX_DISTANCE}
      />
      <Character />
      <Environment preset="sunset" />
    </>
  );
};

