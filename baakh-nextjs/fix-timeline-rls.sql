-- Fix RLS policies for timeline tables
-- The policies are checking for deleted_at column that doesn't exist

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow public read access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow public read access to timeline connections" ON public.timeline_connections;
DROP POLICY IF EXISTS "Allow admin full access to timeline periods" ON public.timeline_periods;
DROP POLICY IF EXISTS "Allow admin full access to timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow admin full access to timeline connections" ON public.timeline_connections;

-- Create new policies that match the actual table structure
-- For timeline_periods (no deleted_at column)
CREATE POLICY "Allow public read access to timeline periods" ON public.timeline_periods
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to timeline periods" ON public.timeline_periods
    FOR ALL USING (true);

-- For timeline_events (has deleted_at column)
CREATE POLICY "Allow public read access to timeline events" ON public.timeline_events
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow admin full access to timeline events" ON public.timeline_events
    FOR ALL USING (true);

-- For timeline_connections (if it exists)
CREATE POLICY "Allow public read access to timeline connections" ON public.timeline_connections
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to timeline connections" ON public.timeline_connections
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON public.timeline_periods TO authenticated;
GRANT ALL ON public.timeline_periods TO anon;
GRANT ALL ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO anon;
