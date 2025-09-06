-- Grant permissions for tags table to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags_translations TO service_role;

-- If sequences exist for auto-incrementing IDs
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on all existing tables (for future use)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
