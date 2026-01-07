/**
 * Supabase Edge Function: ElevenLabs Conversations
 * Proxies requests to ElevenLabs Conversations API
 * 
 * Endpoints:
 * GET /?agent_id=xxx&user_id=xxx - List conversations
 * GET /{conversation_id} - Get conversation details
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

    // Parse URL to determine endpoint
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Check if this is a specific conversation request
    // Pattern: /functions/v1/elevenlabs-conversations/{conversation_id}
    // The last part should be the conversation_id if it exists and is not the function name
    const functionNameIndex = pathParts.indexOf('elevenlabs-conversations');
    const conversationId = functionNameIndex >= 0 && pathParts.length > functionNameIndex + 1
      ? pathParts[functionNameIndex + 1]
      : null;

    let elevenlabsUrl: string;
    const method = 'GET';

    if (!conversationId || conversationId === 'elevenlabs-conversations') {
      // List conversations endpoint
      const agentId = url.searchParams.get('agent_id');
      const userId = url.searchParams.get('user_id') || user.id;
      const pageSize = url.searchParams.get('page_size') || '10';
      const summaryMode = url.searchParams.get('summary_mode') || 'exclude';

      if (!agentId) {
        return new Response(
          JSON.stringify({ error: 'agent_id query parameter is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const queryParams = new URLSearchParams({
        agent_id: agentId,
        user_id: userId,
        page_size: pageSize,
        summary_mode: summaryMode,
      });

      elevenlabsUrl = `${ELEVENLABS_API_BASE}/conversations?${queryParams.toString()}`;
    } else {
      // Get conversation details endpoint
      elevenlabsUrl = `${ELEVENLABS_API_BASE}/conversations/${conversationId}`;
    }

    // Forward request to ElevenLabs API
    const elevenlabsResponse = await fetch(elevenlabsUrl, {
      method,
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await elevenlabsResponse.text();
    
    if (!elevenlabsResponse.ok) {
      return new Response(data, {
        status: elevenlabsResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in elevenlabs-conversations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
