
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInactivity } from '../useInactivity';

describe('useInactivity Benchmark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'clearTimeout');
    vi.spyOn(window, 'setTimeout');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should measure resetTimer calls on rapid events', () => {
    const events = ['mousemove'];
    const { result } = renderHook(() => useInactivity({ delay: 5000, events }));

    const eventCount = 1000;

    // Simulate rapid events
    act(() => {
      for (let i = 0; i < eventCount; i++) {
        window.dispatchEvent(new Event('mousemove'));
        // Advance time slightly to simulate real world, but less than delay
        vi.advanceTimersByTime(1);
      }
    });

    const clearTimeoutCount = vi.mocked(window.clearTimeout).mock.calls.length;
    console.log(`[Benchmark] clearTimeout called ${clearTimeoutCount} times for ${eventCount} events`);

    // With throttling, it should be called much less often.
    // Ideally only once (at the start) because all events happen within 1000ms.
    // The throttle limit is 1000ms.
    // In the loop, we advance 1ms per event, so total time is 1000ms.
    // So it might be called once at start, and maybe once more if we cross the 1000ms boundary.
    expect(clearTimeoutCount).toBeLessThan(50);
  });
});
