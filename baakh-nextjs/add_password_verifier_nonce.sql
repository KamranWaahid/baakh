-- Migration: Add password_verifier_nonce column to e2ee_users table
-- This migration adds the missing column needed for the new login system

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'e2ee_users' 
        AND column_name = 'password_verifier_nonce'
    ) THEN
        ALTER TABLE public.e2ee_users 
        ADD COLUMN password_verifier_nonce bytea;
        
        -- For existing records, copy the profile_nonce as a temporary value
        -- This ensures backward compatibility
        UPDATE public.e2ee_users 
        SET password_verifier_nonce = profile_nonce 
        WHERE password_verifier_nonce IS NULL;
        
        -- Make the column NOT NULL after populating it
        ALTER TABLE public.e2ee_users 
        ALTER COLUMN password_verifier_nonce SET NOT NULL;
        
        RAISE NOTICE 'Added password_verifier_nonce column to e2ee_users table';
    ELSE
        RAISE NOTICE 'password_verifier_nonce column already exists in e2ee_users table';
    END IF;
END $$;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'e2ee_users' 
AND column_name = 'password_verifier_nonce';
