import { renderHook } from '@testing-library/react';
import { useVisemeManager } from '../useVisemeManager';
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

// Mock useChatbot
vi.mock('../../../hooks/useChatbot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: (state: any) => any) => {
    // Mock state where nothing is playing
    const state = {
      lipsyncManager: null,
      webrtcLipsyncManager: null,
      isAudioPlaying: false,
      audioPlayer: null,
      audioSourceType: null,
      isAgentSpeaking: false,
    };
    return selector(state);
  },
}));

// Mock MathUtils
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof THREE>('three');
  return {
    ...actual,
    MathUtils: {
      ...actual.MathUtils,
      lerp: actual.MathUtils.lerp,
    },
  };
});

// Mock dependencies
vi.mock('../../../utils/webrtcLipsync', () => ({
  VISEME_VALUES: ['viseme_aa', 'viseme_E', 'viseme_I'], // Simplified list
}));

describe('useVisemeManager Performance', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('stops accessing morph targets when idle and settled', () => {
    // Setup mock mesh with proxy to count reads/writes
    const morphTargetInfluences = [0, 0, 0]; // Initial values
    let accessCount = 0;

    const proxyInfluences = new Proxy(morphTargetInfluences, {
      get: (target, prop) => {
        // Count access to array indices (reads)
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          accessCount++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return target[prop as any];
      },
      set: (target, prop, value) => {
        // We don't care about writes for this test, as the existing optimization handles writes.
        // We care about unnecessary reads/checks.
        target[Number(prop)] = value;
        return true;
      }
    });

    const mesh = {
      morphTargetDictionary: {
        'viseme_aa': 0,
        'viseme_E': 1,
        'viseme_I': 2
      },
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames until it settles (it starts at 0, so it should be settled immediately if we pass 0)
    // But the hook might still run the loop.

    // Reset counter
    accessCount = 0;

    // Run 100 frames
    for (let i = 0; i < 100; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    const currentAccessCount = accessCount;

    // With 3 visemes * 1 mesh * 100 frames = 300 accesses expected if unoptimized
    console.log(`Access count over 100 frames: ${currentAccessCount}`);

    // In unoptimized version, this should be high (> 0).
    // In optimized version, this should be low (just the initial check) because it starts settled and idle.
    // It runs one pass (3 visemes * 2 accesses = 6 accesses) then settles.

    expect(currentAccessCount).toBeLessThan(10);
    expect(currentAccessCount).toBeGreaterThan(0);
  });

});
