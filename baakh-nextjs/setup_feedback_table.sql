-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id bigint generated always as identity not null,
  rating integer not null,
  comment text null,
  created_at timestamp with time zone null default now(),
  ip_hash text null,
  constraint feedback_pkey primary key (id),
  constraint feedback_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

-- Create index for IP hash
CREATE INDEX IF NOT EXISTS feedback_ip_hash_idx 
ON public.feedback 
USING btree (ip_hash) 
TABLESPACE pg_default;

-- Create index for created_at for better query performance
CREATE INDEX IF NOT EXISTS feedback_created_at_idx 
ON public.feedback 
USING btree (created_at DESC) 
TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert feedback
CREATE POLICY "Allow public feedback submission" 
ON public.feedback 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Create policy to allow reading feedback (for admin purposes)
CREATE POLICY "Allow reading feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated 
USING (true);

-- Grant necessary permissions
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;
GRANT USAGE ON SEQUENCE public.feedback_id_seq TO anon, authenticated;
