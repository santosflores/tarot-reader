/**
 * Conversations List Component
 * Displays a list of conversations from ElevenLabs API
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { useAuthContext } from '@/hooks/useAuthContext';
import { fetchConversations as fetchConversationsApi } from '@/utils/elevenlabsApi';
import { useChatbot } from '@/hooks/useChatbot';

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
  has_audio?: boolean;
  has_response_audio?: boolean;
}

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthContext();
  const activeReplayId = useChatbot((state) => state.activeReplayId);
  const setActiveReplayId = useChatbot((state) => state.setActiveReplayId);

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
      const data = await fetchConversationsApi({
        agentId: AGENT_ID,
        userId: user.id,
        pageSize: 10,
      });

      setConversations(data.conversations as Conversation[]);
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



  return (
    <CollapsibleSection title="Past Communions" icon="💬" defaultExpanded={false} className="mt-4">
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-xs text-purple-300/80">Recalling memories...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-400/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="text-red-400 text-sm">⚠️</div>
              <div className="flex-1">
                <div className="text-xs font-medium text-red-200 mb-1">Error recalling memories</div>
                <div className="text-xs text-red-300/80 mb-2">{error}</div>
                <button
                  type="button"
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
            <div className="text-xs font-medium text-purple-300/80 mb-1">No communions recorded</div>
            <div className="text-xs text-purple-400/60">Manifest a connection to see it here</div>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className="group relative bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-3 hover:border-purple-300/60 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
              >
                {/* Status indicator bar - REMOVED */}

                <div className="pl-1 relative z-10">
                  {/* Header with title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-purple-200 truncate">
                        {conv.call_summary_title || `Communion ${conv.conversation_id.slice(0, 8)}`}
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
                  </div>

                  {/* Summary preview */}
                  {conv.transcript_summary && (
                    <div className="text-xs text-purple-200/80 mt-2 p-2 bg-slate-900/50 rounded border border-purple-400/20 line-clamp-2">
                      {conv.transcript_summary}
                    </div>
                  )}

                  {/* Replay button */}
                  {(conv.status === 'done' || conv.has_audio || conv.has_response_audio) && (
                    <div className="mt-2 pt-2 border-t border-purple-400/20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReplayId(
                            activeReplayId === conv.conversation_id ? null : conv.conversation_id
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-purple-800/50 hover:bg-purple-700/60 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white px-2 py-1.5 rounded transition-all duration-200 hover:scale-[1.02]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {activeReplayId === conv.conversation_id ? 'Stop Replay' : 'Replay'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <button
            type="button"
            onClick={fetchConversations}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Memories
          </button>
        )}


      </div>
    </CollapsibleSection >
  );
}
