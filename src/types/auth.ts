import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile, UserProfileUpdate } from './supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: UserProfileUpdate) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}
