-- Fix the table schema to make user_id nullable and fix constraints

-- First, let's make user_id nullable since we're using user_uuid as the primary identifier
ALTER TABLE public.user_likes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_bookmarks ALTER COLUMN user_id DROP NOT NULL;

-- Drop the existing unique constraints that are causing issues
DROP INDEX IF EXISTS idx_user_likes_unique_like;
DROP INDEX IF EXISTS idx_user_bookmarks_unique_bookmark;

-- Recreate the unique constraints properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_likes_unique_like 
ON public.user_likes (user_uuid, likeable_id, likeable_type) 
WHERE user_uuid IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_bookmarks_unique_bookmark 
ON public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type) 
WHERE user_uuid IS NOT NULL;

-- Update the functions to handle the nullable user_id
CREATE OR REPLACE FUNCTION public.insert_user_like(
    p_user_uuid UUID,
    p_likeable_id BIGINT,
    p_likeable_type VARCHAR(191)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert the like with user_id as NULL since we're using user_uuid
    INSERT INTO public.user_likes (user_uuid, likeable_id, likeable_type, user_id)
    VALUES (p_user_uuid, p_likeable_id, p_likeable_type, NULL)
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
    -- Insert the bookmark with user_id as NULL since we're using user_uuid
    INSERT INTO public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type, user_id)
    VALUES (p_user_uuid, p_bookmarkable_id, p_bookmarkable_type, NULL)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_like(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO authenticated;

GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_like(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO service_role;
