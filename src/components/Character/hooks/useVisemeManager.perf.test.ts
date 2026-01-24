
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useVisemeManager } from './useVisemeManager';
import { SkinnedMesh } from 'three';
import { VISEMES } from 'wawa-lipsync';

// Mock imports
vi.mock('../../../hooks/useChatbot', () => ({
  useChatbot: vi.fn(),
}));

// Mock useFrame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let frameCallback: ((state: any, delta: number) => void) | null = null;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

import { useChatbot } from '../../../hooks/useChatbot';

describe('useVisemeManager Performance', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMesh: any;
  let accessCount = 0;

  beforeEach(() => {
    accessCount = 0;
    frameCallback = null;
    vi.clearAllMocks();

    // Setup Mock Mesh with Proxy to count accesses
    const influenceArray = new Float32Array(50); // 50 morph targets
    const morphTargetDictionary: Record<string, number> = {};

    // Map all visemes to indices
    Object.values(VISEMES).forEach((v, i) => {
      morphTargetDictionary[v] = i;
    });

    const influencesProxy = new Proxy(influenceArray, {
      get(target, prop) {
        // Count only numeric index access
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          accessCount++;
        }
        return Reflect.get(target, prop);
      },
      set(target, prop, value) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            accessCount++;
        }
        return Reflect.set(target, prop, value);
      }
    });

    mockMesh = {
      morphTargetDictionary,
      morphTargetInfluences: influencesProxy,
    } as unknown as SkinnedMesh;

    // Setup default chatbot state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useChatbot as any).mockImplementation((selector: any) => {
      const state = {
        lipsyncManager: {
            processAudio: vi.fn(),
            viseme: VISEMES.sil,
        },
        webrtcLipsyncManager: null,
        isAudioPlaying: true,
        audioPlayer: { paused: false, ended: false, currentTime: 1 },
        audioSourceType: 'file',
        isAgentSpeaking: true,
      };
      return selector(state);
    });
  });

  it('measures property access count per frame', () => {
    const { unmount } = renderHook(() =>
      useVisemeManager({ avatarSkinnedMeshes: [mockMesh] })
    );

    expect(frameCallback).toBeDefined();

    // Run one frame (initialization phase - clears all visemes)
    if (frameCallback) {
        accessCount = 0; // Reset before frame
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }
    console.log(`Frame 1 accesses (initialization): ${accessCount}`);

    // Run second frame (steady state - optimization active)
    if (frameCallback) {
        accessCount = 0; // Reset before frame
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }
    console.log(`Frame 2 accesses (steady state): ${accessCount}`);

    // Optimization check: Should be significantly less than 15 accesses
    // Typically 2-4 accesses for a single active viseme
    expect(accessCount).toBeLessThan(10);

    unmount();
  });
});
