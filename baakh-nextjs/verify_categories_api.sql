-- Verify Categories API Setup
-- This script checks the existing data and relationships for the categories API

-- 1. Check existing categories
SELECT '=== EXISTING CATEGORIES ===' as info;
SELECT 
    c.id,
    c.slug,
    c.content_style,
    c.gender,
    c.is_featured,
    cd.cat_name,
    cd.lang
FROM public.categories c
LEFT JOIN public.category_details cd ON c.id = cd.cat_id
WHERE c.deleted_at IS NULL
ORDER BY c.slug, cd.lang;

-- 2. Check existing poetry in categories
SELECT '=== POETRY IN CATEGORIES ===' as info;
SELECT 
    pm.id,
    pm.poetry_slug,
    pm.lang,
    pm.poetry_tags,
    pm.visibility,
    pm.is_featured,
    c.slug as category_slug,
    p.sindhi_name as poet_name
FROM public.poetry_main pm
LEFT JOIN public.categories c ON pm.category_id = c.id
LEFT JOIN public.poets p ON pm.poet_id = p.poet_id
WHERE pm.deleted_at IS NULL 
    AND pm.visibility = true
    AND c.slug IS NOT NULL
ORDER BY c.slug, pm.created_at DESC
LIMIT 20;

-- 3. Check poetry translations
SELECT '=== POETRY TRANSLATIONS ===' as info;
SELECT 
    pt.poetry_id,
    pt.title,
    pt.lang,
    pm.poetry_slug,
    c.slug as category
FROM public.poetry_translations pt
JOIN public.poetry_main pm ON pt.poetry_id = pm.id
LEFT JOIN public.categories c ON pm.category_id = c.id
WHERE pm.deleted_at IS NULL 
    AND pm.visibility = true
ORDER BY pm.poetry_slug, pt.lang
LIMIT 20;

-- 4. Check category-poetry counts
SELECT '=== CATEGORY POETRY COUNTS ===' as info;
SELECT 
    c.slug,
    c.content_style,
    COUNT(pm.id) as poetry_count,
    COUNT(DISTINCT pm.poet_id) as unique_poets
FROM public.categories c
LEFT JOIN public.poetry_main pm ON c.id = pm.category_id 
    AND pm.deleted_at IS NULL 
    AND pm.visibility = true
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.slug, c.content_style
ORDER BY poetry_count DESC;

-- 5. Check for poetry with specific category tags
SELECT '=== POETRY WITH CATEGORY TAGS ===' as info;
SELECT 
    pm.poetry_slug,
    pm.poetry_tags,
    pm.lang,
    c.slug as category_slug
FROM public.poetry_main pm
LEFT JOIN public.categories c ON pm.category_id = c.id
WHERE pm.deleted_at IS NULL 
    AND pm.visibility = true
    AND (
        pm.poetry_tags ILIKE '%نظم%' OR
        pm.poetry_tags ILIKE '%ghazal%' OR
        pm.poetry_tags ILIKE '%غزل%' OR
        pm.poetry_tags ILIKE '%تيرڙو%' OR
        pm.poetry_tags ILIKE '%چهاستا%'
    )
ORDER BY pm.poetry_slug;

-- 6. Check for orphaned poetry (no category)
SELECT '=== ORPHANED POETRY (NO CATEGORY) ===' as info;
SELECT 
    pm.id,
    pm.poetry_slug,
    pm.poetry_tags,
    pm.lang
FROM public.poetry_main pm
WHERE pm.deleted_at IS NULL 
    AND pm.visibility = true
    AND pm.category_id IS NULL
ORDER BY pm.created_at DESC
LIMIT 10;

-- 7. Check for missing translations
SELECT '=== POETRY WITHOUT TRANSLATIONS ===' as info;
SELECT 
    pm.id,
    pm.poetry_slug,
    pm.lang,
    c.slug as category
FROM public.poetry_main pm
LEFT JOIN public.categories c ON pm.category_id = c.id
LEFT JOIN public.poetry_translations pt ON pm.id = pt.poetry_id
WHERE pm.deleted_at IS NULL 
    AND pm.visibility = true
    AND pt.id IS NULL
ORDER BY pm.created_at DESC
LIMIT 10;
