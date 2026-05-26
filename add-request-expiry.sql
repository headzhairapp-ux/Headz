-- ============================================
-- ADD 3-DAY REQUEST EXPIRY TO USERS TABLE
-- ============================================
-- Run this script in Supabase Dashboard > SQL Editor.
-- Pending access requests must be approved within 3 days,
-- otherwise they are marked 'expired' (kept, not deleted).
-- An expired user revives the request by signing in again.
-- ============================================

-- 1. Columns: status + expiry window + approval audit trail.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS request_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by UUID;

-- 2. Backfill existing rows.
UPDATE public.users
SET request_status = 'approved'
WHERE is_approved = true
  AND (request_status IS NULL OR request_status = 'pending');

UPDATE public.users
SET request_status = 'pending',
    request_expires_at = now() + INTERVAL '3 days'
WHERE is_approved = false
  AND COALESCE(is_blocked, false) = false
  AND request_expires_at IS NULL;

-- 3. Indexes.
CREATE INDEX IF NOT EXISTS idx_users_request_status ON public.users(request_status);
CREATE INDEX IF NOT EXISTS idx_users_request_expires_at ON public.users(request_expires_at);

-- 4. Daily scheduled job that marks overdue pending requests as expired.
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.expire_stale_requests()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.users
  SET request_status = 'expired',
      updated_at = now()
  WHERE is_approved = false
    AND request_status = 'pending'
    AND request_expires_at IS NOT NULL
    AND request_expires_at < now();
$$;

SELECT cron.unschedule('expire-stale-requests')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-stale-requests');

SELECT cron.schedule(
  'expire-stale-requests',
  '0 0 * * *',
  $$SELECT public.expire_stale_requests();$$
);

-- ============================================
-- DONE! Request expiry has been configured.
-- Note: pg_cron must be enabled for your Supabase project
-- (Dashboard > Database > Extensions > pg_cron).
-- ============================================
