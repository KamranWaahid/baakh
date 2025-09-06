-- Supabase Storage Bucket Setup for Poet Images
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for poet images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'poet-images',
  'poet-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create storage policies for the bucket
-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload poet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update poet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete poet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for public read access to poet images
CREATE POLICY "Public read access to poet images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'poet-images'
);

-- 3. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 4. Create a function to clean up orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_poet_images()
RETURNS void AS $$
BEGIN
  -- Delete images that are no longer referenced in the poets table
  DELETE FROM storage.objects 
  WHERE bucket_id = 'poet-images'
    AND name NOT IN (
      SELECT DISTINCT 
        CASE 
          WHEN file_url LIKE '%/%' THEN split_part(file_url, '/', -1)
          ELSE file_url
        END
      FROM poets 
      WHERE file_url IS NOT NULL AND file_url != ''
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Create a trigger to automatically clean up images when poets are deleted
CREATE OR REPLACE FUNCTION handle_poet_image_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  -- If a poet is deleted and had an image, delete the image file
  IF OLD.file_url IS NOT NULL AND OLD.file_url != '' THEN
    -- Extract filename from URL
    DELETE FROM storage.objects 
    WHERE bucket_id = 'poet-images'
      AND name = CASE 
        WHEN OLD.file_url LIKE '%/%' THEN split_part(OLD.file_url, '/', -1)
        ELSE OLD.file_url
      END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS poet_image_cleanup_trigger ON poets;
CREATE TRIGGER poet_image_cleanup_trigger
  BEFORE DELETE ON poets
  FOR EACH ROW
  EXECUTE FUNCTION handle_poet_image_cleanup();

-- 6. Verify the setup
SELECT 
  'Storage bucket setup complete!' as status,
  b.id as bucket_id,
  b.name as bucket_name,
  b.public as is_public,
  b.file_size_limit as max_file_size_bytes,
  b.allowed_mime_types
FROM storage.buckets b
WHERE b.id = 'poet-images';

-- Show created policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

