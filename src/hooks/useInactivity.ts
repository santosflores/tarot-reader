/**
 * Hook to track user inactivity
 * Returns true after specified delay of inactivity
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityOptions {
  delay: number; // milliseconds
  events?: string[]; // events to listen to
}

export function useInactivity({ delay, events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] }: UseInactivityOptions) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, delay);
  }, [delay]);

  useEffect(() => {
    // Start the timer
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, delay);

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [delay, events, resetTimer]);

  return isInactive;
}
