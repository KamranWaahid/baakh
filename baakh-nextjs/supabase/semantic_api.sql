-- Semantic RPCs (expects you to pass an embedding vector for the query)

-- Poetry semantic search
CREATE OR REPLACE FUNCTION public.search_semantic_poetry(qvec vector, lang text, k int DEFAULT 10)
RETURNS TABLE(poetry_id bigint, title text, lang text, dist real)
LANGUAGE sql STABLE AS $$
  SELECT pt.poetry_id, pt.title, pt.lang, (pt.emb <-> qvec) AS dist
  FROM public.poetry_translations pt
  WHERE pt.lang = lang AND pt.emb IS NOT NULL
  ORDER BY pt.emb <-> qvec ASC
  LIMIT k;
$$;

-- Couplets semantic search
CREATE OR REPLACE FUNCTION public.search_semantic_couplets(qvec vector, lang text, k int DEFAULT 10)
RETURNS TABLE(id bigint, couplet_text text, lang text, poetry_id bigint, dist real)
LANGUAGE sql STABLE AS $$
  SELECT c.id, c.couplet_text, c.lang, c.poetry_id, (c.emb <-> qvec) AS dist
  FROM public.couplets c
  WHERE c.lang = lang AND (c.poetry_id IS NULL OR c.poetry_id = 0) AND c.emb IS NOT NULL
  ORDER BY c.emb <-> qvec ASC
  LIMIT k;
$$;


