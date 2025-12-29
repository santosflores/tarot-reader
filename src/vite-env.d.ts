/// <reference types="vite/client" />

/**
 * Environment variable type definitions
 * Provides TypeScript IntelliSense for import.meta.env
 */
interface ImportMetaEnv {
  /** Supabase project URL */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anonymous/public key */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** ElevenLabs Agent ID for Agents Platform */
  readonly VITE_ELEVENLABS_AGENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
