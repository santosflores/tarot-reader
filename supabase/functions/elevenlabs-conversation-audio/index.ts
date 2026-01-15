/**
 * Supabase Edge Function: ElevenLabs Conversation Audio
 * Proxies requests to ElevenLabs Conversation Audio API
 * 
 * Endpoint:
 * GET /{conversation_id} - Get conversation audio blob
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
    // Get environment variables
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client to verify auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
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
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse URL to get conversation_id
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Find conversation_id after the function name
    const functionNameIndex = pathParts.indexOf('elevenlabs-conversation-audio');
    const conversationId = functionNameIndex >= 0 && pathParts.length > functionNameIndex + 1
      ? pathParts[functionNameIndex + 1]
      : null;

    if (!conversationId || conversationId === 'elevenlabs-conversation-audio') {
      return new Response(
        JSON.stringify({ error: 'conversation_id is required in the URL path' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Forward request to ElevenLabs API
    const elevenlabsUrl = `${ELEVENLABS_API_BASE}/conversations/${conversationId}/audio`;
    
    const elevenlabsResponse = await fetch(elevenlabsUrl, {
      method: 'GET',
      headers: {
        'xi-api-key': elevenlabsApiKey,
      },
    });

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text();
      return new Response(errorText, {
        status: elevenlabsResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine content type from response or default to audio/mpeg
    const contentType = elevenlabsResponse.headers.get('content-type') || 'audio/mpeg';

    // Return the audio stream directly with appropriate headers
    return new Response(elevenlabsResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="conversation-${conversationId}.mp3"`,
      },
    });
  } catch (error) {
    console.error('Error in elevenlabs-conversation-audio function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
