-- Fix feedback table constraints and permissions (Corrected SQL)

-- 1. Update rating constraint to match UI (1-5 instead of 0-10)
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_rating_check CHECK (
  (rating >= 1) AND (rating <= 5)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public feedback submission" ON public.feedback;
DROP POLICY IF EXISTS "Allow reading feedback" ON public.feedback;

-- 4. Create policy to allow anyone to insert feedback
CREATE POLICY "Allow public feedback submission" 
ON public.feedback 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Create policy to allow reading feedback (for admin purposes)
CREATE POLICY "Allow reading feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated 
USING (true);

-- 6. Grant necessary permissions
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;
GRANT USAGE ON SEQUENCE public.feedback_id_seq TO anon, authenticated;

-- 7. Create additional index for better performance
CREATE INDEX IF NOT EXISTS feedback_created_at_idx 
ON public.feedback 
USING btree (created_at DESC);

-- 8. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
AND table_schema = 'public'
ORDER BY ordinal_position;
