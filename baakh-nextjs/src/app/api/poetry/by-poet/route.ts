import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    let poetId = searchParams.get('poetId');
    const poetSlug = searchParams.get('poetSlug');
    const categoryId = searchParams.get('categoryId');
    const lang = searchParams.get('lang') || 'sd';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    console.log('API parameters:', { poetId, poetSlug, categoryId, limit, page });

    // Resolve poetId by poetSlug if provided
    if (!poetId && poetSlug) {
      console.log('Looking up poet by slug:', poetSlug);
      const { data: poetRows, error: poetError } = await supabase
        .from('poets')
        .select('id, poet_id')
        .eq('poet_slug', poetSlug);
      console.log('Poet lookup result:', { poetRows, poetError });
      if (poetRows && poetRows.length > 0) {
        // Use poet_id (numeric) for poetry_main table
        poetId = String(poetRows[0].poet_id);
        console.log('Resolved poetId:', poetId);
      }
    }

    if (!poetId) {
      return NextResponse.json({ error: 'Poet ID or slug is required' }, { status: 400 });
    }

        let query = supabase
          .from('poetry_main')
          .select(`
            id,
            poetry_slug,
            content_style,
            poetry_tags,
            lang,
            visibility,
            is_featured,
            created_at,
            poet_id,
            category_id
          `)
          .eq('poet_id', poetId)
          .eq('visibility', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

    // Filter by category if specified
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply pagination
    console.log('Executing query with poetId:', poetId);
    const { data: poetry, error } = await query.range(offset, offset + limit - 1);
    console.log('Query result:', { poetry: poetry?.length, error });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch poetry', details: error.message },
        { status: 500 }
      );
    }

    // Fetch related data separately
    const poetIds = [...new Set(poetry?.map(p => p.poet_id).filter(Boolean) || [])];
    const categoryIds = [...new Set(poetry?.map(p => p.category_id).filter(Boolean) || [])];
    const poetryIds = poetry?.map(p => p.id) || [];

    // Fetch poets data
    const { data: poetsData } = poetIds.length > 0 ? await supabase
      .from('poets')
      .select('id, poet_id, english_name, sindhi_name, poet_slug')
      .in('poet_id', poetIds) : { data: [] };

    // Fetch categories data
    const { data: categoriesData } = categoryIds.length > 0 ? await supabase
      .from('categories')
      .select('id, slug, category_details(cat_name, cat_name_plural, lang)')
      .in('id', categoryIds) : { data: [] };

    // Fetch translations data
    const { data: translationsData } = poetryIds.length > 0 ? await supabase
      .from('poetry_translations')
      .select('poetry_id, title, info, lang')
      .in('poetry_id', poetryIds) : { data: [] };

    // Create lookup maps
    const poetById = new Map((poetsData || []).map(p => [p.poet_id, p]));
    const categoryById = new Map((categoriesData || []).map(c => [c.id, c]));
    const translationsByPoetryId = new Map();
    (translationsData || []).forEach(t => {
      const arr = translationsByPoetryId.get(t.poetry_id) || [];
      arr.push(t);
      translationsByPoetryId.set(t.poetry_id, arr);
    });

    // Transform the data to match the expected format
    const transformedPoetry = poetry?.map(poem => {
      const poet = poetById.get(poem.poet_id);
      const category = categoryById.get(poem.category_id);
      const translations = translationsByPoetryId.get(poem.id) || [];
      
      // Find translation for the requested language, fallback to any available translation
      const translationForLang = translations.find((t: any) => t.lang === lang);
      const fallbackTranslation = translations[0]; // First available translation as fallback
      const selectedTranslation = translationForLang || fallbackTranslation;
      
      return {
        id: poem.id,
        slug: poem.poetry_slug,
        title: selectedTranslation?.title || 'Untitled',
        description: selectedTranslation?.info && selectedTranslation.info !== 'NULL' ? selectedTranslation.info : '',
        lang: selectedTranslation?.lang || lang,
        contentStyle: poem.content_style,
        tags: poem.poetry_tags || [],
        isFeatured: poem.is_featured,
        createdAt: poem.created_at,
        poet: poet,
        category: category
      };
    }) || [];

    return NextResponse.json({
      poetry: transformedPoetry,
      count: transformedPoetry.length,
      page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

