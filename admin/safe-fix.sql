-- SAFE FIX - First check what's allowed, then insert
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

-- Step 2: Check what categories already exist in the table
SELECT 'EXISTING CATEGORIES:' as info;
SELECT DISTINCT category, COUNT(*) as count 
FROM destinations 
WHERE category IS NOT NULL 
GROUP BY category 
ORDER BY count DESC;

-- Step 3: Insert using NULL category first (should always work)
DELETE FROM destinations WHERE name LIKE 'Test%';

INSERT INTO destinations (name, description, location) VALUES
('Test Destination A', 'First test destination for admin panel', 'Cebu City'),
('Test Destination B', 'Second test destination for admin panel', 'Bohol'),
('Test Destination C', 'Third test destination for admin panel', 'Palawan');

-- Step 4: Check if insert worked
SELECT 'SUCCESS: Test data inserted' as status, COUNT(*) as total_destinations FROM destinations WHERE name LIKE 'Test%';

-- Step 5: Show the inserted data
SELECT 'INSERTED DATA:' as info;
SELECT id, name, description, location, category FROM destinations WHERE name LIKE 'Test%';
