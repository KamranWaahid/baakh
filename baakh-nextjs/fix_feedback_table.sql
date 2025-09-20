-- Fix feedback table constraints and permissions

-- 1. Update rating constraint to match UI (1-5 instead of 0-10)
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_rating_check CHECK (
  (rating >= 1) AND (rating <= 5)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow anyone to insert feedback
CREATE POLICY IF NOT EXISTS "Allow public feedback submission" 
ON public.feedback 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 4. Create policy to allow reading feedback (for admin purposes)
CREATE POLICY IF NOT EXISTS "Allow reading feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Grant necessary permissions
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;
GRANT USAGE ON SEQUENCE public.feedback_id_seq TO anon, authenticated;

-- 6. Create additional index for better performance
CREATE INDEX IF NOT EXISTS feedback_created_at_idx 
ON public.feedback 
USING btree (created_at DESC);

-- 7. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
AND table_schema = 'public'
ORDER BY ordinal_position;
