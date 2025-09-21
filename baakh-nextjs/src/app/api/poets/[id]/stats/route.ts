import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseServiceKey !== 'your_supabase_service_role_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

// Initialize Supabase client only if environment variables are properly configured
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            range: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    } as any;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poetSlug } = await params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';
    
    console.log('Poet stats API - Poet slug:', poetSlug, 'Language:', language);
    
    // Check if Supabase is available
    if (!supabase) {
      console.log('Supabase not available, returning mock stats');
      return NextResponse.json({ 
        poetry: 0,
        couplets: 0,
        categories: 0,
        nazams: 0,
        vaayis: 0
      });
    }
    
    // First, get the poet by slug to get the poet ID
    const { data: poetData, error: poetError } = await supabase
      .from('poets')
      .select('id')
      .eq('poet_slug', poetSlug)
      .single();
    
    if (poetError || !poetData) {
      console.error('Error finding poet by slug:', poetError);
      return NextResponse.json({ 
        poetry: 0,
        couplets: 0,
        categories: 0,
        nazams: 0,
        vaayis: 0
      }, { status: 404 });
    }
    
    const poetId = poetData.id;
    
    // Get poetry count
    const { count: poetryCount } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true })
      .eq('poet_id', poetId)
      .eq('visibility', 'public')
      .is('deleted_at', null);

    // Get couplets count (standalone couplets)
    const { count: coupletsCount } = await supabase
      .from('poetry_couplets')
      .select('*', { count: 'exact', head: true })
      .eq('poet_id', poetId)
      .or('poetry_id.is.null,poetry_id.eq.0');

    // Get categories count
    const { data: categoriesData } = await supabase
      .from('poetry_main')
      .select('category_id')
      .eq('poet_id', poetId)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .not('category_id', 'is', null);

    const uniqueCategories = new Set(categoriesData?.map((item: any) => item.category_id) || []);
    const categoriesCount = uniqueCategories.size;

    // Get nazams count (assuming nazam is a category)
    const { count: nazamsCount } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true })
      .eq('poet_id', poetId)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .in('category_id', await getCategoryIdsBySlug(['nazm', 'nazam']));

    // Get vaayis count (assuming vaai is a category)
    const { count: vaayisCount } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true })
      .eq('poet_id', poetId)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .in('category_id', await getCategoryIdsBySlug(['vaai', 'vaayi', 'vai']));

    const stats = {
      poetry: poetryCount || 0,
      couplets: coupletsCount || 0,
      categories: categoriesCount,
      nazams: nazamsCount || 0,
      vaayis: vaayisCount || 0
    };
    
    console.log('Poet stats calculated:', stats);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error in poet stats API:', error);
    
    return NextResponse.json({ 
      poetry: 0,
      couplets: 0,
      categories: 0,
      nazams: 0,
      vaayis: 0
    }, { status: 500 });
  }
}

// Helper function to get category IDs by slug
async function getCategoryIdsBySlug(slugs: string[]): Promise<string[]> {
  if (!supabase) return [];
  
  const { data } = await supabase
    .from('categories')
    .select('id')
    .in('slug', slugs);
  
  return data?.map((item: any) => item.id) || [];
}