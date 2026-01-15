import { useState, useRef, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Callbacks } from '@elevenlabs/client';
import type { TarotDeck, TarotCard } from '../types/tarot';
import { createTarotDeck, shuffleDeck as shuffleTarotDeck, drawCards } from '../utils/tarot';
import { isMajorArcana } from '../types/tarot';
import { useRevealedCard } from '../hooks/useRevealedCard';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCredits } from '../stores/creditsStore';
import { supabase } from '@/lib/supabase';
import type {
    AgentCallbacks,
    DrawCardParams,
    LogMessageParams,
    RevealCardParams
} from '../types/elevenlabs';

// Debug flag
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEV === 'true';

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
};

export interface UseTarotReaderAgentProps {
    agentId?: string;
    callbacks?: AgentCallbacks;
}

export function useTarotReaderAgent({ agentId, callbacks }: UseTarotReaderAgentProps, textOnly: boolean = false) {
    // Deck state - each session starts with a fresh deck
    const deckRef = useRef<TarotDeck | null>(null);
    const [deck, setDeck] = useState<TarotDeck | null>(null);
    // Store drawn cards for revealCard tool
    const drawnCardsRef = useRef<TarotCard[]>([]);
    // Store current conversation ID for session tracking
    const currentConversationIdRef = useRef<string | null>(null);
    // Track session start time for credit deduction
    const sessionStartTimeRef = useRef<number | null>(null);

    // Get user ID and profile from auth context
    const { user, profile } = useAuthContext();

    // Get the addRevealedCard action from the store
    const addRevealedCard = useRevealedCard((state) => state.addRevealedCard);

    // Keep ref in sync with state
    useEffect(() => {
        deckRef.current = deck;
    }, [deck]);

    // ============================================================================
    // Client Tools
    // ============================================================================
    const clientTools = {
        logMessage: (params: LogMessageParams): string => {
            if (DEBUG) {
                console.log("[Agent Log]", params.message);
            }
            callbacks?.onToolLog?.(`[Log] ${params.message}`);
            return 'Message logged successfully';
        },
        initDeck: (): string => {
            try {
                const newDeck = createTarotDeck();
                deckRef.current = newDeck;
                setDeck(newDeck);
                callbacks?.onToolLog?.('🎴 Tarot deck initialized with 78 cards (22 Major Arcana + 56 Minor Arcana)');
                return 'Deck initialized successfully with 78 cards';
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacks?.onToolLog?.(`❌ Failed to initialize deck: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        shuffleDeck: (): string => {
            try {
                const currentDeck = deckRef.current;
                if (!currentDeck) {
                    const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }
                const shuffledDeck = shuffleTarotDeck(currentDeck);
                deckRef.current = shuffledDeck;
                setDeck(shuffledDeck);
                callbacks?.onToolLog?.('🔀 Deck shuffled successfully');
                return 'Deck shuffled successfully';
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacks?.onToolLog?.(`❌ Failed to shuffle deck: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        drawCard: (params: DrawCardParams): string => {
            try {
                const currentDeck = deckRef.current;
                if (!currentDeck) {
                    const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                const { numberOfCards } = params;

                if (numberOfCards < 1) {
                    const errorMessage = 'Number of cards must be at least 1';
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                if (numberOfCards > currentDeck.length) {
                    const errorMessage = `Cannot draw ${numberOfCards} cards. Only ${currentDeck.length} cards remaining in the deck.`;
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                const result = drawCards(currentDeck, numberOfCards);
                deckRef.current = result.remaining;
                setDeck(result.remaining);
                // Store drawn cards for revealCard tool
                drawnCardsRef.current = [...drawnCardsRef.current, ...result.drawn];

                // Format the drawn cards for display
                const cardsList = result.drawn
                    .map((card, index) => {
                        const cardInfo = isMajorArcana(card)
                            ? `${card.name} (Major Arcana #${card.number})`
                            : `${card.name} (${card.suit})`;
                        return `${index + 1}. ${cardInfo}`;
                    })
                    .join('\n');

                const message = `✨ Drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}:\n${cardsList}\n\nRemaining cards: ${result.remaining.length}`;
                callbacks?.onToolLog?.(message);

                return `Successfully drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}. Cards drawn: ${result.drawn.map(c => c.name).join(', ')}. ${result.remaining.length} cards remaining in deck.`;
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacks?.onToolLog?.(`❌ Failed to draw cards: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        revealCard: (params: RevealCardParams): string => {
            try {
                const { cardIndex } = params;
                const drawnCards = drawnCardsRef.current;

                if (drawnCards.length === 0) {
                    const errorMessage = 'No cards have been drawn yet. Please draw cards first.';
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                if (cardIndex < 0 || cardIndex >= drawnCards.length) {
                    const errorMessage = `Invalid card index. Please provide an index between 0 and ${drawnCards.length - 1}.`;
                    callbacks?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                const card = drawnCards[cardIndex];

                // Add the card to the revealed cards store to display the overlay
                addRevealedCard(card);

                const cardInfo = isMajorArcana(card)
                    ? `${card.name} (Major Arcana #${card.number})`
                    : `${card.name} (${card.suit})`;

                callbacks?.onToolLog?.(`🔮 Revealing card: ${cardInfo}`);
                return `Successfully revealed card: ${cardInfo}`;
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacks?.onToolLog?.(`❌ Failed to reveal card: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
    };

    // ============================================================================
    // SDK Callbacks
    // ============================================================================

    const handleConnect: NonNullable<Callbacks['onConnect']> = useCallback(() => {
        if (DEBUG) {
            console.log('[useTarotReaderAgent][onConnect]');
        }
        // Reset deck for new session - each session starts fresh
        deckRef.current = null;
        setDeck(null);
        drawnCardsRef.current = [];
        // Record session start time for credit calculation
        sessionStartTimeRef.current = Date.now();
        // Start the session timer in the store (for UI chronometer)
        useCredits.getState().startSessionTimer();

        callbacks?.onConnect?.();
    }, [callbacks]);

    const saveSession = useCallback(async (conversationId: string) => {
        try {
            if (DEBUG) console.log('[useTarotReaderAgent] Saving session...', conversationId);
            const { error } = await supabase.functions.invoke('save-session', {
                body: { conversation_id: conversationId },
            });
            if (error) throw error;
            if (DEBUG) console.log('[useTarotReaderAgent] Session saved successfully');
        } catch (error) {
            console.error('[useTarotReaderAgent] Failed to save session:', error);
        }
    }, []);

    const handleDisconnect: NonNullable<Callbacks['onDisconnect']> = useCallback(() => {
        if (DEBUG) {
            console.log('[useTarotReaderAgent][onDisconnect]');
        }

        // Calculate session duration and deduct credits
        if (sessionStartTimeRef.current && user?.id) {
            const durationSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
            if (DEBUG) {
                console.log(`[useTarotReaderAgent] Session duration: ${durationSeconds}s`);
            }
            // Deduct credits asynchronously (don't block disconnect)
            useCredits.getState().deductCreditsForSession(
                user.id,
                durationSeconds,
                currentConversationIdRef.current || undefined
            ).then(result => {
                if (DEBUG) {
                    console.log('[useTarotReaderAgent] Credit deduction result:', result);
                }
            });
            sessionStartTimeRef.current = null;
        }

        // End the session timer in the store (stops UI chronometer)
        useCredits.getState().endSessionTimer();

        // Trigger save session if we have an ID
        if (currentConversationIdRef.current) {
            saveSession(currentConversationIdRef.current);
            currentConversationIdRef.current = null;
        }

        callbacks?.onDisconnect?.();
    }, [callbacks, saveSession, user]);

    const handleMessage: NonNullable<Callbacks['onMessage']> = useCallback(
        (payload) => {
            if (DEBUG) {
                console.log('[useTarotReaderAgent][onMessage]', payload);
            }
            callbacks?.onMessage?.(payload);
        },
        [callbacks]
    );

    const handleError: NonNullable<Callbacks['onError']> = useCallback((message: string) => {
        if (DEBUG) {
            console.error('[useTarotReaderAgent][onError]', message);
        }
        callbacks?.onError?.(message);
    }, [callbacks]);

    const handleStatusChange: NonNullable<Callbacks['onStatusChange']> = useCallback(
        (payload) => {
            if (DEBUG) {
                console.log('[useTarotReaderAgent][onStatusChange]', payload.status);
            }
            callbacks?.onStatusChange?.(payload);
        },
        [callbacks]
    );

    const handleModeChange: NonNullable<Callbacks['onModeChange']> = useCallback(
        (payload) => {
            if (DEBUG) {
                console.log('[useTarotReaderAgent][onModeChange]', payload.mode);
            }
            callbacks?.onModeChange?.(payload);
        },
        [callbacks]
    );

    const handleAudio: NonNullable<Callbacks['onAudio']> = useCallback((audioData: string) => {
        if (DEBUG) {
            console.log('[useTarotReaderAgent][onAudio]', audioData.length);
        }
        // Audio is handled internally by the hook for playback
    }, []);

    const handleCanSendFeedbackChange: NonNullable<Callbacks['onCanSendFeedbackChange']> = useCallback(
        ({ canSendFeedback }) => {
            if (DEBUG) {
                console.log('[useTarotReaderAgent][onCanSendFeedbackChange]', canSendFeedback);
            }
        },
        []
    );

    const handleDebug: NonNullable<Callbacks['onDebug']> = useCallback((debugInfo: unknown) => {
        if (DEBUG) {
            console.log('[useTarotReaderAgent][onDebug]', debugInfo);
        }
    }, []);

    const handleUnhandledClientToolCall: NonNullable<Callbacks['onUnhandledClientToolCall']> = useCallback(
        (toolCall) => {
            const name = (toolCall as any).toolName || (toolCall as any).name || 'Unknown Tool';
            const args = (toolCall as any).toolArgs || (toolCall as any).arguments || {};
            const message = `[useTarotReaderAgent][onUnhandledClientToolCall] Received unhandled tool call: ${name}`;
            console.warn(message, args);
            callbacks?.onToolLog?.(`⚠️ ${message}`);
        },
        [callbacks]
    );

    const handleVadScore: NonNullable<Callbacks['onVadScore']> = useCallback(({ vadScore }: { vadScore: number }) => {
        if (DEBUG && vadScore > 0.8) {
            console.log('[useTarotReaderAgent][onVadScore]', vadScore);
        }
        callbacks?.onVadScore?.(vadScore);
    }, [callbacks]);

    const handleAgentChatResponsePart: NonNullable<Callbacks['onAgentChatResponsePart']> = useCallback(
        (responsePart) => {
            if (!responsePart) return;
            if (DEBUG) {
                console.log('[useTarotReaderAgent][onAgentChatResponsePart]', responsePart);
            }
            callbacks?.onAgentChatResponsePart?.(responsePart);
        },
        [callbacks]
    );

    // ============================================================================
    // Conversation Hook
    // ============================================================================

    const conversation = useConversation({
        clientTools,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onMessage: handleMessage,
        onError: handleError,
        onStatusChange: handleStatusChange,
        onModeChange: handleModeChange,
        onAudio: handleAudio,
        onCanSendFeedbackChange: handleCanSendFeedbackChange,
        onDebug: handleDebug,
        onUnhandledClientToolCall: handleUnhandledClientToolCall,
        onVadScore: handleVadScore,
        onAgentChatResponsePart: handleAgentChatResponsePart,
        textOnly,
    });

    // ============================================================================
    // Helper Functions
    // ============================================================================

    const startSession = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!agentId) {
            const msg = 'Agent ID is not configured. Set VITE_ELEVENLABS_AGENT_ID in your environment.';
            callbacks?.onError?.(msg);
            return { success: false, error: msg };
        }

        // Check if user has enough credits
        if (!useCredits.getState().canStartSession()) {
            const msg = 'Insufficient credits to start a session.';
            callbacks?.onError?.(msg);
            return { success: false, error: 'INSUFFICIENT_CREDITS' };
        }

        try {
            if (!textOnly) {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            const dynamicVariables: Record<string, string> = {};
            if (profile?.display_name) {
                dynamicVariables.user_name = profile.display_name;
            } else {
                dynamicVariables.user_name = 'Unknown User';
            }

            const conversationId = await conversation.startSession({
                agentId,
                connectionType: 'webrtc',
                userId: user?.id,
                dynamicVariables: Object.keys(dynamicVariables).length > 0 ? dynamicVariables : undefined,
            });

            currentConversationIdRef.current = conversationId;

            await conversation.setVolume({ volume: 0.8 });

            return { success: true };

        } catch (err) {
            const errorMessage = getErrorMessage(err);
            // Provide user-friendly error for permission denial
            if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
                callbacks?.onError?.('Microphone access is required for voice conversations. Please allow microphone access and try again.');
            } else {
                callbacks?.onError?.(errorMessage);
            }
            return { success: false, error: errorMessage };
        }
    }, [agentId, conversation, user, profile, callbacks, textOnly]);

    return {
        conversation,
        deck,
        startSession,
        endSession: conversation.endSession,
        setVolume: conversation.setVolume,
    };
}
