import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withAdminAuth } from '@/lib/security/admin-auth';
import { validateApiInput, apiSchemas } from '@/lib/security/input-validation';

async function getPoetryHandler(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Check if Supabase is configured by checking if we have a real client
    const isSupabaseConfigured = supabase && typeof supabase.from === 'function' && 
      !supabase.from.toString().includes('Supabase not configured');
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty poetry list');
      return NextResponse.json({
        poetry: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const lang = searchParams.get('lang') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build the base query for poetry_main
    let query = supabase
      .from('poetry_main')
      .select('*');

    // Apply sorting
    if (sortBy === 'id') {
      query = query.order('id', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'poetry_slug') {
      query = query.order('poetry_slug', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'is_featured') {
      query = query.order('is_featured', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('id', { ascending: false });
    }

    // Apply filters with parameterized queries
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&'); // Escape SQL wildcards
      query = query.or(`poetry_slug.ilike.%${sanitizedSearch}%,poetry_tags.ilike.%${sanitizedSearch}%`);
    }
    
    if (status !== 'all') {
      query = query.eq('visibility', status === 'published');
    }

    if (lang !== 'all') {
      query = query.eq('lang', lang);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true });

    // Get paginated poetry results
    const { data: poetry, error: poetryError } = await query
      .range(offset, offset + limit - 1);

    if (poetryError) {
      console.error('Error fetching poetry:', poetryError);
      return NextResponse.json({ error: 'Failed to fetch poetry' }, { status: 500 });
    }

    // Fetch related data manually since foreign keys aren't working
    const poetryWithRelations = await Promise.all(
      poetry.map(async (poem: any) => {
        let poetData: { poet_id: number; poet_slug: string; sindhi_name: string; english_name: string } | null = null;
        let categoryData: { id: number; slug: string; name: string } | null = null;
        let translationsData: { id: string; title: string; lang: string; info: string; source?: string }[] = [];
        let coupletsData: { id: string; couplet_text: string; couplet_slug: string; couplet_tags?: string; lang: string }[] = [];

        // Fetch poet data if poet_id exists
        if (poem.poet_id) {
          try {
            const { data: poet } = await supabase
              .from('poets')
              .select('poet_id, poet_slug, sindhi_name, english_name')
              .eq('poet_id', poem.poet_id)
              .single();
            poetData = poet;
          } catch (error: unknown) {
            console.log(`Could not fetch poet ${poem.poet_id}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Fetch category data if category_id exists
        if (poem.category_id) {
          try {
            const { data: category } = await supabase
              .from('categories')
              .select('id, slug, name')
              .eq('id', poem.category_id)
              .single();
            categoryData = category;
          } catch (error: unknown) {
            console.log(`Could not fetch category ${poem.category_id}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Fetch translations if they exist
        try {
          const { data: translations } = await supabase
            .from('poetry_translations')
            .select('id, title, lang, info, source')
            .eq('poetry_id', poem.id);
          translationsData = translations || [];
        } catch (error: unknown) {
          console.log(`Could not fetch translations for poetry ${poem.id}:`, error instanceof Error ? error.message : 'Unknown error');
        }

        // Fetch couplets if they exist
        try {
          const { data: couplets } = await supabase
            .from('poetry_couplets')
            .select('id, couplet_text, couplet_slug, couplet_tags, lang')
            .eq('poetry_id', poem.id);
          coupletsData = couplets || [];
        } catch (error: unknown) {
          console.log(`Could not fetch couplets for poetry ${poem.id}:`, error instanceof Error ? error.message : 'Unknown error');
        }

        return {
          ...poem,
          poets: poetData,
          categories: categoryData,
          poetry_translations: translationsData,
          poetry_couplets: coupletsData
        };
      })
    );

    return NextResponse.json({
      poetry: poetryWithRelations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in poetry API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createPoetryHandler(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Check if Supabase is configured
    const isSupabaseConfigured = supabase && typeof supabase.from === 'function' && 
      !supabase.from.toString().includes('Supabase not configured');
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning mock success');
      return NextResponse.json({ 
        message: 'Poetry created successfully (mock - Supabase not configured)',
        id: 'mock-id'
      });
    }
    
    const body = await request.json();
    
    // Validate input data
    const validatedData = validateApiInput(body, apiSchemas.poetry);

    const { data, error } = await supabase
      .from('poetry_main')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error('Error creating poetry:', error);
      return NextResponse.json({ error: 'Failed to create poetry' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in poetry POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updatePoetryHandler(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Check if Supabase is configured
    const isSupabaseConfigured = supabase && typeof supabase.from === 'function' && 
      !supabase.from.toString().includes('Supabase not configured');
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning mock success');
      return NextResponse.json({ 
        message: 'Poetry updated successfully (mock - Supabase not configured)'
      });
    }
    
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Poetry ID is required' }, { status: 400 });
    }
    
    // Validate input data
    const validatedData = validateApiInput(body, apiSchemas.poetry.partial());

    const { data, error } = await supabase
      .from('poetry_main')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating poetry:', error);
      return NextResponse.json({ error: 'Failed to update poetry' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in poetry PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export with authorization middleware
export const GET = withAdminAuth(getPoetryHandler);
export const POST = withAdminAuth(createPoetryHandler);
export const PUT = withAdminAuth(updatePoetryHandler);
