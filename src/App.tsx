/**
 * App component
 * Root application component with 3D character and voice agent integration
 */

import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { UI } from './components/UI/UI';
import { Experience } from './components/Experience';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ElevenLabsOverlay } from './components/ElevenLabs';
import { useChatbot } from './hooks/useChatbot';
import { SCENE_CONSTANTS } from './config/constants';
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from './config/camera';
import { safeAsync } from './utils/errors';

function App() {
  const setupAudioPlayerRef = useRef<(() => void) | null>(null);

  // Initialize audio player on mount (only once)
  useEffect(() => {
    if (!setupAudioPlayerRef.current) {
      setupAudioPlayerRef.current = useChatbot.getState().setupAudioPlayer;
      safeAsync(
        async () => {
          setupAudioPlayerRef.current?.();
        },
        'Failed to initialize audio player'
      );
    }
  }, []);

  return (
    <ErrorBoundary>
      <UI />
      {/* Voice Agent Overlay - positioned above the 3D scene */}
      <ElevenLabsOverlay />
      <Canvas
        shadows
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: DEFAULT_CAMERA_FOV,
        }}
      >
        <color attach="background" args={[SCENE_CONSTANTS.BACKGROUND_COLOR]} />
        <Experience />
      </Canvas>
    </ErrorBoundary>
  );
}

export default App;

