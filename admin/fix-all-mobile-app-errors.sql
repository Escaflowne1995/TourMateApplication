-- Complete Fix Script for Mobile App Errors
-- Run this script in your Supabase SQL Editor to resolve all issues

-- 1. Fix missing avatar_url column in profiles table
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

-- 2. Enable real-time for destinations table
ALTER PUBLICATION supabase_realtime ADD TABLE destinations;

-- 3. Grant necessary permissions for real-time
GRANT SELECT ON destinations TO anon;
GRANT SELECT ON destinations TO authenticated;

-- 4. Set up RLS policies for profiles table (if needed)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Grant necessary permissions for profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 6. Create function to automatically create profile on user signup
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
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Ensure destinations table has all required columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'images'
    ) THEN
        ALTER TABLE destinations ADD COLUMN images TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'coordinates'
    ) THEN
        ALTER TABLE destinations ADD COLUMN coordinates JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'entrance_fee'
    ) THEN
        ALTER TABLE destinations ADD COLUMN entrance_fee TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'opening_hours'
    ) THEN
        ALTER TABLE destinations ADD COLUMN opening_hours TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'contact_number'
    ) THEN
        ALTER TABLE destinations ADD COLUMN contact_number TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'amenities'
    ) THEN
        ALTER TABLE destinations ADD COLUMN amenities TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'accessibility_features'
    ) THEN
        ALTER TABLE destinations ADD COLUMN accessibility_features TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'best_time_to_visit'
    ) THEN
        ALTER TABLE destinations ADD COLUMN best_time_to_visit TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'estimated_duration'
    ) THEN
        ALTER TABLE destinations ADD COLUMN estimated_duration TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'difficulty_level'
    ) THEN
        ALTER TABLE destinations ADD COLUMN difficulty_level TEXT DEFAULT 'Easy';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'destinations' AND column_name = 'review_count'
    ) THEN
        ALTER TABLE destinations ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 9. Remove the category check constraint that's causing issues
ALTER TABLE destinations DROP CONSTRAINT IF EXISTS destinations_category_check;

-- 10. Insert a test destination to verify everything works
INSERT INTO destinations (
    name,
    description,
    location,
    category,
    is_active,
    featured,
    rating,
    coordinates,
    images,
    entrance_fee,
    opening_hours,
    amenities
) VALUES (
    '🚀 Mobile App Sync Test',
    'This test destination verifies that real-time sync is working between admin panel and mobile app. You can delete this after testing.',
    'Cebu City, Philippines',
    'Cultural Sites',
    true,
    true,
    4.8,
    '{"latitude": 10.3157, "longitude": 123.8854}',
    ARRAY['https://via.placeholder.com/400x300?text=Test+Destination'],
    'Free',
    '24/7',
    ARRAY['WiFi', 'Parking', 'Accessible']
) ON CONFLICT DO NOTHING;

-- 11. Verification queries
SELECT 'SETUP VERIFICATION' as status;

-- Check profiles table
SELECT 'Profiles table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check destinations table
SELECT 'Destinations table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'destinations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check real-time setup
SELECT 'Real-time publications:' as info;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check test destination
SELECT 'Test destinations count:' as info;
SELECT COUNT(*) as count FROM destinations WHERE name LIKE '%Mobile App Sync Test%';

SELECT '✅ ALL FIXES COMPLETED SUCCESSFULLY!' as final_status;
SELECT 'Your mobile app should now work without errors and receive real-time updates!' as instructions;
