-- ============================================================
-- Fix: pending signup requests invisible to super-admin.
--
-- The `is_blocked` column was added to public.users manually
-- without a DEFAULT, so new signups got is_blocked = NULL. The
-- super-admin pending queries filter `is_blocked = false`, and in
-- Postgres `NULL = false` is NULL (not true), so every brand-new
-- signup was silently excluded from the Approve Requests tab.
--
-- This migration (1) backfills stuck NULL rows to false so they
-- become visible again, and (2) sets a DEFAULT so it can't recur.
-- ============================================================

-- Ensure the column exists (no-op if it already does).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Prevent recurrence: new rows default to not-blocked.
ALTER TABLE public.users
  ALTER COLUMN is_blocked SET DEFAULT false;

-- Un-hide existing requests stuck with is_blocked = NULL.
UPDATE public.users
SET is_blocked = false
WHERE is_blocked IS NULL;
