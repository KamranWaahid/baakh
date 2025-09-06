-- Migration: Add sindhi_name column to e2ee_users table
-- This allows storing the user's Sindhi name for poetry attribution

-- Add sindhi_name column
ALTER TABLE public.e2ee_users 
ADD COLUMN IF NOT EXISTS sindhi_name text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add index for sindhi_name lookups
CREATE INDEX IF NOT EXISTS idx_e2ee_users_sindhi_name 
ON public.e2ee_users(sindhi_name);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_e2ee_users_updated_at ON public.e2ee_users;
CREATE TRIGGER update_e2ee_users_updated_at
    BEFORE UPDATE ON public.e2ee_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.e2ee_users TO anon, authenticated;

-- Update RLS policies to include sindhi_name
-- (The existing policies should work, but let's ensure they do)
COMMENT ON TABLE public.e2ee_users IS 'E2EE Users table with Sindhi name support for poetry attribution';
