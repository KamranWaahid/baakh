-- Did-you-mean suggestions via pg_trgm similarity across poets and tags
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.search_suggest(q text)
RETURNS TABLE(suggestion text, score real)
LANGUAGE sql STABLE AS $$
  WITH cand AS (
    SELECT p.english_name::text AS s FROM public.poets p
    UNION
    SELECT p.sindhi_name::text AS s FROM public.poets p
    UNION
    SELECT t.label::text AS s FROM public.tags t
    UNION
    SELECT t.slug::text AS s FROM public.tags t
  )
  SELECT s AS suggestion, similarity(s, q) AS score
  FROM cand
  WHERE s IS NOT NULL AND length(s) > 0
  ORDER BY similarity(s, q) DESC
  LIMIT 1;
$$;


