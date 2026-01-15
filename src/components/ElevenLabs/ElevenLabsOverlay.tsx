/**
 * ElevenLabs Overlay Component
 * Compact overlay version of ElevenLabsAgent for main App integration
 * Provides toggleable visibility and minimal UI footprint
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Mode } from "@elevenlabs/client";
import { useTarotReaderAgent } from "@/hooks/useTarotReaderAgent";
import { useElevenLabsAudio } from "@/hooks/useElevenLabsAudio";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useChatbot } from "@/hooks/useChatbot";
import { useConversationReplay } from "@/hooks/useConversationReplay";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useStreamingCaptions } from "@/hooks/useStreamingCaptions";
import { InsufficientCreditsModal } from "@/components/Credits";
import type { ConversationTranscriptItem } from "../../types/elevenlabs";


// ============================================================================
// Constants
// ============================================================================

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

// ============================================================================
// Utility Functions
// ============================================================================

const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEV === 'true';

// ============================================================================
// Component: ElevenLabsOverlay (Main)
// ============================================================================

export function ElevenLabsOverlay() {
  // Debug mount
  useEffect(() => {
    if (DEBUG) {
      console.log('ElevenLabsOverlay mounted. DEBUG is enabled.');
    }
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Use the streaming captions hook for ID-based tracking
  const { captions: streamedCaptions, handleChatResponsePart, clearCaptions } = useStreamingCaptions();

  // Text from the agent (Replay)
  const [replayCaptions, setReplayCaptions] = useState<string>("");

  // Determine which source to use
  const targetCaptions = isSessionConnected ? streamedCaptions : replayCaptions;

  // Smooth typewriter effect for display (70ms per char for better audio sync)
  const displayedCaptions = useTypewriter(targetCaptions, 70);


  // Get user ID and profile from auth context
  // Note: user/profile logic is now inside the hook, but we still need profile for other overlay logic?
  // Actually the hook takes care of user/profile if we pass it, OR the hook gets it from context itself.
  // Looking at the hook implementation: `useTarotReaderAgent` gets user/profile from context internally.
  // So we don't strictly need them here unless we use them for other UI logic.
  // The original overlay used profile for nothing else?
  // Wait, `handleStartSession` in original used profile for dynamic variables.
  // The new hook `startSession` handles that internally.
  // So we can remove useAuthContext usage here if not used.

  // Get the requestShow function to trigger the help tooltip
  const requestShowHelp = useOnboardingStore((state) => state.requestShow);

  // Integrate with lipsync audio system
  useElevenLabsAudio({
    isConnected: isSessionConnected,
    mode: agentMode,
  });

  // Background music - plays immediately on page load, lowers volume when session is active
  useBackgroundMusic({
    isActive: true, // Always active - plays immediately
    hasActiveSession: isSessionConnected, // Lower volume when session is active
    normalVolume: 0.05,
    sessionVolume: 0.02, // Volume when session is active
  });

  // Get active replay state
  const activeReplayId = useChatbot((state) => state.activeReplayId);
  const setActiveReplayId = useChatbot((state) => state.setActiveReplayId);

  // Initialize replay hook (will be no-op if no activeReplayId)
  const {
    isPlaying: isReplayPlaying,
    currentTime: replayTime,
    duration: replayDuration,
    handlePlayPause: toggleReplay,
    handleStop: stopReplay,

    audioUrl: replayAudioUrl,
    conversation: replayConversation
  } = useConversationReplay(activeReplayId);

  // Sync replay captions
  useEffect(() => {
    if (!activeReplayId || !replayConversation || !replayConversation.transcript) {
      setReplayCaptions("");
      return;
    }

    // Find the segment that matches current time
    const transcript: ConversationTranscriptItem[] = replayConversation.transcript;
    // We want the last message that started before current time
    // But only if it's an AGENT message
    let activeMessage = "";

    for (const msg of transcript) {
      if (typeof msg.time_in_call_secs !== 'number') continue;

      if (replayTime >= msg.time_in_call_secs) {
        if (msg.role === 'agent') {
          activeMessage = msg.content || "";
        } else {
          // If user speaks, clear agent caption? Or keep last?
          // Usually clear.
          activeMessage = "";
        }
      } else {
        // Future message, stop searching
        break;
      }
    }
    setReplayCaptions(activeMessage);

  }, [activeReplayId, replayConversation, replayTime]);

  // Hook for stopping replay when session starts
  useEffect(() => {
    if (isSessionConnected && activeReplayId) {
      // Stop replay if user starts a new session
      stopReplay();
      setActiveReplayId(null);
    }
  }, [isSessionConnected, activeReplayId, stopReplay, setActiveReplayId]);


  // Callbacks for the ElevenLabs SDK via our custom hook
  const callbacks = useMemo(() => ({
    onConnect: () => {
      setError(null);
      setIsSessionConnected(true);
      clearCaptions(); // Reset captions on new session
    },

    onDisconnect: () => {
      setIsSessionConnected(false);
      setAgentMode(null);
      clearCaptions(); // Clear captions on disconnect
    },

    onError: (message: string) => {
      setError(message);
    },

    onModeChange: ({ mode }: { mode: Mode }) => {
      setAgentMode(mode);
    },

    // Use the hook's handler for streaming captions
    onAgentChatResponsePart: handleChatResponsePart,
  }), [clearCaptions, handleChatResponsePart]);

  const { conversation, startSession, endSession } = useTarotReaderAgent({
    agentId: AGENT_ID,
    callbacks
  });

  const handleStartSession = useCallback(async (): Promise<void> => {
    // Hook handles permissions and config
    const result = await startSession();
    // Check if blocked due to insufficient credits
    if (!result.success && result.error === 'INSUFFICIENT_CREDITS') {
      setShowCreditsModal(true);
    }
  }, [startSession]);

  const handleEndSession = useCallback(async (): Promise<void> => {
    try {
      await endSession();
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  }, [endSession]);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const isSpeaking = agentMode === "speaking";

  // Determine ring color and animation based on state
  const getRingClasses = () => {
    if (error) {
      return "ring-red-500 ring-8 animate-pulse";
    }
    if (isConnecting) {
      return "ring-yellow-500 ring-8 animate-pulse";
    }
    if (isConnected) {
      if (isSpeaking) {
        return "ring-purple-500 ring-8 animate-pulse";
      }
      return "ring-green-500 ring-8";
    }
    return "ring-transparent ring-0";
  };

  const getButtonTitle = () => {
    if (error) return "Error: " + error;
    if (isConnecting) return "Connecting...";
    if (isConnected) {
      if (isSpeaking) return "Agent is speaking";
      return "Listening - Click to end session";
    }
    return "Click to start conversation";
  };

  const handleButtonClick = () => {
    if (activeReplayId) {
      toggleReplay();
      return;
    }

    if (isConnected) {
      handleEndSession();
    } else {
      handleStartSession();
    }
  };

  // Override button title for replay mode
  const buttonTitle = activeReplayId
    ? (isReplayPlaying ? "Pause Replay" : "Play Replay")
    : getButtonTitle();

  return (
    <>
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[200]"
        style={{
          bottom:
            "calc(var(--mic-bottom-mobile, 2rem) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Floating Action Button with Glowing Ring */}
        <div className="relative mb-[10px]">
          {/* Help Button - positioned at bottom right corner of mic button */}
          <button
            type="button"
            onClick={requestShowHelp}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg shadow-yellow-900/40 flex items-center justify-center transition-all hover:scale-110 z-10 border-2 border-white"
            title="Show help"
          >
            ?
          </button>
          {/* Outer Glowing Ring - More visible */}
          <div
            className={`absolute -inset-4 rounded-full transition-all duration-300 ${error
              ? "bg-red-500/30 animate-pulse"
              : isConnecting
                ? "bg-yellow-500/30 animate-pulse"
                : isConnected
                  ? isSpeaking
                    ? "bg-purple-500/30 animate-pulse"
                    : "bg-green-500/30"
                  : "bg-transparent"
              }`}
            style={{
              boxShadow: error
                ? "0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)"
                : isConnecting
                  ? "0 0 30px rgba(234, 179, 8, 0.8), 0 0 60px rgba(234, 179, 8, 0.4)"
                  : isConnected
                    ? isSpeaking
                      ? "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)"
                      : "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)"
                    : "none",
            }}
          />

          {/* Captions Overlay */}
          <div
            className={`absolute bottom-24 left-1/2 -translate-x-1/2 w-[350px] flex items-end justify-center pointer-events-none z-20 transition-opacity duration-500 ${displayedCaptions ? 'opacity-100' : 'opacity-0'}`}
          >
            <span className="flex flex-col-reverse w-full text-white text-xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/40 backdrop-blur-sm px-4 py-2 rounded-2xl h-[6.5rem] overflow-hidden leading-relaxed tracking-wide border border-white/10">
              <span>{displayedCaptions}</span>
            </span>
          </div>

          {/* Inner Glowing Ring */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${getRingClasses()}`}
            style={{
              boxShadow: error
                ? "0 0 20px rgba(239, 68, 68, 0.9), 0 0 40px rgba(239, 68, 68, 0.5)"
                : isConnecting
                  ? "0 0 20px rgba(234, 179, 8, 0.9), 0 0 40px rgba(234, 179, 8, 0.5)"
                  : isConnected
                    ? isSpeaking
                      ? "0 0 20px rgba(168, 85, 247, 0.9), 0 0 40px rgba(168, 85, 247, 0.5)"
                      : "0 0 20px rgba(34, 197, 94, 0.9), 0 0 40px rgba(34, 197, 94, 0.5)"
                    : "none",
            }}
          />

          {/* Replay Progress Ring */}
          {activeReplayId && (
            <div className="absolute -inset-2 z-0 pointer-events-none">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="4"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="#0aadffff" // Pink-500
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={
                    2 * Math.PI * 46 * (1 - (replayTime / (replayDuration || 1)))
                  }
                  className="transition-all duration-200 ease-linear"
                />
              </svg>
            </div>
          )}




          {/* Button */}
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={(isConnecting && !AGENT_ID) || (!!activeReplayId && !replayAudioUrl)}
            className={`relative w-20 h-20 lg:w-20 lg:h-20 ${activeReplayId
              ? "bg-purple-600 hover:bg-purple-700"
              : isConnected
                ? "bg-red-600 hover:bg-red-700"
                : "bg-purple-600 hover:bg-purple-700"
              } text-white rounded-full border-2 border-white shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isConnecting ? "animate-pulse" : ""
              }`}
            style={{
              boxShadow: isConnected
                ? isSpeaking
                  ? "0 0 15px rgba(168, 85, 247, 0.6), 0 4px 20px rgba(0, 0, 0, 0.3)"
                  : "0 0 15px rgba(34, 197, 94, 0.6), 0 4px 20px rgba(0, 0, 0, 0.3)"
                : undefined,
            }}
            title={buttonTitle}
          >
            {isConnecting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : activeReplayId ? (
              isReplayPlaying ? (
                // Pause Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // Play Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )
            ) : isConnected ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 lg:w-8 lg:h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8l-8 8m0-8l8 8"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 lg:w-8 lg:h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </>
  );
}
