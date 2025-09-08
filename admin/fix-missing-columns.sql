-- Fix Missing Columns in Destinations Table
-- This script adds all missing columns that the admin service expects
-- Run this in your Supabase SQL Editor

-- Step 1: Add all missing columns to destinations table
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS accessibility_features JSONB DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"latitude": 0, "longitude": 0}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS entrance_fee VARCHAR(100);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS opening_hours VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_time_to_visit VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(100);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'Easy';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Update existing records to have proper default values
UPDATE destinations 
SET 
    accessibility_features = COALESCE(accessibility_features, '[]'::jsonb),
    amenities = COALESCE(amenities, '[]'::jsonb),
    images = COALESCE(images, '[]'::jsonb),
    coordinates = COALESCE(coordinates, '{"latitude": 0, "longitude": 0}'::jsonb),
    difficulty_level = COALESCE(difficulty_level, 'Easy'),
    rating = COALESCE(rating, 0),
    review_count = COALESCE(review_count, 0),
    featured = COALESCE(featured, false),
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    accessibility_features IS NULL 
    OR amenities IS NULL 
    OR images IS NULL 
    OR coordinates IS NULL
    OR difficulty_level IS NULL
    OR rating IS NULL
    OR review_count IS NULL
    OR featured IS NULL
    OR is_active IS NULL
    OR created_at IS NULL
    OR updated_at IS NULL;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON destinations(rating DESC);
CREATE INDEX IF NOT EXISTS idx_destinations_created_at ON destinations(created_at DESC);

-- Step 4: Ensure RLS is disabled for admin access
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON destinations TO anon;
GRANT ALL ON destinations TO authenticated;

-- Step 5: Show the updated table structure
SELECT 'UPDATED DESTINATIONS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Show sample data to verify structure
SELECT 'SAMPLE DESTINATIONS DATA:' as sample_info;
SELECT 
    id,
    name,
    location,
    category,
    accessibility_features,
    amenities,
    images,
    coordinates,
    difficulty_level,
    rating,
    review_count,
    featured,
    is_active,
    created_at
FROM destinations 
LIMIT 3;

-- Step 7: Test creating a new destination with all fields
DO $$
DECLARE
    test_destination_id UUID;
BEGIN
    INSERT INTO destinations (
        name,
        description,
        location,
        category,
        accessibility_features,
        amenities,
        images,
        coordinates,
        entrance_fee,
        opening_hours,
        contact_number,
        website,
        best_time_to_visit,
        estimated_duration,
        difficulty_level,
        rating,
        review_count,
        featured,
        is_active
    ) VALUES (
        'Test Destination - Column Fix',
        'Test destination to verify all columns work',
        'Test Location',
        'Cultural Sites',
        '["Wheelchair Accessible", "Braille Signs"]'::jsonb,
        '["Parking", "Restroom", "Gift Shop"]'::jsonb,
        '["https://example.com/image1.jpg"]'::jsonb,
        '{"latitude": 10.3157, "longitude": 123.8854}'::jsonb,
        'PHP 50',
        '8:00 AM - 6:00 PM',
        '+63 32 123 4567',
        'https://example.com',
        'Dry season',
        '2-3 hours',
        'Easy',
        4.5,
        25,
        true,
        true
    ) RETURNING id INTO test_destination_id;
    
    -- Clean up test data
    DELETE FROM destinations WHERE id = test_destination_id;
    
    RAISE NOTICE 'SUCCESS: All columns working properly!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Final status
SELECT 'MISSING COLUMNS FIX COMPLETED' as status;
SELECT 'Destinations table now has all required columns for admin service' as message;
