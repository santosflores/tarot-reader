-- Simplify tarot_card_meanings table to use a single content column
-- Drops the separate keyword/description columns and adds a unified content field

ALTER TABLE public.tarot_card_meanings 
  DROP COLUMN IF EXISTS keywords,
  DROP COLUMN IF EXISTS upright_keywords,
  DROP COLUMN IF EXISTS upright_description,
  DROP COLUMN IF EXISTS reversed_keywords,
  DROP COLUMN IF EXISTS reversed_description;

ALTER TABLE public.tarot_card_meanings
  ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.tarot_card_meanings.content IS 'Full markdown content describing the card meaning';
