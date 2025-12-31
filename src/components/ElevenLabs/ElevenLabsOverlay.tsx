/**
 * ElevenLabs Overlay Component
 * Compact overlay version of ElevenLabsAgent for main App integration
 * Provides toggleable visibility and minimal UI footprint
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Callbacks, Mode, Status } from '@elevenlabs/client';
import type { TarotDeck, TarotCard } from '../../types/tarot';
import { createTarotDeck, shuffleDeck as shuffleTarotDeck, drawCards } from '../../utils/tarot';
import { isMajorArcana } from '../../types/tarot';
import { useElevenLabsAudio } from '../../hooks/useElevenLabsAudio';
import { useRevealedCard } from '../../hooks/useRevealedCard';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { useOverlayStore } from './overlayStore';

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
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// ============================================================================
// Component: StatusIndicator
// ============================================================================

interface StatusIndicatorProps {
  status: Status;
  mode: Mode | null;
}

function StatusIndicator({ status, mode }: StatusIndicatorProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isSpeaking = mode === 'speaking';

  let statusColor = 'bg-gray-400';
  let statusText = 'Disconnected';

  if (isConnecting) {
    statusColor = 'bg-yellow-500 animate-pulse';
    statusText = 'Connecting...';
  } else if (isConnected) {
    if (isSpeaking) {
      statusColor = 'bg-purple-500 animate-pulse';
      statusText = 'Speaking';
    } else {
      statusColor = 'bg-green-500';
      statusText = 'Listening';
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
      <span className="text-xs text-gray-600">{statusText}</span>
    </div>
  );
}

// ============================================================================
// Component: ElevenLabsOverlay (Main)
// ============================================================================

export function ElevenLabsOverlay() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  
  // Get user ID and profile from auth context
  const { user, profile } = useAuthContext();
  
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
    normalVolume: 0.3,
    sessionVolume: 0.15, // Volume when session is active
  });

  // Get the addRevealedCard action from the store
  const addRevealedCard = useRevealedCard((state) => state.addRevealedCard);

  // Callbacks for the ElevenLabs SDK
  const handleConnect: NonNullable<Callbacks['onConnect']> = useCallback(() => {
    setError(null);
    setIsSessionConnected(true);
    deckRef.current = null;
    setDeck(null);
    drawnCardsRef.current = [];
  }, []);

  const handleDisconnect: NonNullable<Callbacks['onDisconnect']> = useCallback(() => {
    setIsSessionConnected(false);
    setAgentMode(null);
  }, []);

  const handleError: NonNullable<Callbacks['onError']> = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleModeChange: NonNullable<Callbacks['onModeChange']> = useCallback(
    ({ mode }) => {
      setAgentMode(mode);
    },
    []
  );

  // Client tools configuration
  const clientTools = {
    logMessage: (params: LogMessageParams): string => {
      if (import.meta.env.DEV) {
        console.log('[Agent Log]', params.message);
      }
      return 'Message logged successfully';
    },
    initDeck: (): string => {
      try {
        const newDeck = createTarotDeck();
        deckRef.current = newDeck;
        setDeck(newDeck);
        return 'Deck initialized successfully with 78 cards';
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    shuffleDeck: (): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          return 'Error: No deck has been initialized. Please initialize the deck first.';
        }
        const shuffledDeck = shuffleTarotDeck(currentDeck);
        deckRef.current = shuffledDeck;
        setDeck(shuffledDeck);
        return 'Deck shuffled successfully';
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    drawCard: (params: DrawCardParams): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          return 'Error: No deck has been initialized. Please initialize the deck first.';
        }

        const { numberOfCards } = params;
        
        if (numberOfCards < 1) {
          return 'Error: Number of cards must be at least 1';
        }

        if (numberOfCards > currentDeck.length) {
          return `Error: Cannot draw ${numberOfCards} cards. Only ${currentDeck.length} cards remaining in the deck.`;
        }

        const result = drawCards(currentDeck, numberOfCards);
        deckRef.current = result.remaining;
        setDeck(result.remaining);
        // Store drawn cards for revealCard tool
        drawnCardsRef.current = [...drawnCardsRef.current, ...result.drawn];

        const cardNames = result.drawn.map(card => {
          if (isMajorArcana(card)) {
            return `${card.name} (Major Arcana #${card.number})`;
          }
          return `${card.name} (${card.suit})`;
        }).join(', ');

        return `Successfully drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}: ${cardNames}. ${result.remaining.length} cards remaining.`;
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`;
      }
    },
    revealCard: (params: RevealCardParams): string => {
      try {
        const { cardIndex } = params;
        const drawnCards = drawnCardsRef.current;
        
        if (drawnCards.length === 0) {
          return 'Error: No cards have been drawn yet. Please draw cards first.';
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
      setError('Agent ID is not configured');
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
        connectionType: 'webrtc',
        userId: user?.id,
        dynamicVariables: Object.keys(dynamicVariables).length > 0 ? dynamicVariables : undefined,
      });
      await conversation.setVolume({ volume: 0.8 });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Microphone access required');
      } else {
        setError(errorMessage);
      }
    }
  }, [conversation, user, profile]);

  const handleEndSession = useCallback(async (): Promise<void> => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }, [conversation]);

  // Listen for external expansion requests
  const { expandRequested, clearRequest } = useOverlayStore();

  // Auto-expand on connection
  useEffect(() => {
    if (isSessionConnected) {
      setIsExpanded(true);
    }
  }, [isSessionConnected]);

  // Handle external expansion requests
  useEffect(() => {
    if (expandRequested) {
      setIsExpanded(true);
      clearRequest();
    }
  }, [expandRequested, clearRequest]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-4 z-[200]"
      style={{
        bottom: 'calc(var(--mic-bottom-mobile, 2rem) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Collapsed State - Floating Action Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 lg:w-14 lg:h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-105"
          title="Open Voice Agent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 lg:w-6 lg:h-6"
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
        </button>
      )}

      {/* Expanded State - Overlay Panel */}
      {isExpanded && (
        <div className="w-[calc(100vw-2rem)] max-w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
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
              <span className="font-medium text-sm">Voice Agent</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Status */}
            <div className="mb-4">
              <StatusIndicator status={conversation.status} mode={agentMode} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Speaking Indicator */}
            {isConnected && agentMode === 'speaking' && (
              <div className="mb-4 flex items-center justify-center gap-1">
                <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-8 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
              </div>
            )}

            {/* Connection Button */}
            <div className="flex gap-2">
              {!isConnected ? (
                <button
                  onClick={handleStartSession}
                  disabled={!AGENT_ID || isConnecting}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Start Conversation
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleEndSession}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  End Session
                </button>
              )}
            </div>

            {/* Listening Hint */}
            {isConnected && agentMode === 'listening' && (
              <p className="mt-3 text-xs text-gray-500 text-center">
                Listening... Speak to the agent
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
