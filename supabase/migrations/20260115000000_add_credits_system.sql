-- Migration: Add Credits System
-- Description: Adds credits_balance to user_profiles and creates credit_transactions table
-- Date: 2026-01-15

-- ============================================================================
-- Add credits_balance to user_profiles
-- ============================================================================

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 100 NOT NULL;

COMMENT ON COLUMN public.user_profiles.credits_balance IS 'Current credit balance for the user. 10 credits = 1 minute of conversation.';

-- ============================================================================
-- Create credit_transactions table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Positive for additions, negative for deductions
    balance_after INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'purchase', 'deduction', 'bonus', 'refund'
    description TEXT,
    session_id UUID REFERENCES public.reading_sessions(id) ON DELETE SET NULL, -- Link to session if deduction
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.credit_transactions IS 'Audit log of all credit transactions';

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert (via Edge Functions)
CREATE POLICY "Service role can insert credit transactions"
    ON public.credit_transactions
    FOR INSERT
    WITH CHECK (true); -- Will be restricted by service_role usage

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at DESC);

-- ============================================================================
-- Function: deduct_credits
-- Atomically deducts credits with safety checks
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Validate input
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'Amount must be positive'::TEXT;
        RETURN;
    END IF;

    -- Lock the row and get current balance
    SELECT credits_balance INTO v_current_balance
    FROM public.user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'User not found'::TEXT;
        RETURN;
    END IF;

    -- Check sufficient balance
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, v_current_balance, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Update balance
    UPDATE public.user_profiles
    SET credits_balance = v_new_balance
    WHERE id = p_user_id;

    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        description,
        session_id
    ) VALUES (
        p_user_id,
        -p_amount,
        v_new_balance,
        'deduction',
        COALESCE(p_description, 'Session usage'),
        p_session_id
    );

    RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$;

-- ============================================================================
-- Function: add_credits
-- Adds credits to a user (for purchases, bonuses, refunds)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Validate input
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'Amount must be positive'::TEXT;
        RETURN;
    END IF;

    IF p_transaction_type NOT IN ('purchase', 'bonus', 'refund') THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'Invalid transaction type'::TEXT;
        RETURN;
    END IF;

    -- Update balance and get new value
    UPDATE public.user_profiles
    SET credits_balance = credits_balance + p_amount
    WHERE id = p_user_id
    RETURNING credits_balance INTO v_new_balance;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'User not found'::TEXT;
        RETURN;
    END IF;

    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        description
    ) VALUES (
        p_user_id,
        p_amount,
        v_new_balance,
        p_transaction_type,
        p_description
    );

    RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits TO service_role;

-- Grant table permissions
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
