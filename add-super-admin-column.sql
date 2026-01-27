-- Add is_super_admin column to users table
-- Run this migration in your Supabase SQL Editor

-- Add the is_super_admin column with default value of false
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON public.users(is_super_admin);

-- To set a user as super admin, run:
-- UPDATE public.users SET is_super_admin = true WHERE email = 'your-email@example.com';
