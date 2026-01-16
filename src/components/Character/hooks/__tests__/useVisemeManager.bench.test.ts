
import { describe, it, expect } from 'vitest';
import { MathUtils } from 'three';
import { VISEMES } from 'wawa-lipsync';
import type { SkinnedMesh } from 'three';

// Mock SkinnedMesh
const createMockMesh = (morphTargetCount = 20) => {
  const dictionary: Record<string, number> = {};
  const influences: number[] = [];
  for (let i = 0; i < morphTargetCount; i++) {
    const name = `viseme_${i}`;
    dictionary[name] = i;
    influences.push(0);
  }
  // Also add standard visemes
  Object.values(VISEMES).forEach((v, i) => {
      dictionary[v] = i % morphTargetCount;
  });

  return {
    morphTargetDictionary: dictionary,
    morphTargetInfluences: influences,
  } as unknown as SkinnedMesh;
};

describe('useVisemeManager Performance (Allocation & Epsilon)', () => {
  it('measures execution time including Object.values and epsilon check', () => {
    const meshes = Array.from({ length: 5 }, () => createMockMesh(20));

    // Simulate what happens in useFrame
    const updateMorphTarget = (mesh: SkinnedMesh, index: number, targetValue: number) => {
        if (!mesh.morphTargetInfluences) return;
        const currentValue = mesh.morphTargetInfluences[index];
        const smoothing = 0.5;
        mesh.morphTargetInfluences[index] = MathUtils.lerp(currentValue, targetValue, smoothing);
    };

    const morphTargetCache: Record<string, Array<{ mesh: SkinnedMesh; index: number }>> = {};
    Object.values(VISEMES).forEach((viseme) => {
      morphTargetCache[viseme] = [];
      meshes.forEach((mesh) => {
        if (mesh.morphTargetDictionary && mesh.morphTargetDictionary[viseme] !== undefined) {
          morphTargetCache[viseme].push({
            mesh,
            index: mesh.morphTargetDictionary[viseme],
          });
        }
      });
    });

    const updateMorphTargetOptimized = (targets: Array<{ mesh: SkinnedMesh; index: number }>, targetValue: number) => {
      if (!targets) return;
      for (let i = 0; i < targets.length; i++) {
        const { mesh, index } = targets[i];
        if (mesh.morphTargetInfluences) {
           const currentValue = mesh.morphTargetInfluences[index];
           if (Math.abs(targetValue - currentValue) < 0.001) {
             if (currentValue !== targetValue) mesh.morphTargetInfluences[index] = targetValue;
             continue;
           }
           const smoothing = 0.5;
           mesh.morphTargetInfluences[index] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      }
    };

    const updateMorphTargetBaseline = (targets: Array<{ mesh: SkinnedMesh; index: number }>, targetValue: number) => {
      if (!targets) return;
      for (let i = 0; i < targets.length; i++) {
        const { mesh, index } = targets[i];
        if (mesh.morphTargetInfluences) {
           const currentValue = mesh.morphTargetInfluences[index];
           const smoothing = 0.5;
           mesh.morphTargetInfluences[index] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      }
    };

    const iterations = 50000;
    const currentViseme = VISEMES.aa;

    // Baseline: Call Object.values inside loop + no epsilon check
    const startBaseline = performance.now();
    for (let i = 0; i < iterations; i++) {
         Object.values(VISEMES).forEach((viseme) => {
             const targetValue = viseme === currentViseme ? 1 : 0;
             updateMorphTargetBaseline(morphTargetCache[viseme], targetValue);
         });
    }
    const endBaseline = performance.now();
    const baselineTime = endBaseline - startBaseline;

    // Optimized: Cached Object.values + epsilon check
    const VISEME_VALUES = Object.values(VISEMES);
    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
         VISEME_VALUES.forEach((viseme) => {
             const targetValue = viseme === currentViseme ? 1 : 0;
             updateMorphTargetOptimized(morphTargetCache[viseme], targetValue);
         });
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    console.log(`Baseline execution time: ${baselineTime.toFixed(2)}ms`);
    console.log(`Optimized execution time: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Improvement: ${(baselineTime / optimizedTime).toFixed(2)}x`);

    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
