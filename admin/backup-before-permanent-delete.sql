-- Backup Strategy for Permanent Destination Deletes
-- Run this BEFORE implementing permanent deletes to create a backup system

-- 1. Create a backup table to store deleted destinations
CREATE TABLE IF NOT EXISTS destinations_deleted_backup (
    id UUID PRIMARY KEY,
    original_id UUID NOT NULL,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    category VARCHAR(100),
    coordinates JSONB,
    images JSONB,
    entrance_fee VARCHAR(100),
    opening_hours VARCHAR(255),
    contact_number VARCHAR(50),
    website VARCHAR(255),
    amenities JSONB,
    accessibility_features JSONB,
    best_time_to_visit VARCHAR(255),
    estimated_duration VARCHAR(100),
    difficulty_level VARCHAR(50),
    rating DECIMAL(3,2),
    review_count INTEGER,
    is_active BOOLEAN,
    featured BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by VARCHAR(255),
    deletion_reason TEXT
);

-- 2. Disable RLS on backup table
ALTER TABLE destinations_deleted_backup DISABLE ROW LEVEL SECURITY;
GRANT ALL ON destinations_deleted_backup TO anon;
GRANT ALL ON destinations_deleted_backup TO authenticated;

-- 3. Create function to backup destination before permanent delete
CREATE OR REPLACE FUNCTION backup_destination_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the deleted destination into backup table
    INSERT INTO destinations_deleted_backup (
        original_id, name, description, location, category, coordinates,
        images, entrance_fee, opening_hours, contact_number, website,
        amenities, accessibility_features, best_time_to_visit,
        estimated_duration, difficulty_level, rating, review_count,
        is_active, featured, created_at, updated_at, deleted_at,
        deleted_by, deletion_reason
    ) VALUES (
        OLD.id, OLD.name, OLD.description, OLD.location, OLD.category, OLD.coordinates,
        OLD.images, OLD.entrance_fee, OLD.opening_hours, OLD.contact_number, OLD.website,
        OLD.amenities, OLD.accessibility_features, OLD.best_time_to_visit,
        OLD.estimated_duration, OLD.difficulty_level, OLD.rating, OLD.review_count,
        OLD.is_active, OLD.featured, OLD.created_at, OLD.updated_at, NOW(),
        'admin_panel', 'Permanent deletion via admin panel'
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically backup before delete
DROP TRIGGER IF EXISTS backup_destination_trigger ON destinations;
CREATE TRIGGER backup_destination_trigger
    BEFORE DELETE ON destinations
    FOR EACH ROW
    EXECUTE FUNCTION backup_destination_before_delete();

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_deleted_backup_original_id 
ON destinations_deleted_backup(original_id);

CREATE INDEX IF NOT EXISTS idx_destinations_deleted_backup_deleted_at 
ON destinations_deleted_backup(deleted_at DESC);

CREATE INDEX IF NOT EXISTS idx_destinations_deleted_backup_name 
ON destinations_deleted_backup(name);

-- 6. Create function to restore a deleted destination
CREATE OR REPLACE FUNCTION restore_deleted_destination(original_destination_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    backup_record destinations_deleted_backup%ROWTYPE;
BEGIN
    -- Find the backup record
    SELECT * INTO backup_record 
    FROM destinations_deleted_backup 
    WHERE original_id = original_destination_id 
    ORDER BY deleted_at DESC 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No backup found for destination ID: ' || original_destination_id::TEXT;
        RETURN;
    END IF;
    
    -- Check if destination already exists
    IF EXISTS (SELECT 1 FROM destinations WHERE id = original_destination_id) THEN
        RETURN QUERY SELECT FALSE, 'Destination already exists with ID: ' || original_destination_id::TEXT;
        RETURN;
    END IF;
    
    -- Restore the destination
    INSERT INTO destinations (
        id, name, description, location, category, coordinates,
        images, entrance_fee, opening_hours, contact_number, website,
        amenities, accessibility_features, best_time_to_visit,
        estimated_duration, difficulty_level, rating, review_count,
        is_active, featured, created_at, updated_at
    ) VALUES (
        backup_record.original_id, backup_record.name, backup_record.description, 
        backup_record.location, backup_record.category, backup_record.coordinates,
        backup_record.images, backup_record.entrance_fee, backup_record.opening_hours, 
        backup_record.contact_number, backup_record.website, backup_record.amenities,
        backup_record.accessibility_features, backup_record.best_time_to_visit,
        backup_record.estimated_duration, backup_record.difficulty_level, 
        backup_record.rating, backup_record.review_count, backup_record.is_active,
        backup_record.featured, backup_record.created_at, NOW()
    );
    
    RETURN QUERY SELECT TRUE, 'Destination restored successfully: ' || backup_record.name;
END;
$$ LANGUAGE plpgsql;

-- 7. Show current status
SELECT 'BACKUP SYSTEM SETUP COMPLETED' as status;
SELECT 'Destinations will now be automatically backed up before permanent deletion' as info;

-- 8. Show how to use the restore function
SELECT 'TO RESTORE A DELETED DESTINATION:' as usage_info;
SELECT 'SELECT * FROM restore_deleted_destination(''your-destination-id-here'');' as restore_command;

-- 9. Show recent deletions (will be empty initially)
SELECT 'RECENT DELETIONS (last 7 days):' as recent_deletions;
SELECT 
    original_id,
    name,
    location,
    deleted_at,
    deleted_by
FROM destinations_deleted_backup 
WHERE deleted_at >= NOW() - INTERVAL '7 days'
ORDER BY deleted_at DESC;

-- 10. Show backup table structure
SELECT 'BACKUP TABLE STRUCTURE:' as structure_info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'destinations_deleted_backup' 
ORDER BY ordinal_position;
