-- Fix Missing avatar_url Column in Profiles Table
-- This script adds the missing avatar_url column to prevent mobile app errors

-- Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created profiles table with avatar_url column';
    ELSE
        -- Add avatar_url column if table exists but column doesn't
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND table_schema = 'public' 
            AND column_name = 'avatar_url'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
            RAISE NOTICE 'Added avatar_url column to existing profiles table';
        ELSE
            RAISE NOTICE 'avatar_url column already exists in profiles table';
        END IF;
    END IF;
END $$;

-- Set up RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verify the fix
SELECT 'PROFILES TABLE STRUCTURE:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert/update to verify avatar_url column works
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Try to insert a test profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        test_user_id,
        'test@example.com',
        'Test User',
        'https://example.com/avatar.jpg'
    );
    
    -- Clean up test data
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'SUCCESS: avatar_url column is working correctly';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'WARNING: Issue with profiles table: %', SQLERRM;
END $$;

SELECT 'PROFILES TABLE FIX COMPLETED' as final_status;
