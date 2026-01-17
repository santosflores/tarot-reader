/**
 * Supabase Edge Function: Generate Tarot Card Meanings
 * 
 * Generates meanings for all 78 tarot cards using Google Gemini SDK.
 * Supports batch generation with filtering by arcana/suit.
 * 
 * Trigger: Manual invocation from admin panel
 * Auth: Service role (admin only, not public)
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const MINOR_RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

function getMajorArcanaName(number: number): string {
    const names = [
        'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
        'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
        'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
        'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
        'Judgement', 'The World'
    ];
    return names[number] || `Card ${number}`;
}

function getMajorArcanaElement(number: number): string {
    const elements: Record<number, string> = {
        0: 'Air', 1: 'Air', 2: 'Water', 3: 'Earth', 4: 'Fire',
        5: 'Earth', 6: 'Air', 7: 'Water', 8: 'Fire', 9: 'Earth',
        10: 'Fire', 11: 'Air', 12: 'Water', 13: 'Water', 14: 'Fire',
        15: 'Earth', 16: 'Fire', 17: 'Air', 18: 'Water', 19: 'Fire',
        20: 'Fire', 21: 'Earth'
    };
    return elements[number] || 'Fire';
}

function getMajorArcanaZodiac(number: number): string | null {
    const zodiac: Record<number, string> = {
        1: 'Mercury', 2: 'Moon', 3: 'Venus', 4: 'Aries', 5: 'Taurus',
        6: 'Gemini', 7: 'Cancer', 8: 'Leo', 9: 'Virgo', 10: 'Jupiter',
        11: 'Libra', 12: 'Neptune', 13: 'Scorpio', 14: 'Sagittarius',
        15: 'Capricorn', 16: 'Mars', 17: 'Aquarius', 18: 'Pisces',
        19: 'Sun', 20: 'Pluto', 21: 'Saturn'
    };
    return zodiac[number] || null;
}

function getMinorArcanaCards(suit: string, element: string) {
    return MINOR_RANKS.map((rank) => ({
        id: `${suit.toLowerCase()}-${rank.toLowerCase()}`,
        name: `${rank} of ${suit}`,
        arcana: 'minor' as const,
        number: null,
        suit,
        rank,
        element,
        zodiacSign: null,
    }));
}

// All 78 tarot cards
const TAROT_CARDS = [
    // Major Arcana (22 cards)
    ...Array.from({ length: 22 }, (_, i) => ({
        id: `major-${i}`,
        name: getMajorArcanaName(i),
        arcana: 'major' as const,
        number: i,
        suit: null,
        rank: null,
        element: getMajorArcanaElement(i),
        zodiacSign: getMajorArcanaZodiac(i),
    })),
    // Minor Arcana - Cups (14 cards)
    ...getMinorArcanaCards('Cups', 'Water'),
    // Minor Arcana - Pentacles (14 cards)
    ...getMinorArcanaCards('Pentacles', 'Earth'),
    // Minor Arcana - Swords (14 cards)
    ...getMinorArcanaCards('Swords', 'Air'),
    // Minor Arcana - Wands (14 cards)
    ...getMinorArcanaCards('Wands', 'Fire'),
];

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TarotCard {
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    number: number | null;
    suit: string | null;
    rank: string | null;
    element: string;
    zodiacSign: string | null;
}

/**
 * Generate tarot card meaning using Google Gemini SDK
 * Returns full markdown content for the card
 */
async function generateMeaning(ai: GoogleGenAI, card: TarotCard): Promise<string> {
    const cardType = card.arcana === 'major'
        ? `Major Arcana card ${card.number}`
        : `${card.suit} suit, ${card.rank}`;

    const prompt = `You are an expert tarot reader. Write a comprehensive, detailed, and insightful guide for the tarot card "${card.name}" (${cardType}, Element: ${card.element}).

Write in markdown format. The content should be around 300-400 words and include:
- An introduction to the card's core meaning and symbolism
- What the card represents when drawn upright
- What the card represents when reversed
- Key themes and life areas this card relates to

Use rich, descriptive language that helps readers understand the depth of this card. Write in a warm, mystical but accessible tone.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });

    const text = response.text || '';

    console.log(`[Debug] Response for ${card.name}: ${text.slice(0, 100)}...`);

    if (!text) {
        console.error(`[Error] Empty response for ${card.name}`);
        throw new Error('Empty response from Gemini');
    }

    return text;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Google Gemini SDK
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body for optional filters
        let filter: { arcana?: string; suit?: string } = {};
        try {
            const body = await req.json();
            filter = body;
        } catch {
            // No body, generate all
        }

        // Get existing cards
        const { data: existingCards } = await supabase
            .from('tarot_card_meanings')
            .select('id');

        const existingIds = new Set(existingCards?.map(c => c.id) || []);

        // Filter cards to generate
        let cardsToGenerate = TAROT_CARDS.filter(c => !existingIds.has(c.id));

        if (filter.arcana) {
            cardsToGenerate = cardsToGenerate.filter(c => c.arcana === filter.arcana);
        }
        if (filter.suit) {
            cardsToGenerate = cardsToGenerate.filter(c => c.suit === filter.suit);
        }

        if (cardsToGenerate.length === 0) {
            return new Response(
                JSON.stringify({ message: 'All requested cards already exist', existing: existingIds.size }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Generating meanings for ${cardsToGenerate.length} cards using gemini-3-flash-preview...`);

        const results: { id: string; success: boolean; error?: string }[] = [];

        for (const card of cardsToGenerate) {
            try {
                console.log(`Generating meaning for ${card.name}...`);

                const content = await generateMeaning(ai, card);

                const { error: insertError } = await supabase
                    .from('tarot_card_meanings')
                    .upsert({
                        id: card.id,
                        name: card.name,
                        arcana: card.arcana,
                        number: card.number,
                        suit: card.suit,
                        rank: card.rank,
                        element: card.element,
                        zodiac_sign: card.zodiacSign,
                        content: content,
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) {
                    results.push({ id: card.id, success: false, error: insertError.message });
                } else {
                    results.push({ id: card.id, success: true });
                }

                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 600));
            } catch (error) {
                results.push({
                    id: card.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return new Response(
            JSON.stringify({
                message: `Generated ${successCount} meanings, ${failedCount} failed`,
                total: cardsToGenerate.length,
                results,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in generate-tarot-meanings function:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
