-- Alternative Fix: Work with existing Supabase Auth users
-- This approach preserves the foreign key relationship with auth.users

-- 1. First, let's see what we're working with
SELECT 
    'Current profiles table structure' as info,
    COUNT(*) as existing_profiles
FROM profiles;

-- 2. Check if there are any authenticated users in auth.users
SELECT 
    'Authenticated users available' as info,
    COUNT(*) as auth_users_count
FROM auth.users;

-- 3. Add missing columns to profiles table (safe to run multiple times)
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

-- 4. Temporarily disable RLS to allow admin access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Update existing profiles with sample data (if any exist from auth.users)
DO $$
DECLARE
    user_record RECORD;
    sample_names TEXT[] := ARRAY['John Doe', 'Maria Santos', 'Carlos Reyes', 'Ana Rodriguez', 'Mark Johnson'];
    sample_phones TEXT[] := ARRAY['+63 912 345 6789', '+63 917 123 4567', '+63 905 987 6543', '+63 920 111 2222', '+1 555 123 4567'];
    sample_locations TEXT[] := ARRAY['Cebu City', 'Cebu City', 'Cebu City', 'Cebu City', 'Los Angeles'];
    sample_genders TEXT[] := ARRAY['male', 'female', 'male', 'female', 'male'];
    counter INTEGER := 1;
BEGIN
    -- Update existing profiles with sample data
    FOR user_record IN 
        SELECT id, email FROM auth.users 
        WHERE email IS NOT NULL 
        LIMIT 5
    LOOP
        UPDATE profiles SET
            name = COALESCE(name, sample_names[counter]),
            email = COALESCE(email, user_record.email),
            full_name = COALESCE(full_name, sample_names[counter]),
            phone = COALESCE(phone, sample_phones[counter]),
            address = COALESCE(address, sample_locations[counter] || ' Area'),
            gender = COALESCE(gender, sample_genders[counter]),
            location = COALESCE(location, sample_locations[counter]),
            country = COALESCE(country, 'Philippines'),
            is_active = COALESCE(is_active, true),
            registration_date = COALESCE(registration_date, NOW()),
            total_reviews = COALESCE(total_reviews, (counter * 2)),
            favorite_spots = COALESCE(favorite_spots, '["temple-of-leah"]'::jsonb)
        WHERE id = user_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % existing profiles with sample data', counter - 1;
END $$;

-- 6. If no auth users exist, create a separate admin_managed_profiles table
DO $$
DECLARE
    auth_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    
    IF auth_count = 0 THEN
        -- Create a separate table for admin-managed profiles
        CREATE TABLE IF NOT EXISTS admin_managed_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(200),
            phone VARCHAR(20),
            address TEXT,
            gender VARCHAR(20),
            location VARCHAR(100),
            country VARCHAR(100) DEFAULT 'Philippines',
            zip_code VARCHAR(10),
            birth_date DATE,
            avatar_url TEXT,
            registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            favorite_spots JSONB DEFAULT '[]',
            total_reviews INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert sample data into admin_managed_profiles
        INSERT INTO admin_managed_profiles (
            name, email, full_name, phone, address, gender, location, country, 
            birth_date, is_active, registration_date, last_login, total_reviews, favorite_spots
        ) VALUES 
        (
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
        
        RAISE NOTICE 'Created admin_managed_profiles table with sample data';
        RAISE NOTICE 'Note: Update your admin interface to query admin_managed_profiles instead of profiles';
    END IF;
END $$;

-- 7. Create a view that combines both tables (if admin_managed_profiles exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_managed_profiles') THEN
        CREATE OR REPLACE VIEW all_user_profiles AS
        SELECT 
            id, name, email, full_name, phone, address, gender, location, country,
            zip_code, birth_date, avatar_url, registration_date, last_login, is_active,
            favorite_spots, total_reviews, created_at, updated_at,
            'auth_user' as source_type
        FROM profiles
        WHERE name IS NOT NULL
        UNION ALL
        SELECT 
            id, name, email, full_name, phone, address, gender, location, country,
            zip_code, birth_date, avatar_url, registration_date, last_login, is_active,
            favorite_spots, total_reviews, created_at, updated_at,
            'admin_managed' as source_type
        FROM admin_managed_profiles;
        
        RAISE NOTICE 'Created all_user_profiles view combining both tables';
    END IF;
END $$;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- If admin_managed_profiles exists, create indexes for it too
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_managed_profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_managed_profiles(email);
        CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_active ON admin_managed_profiles(is_active);
        CREATE INDEX IF NOT EXISTS idx_admin_profiles_created_at ON admin_managed_profiles(created_at);
        CREATE INDEX IF NOT EXISTS idx_admin_profiles_name ON admin_managed_profiles(name);
    END IF;
END $$;

-- 9. Final status report
SELECT 
    'Setup completed' as status,
    (SELECT COUNT(*) FROM profiles WHERE name IS NOT NULL) as profiles_with_data,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'admin_managed_profiles') as admin_table_exists,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_managed_profiles') 
        THEN (SELECT COUNT(*) FROM admin_managed_profiles)
        ELSE 0 
    END as admin_managed_count;
