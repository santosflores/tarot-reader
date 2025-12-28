/**
 * Experience component
 * Main 3D scene container with character, camera, and environment
 * 
 * Note: Console warnings about non-passive event listeners from OrbitControls
 * are expected and necessary for proper camera control. OrbitControls requires
 * non-passive wheel event listeners to prevent page scrolling while interacting
 * with the 3D scene.
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
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
      />
      <Character />
      <Environment preset="sunset" />
    </>
  );
};

