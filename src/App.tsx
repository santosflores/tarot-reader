/**
 * App component
 * Root application component
 */

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { UI } from './components/UI/UI';
import { Experience } from './components/Experience';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChatbot } from './hooks/useChatbot';
import { SCENE_CONSTANTS } from './config/constants';
import { safeAsync } from './utils/errors';

function App() {
  const setupAudioPlayer = useChatbot((state) => state.setupAudioPlayer);

  // Initialize audio player on mount
  useEffect(() => {
    safeAsync(
      async () => {
        setupAudioPlayer();
      },
      'Failed to initialize audio player'
    );
  }, [setupAudioPlayer]);

  return (
    <ErrorBoundary>
      <UI />
      <Canvas
        shadows
        camera={{
          position: SCENE_CONSTANTS.DEFAULT_CAMERA_POSITION,
          fov: SCENE_CONSTANTS.DEFAULT_CAMERA_FOV,
        }}
      >
        <color attach="background" args={[SCENE_CONSTANTS.BACKGROUND_COLOR]} />
        <Experience />
      </Canvas>
    </ErrorBoundary>
  );
}

export default App;

