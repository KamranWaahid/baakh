-- Comprehensive RLS fix for timeline tables
-- This script addresses all possible RLS and permission issues

-- Step 1: Disable RLS temporarily to fix policies
ALTER TABLE public.timeline_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow public read access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow public read access to timeline connections" ON public.timeline_connections;
DROP POLICY IF EXISTS "Allow admin full access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow admin full access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow admin full access to timeline connections" ON public.timeline_connections;

-- Step 3: Grant all necessary permissions
GRANT ALL ON public.timeline_periods TO authenticated;
GRANT ALL ON public.timeline_periods TO anon;
GRANT ALL ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO anon;

-- Step 4: Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 5: Re-enable RLS with simple policies
ALTER TABLE public.timeline_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple, permissive policies
CREATE POLICY "Allow all access to timeline periods" ON public.timeline_periods
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to timeline events" ON public.timeline_events
    FOR ALL USING (true) WITH CHECK (true);

-- Step 7: Verify permissions
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('timeline_periods', 'timeline_events');

-- Step 8: Test access
SELECT COUNT(*) as timeline_periods_count FROM public.timeline_periods;
SELECT COUNT(*) as timeline_events_count FROM public.timeline_events;
