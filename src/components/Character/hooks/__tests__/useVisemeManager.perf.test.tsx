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

// Mock useChatbot store
const mockChatbotState = {
    isAudioPlaying: false,
    lipsyncManager: null,
    webrtcLipsyncManager: null,
    audioPlayer: null,
    audioSourceType: 'file',
    isAgentSpeaking: false,
};

vi.mock('../../../hooks/useChatbot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: any) => selector(mockChatbotState),
}));

// Mock VISEME_VALUES to have a small known set
vi.mock('../../../../utils/webrtcLipsync', () => ({
  VISEME_VALUES: ['viseme1', 'viseme2'],
}));

describe('useVisemeManager Performance', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
    mockChatbotState.isAudioPlaying = false;
    mockChatbotState.isAgentSpeaking = false;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('stops reading morph targets when idle and settled', () => {
    // Setup mock mesh with proxy to count reads/writes
    // Start with values that need to settle to 0
    const morphTargetInfluences = [0.1, 0.1];
    let writeCount = 0;
    let readCount = 0;

    const proxyInfluences = new Proxy(morphTargetInfluences, {
      set: (target, prop, value) => {
        if (!isNaN(Number(prop))) {
          writeCount++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (target as any)[prop] = value;
        return true;
      },
      get: (target, prop) => {
        if (!isNaN(Number(prop))) {
            readCount++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop];
      }
    });

    const mesh = {
      morphTargetDictionary: { 'viseme1': 0, 'viseme2': 1 },
      morphTargetInfluences: proxyInfluences,
    } as unknown as THREE.SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames until it settles
    // It should settle quickly
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    const initialReadCount = readCount;
    const initialWriteCount = writeCount;

    // Check if it settled (values should be close to 0)
    expect(morphTargetInfluences[0]).toBeLessThan(0.001);
    expect(morphTargetInfluences[1]).toBeLessThan(0.001);

    // Run more frames.
    // Without optimization, it will continue to READ values to check if update is needed
    // With optimization, it should stop reading entirely
    for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback({} as any, 0.016);
    }

    // If optimized, readCount should match initialReadCount (no new reads)
    // If unoptimized, it will increase by (2 visemes * 50 frames) = 100 reads
    expect(readCount).toBe(initialReadCount);
    expect(writeCount).toBe(initialWriteCount);
  });
});
