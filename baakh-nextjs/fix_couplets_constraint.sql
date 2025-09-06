-- Fix foreign key constraint for standalone couplets
-- This script allows poetry_id to be NULL for couplets that aren't associated with poetry_main

-- First, drop the existing foreign key constraint
ALTER TABLE public.poetry_couplets 
DROP CONSTRAINT IF EXISTS poetry_couplets_poetry_id_fkey;

-- Recreate the constraint to allow NULL values
ALTER TABLE public.poetry_couplets 
ADD CONSTRAINT poetry_couplets_poetry_id_fkey 
FOREIGN KEY (poetry_id) 
REFERENCES poetry_main(id) 
ON UPDATE CASCADE 
ON DELETE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- Add a check constraint to ensure poetry_id is either NULL or a valid reference
ALTER TABLE public.poetry_couplets 
ADD CONSTRAINT check_poetry_id 
CHECK (poetry_id IS NULL OR poetry_id > 0);

-- Update the index to handle NULL values properly
DROP INDEX IF EXISTS idx_poetry_couplets_poetry_id;
CREATE INDEX idx_poetry_couplets_poetry_id 
ON public.poetry_couplets (poetry_id) 
WHERE poetry_id IS NOT NULL;

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT poetry_couplets_poetry_id_fkey ON public.poetry_couplets IS 
'Foreign key to poetry_main. NULL values are allowed for standalone couplets that are not associated with any poetry.';

-- Verify the changes
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'poetry_couplets' 
    AND tc.constraint_type = 'FOREIGN KEY';
