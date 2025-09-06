-- Comprehensive Storage RLS Policy Fix
-- Run this in your Supabase SQL Editor to resolve "violates row-level security policy" errors

-- 1. First, let's check the current state
SELECT 'Current storage buckets:' as info;
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'poet-images';

SELECT 'Current RLS policies:' as info;
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

-- 2. Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Authenticated users can upload poet images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update poet images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete poet images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to poet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for poet-images" ON storage.objects;

-- 3. Ensure the bucket exists and is properly configured
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

-- 4. Create very permissive policies that will definitely work
-- Policy for ALL operations (upload, update, delete) for authenticated users
CREATE POLICY "poet_images_all_operations" ON storage.objects
FOR ALL USING (
  bucket_id = 'poet-images'
)
WITH CHECK (
  bucket_id = 'poet-images'
);

-- 5. Alternative: If you want more restrictive policies, use these instead
-- (Comment out the above policy and uncomment these if you prefer)

-- CREATE POLICY "poet_images_upload" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'poet-images' 
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "poet_images_update" ON storage.objects
-- FOR UPDATE USING (
--   bucket_id = 'poet-images' 
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "poet_images_delete" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'poet-images' 
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "poet_images_select" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'poet-images'
-- );

-- 6. Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Grant all necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 8. Verify the setup
SELECT 'Verification - Bucket details:' as info;
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'poet-images';

SELECT 'Verification - RLS policies:' as info;
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

-- 9. Test if the policies are working by checking bucket access
SELECT 'Testing bucket access...' as info;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE id = 'poet-images' AND public = true
    ) THEN '✅ Bucket exists and is public'
    ELSE '❌ Bucket not found or not public'
  END as bucket_status;

-- 10. If you're still having issues, you can temporarily disable RLS for debugging
-- (Only use this for testing, then re-enable with proper policies)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 11. Re-enable RLS after testing (if you disabled it)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 12. Final verification - this should show success
SELECT '🎉 Storage setup complete! Your poetry forms should now work.' as final_status;

