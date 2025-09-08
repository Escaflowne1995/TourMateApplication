-- Simple Fix for Mobile Registration Sync
-- This version avoids potential auth.users access issues

-- Add all missing columns
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

-- Fill in default values for existing records
UPDATE profiles 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW()),
    registration_date = COALESCE(registration_date, NOW()),
    is_active = COALESCE(is_active, true),
    favorite_spots = COALESCE(favorite_spots, '[]'::jsonb),
    total_reviews = COALESCE(total_reviews, 0),
    country = COALESCE(country, 'Philippines')
WHERE created_at IS NULL OR updated_at IS NULL OR registration_date IS NULL 
   OR is_active IS NULL OR favorite_spots IS NULL OR total_reviews IS NULL;

-- Disable RLS for admin access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Show results
SELECT 
    'Fix completed' as status,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE created_at IS NOT NULL) as profiles_with_created_at,
    COUNT(*) FILTER (WHERE is_active = true) as active_profiles
FROM profiles;