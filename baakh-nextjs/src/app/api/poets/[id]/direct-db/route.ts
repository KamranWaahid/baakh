import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are properly configured (not placeholder values)
const isSupabaseConfigured = supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl !== 'https://uhbqcaxwfossrjwusclc.supabase.co' &&
  supabaseServiceKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnFjYXh3Zm9zc3Jqd3VzY2xjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5MTg2MiwiZXhwIjoyMDcwMTY3ODYyfQ.krWIEF9IcNPP-do2ULZmlEzvIdGdSzczgrK-NJM8GSw' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not properly configured');
  console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set but invalid' : 'Missing');
  console.warn('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set but invalid' : 'Missing');
  console.warn('📖 See QUICK_SETUP.md for instructions on configuring Supabase');
  console.warn('💡 App will use mock data until Supabase is configured');
}

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
    
    console.log('Direct DB poet API - Poet slug:', poetSlug, 'Language:', language);
    
    // Check if Supabase is available
    if (!supabase) {
      console.log('Supabase not available, falling back to mock data');
      return NextResponse.json({ 
        success: false,
        error: 'Database not configured',
        message: 'Please configure Supabase credentials in .env.local file',
        fallback: true,
        setupRequired: true
      }, { status: 503 });
    }
    
    // First, get the main poet data from the poets table
    const { data: poetData, error: poetError } = await supabase
      .from('poets')
      .select('*')
      .eq('poet_slug', poetSlug)
      .single();
    
    console.log('🔍 Frontend DB search result:', { poetData: !!poetData, error: poetError?.message });
    
    if (poetError || !poetData) {
      console.error('Error finding poet by slug in frontend DB:', poetError);
      console.log('🔄 Trying backend API as fallback for slug:', poetSlug);
      
      // Try backend API as fallback
      try {
        const backendResponse = await fetch(`https://localhost:5001/api/poets/${poetSlug}?lang=${language}`);
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          console.log('✅ Found poet in backend API:', backendData.poet?.english_name);
          
          // Create sample data for demonstration
          const sampleData = {
            categories: [
              {
                id: 'sample-1',
                name: language === 'sd' ? 'صوفي شاعري' : 'Sufi Poetry',
                description: language === 'sd' ? 'روحاني ۽ عرفاني شاعري' : 'Spiritual and mystical poetry',
                slug: 'sufi-poetry'
              },
              {
                id: 'sample-2', 
                name: language === 'sd' ? 'ڪلاسيڪي شاعري' : 'Classical Poetry',
                description: language === 'sd' ? 'قديم رواجن جي شاعري' : 'Poetry following classical traditions',
                slug: 'classical-poetry'
              }
            ],
            couplets: [
              {
                id: 'sample-1',
                couplet_text: language === 'sd' ? 'مثال شعر\nدوم مثال شعر' : 'Sample couplet line one\nSample couplet line two',
                couplet_slug: 'sample-couplet-1',
                lang: language,
                couplet_tags: ['sample', 'demo'],
                created_at: new Date().toISOString(),
                poetry_id: null,
                poet_id: backendData.poet.poet_id,
                lines: language === 'sd' ? ['مثال شعر', 'دوم مثال شعر'] : ['Sample couplet line one', 'Sample couplet line two'],
                poet: {
                  id: backendData.poet.id,
                  english_name: backendData.poet.english_name,
                  sindhi_name: backendData.poet.sindhi_name,
                  english_laqab: backendData.poet.english_laqab,
                  sindhi_laqab: backendData.poet.sindhi_laqab,
                  file_url: backendData.poet.file_url
                }
              },
              {
                id: 'sample-2',
                couplet_text: language === 'sd' ? 'ٻيو مثال شعر\nٻيو مثال شعر' : 'Another sample couplet\nAnother sample line',
                couplet_slug: 'sample-couplet-2',
                lang: language,
                couplet_tags: ['sample', 'demo'],
                created_at: new Date().toISOString(),
                poetry_id: null,
                poet_id: backendData.poet.poet_id,
                lines: language === 'sd' ? ['ٻيو مثال شعر', 'ٻيو مثال شعر'] : ['Another sample couplet', 'Another sample line'],
                poet: {
                  id: backendData.poet.id,
                  english_name: backendData.poet.english_name,
                  sindhi_name: backendData.poet.sindhi_name,
                  english_laqab: backendData.poet.english_laqab,
                  sindhi_laqab: backendData.poet.sindhi_laqab,
                  file_url: backendData.poet.file_url
                }
              }
            ]
          };

          // Transform backend data to match frontend format
          const transformedPoet = {
            id: backendData.poet.id,
            poet_id: backendData.poet.poet_id,
            poet_slug: backendData.poet.poet_slug,
            slug: backendData.poet.slug,
            english_name: backendData.poet.english_name,
            sindhi_name: backendData.poet.sindhi_name,
            english_laqab: backendData.poet.english_laqab,
            sindhi_laqab: backendData.poet.sindhi_laqab,
            english_tagline: backendData.poet.english_tagline,
            sindhi_tagline: backendData.poet.sindhi_tagline,
            english_details: backendData.poet.english_details,
            sindhi_details: backendData.poet.sindhi_details,
            file_url: backendData.poet.file_url,
            birth_date: backendData.poet.birth_date,
            death_date: backendData.poet.death_date,
            birth_place: backendData.poet.birth_place,
            death_place: backendData.poet.death_place,
            is_active: backendData.poet.is_active,
            created_at: backendData.poet.created_at,
            updated_at: backendData.poet.updated_at,
            tags: backendData.poet.tags || [],
            stats: backendData.stats || { works: 0, couplets: 0, nazams: 0, vaayis: 0 },
            categories: sampleData.categories,
            couplets: sampleData.couplets,
            nazams: [],
            vaayis: [],
            similarPoets: []
          };
          
          return NextResponse.json({
            success: true,
            poet: transformedPoet,
            source: 'backend_fallback'
          });
        }
      } catch (backendError) {
        console.error('Backend API fallback also failed:', backendError);
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Poet not found',
        searchedSlug: poetSlug
      }, { status: 404 });
    }
    
    console.log('Found poet data:', poetData);
    
    // Get additional details from poets_detail table
    const { data: poetDetails, error: detailsError } = await supabase
      .from('poets_detail')
      .select('*')
      .eq('poet_slug', poetSlug)
      .eq('lang', language === 'sd' ? 'sd' : 'en')
      .single();
    
    console.log('Found poet details:', poetDetails);
    
    // Transform the data to match the expected format
    const transformedPoet = {
      id: poetData.id,
      poetNumericId: poetData.poet_id,
      poet_slug: poetData.poet_slug,
      name: language === 'sd' ? poetData.sindhi_name : poetData.english_name,
      sindhiName: poetData.sindhi_name,
      englishName: poetData.english_name,
      sindhi_laqab: poetData.sindhi_laqab,
      english_laqab: poetData.english_laqab,
      sindhi_takhalus: poetData.sindhi_takhalus,
      english_takhalus: poetData.english_takhalus,
      sindhi_tagline: poetData.sindhi_tagline,
      english_tagline: poetData.english_tagline,
      birth_date: poetData.birth_date,
      death_date: poetData.death_date,
      period: poetData.birth_date && poetData.death_date 
        ? `${poetData.birth_date} - ${poetData.death_date}`
        : poetData.birth_date || 'Unknown',
      birth_place: poetData.birth_place,
      death_place: poetData.death_place,
      birth_place_sd: poetData.birth_place_sd,
      birth_place_en: poetData.birth_place_en,
      death_place_sd: poetData.death_place_sd,
      death_place_en: poetData.death_place_en,
      location: language === 'sd' ? poetData.birth_place_sd || poetData.birth_place : poetData.birth_place_en || poetData.birth_place,
      locationSd: poetData.birth_place_sd || poetData.birth_place,
      locationEn: poetData.birth_place_en || poetData.birth_place,
      avatar: poetData.file_url,
      file_url: poetData.file_url,
      description: language === 'sd' 
        ? (poetDetails?.sindhi_details || poetData.sindhi_details || '')
        : (poetDetails?.english_details || poetData.english_details || ''),
      longDescription: language === 'sd' 
        ? (poetDetails?.sindhi_details || poetData.sindhi_details || '')
        : (poetDetails?.english_details || poetData.english_details || ''),
      english_details: poetDetails?.english_details || poetData.english_details,
      sindhi_details: poetDetails?.sindhi_details || poetData.sindhi_details,
      tags: poetData.tags || [],
      is_featured: poetData.is_featured || false,
      is_hidden: poetData.is_hidden || false,
      created_at: poetData.created_at,
      updated_at: poetData.updated_at
    };

    // Get categories for this poet
    const { data: categories, error: categoriesError } = await supabase
      .from('poetry_categories')
      .select('*')
      .eq('poet_id', poetData.id)
      .limit(10);

    console.log('Categories found:', categories?.length || 0);

    // Get couplets for this poet
    const { data: couplets, error: coupletsError } = await supabase
      .from('poetry_couplets')
      .select(`
        id,
        couplet_text,
        couplet_slug,
        lang,
        couplet_tags,
        created_at,
        poetry_id,
        poet_id,
        poets (
          id,
          english_name,
          sindhi_name,
          english_laqab,
          sindhi_laqab,
          file_url
        )
      `)
      .eq('poet_id', poetData.id)
      .limit(10);

    console.log('Couplets found:', couplets?.length || 0);

    // Transform couplets data
    const transformedCouplets = (couplets || []).map((couplet: any) => ({
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      lang: couplet.lang,
      couplet_tags: couplet.couplet_tags,
      created_at: couplet.created_at,
      poetry_id: couplet.poetry_id,
      poet_id: couplet.poet_id,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter((line: string) => line.trim()) : [],
      poet: couplet.poets || null
    }));

    return NextResponse.json({
      success: true,
      poet: {
        ...transformedPoet,
        stats: {
          works: categories?.length || 0,
          couplets: transformedCouplets.length,
          nazams: 0,
          vaayis: 0
        },
        categories: categories || [],
        couplets: transformedCouplets,
        nazams: [],
        vaayis: [],
        similarPoets: []
      },
      categories: categories || []
    });
    
  } catch (error) {
    console.error('Error in direct DB poet API:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && (
      error.message.includes('Supabase') || 
      error.message.includes('database') ||
      error.message.includes('connection') ||
      error.message.includes('not configured')
    )) {
      return NextResponse.json({ 
        success: false,
        error: 'Database not configured',
        fallback: true
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}