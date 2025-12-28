/**
 * CameraController component
 * Manages camera position and FOV based on store state
 */

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { useCamera } from '../hooks/useCamera';
import { Vector3, PerspectiveCamera } from 'three';
import { CHARACTER_HEAD_POSITION } from '../config/camera';

export const CameraController = () => {
  const { camera } = useThree();
  const { cameraPosition, cameraFov } = useCamera();

  // Memoize head position vector to avoid creating new instance on every render
  const headPosition = useMemo(() => new Vector3(...CHARACTER_HEAD_POSITION), []);

  useEffect(() => {
    camera.position.set(...(cameraPosition as [number, number, number]));
    // Look at the character's head
    camera.lookAt(headPosition);

    // Update FOV if camera is PerspectiveCamera
    if (camera instanceof PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraPosition, cameraFov, headPosition]);

  return null;
};

