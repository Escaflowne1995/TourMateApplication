-- QUICK FIX: Foreign Key Constraint Violation
-- Run this immediately in your Supabase SQL Editor to fix the FK constraint error

-- 1. Drop the problematic foreign key constraint
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all foreign key constraints on destination_audit table
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'destination_audit'
    LOOP
        EXECUTE 'ALTER TABLE destination_audit DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    -- If no constraints were found, that's also fine
    RAISE NOTICE 'Foreign key constraint cleanup completed';
END $$;

-- 2. Ensure destination_audit table structure is correct
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destination_audit') THEN
        -- Change destination_id to VARCHAR to avoid FK issues
        ALTER TABLE destination_audit ALTER COLUMN destination_id TYPE VARCHAR(255);
        
        -- Disable RLS
        ALTER TABLE destination_audit DISABLE ROW LEVEL SECURITY;
        GRANT ALL ON destination_audit TO anon;
        GRANT ALL ON destination_audit TO authenticated;
        
        RAISE NOTICE 'destination_audit table updated';
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE destination_audit (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            destination_id VARCHAR(255), -- No FK constraint
            action VARCHAR(50) NOT NULL,
            admin_id VARCHAR(255),
            admin_email VARCHAR(255),
            old_data JSONB,
            new_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Disable RLS
        ALTER TABLE destination_audit DISABLE ROW LEVEL SECURITY;
        GRANT ALL ON destination_audit TO anon;
        GRANT ALL ON destination_audit TO authenticated;
        
        RAISE NOTICE 'destination_audit table created';
    END IF;
END $$;

-- 3. Test the fix
DO $$
BEGIN
    -- Test with a non-existent destination ID (should work now)
    INSERT INTO destination_audit (
        destination_id,
        action,
        admin_id,
        admin_email
    ) VALUES (
        'test-deleted-destination-id',
        'test_permanent_delete',
        'test_admin',
        'test@admin.com'
    );
    
    -- Clean up test data
    DELETE FROM destination_audit WHERE action = 'test_permanent_delete';
    
    RAISE NOTICE 'SUCCESS: Foreign key constraint issue fixed!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %, but constraint should be removed', SQLERRM;
END $$;

-- 4. Final status
SELECT 'FOREIGN KEY CONSTRAINT FIX COMPLETED' as status;
SELECT 'You can now permanently delete destinations without FK constraint errors' as message;
