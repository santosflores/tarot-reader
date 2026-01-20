import { renderHook } from '@testing-library/react';
import { useBlinkManager } from '../useBlinkManager';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import type { RootState } from '@react-three/fiber';

// Mock useFrame
let frameCallback: ((state: RootState, delta: number) => void) | null = null;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

// Mock MathUtils to control random blink interval
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof THREE>('three');
  return {
    ...actual,
    MathUtils: {
      ...actual.MathUtils,
      // Return a very large number for interval so it doesn't blink automatically during test
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      randFloat: (_min: number, _max: number) => 1000,
      lerp: actual.MathUtils.lerp,
    },
  };
});

describe('useBlinkManager', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('stops updating morph targets when eyes are fully open', () => {
    // Setup mock mesh with proxy to count writes
    // Start with eyes partially closed (0.1) to trigger updates initially
    const morphTargetInfluences = [0.1];
    let writeCount = 0;

    const proxyInfluences = new Proxy(morphTargetInfluences, {
      set: (target, prop, value) => {
        if (!isNaN(Number(prop))) {
          writeCount++;
        }
        target[Number(prop)] = value;
        return true;
      }
    });

    const mesh = {
      morphTargetDictionary: { 'eyesClosed': 0 },
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useBlinkManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames until it settles
    // 0.1 should settle quickly with speed 0.25 (open speed)
    // 0.1 -> 0.075 -> 0.056 -> 0.042 ...
    // It should settle in < 20 frames
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    const initialWriteCount = writeCount;
    expect(initialWriteCount).toBeGreaterThan(0);

    // Run more frames. Write count should NOT increase.
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    expect(writeCount).toBe(initialWriteCount);
  });
});
