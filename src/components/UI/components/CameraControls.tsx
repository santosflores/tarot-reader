/**
 * CameraControls component
 * Provides controls for adjusting camera position and FOV
 */

import { memo, useCallback, useMemo } from 'react';
import { useCamera } from '../../../hooks/useCamera';
import { CAMERA_POSITION_LIMITS, CAMERA_FOV_LIMITS, DEFAULT_CAMERA_RESET_POSITION } from '../../../config/camera';
import type { CameraPosition } from '../../../types';

export const CameraControls = memo(() => {
  const { cameraPosition, cameraFov, setCameraPosition, setCameraFov } = useCamera();

  const handlePositionChange = useCallback(
    (axis: 'x' | 'y' | 'z', value: number) => {
      const newPosition: CameraPosition = [...cameraPosition];
      if (axis === 'x') newPosition[0] = value;
      if (axis === 'y') newPosition[1] = value;
      if (axis === 'z') newPosition[2] = value;
      setCameraPosition(newPosition);
    },
    [cameraPosition, setCameraPosition]
  );

  const handleXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handlePositionChange('x', parseFloat(e.target.value));
    },
    [handlePositionChange]
  );

  const handleYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handlePositionChange('y', parseFloat(e.target.value));
    },
    [handlePositionChange]
  );

  const handleZChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handlePositionChange('z', parseFloat(e.target.value));
    },
    [handlePositionChange]
  );

  const handleFovChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCameraFov(parseInt(e.target.value));
    },
    [setCameraFov]
  );

  const handleReset = useCallback(() => {
    setCameraPosition(DEFAULT_CAMERA_RESET_POSITION);
  }, [setCameraPosition]);

  const formattedX = useMemo(() => cameraPosition[0].toFixed(1), [cameraPosition[0]]);
  const formattedY = useMemo(() => cameraPosition[1].toFixed(1), [cameraPosition[1]]);
  const formattedZ = useMemo(() => cameraPosition[2].toFixed(1), [cameraPosition[2]]);

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Camera Controls</h3>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          X: <span className="font-medium">{formattedX}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.X.min}
          max={CAMERA_POSITION_LIMITS.X.max}
          step="0.1"
          value={cameraPosition[0]}
          onChange={handleXChange}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          Y: <span className="font-medium">{formattedY}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Y.min}
          max={CAMERA_POSITION_LIMITS.Y.max}
          step="0.1"
          value={cameraPosition[1]}
          onChange={handleYChange}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          Z: <span className="font-medium">{formattedZ}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Z.min}
          max={CAMERA_POSITION_LIMITS.Z.max}
          step="0.1"
          value={cameraPosition[2]}
          onChange={handleZChange}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          FOV: <span className="font-medium">{cameraFov}</span>
        </label>
        <input
          type="range"
          min={CAMERA_FOV_LIMITS.min}
          max={CAMERA_FOV_LIMITS.max}
          step="1"
          value={cameraFov}
          onChange={handleFovChange}
          className="w-full"
        />
      </div>

      <button
        onClick={handleReset}
        className="mt-2 text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
      >
        Reset Position
      </button>
    </div>
  );
});

CameraControls.displayName = 'CameraControls';

