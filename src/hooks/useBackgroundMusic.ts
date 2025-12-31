/**
 * Custom hook for managing background music
 * Plays background music in a loop and adjusts volume based on session state
 */

import { useEffect, useRef } from 'react';
import { AUDIO_PATHS } from '../config/constants';

interface UseBackgroundMusicOptions {
  /** Whether the conversation is active */
  isActive: boolean;
  /** Whether there's an active session with the agent */
  hasActiveSession?: boolean;
  /** Normal volume level when no session (0-1), default 0.3 */
  normalVolume?: number;
  /** Volume level when session is active (0-1), default 0.15 */
  sessionVolume?: number;
  /** Audio file path, defaults to AUDIO_PATHS.BACKGROUND_MUSIC */
  audioPath?: string;
}

const DEFAULT_NORMAL_VOLUME = 0.3;
const DEFAULT_SESSION_VOLUME = 0.15;
const DEFAULT_AUDIO_PATH = `${AUDIO_PATHS.BACKGROUND_MUSIC}`;

/**
 * Hook to manage background music playback
 * Automatically adjusts volume when a session is active
 */
export function useBackgroundMusic({
  isActive,
  hasActiveSession = false,
  normalVolume = DEFAULT_NORMAL_VOLUME,
  sessionVolume = DEFAULT_SESSION_VOLUME,
  audioPath = DEFAULT_AUDIO_PATH,
}: UseBackgroundMusicOptions): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const hasErrorRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      // Use absolute path to ensure correct resolution
      const fullPath = audioPath.startsWith('/') ? audioPath : `/${audioPath}`;
      
      // Create audio element first, then configure it
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = normalVolume;
      audio.crossOrigin = 'anonymous'; // Allow CORS if needed
      
      // Set src last, after all configuration
      audio.src = fullPath;
      audioRef.current = audio;

      if (import.meta.env.DEV) {
        console.log('[useBackgroundMusic] Initializing audio', {
          requestedPath: fullPath,
          actualSrc: audio.src,
          baseURI: audio.baseURI || window.location.href,
        });
      }

      // Handle audio errors with detailed information
      const handleError = () => {
        const error = audio.error;
        const actualSrcAtError = audio.src;
        const currentSrcAtError = audio.currentSrc;
        
        // Ignore errors where src is just the base URL (early initialization false alarm)
        const baseUrl = window.location.origin + '/';
        const isBaseUrlOnly = actualSrcAtError === baseUrl || 
                              actualSrcAtError === window.location.href ||
                              (actualSrcAtError.endsWith('/') && !actualSrcAtError.includes('background.mp3'));
        
        // Only treat as error if we actually have an error code AND src is properly set
        if (error && error.code !== 0) {
          if (isBaseUrlOnly) {
            // Ignore early false alarms where src isn't set yet
            if (import.meta.env.DEV) {
              console.log('[useBackgroundMusic] Ignoring early error (src not properly set yet)', {
                requestedPath: fullPath,
                audioSrc: actualSrcAtError,
              });
            }
            return; // Don't mark as error, don't log as error
          }
          
          // Real error - src is set but there's an actual problem
          hasErrorRef.current = true;
          
          let errorMessage = `Audio error (code ${error.code}): `;
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage += 'The user aborted the audio';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage += 'A network error occurred while loading the audio';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage += 'An error occurred while decoding the audio';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage += `The audio format is not supported or file not found.`;
              break;
            default:
              errorMessage += 'An unknown error occurred';
          }
          console.error('[useBackgroundMusic]', errorMessage, {
            code: error.code,
            requestedPath: fullPath,
            audioSrc: actualSrcAtError,
            currentSrc: currentSrcAtError,
            readyState: audio.readyState,
            networkState: audio.networkState,
          });
        }
      };
      
      audio.addEventListener('error', handleError);

      // Log when audio is ready
      audio.addEventListener('canplaythrough', () => {
        if (import.meta.env.DEV) {
          console.log('[useBackgroundMusic] Audio ready to play:', {
            path: audioPath,
            src: audio.src,
            currentSrc: audio.currentSrc,
          });
        }
      });

      // Log when loading starts
      audio.addEventListener('loadstart', () => {
        if (import.meta.env.DEV) {
          console.log('[useBackgroundMusic] Audio loading started:', {
            path: audioPath,
            src: audio.src,
          });
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioPath, normalVolume]);

  // Start playing music immediately on mount (page load)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isPlayingRef.current) return;

    // Don't try to play if there's an error
    if (hasErrorRef.current) {
      return;
    }

    // Function to start playing
    const startPlaying = () => {
      if (!hasErrorRef.current && audio.error === null && !isPlayingRef.current) {
        audio.play().catch((error) => {
          console.error('[useBackgroundMusic] Failed to play audio:', error);
          isPlayingRef.current = false;
        });
        isPlayingRef.current = true;
        if (import.meta.env.DEV) {
          console.log('[useBackgroundMusic] Background music started');
        }
      }
    };

    // If audio is already ready, play immediately
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlaying();
    } else {
      // Wait for audio to be ready, then play
      const handleCanPlay = () => {
        startPlaying();
        audio.removeEventListener('canplaythrough', handleCanPlay);
      };
      audio.addEventListener('canplaythrough', handleCanPlay);
      
      // Try to load the audio if not already loading
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
        audio.load();
      }
    }
  }, []); // Only run once on mount to start playing

  // Adjust volume based on session state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isActive) return;

    // Determine target volume based on session state
    const targetVolume = hasActiveSession ? sessionVolume : normalVolume;
    
    // Smooth volume transition using requestAnimationFrame for better performance
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    const duration = 300; // ms for transition
    const startTime = performance.now();
    
    const animateVolume = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out curve for smooth transition
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      
      audio.volume = startVolume + volumeChange * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animateVolume);
      } else {
        audio.volume = targetVolume; // Ensure exact target volume
      }
    };
    
    requestAnimationFrame(animateVolume);
  }, [isActive, hasActiveSession, normalVolume, sessionVolume]);
}
