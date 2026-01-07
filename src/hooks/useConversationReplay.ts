
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
export interface AgentSpeakingRange {
  start: number;
  end: number;
}

export function useConversationReplay(conversationId: string | null) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioUrlRef = useRef<string | null>(null);

  const {
    setupAudioPlayer,
    playAudio: playAudioFromStore,
    audioPlayer,
    isAudioPlaying,
    setAgentSpeaking,
    activeReplayId
  } = useChatbot();



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
    if (!conversationId) {
      setConversation(null);
      setAudioUrl(null);
      return;
    }

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
        console.error("[useConversationReplay] Error loading conversation:", err);
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
      // Cleanup audio URL on unmount/change
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
      // Only process updates if this is the active conversation
      if (activeReplayId !== conversationId) return;

      if (audioPlayer) {
        const currentPlayTime = audioPlayer.currentTime;
        setCurrentTime(currentPlayTime);
        setDuration(audioPlayer.duration || 0);

        // Check if current time is within any agent speaking range
        const isInAgentRange = agentSpeakingRanges.some(
          (range) => currentPlayTime >= range.start && currentPlayTime < range.end
        );
        setAgentSpeaking(isInAgentRange);
      }
    };

    const handlePlaying = () => {
      if (activeReplayId === conversationId) {
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      if (activeReplayId === conversationId) {
        setIsPlaying(false);
        setAgentSpeaking(false);
      }
    };

    const handleEnded = () => {
      if (activeReplayId === conversationId) {
        setIsPlaying(false);
        setCurrentTime(0);
        setAgentSpeaking(false);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioPlayer && activeReplayId === conversationId) {
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
  }, [audioPlayer, audioUrl, agentSpeakingRanges, setAgentSpeaking, activeReplayId, conversationId]);

  // Sync with store's isAudioPlaying state
  useEffect(() => {
    if (activeReplayId === conversationId) {
      setIsPlaying(isAudioPlaying);
    }
  }, [isAudioPlaying, activeReplayId, conversationId]);

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
          console.error("[useConversationReplay] Error playing audio:", err);
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
    setAgentSpeaking(false);
  }, [audioPlayer, setAgentSpeaking]);

  const seek = useCallback((time: number) => {
    if (!audioPlayer) return;
    audioPlayer.currentTime = time;
    setCurrentTime(time);
  }, [audioPlayer]);

  return {
    conversation,
    loading,
    error,
    isPlaying,
    currentTime,
    duration,
    handlePlayPause,
    handleStop,
    seek,
    audioUrl,
    agentSpeakingRanges
  };
}
