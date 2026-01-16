/**
 * Supabase Edge Function: Generate Daily Horoscopes
 * 
 * Generates horoscopes for all 12 zodiac signs using Gemini API
 * with a rotating persona system (day % 3 determines which persona).
 * 
 * Trigger: Cron job or manual invocation
 * Auth: Service role (admin only, not public)
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const;

const ZODIAC_INFO: Record<string, { name: string; dates: string; element: string }> = {
    aries: { name: 'Aries', dates: 'March 21 - April 19', element: 'Fire' },
    taurus: { name: 'Taurus', dates: 'April 20 - May 20', element: 'Earth' },
    gemini: { name: 'Gemini', dates: 'May 21 - June 20', element: 'Air' },
    cancer: { name: 'Cancer', dates: 'June 21 - July 22', element: 'Water' },
    leo: { name: 'Leo', dates: 'July 23 - August 22', element: 'Fire' },
    virgo: { name: 'Virgo', dates: 'August 23 - September 22', element: 'Earth' },
    libra: { name: 'Libra', dates: 'September 23 - October 22', element: 'Air' },
    scorpio: { name: 'Scorpio', dates: 'October 23 - November 21', element: 'Water' },
    sagittarius: { name: 'Sagittarius', dates: 'November 22 - December 21', element: 'Fire' },
    capricorn: { name: 'Capricorn', dates: 'December 22 - January 19', element: 'Earth' },
    aquarius: { name: 'Aquarius', dates: 'January 20 - February 18', element: 'Air' },
    pisces: { name: 'Pisces', dates: 'February 19 - March 20', element: 'Water' },
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Persona {
    id: string;
    name: string;
    slug: string;
    system_instruction: string;
}

interface GeneratedHoroscope {
    content: string;
    title: string;
    meta_description: string;
}

/**
 * Get the persona for a given date (rotating: day of year % 3)
 */
function getPersonaIndex(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % 3;
}

/**
 * Generate horoscope content using Gemini API
 */
async function generateHoroscope(
    apiKey: string,
    persona: Persona,
    zodiacSign: string,
    date: Date
): Promise<GeneratedHoroscope> {
    const zodiacInfo = ZODIAC_INFO[zodiacSign];
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const prompt = `Write a daily horoscope for ${zodiacInfo.name} (${zodiacInfo.dates}, ${zodiacInfo.element} sign) for ${dateStr}.

Include insights about:
- Overall energy for the day
- Key opportunities or challenges
- Advice for relationships, work, or personal growth

After the horoscope, provide:
1. A catchy SEO title (max 60 characters) for this horoscope
2. A compelling meta description (max 155 characters) for SEO

Format your response exactly like this:
HOROSCOPE:
[Your horoscope text here]

TITLE:
[SEO title here]

META_DESCRIPTION:
[Meta description here]`;

    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: persona.system_instruction }]
            },
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 500,
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the response
    const horoscopeMatch = generatedText.match(/HOROSCOPE:\s*([\s\S]*?)(?=TITLE:|$)/i);
    const titleMatch = generatedText.match(/TITLE:\s*(.*?)(?=META_DESCRIPTION:|$)/is);
    const metaMatch = generatedText.match(/META_DESCRIPTION:\s*(.*?)$/is);

    const content = horoscopeMatch?.[1]?.trim() || generatedText;
    const title = titleMatch?.[1]?.trim() || `${zodiacInfo.name} Horoscope for ${date.toLocaleDateString()}`;
    const metaDescription = metaMatch?.[1]?.trim() ||
        `Read your ${zodiacInfo.name} horoscope for ${dateStr}. Daily guidance and insights from ${persona.name}.`;

    return {
        content,
        title: title.slice(0, 60),
        meta_description: metaDescription.slice(0, 155),
    };
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Create Supabase admin client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body for optional date override
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

        // Get all personas
        const { data: personas, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .order('created_at', { ascending: true });

        if (personasError || !personas || personas.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No personas found', details: personasError }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Select persona based on day rotation
        const personaIndex = getPersonaIndex(targetDate);
        const selectedPersona = personas[personaIndex % personas.length] as Persona;

        console.log(`Generating horoscopes for ${publishDate} with persona: ${selectedPersona.name}`);

        // Check for existing horoscopes for this date
        const { data: existingHoroscopes } = await supabase
            .from('horoscopes')
            .select('zodiac_sign')
            .eq('publish_date', publishDate);

        const existingSigns = new Set(existingHoroscopes?.map(h => h.zodiac_sign) || []);
        const signsToGenerate = ZODIAC_SIGNS.filter(sign => !existingSigns.has(sign));

        if (signsToGenerate.length === 0) {
            return new Response(
                JSON.stringify({
                    message: 'All horoscopes already exist for this date',
                    date: publishDate,
                    persona: selectedPersona.name
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Generate horoscopes for each missing zodiac sign
        const results: { sign: string; success: boolean; error?: string }[] = [];

        for (const sign of signsToGenerate) {
            try {
                console.log(`Generating horoscope for ${sign}...`);

                const horoscope = await generateHoroscope(
                    geminiApiKey,
                    selectedPersona,
                    sign,
                    targetDate
                );

                // Insert into database
                const { error: insertError } = await supabase
                    .from('horoscopes')
                    .insert({
                        zodiac_sign: sign,
                        persona_id: selectedPersona.id,
                        publish_date: publishDate,
                        content: horoscope.content,
                        title: horoscope.title,
                        meta_description: horoscope.meta_description,
                        status: 'draft',
                    });

                if (insertError) {
                    results.push({ sign, success: false, error: insertError.message });
                } else {
                    results.push({ sign, success: true });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                results.push({
                    sign,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return new Response(
            JSON.stringify({
                message: `Generated ${successCount} horoscopes, ${failedCount} failed`,
                date: publishDate,
                persona: selectedPersona.name,
                results,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in generate-daily-horoscopes function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
