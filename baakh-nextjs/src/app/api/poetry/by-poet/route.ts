import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let poetId = searchParams.get('poetId');
    const poetSlug = searchParams.get('poetSlug');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Resolve poetId by poetSlug if provided
    if (!poetId && poetSlug) {
      const { data: poetRow } = await supabase
        .from('poets')
        .select('poet_id')
        .eq('poet_slug', poetSlug)
        .single();
      if (poetRow?.poet_id != null) {
        poetId = String(poetRow.poet_id);
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
        poet:poets!poetry_main_poet_id_fkey(
          id,
          english_name,
          sindhi_name,
          poet_slug
        ),
        category:categories!poetry_main_category_id_fkey(
          id,
          slug,
          category_details!inner(
            cat_name,
            cat_name_plural,
            lang
          )
        ),
        poetry_translations!inner(
          id,
          title,
          info,
          lang
        )
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
    const { data: poetry, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch poetry' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedPoetry = poetry?.map(poem => ({
      id: poem.id,
      slug: poem.poetry_slug,
      title: poem.poetry_translations?.[0]?.title || 'Untitled',
      description: poem.poetry_translations?.[0]?.info || '',
      lang: poem.lang,
      contentStyle: poem.content_style,
      tags: poem.poetry_tags || [],
      isFeatured: poem.is_featured,
      createdAt: poem.created_at,
      poet: poem.poet,
      category: poem.category
    })) || [];

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

