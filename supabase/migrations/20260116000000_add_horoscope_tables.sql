-- =========================================
-- Migration: Add Horoscope Tables
-- Created: 2026-01-16
-- Description: Tables for daily horoscopes with rotating personas for SEO
-- =========================================

-- =========================================
-- Personas table for horoscope writers
-- =========================================
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  system_instruction TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public read, admin write)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Public can read personas
CREATE POLICY "Anyone can view personas"
  ON personas FOR SELECT
  USING (true);

-- =========================================
-- Horoscopes table for daily content
-- =========================================
CREATE TABLE IF NOT EXISTS horoscopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zodiac_sign TEXT NOT NULL CHECK (zodiac_sign IN (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  )),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  publish_date DATE NOT NULL,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (zodiac_sign, publish_date)
);

-- Enable RLS (public read published, admin write)
ALTER TABLE horoscopes ENABLE ROW LEVEL SECURITY;

-- Public can read published horoscopes
CREATE POLICY "Anyone can view published horoscopes"
  ON horoscopes FOR SELECT
  USING (status = 'published');

-- Create index for common queries
CREATE INDEX idx_horoscopes_publish_date ON horoscopes(publish_date);
CREATE INDEX idx_horoscopes_zodiac_sign ON horoscopes(zodiac_sign);
CREATE INDEX idx_horoscopes_status ON horoscopes(status);

-- =========================================
-- Horoscope views for analytics
-- =========================================
CREATE TABLE IF NOT EXISTS horoscope_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horoscope_id UUID NOT NULL REFERENCES horoscopes(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  zodiac_sign TEXT NOT NULL,
  referrer TEXT,
  clicked_tarot_cta BOOLEAN DEFAULT false,
  session_duration_seconds INTEGER,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public insert for tracking, admin read)
ALTER TABLE horoscope_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can track views"
  ON horoscope_views FOR INSERT
  WITH CHECK (true);

-- Create indexes for analytics queries
CREATE INDEX idx_horoscope_views_persona ON horoscope_views(persona_id);
CREATE INDEX idx_horoscope_views_zodiac ON horoscope_views(zodiac_sign);
CREATE INDEX idx_horoscope_views_viewed_at ON horoscope_views(viewed_at);

-- =========================================
-- Seed the 3 personas
-- =========================================
INSERT INTO personas (name, slug, system_instruction, description) VALUES
(
  'Luna Mystique',
  'luna-mystique',
  'You are Luna Mystique, an ancient oracle who speaks through the veil of stars. Your horoscopes are poetic, mystical, and deeply spiritual. Use imagery of celestial bodies, cosmic energy, and universal wisdom. Your tone is gentle yet profound, like moonlight illuminating hidden truths. Write in second person, addressing the reader directly. Keep the horoscope between 100-150 words.',
  'An ancient oracle who speaks through the veil of stars, offering poetic and mystical guidance from the cosmos.'
),
(
  'Marcus Stellar',
  'marcus-stellar',
  'You are Marcus Stellar, a pragmatic cosmic advisor who translates celestial movements into actionable guidance. Your horoscopes are direct, empowering, and focused on personal growth. Use clear language with motivational energy. Your tone is confident and supportive, like a trusted mentor. Write in second person, addressing the reader directly. Keep the horoscope between 100-150 words.',
  'A pragmatic cosmic advisor who translates celestial movements into clear, actionable guidance for personal growth.'
),
(
  'Celeste Faye',
  'celeste-faye',
  'You are Celeste Faye, a compassionate soul guide who reads the stars with maternal wisdom. Your horoscopes are warm, nurturing, and emotionally resonant. Focus on relationships, self-care, and emotional wellbeing. Your tone is comforting and understanding, like a wise friend. Write in second person, addressing the reader directly. Keep the horoscope between 100-150 words.',
  'A compassionate soul guide who reads the stars with warmth and wisdom, focusing on emotional wellbeing and relationships.'
);
