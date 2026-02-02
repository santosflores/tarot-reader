import { renderHook } from "@testing-library/react";
import { useVisemeManager } from "../useVisemeManager";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { RootState } from "@react-three/fiber";
import type { SkinnedMesh } from "three";

// Mock useFrame
let frameCallback: ((state: RootState, delta: number) => void) | null = null;
vi.mock("@react-three/fiber", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrame: (cb: any) => {
    frameCallback = cb;
  },
}));

// Mock useChatbot
vi.mock("../../../../hooks/useChatbot", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChatbot: (selector: any) => {
    // Mock state
    const state = {
      lipsyncManager: null,
      webrtcLipsyncManager: null,
      isAudioPlaying: false,
      audioPlayer: null,
      audioSourceType: "file",
      isAgentSpeaking: false,
    };
    return selector(state);
  },
}));

// Mock webrtcLipsync to avoid import issues and provide VISEMES
vi.mock("../../../../utils/webrtcLipsync", () => ({
  VISEMES: {
    aa: "aa",
    E: "E",
    I: "I",
    O: "O",
    U: "U",
    sil: "sil",
  },
  VISEME_VALUES: ["aa", "E", "I", "O", "U", "sil"],
}));

describe("useVisemeManager Performance", () => {
  beforeEach(() => {
    frameCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("stops reading morph targets when visemes are settled to zero", () => {
    // Setup mock mesh with proxy to count reads and writes
    let readCount = 0;
    let writeCount = 0;

    // Start with 'aa' viseme active (0.5)
    const morphTargetInfluences = [0.5, 0, 0, 0, 0, 0];
    const morphTargetDictionary = {
      aa: 0,
      E: 1,
      I: 2,
      O: 3,
      U: 4,
      sil: 5,
    };

    const proxyInfluences = new Proxy(morphTargetInfluences, {
      get: (target, prop) => {
        if (!isNaN(Number(prop))) {
          readCount++;
        }
        return target[Number(prop)];
      },
      set: (target, prop, value) => {
        if (!isNaN(Number(prop))) {
          writeCount++;
        }
        target[Number(prop)] = value;
        return true;
      },
    });

    const mesh = {
      morphTargetDictionary,
      morphTargetInfluences: proxyInfluences,
    } as unknown as SkinnedMesh;

    renderHook(() => useVisemeManager({ avatarSkinnedMeshes: [mesh] }));

    expect(frameCallback).toBeDefined();
    if (!frameCallback) return;

    // Run frames to let it settle (reset to 0)
    // Smoothing is involved, so it might take a few frames.
    // We want to verify that eventually, READS stop.

    // First 50 frames: should see reads and writes as it resets
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frameCallback({} as any, 0.016);
    }

    // Check that we had activity
    expect(readCount).toBeGreaterThan(0);
    expect(writeCount).toBeGreaterThan(0);

    // Reset counters
    const readsAfterSettle = readCount;
    const writesAfterSettle = writeCount;

    // Run more frames.
    // WITHOUT optimization: Reads will continue (checking if reset is needed).
    // WITH optimization: Reads should stop (short-circuited).
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frameCallback({} as any, 0.016);
    }

    // This assertion expects the optimization to be present.
    // It will FAIL currently.
    expect(readCount).toBe(readsAfterSettle);

    // Writes should also have stopped (this should pass even without optimization if logic is correct)
    expect(writeCount).toBe(writesAfterSettle);
  });
});
