-- QUICK FIX: Remove Category Constraint Entirely
-- This removes the category constraint so any category can be used
-- Run this in your Supabase SQL Editor for immediate fix

-- Step 1: Drop all category-related constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all category constraints
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'destinations'::regclass 
        AND contype = 'c'
        AND (conname LIKE '%category%' OR pg_get_constraintdef(oid) ILIKE '%category%')
    LOOP
        EXECUTE 'ALTER TABLE destinations DROP CONSTRAINT ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
    
    RAISE NOTICE 'All category constraints removed';
END $$;

-- Step 2: Test that any category now works
DO $$
DECLARE
    test_categories TEXT[] := ARRAY[
        'Any Category Works',
        'Beach',
        'Cultural Sites',
        'Historical',
        'Adventure Parks',
        'Random Category'
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
                'Test for: ' || category_name,
                'Test Location',
                category_name
            ) RETURNING id INTO test_id;
            
            -- Clean up test data
            DELETE FROM destinations WHERE id = test_id;
            
            RAISE NOTICE 'Category test PASSED: %', category_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Category test FAILED: % - Error: %', category_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Show result
SELECT 'CATEGORY CONSTRAINT REMOVED' as status;
SELECT 'You can now use any category value for destinations' as message;
SELECT 'No category restrictions are enforced at database level' as note;
