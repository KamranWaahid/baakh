-- Sindhi-optimized search functions
-- These functions work better with Sindhi text by avoiding unaccent and using ILIKE fallbacks

-- 1) Improved poets search with Sindhi support
CREATE OR REPLACE FUNCTION public.search_poets_sindhi(q text)
RETURNS TABLE(poet_id bigint, sindhi_name text, english_name text, file_url text, poet_slug text, rank real)
LANGUAGE sql STABLE AS $$
  WITH fts_results AS (
    SELECT p.poet_id, p.sindhi_name, p.english_name, p.file_url, p.poet_slug,
           ts_rank(p.fts, websearch_to_tsquery('simple', q)) AS rank
    FROM public.poets p
    WHERE p.fts @@ websearch_to_tsquery('simple', q)
  ),
  ilike_results AS (
    SELECT p.poet_id, p.sindhi_name, p.english_name, p.file_url, p.poet_slug,
           CASE 
             WHEN p.sindhi_name ILIKE '%' || q || '%' THEN 0.8
             WHEN p.english_name ILIKE '%' || q || '%' THEN 0.6
             ELSE 0.4
           END AS rank
    FROM public.poets p
    WHERE p.sindhi_name ILIKE '%' || q || '%' 
       OR p.english_name ILIKE '%' || q || '%'
  )
  SELECT * FROM fts_results
  UNION ALL
  SELECT * FROM ilike_results
  WHERE NOT EXISTS (SELECT 1 FROM fts_results f WHERE f.poet_id = ilike_results.poet_id)
  ORDER BY rank DESC
  LIMIT 10;
$$;

-- 2) Improved poetry search with Sindhi support
CREATE OR REPLACE FUNCTION public.search_poetry_sindhi(q text, lang text)
RETURNS TABLE(poetry_id bigint, title text, lang text, rank real)
LANGUAGE sql STABLE AS $$
  WITH fts_results AS (
    SELECT pt.poetry_id, pt.title, pt.lang,
           ts_rank(pt.fts, websearch_to_tsquery('simple', q)) AS rank
    FROM public.poetry_translations pt
    WHERE pt.lang = lang
      AND pt.fts @@ websearch_to_tsquery('simple', q)
  ),
  ilike_results AS (
    SELECT pt.poetry_id, pt.title, pt.lang,
           CASE 
             WHEN pt.title ILIKE '%' || q || '%' THEN 0.8
             ELSE 0.4
           END AS rank
    FROM public.poetry_translations pt
    WHERE pt.lang = lang
      AND pt.title ILIKE '%' || q || '%'
  )
  SELECT * FROM fts_results
  UNION ALL
  SELECT * FROM ilike_results
  WHERE NOT EXISTS (SELECT 1 FROM fts_results f WHERE f.poetry_id = ilike_results.poetry_id)
  ORDER BY rank DESC
  LIMIT 10;
$$;

-- 3) Improved couplets search with Sindhi support
CREATE OR REPLACE FUNCTION public.search_couplets_sindhi(q text, lang text)
RETURNS TABLE(id bigint, couplet_text text, lang text, poetry_id bigint, rank real)
LANGUAGE sql STABLE AS $$
  WITH fts_results AS (
    SELECT c.id, c.couplet_text, c.lang, c.poetry_id,
           ts_rank(c.fts, websearch_to_tsquery('simple', q)) AS rank
    FROM public.couplets c
    WHERE c.lang = lang
      AND (c.poetry_id IS NULL OR c.poetry_id = 0)
      AND c.fts @@ websearch_to_tsquery('simple', q)
  ),
  ilike_results AS (
    SELECT c.id, c.couplet_text, c.lang, c.poetry_id,
           CASE 
             WHEN c.couplet_text ILIKE '%' || q || '%' THEN 0.8
             ELSE 0.4
           END AS rank
    FROM public.couplets c
    WHERE c.lang = lang
      AND (c.poetry_id IS NULL OR c.poetry_id = 0)
      AND c.couplet_text ILIKE '%' || q || '%'
  )
  SELECT * FROM fts_results
  UNION ALL
  SELECT * FROM ilike_results
  WHERE NOT EXISTS (SELECT 1 FROM fts_results f WHERE f.id = ilike_results.id)
  ORDER BY rank DESC
  LIMIT 10;
$$;

-- 4) Improved tags search with Sindhi support
CREATE OR REPLACE FUNCTION public.search_tags_sindhi(q text)
RETURNS TABLE(id bigint, slug text, label text, rank real)
LANGUAGE sql STABLE AS $$
  WITH fts_results AS (
    SELECT t.id, t.slug, t.label,
           ts_rank(t.fts, websearch_to_tsquery('simple', q)) AS rank
    FROM public.tags t
    WHERE t.fts @@ websearch_to_tsquery('simple', q)
  ),
  ilike_results AS (
    SELECT t.id, t.slug, t.label,
           CASE 
             WHEN t.label ILIKE '%' || q || '%' THEN 0.8
             WHEN t.slug ILIKE '%' || q || '%' THEN 0.6
             ELSE 0.4
           END AS rank
    FROM public.tags t
    WHERE t.label ILIKE '%' || q || '%' 
       OR t.slug ILIKE '%' || q || '%'
  )
  SELECT * FROM fts_results
  UNION ALL
  SELECT * FROM ilike_results
  WHERE NOT EXISTS (SELECT 1 FROM fts_results f WHERE f.id = ilike_results.id)
  ORDER BY rank DESC
  LIMIT 10;
$$;

-- 5) Simple ILIKE search for debugging
CREATE OR REPLACE FUNCTION public.search_simple_ilike(q text, lang text)
RETURNS TABLE(
  type text,
  id bigint,
  title text,
  subtitle text,
  content text,
  rank real
)
LANGUAGE sql STABLE AS $$
  SELECT 
    'poet' as type,
    p.poet_id as id,
    COALESCE(p.sindhi_name, p.english_name) as title,
    'شاعر' as subtitle,
    COALESCE(p.sindhi_name, p.english_name) as content,
    CASE 
      WHEN p.sindhi_name ILIKE '%' || q || '%' THEN 1.0
      WHEN p.english_name ILIKE '%' || q || '%' THEN 0.8
      ELSE 0.0
    END AS rank
  FROM public.poets p
  WHERE p.sindhi_name ILIKE '%' || q || '%' 
     OR p.english_name ILIKE '%' || q || '%'
  
  UNION ALL
  
  SELECT 
    'poetry' as type,
    pt.poetry_id as id,
    pt.title,
    'شاعري' as subtitle,
    pt.title as content,
    CASE 
      WHEN pt.title ILIKE '%' || q || '%' THEN 1.0
      ELSE 0.0
    END AS rank
  FROM public.poetry_translations pt
  WHERE pt.lang = lang
    AND pt.title ILIKE '%' || q || '%'
  
  UNION ALL
  
  SELECT 
    'couplet' as type,
    c.id,
    LEFT(c.couplet_text, 50) || '...' as title,
    'شعر' as subtitle,
    c.couplet_text as content,
    CASE 
      WHEN c.couplet_text ILIKE '%' || q || '%' THEN 1.0
      ELSE 0.0
    END AS rank
  FROM public.couplets c
  WHERE c.lang = lang
    AND (c.poetry_id IS NULL OR c.poetry_id = 0)
    AND c.couplet_text ILIKE '%' || q || '%'
  
  ORDER BY rank DESC
  LIMIT 20;
$$;
