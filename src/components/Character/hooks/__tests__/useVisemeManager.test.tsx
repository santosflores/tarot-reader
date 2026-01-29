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
  useChatbot: (selector: any) => {
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

// Mock VISEMES and VISEME_VALUES from webrtcLipsync
vi.mock('../../../utils/webrtcLipsync', () => ({
    VISEMES: {
        aa: 'viseme_aa',
    },
    // We only need one viseme to test the loop logic
    VISEME_VALUES: ['viseme_aa'],
    createWebRTCLipsyncAnalyzer: vi.fn(),
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

describe('useVisemeManager', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('stops updating morph targets when idle and values are settled', () => {
    // Setup mock mesh with proxy to count writes
    // Start with viseme_aa at 0.5 to trigger updates initially
    const morphTargetInfluences = [0.5];
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
      morphTargetDictionary: { 'viseme_aa': 0 },
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames until it settles
    // 0.5 should settle quickly
    // It should settle in < 20 frames
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    const initialWriteCount = writeCount;
    expect(initialWriteCount).toBeGreaterThan(0);

    // Run more frames. Write count should NOT increase after optimization.
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    // NOTE: This assertion will FAIL before the optimization is implemented
    // because currently it writes 0 every frame even if already 0 (or close to 0)
    // Wait, the current implementation has:
    // if (Math.abs(currentValue - targetValue) < 0.001) { ... if (currentValue !== targetValue) ... }
    // So if it IS exactly 0 (after snapping), it might NOT write.
    // Let's verify "currentValue !== targetValue" check in the current code.
    // In current code:
    // if (Math.abs(currentValue - targetValue) < 0.001) {
    //   if (currentValue !== targetValue) {
    //     mesh.morphTargetInfluences[index] = targetValue;
    //   }
    //   continue;
    // }
    //
    // So if it snaps to 0, next frame currentValue IS 0. targetValue IS 0.
    // 0 !== 0 is false. So it does NOT write.
    //
    // BUT the loop still runs.
    // The journal says "useFrame loops ... continue to run calculation logic ... causing unnecessary CPU usage".
    // The proxy test only counts WRITES.
    // To detect that the loop is running, I should count READS too.

    // Let's update the proxy to count reads.
    expect(writeCount).toBe(initialWriteCount);
  });

  it('stops reading morph targets when idle and settled (optimization verification)', () => {
    const morphTargetInfluences = [0]; // Already at 0
    let readCount = 0;

    const proxyInfluences = new Proxy(morphTargetInfluences, {
      get: (target, prop) => {
        if (!isNaN(Number(prop))) {
          readCount++;
        }
        return target[Number(prop)];
      }
    });

    const mesh = {
      morphTargetDictionary: { 'viseme_aa': 0 },
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    if (!frameCallback) return;

    // Run one frame. It should read to check if update is needed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frameCallback({} as any, 0.016);
    const initialReadCount = readCount;
    expect(initialReadCount).toBeGreaterThan(0);

    // Run 50 more frames.
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    // Without optimization, readCount will increase every frame (checking currentValue).
    // With optimization, readCount should stay same after settling.

    // Currently, this expectation will FAIL.
    expect(readCount).toBe(initialReadCount);
  });
});
