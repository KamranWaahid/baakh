import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poetrySlug = searchParams.get('poetrySlug');
    const poetSlug = searchParams.get('poetSlug');
    const categorySlug = searchParams.get('categorySlug');
    const lang = searchParams.get('lang') || 'en';

    console.log('Poetry detail API called with params:', { poetrySlug, poetSlug, categorySlug, lang });

    if (!poetrySlug || !poetSlug || !categorySlug) {
      console.log('Missing required parameters');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Test basic database connection first
    const supabase = createAdminClient();
    console.log('Supabase client created');

    // Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('poets')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({ error: 'Database connection failed', details: testError.message }, { status: 500 });
    }

    console.log('Database connection successful');

    // First, get the poet by slug
    console.log('Looking for poet with slug:', poetSlug);
    const { data: poet, error: poetError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, sindhi_laqab, english_laqab, file_url, sindhi_tagline, english_tagline')
      .eq('poet_slug', poetSlug)
      .single();

    if (poetError) {
      console.log('Poet query error:', poetError);
      return NextResponse.json({ error: 'Poet not found', details: poetError.message }, { status: 404 });
    }

    if (!poet) {
      console.log('No poet found with slug:', poetSlug);
      return NextResponse.json({ error: 'Poet not found' }, { status: 404 });
    }

    console.log('Found poet:', poet);

    // Get the category by slug
    console.log('Looking for category with slug:', categorySlug);
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug, content_style')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      console.log('Category query error:', categoryError);
      return NextResponse.json({ error: 'Category not found', details: categoryError.message }, { status: 404 });
    }

    if (!category) {
      console.log('No category found with slug:', categorySlug);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    console.log('Found category:', category);

    // Get the poetry by slug, poet_id, and category_id
    console.log('Looking for poetry with:', { poetrySlug, poetId: poet.poet_id, categoryId: category.id });
    const { data: poetry, error: poetryError } = await supabase
      .from('poetry_main')
      .select(`
        *,
        poetry_translations (
          id,
          title,
          info,
          source,
          lang
        ),
        poetry_couplets (
          id,
          couplet_text,
          couplet_slug,
          couplet_tags,
          lang
        )
      `)
      .eq('poetry_slug', poetrySlug)
      .eq('poet_id', poet.poet_id)
      .eq('category_id', category.id)
      .eq('visibility', true)
      .is('deleted_at', null)
      .single();

    if (poetryError) {
      console.log('Poetry query error:', poetryError);
      return NextResponse.json({ error: 'Poetry not found', details: poetryError.message }, { status: 404 });
    }

    if (!poetry) {
      console.log('No poetry found with criteria:', { poetrySlug, poetId: poet.poet_id, categoryId: category.id });
      return NextResponse.json({ error: 'Poetry not found' }, { status: 404 });
    }

    console.log('Found poetry:', poetry);

    // Transform the data to match the expected format
    const transformedPoetry = {
      ...poetry,
      poets: {
        id: poet.poet_id,
        sindhi_name: poet.sindhi_name,
        english_name: poet.english_name,
        sindhi_laqab: poet.sindhi_laqab,
        english_laqab: poet.english_laqab,
        file_url: poet.file_url,
        sindhi_tagline: poet.sindhi_tagline,
        english_tagline: poet.english_tagline
      },
      categories: {
        id: category.id,
        slug: category.slug,
        content_style: category.content_style
      }
    };

    console.log('Returning transformed poetry data');
    return NextResponse.json({ poetry: transformedPoetry });
  } catch (error) {
    console.error('Poetry detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
