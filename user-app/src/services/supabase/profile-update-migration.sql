-- Update profiles table to include all necessary fields
-- This script adds missing columns to the existing profiles table

-- Add missing columns to profiles table (safe to run multiple times)
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add birth_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date TEXT;
    END IF;

    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender TEXT;
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country TEXT;
    END IF;

    -- Add zip_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'zip_code') THEN
        ALTER TABLE profiles ADD COLUMN zip_code TEXT;
    END IF;

    -- Update the updated_at column to be more specific if it's just updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at' 
                   AND data_type = 'timestamp with time zone') THEN
        ALTER TABLE profiles ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;
        ALTER TABLE profiles ALTER COLUMN updated_at SET DEFAULT NOW();
    END IF;

    RAISE NOTICE 'Profiles table updated successfully with all necessary columns!';
END $$;

-- Ensure RLS is still enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they're up to date
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Profile table schema update completed successfully!';
    RAISE NOTICE 'You can now save full profile data including: full_name, phone, location, avatar_url, birth_date, gender, country, zip_code';
END $$;
