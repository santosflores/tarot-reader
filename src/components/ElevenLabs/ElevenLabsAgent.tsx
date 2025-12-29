/**
 * ElevenLabs Agent Component
 * Text-only conversation interface using ElevenLabs Agents Platform
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Role, Status, Callbacks } from '@elevenlabs/client';

// MessagePayload type from @elevenlabs/types (re-exported here for convenience)
interface MessagePayload {
  message: string;
  source: 'user' | 'ai';
  role: Role;
}

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

// ============================================================================
// Constants
// ============================================================================

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

// ============================================================================
// Utility Functions
// ============================================================================

const generateMessageId = (): string => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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

  const addStreamingMessage = useCallback((): number => {
    let newIndex = -1;
    setMessages((prev) => {
      newIndex = prev.length;
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
    return newIndex;
  }, []);

  const updateStreamingMessage = useCallback((index: number, content: string): void => {
    setMessages((prev) => {
      if (index < 0 || index >= prev.length || !prev[index].isStreaming) {
        return prev;
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], content };
      return updated;
    });
  }, []);

  const finalizeStreamingMessage = useCallback((index: number, content?: string): void => {
    setMessages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        content: content ?? updated[index].content,
        isStreaming: false,
      };
      return updated;
    });
  }, []);

  return {
    messages,
    addMessage,
    addStreamingMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
  };
}

// ============================================================================
// Custom Hook: useStreamingUpdates
// ============================================================================

function useStreamingUpdates(
  onUpdate: (index: number, content: string) => void
) {
  const streamingIndexRef = useRef<number | null>(null);
  const streamingTextRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);

  const flushUpdate = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      if (streamingIndexRef.current !== null) {
        onUpdate(streamingIndexRef.current, streamingTextRef.current);
      }
      rafIdRef.current = null;
    });
  }, [onUpdate]);

  const startStreaming = useCallback((index: number): void => {
    streamingIndexRef.current = index;
    streamingTextRef.current = '';
  }, []);

  const appendText = useCallback((text: string): void => {
    streamingTextRef.current += text;
    flushUpdate();
  }, [flushUpdate]);

  const stopStreaming = useCallback((): { index: number | null; text: string } => {
    const result = {
      index: streamingIndexRef.current,
      text: streamingTextRef.current,
    };
    streamingIndexRef.current = null;
    streamingTextRef.current = '';
    return result;
  }, []);

  const getStreamingState = useCallback(() => ({
    index: streamingIndexRef.current,
    text: streamingTextRef.current,
  }), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    startStreaming,
    appendText,
    stopStreaming,
    getStreamingState,
  };
}

// ============================================================================
// Component: MessageBubble
// ============================================================================

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const bubbleStyles = {
    user: 'bg-blue-500 text-white',
    system: 'bg-gray-200 text-gray-700 text-sm',
    agent: 'bg-white text-gray-900 border border-gray-200',
  };

  const timestampStyles = {
    user: 'text-blue-100',
    system: 'text-gray-500',
    agent: 'text-gray-500',
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${bubbleStyles[message.role]}`}>
        <p className="text-sm">
          {message.content || (message.isStreaming ? '...' : '')}
          {message.isStreaming && (
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full ml-1 animate-pulse" />
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    addMessage,
    addStreamingMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
  } = useAgentMessages();

  const streaming = useStreamingUpdates(updateStreamingMessage);

  // Callbacks for the ElevenLabs SDK
  const handleConnect: NonNullable<Callbacks['onConnect']> = useCallback(() => {
    setError(null);
    addMessage('system', 'Connected to agent');
  }, [addMessage]);

  const handleDisconnect: NonNullable<Callbacks['onDisconnect']> = useCallback(() => {
    addMessage('system', 'Disconnected from agent');
  }, [addMessage]);

  const handleMessage: NonNullable<Callbacks['onMessage']> = useCallback(
    (payload: MessagePayload) => {
      if (payload.role === 'agent' && payload.message) {
        addMessage('agent', payload.message);
      }
    },
    [addMessage]
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

  const handleAgentChatResponsePart: NonNullable<Callbacks['onAgentChatResponsePart']> = useCallback(
    (responsePart) => {
      if (!responsePart) return;

      if (responsePart.type === 'start') {
        const index = addStreamingMessage();
        streaming.startStreaming(index);
      } else if (responsePart.type === 'delta' && responsePart.text) {
        streaming.appendText(responsePart.text);
      } else if (responsePart.type === 'stop') {
        const { index, text } = streaming.stopStreaming();
        if (index !== null) {
          finalizeStreamingMessage(index, text);
        }
      }
    },
    [addStreamingMessage, streaming, finalizeStreamingMessage]
  );

  // Client tools configuration
  const clientTools = {
    logMessage: (params: LogMessageParams): string => {
      addMessage('system', `[Log] ${params.message}`);
      return 'Message logged successfully';
    },
  };

  const conversation = useConversation({
    textOnly: true,
    clientTools,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onMessage: handleMessage,
    onError: handleError,
    onStatusChange: handleStatusChange,
    onAgentChatResponsePart: handleAgentChatResponsePart,
  });

  const handleStartSession = useCallback(async (): Promise<void> => {
    if (!AGENT_ID) {
      setError('Agent ID is not configured. Set VITE_ELEVENLABS_AGENT_ID in your environment.');
      return;
    }

    try {
      setError(null);
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'websocket',
      });
    } catch (err) {
      setError(getErrorMessage(err));
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
        <p className="text-sm text-gray-600 mt-1">Text-only conversation interface</p>
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
