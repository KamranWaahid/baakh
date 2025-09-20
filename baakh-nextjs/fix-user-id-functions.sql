-- Fix user_id population in user_likes and user_bookmarks functions
-- This will populate user_id from e2ee_users table when inserting likes/bookmarks

CREATE OR REPLACE FUNCTION public.insert_user_like(
    p_user_uuid UUID,
    p_likeable_id BIGINT,
    p_likeable_type VARCHAR(191)
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
    INSERT INTO public.user_likes (user_uuid, likeable_id, likeable_type, user_id)
    VALUES (p_user_uuid, p_likeable_id, p_likeable_type, user_id_from_table);
    
    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Like added successfully',
        'user_id', user_id_from_table
    );
    
    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- If it's a duplicate, just return success
        result := json_build_object(
            'success', true,
            'message', 'Like already exists',
            'user_id', user_id_from_table
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
    p_bookmarkable_type VARCHAR(191)
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
    INSERT INTO public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type, user_id)
    VALUES (p_user_uuid, p_bookmarkable_id, p_bookmarkable_type, user_id_from_table);
    
    -- Return success
    result := json_build_object(
        'success', true,
        'message', 'Bookmark added successfully',
        'user_id', user_id_from_table
    );
    
    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- If it's a duplicate, just return success
        result := json_build_object(
            'success', true,
            'message', 'Bookmark already exists',
            'user_id', user_id_from_table
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
GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO authenticated;

GRANT EXECUTE ON FUNCTION public.insert_user_like(UUID, BIGINT, VARCHAR(191)) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_user_bookmark(UUID, BIGINT, VARCHAR(191)) TO service_role;
