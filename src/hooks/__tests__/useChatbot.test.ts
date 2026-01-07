import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChatbot } from '../useChatbot';

// Mock the Audio API
const mockPlay = vi.fn(() => Promise.resolve());
const mockPause = vi.fn();

interface MockAudioElement {
  play: () => Promise<void>;
  pause: () => void;
  src: string;
  crossOrigin: string;
  preload: string;
  onplaying: null;
  onended: null;
  onpause: null;
}

const AudioMock = vi.fn(function (this: MockAudioElement) {
  this.play = mockPlay;
  this.pause = mockPause;
  this.src = '';
  this.crossOrigin = '';
  this.preload = '';
  this.onplaying = null;
  this.onended = null;
  this.onpause = null;
});

vi.stubGlobal('Audio', AudioMock);

// Mock wawa-lipsync
vi.mock('wawa-lipsync', () => ({
  Lipsync: vi.fn(),
  VISEMES: {
    sil: 'sil',
    PP: 'PP',
    FF: 'FF',
    TH: 'TH',
    DD: 'DD',
    kk: 'kk',
    CH: 'CH',
    SS: 'SS',
    nn: 'nn',
    RR: 'RR',
    aa: 'aa',
    E: 'E',
    I: 'I',
    O: 'O',
    U: 'U',
  },
}));

describe('useChatbot Store', () => {
  beforeEach(() => {
    useChatbot.getState().cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const state = useChatbot.getState();
    expect(state.audioPlayer).toBeNull();
    expect(state.isAudioPlaying).toBe(false);
    expect(state.isAgentSpeaking).toBe(false);
  });

  it('should setup audio player', () => {
    useChatbot.getState().setupAudioPlayer();
    const state = useChatbot.getState();

    expect(state.audioPlayer).toBeDefined();
    expect(global.Audio).toHaveBeenCalled();
  });

  it('should prevent multiple audio player initializations', () => {
    useChatbot.getState().setupAudioPlayer();
    const firstPlayer = useChatbot.getState().audioPlayer;

    useChatbot.getState().setupAudioPlayer();
    const secondPlayer = useChatbot.getState().audioPlayer;

    expect(firstPlayer).toBe(secondPlayer);
    expect(global.Audio).toHaveBeenCalledTimes(1);
  });

  it('should set agent speaking state', () => {
    useChatbot.getState().setAgentSpeaking(true);
    expect(useChatbot.getState().isAgentSpeaking).toBe(true);

    useChatbot.getState().setAgentSpeaking(false);
    expect(useChatbot.getState().isAgentSpeaking).toBe(false);
  });

  it('should cleanup resources correctly', () => {
    useChatbot.getState().setupAudioPlayer();

    // Set some state to verify reset
    useChatbot.getState().setAgentSpeaking(true);

    useChatbot.getState().cleanup();

    const state = useChatbot.getState();
    expect(state.audioPlayer).toBeNull();
    expect(state.isAgentSpeaking).toBe(false);
    expect(mockPause).toHaveBeenCalled();
  });
});
