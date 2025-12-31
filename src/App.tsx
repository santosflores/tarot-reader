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
import { RevealedCardOverlay } from './components/Tarot/RevealedCardOverlay';
import { useChatbot } from './hooks/useChatbot';
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
      {/* Background Image with CSS Effects */}
      <div className="fixed inset-0 -z-10">
        {/* Base image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/bg.jpg)' }}
        />
        {/* CSS Effects overlay */}
        <div className="tarot-background absolute inset-0" style={{ background: 'transparent' }}>
          {/* Slow rotating aurora */}
          <div className="aurora" />
          {/* Floating energy orbs */}
          <div className="energy-orbs">
            <span /><span /><span /><span />
          </div>
          {/* Moon glow */}
          <div className="moon-glow" />
          {/* Rising particles */}
          <div className="mystical-particles">
            <span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span />
          </div>
          {/* Breathing pulse */}
          <div className="breathing-bg" />
          {/* Vignette */}
          <div className="vignette" />
        </div>
      </div>
      
      <UI />
      {/* Voice Agent Overlay - positioned above the 3D scene */}
      <ElevenLabsOverlay />
      {/* Revealed Card Overlay - displays tarot card from revealCard tool */}
      <RevealedCardOverlay />
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
    </ErrorBoundary>
  );
}

export default App;

