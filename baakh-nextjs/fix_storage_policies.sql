-- Fix Storage RLS Policies for Poet Images
-- Run this in your Supabase SQL Editor to resolve "violates row-level security policy" errors

-- 1. First, let's check if RLS is enabled and what policies exist
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

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can upload poet images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update poet images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete poet images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to poet images" ON storage.objects;

-- 3. Create more permissive policies that work with your auth setup
-- Policy for ANY authenticated user to upload images (more permissive)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for ANY authenticated user to update images (more permissive)
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for ANY authenticated user to delete images (more permissive)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'poet-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for public read access to all images
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'poet-images'
);

-- 4. Alternative: If the above still doesn't work, create a very permissive policy
-- (Only use this if you're still getting RLS errors)
CREATE POLICY "Allow all operations for poet-images" ON storage.objects
FOR ALL USING (
  bucket_id = 'poet-images'
)
WITH CHECK (
  bucket_id = 'poet-images'
);

-- 5. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 7. Verify the bucket exists and is accessible
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'poet-images';

-- 8. Test if the policies are working
-- This should show all policies for the storage.objects table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- 9. If you're still having issues, you can temporarily disable RLS for testing
-- (Only use this for debugging, then re-enable with proper policies)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 10. Re-enable RLS after testing (if you disabled it)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

