/**
 * CameraControls component
 * Provides controls for adjusting camera position and FOV
 */

import { useCamera } from '../../../hooks/useCamera';
import { CAMERA_POSITION_LIMITS, CAMERA_FOV_LIMITS, DEFAULT_CAMERA_RESET_POSITION } from '../../../config/camera';
import type { CameraPosition } from '../../../types';

export const CameraControls = () => {
  const { cameraPosition, cameraFov, setCameraPosition, setCameraFov } = useCamera();

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition: CameraPosition = [...cameraPosition];
    if (axis === 'x') newPosition[0] = value;
    if (axis === 'y') newPosition[1] = value;
    if (axis === 'z') newPosition[2] = value;
    setCameraPosition(newPosition);
  };

  const handleReset = () => {
    setCameraPosition(DEFAULT_CAMERA_RESET_POSITION);
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Camera Controls</h3>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          X: <span className="font-medium">{cameraPosition[0].toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.X.min}
          max={CAMERA_POSITION_LIMITS.X.max}
          step="0.1"
          value={cameraPosition[0]}
          onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          Y: <span className="font-medium">{cameraPosition[1].toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Y.min}
          max={CAMERA_POSITION_LIMITS.Y.max}
          step="0.1"
          value={cameraPosition[1]}
          onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1">
          Z: <span className="font-medium">{cameraPosition[2].toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Z.min}
          max={CAMERA_POSITION_LIMITS.Z.max}
          step="0.1"
          value={cameraPosition[2]}
          onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
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
          onChange={(e) => setCameraFov(parseInt(e.target.value))}
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
};

