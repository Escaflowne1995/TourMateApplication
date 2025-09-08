-- Quick fix for destinations not loading in admin panel
-- This disables Row Level Security (RLS) on the destinations table
-- Run this in your Supabase SQL editor

ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable RLS on delicacies table if you plan to manage them
-- ALTER TABLE delicacies DISABLE ROW LEVEL SECURITY;

-- Note: This is safe for development but consider proper RLS policies for production
