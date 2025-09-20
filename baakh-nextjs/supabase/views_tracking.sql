-- Views tracking system for couplets and poetry
-- This table tracks views for different content types

-- Create views tracking table
CREATE TABLE IF NOT EXISTS public.content_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('couplet', 'poetry', 'poet')),
    user_ip VARCHAR(45), -- Store IP for basic analytics (optional)
    user_agent TEXT, -- Store user agent for analytics (optional)
    session_id VARCHAR(255), -- Store session ID to prevent duplicate views
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Create unique constraint to prevent duplicate views from same session
    UNIQUE(content_id, content_type, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON public.content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content_type ON public.content_views(content_type);
CREATE INDEX IF NOT EXISTS idx_content_views_created_at ON public.content_views(created_at);
CREATE INDEX IF NOT EXISTS idx_content_views_session ON public.content_views(session_id);

-- Create a view to get view counts
CREATE OR REPLACE VIEW public.content_view_counts AS
SELECT 
    content_id,
    content_type,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_session_views,
    MAX(created_at) as last_viewed_at
FROM public.content_views
GROUP BY content_id, content_type;

-- Grant permissions
GRANT SELECT, INSERT ON public.content_views TO service_role;
GRANT SELECT ON public.content_view_counts TO service_role;

-- Enable RLS (Row Level Security)
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert views
CREATE POLICY "Allow service role to manage views" ON public.content_views
    FOR ALL USING (true);

-- Create function to track a view
CREATE OR REPLACE FUNCTION track_content_view(
    p_content_id BIGINT,
    p_content_type VARCHAR(20),
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_user_ip VARCHAR(45) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insert view record (will fail silently if duplicate due to unique constraint)
    INSERT INTO public.content_views (content_id, content_type, session_id, user_ip, user_agent)
    VALUES (p_content_id, p_content_type, COALESCE(p_session_id, gen_random_uuid()::text), p_user_ip, p_user_agent)
    ON CONFLICT (content_id, content_type, session_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION track_content_view TO service_role;
