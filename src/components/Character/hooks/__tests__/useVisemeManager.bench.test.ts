
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

describe('useVisemeManager Performance', () => {
  it('measures updateMorphTarget execution time (Baseline vs Optimized)', () => {
    const meshes = Array.from({ length: 5 }, () => createMockMesh(20));
    // Simulate typical viseme set
    const visemes = Object.values(VISEMES);

    // Baseline implementation (Logic only)
    const updateMorphTargetBaseline = (target: string, targetValue: number) => {
      meshes.forEach((skinnedMesh) => {
        if (!skinnedMesh.morphTargetDictionary) return;
        const morphIndex = skinnedMesh.morphTargetDictionary[target];
        if (
          morphIndex !== undefined &&
          skinnedMesh.morphTargetInfluences &&
          typeof skinnedMesh.morphTargetInfluences[morphIndex] === 'number'
        ) {
          const currentValue = skinnedMesh.morphTargetInfluences[morphIndex];
          const smoothing = 0.5;
          skinnedMesh.morphTargetInfluences[morphIndex] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      });
    };

    // Optimized implementation (Logic only)
    // 1. Precompute cache
    const morphTargetCache: Record<string, Array<{ mesh: SkinnedMesh; index: number }>> = {};
    visemes.forEach((viseme) => {
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

    const updateMorphTargetOptimized = (target: string, targetValue: number) => {
      const targets = morphTargetCache[target];
      if (!targets) return;

      for (let i = 0; i < targets.length; i++) {
        const { mesh, index } = targets[i];
        if (
          mesh.morphTargetInfluences &&
          typeof mesh.morphTargetInfluences[index] === 'number'
        ) {
           const currentValue = mesh.morphTargetInfluences[index];
           const smoothing = 0.5;
           mesh.morphTargetInfluences[index] = MathUtils.lerp(currentValue, targetValue, smoothing);
        }
      }
    };

    const iterations = 50000;

    const startBaseline = performance.now();
    for (let i = 0; i < iterations; i++) {
         visemes.forEach(v => updateMorphTargetBaseline(v, 0.5));
    }
    const endBaseline = performance.now();
    const baselineTime = endBaseline - startBaseline;

    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
         visemes.forEach(v => updateMorphTargetOptimized(v, 0.5));
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    console.log(`Baseline execution time: ${baselineTime.toFixed(2)}ms`);
    console.log(`Optimized execution time: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Improvement: ${(baselineTime / optimizedTime).toFixed(2)}x`);

    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
