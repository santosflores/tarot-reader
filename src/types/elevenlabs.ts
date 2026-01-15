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
// ... existing code ...
export type ConversationAudioResponse = Blob;

/**
 * Conversation item from the conversations list API
 */
export interface ConversationListItem {
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

// ============================================================================
// UI/State Types (Shared Across Components)
// ============================================================================

import type { Mode, Status } from '@elevenlabs/client';

/**
 * Chat message for UI display
 */
export interface ChatMessage {
  readonly id: string;
  readonly role: 'agent' | 'user' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly isStreaming?: boolean;
}

/**
 * Streaming response part from agent
 */
export interface AgentChatResponsePart {
  type: 'start' | 'delta' | 'stop';
  text?: string;
}

/**
 * Callbacks interface for agent hooks
 */
export interface AgentCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: { source: 'user' | 'ai'; message: string }) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: { status: Status }) => void;
  onModeChange?: (mode: { mode: Mode }) => void;
  onToolLog?: (message: string) => void;
  onAgentChatResponsePart?: (responsePart: AgentChatResponsePart) => void;
  onVadScore?: (vadScore: number) => void;
}

// ============================================================================
// Tool Parameter Types
// ============================================================================

export interface LogMessageParams {
  message: string;
}

export interface DrawCardParams {
  numberOfCards: number;
}

export interface RevealCardParams {
  cardIndex: number;
}
