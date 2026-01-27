-- SQL Migration: Create get_super_admin_stats function
-- Run this in your Supabase SQL Editor to enable database-level aggregation

-- Create a PostgreSQL function that returns aggregated stats
-- This calculates totals at the database level using SUM(), which is more efficient
-- than fetching all users and summing in JavaScript

CREATE OR REPLACE FUNCTION get_super_admin_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'totalDownloads', (SELECT COALESCE(SUM(download_count), 0) FROM users),
    'totalShares', (SELECT COALESCE(SUM(share_count), 0) FROM users),
    'totalGenerations', (SELECT COALESCE(SUM(generation_count), 0) FROM users),
    'maleFavoriteStyle', (
      SELECT style_name FROM generations
      WHERE gender = 'male' AND style_name IS NOT NULL
      GROUP BY style_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'femaleFavoriteStyle', (
      SELECT style_name FROM generations
      WHERE gender = 'female' AND style_name IS NOT NULL
      GROUP BY style_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- The function will be called via RPC, and super admin check happens in the app
GRANT EXECUTE ON FUNCTION get_super_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_super_admin_stats() TO anon;
