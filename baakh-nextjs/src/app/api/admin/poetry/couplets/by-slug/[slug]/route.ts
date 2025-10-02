export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { slug } = await params;
    
    console.log('Fetching couplet by slug:', slug);

    // First, get all couplets with this slug to see what we have
    const { data: allCouplets, error: allError } = await supabase
      .from('poetry_couplets')
      .select(`
        *,
        poets!inner(
          poet_id,
          poet_slug,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        ),
        poetry_main!inner(
          id,
          poetry_slug,
          poetry_tags,
          visibility,
          is_featured,
          category_id
        )
      `)
      .eq('couplet_slug', slug);

    if (allError) {
      console.error('Error fetching couplets by slug:', allError);
      return NextResponse.json({ error: 'Couplet not found' }, { status: 404 });
    }

    if (!allCouplets || allCouplets.length === 0) {
      return NextResponse.json({ error: 'Couplet not found' }, { status: 404 });
    }

    // Prioritize Sindhi couplet, but if not available, use any available couplet
    let couplet = allCouplets.find((c: any) => c.lang === 'sd') || allCouplets[0];

    // Fetch category separately since there's no direct relationship
    let categoryData = null;
    if (couplet.poetry_main?.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('id', couplet.poetry_main.category_id)
        .single();
      categoryData = category;
    }

    // Find the other language version (if main is Sindhi, find English, and vice versa)
    let englishCouplet = null;
    const targetLang = couplet.lang === 'sd' ? 'en' : 'sd';
    
    // First check if we already have the other language in our results
    englishCouplet = allCouplets.find((c: any) => c.lang === targetLang);
    
    // If not found in our results, search by poetry_id
    if (!englishCouplet && couplet.poetry_main?.id) {
      const { data: otherLangData } = await supabase
        .from('poetry_couplets')
        .select(`
          id,
          couplet_text,
          couplet_slug,
          couplet_tags,
          lang,
          created_at,
          updated_at
        `)
        .eq('poetry_id', couplet.poetry_main.id)
        .eq('lang', targetLang)
        .single();
      
      englishCouplet = otherLangData;
    }

    // Add category data and English couplet to the response
    const responseData = {
      ...couplet,
      categories: categoryData,
      english_couplet: englishCouplet
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in couplet GET by slug API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}