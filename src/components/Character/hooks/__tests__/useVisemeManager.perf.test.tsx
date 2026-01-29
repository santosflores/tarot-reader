import { renderHook } from '@testing-library/react';
import { useVisemeManager } from '../useVisemeManager';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import type { RootState } from '@react-three/fiber';
import { VISEME_VALUES } from '../../../../utils/webrtcLipsync';

// Mock useFrame
let frameCallback: ((state: RootState, delta: number) => void) | null = null;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

// Mock useChatbot
const mockUseChatbot = vi.fn();
vi.mock('../../../../hooks/useChatbot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: any) => mockUseChatbot(selector),
}));

describe('useVisemeManager Performance', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
  });

  it('stops reading morphTargetInfluences when settled', () => {
    // Setup state
    const state = {
      lipsyncManager: null,
      webrtcLipsyncManager: null,
      isAudioPlaying: false,
      audioPlayer: null,
      audioSourceType: null,
      isAgentSpeaking: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseChatbot.mockImplementation((selector: any) => selector(state));

    // Setup mesh with proxy
    let readCount = 0;
    const morphTargetInfluences = [0.1]; // Start non-zero

    // Use Proxy to count reads
    const proxyInfluences = new Proxy(morphTargetInfluences, {
      get: (target, prop) => {
        // Only count numeric index access
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          readCount++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop];
      },
      set: (target, prop, value) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (target as any)[prop] = value;
        return true;
      }
    });

    // Ensure we have a valid key for the dictionary
    const firstViseme = VISEME_VALUES[0];
    const dictionary: Record<string, number> = {};
    dictionary[firstViseme] = 0;

    const mesh = {
      morphTargetDictionary: dictionary,
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames to settle
    const initialReadCount = readCount;

    // Run 50 frames. It should settle.
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    const settledReadCount = readCount;

    // Debug info
    if (settledReadCount === initialReadCount) {
        console.log('VISEME_VALUES:', VISEME_VALUES);
        console.log('Mesh Dictionary:', mesh.morphTargetDictionary);
    }

    expect(settledReadCount).toBeGreaterThan(initialReadCount);

    // Run 50 MORE frames.
    // OPTIMIZED: readCount should NOT increase

    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    expect(readCount).toBe(settledReadCount);
  });
});
