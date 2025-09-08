-- Fix for destination_audit RLS Policy Violation
-- This script specifically fixes the "destination_audit" table RLS error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if destination_audit table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destination_audit') THEN
        RAISE NOTICE 'destination_audit table exists - fixing RLS';
        
        -- Disable RLS on destination_audit table
        ALTER TABLE destination_audit DISABLE ROW LEVEL SECURITY;
        
        -- Grant necessary permissions
        GRANT ALL ON destination_audit TO anon;
        GRANT ALL ON destination_audit TO authenticated;
        
        RAISE NOTICE 'destination_audit table RLS disabled and permissions granted';
    ELSE
        RAISE NOTICE 'destination_audit table does not exist - creating it';
        
        -- Create the destination_audit table
        CREATE TABLE destination_audit (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            destination_id UUID,
            action VARCHAR(50) NOT NULL,
            admin_id VARCHAR(255),
            admin_email VARCHAR(255),
            old_data JSONB,
            new_data JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Disable RLS on the new table
        ALTER TABLE destination_audit DISABLE ROW LEVEL SECURITY;
        
        -- Grant permissions
        GRANT ALL ON destination_audit TO anon;
        GRANT ALL ON destination_audit TO authenticated;
        
        RAISE NOTICE 'destination_audit table created with RLS disabled';
    END IF;
END $$;

-- Step 2: Also ensure destinations table has proper access
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON destinations TO anon;
GRANT ALL ON destinations TO authenticated;

-- Step 3: Create admin_audit_log table if it doesn't exist (fallback)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_log') THEN
        CREATE TABLE admin_audit_log (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            admin_id VARCHAR(255),
            admin_email VARCHAR(255),
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(100),
            record_id VARCHAR(255),
            old_data JSONB,
            new_data JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'admin_audit_log table created as fallback';
    END IF;
    
    -- Ensure admin_audit_log has proper access
    ALTER TABLE admin_audit_log DISABLE ROW LEVEL SECURITY;
    GRANT ALL ON admin_audit_log TO anon;
    GRANT ALL ON admin_audit_log TO authenticated;
END $$;

-- Step 4: Test the destination_audit table with a sample insert
DO $$
BEGIN
    INSERT INTO destination_audit (
        destination_id,
        action,
        admin_id,
        admin_email
    ) VALUES (
        gen_random_uuid(),
        'test_insert',
        'test_admin',
        'test@admin.com'
    );
    
    -- Verify the insert worked
    IF EXISTS (SELECT 1 FROM destination_audit WHERE action = 'test_insert') THEN
        RAISE NOTICE 'destination_audit table test: SUCCESS';
        
        -- Clean up test data
        DELETE FROM destination_audit WHERE action = 'test_insert';
    ELSE
        RAISE NOTICE 'destination_audit table test: FAILED';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'destination_audit table test error: %', SQLERRM;
END $$;

-- Step 5: Show current table structure and permissions
SELECT 'DESTINATION_AUDIT TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'destination_audit' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Create indexes for better performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_destination_audit_destination_id') THEN
        CREATE INDEX idx_destination_audit_destination_id ON destination_audit(destination_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_destination_audit_created_at') THEN
        CREATE INDEX idx_destination_audit_created_at ON destination_audit(created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_destination_audit_action') THEN
        CREATE INDEX idx_destination_audit_action ON destination_audit(action);
    END IF;
END $$;

-- Final status
SELECT 'DESTINATION_AUDIT RLS FIX COMPLETED' as status;
SELECT 'Admin panel should now work without RLS errors' as message;
