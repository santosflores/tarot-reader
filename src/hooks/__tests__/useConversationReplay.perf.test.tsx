
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useConversationReplay } from "../useConversationReplay";
import * as useChatbotModule from "@/hooks/useChatbot";
import * as elevenlabsApi from "@/utils/elevenlabsApi";

// Mock the dependencies
vi.mock("@/hooks/useChatbot", () => ({
  useChatbot: vi.fn(),
}));

vi.mock("@/utils/elevenlabsApi", () => ({
  fetchConversationDetails: vi.fn(),
  fetchConversationAudio: vi.fn(),
  createAudioUrlFromBlob: vi.fn(),
  revokeAudioUrl: vi.fn(),
}));

describe("useConversationReplay Performance", () => {
  const mockSetAgentSpeaking = vi.fn();
  const mockSetActiveReplayId = vi.fn();
  const mockSetupAudioPlayer = vi.fn();
  const mockPlayAudio = vi.fn();

  let mockAudioPlayer: {
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    currentTime: number;
    readonly duration: number;
    src: string;
    trigger: (event: string) => void;
  };
  let durationAccessCount = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    durationAccessCount = 0;

    // Create a mock audio player with event listener support and duration spy
    const listeners: Record<string, (() => void)[]> = {};

    mockAudioPlayer = {
      addEventListener: vi.fn((event, callback) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
      }),
      removeEventListener: vi.fn((event, callback) => {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }),
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 10,
      // We define duration with a getter to spy on access
      get duration() {
        durationAccessCount++;
        return 100;
      },
      src: "",
      trigger: (event: string) => {
        if (listeners[event]) {
          listeners[event].forEach(cb => cb());
        }
      }
    };

    (useChatbotModule.useChatbot as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setupAudioPlayer: mockSetupAudioPlayer,
      playAudio: mockPlayAudio,
      audioPlayer: mockAudioPlayer,
      isAudioPlaying: false,
      setAgentSpeaking: mockSetAgentSpeaking,
      activeReplayId: "test-conv-id", // Active replay matches conversationId
      setActiveReplayId: mockSetActiveReplayId,
    });

    (elevenlabsApi.fetchConversationDetails as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      has_audio: true,
      has_response_audio: true,
      transcript: [
        { role: "agent", time_in_call_secs: 5 },
        { role: "user", time_in_call_secs: 15 }
      ]
    });

    (elevenlabsApi.fetchConversationAudio as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(new Blob([]));
    (elevenlabsApi.createAudioUrlFromBlob as unknown as ReturnType<typeof vi.fn>).mockReturnValue("blob:url");
  });

  it("should NOT access duration property on timeupdate (Optimized Behavior)", async () => {
    const { result } = renderHook(() => useConversationReplay("test-conv-id"));

    // Wait for data loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.audioUrl).toBe("blob:url"));

    // Reset count before triggering updates, as initial render or other effects might access it
    // Wait for the effect to attach listeners
    expect(mockAudioPlayer.addEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));

    const initialCount = durationAccessCount;

    // Trigger timeupdate
    act(() => {
      mockAudioPlayer.trigger("timeupdate");
    });

    // Optimized behavior: Expect duration NOT to be accessed
    expect(durationAccessCount).toBe(initialCount);
    console.log(`Duration accessed ${durationAccessCount - initialCount} times during timeupdate`);
  });

  it("should access duration property on durationchange", async () => {
    const { result } = renderHook(() => useConversationReplay("test-conv-id"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = durationAccessCount;

    // Trigger durationchange
    act(() => {
      mockAudioPlayer.trigger("durationchange");
    });

    expect(durationAccessCount).toBeGreaterThan(initialCount);
  });
});
