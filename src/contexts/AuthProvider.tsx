/**
 * Auth Provider Component
 * Provides authentication state and methods globally
 */

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { UserProfile, UserProfileUpdate } from '../types/supabase';
import { AuthContext, AuthContextType } from './AuthContext';
import { useRevealedCard } from '../hooks/useRevealedCard';
import { useAnimation } from '../hooks/useAnimation';
import { useChatbot } from '../hooks/useChatbot';
import { useCamera } from '../hooks/useCamera';
import { DEFAULT_ANIMATION } from '../config/animations';
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '../config/camera';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile (non-blocking)
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false); // Set loading to false immediately after session check
        }

        // Fetch profile asynchronously (non-blocking)
        if (session?.user) {
          fetchProfile(session.user.id).then((profileData) => {
            if (mounted && profileData) {
              setProfile(profileData);
            }
          });
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Always set loading to false when auth state changes

        // Fetch profile asynchronously (non-blocking)
        if (session?.user) {
          fetchProfile(session.user.id).then((profileData) => {
            if (mounted && profileData) {
              setProfile(profileData);
            }
          });
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Immediately update state on successful sign-in to avoid race condition
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
      setLoading(false);
      // Fetch profile asynchronously, don't block navigation
      fetchProfile(data.user.id).then((profileData) => {
        if (profileData) {
          setProfile(profileData);
        }
      });
    }
    
    return { error: error ? new Error(error.message) : null };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    // Check if email confirmation is required
    const needsConfirmation = !error && data.user && !data.session;

    return {
      error: error ? new Error(error.message) : null,
      needsConfirmation: needsConfirmation ?? false,
    };
  }, []);

  const signOut = useCallback(async () => {
    // Clean up session-related state before signing out
    try {
      // Clear revealed cards
      useRevealedCard.getState().clearRevealedCards();
      
      // Reset animation to default
      useAnimation.getState().setCurrentAnimation(DEFAULT_ANIMATION);
      
      // Reset camera to default position and FOV
      useCamera.getState().setCameraPosition(DEFAULT_CAMERA_POSITION);
      useCamera.getState().setCameraFov(DEFAULT_CAMERA_FOV);
      
      // Clean up audio/chatbot state
      useChatbot.getState().cleanup();
      
      // Clear any localStorage items related to the session
      // (Add any other localStorage keys that need clearing)
      const keysToRemove: string[] = [];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove localStorage key: ${key}`, e);
        }
      });
    } catch (cleanupError) {
      console.error('Error during session cleanup:', cleanupError);
      // Continue with sign out even if cleanup fails
    }
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setProfile(null);
      setUser(null);
      setSession(null);
    }
    return { error: error ? new Error(error.message) : null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updateProfile = useCallback(async (updates: UserProfileUpdate) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { error: new Error(error.message) };
    }

    setProfile(data);
    return { error: null };
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  }, [user, fetchProfile]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
