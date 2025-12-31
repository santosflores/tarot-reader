/**
 * ElevenLabs Agent Component
 * Voice conversation interface using ElevenLabs Agents Platform
 * Integrates with lipsync system for 3D character mouth animation
 * 
 * @see https://elevenlabs.io/docs/agents-platform/libraries/react
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Role, Status, Callbacks, Mode } from '@elevenlabs/client';
import type { TarotDeck, TarotCard } from '../../types/tarot';
import { createTarotDeck, shuffleDeck as shuffleTarotDeck, drawCards } from '../../utils/tarot';
import { isMajorArcana } from '../../types/tarot';
import { useElevenLabsAudio } from '../../hooks/useElevenLabsAudio';
import { useRevealedCard } from '../../hooks/useRevealedCard';

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  readonly id: string;
  readonly role: Role | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly isStreaming?: boolean;
}

interface LogMessageParams {
  message: string;
}

interface DrawCardParams {
  numberOfCards: number;
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

const generateMessageId = (): string => 
  `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// ============================================================================
// Custom Hook: useAgentMessages
// ============================================================================

function useAgentMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Track the current streaming message index using a ref for synchronous access
  const streamingIndexRef = useRef<number | null>(null);
  const streamingTextRef = useRef<string>('');
  // Track if we handled the current response via streaming (to prevent duplicates from onMessage)
  const handledViaStreamingRef = useRef<boolean>(false);

  const addMessage = useCallback((role: ChatMessage['role'], content: string): void => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateMessageId(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const startStreamingMessage = useCallback((): void => {
    // Mark that we're handling this response via streaming
    handledViaStreamingRef.current = true;
    // Calculate the index synchronously before updating state
    setMessages((prev) => {
      const newIndex = prev.length;
      streamingIndexRef.current = newIndex;
      streamingTextRef.current = '';
      return [
        ...prev,
        {
          id: generateMessageId(),
          role: 'agent' as const,
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        },
      ];
    });
  }, []);

  const appendStreamingText = useCallback((text: string): void => {
    streamingTextRef.current += text;
    const currentIndex = streamingIndexRef.current;
    const currentContent = streamingTextRef.current;
    
    if (currentIndex === null) return;

    setMessages((prev) => {
      if (currentIndex >= prev.length || !prev[currentIndex].isStreaming) {
        return prev;
      }
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], content: currentContent };
      return updated;
    });
  }, []);

  const finalizeStreamingMessage = useCallback((): void => {
    const currentIndex = streamingIndexRef.current;
    const finalContent = streamingTextRef.current;
    
    if (currentIndex === null) return;

    setMessages((prev) => {
      if (currentIndex >= prev.length) return prev;
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        content: finalContent,
        isStreaming: false,
      };
      return updated;
    });

    streamingIndexRef.current = null;
    streamingTextRef.current = '';
  }, []);

  const isStreaming = useCallback((): boolean => {
    return streamingIndexRef.current !== null;
  }, []);

  // Check if the current response was handled via streaming (and reset the flag)
  const wasHandledViaStreaming = useCallback((): boolean => {
    const handled = handledViaStreamingRef.current;
    handledViaStreamingRef.current = false;
    return handled;
  }, []);

  return {
    messages,
    addMessage,
    startStreamingMessage,
    appendStreamingText,
    finalizeStreamingMessage,
    isStreaming,
    wasHandledViaStreaming,
  };
}

// ============================================================================
// Component: MessageBubble
// ============================================================================

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const bubbleStyles: Record<ChatMessage['role'], string> = {
    user: 'bg-blue-500 text-white',
    system: 'bg-gray-200 text-gray-700 text-sm',
    agent: 'bg-white text-gray-900 border border-gray-200',
  };

  const timestampStyles: Record<ChatMessage['role'], string> = {
    user: 'text-blue-100',
    system: 'text-gray-500',
    agent: 'text-gray-500',
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${bubbleStyles[message.role]}`}>
        <p className="text-sm whitespace-pre-wrap">
          {message.content || (message.isStreaming ? '' : '')}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-gray-500 ml-0.5 animate-pulse" />
          )}
        </p>
        <p className={`text-xs mt-1 ${timestampStyles[message.role]}`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Component: ConnectionStatus
// ============================================================================

interface ConnectionStatusProps {
  readonly status: Status;
  readonly onStart: () => void;
  readonly onEnd: () => void;
  readonly disabled: boolean;
}

function ConnectionStatus({ status, onStart, onEnd, disabled }: ConnectionStatusProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600 capitalize">{status}</span>
        </div>
        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              onClick={onStart}
              disabled={disabled || isConnecting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Start Session'}
            </button>
          ) : (
            <button
              onClick={onEnd}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              End Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: MessageInput
// ============================================================================

interface MessageInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly disabled: boolean;
}

function MessageInput({ value, onChange, onSend, disabled }: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Component: ElevenLabsAgent (Main)
// ============================================================================

export function ElevenLabsAgent() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // Deck state - each session starts with a fresh deck
  // Use ref to ensure client tools always have access to current deck value
  const deckRef = useRef<TarotDeck | null>(null);
  const [deck, setDeck] = useState<TarotDeck | null>(null);
  // Store drawn cards for revealCard tool
  const drawnCardsRef = useRef<TarotCard[]>([]);

  const {
    messages,
    addMessage,
    startStreamingMessage,
    appendStreamingText,
    finalizeStreamingMessage,
    wasHandledViaStreaming,
  } = useAgentMessages();

  // Integrate with lipsync audio system
  useElevenLabsAudio({
    isConnected: isSessionConnected,
    mode: agentMode,
  });

  // Get the setRevealedCard action from the store
  const setRevealedCard = useRevealedCard((state) => state.setRevealedCard);

  // Keep ref in sync with state
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  // Callbacks for the ElevenLabs SDK
  const handleConnect: NonNullable<Callbacks['onConnect']> = useCallback(() => {
    setError(null);
    setIsSessionConnected(true);
    // Reset deck for new session - each session starts fresh
    deckRef.current = null;
    setDeck(null);
    drawnCardsRef.current = [];
    addMessage('system', 'Connected to agent');
  }, [addMessage]);

  const handleDisconnect: NonNullable<Callbacks['onDisconnect']> = useCallback(() => {
    setIsSessionConnected(false);
    setAgentMode(null);
    addMessage('system', 'Disconnected from agent');
  }, [addMessage]);

  // Handle full messages - skip if already handled via streaming
  const handleMessage: NonNullable<Callbacks['onMessage']> = useCallback(
    (payload) => {
      if (payload.role === 'agent') {
        // Check if this message was already handled via streaming
        if (wasHandledViaStreaming()) {
          // Skip - already displayed via streaming
          return;
        }
        // Non-streamed response, add it
        addMessage('agent', payload.message);
      }
    },
    [addMessage, wasHandledViaStreaming]
  );

  const handleError: NonNullable<Callbacks['onError']> = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleStatusChange: NonNullable<Callbacks['onStatusChange']> = useCallback(
    ({ status }) => {
      if (import.meta.env.DEV) {
        console.log('Status changed:', status);
      }
    },
    []
  );

  // Handle mode changes (speaking/listening) - update state for lipsync
  const handleModeChange: NonNullable<Callbacks['onModeChange']> = useCallback(
    ({ mode }) => {
      setAgentMode(mode);
      if (import.meta.env.DEV) {
        console.log('Mode changed:', mode);
      }
    },
    []
  );

  // Handle streaming response parts for real-time text display
  const handleAgentChatResponsePart: NonNullable<Callbacks['onAgentChatResponsePart']> = useCallback(
    (responsePart) => {
      if (!responsePart) return;

      switch (responsePart.type) {
        case 'start':
          // Create a new streaming message placeholder
          startStreamingMessage();
          break;
        
        case 'delta':
          // Append the text chunk to the streaming message
          if (responsePart.text) {
            appendStreamingText(responsePart.text);
          }
          break;
        
        case 'stop':
          // Finalize the streaming message
          finalizeStreamingMessage();
          break;
      }
    },
    [startStreamingMessage, appendStreamingText, finalizeStreamingMessage]
  );

  // Client tools configuration
  const clientTools = {
    logMessage: (params: LogMessageParams): string => {
      addMessage('system', `[Log] ${params.message}`);
      return 'Message logged successfully';
    },
    initDeck: (): string => {
      try {
        const newDeck = createTarotDeck();
        deckRef.current = newDeck;
        setDeck(newDeck);
        addMessage('system', '🎴 Tarot deck initialized with 78 cards (22 Major Arcana + 56 Minor Arcana)');
        return 'Deck initialized successfully with 78 cards';
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        addMessage('system', `❌ Failed to initialize deck: ${errorMessage}`);
        return `Error: ${errorMessage}`;
      }
    },
    shuffleDeck: (): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
          addMessage('system', `❌ ${errorMessage}`);
          return `Error: ${errorMessage}`;
        }
        const shuffledDeck = shuffleTarotDeck(currentDeck);
        deckRef.current = shuffledDeck;
        setDeck(shuffledDeck);
        addMessage('system', '🔀 Deck shuffled successfully');
        return 'Deck shuffled successfully';
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        addMessage('system', `❌ Failed to shuffle deck: ${errorMessage}`);
        return `Error: ${errorMessage}`;
      }
    },
    drawCard: (params: DrawCardParams): string => {
      try {
        const currentDeck = deckRef.current;
        if (!currentDeck) {
          const errorMessage = 'No deck has been initialized. Please initialize the deck first.';
          addMessage('system', `❌ ${errorMessage}`);
          return `Error: ${errorMessage}`;
        }

        const { numberOfCards } = params;
        
        if (numberOfCards < 1) {
          const errorMessage = 'Number of cards must be at least 1';
          addMessage('system', `❌ ${errorMessage}`);
          return `Error: ${errorMessage}`;
        }

        if (numberOfCards > currentDeck.length) {
          const errorMessage = `Cannot draw ${numberOfCards} cards. Only ${currentDeck.length} cards remaining in the deck.`;
          addMessage('system', `❌ ${errorMessage}`);
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
        addMessage('system', message);

        return `Successfully drew ${numberOfCards} card${numberOfCards === 1 ? '' : 's'}. Cards drawn: ${result.drawn.map(c => c.name).join(', ')}. ${result.remaining.length} cards remaining in deck.`;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        addMessage('system', `❌ Failed to draw cards: ${errorMessage}`);
        return `Error: ${errorMessage}`;
      }
    },
    revealCard: (params: RevealCardParams): string => {
      try {
        const { cardIndex } = params;
        const drawnCards = drawnCardsRef.current;
        
        if (drawnCards.length === 0) {
          const errorMessage = 'No cards have been drawn yet. Please draw cards first.';
          addMessage('system', `❌ ${errorMessage}`);
          return `Error: ${errorMessage}`;
        }

        if (cardIndex < 0 || cardIndex >= drawnCards.length) {
          const errorMessage = `Invalid card index. Please provide an index between 0 and ${drawnCards.length - 1}.`;
          addMessage('system', `❌ ${errorMessage}`);
          return `Error: ${errorMessage}`;
        }

        const card = drawnCards[cardIndex];

        // Set the card in the revealed card store to display the overlay
        setRevealedCard(card);

        const cardInfo = isMajorArcana(card)
          ? `${card.name} (Major Arcana #${card.number})`
          : `${card.name} (${card.suit})`;
        
        addMessage('system', `🔮 Revealing card: ${cardInfo}`);
        return `Successfully revealed card: ${cardInfo}`;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        addMessage('system', `❌ Failed to reveal card: ${errorMessage}`);
        return `Error: ${errorMessage}`;
      }
    },
  };

  const conversation = useConversation({
    clientTools,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onMessage: handleMessage,
    onError: handleError,
    onStatusChange: handleStatusChange,
    onModeChange: handleModeChange,
    onAgentChatResponsePart: handleAgentChatResponsePart,
  });

  const handleStartSession = useCallback(async (): Promise<void> => {
    if (!AGENT_ID) {
      setError('Agent ID is not configured. Set VITE_ELEVENLABS_AGENT_ID in your environment.');
      return;
    }

    try {
      setError(null);
      
      // Request microphone permission before starting the session
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
      
      // Ensure volume is set to maximum after session starts
      await conversation.setVolume({ volume: 0.8 });
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Provide user-friendly error for permission denial
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Microphone access is required for voice conversations. Please allow microphone access and try again.');
      } else {
        setError(errorMessage);
      }
    }
  }, [conversation]);

  const handleEndSession = useCallback(async (): Promise<void> => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }, [conversation]);

  const handleSendMessage = useCallback((): void => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || conversation.status !== 'connected') return;

    addMessage('user', trimmedMessage);
    conversation.sendUserMessage(trimmedMessage);
    setInputValue('');
  }, [inputValue, conversation, addMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const isConnected = conversation.status === 'connected';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">ElevenLabs Agent</h1>
        <p className="text-sm text-gray-600 mt-1">Voice conversation interface</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a session to begin chatting.</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        status={conversation.status}
        onStart={handleStartSession}
        onEnd={handleEndSession}
        disabled={!AGENT_ID}
      />

      {/* Input Area */}
      {isConnected && (
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={!isConnected}
        />
      )}
    </div>
  );
}
