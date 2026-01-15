/**
 * Credits Store
 * Zustand store for managing user credits and session billing
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Credits per minute of conversation
const CREDITS_PER_MINUTE = 10;

interface CreditsState {
    // State
    balance: number;
    isLoading: boolean;
    error: string | null;
    sessionStartTime: number | null; // Timestamp when session started

    // Actions
    setBalance: (balance: number) => void;
    canStartSession: () => boolean;
    startSessionTimer: () => void;
    endSessionTimer: () => number; // Returns duration in seconds
    deductCreditsForSession: (userId: string, durationSeconds: number, sessionId?: string) => Promise<{ success: boolean; newBalance: number; error?: string }>;
    refreshBalance: (userId: string) => Promise<void>;
    reset: () => void;
}

export const useCredits = create<CreditsState>((set, get) => ({
    // Initial state
    balance: 0,
    isLoading: false,
    error: null,
    sessionStartTime: null,

    // Set balance (called when profile is fetched)
    setBalance: (balance: number) => {
        set({ balance, error: null });
    },

    // Check if user has enough credits to start a session
    canStartSession: () => {
        const { balance } = get();
        // Require at least 1 minute worth of credits
        return balance >= CREDITS_PER_MINUTE;
    },

    // Start session timer (called when session connects)
    startSessionTimer: () => {
        set({ sessionStartTime: Date.now() });
    },

    // End session timer and return duration in seconds
    endSessionTimer: () => {
        const { sessionStartTime } = get();
        if (!sessionStartTime) return 0;
        const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        set({ sessionStartTime: null });
        return durationSeconds;
    },

    // Deduct credits after a session ends
    deductCreditsForSession: async (userId: string, durationSeconds: number, sessionId?: string) => {
        const durationMinutes = Math.ceil(durationSeconds / 60); // Round up to nearest minute
        const creditsToDeduct = durationMinutes * CREDITS_PER_MINUTE;

        if (creditsToDeduct <= 0) {
            return { success: true, newBalance: get().balance };
        }

        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase.rpc('deduct_credits', {
                p_user_id: userId,
                p_amount: creditsToDeduct,
                p_description: `Session: ${durationMinutes} min`,
                p_session_id: sessionId || null,
            });

            if (error) {
                throw error;
            }

            const result = data?.[0];

            if (!result?.success) {
                const errorMsg = result?.error_message || 'Failed to deduct credits';
                set({ error: errorMsg, isLoading: false });
                return { success: false, newBalance: get().balance, error: errorMsg };
            }

            set({ balance: result.new_balance, isLoading: false });
            return { success: true, newBalance: result.new_balance };

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to deduct credits';
            set({ error: errorMsg, isLoading: false });
            return { success: false, newBalance: get().balance, error: errorMsg };
        }
    },

    // Refresh balance from database
    refreshBalance: async (userId: string) => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('credits_balance')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            set({ balance: data.credits_balance, isLoading: false, error: null });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch credits';
            set({ error: errorMsg, isLoading: false });
        }
    },

    // Reset state (on logout)
    reset: () => {
        set({ balance: 0, isLoading: false, error: null });
    },
}));
