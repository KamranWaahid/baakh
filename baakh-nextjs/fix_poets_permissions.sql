-- Fix Poets Table Permissions for Public Access
-- This script sets up proper RLS policies and permissions for the poets table

-- Enable RLS on the poets table
ALTER TABLE public.poets ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permission on poets table to anon role
GRANT SELECT ON TABLE public.poets TO anon;

-- Create a policy that allows public read access to non-hidden poets
CREATE POLICY "Allow public read access to non-hidden poets" ON public.poets
    FOR SELECT
    TO anon
    USING (is_hidden = false);

-- Create a policy that allows public read access to featured poets
CREATE POLICY "Allow public read access to featured poets" ON public.poets
    FOR SELECT
    TO anon
    USING (is_featured = true);

-- Grant usage on sequences to anon role (if any exist)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure service_role still has full access
GRANT ALL ON TABLE public.poets TO service_role;

-- Test the permissions by checking if anon can select
-- This should work after the policies are created
-- SELECT COUNT(*) FROM public.poets WHERE is_hidden = false;
