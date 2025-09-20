-- Fix user_id column type in user_likes and user_bookmarks tables
-- Change user_id from BIGINT to UUID to match e2ee_users.user_id

-- First, drop any views that depend on user_id column
DROP VIEW IF EXISTS public.v_user_likes_with_user;
DROP VIEW IF EXISTS public.v_user_bookmarks_with_user;

-- Drop the existing foreign key constraints and indexes
ALTER TABLE public.user_likes DROP CONSTRAINT IF EXISTS user_likes_user_id_fkey;
ALTER TABLE public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_user_id_fkey;

-- Drop the unique indexes that include user_id
DROP INDEX IF EXISTS idx_user_likes_unique_like;
DROP INDEX IF EXISTS idx_user_bookmarks_unique_bookmark;

-- Change user_id column type from BIGINT to UUID
ALTER TABLE public.user_likes ALTER COLUMN user_id TYPE UUID USING user_id::TEXT::UUID;
ALTER TABLE public.user_bookmarks ALTER COLUMN user_id TYPE UUID USING user_id::TEXT::UUID;

-- Update existing records to set user_id = user_uuid where user_id is null
UPDATE public.user_likes SET user_id = user_uuid WHERE user_id IS NULL;
UPDATE public.user_bookmarks SET user_id = user_uuid WHERE user_id IS NULL;

-- Make user_id NOT NULL now that it's populated
ALTER TABLE public.user_likes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_bookmarks ALTER COLUMN user_id SET NOT NULL;

-- Recreate the unique indexes with the correct column types
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_likes_unique_like 
ON public.user_likes (user_uuid, likeable_id, likeable_type) 
WHERE user_uuid IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_bookmarks_unique_bookmark 
ON public.user_bookmarks (user_uuid, bookmarkable_id, bookmarkable_type) 
WHERE user_uuid IS NOT NULL;

-- Add foreign key constraints to e2ee_users table
ALTER TABLE public.user_likes 
ADD CONSTRAINT user_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.e2ee_users(user_id) 
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.user_bookmarks 
ADD CONSTRAINT user_bookmarks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.e2ee_users(user_id) 
ON UPDATE CASCADE ON DELETE CASCADE;

-- Recreate the view with the correct column types
CREATE OR REPLACE VIEW public.v_user_likes_with_user AS
SELECT 
    ul.id,
    ul.user_id,
    ul.user_uuid,
    ul.likeable_id,
    ul.likeable_type,
    ul.created_at,
    ul.updated_at,
    eu.username,
    eu.sindhi_name
FROM public.user_likes ul
LEFT JOIN public.e2ee_users eu ON ul.user_id = eu.user_id;

CREATE OR REPLACE VIEW public.v_user_bookmarks_with_user AS
SELECT 
    ub.id,
    ub.user_id,
    ub.user_uuid,
    ub.bookmarkable_id,
    ub.bookmarkable_type,
    ub.created_at,
    ub.updated_at,
    eu.username,
    eu.sindhi_name
FROM public.user_bookmarks ub
LEFT JOIN public.e2ee_users eu ON ub.user_id = eu.user_id;
