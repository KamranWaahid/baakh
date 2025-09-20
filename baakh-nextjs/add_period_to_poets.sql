-- Add period information to poets table
-- This migration adds period_id foreign key to poets table

-- Add period_id column to poets table
ALTER TABLE public.poets 
ADD COLUMN IF NOT EXISTS period_id UUID REFERENCES public.timeline_periods(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_poets_period_id ON public.poets(period_id);

-- Update existing poets with period information based on their birth dates
-- This is a sample update - you may need to adjust the period assignments based on your data

-- Assign poets to Classical Sindhi Poetry period (1500-1800)
UPDATE public.poets 
SET period_id = (
    SELECT id FROM public.timeline_periods 
    WHERE period_slug = 'classical-sindhi-poetry'
)
WHERE (birth_date::integer BETWEEN 1500 AND 1800) 
   OR (sindhi_name ILIKE '%شاه عبداللطيف%' OR english_name ILIKE '%Shah Abdul Latif%')
   OR (sindhi_name ILIKE '%سچل سرمست%' OR english_name ILIKE '%Sachal Sarmast%');

-- Assign poets to Modern Sindhi Literature period (1800-1950)
UPDATE public.poets 
SET period_id = (
    SELECT id FROM public.timeline_periods 
    WHERE period_slug = 'modern-sindhi-literature'
)
WHERE (birth_date::integer BETWEEN 1800 AND 1950) 
   AND period_id IS NULL;

-- Assign poets to Contemporary Sindhi Poetry period (1950-present)
UPDATE public.poets 
SET period_id = (
    SELECT id FROM public.timeline_periods 
    WHERE period_slug = 'contemporary-sindhi-poetry'
)
WHERE (birth_date::integer >= 1950) 
   AND period_id IS NULL;

-- Verify the updates
SELECT 
    p.sindhi_name,
    p.english_name,
    p.birth_date,
    tp.period_slug,
    tp.english_name as period_name
FROM public.poets p
LEFT JOIN public.timeline_periods tp ON p.period_id = tp.id
ORDER BY p.birth_date::integer;
