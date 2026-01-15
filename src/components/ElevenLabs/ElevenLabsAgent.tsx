/**
 * ElevenLabs Agent Component
 * Voice conversation interface using ElevenLabs Agents Platform
 * Integrates with lipsync system for 3D character mouth animation
 * 
 * @see https://elevenlabs.io/docs/agents-platform/libraries/react
 */

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import type { Status, Mode } from '@elevenlabs/client';
import { useElevenLabsAudio } from '../../hooks/useElevenLabsAudio';
import { useTarotReaderAgent } from '../../hooks/useTarotReaderAgent';
import { useAgentMessages } from '../../hooks/useAgentMessages';
import type { ChatMessage } from '../../types/elevenlabs';

// ============================================================================
// Constants
// ============================================================================
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEV === 'true';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

// ============================================================================
// Component: MessageBubble
// ============================================================================

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
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
});

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
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
              }`}
          />
          <span className="text-sm text-gray-600 capitalize">{status}</span>
        </div>
        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={onStart}
              disabled={disabled || isConnecting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Start Session'}
            </button>
          ) : (
            <button
              type="button"
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
          type="button"
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
  // Debug mount
  useEffect(() => {
    if (DEBUG) {
      console.log('ElevenLabsAgent mounted. DEBUG is enabled.');
    }
  }, []);

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    addMessage,
    startStreamingMessage,
    appendStreamingText,
    finalizeStreamingMessage,
    wasHandledViaStreaming,
  } = useAgentMessages();

  // Integrate with lipsync audio system
  // Note: we still use this hook internally for the lipsync side effects
  useElevenLabsAudio({
    isConnected: isSessionConnected,
    mode: agentMode,
  });


  // Callbacks for the ElevenLabs SDK via our custom hook
  const callbacks = useMemo(() => ({
    onConnect: () => {
      setError(null);
      setIsSessionConnected(true);
      addMessage('system', 'Connected to agent');
    },

    onDisconnect: () => {
      setIsSessionConnected(false);
      setAgentMode(null);
      addMessage('system', 'Disconnected from agent');
    },

    onMessage: (payload: { source: 'user' | 'ai'; message: string }) => {
      if (payload.source === 'ai') {
        const payloadWithRole = payload as unknown as { role?: string };
        if (payloadWithRole.role === 'agent' || payloadWithRole.role === 'ai') {
          // Check if this message was already handled via streaming
          if (wasHandledViaStreaming()) {
            return;
          }
          // Non-streamed response, add it
          addMessage('agent', payload.message);
        }
      }
    },

    onError: (message: string) => {
      setError(message);
    },

    onStatusChange: ({ status }: { status: Status }) => {
      console.log('Status change:', status);
    },

    onModeChange: ({ mode }: { mode: Mode }) => {
      setAgentMode(mode);
    },

    onToolLog: (message: string) => {
      addMessage('system', message);
      console.log('Tool log:', message);
    },

    onAgentChatResponsePart: (responsePart: { type: string; text?: string }) => {
      if (!responsePart) return;

      switch (responsePart.type) {
        case 'start':
          startStreamingMessage();
          break;
        case 'delta':
          if (responsePart.text) {
            appendStreamingText(responsePart.text);
          }
          break;
        case 'stop':
          finalizeStreamingMessage();
          break;
      }
    },
  }), [addMessage, startStreamingMessage, appendStreamingText, finalizeStreamingMessage, wasHandledViaStreaming]);

  const { conversation, startSession, endSession } = useTarotReaderAgent({
    agentId: AGENT_ID,
    callbacks
  }, true);

  const handleStartSession = useCallback(async (): Promise<void> => {
    // startSession from hook handles permissions and config
    await startSession();
  }, [startSession]);

  const handleEndSession = useCallback(async (): Promise<void> => {
    try {
      await endSession();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }, [endSession]);

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
