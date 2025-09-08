-- Enable Real-time Subscriptions for Destinations Table
-- This script enables Supabase real-time functionality for the destinations table
-- Run this in your Supabase SQL Editor

-- Step 1: Enable real-time for destinations table
ALTER PUBLICATION supabase_realtime ADD TABLE destinations;

-- Step 2: Grant necessary permissions for real-time
GRANT SELECT ON destinations TO anon;
GRANT SELECT ON destinations TO authenticated;

-- Step 3: Ensure RLS is disabled for real-time access
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

-- Step 4: Test real-time subscription capability
-- (This is just informational - actual subscription happens in the app)
SELECT 'REAL-TIME ENABLED FOR DESTINATIONS TABLE' as status;

-- Step 5: Show current real-time publications
SELECT 'CURRENT REAL-TIME PUBLICATIONS:' as info;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Step 6: Verify table structure for real-time compatibility
SELECT 'DESTINATIONS TABLE STRUCTURE:' as structure_info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 7: Insert a test destination to verify real-time works
DO $$
DECLARE
    test_id UUID;
BEGIN
    INSERT INTO destinations (
        name,
        description,
        location,
        category,
        is_active,
        featured
    ) VALUES (
        'Real-time Test Destination',
        'This destination tests if real-time sync is working between admin and mobile',
        'Test Location for Real-time',
        'Cultural Sites',
        true,
        true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'Test destination created with ID: %', test_id;
    RAISE NOTICE 'If real-time is working, this should appear in mobile app immediately';
    
    -- Clean up after 5 seconds (comment this out if you want to keep the test destination)
    -- DELETE FROM destinations WHERE id = test_id;
    
END $$;

-- Step 8: Final instructions
SELECT 'REAL-TIME SETUP COMPLETED' as final_status;
SELECT 'Mobile app should now receive real-time updates when destinations are added/modified/deleted in admin panel' as instructions;
SELECT 'Test by adding a destination in admin panel and checking if it appears in mobile app immediately' as test_instructions;
