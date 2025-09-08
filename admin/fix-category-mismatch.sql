-- Fix Category Constraint Mismatch
-- This script aligns all category definitions across admin panel, config, and database
-- Run this in your Supabase SQL Editor

-- Step 1: Show current constraint (if any)
SELECT 'CURRENT CATEGORY CONSTRAINT:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'destinations'::regclass 
AND contype = 'c'
AND conname LIKE '%category%';

-- Step 2: Show existing categories in use
SELECT 'EXISTING CATEGORIES IN DATABASE:' as existing_info;
SELECT DISTINCT category, COUNT(*) as count
FROM destinations 
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Step 3: Drop existing category constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'destinations'::regclass 
        AND conname = 'destinations_category_check'
    ) THEN
        ALTER TABLE destinations DROP CONSTRAINT destinations_category_check;
        RAISE NOTICE 'Dropped existing category constraint';
    END IF;
    
    -- Also check for other variations of the constraint name
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'destinations'::regclass 
        AND contype = 'c'
        AND conname LIKE '%category%'
    ) THEN
        DECLARE
            constraint_record RECORD;
        BEGIN
            FOR constraint_record IN 
                SELECT conname 
                FROM pg_constraint 
                WHERE conrelid = 'destinations'::regclass 
                AND contype = 'c'
                AND conname LIKE '%category%'
            LOOP
                EXECUTE 'ALTER TABLE destinations DROP CONSTRAINT ' || constraint_record.conname;
                RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
            END LOOP;
        END;
    END IF;
END $$;

-- Step 4: Create comprehensive category constraint that matches AdminConfig
-- These are the categories from AdminConfig.categories.destinations:
ALTER TABLE destinations ADD CONSTRAINT destinations_category_check 
CHECK (category IN (
    -- From AdminConfig (admin/config/adminConfig.js lines 75-85)
    'Historical Sites',
    'Natural Attractions', 
    'Beaches',
    'Mountains',
    'Cultural Sites',
    'Adventure Parks',
    'Museums',
    'Churches',
    'Gardens',
    'Viewpoints',
    -- From DestinationModal (admin/web-interface/components/DestinationModal.js lines 121-124)
    'Beach',
    'Mountain', 
    'Historical',
    'Cultural',
    'Adventure',
    'Nature',
    'Religious',
    'Entertainment',
    'Food & Dining',
    'Shopping',
    -- Additional common categories
    'Parks',
    'Islands',
    'Falls',
    'Heritage Sites',
    'Temples',
    'Nature Parks',
    'Recreational Areas',
    'Tourist Spots',
    'Landmarks',
    'Scenic Views',
    'Water Activities',
    'Cultural Heritage',
    'Religious Sites',
    'Uncategorized'
));

-- Step 5: Update any existing destinations with invalid categories
UPDATE destinations 
SET category = CASE 
    -- Map old categories to new valid ones
    WHEN category = 'Cultural' THEN 'Cultural Sites'
    WHEN category = 'Beach' THEN 'Beaches'
    WHEN category = 'Mountain' THEN 'Mountains'
    WHEN category = 'Historical' THEN 'Historical Sites'
    WHEN category = 'Adventure' THEN 'Adventure Parks'
    WHEN category = 'Nature' THEN 'Natural Attractions'
    WHEN category = 'Religious' THEN 'Religious Sites'
    ELSE 'Uncategorized'
END
WHERE category IS NOT NULL 
AND category NOT IN (
    'Historical Sites', 'Natural Attractions', 'Beaches', 'Mountains',
    'Cultural Sites', 'Adventure Parks', 'Museums', 'Churches',
    'Gardens', 'Viewpoints', 'Beach', 'Mountain', 'Historical',
    'Cultural', 'Adventure', 'Nature', 'Religious', 'Entertainment',
    'Food & Dining', 'Shopping', 'Parks', 'Islands', 'Falls',
    'Heritage Sites', 'Temples', 'Nature Parks', 'Recreational Areas',
    'Tourist Spots', 'Landmarks', 'Scenic Views', 'Water Activities',
    'Cultural Heritage', 'Religious Sites', 'Uncategorized'
);

-- Step 6: Test the constraint with AdminConfig categories
DO $$
DECLARE
    test_categories TEXT[] := ARRAY[
        'Historical Sites',
        'Natural Attractions',
        'Beaches',
        'Mountains',
        'Cultural Sites',
        'Adventure Parks'
    ];
    category_name TEXT;
    test_id UUID;
BEGIN
    FOREACH category_name IN ARRAY test_categories
    LOOP
        BEGIN
            INSERT INTO destinations (name, description, location, category)
            VALUES (
                'Test - ' || category_name,
                'Test destination for category: ' || category_name,
                'Test Location',
                category_name
            ) RETURNING id INTO test_id;
            
            -- Clean up test data immediately
            DELETE FROM destinations WHERE id = test_id;
            
            RAISE NOTICE 'AdminConfig category test PASSED: %', category_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'AdminConfig category test FAILED: % - Error: %', category_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 7: Test with DestinationModal categories
DO $$
DECLARE
    test_categories TEXT[] := ARRAY[
        'Beach',
        'Mountain',
        'Historical',
        'Cultural',
        'Adventure',
        'Nature'
    ];
    category_name TEXT;
    test_id UUID;
BEGIN
    FOREACH category_name IN ARRAY test_categories
    LOOP
        BEGIN
            INSERT INTO destinations (name, description, location, category)
            VALUES (
                'Test Modal - ' || category_name,
                'Test destination for modal category: ' || category_name,
                'Test Location',
                category_name
            ) RETURNING id INTO test_id;
            
            -- Clean up test data immediately
            DELETE FROM destinations WHERE id = test_id;
            
            RAISE NOTICE 'DestinationModal category test PASSED: %', category_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'DestinationModal category test FAILED: % - Error: %', category_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 8: Show the new constraint
SELECT 'NEW COMPREHENSIVE CATEGORY CONSTRAINT:' as new_constraint_info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'destinations'::regclass 
AND contype = 'c'
AND conname = 'destinations_category_check';

-- Step 9: Show current category distribution
SELECT 'FINAL CATEGORY DISTRIBUTION:' as distribution;
SELECT category, COUNT(*) as destination_count
FROM destinations 
WHERE category IS NOT NULL
GROUP BY category 
ORDER BY destination_count DESC;

-- Step 10: Final status
SELECT 'CATEGORY CONSTRAINT MISMATCH FIXED' as status;
SELECT 'All AdminConfig and DestinationModal categories are now allowed' as message;
SELECT 'You can now create destinations with any category from either source' as instructions;
