/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
 */

import { AnimationSelector } from './components/AnimationSelector';
import { CameraControls } from './components/CameraControls';
import { AudioPlayer } from './components/AudioPlayer';

export const UI = () => {
  return (
    <div className="absolute top-2.5 left-2.5 z-[100] bg-white/90 p-[15px] rounded-lg shadow-lg w-[300px] max-h-[calc(100vh-20px)] overflow-y-auto">
      <AudioPlayer />
      <AnimationSelector />
      <CameraControls />
    </div>
  );
};

