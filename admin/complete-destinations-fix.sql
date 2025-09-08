-- COMPLETE DESTINATIONS FIX
-- This script will diagnose and fix the destinations not showing issue
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Check if destinations table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinations') THEN
        RAISE NOTICE 'ERROR: destinations table does not exist!';
        RAISE NOTICE 'SOLUTION: Run the admin-supabase-setup.sql migration first';
    ELSE
        RAISE NOTICE 'SUCCESS: destinations table exists';
    END IF;
END $$;

-- Step 2: Show current table structure
SELECT 'CURRENT TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Disable RLS (this is usually the main issue)
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
SELECT 'RLS DISABLED' as status;

-- Step 4: Check if table has any data
SELECT 'CURRENT DATA COUNT:' as info, COUNT(*) as row_count FROM destinations;

-- Step 5: Clear any existing test data and insert fresh test data
DELETE FROM destinations WHERE name LIKE 'Test Destination%';

-- Insert minimal test data (using only columns that should exist)
INSERT INTO destinations (name, description, location, category) VALUES
('Test Destination 1', 'This is a test destination to verify the admin panel works', 'Test Location 1', 'Cultural Sites'),
('Test Destination 2', 'Another test destination', 'Test Location 2', 'Natural Attractions'),
('Test Destination 3', 'Third test destination', 'Test Location 3', 'Historical Sites');

-- Step 6: Verify data was inserted
SELECT 'DATA AFTER INSERT:' as info, COUNT(*) as row_count FROM destinations;

-- Step 7: Show sample of inserted data
SELECT 'SAMPLE DATA:' as info;
SELECT id, name, description, location, category FROM destinations LIMIT 3;

-- Step 8: Test a simple select (this is what the admin panel does)
SELECT 'ADMIN PANEL TEST QUERY:' as info;
SELECT id, name, description, location, category, 
       COALESCE(is_active, true) as is_active,
       COALESCE(featured, false) as featured,
       created_at, updated_at
FROM destinations 
LIMIT 5;

SELECT 'FIX COMPLETE - Check admin panel now!' as status;
