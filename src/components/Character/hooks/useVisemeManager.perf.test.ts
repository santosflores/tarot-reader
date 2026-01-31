import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVisemeManager } from './useVisemeManager';

// Mock dependencies
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((callback) => {
    // Expose the callback for manual invocation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__useFrameCallback = callback;
  }),
}));

vi.mock('../../../hooks/useChatbot', () => ({
  useChatbot: vi.fn(),
}));

// Mock VISEME_VALUES to have a controlled list
vi.mock('../../../utils/webrtcLipsync', () => ({
  VISEME_VALUES: ['viseme_aa', 'viseme_E', 'viseme_I'], // subset for testing
}));

// Mock ANIMATION_CONSTANTS
vi.mock('../../../config/animations', () => ({
  ANIMATION_CONSTANTS: {
    VISEME_ACTIVATION_SMOOTHING: 0.1,
    VISEME_DEACTIVATION_SMOOTHING: 0.1,
  },
}));

import { useChatbot } from '../../../hooks/useChatbot';

describe('useVisemeManager Performance', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMesh: any;
  let accessCount: number;

  beforeEach(() => {
    vi.clearAllMocks();
    accessCount = 0;

    // Create a mesh with proxied morphTargetInfluences
    const realInfluences = [0, 0, 0];
    const proxyInfluences = new Proxy(realInfluences, {
      get(target, prop, receiver) {
        if (typeof prop !== 'symbol' && !isNaN(Number(prop))) {
          accessCount++;
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
      },
    });

    mockMesh = {
      morphTargetDictionary: {
        'viseme_aa': 0,
        'viseme_E': 1,
        'viseme_I': 2,
      },
      morphTargetInfluences: proxyInfluences,
    };

    // Default mock state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useChatbot as any).mockImplementation((selector: any) => {
      const state = {
        lipsyncManager: null,
        webrtcLipsyncManager: null,
        isAudioPlaying: false,
        audioPlayer: null,
        audioSourceType: null,
        isAgentSpeaking: false,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__useFrameCallback;
  });

  it('reduces morphTargetInfluences access when idle (optimized)', () => {
    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mockMesh] }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const frameCallback = (globalThis as any).__useFrameCallback;
    expect(frameCallback).toBeDefined();

    // Run frame loop 10 times
    for (let i = 0; i < 10; i++) {
      frameCallback();
    }

    console.log(`Optimized Access Count: ${accessCount}`);

    // With optimization:
    // Frame 1: Checks all 3 visemes. Each has 2 accesses (typeof check + value read). Total 6.
    // Frame 1: All settle. `visemesSettledRef` becomes true.
    // Frame 2-10: Short-circuits. 0 accesses.
    // Total should be exactly 6.

    expect(accessCount).toBeLessThanOrEqual(10);
    expect(accessCount).toBe(6);
  });
});
