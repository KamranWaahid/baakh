-- Full-Text Search setup (FTS) for Baakh
-- Safe to run multiple times; uses IF NOT EXISTS guards

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2) Helper function: build weighted tsvector
-- Weighting: A (highest) → title; B → poet names; C → first lines; D → tags/slug
CREATE OR REPLACE FUNCTION public.build_weighted_tsvector(
  a text, b text, c text, d text
) RETURNS tsvector LANGUAGE sql IMMUTABLE AS $$
  SELECT
    setweight(to_tsvector('simple', coalesce(a,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(b,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(c,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(d,'')), 'D');
$$;

-- 3) Poets: sindhi_name, english_name
ALTER TABLE IF EXISTS public.poets
  ADD COLUMN IF NOT EXISTS fts tsvector;

UPDATE public.poets p
SET fts = build_weighted_tsvector(
  unaccent(coalesce(p.english_name,'')),
  unaccent(coalesce(p.sindhi_name,'')),
  '',
  ''
);

CREATE INDEX IF NOT EXISTS idx_poets_fts ON public.poets USING GIN (fts);

CREATE OR REPLACE FUNCTION public.poets_fts_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.fts := build_weighted_tsvector(
    unaccent(coalesce(NEW.english_name,'')),
    unaccent(coalesce(NEW.sindhi_name,'')),
    '',
    ''
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_poets_fts ON public.poets;
CREATE TRIGGER trg_poets_fts BEFORE INSERT OR UPDATE
  ON public.poets FOR EACH ROW EXECUTE FUNCTION public.poets_fts_trigger();

-- 4) Poetry translations: title (by lang)
ALTER TABLE IF EXISTS public.poetry_translations
  ADD COLUMN IF NOT EXISTS fts tsvector;

UPDATE public.poetry_translations pt
SET fts = build_weighted_tsvector(
  unaccent(coalesce(pt.title,'')), '', '', ''
);

CREATE INDEX IF NOT EXISTS idx_poetry_translations_fts ON public.poetry_translations USING GIN (fts);

CREATE OR REPLACE FUNCTION public.poetry_translations_fts_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.fts := build_weighted_tsvector(unaccent(coalesce(NEW.title,'')), '', '', '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_poetry_translations_fts ON public.poetry_translations;
CREATE TRIGGER trg_poetry_translations_fts BEFORE INSERT OR UPDATE
  ON public.poetry_translations FOR EACH ROW EXECUTE FUNCTION public.poetry_translations_fts_trigger();

-- 5) Couplets: couplet_text (store first lines weighted higher via simple split)
ALTER TABLE IF NOT EXISTS public.couplets
  ADD COLUMN IF NOT EXISTS fts tsvector;

UPDATE public.couplets c
SET fts = build_weighted_tsvector(
  -- A: first line
  unaccent(split_part(coalesce(c.couplet_text,''), E'\n', 1)),
  -- B: second line
  unaccent(split_part(coalesce(c.couplet_text,''), E'\n', 2)),
  -- C: remaining text
  unaccent(coalesce(regexp_replace(c.couplet_text, '^(.*\n){0,2}', ''),'')),
  ''
);

CREATE INDEX IF NOT EXISTS idx_couplets_fts ON public.couplets USING GIN (fts);

CREATE OR REPLACE FUNCTION public.couplets_fts_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.fts := build_weighted_tsvector(
    unaccent(split_part(coalesce(NEW.couplet_text,''), E'\n', 1)),
    unaccent(split_part(coalesce(NEW.couplet_text,''), E'\n', 2)),
    unaccent(coalesce(regexp_replace(NEW.couplet_text, '^(.*\n){0,2}', ''),'')),
    ''
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_couplets_fts ON public.couplets;
CREATE TRIGGER trg_couplets_fts BEFORE INSERT OR UPDATE
  ON public.couplets FOR EACH ROW EXECUTE FUNCTION public.couplets_fts_trigger();

-- 6) Tags: label, slug
ALTER TABLE IF EXISTS public.tags
  ADD COLUMN IF NOT EXISTS fts tsvector;

UPDATE public.tags t
SET fts = build_weighted_tsvector('', '', '', unaccent(coalesce(t.label,'') || ' ' || coalesce(t.slug,'')));

CREATE INDEX IF NOT EXISTS idx_tags_fts ON public.tags USING GIN (fts);

CREATE OR REPLACE FUNCTION public.tags_fts_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.fts := build_weighted_tsvector('', '', '', unaccent(coalesce(NEW.label,'') || ' ' || coalesce(NEW.slug,'')));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tags_fts ON public.tags;
CREATE TRIGGER trg_tags_fts BEFORE INSERT OR UPDATE
  ON public.tags FOR EACH ROW EXECUTE FUNCTION public.tags_fts_trigger();

-- 7) Convenience websearch query example (to wire in API later):
-- SELECT *, ts_rank(fts, websearch_to_tsquery('simple', unaccent($1))) AS r
-- FROM poets
-- WHERE fts @@ websearch_to_tsquery('simple', unaccent($1))
-- ORDER BY r DESC
-- LIMIT 10;


