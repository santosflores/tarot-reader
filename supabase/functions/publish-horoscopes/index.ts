/**
 * Supabase Edge Function: Publish Horoscopes
 * 
 * Updates horoscope status from 'draft' to 'published'.
 * Can be triggered manually or via cron job.
 * 
 * Body params (optional):
 * - date: ISO date string (defaults to today)
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

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
        // Create Supabase admin client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body for optional date
        let targetDate = new Date();
        try {
            const body = await req.json();
            if (body.date) {
                targetDate = new Date(body.date);
            }
        } catch {
            // No body or invalid JSON, use today's date
        }

        // Format date for database (YYYY-MM-DD)
        const publishDate = targetDate.toISOString().split('T')[0];

        // Update all draft horoscopes for this date to published
        const { data, error, count } = await supabase
            .from('horoscopes')
            .update({
                status: 'published',
                updated_at: new Date().toISOString()
            })
            .eq('publish_date', publishDate)
            .eq('status', 'draft')
            .select();

        if (error) {
            return new Response(
                JSON.stringify({ error: 'Failed to publish horoscopes', details: error }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        return new Response(
            JSON.stringify({
                message: `Published ${data?.length || 0} horoscopes`,
                date: publishDate,
                published: data?.map(h => h.zodiac_sign) || [],
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in publish-horoscopes function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
