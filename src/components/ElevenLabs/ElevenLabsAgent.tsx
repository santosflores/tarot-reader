/**
 * ElevenLabs Agent Component
 * Text-only conversation interface using ElevenLabs Agents Platform
 */

import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

export function ElevenLabsAgent() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent' | 'system'; content: string; timestamp: Date }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    textOnly: true,
    onConnect: () => {
      setIsConnected(true);
      setError(null);
      addMessage('system', 'Connected to agent');
    },
    onDisconnect: () => {
      setIsConnected(false);
      addMessage('system', 'Disconnected from agent');
    },
    onMessage: (message) => {
      // Handle different message types
      if (message.type === 'user_transcript' || message.type === 'user_transcript_final') {
        addMessage('user', message.text || '');
      } else if (message.type === 'agent_response') {
        addMessage('agent', message.text || '');
      } else if (message.type === 'debug') {
        // Optionally show debug messages in development
        if (import.meta.env.DEV) {
          console.log('Debug message:', message);
        }
      }
    },
    onError: (error) => {
      setError(error.message || 'An error occurred');
      console.error('ElevenLabs error:', error);
    },
    onStatusChange: (status) => {
      console.log('Status changed:', status);
    },
  });

  const addMessage = (role: 'user' | 'agent' | 'system', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

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

    conversation.sendUserMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

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
              <p className="text-sm">{msg.content}</p>
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
