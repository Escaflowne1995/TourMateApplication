-- Fix Missing created_at Column in Profiles Table
-- This script safely adds the missing created_at column to the profiles table

-- Check current table structure first
SELECT 
    'Current profiles table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Add the missing created_at column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also ensure updated_at exists (just in case)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update any existing records that have NULL created_at values
UPDATE profiles 
SET created_at = COALESCE(registration_date, updated_at, NOW())
WHERE created_at IS NULL;

-- Update any existing records that have NULL updated_at values
UPDATE profiles 
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Verify the fix
SELECT 
    'Profiles table after fix' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- Show sample data to verify
SELECT 
    'Sample profiles data' as info,
    id,
    name,
    email,
    created_at,
    updated_at
FROM profiles 
LIMIT 5;
