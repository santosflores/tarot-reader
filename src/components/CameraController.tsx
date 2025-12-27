/**
 * CameraController component
 * Manages camera position and FOV based on store state
 */

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { Vector3, PerspectiveCamera } from 'three';
import { CHARACTER_HEAD_POSITION } from '../config/camera';

export const CameraController = () => {
  const { camera } = useThree();
  const { cameraPosition, cameraFov } = useCamera();

  useEffect(() => {
    camera.position.set(...cameraPosition as [number, number, number]);
    // Look at the character's head
    const headPosition = new Vector3(...CHARACTER_HEAD_POSITION);
    camera.lookAt(headPosition);
  }, [camera, cameraPosition]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  return null;
};

