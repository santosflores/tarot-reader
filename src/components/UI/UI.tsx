/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
 */

import { AnimationSelector } from './components/AnimationSelector';
import { CameraControls } from './components/CameraControls';
import { AudioPlayer } from './components/AudioPlayer';
import { UI_CONSTANTS } from '../../config/constants';

export const UI = () => {
  return (
    <div
      className="absolute top-2.5 left-2.5 z-[100] bg-white/90 p-4 rounded-lg shadow-lg"
      style={{
        zIndex: UI_CONSTANTS.Z_INDEX,
        background: UI_CONSTANTS.BACKGROUND_COLOR,
        padding: UI_CONSTANTS.PADDING,
        borderRadius: UI_CONSTANTS.BORDER_RADIUS,
      }}
    >
      <AudioPlayer />
      <AnimationSelector />
      <CameraControls />
    </div>
  );
};

