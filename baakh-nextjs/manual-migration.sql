-- Manual Migration Script for Supabase Dashboard
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add sindhi_name column to e2ee_users table
ALTER TABLE public.e2ee_users 
ADD COLUMN IF NOT EXISTS sindhi_name text;

-- 2. Add updated_at column to e2ee_users table
ALTER TABLE public.e2ee_users 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Create index for sindhi_name lookups
CREATE INDEX IF NOT EXISTS idx_e2ee_users_sindhi_name 
ON public.e2ee_users(sindhi_name);

-- 4. Create trigger function for automatically updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_e2ee_users_updated_at ON public.e2ee_users;
CREATE TRIGGER update_e2ee_users_updated_at
    BEFORE UPDATE ON public.e2ee_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Grant permissions
GRANT ALL ON public.e2ee_users TO anon, authenticated;

-- 7. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'e2ee_users' 
AND column_name IN ('sindhi_name', 'updated_at')
ORDER BY column_name;

-- 8. Test with a sample update (optional)
-- UPDATE public.e2ee_users 
-- SET sindhi_name = 'Test Name', updated_at = now()
-- WHERE user_id = (SELECT user_id FROM public.e2ee_users LIMIT 1);
