-- pgvector semantic search setup (run in Supabase SQL editor)
-- 1) Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Add embedding columns (384 dims by default; adjust to your model)
-- Poetry titles
ALTER TABLE IF EXISTS public.poetry_translations
  ADD COLUMN IF NOT EXISTS emb vector(384);

-- Couplets (two-line text)
ALTER TABLE IF EXISTS public.couplets
  ADD COLUMN IF NOT EXISTS emb vector(384);

-- 3) Indexes (IVFFlat recommended for large data sets; requires lists tuning)
-- Fallback to HNSW if available; here using IVFFlat
CREATE INDEX IF NOT EXISTS idx_poetry_translations_emb
  ON public.poetry_translations USING ivfflat (emb vector_l2_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_couplets_emb
  ON public.couplets USING ivfflat (emb vector_l2_ops) WITH (lists = 100);

-- 4) NOTE: You need to backfill embeddings for existing rows from your app/server.
-- Example pseudo:
-- UPDATE public.poetry_translations SET emb = ${embed(title)} WHERE emb IS NULL;
-- UPDATE public.couplets SET emb = ${embed(couplet_text)} WHERE emb IS NULL;


