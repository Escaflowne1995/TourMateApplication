-- Cebu Tourist App Admin Panel Database Setup
-- This script creates all necessary tables and functions for the admin panel

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- ADMIN USERS AND AUTHENTICATION
-- ========================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'manager')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admin_users(id)
);

-- ========================================
-- USER PROFILES (Enhanced for admin management)
-- ========================================

-- Update existing profiles table or create if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    address TEXT,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    location VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Philippines',
    zip_code VARCHAR(10),
    birth_date DATE,
    avatar_url TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DESTINATIONS
-- ========================================

CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    coordinates JSONB, -- {latitude: number, longitude: number}
    images TEXT[], -- Array of image URLs
    entrance_fee VARCHAR(100),
    opening_hours VARCHAR(200),
    contact_number VARCHAR(20),
    website VARCHAR(500),
    amenities TEXT[], -- Array of amenities
    accessibility_features TEXT[], -- Array of accessibility features
    best_time_to_visit TEXT,
    estimated_duration VARCHAR(50),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Easy', 'Moderate', 'Difficult')),
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id)
);

-- ========================================
-- DELICACIES
-- ========================================

CREATE TABLE IF NOT EXISTS delicacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    restaurant VARCHAR(200) NOT NULL,
    restaurant_location VARCHAR(200),
    price VARCHAR(100),
    price_range JSONB, -- {min: number, max: number, currency: string}
    images TEXT[], -- Array of image URLs
    ingredients TEXT[], -- Array of ingredients
    allergens TEXT[], -- Array of allergens
    spice_level VARCHAR(20),
    cooking_method VARCHAR(100),
    preparation_time VARCHAR(50),
    serving_size VARCHAR(50),
    calories_per_serving INTEGER,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_halal BOOLEAN DEFAULT false,
    availability VARCHAR(100),
    best_time_to_eat VARCHAR(100),
    cultural_significance TEXT,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id)
);

-- ========================================
-- REVIEWS AND RATINGS
-- ========================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('destination', 'delicacy')),
    entity_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    images TEXT[], -- Array of review image URLs
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- USER FAVORITES
-- ========================================

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('destination', 'delicacy')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

-- ========================================
-- ADMIN ACTIVITY LOG
-- ========================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ANALYTICS VIEWS
-- ========================================

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
    COUNT(CASE WHEN gender = 'male' AND is_active = true THEN 1 END) as male_users,
    COUNT(CASE WHEN gender = 'female' AND is_active = true THEN 1 END) as female_users,
    COUNT(CASE WHEN gender IN ('other', 'prefer_not_to_say') AND is_active = true THEN 1 END) as other_gender,
    COUNT(CASE WHEN registration_date >= CURRENT_DATE - INTERVAL '30 days' AND is_active = true THEN 1 END) as new_users_last_30_days,
    COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' AND is_active = true THEN 1 END) as active_users_last_7_days
FROM profiles;

-- Content statistics view
CREATE OR REPLACE VIEW content_statistics AS
SELECT 
    (SELECT COUNT(*) FROM destinations WHERE is_active = true) as total_destinations,
    (SELECT COUNT(*) FROM destinations WHERE is_active = false) as inactive_destinations,
    (SELECT COUNT(*) FROM destinations WHERE featured = true AND is_active = true) as featured_destinations,
    (SELECT COUNT(*) FROM delicacies WHERE is_active = true) as total_delicacies,
    (SELECT COUNT(*) FROM delicacies WHERE is_active = false) as inactive_delicacies,
    (SELECT COUNT(*) FROM delicacies WHERE featured = true AND is_active = true) as featured_delicacies,
    (SELECT COUNT(*) FROM reviews WHERE is_approved = true) as total_reviews,
    (SELECT COUNT(*) FROM user_favorites) as total_favorites;

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delicacies_updated_at BEFORE UPDATE ON delicacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update rating statistics
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update destination ratings
        IF NEW.entity_type = 'destination' THEN
            UPDATE destinations 
            SET 
                rating = (SELECT AVG(rating) FROM reviews WHERE entity_type = 'destination' AND entity_id = NEW.entity_id AND is_approved = true),
                review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'destination' AND entity_id = NEW.entity_id AND is_approved = true)
            WHERE id = NEW.entity_id;
        END IF;
        
        -- Update delicacy ratings
        IF NEW.entity_type = 'delicacy' THEN
            UPDATE delicacies 
            SET 
                rating = (SELECT AVG(rating) FROM reviews WHERE entity_type = 'delicacy' AND entity_id = NEW.entity_id AND is_approved = true),
                review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'delicacy' AND entity_id = NEW.entity_id AND is_approved = true)
            WHERE id = NEW.entity_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update destination ratings
        IF OLD.entity_type = 'destination' THEN
            UPDATE destinations 
            SET 
                rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE entity_type = 'destination' AND entity_id = OLD.entity_id AND is_approved = true), 0),
                review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'destination' AND entity_id = OLD.entity_id AND is_approved = true)
            WHERE id = OLD.entity_id;
        END IF;
        
        -- Update delicacy ratings
        IF OLD.entity_type = 'delicacy' THEN
            UPDATE delicacies 
            SET 
                rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE entity_type = 'delicacy' AND entity_id = OLD.entity_id AND is_approved = true), 0),
                review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'delicacy' AND entity_id = OLD.entity_id AND is_approved = true)
            WHERE id = OLD.entity_id;
        END IF;
        
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER update_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_rating_stats();

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_registration_date ON profiles(registration_date);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Destinations indexes
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON destinations(rating);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location);

-- Delicacies indexes
CREATE INDEX IF NOT EXISTS idx_delicacies_category ON delicacies(category);
CREATE INDEX IF NOT EXISTS idx_delicacies_is_active ON delicacies(is_active);
CREATE INDEX IF NOT EXISTS idx_delicacies_featured ON delicacies(featured);
CREATE INDEX IF NOT EXISTS idx_delicacies_rating ON delicacies(rating);
CREATE INDEX IF NOT EXISTS idx_delicacies_restaurant ON delicacies(restaurant);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type ON reviews(entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_id ON reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity_type ON user_favorites(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity_id ON user_favorites(entity_id);

-- Admin activity log indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin users can only see themselves unless they're super_admin
CREATE POLICY "Admin users access policy" ON admin_users
    FOR ALL USING (
        id = current_setting('app.current_admin_id')::uuid OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = current_setting('app.current_admin_id')::uuid 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Cebu Tourist App Admin Database Setup Complete!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- admin_users (Admin authentication)';
    RAISE NOTICE '- profiles (Enhanced user profiles)';
    RAISE NOTICE '- destinations (Tourist destinations)';
    RAISE NOTICE '- delicacies (Local food items)';
    RAISE NOTICE '- reviews (User reviews and ratings)';
    RAISE NOTICE '- user_favorites (User favorite items)';
    RAISE NOTICE '- admin_activity_log (Admin actions)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '- user_statistics (User analytics)';
    RAISE NOTICE '- content_statistics (Content analytics)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Insert initial admin user';
    RAISE NOTICE '2. Populate sample data';
    RAISE NOTICE '3. Configure application settings';
    RAISE NOTICE '===========================================';
END $$;
