import { useState, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types/elevenlabs';

// ============================================================================
// Utility Functions
// ============================================================================

const generateMessageId = (): string =>
    `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// ============================================================================
// Hook: useAgentMessages
// ============================================================================

/**
 * Hook for managing chat messages with streaming support
 * Uses ID-based tracking for robust state updates
 */
export function useAgentMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // Track the current streaming message ID using a ref for robust targeting
    const streamingMessageIdRef = useRef<string | null>(null);
    const streamingTextRef = useRef<string>('');
    // Track if we handled the current response via streaming (to prevent duplicates from onMessage)
    const handledViaStreamingRef = useRef<boolean>(false);

    const addMessage = useCallback((role: ChatMessage['role'], content: string): void => {
        if (!content || !content.trim()) return;

        setMessages((prev) => [
            ...prev,
            {
                id: generateMessageId(),
                role,
                content,
                timestamp: new Date(),
            },
        ]);
    }, []);

    const startStreamingMessage = useCallback((): void => {
        // Mark that we're handling this response via streaming
        handledViaStreamingRef.current = true;

        // Generate ID and reset text synchronously
        const newId = generateMessageId();
        streamingMessageIdRef.current = newId;
        streamingTextRef.current = '';

        setMessages((prev) => [
            ...prev,
            {
                id: newId,
                role: 'agent' as const,
                content: '',
                timestamp: new Date(),
                isStreaming: true,
            },
        ]);
    }, []);

    const appendStreamingText = useCallback((text: string): void => {
        if (!streamingMessageIdRef.current) return;

        // Update ref immediately
        streamingTextRef.current += text;
        const currentId = streamingMessageIdRef.current;
        const currentContent = streamingTextRef.current;

        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id === currentId && msg.isStreaming) {
                    return { ...msg, content: currentContent };
                }
                return msg;
            })
        );
    }, []);

    const finalizeStreamingMessage = useCallback((): void => {
        if (!streamingMessageIdRef.current) return;

        const currentId = streamingMessageIdRef.current;
        const finalContent = streamingTextRef.current;

        setMessages((prev) => {
            // If the message has no content (empty bubble), remove it entirely
            if (!finalContent.trim()) {
                return prev.filter((msg) => msg.id !== currentId);
            }

            // Otherwise, mark it as not streaming
            return prev.map((msg) => {
                if (msg.id === currentId) {
                    return { ...msg, content: finalContent, isStreaming: false };
                }
                return msg;
            });
        });

        streamingMessageIdRef.current = null;
        streamingTextRef.current = '';
    }, []);

    const isStreaming = useCallback((): boolean => {
        return streamingMessageIdRef.current !== null;
    }, []);

    // Check if the current response was handled via streaming (and reset the flag)
    const wasHandledViaStreaming = useCallback((): boolean => {
        const handled = handledViaStreamingRef.current;
        handledViaStreamingRef.current = false;
        return handled;
    }, []);

    return {
        messages,
        addMessage,
        startStreamingMessage,
        appendStreamingText,
        finalizeStreamingMessage,
        isStreaming,
        wasHandledViaStreaming,
    };
}
