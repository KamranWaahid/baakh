-- Ranked FTS RPCs (run after search_fts_setup.sql)

CREATE OR REPLACE FUNCTION public.search_ranked_poets(q text)
RETURNS TABLE(poet_id bigint, sindhi_name text, english_name text, file_url text, poet_slug text, rank real)
LANGUAGE sql STABLE AS $$
  SELECT p.poet_id, p.sindhi_name, p.english_name, p.file_url, p.poet_slug,
         ts_rank(p.fts, websearch_to_tsquery('simple', unaccent(q))) AS rank
  FROM public.poets p
  WHERE p.fts @@ websearch_to_tsquery('simple', unaccent(q))
  ORDER BY rank DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.search_ranked_poetry(q text, lang text)
RETURNS TABLE(poetry_id bigint, title text, lang text, rank real)
LANGUAGE sql STABLE AS $$
  SELECT pt.poetry_id, pt.title, pt.lang,
         ts_rank(pt.fts, websearch_to_tsquery('simple', unaccent(q))) AS rank
  FROM public.poetry_translations pt
  WHERE pt.lang = lang
    AND pt.fts @@ websearch_to_tsquery('simple', unaccent(q))
  ORDER BY rank DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.search_ranked_couplets(q text, lang text)
RETURNS TABLE(id bigint, couplet_text text, lang text, poetry_id bigint, rank real)
LANGUAGE sql STABLE AS $$
  SELECT c.id, c.couplet_text, c.lang, c.poetry_id,
         ts_rank(c.fts, websearch_to_tsquery('simple', unaccent(q))) AS rank
  FROM public.couplets c
  WHERE c.lang = lang
    AND (c.poetry_id IS NULL OR c.poetry_id = 0)
    AND c.fts @@ websearch_to_tsquery('simple', unaccent(q))
  ORDER BY rank DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.search_ranked_tags(q text)
RETURNS TABLE(id bigint, slug text, label text, rank real)
LANGUAGE sql STABLE AS $$
  SELECT t.id, t.slug, t.label,
         ts_rank(t.fts, websearch_to_tsquery('simple', unaccent(q))) AS rank
  FROM public.tags t
  WHERE t.fts @@ websearch_to_tsquery('simple', unaccent(q))
  ORDER BY rank DESC
  LIMIT 10;
$$;


