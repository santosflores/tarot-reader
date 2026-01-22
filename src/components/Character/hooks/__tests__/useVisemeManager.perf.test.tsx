import { renderHook } from '@testing-library/react';
import { useVisemeManager } from '../useVisemeManager';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { VISEMES } from 'wawa-lipsync';

// Mock useFrame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let frameCallback: ((state: any, delta: number) => void) | null = null;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

// Mock useChatbot
const mockChatbotState = {
  lipsyncManager: null,
  webrtcLipsyncManager: null,
  isAudioPlaying: false,
  audioPlayer: null,
  audioSourceType: 'file',
  isAgentSpeaking: false,
};

vi.mock('../../../hooks/useChatbot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: any) => selector(mockChatbotState),
}));

describe('useVisemeManager Performance', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
    mockChatbotState.isAudioPlaying = false;
    mockChatbotState.lipsyncManager = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures property accesses when idle', () => {
    let accessCount = 0;

    // Create mock mesh for all visemes
    const dictionary: Record<string, number> = {};
    const influences: number[] = [];

    Object.values(VISEMES).forEach((v, i) => {
        dictionary[v] = i;
        influences[i] = 0;
    });

    const proxyInfluences = new Proxy(influences, {
      get: (target, prop) => {
        // Only count array index accesses
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          accessCount++;
        }
        return target[Number(prop)];
      },
      set: (target, prop, value) => {
         if (typeof prop === 'string' && !isNaN(Number(prop))) {
          accessCount++;
        }
        target[Number(prop)] = value;
        return true;
      }
    });

    const mesh = {
      morphTargetDictionary: dictionary,
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run 10 frames
    for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    console.log(`[Perf] Access count over 10 frames (Idle): ${accessCount}`);

    // Unoptimized: ~15 visemes * 10 frames = 150 reads.
    // Optimized: Should be 0.

    expect(accessCount).toBe(0);
  });
});
