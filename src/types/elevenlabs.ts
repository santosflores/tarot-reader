/**
 * ElevenLabs API Type Definitions
 * Type definitions for ElevenLabs Conversational AI API responses
 */

/**
 * Conversation status
 */
export type ConversationStatus = 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';

/**
 * Transcript message role
 */
export type TranscriptRole = 'user' | 'agent';

/**
 * Individual transcript item from conversation details
 */
export interface ConversationTranscriptItem {
  role: TranscriptRole;
  content: string;
  /** Time in seconds from the start of the call when this message was spoken */
  time_in_call_secs?: number;
  // Additional fields may exist, but we'll focus on what we need
  [key: string]: unknown;
}

/**
 * Conversation details response from API
 */
export interface ConversationDetails {
  agent_id: string;
  conversation_id: string;
  status: ConversationStatus;
  user_id: string | null;
  branch_id: string | null;
  version_id: string | null;
  transcript: ConversationTranscriptItem[];
  metadata: {
    [key: string]: unknown;
  };
  analysis: unknown | null;
  conversation_initiation_client_data: {
    [key: string]: unknown;
  };
  has_audio: boolean;
  has_user_audio: boolean;
  has_response_audio: boolean;
}

/**
 * Conversation audio response
 * The audio endpoint returns a blob/stream
 */
export type ConversationAudioResponse = Blob;
