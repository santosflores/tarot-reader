
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseQuery } from '../useSupabase';
import { useState, useEffect } from 'react';

// Mock Supabase client
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockThen = vi.fn();

// Mock the implementation of the promise chain
const mockQueryBuilder = {
  select: mockSelect,
  eq: mockEq,
  order: mockOrder,
  limit: mockLimit,
  then: mockThen
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder)
  }
}));

describe('useSupabaseQuery Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation to return data
    mockThen.mockImplementation((resolve) => {
        resolve({ data: [], error: null });
    });
  });

  it('fetches data on mount', async () => {
    renderHook(() => useSupabaseQuery('test_table'));

    // Wait for the effect to run
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch if options object is recreated but content is same', async () => {
    let renderCount = 0;

    // A component that forces re-renders
    function useTestHook() {
      const [count, setCount] = useState(0);

      // Force re-render periodically
      useEffect(() => {
        if (count < 3) {
            setCount(c => c + 1);
        }
      }, [count]);

      renderCount++;

      // Pass a new object literal every time
      return useSupabaseQuery('test_table', {
        filter: { column: 'id', value: 123 }
      });
    }

    renderHook(() => useTestHook());

    // Wait for the effect to run multiple times
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    // WITH OPTIMIZATION: It should only call select 1 time (initial mount).
    expect(mockSelect.mock.calls.length).toBe(1);

    console.log('Render count:', renderCount);
    console.log('Select count:', mockSelect.mock.calls.length);
  });
});
