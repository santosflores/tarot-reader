import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCharacterAnimation } from '../useCharacterAnimation';
import { useAnimation } from '../../../../hooks/useAnimation';
import * as THREE from 'three';

const mocks = vi.hoisted(() => ({
  clipAction: vi.fn(),
  update: vi.fn(),
}));

// Mock Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    AnimationMixer: class {
      constructor() {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clipAction(...args: any[]) { return mocks.clipAction(...args); }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update(...args: any[]) { return mocks.update(...args); }
      stopAllAction() {}
    },
    Group: vi.fn(),
  };
});

// Mock @react-three/fiber
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let frameCallback: (state: any, delta: number) => void;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

describe('useCharacterAnimation Performance', () => {
  beforeEach(() => {
    useAnimation.setState({
      currentAnimation: 'Idle',
      availableAnimations: ['Idle'],
      isPaused: false,
      currentTime: 0,
      duration: 0,
    });
    vi.clearAllMocks();
  });

  it('updates store every frame causing high update frequency', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupRef = { current: new THREE.Group() } as any;

    const animationMap = {
      Idle: [new THREE.AnimationClip('Idle', 10, [])],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    let actionTime = 0;
    const mockAction = {
      setLoop: vi.fn(),
      reset: vi.fn(),
      fadeIn: vi.fn(),
      fadeOut: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
      isRunning: vi.fn().mockReturnValue(true),
      get paused() { return false; },
      set paused(_v) {},
      get time() { return actionTime; },
      set time(v) { actionTime = v; },
      getClip: vi.fn().mockReturnValue({ duration: 10 }),
    };

    mocks.clipAction.mockReturnValue(mockAction);
    mocks.update.mockImplementation((delta: number) => {
      actionTime += delta;
    });

    renderHook(() =>
      useCharacterAnimation({
        animationMap,
        currentAnimation: 'Idle',
        groupRef,
      })
    );

    let updateCount = 0;
    const unsubscribe = useAnimation.subscribe(() => {
       updateCount++;
    });

    // Force the useFrame callback to run 60 times
    for (let i = 0; i < 60; i++) {
        frameCallback({}, 0.016); // 16ms delta
    }

    unsubscribe();

    console.log(`Store updates in 60 frames: ${updateCount}`);

    // Expect significantly reduced updates (throttled to ~10fps)
    // 60 frames at 16ms is ~1 second. We expect roughly 10 updates.
    expect(updateCount).toBeLessThan(15);
    expect(updateCount).toBeGreaterThan(5);
  });
});
