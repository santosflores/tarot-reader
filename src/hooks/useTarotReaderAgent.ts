import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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

    // Get credits actions
    const { canStartSession, startSessionTimer } = useCredits();

    // Store callbacks in a ref to avoid re-creating clientTools when callbacks change
    const callbacksRef = useRef(callbacks);
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    // Get store actions
    const startSessionTimer = useCredits((state) => state.startSessionTimer);
    const endSessionTimer = useCredits((state) => state.endSessionTimer);
    const deductCreditsForSession = useCredits((state) => state.deductCreditsForSession);
    const canStartSession = useCredits((state) => state.canStartSession);

    // Keep ref in sync with state
    useEffect(() => {
        deckRef.current = deck;
    }, [deck]);

    // ============================================================================
    // Client Tools
    // ============================================================================
    const clientTools = useMemo(() => ({
        logMessage: (params: LogMessageParams): string => {
            if (DEBUG) {
                console.log("[Agent Log]", params.message);
            }
            callbacksRef.current?.onToolLog?.(`[Log] ${params.message}`);
            return 'Message logged successfully';
        },
        initDeck: (): string => {
            try {
                const newDeck = createTarotDeck();
                deckRef.current = newDeck;
                setDeck(newDeck);
                callbacksRef.current?.onToolLog?.('🎴 Tarot deck initialized with 78 cards (22 Major Arcana + 56 Minor Arcana)');
                return 'Deck initialized successfully with 78 cards';
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacksRef.current?.onToolLog?.(`❌ Failed to initialize deck: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        shuffleDeck: (): string => {
            try {
                const currentDeck = deckRef.current;
                if (!currentDeck) {
                    const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }
                const shuffledDeck = shuffleTarotDeck(currentDeck);
                deckRef.current = shuffledDeck;
                setDeck(shuffledDeck);
                callbacksRef.current?.onToolLog?.('🔀 Deck shuffled successfully');
                return 'Deck shuffled successfully';
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacksRef.current?.onToolLog?.(`❌ Failed to shuffle deck: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        drawCard: (params: DrawCardParams): string => {
            try {
                const currentDeck = deckRef.current;
                if (!currentDeck) {
                    const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                const { numberOfCards } = params;

                if (numberOfCards < 1) {
                    const errorMessage = 'Number of cards must be at least 1';
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                if (numberOfCards > currentDeck.length) {
                    const errorMessage = `Cannot draw ${numberOfCards} cards. Only ${currentDeck.length} cards remaining in the deck.`;
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
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
                callbacksRef.current?.onToolLog?.(message);

                return `Successfully drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}. Cards drawn: ${result.drawn.map(c => c.name).join(', ')}. ${result.remaining.length} cards remaining in deck.`;
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacksRef.current?.onToolLog?.(`❌ Failed to draw cards: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
        revealCard: (params: RevealCardParams): string => {
            try {
                const { cardIndex } = params;
                const drawnCards = drawnCardsRef.current;

                if (drawnCards.length === 0) {
                    const errorMessage = 'No cards have been drawn yet. Please draw cards first.';
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                if (cardIndex < 0 || cardIndex >= drawnCards.length) {
                    const errorMessage = `Invalid card index. Please provide an index between 0 and ${drawnCards.length - 1}.`;
                    callbacksRef.current?.onToolLog?.(`❌ ${errorMessage}`);
                    return `Error: ${errorMessage}`;
                }

                const card = drawnCards[cardIndex];

                // Add the card to the revealed cards store to display the overlay
                addRevealedCard(card);

                const cardInfo = isMajorArcana(card)
                    ? `${card.name} (Major Arcana #${card.number})`
                    : `${card.name} (${card.suit})`;

                callbacksRef.current?.onToolLog?.(`🔮 Revealing card: ${cardInfo}`);
                return `Successfully revealed card: ${cardInfo}`;
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                callbacksRef.current?.onToolLog?.(`❌ Failed to reveal card: ${errorMessage}`);
                return `Error: ${errorMessage}`;
            }
        },
    }), [addRevealedCard]);

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
        if (DEBUG) console.log('[useTarotReaderAgent] Starting session timer (onConnect)');
        startSessionTimer();

        callbacks?.onConnect?.();
    }, [callbacks, startSessionTimer]);

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
                console.log(`[useTarotReaderAgent] Deducting credits for user: ${user.id}`);
            }
            // Deduct credits asynchronously (don't block disconnect)
            deductCreditsForSession(
                user.id,
                durationSeconds,
                currentConversationIdRef.current || undefined
            ).then(result => {
                if (DEBUG) {
                    console.log('[useTarotReaderAgent] Credit deduction result:', result);
                }
            }).catch(err => {
                console.error('[useTarotReaderAgent] Credit deduction failed:', err);
            });
            sessionStartTimeRef.current = null;
        } else {
            if (DEBUG) {
                console.warn('[useTarotReaderAgent] Skipping credit deduction. StartTime:', sessionStartTimeRef.current, 'User:', user?.id);
            }
        }

        // End the session timer in the store (stops UI chronometer)
        if (DEBUG) console.log('[useTarotReaderAgent] Ending session timer');
        endSessionTimer();

        // Trigger save session if we have an ID
        if (currentConversationIdRef.current) {
            saveSession(currentConversationIdRef.current);
            currentConversationIdRef.current = null;
        }

        callbacks?.onDisconnect?.();
    }, [callbacks, saveSession, user, deductCreditsForSession, endSessionTimer]);

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
            const toolCallUnknown = toolCall as unknown as Record<string, unknown>;
            const name = (toolCallUnknown.toolName as string) || (toolCallUnknown.name as string) || 'Unknown Tool';
            const args = (toolCallUnknown.toolArgs as Record<string, unknown>) || (toolCallUnknown.arguments as Record<string, unknown>) || {};
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
        if (!canStartSession()) {
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

            // Set session start time as a fallback if onConnect doesn't fire immediately
            if (!sessionStartTimeRef.current) {
                if (DEBUG) console.log('[useTarotReaderAgent] Setting session start time in startSession (fallback)');
                sessionStartTimeRef.current = Date.now();
                startSessionTimer();
            }

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
    }, [agentId, conversation, user, profile, callbacks, textOnly, canStartSession, startSessionTimer]);

    return {
        conversation,
        deck,
        startSession,
        endSession: conversation.endSession,
        setVolume: conversation.setVolume,
    };
}
