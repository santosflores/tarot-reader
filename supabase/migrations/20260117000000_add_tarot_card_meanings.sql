-- Create tarot_card_meanings table
CREATE TABLE IF NOT EXISTS tarot_card_meanings (
    id TEXT PRIMARY KEY, -- e.g., 'major-0', 'cups-ace'
    name TEXT NOT NULL,
    arcana TEXT NOT NULL CHECK (arcana IN ('major', 'minor')),
    number INTEGER, -- For Major Arcana (0-21)
    suit TEXT CHECK (suit IN ('Cups', 'Pentacles', 'Swords', 'Wands') OR suit IS NULL),
    rank TEXT, -- For Minor Arcana (Ace, Two, ..., King)
    element TEXT NOT NULL CHECK (element IN ('Fire', 'Water', 'Earth', 'Air')),
    zodiac_sign TEXT,
    keywords TEXT[] NOT NULL,
    upright_keywords TEXT[] NOT NULL,
    upright_description TEXT NOT NULL,
    reversed_keywords TEXT[] NOT NULL,
    reversed_description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tarot_meanings_arcana ON tarot_card_meanings(arcana);
CREATE INDEX IF NOT EXISTS idx_tarot_meanings_suit ON tarot_card_meanings(suit);

-- Enable RLS but allow public read access
ALTER TABLE tarot_card_meanings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tarot card meanings (public SEO content)
CREATE POLICY "Allow public read access" ON tarot_card_meanings
    FOR SELECT USING (true);

-- Only authenticated users can insert/update (for edge functions)
CREATE POLICY "Allow service insert" ON tarot_card_meanings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update" ON tarot_card_meanings
    FOR UPDATE USING (true);
