-- Check Destinations Table Columns
-- This script checks what columns exist vs what's expected
-- Run this in Supabase SQL Editor to see current status

-- Step 1: Show current table structure
SELECT 'CURRENT DESTINATIONS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check for expected columns
SELECT 'COLUMN EXISTENCE CHECK:' as check_info;
WITH expected_columns AS (
    SELECT column_name FROM (VALUES 
        ('id'),
        ('name'),
        ('description'),
        ('location'),
        ('category'),
        ('accessibility_features'),
        ('amenities'),
        ('images'),
        ('coordinates'),
        ('entrance_fee'),
        ('opening_hours'),
        ('contact_number'),
        ('website'),
        ('best_time_to_visit'),
        ('estimated_duration'),
        ('difficulty_level'),
        ('rating'),
        ('review_count'),
        ('featured'),
        ('is_active'),
        ('created_at'),
        ('updated_at')
    ) AS t(column_name)
),
actual_columns AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'destinations' 
    AND table_schema = 'public'
)
SELECT 
    e.column_name,
    CASE 
        WHEN a.column_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM expected_columns e
LEFT JOIN actual_columns a ON e.column_name = a.column_name
ORDER BY e.column_name;

-- Step 3: Show missing columns that need to be added
SELECT 'MISSING COLUMNS TO ADD:' as missing_info;
WITH expected_columns AS (
    SELECT column_name FROM (VALUES 
        ('accessibility_features'),
        ('amenities'),
        ('images'),
        ('coordinates'),
        ('entrance_fee'),
        ('opening_hours'),
        ('contact_number'),
        ('website'),
        ('best_time_to_visit'),
        ('estimated_duration'),
        ('difficulty_level'),
        ('rating'),
        ('review_count'),
        ('featured'),
        ('is_active'),
        ('created_at'),
        ('updated_at')
    ) AS t(column_name)
),
actual_columns AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'destinations' 
    AND table_schema = 'public'
)
SELECT e.column_name as missing_column
FROM expected_columns e
LEFT JOIN actual_columns a ON e.column_name = a.column_name
WHERE a.column_name IS NULL;

-- Step 4: Show sample data to see current structure
SELECT 'SAMPLE CURRENT DATA:' as sample;
SELECT * FROM destinations LIMIT 2;

-- Step 5: Show table constraints
SELECT 'TABLE CONSTRAINTS:' as constraints;
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'destinations'
AND table_schema = 'public';

-- Step 6: Provide fix command
SELECT 'TO FIX MISSING COLUMNS:' as fix_command;
SELECT 'Run the SQL script: admin/fix-missing-columns.sql' as solution;
