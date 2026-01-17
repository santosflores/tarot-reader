
import { describe, it } from 'vitest';
import { VISEMES } from 'wawa-lipsync';

// Types needed for the benchmark
interface AudioFeatures {
  bands: number[];
  deltaBands: number[];
  volume: number;
  centroid: number;
}

const createMockFeatures = (): AudioFeatures => ({
  bands: Array(7).fill(Math.random()),
  deltaBands: Array(7).fill(Math.random()),
  volume: Math.random(),
  centroid: Math.random() * 8000
});

// Implementation 1: Current Array Push/Shift
class HistoryArray {
  private history: AudioFeatures[] = [];
  private readonly size: number;

  constructor(size: number) {
    this.size = size;
  }

  add(features: AudioFeatures) {
    this.history.push(features);
    if (this.history.length > this.size) {
      this.history.shift();
    }
  }

  getAverage(): AudioFeatures {
    const count = this.history.length;
    const result: AudioFeatures = {
      volume: 0,
      centroid: 0,
      bands: Array(7).fill(0),
      deltaBands: Array(7).fill(0),
    };

    for (const h of this.history) {
      result.volume += h.volume;
      result.centroid += h.centroid;
      h.bands.forEach((b, i) => (result.bands[i] += b));
    }

    if (count > 0) {
      result.volume /= count;
      result.centroid /= count;
      result.bands = result.bands.map((b) => b / count);
    }

    return result;
  }

  getPrevious(offset: number): AudioFeatures | undefined {
    if (this.history.length < offset) return undefined;
    return this.history[this.history.length - offset];
  }
}

// Implementation 2: Circular Buffer
class HistoryRingBuffer {
  private buffer: AudioFeatures[];
  private size: number;
  private index: number = 0;
  private count: number = 0;

  constructor(size: number) {
    this.size = size;
    this.buffer = new Array(size);
  }

  add(features: AudioFeatures) {
    this.buffer[this.index] = features;
    this.index = (this.index + 1) % this.size;
    if (this.count < this.size) {
      this.count++;
    }
  }

  getAverage(): AudioFeatures {
    const result: AudioFeatures = {
      volume: 0,
      centroid: 0,
      bands: Array(7).fill(0),
      deltaBands: Array(7).fill(0),
    };

    for (let i = 0; i < this.count; i++) {
      // We can optimize iteration by not caring about order,
      // since average is commutative.
      // But if we needed order we'd have to be careful.
      // For average, we just need to iterate over valid items.
      // However, since the buffer might not be full, we iterate 0..count-1?
      // No, the items are scattered if wrapped.

      // Actually simplest way to iterate valid items:
      // If not full: 0 to count-1
      // If full: 0 to size-1

      // But wait, if we are using a ring buffer, the data is always in `this.buffer`
      // at indices logic.
      // If count < size, valid indices are 0 to count-1.
      // If count == size, valid indices are 0 to size-1.
      // So we can just iterate the buffer up to `this.count`.

      const h = this.buffer[i];
      result.volume += h.volume;
      result.centroid += h.centroid;
      h.bands.forEach((b, k) => (result.bands[k] += b));
    }

    if (this.count > 0) {
      result.volume /= this.count;
      result.centroid /= this.count;
      result.bands = result.bands.map((b) => b / this.count);
    }

    return result;
  }

  // Need to support looking back: history[history.length - 2]
  // history.length is this.count.
  // The most recent item was added at `index - 1` (modulo size).
  getPrevious(offset: number): AudioFeatures | undefined {
    if (this.count < offset) return undefined;

    // index points to next write.
    // current head (newest) is at index - 1.
    // previous (offset 2) is at index - 2.

    let ptr = this.index - offset;
    if (ptr < 0) ptr += this.size;

    return this.buffer[ptr];
  }
}

describe('History Performance', () => {
  const ITERATIONS = 1_000_000;
  const HISTORY_SIZE = 10;

  it('measures array push/shift performance', () => {
    const history = new HistoryArray(HISTORY_SIZE);
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      history.add(createMockFeatures());
      history.getAverage();
      history.getPrevious(2);
    }

    const end = performance.now();
    console.log(`Array Push/Shift: ${(end - start).toFixed(2)}ms`);
  });

  it('measures ring buffer performance', () => {
    const history = new HistoryRingBuffer(HISTORY_SIZE);
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      history.add(createMockFeatures());
      history.getAverage();
      history.getPrevious(2);
    }

    const end = performance.now();
    console.log(`Ring Buffer: ${(end - start).toFixed(2)}ms`);
  });
});

// Viseme Optimization Benchmarks

const VISEME_CATEGORIES: Record<string, string> = {
  [VISEMES.sil]: "silence",
  [VISEMES.PP]: "plosive",
  [VISEMES.FF]: "fricative",
  [VISEMES.TH]: "fricative",
  [VISEMES.DD]: "plosive",
  [VISEMES.kk]: "plosive",
  [VISEMES.CH]: "fricative",
  [VISEMES.SS]: "fricative",
  [VISEMES.nn]: "plosive",
  [VISEMES.RR]: "fricative",
  [VISEMES.aa]: "vowel",
  [VISEMES.E]: "vowel",
  [VISEMES.I]: "vowel",
  [VISEMES.O]: "vowel",
  [VISEMES.U]: "vowel",
};

const scores: Record<string, number> = {};
Object.values(VISEMES).forEach(v => scores[v] = 0);

// Pre-computed
const PLOSIVE_VISEMES = Object.entries(VISEME_CATEGORIES)
  .filter(([, category]) => category === "plosive")
  .map(([viseme]) => viseme);

describe('Viseme Loop Performance', () => {
  const ITERATIONS = 1_000_000;
  // Mock data
  const volumeDelta = 0.005;
  const averagedVolume = 0.1;
  const centroidDelta = 1200;

  it('measures Object.entries loop', () => {
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
       Object.entries(VISEME_CATEGORIES).forEach(([viseme, category]) => {
        if (category === "plosive") {
          if (volumeDelta < 0.01) scores[viseme] -= 0.5;
          if (averagedVolume < 0.2) scores[viseme] += 0.2;
          if (centroidDelta > 1000) scores[viseme] += 0.2;
        }
      });
    }

    const end = performance.now();
    console.log(`Object.entries Loop: ${(end - start).toFixed(2)}ms`);
  });

  it('measures Pre-computed array loop', () => {
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      for (let j = 0; j < PLOSIVE_VISEMES.length; j++) {
        const viseme = PLOSIVE_VISEMES[j];
        if (volumeDelta < 0.01) scores[viseme] -= 0.5;
        if (averagedVolume < 0.2) scores[viseme] += 0.2;
        if (centroidDelta > 1000) scores[viseme] += 0.2;
      }
    }

    const end = performance.now();
    console.log(`Pre-computed Array Loop: ${(end - start).toFixed(2)}ms`);
  });
});
