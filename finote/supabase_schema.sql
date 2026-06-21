-- ============================================================
-- FINOTE — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (project > SQL Editor)
-- ============================================================

-- ─────────────────────────────────────
-- 1. TRANSACTIONS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      BIGINT NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────
-- 2. SAVINGS GOALS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  target_amount  BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount BIGINT NOT NULL DEFAULT 0,
  deadline       DATE,
  color          TEXT NOT NULL DEFAULT '#6366F1',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings_goals(user_id);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────
-- 3. MEMOS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  is_todo      BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  color        TEXT NOT NULL DEFAULT 'indigo',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memos_user_id ON public.memos(user_id);
CREATE INDEX IF NOT EXISTS idx_memos_pinned ON public.memos(is_pinned DESC);

ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memos"
  ON public.memos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memos"
  ON public.memos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memos"
  ON public.memos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memos"
  ON public.memos FOR DELETE
  USING (auth.uid() = user_id);
