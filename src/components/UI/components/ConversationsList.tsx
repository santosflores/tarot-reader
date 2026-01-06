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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return 'text-purple-200 bg-slate-800/90 border-purple-400/40';
      case 'in-progress':
        return 'text-blue-200 bg-slate-800/90 border-blue-400/40';
      case 'processing':
        return 'text-amber-200 bg-slate-800/90 border-amber-400/40';
      case 'failed':
        return 'text-red-200 bg-slate-800/90 border-red-400/40';
      default:
        return 'text-gray-300 bg-slate-800/90 border-gray-400/40';
    }
  };

  const getStatusIcon = (status: Conversation['status']): string => {
    switch (status) {
      case 'done':
        return '✓';
      case 'in-progress':
        return '●';
      case 'processing':
        return '⟳';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <CollapsibleSection title="Conversations" icon="💬" defaultExpanded={false} className="mt-4">
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-xs text-purple-300/80">Loading conversations...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-400/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="text-red-400 text-sm">⚠️</div>
              <div className="flex-1">
                <div className="text-xs font-medium text-red-200 mb-1">Error loading conversations</div>
                <div className="text-xs text-red-300/80 mb-2">{error}</div>
                <button
                  onClick={fetchConversations}
                  className="text-xs font-medium text-red-300 hover:text-red-200 underline hover:no-underline transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-50">💬</div>
            <div className="text-xs font-medium text-purple-300/80 mb-1">No conversations yet</div>
            <div className="text-xs text-purple-400/60">Start a conversation to see it here</div>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className="group relative bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-3 hover:border-purple-300/60 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
              >
                {/* Status indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                  conv.status === 'done' ? 'bg-purple-400' :
                  conv.status === 'in-progress' ? 'bg-blue-400' :
                  conv.status === 'processing' ? 'bg-amber-400' :
                  conv.status === 'failed' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>

                <div className="pl-1 relative z-10">
                  {/* Header with title and status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-purple-200 truncate">
                        {conv.call_summary_title || `Conversation ${conv.conversation_id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs text-purple-300/80 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(conv.start_time_unix_secs)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md border backdrop-blur-sm ${getStatusColor(conv.status)} flex items-center gap-1 shadow-lg`}
                        title={conv.status}
                      >
                        <span className="text-[10px]">{getStatusIcon(conv.status)}</span>
                        <span className="capitalize">{conv.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-purple-300/80 mb-2">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{formatDuration(conv.call_duration_secs)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">{conv.message_count} {conv.message_count === 1 ? 'message' : 'messages'}</span>
                    </div>
                    {conv.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">⭐</span>
                        <span className="font-medium">{conv.rating}/5</span>
                      </div>
                    )}
                    {conv.call_successful === 'success' && (
                      <div className="flex items-center gap-1 text-purple-300">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] font-medium">Success</span>
                      </div>
                    )}
                  </div>

                  {/* Summary preview */}
                  {conv.transcript_summary && (
                    <div className="text-xs text-purple-200/80 mt-2 p-2 bg-slate-900/50 rounded border border-purple-400/20 line-clamp-2">
                      {conv.transcript_summary}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <button
            onClick={fetchConversations}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh conversations
          </button>
        )}
      </div>
    </CollapsibleSection>
  );
}
