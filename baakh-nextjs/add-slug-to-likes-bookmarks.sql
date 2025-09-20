-- Add couplet_slug column to user_likes and user_bookmarks tables
-- This will store the slug of the couplet when it's liked or bookmarked

-- Add couplet_slug column to user_likes table
ALTER TABLE public.user_likes 
ADD COLUMN IF NOT EXISTS couplet_slug VARCHAR(255);

-- Add couplet_slug column to user_bookmarks table  
ALTER TABLE public.user_bookmarks 
ADD COLUMN IF NOT EXISTS couplet_slug VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_likes_couplet_slug 
ON public.user_likes (couplet_slug);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_couplet_slug 
ON public.user_bookmarks (couplet_slug);

-- Update existing records to populate couplet_slug
-- This will fetch the slug from poetry_couplets table for existing likes
UPDATE public.user_likes 
SET couplet_slug = pc.couplet_slug
FROM public.poetry_couplets pc
WHERE user_likes.likeable_id = pc.id 
  AND user_likes.likeable_type = 'couplet'
  AND user_likes.couplet_slug IS NULL;

-- Update existing records to populate couplet_slug
-- This will fetch the slug from poetry_couplets table for existing bookmarks
UPDATE public.user_bookmarks 
SET couplet_slug = pc.couplet_slug
FROM public.poetry_couplets pc
WHERE user_bookmarks.bookmarkable_id = pc.id 
  AND user_bookmarks.bookmarkable_type = 'couplet'
  AND user_bookmarks.couplet_slug IS NULL;

-- Update the insert functions to include couplet_slug parameter
CREATE OR REPLACE FUNCTION public.insert_user_like(
    p_user_uuid UUID,
    p_likeable_id BIGINT,
    p_likeable_type VARCHAR(191),
    p_couplet_slug VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_id_from_table UUID;
BEGIN
    -- Get the user_id from e2ee_users table
    SELECT user_id INTO user_id_from_table
    FROM public.e2ee_users
    WHERE user_id = p_user_uuid;

    -- If user not found, return error
    IF user_id_from_table IS NULL THEN
        result := json_build_object(
            'success', false,
            'error', 'User not found in e2ee_users table'
        );
        RETURN result;
    END IF;

    -- Insert the like with both user_uuid and user_id (they should be the same)
    INSERT INTO public.user_likes (user_uuid, likeable_id, likeable_type, user_id, couplet_slug)
    VALUES (p_user_uuid, p_likeable_id, p_likeable_type, user_id_from_table, p_couplet_slug);

    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Like added successfully',
        'user_id', user_id_from_table,
        'couplet_slug', p_couplet_slug
    );

    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- If it's a duplicate, just return success
        result := json_build_object(
            'success', true,
            'message', 'Like already exists',
            'user_id', user_id_from_table,
            'couplet_slug', p_couplet_slug
        );
        RETURN result;
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
    p_bookmarkable_type VARCHAR(191),
    p_couplet_slug VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_id_from_table UUID;
BEGIN
    -- Get the user_id from e2ee_users table
    SELECT user_id INTO user_id_from_table
    FROM public.e2ee_users
    WHERE user_id = p_user_uuid;

    -- If user not found, return error
    IF user_id_from_table IS NULL THEN
        result := json_build_object(
            'success', false,
            'error', 'User not found in e2ee_users table'
        );
        RETURN result;
    END IF;

    -- Insert the bookmark with both user_uuid and user_id (they should be the same)
    INSERT INTO public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type, user_id, couplet_slug)
    VALUES (p_user_uuid, p_bookmarkable_id, p_bookmarkable_type, user_id_from_table, p_couplet_slug);

    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Bookmark added successfully',
        'user_id', user_id_from_table,
        'couplet_slug', p_couplet_slug
    );

    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- If it's a duplicate, just return success
        result := json_build_object(
            'success', true,
            'message', 'Bookmark already exists',
            'user_id', user_id_from_table,
            'couplet_slug', p_couplet_slug
        );
        RETURN result;
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191), VARCHAR(255)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191), VARCHAR(255)) TO authenticated;
