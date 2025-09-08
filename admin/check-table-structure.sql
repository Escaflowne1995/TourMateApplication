-- Check what columns exist in the destinations table
-- Run this first to see the actual table structure

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND table_schema = 'public'
ORDER BY ordinal_position;
