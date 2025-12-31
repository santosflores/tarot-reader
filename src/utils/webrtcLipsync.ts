/**
 * WebRTC Lipsync Analyzer
 * Extended version of wawa-lipsync that works with MediaStreams
 * without causing double audio playback
 * 
 * This is based on the wawa-lipsync algorithm but modified to:
 * 1. Accept MediaStream directly (not audio element)
 * 2. NOT connect to audio destination (no playback)
 */

import { VISEMES } from 'wawa-lipsync';

// Viseme categories for state detection
const VISEME_CATEGORIES: Record<string, string> = {
  [VISEMES.sil]: 'silence',
  [VISEMES.PP]: 'plosive',
  [VISEMES.FF]: 'fricative',
  [VISEMES.TH]: 'fricative',
  [VISEMES.DD]: 'plosive',
  [VISEMES.kk]: 'plosive',
  [VISEMES.CH]: 'fricative',
  [VISEMES.SS]: 'fricative',
  [VISEMES.nn]: 'plosive',
  [VISEMES.RR]: 'fricative',
  [VISEMES.aa]: 'vowel',
  [VISEMES.E]: 'vowel',
  [VISEMES.I]: 'vowel',
  [VISEMES.O]: 'vowel',
  [VISEMES.U]: 'vowel',
};

interface AudioFeatures {
  bands: number[];
  deltaBands: number[];
  volume: number;
  centroid: number;
}

export interface WebRTCLipsyncAnalyzer {
  viseme: string;
  processAudio: () => void;
  connectStream: (stream: MediaStream) => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

function average(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/**
 * Creates a WebRTC lipsync analyzer using the same algorithm as wawa-lipsync
 * but modified to work with MediaStreams without audio output
 */
export function createWebRTCLipsyncAnalyzer(): WebRTCLipsyncAnalyzer {
  // Audio processing
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let dataArray: Uint8Array | null = null;
  
  // State
  let connected = false;
  let currentViseme = VISEMES.sil;
  let visemeStartTime = 0;
  const maxVisemeDuration = 100;
  
  // History for smoothing
  const history: AudioFeatures[] = [];
  const historySize = 10;
  
  // Frequency bands (same as wawa-lipsync)
  const bands = [
    { start: 50, end: 200 },    // Band 0: Low energy
    { start: 200, end: 400 },   // Band 1: F1 lower
    { start: 400, end: 800 },   // Band 2: F1 mid
    { start: 800, end: 1500 },  // Band 3: F2 front
    { start: 1500, end: 2500 }, // Band 4: F2/F3
    { start: 2500, end: 4000 }, // Band 5: Fricatives
    { start: 4000, end: 8000 }, // Band 6: High fricatives
  ];
  
  let sampleRate = 44100;
  let binWidth = sampleRate / 2048;

  const connectStream = (stream: MediaStream): void => {
    if (connected) {
      disconnect();
    }
    
    try {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      sourceNode = audioContext.createMediaStreamSource(stream);
      
      // Connect source to analyser ONLY - not to destination
      // This is the key difference from wawa-lipsync
      sourceNode.connect(analyser);
      // Do NOT connect to destination: analyser.connect(audioContext.destination)
      
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      sampleRate = audioContext.sampleRate;
      binWidth = sampleRate / analyser.fftSize;
      
      connected = true;
      history.length = 0;
      visemeStartTime = performance.now();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      if (import.meta.env.DEV) {
        console.log('[WebRTCLipsync] Connected to stream', {
          sampleRate,
          binWidth,
          fftSize: analyser.fftSize,
        });
      }
    } catch (error) {
      console.error('[WebRTCLipsync] Failed to connect:', error);
      disconnect();
    }
  };
  
  const disconnect = (): void => {
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (analyser) {
      analyser.disconnect();
      analyser = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    dataArray = null;
    connected = false;
    currentViseme = VISEMES.sil;
    history.length = 0;
  };
  
  const isConnected = (): boolean => connected;
  
  const extractFeatures = (): AudioFeatures | null => {
    if (!analyser || !dataArray) return null;
    
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate band energies
    const bandEnergies = bands.map(({ start, end }) => {
      const startBin = Math.round(start / binWidth);
      const endBin = Math.min(Math.round(end / binWidth), dataArray!.length - 1);
      const slice = Array.from(dataArray!.slice(startBin, endBin));
      return average(slice) / 255;
    });
    
    // Calculate spectral centroid
    let totalEnergy = 0;
    let weightedSum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const energy = dataArray[i] / 255;
      totalEnergy += energy;
      weightedSum += freq * energy;
    }
    const centroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;
    
    // Calculate volume
    const volume = average(bandEnergies);
    
    // Calculate delta bands (change from previous)
    const deltaBands = bandEnergies.map((energy, idx) => {
      if (history.length < 2) return 0;
      const prev = history[history.length - 2].bands[idx];
      return energy - prev;
    });
    
    const features: AudioFeatures = {
      bands: bandEnergies,
      deltaBands,
      volume,
      centroid,
    };
    
    // Update history
    if (totalEnergy > 0) {
      history.push(features);
      if (history.length > historySize) {
        history.shift();
      }
    }
    
    return features;
  };
  
  const getAveragedFeatures = (): AudioFeatures => {
    const count = history.length;
    const result: AudioFeatures = {
      volume: 0,
      centroid: 0,
      bands: Array(bands.length).fill(0),
      deltaBands: Array(bands.length).fill(0),
    };
    
    for (const h of history) {
      result.volume += h.volume;
      result.centroid += h.centroid;
      h.bands.forEach((b, i) => result.bands[i] += b);
    }
    
    if (count > 0) {
      result.volume /= count;
      result.centroid /= count;
      result.bands = result.bands.map(b => b / count);
    }
    
    return result;
  };
  
  const computeVisemeScores = (
    current: AudioFeatures,
    averaged: AudioFeatures,
    volumeDelta: number,
    centroidDelta: number
  ): Record<string, number> => {
    const scores: Record<string, number> = {
      [VISEMES.sil]: 0,
      [VISEMES.PP]: 0,
      [VISEMES.FF]: 0,
      [VISEMES.TH]: 0,
      [VISEMES.DD]: 0,
      [VISEMES.kk]: 0,
      [VISEMES.CH]: 0,
      [VISEMES.SS]: 0,
      [VISEMES.nn]: 0,
      [VISEMES.RR]: 0,
      [VISEMES.aa]: 0,
      [VISEMES.E]: 0,
      [VISEMES.I]: 0,
      [VISEMES.O]: 0,
      [VISEMES.U]: 0,
    };
    
    const [, band1, band2, band3, band4, band5, band6] = current.bands;
    
    // Silence detection
    if (averaged.volume < 0.2 && current.volume < 0.2) {
      scores[VISEMES.sil] = 1;
    }
    
    // Plosive scoring
    Object.entries(VISEME_CATEGORIES).forEach(([viseme, category]) => {
      if (category === 'plosive') {
        if (volumeDelta < 0.01) scores[viseme] -= 0.5;
        if (averaged.volume < 0.2) scores[viseme] += 0.2;
        if (centroidDelta > 1000) scores[viseme] += 0.2;
      }
    });
    
    // Consonant detection based on centroid
    if (current.centroid > 1000 && current.centroid < 8000) {
      if (current.centroid > 7000) {
        scores[VISEMES.DD] += 0.6;
      } else if (current.centroid > 5000) {
        scores[VISEMES.kk] += 0.6;
      } else if (current.centroid > 4000) {
        scores[VISEMES.PP] += 1;
        if (band6 > 0.25 && current.centroid < 6000) {
          scores[VISEMES.DD] += 1.4;
        }
      } else {
        scores[VISEMES.nn] += 0.6;
      }
    }
    
    // Fricative detection
    if (centroidDelta > 1000 && current.centroid > 6000 && 
        averaged.centroid > 5000 && current.bands[6] > 0.4 && averaged.bands[6] > 0.3) {
      scores[VISEMES.FF] = 0.7;
    }
    
    // Vowel detection
    if (averaged.volume > 0.1 && averaged.centroid < 6000 && current.centroid < 6000) {
      const [, avgBand1, avgBand2, avgBand3, avgBand4] = averaged.bands;
      const band1Diff = Math.abs(avgBand1 - avgBand2);
      const bandVariance = Math.max(
        Math.abs(avgBand2 - avgBand3),
        Math.abs(avgBand2 - avgBand4),
        Math.abs(avgBand3 - avgBand4)
      );
      
      if (avgBand3 > 0.1 || avgBand4 > 0.1) {
        // aa - open vowel
        if (avgBand4 > avgBand3) {
          scores[VISEMES.aa] = 0.8;
          if (avgBand3 > avgBand2) scores[VISEMES.aa] += 0.2;
        }
        
        // I - high front vowel
        if (avgBand3 > avgBand2 && avgBand3 > avgBand4) {
          scores[VISEMES.I] = 0.7;
        }
        
        // U - high back vowel
        if (band1Diff < 0.25) {
          scores[VISEMES.U] = 0.7;
        }
        
        // O - mid back vowel
        if (bandVariance < 0.25) {
          scores[VISEMES.O] = 0.9;
        }
        
        // E - mid front vowel
        if (avgBand2 > avgBand3 && avgBand3 > avgBand4) {
          scores[VISEMES.E] = 1;
        }
        
        // Additional vowel refinements
        if (avgBand3 < 0.2 && avgBand4 > 0.3) {
          scores[VISEMES.I] = 0.7;
        }
        if (avgBand3 > 0.25 && avgBand4 > 0.25) {
          scores[VISEMES.O] = 0.7;
        }
        if (avgBand3 < 0.15 && avgBand4 < 0.15) {
          scores[VISEMES.U] = 0.7;
        }
      }
    }
    
    return scores;
  };
  
  const adjustScoresForConsistency = (scores: Record<string, number>): Record<string, number> => {
    const adjusted = { ...scores };
    
    if (currentViseme) {
      const elapsed = performance.now() - visemeStartTime;
      
      for (const viseme in adjusted) {
        if (viseme === currentViseme) {
          let multiplier: number;
          
          if (elapsed <= 100) {
            multiplier = 1.3;
          } else if (elapsed <= maxVisemeDuration) {
            const range = maxVisemeDuration - 100;
            multiplier = 1.3 - 0.3 * ((elapsed - 100) / range);
          } else {
            const excess = elapsed - maxVisemeDuration;
            multiplier = Math.max(0.5, 1 - excess / 1000);
          }
          
          adjusted[viseme] *= multiplier;
        }
      }
    }
    
    return adjusted;
  };
  
  const processAudio = (): void => {
    const features = extractFeatures();
    if (!features) {
      currentViseme = VISEMES.sil;
      return;
    }
    
    const averaged = getAveragedFeatures();
    const volumeDelta = features.volume - averaged.volume;
    const centroidDelta = features.centroid - averaged.centroid;
    
    const scores = computeVisemeScores(features, averaged, volumeDelta, centroidDelta);
    const adjusted = adjustScoresForConsistency(scores);
    
    // Find best viseme
    let bestScore = -Infinity;
    let bestViseme = VISEMES.sil;
    
    for (const viseme in adjusted) {
      if (adjusted[viseme] > bestScore) {
        bestScore = adjusted[viseme];
        bestViseme = viseme;
      }
    }
    
    // Update viseme with timing
    if (bestViseme !== currentViseme) {
      visemeStartTime = performance.now();
      currentViseme = bestViseme;
    }
  };
  
  return {
    get viseme() {
      return currentViseme;
    },
    processAudio,
    connectStream,
    disconnect,
    isConnected,
  };
}
