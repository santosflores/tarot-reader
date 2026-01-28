import { describe, it } from 'vitest';
import { VISEMES } from 'wawa-lipsync';

const VISEME_VALUES = Object.values(VISEMES);

// Mock SkinnedMesh
interface MockMesh {
  morphTargetInfluences: number[];
  name: string;
}

// Mock setup
const NUM_MESHES = 5;
const NUM_TARGETS_PER_MESH = 20;

const createMockMeshes = (): MockMesh[] => {
  return Array.from({ length: NUM_MESHES }, (_, i) => ({
    name: `Mesh${i}`,
    morphTargetInfluences: new Array(NUM_TARGETS_PER_MESH).fill(0),
  }));
};

// Simulate cache
const createMockCache = (meshes: MockMesh[]) => {
  const cache: Record<string, Array<{ mesh: MockMesh; index: number }>> = {};
  VISEME_VALUES.forEach((viseme, vIndex) => {
    cache[viseme] = [];
    meshes.forEach((mesh) => {
      // Map each viseme to a random index or specific one
      cache[viseme].push({
        mesh,
        index: vIndex % NUM_TARGETS_PER_MESH,
      });
    });
  });
  return cache;
};

// Current Implementation Logic
function runBaselineLoop(
  cache: Record<string, Array<{ mesh: MockMesh; index: number }>>
) {
  // Simulate useFrame else block
  VISEME_VALUES.forEach((viseme) => {
    // updateMorphTarget inline simulation
    const targets = cache[viseme];
    if (!targets) return;

    for (let i = 0; i < targets.length; i++) {
      const { mesh, index } = targets[i];
      const currentValue = mesh.morphTargetInfluences[index];
      const targetValue = 0;

      if (Math.abs(currentValue - targetValue) < 0.001) {
        if (currentValue !== targetValue) {
          mesh.morphTargetInfluences[index] = targetValue;
        }
        continue;
      }

      // Lerp simulation
      mesh.morphTargetInfluences[index] = currentValue * 0.9;
    }
  });
}

// Optimized Implementation Logic
function runOptimizedLoop(
  cache: Record<string, Array<{ mesh: MockMesh; index: number }>>,
  state: { settled: boolean }
) {
  if (state.settled) return;

  let allSettled = true;
  VISEME_VALUES.forEach((viseme) => {
    const targets = cache[viseme];
    if (!targets) return; // effectively settled

    let visemeSettled = true;
    for (let i = 0; i < targets.length; i++) {
      const { mesh, index } = targets[i];
      const currentValue = mesh.morphTargetInfluences[index];
      const targetValue = 0;

      if (Math.abs(currentValue - targetValue) < 0.001) {
        if (currentValue !== targetValue) {
          mesh.morphTargetInfluences[index] = targetValue;
        }
      } else {
         // Lerp simulation
         mesh.morphTargetInfluences[index] = currentValue * 0.9;
         visemeSettled = false;
      }
    }

    if (!visemeSettled) allSettled = false;
  });

  if (allSettled) {
    state.settled = true;
  }
}

describe('useVisemeManager Idle Performance', () => {
  const ITERATIONS = 100_000; // Frames to simulate

  it('measures baseline (always iterate)', () => {
    const meshes = createMockMeshes();
    const cache = createMockCache(meshes);

    // Start with non-zero values
    meshes.forEach(m => m.morphTargetInfluences.fill(0.5));

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      runBaselineLoop(cache);
    }
    const end = performance.now();
    console.log(`Baseline Idle Loop: ${(end - start).toFixed(2)}ms`);
  });

  it('measures optimized (short circuit)', () => {
    const meshes = createMockMeshes();
    const cache = createMockCache(meshes);
    const state = { settled: false };

    // Start with non-zero values
    meshes.forEach(m => m.morphTargetInfluences.fill(0.5));

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      runOptimizedLoop(cache, state);
    }
    const end = performance.now();
    console.log(`Optimized Idle Loop: ${(end - start).toFixed(2)}ms`);
  });
});
