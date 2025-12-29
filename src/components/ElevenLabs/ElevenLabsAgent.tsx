/**
 * ElevenLabs Agent Component
 * Text-only conversation interface using ElevenLabs Agents Platform
 */

import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';

// Type definition for messages from ElevenLabs SDK
type ElevenLabsMessage =
  | { role: 'agent' | 'user'; message: string; source?: string }
  | { type: 'user_message' | 'user_transcript' | 'user_transcript_final'; text?: string; transcript?: string }
  | { type: 'agent_chat_response_part'; text_response_part?: { type: 'start' | 'delta' | 'stop'; text?: string }; response_part?: { type: 'start' | 'delta' | 'stop'; text?: string } }
  | { type: 'agent_response' | 'agent_chat_response'; agent_response_event?: { agent_response: string }; agent_response?: string; text?: string; response?: string }
  | { type: 'debug'; [key: string]: unknown }
  | { [key: string]: unknown };

export function ElevenLabsAgent() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'system'; content: string; timestamp: Date; isStreaming?: boolean }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingMessageIndexRef = useRef<number | null>(null);
  const streamingTextRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  // Throttled update function for streaming messages
  const updateStreamingMessage = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      if (streamingMessageIndexRef.current !== null) {
        setMessages((prevMessages) => {
          const updated = [...prevMessages];
          const streamIndex = streamingMessageIndexRef.current!;
          if (streamIndex < updated.length && updated[streamIndex].isStreaming) {
            updated[streamIndex] = {
              ...updated[streamIndex],
              content: streamingTextRef.current,
            };
          }
          return updated;
        });
      }
      rafIdRef.current = null;
    });
  };

  const addMessage = (role: 'user' | 'agent' | 'system', content: string) => {
    console.log('addMessage called:', role, content);
    setMessages((prev) => {
      const newMessages = [
        ...prev,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ];
      console.log('Updated messages array, new length:', newMessages.length);
      return newMessages;
    });
  };

  const conversation = useConversation({
    textOnly: true,
    clientTools: {
      logMessage: (parameters: { message: string }) => {
        // Log the message to console
        console.log('Agent logMessage:', parameters.message);
        
        // Optionally display in the UI as a system message
        addMessage('system', `[Log] ${parameters.message}`);
        
        // Return success confirmation
        return 'Message logged successfully';
      },
    },
    onConnect: () => {
      setIsConnected(true);
      setError(null);
      addMessage('system', 'Connected to agent');
    },
    onDisconnect: () => {
      setIsConnected(false);
      addMessage('system', 'Disconnected from agent');
    },
    onMessage: (message: ElevenLabsMessage) => {
      // The SDK transforms messages into a simpler format
      // Check for the transformed format first using type guards
      if ('role' in message && 'message' in message && typeof message.message === 'string') {
        if (message.role === 'agent' && message.message) {
          // Agent message from SDK
          console.log('Adding agent message:', message.message);
          addMessage('agent', message.message);
        } else if (message.role === 'user' && message.message) {
          // User message from SDK (if any)
          console.log('Adding user message from SDK:', message.message);
          addMessage('user', message.message);
        }
      }
      // Fallback: Handle raw WebSocket message formats (if SDK doesn't transform them)
      else if ('type' in message && (message.type === 'user_message' || message.type === 'user_transcript' || message.type === 'user_transcript_final')) {
        const msg = message as { type: 'user_message' | 'user_transcript' | 'user_transcript_final'; text?: string; transcript?: string };
        const text = msg.text || msg.transcript || '';
        if (text) {
          console.log('Adding user message (raw):', text);
          addMessage('user', text);
        }
      }
      // Handle streaming agent response parts (for real-time streaming if supported)
      else if ('type' in message && message.type === 'agent_chat_response_part') {
        const msg = message as { type: 'agent_chat_response_part'; text_response_part?: { type: 'start' | 'delta' | 'stop'; text?: string }; response_part?: { type: 'start' | 'delta' | 'stop'; text?: string } };
        const responsePart = msg.text_response_part || msg.response_part;
        console.log('Agent chat response part:', responsePart);
        
        if (responsePart && 'type' in responsePart) {
          if (responsePart.type === 'start') {
            console.log('Starting streaming response');
            streamingTextRef.current = '';
            // Add a placeholder message for streaming
            setMessages((prev) => {
              const newIndex = prev.length;
              streamingMessageIndexRef.current = newIndex;
              console.log('Created streaming message at index:', newIndex);
              return [
                ...prev,
                {
                  role: 'agent',
                  content: '',
                  timestamp: new Date(),
                  isStreaming: true,
                },
              ];
            });
          } else if (responsePart.type === 'delta') {
            // Accumulate streaming text
            const deltaText = responsePart.text || '';
            streamingTextRef.current += deltaText;
            console.log('Streaming delta, current text length:', streamingTextRef.current.length);
            // Throttled update to prevent UI freezing
            updateStreamingMessage();
          } else if (responsePart.type === 'stop') {
            console.log('Stopping streaming response');
            // End of streaming - mark as complete
            if (streamingMessageIndexRef.current !== null) {
              setMessages((prevMessages) => {
                const updated = [...prevMessages];
                const streamIndex = streamingMessageIndexRef.current!;
                if (streamIndex < updated.length && updated[streamIndex].isStreaming) {
                  updated[streamIndex] = {
                    ...updated[streamIndex],
                    content: streamingTextRef.current,
                    isStreaming: false,
                  };
                  console.log('Finalized streaming message:', updated[streamIndex].content);
                }
                return updated;
              });
              streamingMessageIndexRef.current = null;
              streamingTextRef.current = '';
            }
          }
        }
      }
      // Handle final agent response event (raw WebSocket format)
      else if ('type' in message && (message.type === 'agent_response' || message.type === 'agent_chat_response')) {
        const msg = message as { type: 'agent_response' | 'agent_chat_response'; agent_response_event?: { agent_response: string }; agent_response?: string; text?: string; response?: string };
        const agentResponse = 
          (msg.agent_response_event?.agent_response) || 
          (msg.agent_response) || 
          (msg.text) || 
          (msg.response);
        
        console.log('Agent response event (raw):', agentResponse);
        
        if (agentResponse && typeof agentResponse === 'string') {
          // Update the streaming message if it exists, otherwise add new
          if (streamingMessageIndexRef.current !== null) {
            console.log('Updating existing streaming message');
            setMessages((prevMessages) => {
              const updated = [...prevMessages];
              const streamIndex = streamingMessageIndexRef.current!;
              if (streamIndex < updated.length) {
                updated[streamIndex] = {
                  ...updated[streamIndex],
                  content: agentResponse,
                  isStreaming: false,
                };
              }
              return updated;
            });
            streamingMessageIndexRef.current = null;
            streamingTextRef.current = '';
          } else {
            console.log('Adding new agent message (raw)');
            // Add as new message if no streaming message exists
            addMessage('agent', agentResponse);
          }
        }
      }
      // Handle debug messages
      else if ('type' in message && message.type === 'debug') {
        console.log('Debug message:', message);
      }
      // Log unhandled message formats for debugging
      else {
        console.warn('Unhandled message format:', message);
      }
    },
    onError: (error: Error | { message?: string } | string) => {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : error.message || 'An error occurred';
      setError(errorMessage);
      console.error('ElevenLabs error:', error);
    },
    onStatusChange: (status) => {
      console.log('Status changed:', status);
    },
    onUnhandledClientToolCall: (toolCall) => {
      console.warn('Unhandled client tool call:', toolCall);
    },
  });

  const handleStartSession = async () => {
    if (!agentId) {
      setError('Agent ID is not configured. Please set VITE_ELEVENLABS_AGENT_ID in your environment variables.');
      return;
    }

    try {
      setError(null);
      await conversation.startSession({
        agentId,
        connectionType: 'websocket', // or 'webrtc' if preferred
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Failed to start session:', err);
    }
  };

  const handleEndSession = async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return;

    const messageText = message.trim();
    // Manually add user message to UI immediately
    addMessage('user', messageText);
    
    conversation.sendUserMessage(messageText);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Debug: Log when messages state changes
  useEffect(() => {
    console.log('Messages state updated, count:', messages.length);
    console.log('Latest message:', messages[messages.length - 1]);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">ElevenLabs Agent</h1>
        <p className="text-sm text-gray-600 mt-1">Text-only conversation interface</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        id="messages-container"
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a session to begin chatting.</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.role === 'system'
                    ? 'bg-gray-200 text-gray-700 text-sm'
                    : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm">
                {msg.content || (msg.isStreaming ? '...' : '')}
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full ml-1 animate-pulse" />
                )}
              </p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex space-x-2">
            {!isConnected ? (
              <button
                onClick={handleStartSession}
                disabled={!agentId}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Start Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
