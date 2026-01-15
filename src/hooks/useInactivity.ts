/**
 * Hook to track user inactivity
 * Returns true after specified delay of inactivity
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { throttle } from '../utils/throttle';

interface UseInactivityOptions {
  delay: number; // milliseconds
  events?: string[]; // events to listen to
}

export function useInactivity({ delay, events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] }: UseInactivityOptions) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, delay);
  }, [delay]);

  // Throttle resetTimer to run at most once per second
  const throttledResetTimer = useMemo(() => throttle(resetTimer, 1000), [resetTimer]);

  useEffect(() => {
    // Start the timer
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, delay);

    // Add event listeners
    events.forEach((event) => {
      globalThis.addEventListener(event, throttledResetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        globalThis.removeEventListener(event, throttledResetTimer);
      });
    };
  }, [delay, events, throttledResetTimer]);

  return isInactive;
}
