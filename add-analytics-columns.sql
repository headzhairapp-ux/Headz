-- ============================================
-- ADD ANALYTICS TRACKING COLUMNS TO USERS TABLE
-- ============================================
-- Run this script in Supabase Dashboard > SQL Editor
-- to add analytics tracking to existing database
-- ============================================

-- Add download_count column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Add share_count column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Add custom_prompt_count column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS custom_prompt_count INTEGER DEFAULT 0;

-- Add generation_count column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS generation_count INTEGER DEFAULT 0;

-- ============================================
-- DONE! Analytics columns have been added.
-- ============================================
