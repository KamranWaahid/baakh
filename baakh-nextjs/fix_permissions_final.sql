-- Final fix for feedback table permissions

-- 1. First, let's check if the table exists and get its current state
SELECT 
  schemaname, 
  tablename, 
  tableowner,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'feedback';

-- 2. Check current permissions
SELECT 
  grantee, 
  privilege_type, 
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'feedback' 
AND table_schema = 'public';

-- 3. Drop and recreate all policies to ensure they're correct
DROP POLICY IF EXISTS "Allow public feedback submission" ON public.feedback;
DROP POLICY IF EXISTS "Allow reading feedback" ON public.feedback;

-- 4. Disable RLS temporarily to fix permissions
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- 5. Grant all necessary permissions to service_role
GRANT ALL ON public.feedback TO service_role;
GRANT ALL ON SEQUENCE public.feedback_id_seq TO service_role;

-- 6. Grant permissions to anon and authenticated users
GRANT INSERT, SELECT ON public.feedback TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.feedback_id_seq TO anon, authenticated;

-- 7. Re-enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 8. Create policies
CREATE POLICY "Allow public feedback submission" 
ON public.feedback 
FOR INSERT 
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow reading feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated, service_role
USING (true);

-- 9. Verify the setup
SELECT 
  schemaname, 
  tablename, 
  tableowner,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'feedback';

-- 10. Test insert (this should work now)
INSERT INTO public.feedback (rating, comment, ip_hash) 
VALUES (5, 'Test from SQL', 'test-hash') 
RETURNING id, rating, comment, created_at;
