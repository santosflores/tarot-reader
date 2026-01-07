/**
 * ElevenLabs Overlay Component
 * Compact overlay version of ElevenLabsAgent for main App integration
 * Provides toggleable visibility and minimal UI footprint
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import type { Callbacks, Mode } from "@elevenlabs/client";
import type { TarotDeck, TarotCard } from "@/types/tarot";
import {
  createTarotDeck,
  shuffleDeck as shuffleTarotDeck,
  drawCards,
} from "@/utils/tarot";
import { isMajorArcana } from "@/types/tarot";
import { useElevenLabsAudio } from "@/hooks/useElevenLabsAudio";
import { useRevealedCard } from "@/hooks/useRevealedCard";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useChatbot } from "@/hooks/useChatbot";
import { useConversationReplay } from "@/hooks/useConversationReplay";
import { ReplayTimeline } from "../UI/components/ReplayTimeline";

// ============================================================================
// Types
// ============================================================================

interface DrawCardParams {
  numberOfCards: number;
}

interface LogMessageParams {
  message: string;
}

interface RevealCardParams {
  cardIndex: number;
}

// ============================================================================
// Constants
// ============================================================================

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

// ============================================================================
// Utility Functions
// ============================================================================

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
};

// ============================================================================
// Component: ElevenLabsOverlay (Main)
// ============================================================================

export function ElevenLabsOverlay() {
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [isSessionConnected, setIsSessionConnected] = useState(false);

  // Get user ID and profile from auth context
  const { user, profile } = useAuthContext();

  // Get the requestShow function to trigger the help tooltip
  const requestShowHelp = useOnboardingStore((state) => state.requestShow);

  // Deck state - each session starts with a fresh deck
  const deckRef = useRef<TarotDeck | null>(null);
  const [, setDeck] = useState<TarotDeck | null>(null);
  // Store drawn cards for revealCard tool
  const drawnCardsRef = useRef<TarotCard[]>([]);

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

  // Get the addRevealedCard action from the store
  const addRevealedCard = useRevealedCard((state) => state.addRevealedCard);

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
    seek: seekReplay,
    audioUrl: replayAudioUrl
  } = useConversationReplay(activeReplayId);

  // Hook for stopping replay when session starts
  useEffect(() => {
    if (isSessionConnected && activeReplayId) {
      // Stop replay if user starts a new session
      stopReplay();
      setActiveReplayId(null);
    }
  }, [isSessionConnected, activeReplayId, stopReplay, setActiveReplayId]);

  // Callbacks for the ElevenLabs SDK
  const handleConnect: NonNullable<Callbacks["onConnect"]> = useCallback(() => {
    setError(null);
    setIsSessionConnected(true);
    deckRef.current = null;
    setDeck(null);
    drawnCardsRef.current = [];
  }, []);

  const handleDisconnect: NonNullable<Callbacks["onDisconnect"]> =
    useCallback(() => {
      setIsSessionConnected(false);
      setAgentMode(null);
    }, []);

  const handleError: NonNullable<Callbacks["onError"]> = useCallback(
    (message: string) => {
      setError(message);
    },
    []
  );

  const handleModeChange: NonNullable<Callbacks["onModeChange"]> = useCallback(
    ({ mode }) => {
      setAgentMode(mode);
    },
    []
  );

  // Client tools configuration
  const clientTools = {
    logMessage: (params: LogMessageParams): string => {
      if (import.meta.env.DEV) {
        console.log("[Agent Log]", params.message);
      }
      return "Message logged successfully";
    },
    initDeck: (): string => {
      try {
        const newDeck = createTarotDeck();
        deckRef.current = newDeck;
        setDeck(newDeck);
        return "Deck initialized successfully with 78 cards";
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    shuffleDeck: (): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          return "Error: No deck has been initialized. Please initialize the deck first.";
        }
        const shuffledDeck = shuffleTarotDeck(currentDeck);
        deckRef.current = shuffledDeck;
        setDeck(shuffledDeck);
        return "Deck shuffled successfully";
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    drawCard: (params: DrawCardParams): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          return "Error: No deck has been initialized. Please initialize the deck first.";
        }

        const { numberOfCards } = params;

        if (numberOfCards < 1) {
          return "Error: Number of cards must be at least 1";
        }

        if (numberOfCards > currentDeck.length) {
          return `Error: Cannot draw ${numberOfCards} cards. Only ${currentDeck.length} cards remaining in the deck.`;
        }

        const result = drawCards(currentDeck, numberOfCards);
        deckRef.current = result.remaining;
        setDeck(result.remaining);
        // Store drawn cards for revealCard tool
        drawnCardsRef.current = [...drawnCardsRef.current, ...result.drawn];

        const cardNames = result.drawn
          .map((card) => {
            if (isMajorArcana(card)) {
              return `${card.name} (Major Arcana #${card.number})`;
            }
            return `${card.name} (${card.suit})`;
          })
          .join(", ");

        return `Successfully drew ${numberOfCards} card${numberOfCards === 1 ? "" : "s"}: ${cardNames}. ${result.remaining.length} cards remaining.`;
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    revealCard: (params: RevealCardParams): string => {
      try {
        const { cardIndex } = params;
        const drawnCards = drawnCardsRef.current;

        if (drawnCards.length === 0) {
          return "Error: No cards have been drawn yet. Please draw cards first.";
        }

        if (cardIndex < 0 || cardIndex >= drawnCards.length) {
          return `Error: Invalid card index. Please provide an index between 0 and ${drawnCards.length - 1}.`;
        }

        const card = drawnCards[cardIndex];

        // Add the card to the revealed cards store to display the overlay
        addRevealedCard(card);

        const cardInfo = isMajorArcana(card)
          ? `${card.name} (Major Arcana #${card.number})`
          : `${card.name} (${card.suit})`;

        return `Successfully revealed card: ${cardInfo}`;
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
  };

  const conversation = useConversation({
    clientTools,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    onModeChange: handleModeChange,
  });

  const handleStartSession = useCallback(async (): Promise<void> => {
    if (!AGENT_ID) {
      setError("Agent ID is not configured");
      return;
    }

    try {
      setError(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prepare dynamic variables
      const dynamicVariables: Record<string, string> = {};
      if (profile?.display_name) {
        dynamicVariables.user_name = profile.display_name;
      }

      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        userId: user?.id,
        dynamicVariables:
          Object.keys(dynamicVariables).length > 0
            ? dynamicVariables
            : undefined,
      });
      await conversation.setVolume({ volume: 0.8 });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("NotAllowedError")
      ) {
        setError("Microphone access required");
      } else {
        setError(errorMessage);
      }
    }
  }, [conversation, user, profile]);

  const handleEndSession = useCallback(async (): Promise<void> => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  }, [conversation]);

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
      {/* Timeline Overlay for Replay - Positioned relative to viewport */}
      {activeReplayId && (
        <ReplayTimeline
          currentTime={replayTime}
          duration={replayDuration}
          onSeek={seekReplay}
        />
      )}

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



          {/* Button */}
          <button
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
    </>
  );
}
