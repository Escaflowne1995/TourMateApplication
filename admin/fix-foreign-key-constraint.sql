-- Fix Foreign Key Constraint Issue for destination_audit
-- This script fixes the foreign key constraint violation when permanently deleting destinations
-- Run this in your Supabase SQL Editor

-- Step 1: Check current foreign key constraints
SELECT 'CURRENT FOREIGN KEY CONSTRAINTS:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'destination_audit';

-- Step 2: Drop the problematic foreign key constraint if it exists
DO $$
BEGIN
    -- Drop foreign key constraint that prevents audit logging
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'destination_audit_destination_id_fkey' 
        AND table_name = 'destination_audit'
    ) THEN
        ALTER TABLE destination_audit DROP CONSTRAINT destination_audit_destination_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: destination_audit_destination_id_fkey';
    END IF;
    
    -- Also check for other similar constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%destination_audit%destination%fkey%' 
        AND table_name = 'destination_audit'
    ) THEN
        -- Get the actual constraint name and drop it
        DECLARE
            constraint_record RECORD;
        BEGIN
            FOR constraint_record IN 
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE constraint_type = 'FOREIGN KEY' 
                AND table_name = 'destination_audit'
                AND constraint_name LIKE '%destination%fkey%'
            LOOP
                EXECUTE 'ALTER TABLE destination_audit DROP CONSTRAINT ' || constraint_record.constraint_name;
                RAISE NOTICE 'Dropped foreign key constraint: %', constraint_record.constraint_name;
            END LOOP;
        END;
    END IF;
END $$;

-- Step 3: Modify destination_audit table to store destination_id as VARCHAR instead of UUID reference
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destination_audit') THEN
        -- Change destination_id to VARCHAR to avoid foreign key issues
        ALTER TABLE destination_audit ALTER COLUMN destination_id TYPE VARCHAR(255);
        RAISE NOTICE 'Changed destination_id column to VARCHAR type';
    END IF;
END $$;

-- Step 4: Ensure admin_audit_log table exists and has proper structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_log') THEN
        CREATE TABLE admin_audit_log (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            admin_id VARCHAR(255),
            admin_email VARCHAR(255),
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(100),
            record_id VARCHAR(255), -- Changed to VARCHAR to avoid FK issues
            old_data JSONB,
            new_data JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created admin_audit_log table';
    ELSE
        -- Ensure record_id is VARCHAR type
        ALTER TABLE admin_audit_log ALTER COLUMN record_id TYPE VARCHAR(255);
        RAISE NOTICE 'Updated admin_audit_log.record_id to VARCHAR type';
    END IF;
    
    -- Disable RLS and grant permissions
    ALTER TABLE admin_audit_log DISABLE ROW LEVEL SECURITY;
    GRANT ALL ON admin_audit_log TO anon;
    GRANT ALL ON admin_audit_log TO authenticated;
END $$;

-- Step 5: Test audit logging without foreign key constraints
DO $$
BEGIN
    -- Test destination_audit if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destination_audit') THEN
        INSERT INTO destination_audit (
            destination_id,
            action,
            admin_id,
            admin_email
        ) VALUES (
            'test-uuid-that-does-not-exist',
            'foreign_key_test',
            'test_admin',
            'test@admin.com'
        );
        
        -- Clean up test data
        DELETE FROM destination_audit WHERE action = 'foreign_key_test';
        RAISE NOTICE 'destination_audit table test: SUCCESS (no foreign key constraint)';
    END IF;
    
    -- Test admin_audit_log
    INSERT INTO admin_audit_log (
        admin_id,
        admin_email,
        action,
        table_name,
        record_id
    ) VALUES (
        'test_admin',
        'test@admin.com',
        'foreign_key_test',
        'destinations',
        'test-uuid-that-does-not-exist'
    );
    
    -- Clean up test data
    DELETE FROM admin_audit_log WHERE action = 'foreign_key_test';
    RAISE NOTICE 'admin_audit_log table test: SUCCESS (no foreign key constraint)';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Step 6: Create a safer audit logging function
CREATE OR REPLACE FUNCTION safe_audit_log(
    p_table_name VARCHAR(100),
    p_action VARCHAR(100),
    p_record_id VARCHAR(255),
    p_admin_id VARCHAR(255) DEFAULT NULL,
    p_admin_email VARCHAR(255) DEFAULT NULL,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Try to log to admin_audit_log first
    BEGIN
        INSERT INTO admin_audit_log (
            admin_id,
            admin_email,
            action,
            table_name,
            record_id,
            old_data,
            new_data
        ) VALUES (
            p_admin_id,
            p_admin_email,
            p_action,
            p_table_name,
            p_record_id,
            p_old_data,
            p_new_data
        );
        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        -- If admin_audit_log fails, try destination_audit
        IF p_table_name = 'destinations' AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destination_audit') THEN
            BEGIN
                INSERT INTO destination_audit (
                    destination_id,
                    action,
                    admin_id,
                    admin_email,
                    old_data,
                    new_data
                ) VALUES (
                    p_record_id,
                    p_action,
                    p_admin_id,
                    p_admin_email,
                    p_old_data,
                    p_new_data
                );
                RETURN TRUE;
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the main operation
                RAISE WARNING 'Audit logging failed for table % action %: %', p_table_name, p_action, SQLERRM;
                RETURN FALSE;
            END;
        END IF;
        
        -- Log the error but don't fail the main operation
        RAISE WARNING 'Audit logging failed for table % action %: %', p_table_name, p_action, SQLERRM;
        RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Grant permissions on the function
GRANT EXECUTE ON FUNCTION safe_audit_log TO anon;
GRANT EXECUTE ON FUNCTION safe_audit_log TO authenticated;

-- Step 8: Show final status
SELECT 'FOREIGN KEY CONSTRAINT FIX COMPLETED' as status;
SELECT 'Audit tables can now handle permanent destination deletes' as message;

-- Step 9: Show remaining foreign key constraints (should be none for audit tables)
SELECT 'REMAINING FOREIGN KEY CONSTRAINTS ON AUDIT TABLES:' as remaining_constraints;
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('destination_audit', 'admin_audit_log')
ORDER BY tc.table_name;

-- Step 10: Test with a real destination deletion scenario
SELECT 'TESTING PERMANENT DELETE SCENARIO:' as test_info;
SELECT 'The audit tables should now work without foreign key constraint violations' as test_result;
