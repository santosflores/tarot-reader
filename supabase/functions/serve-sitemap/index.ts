
/**
 * Supabase Edge Function: Serve Sitemap
 * 
 * Generates a dynamic XML sitemap for all published horoscopes.
 * Point your Google Search Console to this URL.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const BASE_URL = 'https://tarotreads.ai'; // Replace with your actual production URL

serve(async (req: Request) => {
    try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Fetch all published horoscopes
        // Limit to last 1000 to keep sitemap manageable, or implement pagination if needed
        const { data: horoscopes, error } = await supabase
            .from('horoscopes')
            .select('publish_date, zodiac_sign, updated_at')
            .eq('status', 'published')
            .order('publish_date', { ascending: false })
            .limit(5000);

        if (error) {
            throw error;
        }

        // Static routes
        const staticRoutes = [
            '',
            '/horoscope',
            '/app',
            '/login',
            '/signup'
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static routes
        staticRoutes.forEach(route => {
            sitemap += `
    <url>
        <loc>${BASE_URL}${route}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        // Add dynamic horoscope routes
        horoscopes?.forEach(h => {
            sitemap += `
    <url>
        <loc>${BASE_URL}/horoscope/${h.publish_date}/${h.zodiac_sign}</loc>
        <lastmod>${new Date(h.updated_at).toISOString()}</lastmod>
        <changefreq>never</changefreq>
        <priority>0.6</priority>
    </url>`;
        });

        // Add daily index pages (unique dates)
        const dates = [...new Set(horoscopes?.map(h => h.publish_date))];
        dates.forEach(date => {
            sitemap += `
    <url>
        <loc>${BASE_URL}/horoscope/${date}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>`;
        });

        sitemap += `
</urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Sitemap error:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
});
