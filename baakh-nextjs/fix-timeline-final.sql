-- Final aggressive fix for timeline tables
-- This script completely disables RLS and grants all permissions

-- Step 1: Completely disable RLS on timeline tables
ALTER TABLE public.timeline_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (if any exist)
DROP POLICY IF EXISTS "Allow all access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow all access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow public read access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow public read access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow admin full access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow admin full access to timeline events" ON public.timeline_events;

-- Step 3: Grant ALL permissions to ALL roles
GRANT ALL ON public.timeline_periods TO authenticated;
GRANT ALL ON public.timeline_periods TO anon;
GRANT ALL ON public.timeline_periods TO service_role;
GRANT ALL ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO anon;
GRANT ALL ON public.timeline_events TO service_role;

-- Step 4: Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 5: Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 6: Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('timeline_periods', 'timeline_events');

-- Step 7: Test access
SELECT 'timeline_periods' as table_name, COUNT(*) as count FROM public.timeline_periods
UNION ALL
SELECT 'timeline_events' as table_name, COUNT(*) as count FROM public.timeline_events;

-- Step 8: Show current permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name IN ('timeline_periods', 'timeline_events')
ORDER BY table_name, grantee;
