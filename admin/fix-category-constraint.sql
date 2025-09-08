-- Fix Category Check Constraint for Destinations Table
-- This script fixes the category constraint that's blocking destination creation
-- Run this in your Supabase SQL Editor

-- Step 1: Check current category constraint
SELECT 'CURRENT CATEGORY CONSTRAINT:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'destinations'::regclass 
AND contype = 'c'
AND conname LIKE '%category%';

-- Step 2: Show existing categories in the table
SELECT 'EXISTING CATEGORIES IN TABLE:' as existing_info;
SELECT DISTINCT category, COUNT(*) as count
FROM destinations 
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Step 3: Drop the existing category constraint
DO $$
BEGIN
    -- Drop the constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'destinations'::regclass 
        AND conname = 'destinations_category_check'
    ) THEN
        ALTER TABLE destinations DROP CONSTRAINT destinations_category_check;
        RAISE NOTICE 'Dropped existing category constraint';
    END IF;
END $$;

-- Step 4: Create a new, more comprehensive category constraint
ALTER TABLE destinations ADD CONSTRAINT destinations_category_check 
CHECK (category IN (
    'Cultural Sites',
    'Natural Attractions', 
    'Historical Sites',
    'Beach',
    'Adventure',
    'Viewpoint',
    'Religious Sites',
    'Museums',
    'Parks',
    'Islands',
    'Falls',
    'Mountains',
    'Heritage Sites',
    'Temples',
    'Churches',
    'Nature Parks',
    'Recreational Areas',
    'Tourist Spots',
    'Landmarks',
    'Scenic Views',
    'Water Activities',
    'Cultural Heritage',
    'Uncategorized'
));

-- Step 5: Show the new constraint
SELECT 'NEW CATEGORY CONSTRAINT:' as new_info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'destinations'::regclass 
AND contype = 'c'
AND conname = 'destinations_category_check';

-- Step 6: Test the constraint with valid categories
DO $$
DECLARE
    test_categories TEXT[] := ARRAY[
        'Cultural Sites',
        'Natural Attractions',
        'Historical Sites',
        'Beach',
        'Adventure'
    ];
    category_name TEXT;
    test_id UUID;
BEGIN
    FOREACH category_name IN ARRAY test_categories
    LOOP
        BEGIN
            INSERT INTO destinations (name, description, location, category)
            VALUES (
                'Test Destination - ' || category_name,
                'Test destination for category: ' || category_name,
                'Test Location',
                category_name
            ) RETURNING id INTO test_id;
            
            -- Clean up test data immediately
            DELETE FROM destinations WHERE id = test_id;
            
            RAISE NOTICE 'Category test PASSED: %', category_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Category test FAILED: % - Error: %', category_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 7: Fix any existing destinations with invalid categories
UPDATE destinations 
SET category = 'Uncategorized' 
WHERE category IS NOT NULL 
AND category NOT IN (
    'Cultural Sites',
    'Natural Attractions', 
    'Historical Sites',
    'Beach',
    'Adventure',
    'Viewpoint',
    'Religious Sites',
    'Museums',
    'Parks',
    'Islands',
    'Falls',
    'Mountains',
    'Heritage Sites',
    'Temples',
    'Churches',
    'Nature Parks',
    'Recreational Areas',
    'Tourist Spots',
    'Landmarks',
    'Scenic Views',
    'Water Activities',
    'Cultural Heritage',
    'Uncategorized'
);

-- Step 8: Show destinations that were updated
SELECT 'DESTINATIONS WITH UPDATED CATEGORIES:' as updated_info;
SELECT id, name, category 
FROM destinations 
WHERE category = 'Uncategorized';

-- Step 9: Show summary of all categories now in use
SELECT 'FINAL CATEGORY SUMMARY:' as summary;
SELECT category, COUNT(*) as destination_count
FROM destinations 
GROUP BY category 
ORDER BY destination_count DESC;

-- Step 10: Test creating a destination with each category type
SELECT 'CONSTRAINT FIX COMPLETED' as status;
SELECT 'You can now create destinations with any of the allowed categories' as message;
SELECT 'Allowed categories: Cultural Sites, Natural Attractions, Historical Sites, Beach, Adventure, Viewpoint, Religious Sites, Museums, Parks, Islands, Falls, Mountains, Heritage Sites, Temples, Churches, Nature Parks, Recreational Areas, Tourist Spots, Landmarks, Scenic Views, Water Activities, Cultural Heritage, Uncategorized' as allowed_categories;
