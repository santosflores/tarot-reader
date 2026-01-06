/**
 * Conversations List Component
 * Displays a list of conversations from ElevenLabs API
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { useAuthContext } from '../../../hooks/useAuthContext';

interface Conversation {
  agent_id: string;
  conversation_id: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  message_count: number;
  status: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';
  call_successful: 'success' | 'failure' | 'unknown';
  transcript_summary?: string | null;
  call_summary_title?: string | null;
  direction?: 'inbound' | 'outbound' | null;
  rating?: number | null;
  agent_name?: string | null;
}

interface ConversationsResponse {
  conversations: Conversation[];
  next_cursor?: string | null;
  has_more: boolean;
}

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchConversations = async () => {
    if (!AGENT_ID) {
      setError('Agent ID is not configured');
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get API key from user's session or environment
      // For now, we'll need to get it from the user's profile or environment variable
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        setError('ElevenLabs API key is not configured. Set VITE_ELEVENLABS_API_KEY in your environment.');
        setLoading(false);
        return;
      }

      // Build query parameters - filter by user_id to show only conversations owned by this user
      const params = new URLSearchParams({
        agent_id: AGENT_ID,
        user_id: user.id,
        page_size: '10',
        summary_mode: 'exclude',
      });

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch conversations: ${response.statusText}`);
      }

      const data: ConversationsResponse = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      console.error('[ConversationsList] Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const formatDate = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Conversation['status']): string => {
    switch (status) {
      case 'done':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <CollapsibleSection title="Conversations" icon="💬" defaultExpanded={false}>
      <div className="space-y-2">
        {loading && (
          <div className="text-xs text-gray-500 text-center py-2">Loading conversations...</div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
            <button
              onClick={fetchConversations}
              className="ml-2 text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">No conversations found</div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className="border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {conv.call_summary_title || `Conversation ${conv.conversation_id.slice(0, 8)}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(conv.start_time_unix_secs)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(conv.status)}`}
                      title={conv.status}
                    >
                      {conv.status}
                    </span>
                    <span
                      className={`text-xs ${
                        conv.call_successful === 'success'
                          ? 'text-green-600'
                          : conv.call_successful === 'failure'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                      title={`Call ${conv.call_successful}`}
                    >
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>Duration: {formatDuration(conv.call_duration_secs)}</span>
                  <span>Messages: {conv.message_count}</span>
                  {conv.rating && (
                    <span className="flex items-center gap-0.5">
                      Rating: {conv.rating}/5 ⭐
                    </span>
                  )}
                </div>
                {conv.transcript_summary && (
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {conv.transcript_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <button
            onClick={fetchConversations}
            className="w-full text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded-md transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
    </CollapsibleSection>
  );
}
