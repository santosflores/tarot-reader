
import { renderHook } from '@testing-library/react';
import { useVisemeManager } from '../useVisemeManager';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { SkinnedMesh } from 'three';

// Mock useFrame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let frameCallback: ((state: any, delta: number) => void) | null = null;
vi.mock('@react-three/fiber', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

// Use vi.hoisted to ensure mockStore is available in the mock factory
const { mockStore } = vi.hoisted(() => {
  let state = {
    lipsyncManager: null,
    webrtcLipsyncManager: null,
    isAudioPlaying: false,
    audioPlayer: null,
    audioSourceType: null,
    isAgentSpeaking: false,
  };
  return {
    mockStore: {
      getState: () => state,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setState: (partial: any) => { state = { ...state, ...partial }; },
    }
  };
});

vi.mock('../../../../hooks/useChatbot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: any) => selector(mockStore.getState()),
}));

describe('useVisemeManager', () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
    mockStore.setState({
      lipsyncManager: null,
      webrtcLipsyncManager: null,
      isAudioPlaying: false,
      audioPlayer: null,
      audioSourceType: null,
      isAgentSpeaking: false,
    });
  });

  it('renders without crashing', () => {
    const mesh = {
      morphTargetDictionary: { 'viseme_aa': 0 },
      morphTargetInfluences: [0],
    } as unknown as SkinnedMesh;

    expect(() => {
      renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));
    }).not.toThrow();
  });

  it('optimizes loop by only updating active visemes', () => {
    // VISEME_VALUES contains 'viseme_aa', 'viseme_kk', etc.
    const viseme = 'viseme_aa';
    const otherViseme = 'viseme_kk';

    const mesh = {
      morphTargetDictionary: { [viseme]: 0, [otherViseme]: 1 },
      morphTargetInfluences: [0, 0],
    } as unknown as SkinnedMesh;

    // Track access to morphTargetInfluences
    const proxyInfluences = new Proxy(mesh.morphTargetInfluences!, {
        get(target, prop) {
            return target[Number(prop)];
        },
        set(target, prop, value) {
            target[Number(prop)] = value;
            return true;
        }
    });
    mesh.morphTargetInfluences = proxyInfluences;

    // Setup active state
    const mockLipsyncManager = {
        processAudio: vi.fn(),
        get viseme() { return viseme; }
    };

    mockStore.setState({
        lipsyncManager: mockLipsyncManager,
        isAudioPlaying: true,
        audioSourceType: 'file',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioPlayer: { paused: false, ended: false, currentTime: 1 } as any,
        isAgentSpeaking: true
    });

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();

    // Frame 1: Activation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frameCallback!({} as any, 0.016);

    // Should have accessed indices.
    // VISEME_VALUES has ~15 items. If optimization works, it should ONLY access 'viseme_aa' (if loop is optimized)
    // Wait, the cache builder iterates all VISEME_VALUES, but that's in useMemo (run once).
    // The useFrame loop iterates active set.
    // If NOT optimized, it would iterate ALL 15 visemes, and for each, check dictionary.
    // If dictionary has it, it accesses influences.
    // In our mock mesh, ONLY 'viseme_aa' is in dictionary.
    // So even unoptimized loop would only access 'viseme_aa' influences because morphTargetCache[other] is empty.

    // Ah, good point. The `morphTargetCache` optimization already prevents accessing influences for non-existent targets on the mesh.
    // But the `useFrame` loop itself iterates all strings.

    // To verify loop optimization, we can't easily count string iterations unless we spy on something called inside the loop.
    // But `updateMorphTarget` is called.

    // Frame 2: 'viseme_aa' is active. 'viseme_kk' is NOT active.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frameCallback!({} as any, 0.016);

    // If unoptimized:
    // It iterates all visemes.
    // for 'viseme_aa': target=1. Calls updateMorphTarget. Accesses index 0.
    // for 'viseme_kk': target=0. Calls updateMorphTarget. Accesses index 1.

    // If optimized:
    // It iterates active set. 'viseme_aa' is in set. 'viseme_kk' is NOT.
    // So only index 0 is accessed. Index 1 is touched 0 times.

    const accessedIndices = new Set<number>();

    const trackingProxy = new Proxy([0, 0], {
         get(target, prop) {
            if (!isNaN(Number(prop))) accessedIndices.add(Number(prop));
            return target[Number(prop)];
        },
        set(target, prop, value) {
            if (!isNaN(Number(prop))) accessedIndices.add(Number(prop));
            target[Number(prop)] = value;
            return true;
        }
    });
    mesh.morphTargetInfluences = trackingProxy;

    // Run a few frames to let initial set settle (viseme_kk should settle to 0 and be removed)
    // We assume viseme_aa is active so it stays.
    for (let i = 0; i < 5; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frameCallback!({} as any, 0.016);
    }

    // Reset indices tracking for the verification phase
    accessedIndices.clear();

    // Run verification frame
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frameCallback!({} as any, 0.016);

    expect(accessedIndices.has(0)).toBe(true); // viseme_aa (active)
    expect(accessedIndices.has(1)).toBe(false); // viseme_kk (should have been removed from set)

  });
});
