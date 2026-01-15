import { useState, useEffect, useRef } from 'react';

/**
 * Hook to simulate a typewriter effect for streaming text
 * Smooths out the display of text chunks to mimic natural reading/speaking speed
 * 
 * @param streamedText The full text string that is growing over time
 * @param speedMs Speed in milliseconds per character (default: 30ms)
 * @returns The text to display
 */
export function useTypewriter(streamedText: string, speedMs: number = 30) {
    const [displayedText, setDisplayedText] = useState("");

    // Debug logging
    useEffect(() => {
        if (streamedText) {
            console.log('[useTypewriter] New streamedText:', streamedText.substring(0, 50) + '...', 'Length:', streamedText.length);
        }
    }, [streamedText]);

    // Use refs to track state without resetting the interval
    const targetTextRef = useRef(streamedText);
    const indexRef = useRef(0);
    const prevTextRef = useRef(""); // To track content changes

    // Keep the target text ref in sync with the prop
    useEffect(() => {
        targetTextRef.current = streamedText;

        // Logic to detect if we switched to a NEW sentence entirely (Replay mode) vs appending (Streaming mode)
        const isExtension = streamedText.startsWith(prevTextRef.current);
        const isReset = streamedText.length === 0;

        if (isReset) {
            setDisplayedText("");
            indexRef.current = 0;
        } else if (!isExtension) {
            // Content changed entirely (e.g. next sentence in replay)
            // Reset typing from scratch for the new text
            setDisplayedText("");
            indexRef.current = 0;
        } else if (streamedText.length < indexRef.current) {
            // Edge case: Text shrank but is still a "prefix" (maybe explicit undo?)
            // Just snap to it
            indexRef.current = streamedText.length;
            setDisplayedText(streamedText);
        }

        prevTextRef.current = streamedText;
    }, [streamedText]);

    useEffect(() => {
        const timer = setInterval(() => {
            const currentTarget = targetTextRef.current;

            if (indexRef.current < currentTarget.length) {
                const nextChar = currentTarget.charAt(indexRef.current);
                setDisplayedText((prev) => prev + nextChar);
                indexRef.current++;
            }
        }, speedMs);

        return () => clearInterval(timer);
    }, [speedMs]);

    return displayedText;
}
