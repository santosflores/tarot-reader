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

  const formattedX = useMemo(() => cameraPosition[0].toFixed(1), [cameraPosition]);
  const formattedY = useMemo(() => cameraPosition[1].toFixed(1), [cameraPosition]);
  const formattedZ = useMemo(() => cameraPosition[2].toFixed(1), [cameraPosition]);

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200">Camera Controls</h3>

      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          X: <span className="font-medium text-purple-100">{formattedX}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.X.min}
          max={CAMERA_POSITION_LIMITS.X.max}
          step="0.1"
          value={cameraPosition[0]}
          onChange={handleXChange}
          className="w-full accent-purple-500"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          Y: <span className="font-medium text-purple-100">{formattedY}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Y.min}
          max={CAMERA_POSITION_LIMITS.Y.max}
          step="0.1"
          value={cameraPosition[1]}
          onChange={handleYChange}
          className="w-full accent-purple-500"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          Z: <span className="font-medium text-purple-100">{formattedZ}</span>
        </label>
        <input
          type="range"
          min={CAMERA_POSITION_LIMITS.Z.min}
          max={CAMERA_POSITION_LIMITS.Z.max}
          step="0.1"
          value={cameraPosition[2]}
          onChange={handleZChange}
          className="w-full accent-purple-500"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          FOV: <span className="font-medium text-purple-100">{cameraFov}</span>
        </label>
        <input
          type="range"
          min={CAMERA_FOV_LIMITS.min}
          max={CAMERA_FOV_LIMITS.max}
          step="1"
          value={cameraFov}
          onChange={handleFovChange}
          className="w-full accent-purple-500"
        />
      </div>

      <button
        onClick={handleReset}
        className="mt-2 text-xs px-2 py-1 bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-gray-300 hover:text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg"
      >
        Reset Position
      </button>
    </div>
  );
});

CameraControls.displayName = 'CameraControls';

