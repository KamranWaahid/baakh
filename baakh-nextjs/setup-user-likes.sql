-- Create user_likes table with polymorphic structure
CREATE TABLE IF NOT EXISTS public.user_likes (
  id BIGSERIAL NOT NULL,
  user_id BIGINT NOT NULL,
  likeable_id BIGINT NOT NULL,
  likeable_type CHARACTER VARYING(191) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL,
  user_uuid UUID NULL,
  CONSTRAINT user_likes_pkey PRIMARY KEY (id),
  CONSTRAINT user_likes_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE SET NULL NOT VALID
) TABLESPACE pg_default;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_likes_user_uuid ON public.user_likes USING btree (user_uuid) TABLESPACE pg_default;

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_likes_unique_like 
ON public.user_likes (user_uuid, likeable_id, likeable_type) 
WHERE user_uuid IS NOT NULL;

-- Create trigger for updated_at (only if function doesn't exist)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS set_updated_at_user_likes ON user_likes;
CREATE TRIGGER set_updated_at_user_likes 
BEFORE UPDATE ON user_likes 
FOR EACH ROW 
WHEN (old.* IS DISTINCT FROM new.*)
EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first)
DROP POLICY IF EXISTS "Users can view all likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;

CREATE POLICY "Users can view all likes" ON public.user_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.user_likes
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can delete their own likes" ON public.user_likes
    FOR DELETE USING (auth.uid() = user_uuid);

-- Grant permissions
GRANT ALL ON public.user_likes TO authenticated;
GRANT USAGE ON SEQUENCE public.user_likes_id_seq TO authenticated;

-- Create functions for like/unlike operations
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

-- Create user_bookmarks table with polymorphic structure
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id BIGSERIAL NOT NULL,
  user_id BIGINT NOT NULL,
  bookmarkable_id BIGINT NOT NULL,
  bookmarkable_type CHARACTER VARYING(191) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL,
  user_uuid UUID NULL,
  CONSTRAINT user_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT user_bookmarks_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE SET NULL NOT VALID
) TABLESPACE pg_default;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_uuid ON public.user_bookmarks USING btree (user_uuid) TABLESPACE pg_default;

-- Create unique constraint to prevent duplicate bookmarks
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_bookmarks_unique_bookmark 
ON public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type) 
WHERE user_uuid IS NOT NULL;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_user_bookmarks ON user_bookmarks;
CREATE TRIGGER set_updated_at_user_bookmarks 
BEFORE UPDATE ON user_bookmarks 
FOR EACH ROW 
WHEN (old.* IS DISTINCT FROM new.*)
EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookmarks (drop existing ones first)
DROP POLICY IF EXISTS "Users can view all bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_bookmarks;

CREATE POLICY "Users can view all bookmarks" ON public.user_bookmarks
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_uuid);

-- Grant permissions
GRANT ALL ON public.user_bookmarks TO authenticated;
GRANT USAGE ON SEQUENCE public.user_bookmarks_id_seq TO authenticated;

-- Create functions for bookmark/unbookmark operations
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
