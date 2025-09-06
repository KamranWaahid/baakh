-- Alternative solution: Create a system poetry record for standalone couplets
-- This approach maintains the foreign key constraint while allowing standalone couplets

-- Option 1: Create a system poetry record
INSERT INTO public.poetry_main (
    id,
    poetry_slug,
    poetry_tags,
    visibility,
    is_featured,
    category_id,
    created_at,
    updated_at
) VALUES (
    0, -- Use ID 0 for system couplets
    'system-standalone-couplets',
    'system,standalone,couplets',
    false, -- Not visible to users
    false, -- Not featured
    NULL, -- No category
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Option 2: Create a view that handles standalone couplets
CREATE OR REPLACE VIEW public.couplets_view AS
SELECT 
    pc.*,
    CASE 
        WHEN pc.poetry_id = 0 THEN 'Standalone Couplet'
        WHEN pc.poetry_id IS NULL THEN 'Standalone Couplet'
        ELSE pm.poetry_slug
    END as poetry_reference,
    CASE 
        WHEN pc.poetry_id = 0 OR pc.poetry_id IS NULL THEN NULL
        ELSE pm.category_id
    END as category_id
FROM public.poetry_couplets pc
LEFT JOIN public.poetry_main pm ON pc.poetry_id = pm.id
WHERE pc.deleted_at IS NULL;

-- Option 3: Create a function to insert standalone couplets
CREATE OR REPLACE FUNCTION insert_standalone_couplet(
    p_poet_id BIGINT,
    p_couplet_slug VARCHAR(191),
    p_couplet_text TEXT,
    p_couplet_tags VARCHAR(191),
    p_lang VARCHAR(10)
) RETURNS BIGINT AS $$
DECLARE
    v_couplet_id BIGINT;
BEGIN
    -- Insert with poetry_id = 0 (system poetry record)
    INSERT INTO public.poetry_couplets (
        poetry_id,
        poet_id,
        couplet_slug,
        couplet_text,
        couplet_tags,
        lang,
        created_at
    ) VALUES (
        0, -- System poetry ID
        p_poet_id,
        p_couplet_slug,
        p_couplet_text,
        p_couplet_tags,
        p_lang,
        NOW()
    ) RETURNING id INTO v_couplet_id;
    
    RETURN v_couplet_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_standalone_couplet TO authenticated;
GRANT EXECUTE ON FUNCTION insert_standalone_couplet TO service_role;
