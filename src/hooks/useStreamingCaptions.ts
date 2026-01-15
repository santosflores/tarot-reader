import { useState, useRef, useCallback } from 'react';
import type { AgentChatResponsePart } from '../types/elevenlabs';

// ============================================================================
// Hook: useStreamingCaptions
// ============================================================================

/**
 * Hook for managing streaming captions with ID-based tracking
 * Prevents race conditions between start/delta/stop events
 */
export function useStreamingCaptions() {
    const [captions, setCaptions] = useState<string>('');

    // Refs for ID-based tracking of streamed captions
    const captionsIdRef = useRef<string | null>(null);
    const captionsTextRef = useRef<string>('');

    const handleChatResponsePart = useCallback((responsePart: AgentChatResponsePart): void => {
        if (responsePart.type === 'start') {
            // Generate new ID for this utterance
            const newId = Math.random().toString(36).substring(7);
            captionsIdRef.current = newId;
            captionsTextRef.current = '';
            setCaptions('');
        } else if (responsePart.type === 'delta') {
            // Only process if we have an active ID
            if (captionsIdRef.current && responsePart.text) {
                captionsTextRef.current += responsePart.text;
                const currentText = captionsTextRef.current;
                // Update state with confirmed full text
                setCaptions(currentText);
            }
        } else if (responsePart.type === 'stop') {
            // Clear ID to prevent late deltas
            captionsIdRef.current = null;

            // Auto-hide after delay
            setTimeout(() => {
                // Only clear if the text hasn't changed (no new utterance started)
                setCaptions((prev) => prev === captionsTextRef.current ? '' : prev);
            }, 5000);
        }
    }, []);

    const clearCaptions = useCallback((): void => {
        captionsIdRef.current = null;
        captionsTextRef.current = '';
        setCaptions('');
    }, []);

    return {
        captions,
        handleChatResponsePart,
        clearCaptions,
    };
}
