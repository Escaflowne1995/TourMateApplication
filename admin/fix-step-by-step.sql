-- Step-by-Step Fix for Mobile Registration to Admin Panel Sync
-- Run each section separately if you encounter any issues

-- STEP 1: Add missing columns (run this first)
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

-- STEP 2: Update existing profiles with data from auth.users (run after step 1)
UPDATE profiles 
SET 
    email = COALESCE(profiles.email, auth.users.email),
    registration_date = COALESCE(profiles.registration_date, auth.users.created_at),
    created_at = COALESCE(profiles.created_at, auth.users.created_at, NOW()),
    updated_at = COALESCE(profiles.updated_at, NOW()),
    is_active = COALESCE(profiles.is_active, true)
FROM auth.users
WHERE profiles.id = auth.users.id;

-- STEP 3: Fill in any remaining NULL values (run after step 2)
UPDATE profiles 
SET 
    created_at = COALESCE(created_at, updated_at, NOW()),
    updated_at = COALESCE(updated_at, created_at, NOW()),
    registration_date = COALESCE(registration_date, created_at, NOW()),
    is_active = COALESCE(is_active, true),
    favorite_spots = COALESCE(favorite_spots, '[]'::jsonb),
    total_reviews = COALESCE(total_reviews, 0)
WHERE created_at IS NULL OR updated_at IS NULL OR registration_date IS NULL 
   OR is_active IS NULL OR favorite_spots IS NULL OR total_reviews IS NULL;

-- STEP 4: Disable RLS for admin access (run after step 3)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 5: Create indexes (run after step 4)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_date ON profiles(registration_date);

-- STEP 6: Verify the results (run last)
SELECT 
    'Final verification' as info,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE email IS NOT NULL) as profiles_with_email,
    COUNT(*) FILTER (WHERE created_at IS NOT NULL) as profiles_with_created_at,
    COUNT(*) FILTER (WHERE is_active = true) as active_profiles
FROM profiles;
