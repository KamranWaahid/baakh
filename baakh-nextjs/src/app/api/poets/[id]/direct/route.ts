export const runtime = 'edge'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: 'Missing Supabase environment variables'
      });
    }

    const { id: poetSlug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    console.log('Direct poet API - Poet slug:', poetSlug, 'Language:', lang);
    
    // First, try to get the poet data by poet_slug
    let { data: poetData, error: poetError } = await supabase
      .from('poets')
      .select('*')
      .eq('poet_slug', poetSlug)
      .single();

    // If not found, try by slug column
    if ((poetError || !poetData)) {
      const bySlug = await supabase
        .from('poets')
        .select('*')
        .eq('slug', poetSlug)
        .single();
      if (!bySlug.error && bySlug.data) {
        poetData = bySlug.data as any;
        poetError = null as any;
      }
    }

    // If still not found, try generating slug from english_name and compare
    if ((poetError || !poetData)) {
      const { data: allPoets } = await supabase
        .from('poets')
        .select('id, poet_slug, slug, sindhi_name, english_name')
        .limit(2000);
      const match = (allPoets || []).find(p => {
        const generated = (p.english_name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        return generated === poetSlug || p.slug === poetSlug || p.poet_slug === poetSlug;
      });
      if (match) {
        const { data: byId } = await supabase
          .from('poets')
          .select('*')
          .eq('id', (match as any).id)
          .single();
        if (byId) {
          poetData = byId as any;
          poetError = null as any;
        }
      }
    }

    if (!poetData) {
      console.error('Poet not found for slug:', poetSlug);
      return NextResponse.json({ 
        success: false,
        error: 'Poet not found',
        searchedSlug: poetSlug
      }, { status: 404 });
    }

    const poetId = poetData.poet_id;
    console.log('Found poet ID:', poetId, 'for slug:', poetSlug);
    
    // Get poet's poetry works from poetry_main
    const { data: poetryData, error: poetryError } = await supabase
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
        category_id,
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
      .order('created_at', { ascending: false })
      .limit(20);

    if (poetryError) {
      console.error('Error getting poetry data:', poetryError);
    }

    // Get poet's couplets from poetry_couplets
    const { data: coupletsData, error: coupletsError } = await supabase
      .from('poetry_couplets')
      .select(`
        id,
        couplet_text,
        couplet_slug,
        lang,
        poet_id,
        poetry_id,
        created_at,
        likes,
        views,
        couplet_translations(
          id,
          couplet_text,
          lang
        )
      `)
      .eq('poet_id', poetId)
      .or('poetry_id.is.null,poetry_id.eq.0')
      .order('created_at', { ascending: false })
      .limit(10);

    if (coupletsError) {
      console.error('Error getting couplets data:', coupletsError);
    }

    // Get categories for this poet
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('poetry_main')
      .select(`
        category_id,
        categories!inner(
          id,
          slug,
          category_details!inner(
            cat_name,
            cat_name_plural,
            lang
          )
        )
      `)
      .eq('poet_id', poetId)
      .eq('visibility', true)
      .not('category_id', 'is', null);

    if (categoriesError) {
      console.error('Error getting categories data:', categoriesError);
    }

    // Process categories data
    const categoryMap = new Map();
    if (categoriesData) {
      categoriesData.forEach((item: any) => {
        if (item.categories && item.categories.category_details) {
          const categoryId = item.category_id;
          const category = item.categories;
          const details = category.category_details.find((d: any) => d.lang === lang) || category.category_details[0];
          
          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              id: categoryId,
              slug: category.slug,
              name: details.cat_name,
              namePlural: details.cat_name_plural,
              description: details.cat_name,
              poetryCount: 0,
              poetry: []
            });
          }
        }
      });
    }

    // Process poetry data and group by categories
    if (poetryData) {
      poetryData.forEach((poem: any) => {
        const categoryId = poem.category_id;
        if (categoryId && categoryMap.has(categoryId)) {
          const category = categoryMap.get(categoryId);
          const translation = poem.poetry_translations.find((t: any) => t.lang === lang) || poem.poetry_translations[0];
          
          category.poetry.push({
            id: poem.id,
            title: translation.title,
            description: translation.info || '',
            slug: poem.poetry_slug,
            tags: poem.poetry_tags || [],
            isFeatured: poem.is_featured,
            englishTitle: poem.poetry_translations.find((t: any) => t.lang === 'en')?.title
          });
          category.poetryCount++;
        }
      });
    }

    const categories = Array.from(categoryMap.values());

    // Process couplets data
    const processedCouplets = (coupletsData || []).map((couplet: any) => {
      const translations: any[] = Array.isArray(couplet.couplet_translations) ? couplet.couplet_translations : [];
      const translation = translations.find((t: any) => t.lang === lang) || translations[0];
      const text = (translation?.couplet_text || couplet.couplet_text || '').toString();
      const lines = text.split('\n').filter((l: string) => l.trim()).slice(0, 2);
      return {
        id: couplet.id,
        lines,
        translatedTags: [],
        likes: couplet.likes || 0,
        views: couplet.views || 0,
        poetry_id: couplet.poetry_id ?? null
      };
    });

    // Build the response
    // If tags are missing from direct DB, enrich from backend proxy if available
    let enrichedTags: string[] = Array.isArray(poetData.tags) ? poetData.tags : [];
    if (!enrichedTags.length) {
      try {
        const origin = new URL(request.url).origin;
        const fallbackRes = await fetch(`${origin}/api/poets/${encodeURIComponent(poetSlug)}?lang=${lang}`, { cache: 'no-store' });
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          if (Array.isArray(fallbackJson?.poet?.tags)) {
            enrichedTags = fallbackJson.poet.tags as string[];
          }
        }
      } catch {}
    }

    const response = {
      success: true,
      poet: {
        id: poetData.id,
        poetNumericId: poetData.poet_id,
        name: lang === 'sd' ? poetData.sindhi_name : poetData.english_name,
        sindhiName: poetData.sindhi_name,
        englishName: poetData.english_name,
        sindhi_laqab: poetData.sindhi_laqab,
        english_laqab: poetData.english_laqab,
        sindhi_takhalus: poetData.sindhi_takhalus,
        english_takhalus: poetData.english_takhalus,
        period: poetData.birth_date ? `${poetData.birth_date} - ${poetData.death_date || 'Present'}` : 'Unknown',
        location: lang === 'sd' ? poetData.birth_place : poetData.birth_place,
        locationSd: poetData.birth_place,
        locationEn: poetData.birth_place,
        avatar: poetData.file_url || '/default-avatar.png',
        description: lang === 'sd' ? poetData.sindhi_details : poetData.english_details,
        longDescription: lang === 'sd' ? poetData.sindhi_details : poetData.english_details,
        tags: enrichedTags,
        stats: {
          works: poetryData?.length || 0,
          couplets: coupletsData?.length || 0,
          nazams: 0,
          vaayis: 0
        },
        categories: [],
        couplets: processedCouplets,
        nazams: [],
        vaayis: [],
        similarPoets: []
      },
      categories
    };

    console.log('Direct poet API response:', {
      success: response.success,
      poet: response.poet.name,
      poetryCount: poetryData?.length || 0,
      coupletsCount: coupletsData?.length || 0,
      categoriesCount: categories.length
    });

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Direct poet API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
