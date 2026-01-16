/**
 * Supabase Edge Function: Track Horoscope View
 * 
 * Public endpoint (no auth required) to track horoscope page views.
 * Used for analytics and persona performance measurement.
 * 
 * Body params:
 * - horoscope_id: UUID of the horoscope being viewed
 * - referrer: (optional) Referrer URL
 * - clicked_tarot_cta: (optional) Whether user clicked the tarot reader CTA
 * - session_duration_seconds: (optional) How long user stayed on page
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackViewRequest {
    horoscope_id: string;
    referrer?: string;
    clicked_tarot_cta?: boolean;
    session_duration_seconds?: number;
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }

    try {
        // Create Supabase admin client (service role for inserting)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body
        const body: TrackViewRequest = await req.json();

        if (!body.horoscope_id) {
            return new Response(
                JSON.stringify({ error: 'horoscope_id is required' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Get horoscope details for the view record
        const { data: horoscope, error: horoscopeError } = await supabase
            .from('horoscopes')
            .select('persona_id, zodiac_sign')
            .eq('id', body.horoscope_id)
            .single();

        if (horoscopeError || !horoscope) {
            return new Response(
                JSON.stringify({ error: 'Horoscope not found' }),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Get user agent from request headers
        const userAgent = req.headers.get('user-agent') || null;

        // Insert view record
        const { error: insertError } = await supabase
            .from('horoscope_views')
            .insert({
                horoscope_id: body.horoscope_id,
                persona_id: horoscope.persona_id,
                zodiac_sign: horoscope.zodiac_sign,
                referrer: body.referrer || null,
                clicked_tarot_cta: body.clicked_tarot_cta || false,
                session_duration_seconds: body.session_duration_seconds || null,
                user_agent: userAgent,
            });

        if (insertError) {
            console.error('Failed to track view:', insertError);
            return new Response(
                JSON.stringify({ error: 'Failed to track view' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in track-horoscope-view function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
