/**
 * ElevenLabs API Utility Functions
 * Functions to interact with ElevenLabs Conversational AI API via Supabase Edge Functions
 */

import { supabase } from '../lib/supabase';
import type { ConversationDetails, ConversationAudioResponse } from '../types/elevenlabs';

/**
 * Common error handling for API requests
 */
function handleApiError(response: Response, context: string): Error {
  return new Error(
    `Failed to ${context}: ${response.status} ${response.statusText}`
  );
}

/**
 * Fetch conversation list
 * @param params - Parameters for fetching conversations
 * @param params.agentId - The ID of the agent
 * @param params.userId - Optional user ID to filter conversations
 * @param params.pageSize - Number of conversations to return (default: 10)
 * @returns Promise with conversations list
 * @throws Error if the request fails
 */
export async function fetchConversations(params: {
  agentId: string;
  userId?: string;
  pageSize?: number;
}): Promise<{ conversations: unknown[]; next_cursor?: string | null; has_more: boolean }> {
  const { agentId, userId, pageSize = 10 } = params;

  const queryParams = new URLSearchParams({
    agent_id: agentId,
    page_size: pageSize.toString(),
    summary_mode: 'exclude',
  });

  if (userId) {
    queryParams.set('user_id', userId);
  }

  // Get session for authentication
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    throw new Error('Not authenticated. Please sign in to fetch conversations.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(
    `${supabaseUrl}/functions/v1/elevenlabs-conversations?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || handleApiError(response, 'fetch conversations').message
    );
  }

  const result = await response.json();
  return result;
}

/**
 * Fetch conversation details including transcript
 * @param conversationId - The ID of the conversation to fetch
 * @returns Promise with conversation details
 * @throws Error if the request fails
 */
export async function fetchConversationDetails(
  conversationId: string
): Promise<ConversationDetails> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    throw new Error('Not authenticated. Please sign in to fetch conversation details.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(
    `${supabaseUrl}/functions/v1/elevenlabs-conversations/${conversationId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || handleApiError(response, 'fetch conversation details').message
    );
  }

  const data: ConversationDetails = await response.json();
  return data;
}

/**
 * Fetch conversation audio as a Blob
 * @param conversationId - The ID of the conversation to fetch audio for
 * @returns Promise with audio Blob
 * @throws Error if the request fails
 */
export async function fetchConversationAudio(
  conversationId: string
): Promise<ConversationAudioResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    throw new Error('Not authenticated. Please sign in to fetch conversation audio.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(
    `${supabaseUrl}/functions/v1/elevenlabs-conversation-audio/${conversationId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || handleApiError(response, 'fetch conversation audio').message
    );
  }

  const blob: ConversationAudioResponse = await response.blob();
  return blob;
}

/**
 * Create an object URL from a blob for audio playback
 * @param blob - The audio blob
 * @returns Object URL that can be used with audio elements
 */
export function createAudioUrlFromBlob(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke an object URL to free memory
 * @param url - The object URL to revoke
 */
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
