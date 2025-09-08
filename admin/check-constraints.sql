-- Check what category values are allowed
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%category%';

-- Also check if there's an enum type for categories
SELECT enumlabel as valid_categories
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'destination_category'
);

-- Show current table structure to see category column details
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND column_name = 'category';
