/**
 * App component
 * Root application component with 3D character and voice agent integration
 */

import { Canvas } from '@react-three/fiber';

import { UI } from './components/UI/UI';
import { Background } from './components/UI/Background';
import { Experience } from './components/Experience';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ElevenLabsOverlay } from './components/ElevenLabs';
import { CardLauncher } from './components/Tarot/CardLauncher';
import { OnboardingTooltip } from './components/UI/OnboardingTooltip';
import { AudioController } from './components/Audio/AudioController';
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from './config/camera';
import { Loader } from './components/UI/Loader';

function App() {
  return (
    <ErrorBoundary>
      <Loader />

      <div className="fixed inset-0 overflow-hidden">
        {/* Background Effects */}
        <Background />

        {/* Audio Controller (Invisible) */}
        <AudioController />

        <UI />

        {/* Onboarding tooltip for first-time users */}
        <OnboardingTooltip />

        {/* Voice Agent Overlay - positioned above the 3D scene */}
        <ElevenLabsOverlay />

        {/* Card Launcher - shows revealed cards around the mic button */}
        <CardLauncher />

        <Canvas
          shadows
          style={{ background: 'transparent' }}
          camera={{
            position: DEFAULT_CAMERA_POSITION,
            fov: DEFAULT_CAMERA_FOV,
          }}
        >
          <Experience />
        </Canvas>


      </div>
    </ErrorBoundary>
  );
}

export default App;

