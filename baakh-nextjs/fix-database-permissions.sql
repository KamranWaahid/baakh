-- Fix database permissions and ensure functions work properly

-- First, let's check if the functions exist and recreate them if needed
DROP FUNCTION IF EXISTS public.insert_user_like(UUID, BIGINT, VARCHAR(191));
DROP FUNCTION IF EXISTS public.delete_user_like(UUID, BIGINT, VARCHAR(191));
DROP FUNCTION IF EXISTS public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191));
DROP FUNCTION IF EXISTS public.delete_user_bookmark(UUID, BIGINT, VARCHAR(191));

-- Recreate the functions with proper permissions
CREATE OR REPLACE FUNCTION public.insert_user_like(
    p_user_uuid UUID,
    p_likeable_id BIGINT,
    p_likeable_type VARCHAR(191)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert the like
    INSERT INTO public.user_likes (user_uuid, likeable_id, likeable_type)
    VALUES (p_user_uuid, p_likeable_id, p_likeable_type)
    ON CONFLICT (user_uuid, likeable_id, likeable_type) DO NOTHING;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Like added successfully'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_user_like(
    p_user_uuid UUID,
    p_likeable_id BIGINT,
    p_likeable_type VARCHAR(191)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    deleted_count INTEGER;
BEGIN
    -- Delete the like
    DELETE FROM public.user_likes 
    WHERE user_uuid = p_user_uuid 
    AND likeable_id = p_likeable_id 
    AND likeable_type = p_likeable_type;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return result
    result := json_build_object(
        'success', true,
        'deleted', deleted_count > 0,
        'message', CASE WHEN deleted_count > 0 THEN 'Like removed successfully' ELSE 'No like found to remove' END
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.insert_user_bookmark(
    p_user_uuid UUID,
    p_bookmarkable_id BIGINT,
    p_bookmarkable_type VARCHAR(191)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert the bookmark
    INSERT INTO public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type)
    VALUES (p_user_uuid, p_bookmarkable_id, p_bookmarkable_type)
    ON CONFLICT (user_uuid, bookmarkable_id, bookmarkable_type) DO NOTHING;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Bookmark added successfully'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_user_bookmark(
    p_user_uuid UUID,
    p_bookmarkable_id BIGINT,
    p_bookmarkable_type VARCHAR(191)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    deleted_count INTEGER;
BEGIN
    -- Delete the bookmark
    DELETE FROM public.user_bookmarks 
    WHERE user_uuid = p_user_uuid 
    AND bookmarkable_id = p_bookmarkable_id 
    AND bookmarkable_type = p_bookmarkable_type;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return result
    result := json_build_object(
        'success', true,
        'deleted', deleted_count > 0,
        'message', CASE WHEN deleted_count > 0 THEN 'Bookmark removed successfully' ELSE 'No bookmark found to remove' END
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_like(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO authenticated;

-- Grant execute permissions to service role as well
GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_like(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO service_role;

-- Fix RLS policies for user_likes
DROP POLICY IF EXISTS "Users can view all likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;

CREATE POLICY "Anyone can view likes" ON public.user_likes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert likes" ON public.user_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete likes" ON public.user_likes
    FOR DELETE USING (true);

-- Fix RLS policies for user_bookmarks
DROP POLICY IF EXISTS "Users can view all bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_bookmarks;

CREATE POLICY "Anyone can view bookmarks" ON public.user_bookmarks
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete bookmarks" ON public.user_bookmarks
    FOR DELETE USING (true);

-- Grant additional permissions
GRANT ALL ON public.user_likes TO authenticated;
GRANT ALL ON public.user_likes TO service_role;
GRANT ALL ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE public.user_likes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_likes_id_seq TO service_role;
GRANT USAGE ON SEQUENCE public.user_bookmarks_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_bookmarks_id_seq TO service_role;
