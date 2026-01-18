/**
 * Conversation Replay Component
 * Displays and replays a conversation with synchronized transcript highlighting
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import {
  fetchConversationDetails,
  fetchConversationAudio,
  createAudioUrlFromBlob,
  revokeAudioUrl,
} from "@/utils/elevenlabsApi";
import type { ConversationDetails } from "@/types/elevenlabs";

/** Time range representing when the agent is speaking */
interface AgentSpeakingRange {
  start: number;
  end: number;
}

interface ConversationReplayProps {
  conversationId: string;
  onClose?: () => void;
}

export function ConversationReplay({
  conversationId,
  onClose,
}: ConversationReplayProps) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const audioUrlRef = useRef<string | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const highlightedElementRef = useRef<HTMLDivElement>(null);

  const {
    setupAudioPlayer,
    playAudio: playAudioFromStore,
    audioPlayer,
    isAudioPlaying,
    setAgentSpeaking,
  } = useChatbot();

  // Filter agent messages from transcript for highlighting
  const agentMessages =
    conversation?.transcript.filter((msg) => msg.role === "agent") || [];

  /**
   * Calculate time ranges when the agent is speaking.
   * Each agent message starts at its time_in_call_secs and ends when the next message starts.
   */
  const agentSpeakingRanges = useMemo((): AgentSpeakingRange[] => {
    if (!conversation?.transcript || conversation.transcript.length === 0) {
      return [];
    }

    const transcript = conversation.transcript;
    const ranges: AgentSpeakingRange[] = [];

    for (let i = 0; i < transcript.length; i++) {
      const msg = transcript[i];
      if (msg.role === "agent" && typeof msg.time_in_call_secs === "number") {
        const start = msg.time_in_call_secs;
        // End time is the start of the next message, or use duration as fallback
        let end: number;
        if (i + 1 < transcript.length && typeof transcript[i + 1].time_in_call_secs === "number") {
          end = transcript[i + 1].time_in_call_secs!;
        } else {
          // Last message - use duration or estimate based on content
          end = duration > 0 ? duration : start + 30; // Fallback: assume 30 seconds
        }
        ranges.push({ start, end });
      }
    }

    return ranges;
  }, [conversation?.transcript, duration]);

  // Initialize audio player
  useEffect(() => {
    setupAudioPlayer();
  }, [setupAudioPlayer]);

  // Fetch conversation details and audio
  useEffect(() => {
    let cancelled = false;

    const loadConversation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch conversation details
        const details = await fetchConversationDetails(conversationId);

        if (cancelled) return;

        if (!details.has_audio || !details.has_response_audio) {
          setError(
            "This conversation does not have audio available for replay."
          );
          setLoading(false);
          return;
        }

        setConversation(details);

        // Fetch audio blob
        const audioBlob = await fetchConversationAudio(conversationId);

        if (cancelled) {
          revokeAudioUrl(createAudioUrlFromBlob(audioBlob));
          return;
        }

        const url = createAudioUrlFromBlob(audioBlob);
        setAudioUrl(url);
        audioUrlRef.current = url;

        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load conversation";
        setError(errorMessage);
        setLoading(false);
        console.error("[ConversationReplay] Error loading conversation:", err);
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
      // Cleanup audio URL on unmount
      if (audioUrlRef.current) {
        revokeAudioUrl(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [conversationId]);

  // Set up audio player event listeners and time tracking
  useEffect(() => {
    if (!audioPlayer || !audioUrl) return;

    const handleTimeUpdate = () => {
      if (audioPlayer) {
        const currentPlayTime = audioPlayer.currentTime;
        setCurrentTime(currentPlayTime);
        setDuration(audioPlayer.duration || 0);

        // Check if current time is within any agent speaking range
        const isInAgentRange = agentSpeakingRanges.some(
          (range) => currentPlayTime >= range.start && currentPlayTime < range.end
        );
        setAgentSpeaking(isInAgentRange);

        // Calculate which agent message should be highlighted
        // Simple approach: divide audio duration by number of agent messages
        if (audioPlayer.duration && agentMessages.length > 0) {
          const timePerMessage = audioPlayer.duration / agentMessages.length;
          const currentIndex = Math.floor(
            audioPlayer.currentTime / timePerMessage
          );
          const clampedIndex = Math.min(currentIndex, agentMessages.length - 1);
          setHighlightedIndex(clampedIndex);
        }
      }
    };

    const handlePlaying = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setAgentSpeaking(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHighlightedIndex(-1);
      setAgentSpeaking(false);
    };

    const handleLoadedMetadata = () => {
      if (audioPlayer) {
        setDuration(audioPlayer.duration || 0);
      }
    };

    audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.addEventListener("playing", handlePlaying);
    audioPlayer.addEventListener("pause", handlePause);
    audioPlayer.addEventListener("ended", handleEnded);
    audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.removeEventListener("playing", handlePlaying);
      audioPlayer.removeEventListener("pause", handlePause);
      audioPlayer.removeEventListener("ended", handleEnded);
      audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioPlayer, audioUrl, agentMessages.length, agentSpeakingRanges, setAgentSpeaking]);

  // Auto-scroll to highlighted message
  useEffect(() => {
    if (highlightedElementRef.current && transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      const element = highlightedElementRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is outside visible area
      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedIndex]);

  // Sync with store's isAudioPlaying state
  useEffect(() => {
    setIsPlaying(isAudioPlaying);
  }, [isAudioPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!audioUrl || !audioPlayer) return;

    if (isPlaying) {
      audioPlayer.pause();
    } else {
      if (audioPlayer.src !== audioUrl) {
        // Audio source changed, need to set it again
        playAudioFromStore(audioUrl);
      } else {
        audioPlayer.play().catch((err) => {
          console.error("[ConversationReplay] Error playing audio:", err);
          setError("Failed to play audio");
        });
      }
    }
  }, [audioUrl, audioPlayer, isPlaying, playAudioFromStore]);

  const handleStop = useCallback(() => {
    if (!audioPlayer) return;

    // Stop and reset audio
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer.src = '';

    // Reset all related states
    setIsPlaying(false);
    setCurrentTime(0);
    setHighlightedIndex(-1);
    setAgentSpeaking(false);
  }, [audioPlayer, setAgentSpeaking]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate which transcript index corresponds to highlighted agent message
  const getTranscriptIndexForAgentMessage = (agentIndex: number): number => {
    if (agentIndex < 0 || !conversation) return -1;

    let agentCount = 0;
    for (let i = 0; i < conversation.transcript.length; i++) {
      if (conversation.transcript[i].role === "agent") {
        if (agentCount === agentIndex) {
          return i;
        }
        agentCount++;
      }
    }
    return -1;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-purple-300/80">
              Loading conversation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-red-400/30 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-2">
          <div className="text-red-400 text-sm">⚠️</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-red-200 mb-1">
              Error loading conversation
            </div>
            <div className="text-xs text-red-300/80 mb-2">{error}</div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs font-medium text-red-300 hover:text-red-200 underline hover:no-underline transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation || !audioUrl) {
    return null;
  }

  const highlightedTranscriptIndex =
    getTranscriptIndexForAgentMessage(highlightedIndex);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-purple-200">
          Replaying Conversation
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors"
            title="Close replay"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Playback Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            disabled={!audioUrl}
            className="flex items-center justify-center w-8 h-8 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleStop}
            disabled={!audioUrl || (!isPlaying && currentTime === 0)}
            className="flex items-center justify-center w-8 h-8 bg-slate-600 hover:bg-slate-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 rounded-full text-white transition-colors"
            title="Stop"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
              <rect width="10" height="10" x="3" y="3" rx="1" />
            </svg>
          </button>
          <div className="flex-1 text-xs text-purple-300/80">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-100"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {/* Transcript */}
      <div
        className="max-h-[400px] overflow-y-auto space-y-2 pr-1"
        ref={transcriptContainerRef}
      >
        {conversation.transcript.length === 0 ? (
          <div className="text-center py-6 text-xs text-purple-300/60">
            No transcript available
          </div>
        ) : (
          conversation.transcript.map((message, index) => {
            const isHighlighted =
              index === highlightedTranscriptIndex && message.role === "agent";
            const isAgent = message.role === "agent";

            return (
              <div
                key={index}
                ref={isHighlighted ? highlightedElementRef : null}
                className={`p-2 rounded-lg border transition-all ${isHighlighted
                  ? "bg-purple-900/50 border-purple-400/60 shadow-lg shadow-purple-900/30"
                  : isAgent
                    ? "bg-slate-700/30 border-purple-400/20"
                    : "bg-slate-700/20 border-slate-600/20"
                  }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`text-xs font-medium ${isAgent ? "text-purple-300" : "text-blue-300"
                      }`}
                  >
                    {message.role === "agent" ? "Guide" : "Seeker"}:
                  </div>
                  <div
                    className={`text-xs flex-1 ${isHighlighted
                      ? "text-white"
                      : isAgent
                        ? "text-purple-200/90"
                        : "text-gray-300/90"
                      }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
