import { useEffect, useRef } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { safeAsync } from '../../utils/errors';

export const AudioController = () => {
    const setupAudioPlayerRef = useRef<(() => void) | null>(null);

    // Initialize audio player on mount (only once)
    useEffect(() => {
        if (!setupAudioPlayerRef.current) {
            setupAudioPlayerRef.current = useChatbot.getState().setupAudioPlayer;
            safeAsync(
                async () => {
                    setupAudioPlayerRef.current?.();
                },
                'Failed to initialize audio player'
            );
        }

        // Cleanup on unmount
        return () => {
            useChatbot.getState().cleanup();
        };
    }, []);

    return null;
};
