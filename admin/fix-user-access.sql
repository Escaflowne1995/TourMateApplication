-- Fix User Access for Admin Panel
-- This script ensures admin can access user profiles and adds sample data

-- 1. First, ensure the profiles table has all required columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Philippines';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_spots JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add email unique constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- 3. Temporarily disable RLS to allow admin access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Or create a policy that allows admin access (alternative approach)
-- Uncomment these lines if you prefer to keep RLS enabled:
/*
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create admin access policy
DROP POLICY IF EXISTS "Admin can access all profiles" ON profiles;
CREATE POLICY "Admin can access all profiles" ON profiles
    FOR ALL USING (true);
*/

-- 5. Handle the foreign key constraint issue
-- Option A: Remove the foreign key constraint (if it exists)
DO $$ 
BEGIN
    -- Check if the foreign key constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint profiles_id_fkey';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        RAISE NOTICE 'Foreign key constraint profiles_id_fkey does not exist';
END $$;

-- Option B: Change the id column to not reference auth.users
-- Make sure id is not referencing auth.users for admin-managed profiles
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 6. Insert sample users for testing (only if they don't exist)
-- First, let's check if there are any existing profiles
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    -- Only insert sample data if table is empty or has very few records
    IF profile_count < 3 THEN
        INSERT INTO profiles (
            id, name, email, full_name, phone, address, gender, location, country, 
            birth_date, is_active, registration_date, last_login, total_reviews, favorite_spots
        ) VALUES 
        (
            gen_random_uuid(),
            'John Doe',
            'john.doe@email.com',
            'John Patrick Doe',
            '+63 912 345 6789',
            'Lahug, Cebu City',
            'male',
            'Cebu City',
            'Philippines',
            '1995-03-15',
            true,
            '2024-01-15T00:00:00Z',
            '2024-03-01T10:30:00Z',
            5,
            '["temple-of-leah", "sirao-garden"]'::jsonb
        ),
        (
            gen_random_uuid(),
            'Maria Santos',
            'maria.santos@email.com',
            'Maria Isabella Santos',
            '+63 917 123 4567',
            'Banilad, Cebu City',
            'female',
            'Cebu City',
            'Philippines',
            '1988-07-22',
            true,
            '2024-02-01T00:00:00Z',
            '2024-03-02T14:20:00Z',
            3,
            '["magellan-cross", "basilica"]'::jsonb
        ),
        (
            gen_random_uuid(),
            'Carlos Reyes',
            'carlos.reyes@email.com',
            'Carlos Miguel Reyes',
            '+63 905 987 6543',
            'Talamban, Cebu City',
            'male',
            'Cebu City',
            'Philippines',
            '1992-11-08',
            false,
            '2024-01-20T00:00:00Z',
            '2024-02-28T16:45:00Z',
            1,
            '["kawasan-falls"]'::jsonb
        ),
        (
            gen_random_uuid(),
            'Ana Rodriguez',
            'ana.rodriguez@email.com',
            'Ana Marie Rodriguez',
            '+63 920 111 2222',
            'IT Park, Cebu City',
            'female',
            'Cebu City',
            'Philippines',
            '1990-05-12',
            true,
            '2024-02-15T00:00:00Z',
            '2024-03-03T09:15:00Z',
            8,
            '["temple-of-leah", "tops-lookout", "sirao-garden"]'::jsonb
        ),
        (
            gen_random_uuid(),
            'Mark Johnson',
            'mark.johnson@email.com',
            'Mark Anthony Johnson',
            '+1 555 123 4567',
            '123 Main St, California',
            'male',
            'Los Angeles',
            'United States',
            '1985-09-30',
            true,
            '2024-01-10T00:00:00Z',
            '2024-03-01T20:30:00Z',
            12,
            '["magellan-cross", "basilica", "fort-san-pedro", "colon-street"]'::jsonb
        )
        ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Sample users inserted successfully';
    ELSE
        RAISE NOTICE 'Profiles table already has data (% records), skipping sample data insertion', profile_count;
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- 7. Update statistics
ANALYZE profiles;

-- Verify the setup
SELECT 
    'Profiles table setup completed' as status,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_users
FROM profiles;
