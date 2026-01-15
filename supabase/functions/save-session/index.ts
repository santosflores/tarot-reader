/**
 * Supabase Edge Function: Save Session
 * Fetches conversation transcript from ElevenLabs and saves it to the database
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1/convai';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { conversation_id } = await req.json();

        if (!conversation_id) {
            return new Response(
                JSON.stringify({ error: 'conversation_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get environment variables
        const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

        if (!elevenlabsApiKey) {
            throw new Error('ELEVENLABS_API_KEY not configured');
        }

        // Verify user is authenticated
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch conversation details from ElevenLabs
        const elevenlabsResponse = await fetch(
            `${ELEVENLABS_API_BASE}/conversations/${conversation_id}`,
            {
                headers: {
                    'xi-api-key': elevenlabsApiKey,
                },
            }
        );

        if (!elevenlabsResponse.ok) {
            const errorText = await elevenlabsResponse.text();
            throw new Error(`Failed to fetch from ElevenLabs: ${errorText}`);
        }

        const conversationData = await elevenlabsResponse.json();
        const { transcript, metadata, analysis } = conversationData;

        // Calculate start/end times (approximate from metadata or current time if missing)
        // ElevenLabs API usually returns duration or timestamps in transcript
        // For now, use current time as ended_at, and calculate started_at from duration if available
        const ended_at = new Date().toISOString();
        const durationSec = metadata?.duration_secs || 0;
        const started_at = new Date(Date.now() - durationSec * 1000).toISOString();

        // Insert into reading_sessions
        const { error: dbError } = await supabase
            .from('reading_sessions')
            .insert({
                user_id: user.id,
                elevenlabs_conversation_id: conversation_id,
                started_at,
                ended_at,
                transcript: transcript || [],
                metadata: { ...metadata, analysis },
                summary: analysis?.summary || null, // If ElevenLabs provides summary
            });

        if (dbError) {
            throw dbError;
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in save-session function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
