import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const lang = searchParams.get('lang') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    console.log('API Route - Environment variables:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set'
    });

    const supabase = createAdminClient();

    // Build the base query for couplets - prioritize Sindhi (sd) couplets
    let query = supabase
      .from('poetry_couplets')
      .select('*', { count: 'exact' })
      .eq('lang', 'sd'); // Only get Sindhi couplets as primary entries

    // Apply search filter
    if (search) {
      query = query.or(`couplet_text.ilike.%${search}%,couplet_slug.ilike.%${search}%,couplet_tags.ilike.%${search}%`);
    }

    // Apply sorting
    if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'couplet_slug') {
      query = query.order('couplet_slug', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'lang') {
      query = query.order('lang', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: coupletsData, error: coupletsError, count } = await query;

    if (coupletsError) {
      console.error('Error fetching couplets:', coupletsError);
      return NextResponse.json({ error: 'Failed to fetch couplets' }, { status: 500 });
    }

    if (!coupletsData || coupletsData.length === 0) {
      return NextResponse.json({
        couplets: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Get poetry IDs and poet IDs for related data
    const poetryIds = [...new Set(coupletsData.map(c => c.poetry_id).filter(Boolean))];
    const poetIds = [...new Set(coupletsData.map(c => c.poet_id).filter(Boolean))];

    // Fetch related poetry data (include category_id for joining categories)
    let poetryData: any[] = [];
    if (poetryIds.length > 0) {
      const { data: poetry, error: poetryError } = await supabase
        .from('poetry_main')
        .select('id, poetry_slug, poetry_tags, visibility, is_featured, category_id')
        .in('id', poetryIds);

      if (!poetryError && poetry) {
        poetryData = poetry;
      }
    }

    // Fetch related poet data
    let poetsData: any[] = [];
    if (poetIds.length > 0) {
      const { data: poets, error: poetsError } = await supabase
        .from('poets')
        .select('poet_id, poet_slug, sindhi_name, english_name, sindhi_laqab, english_laqab')
        .in('poet_id', poetIds);

      if (!poetsError && poets) {
        poetsData = poets;
      }
    }

    // Fetch categories using category_id values from poetry_main
    let categoriesData: any[] = [];
    if (poetryData.length > 0) {
      const categoryIds = [...new Set(poetryData.map((p: any) => p.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, slug')
          .in('id', categoryIds);

        if (!categoriesError && categories) {
          categoriesData = categories;
        }
      }
    }

    // Fetch English couplets for each Sindhi couplet
    const enrichedCouplets = await Promise.all(coupletsData.map(async (couplet) => {
      const poetry = poetryData.find(p => p.id === couplet.poetry_id);
      const poet = poetsData.find(p => p.poet_id === couplet.poet_id);
      const category = categoriesData.find(c => c.id === poetry?.category_id);

      // Fetch English couplet if it exists for the same poetry work
      let englishCouplet = null;
      if (couplet.poetry_id) {
        const { data: englishData } = await supabase
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
          .eq('poetry_id', couplet.poetry_id)
          .eq('lang', 'en')
          .single();
        
        englishCouplet = englishData;
      }

      return {
        ...couplet,
        poetry_main: poetry || null,
        poets: poet || null,
        categories: category || null,
        english_couplet: englishCouplet
      };
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      couplets: enrichedCouplets,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    
    console.log('POST /api/admin/poetry/couplets - Received body:', body);
    
    // Handle both single couplet and array of couplets
    const coupletsData = Array.isArray(body) ? body : [body];
    
    // Validate required fields
    console.log('Validating couplets data:', coupletsData);
    for (const couplet of coupletsData) {
      console.log('Validating couplet:', couplet);
      if (!couplet.couplet_text || !couplet.couplet_slug || !couplet.lang) {
        console.log('Validation failed for couplet:', {
          poetry_id: couplet.poetry_id,
          couplet_text: couplet.couplet_text,
          couplet_slug: couplet.couplet_slug,
          lang: couplet.lang
        });
        return NextResponse.json(
          { error: 'Missing required fields: couplet_text, couplet_slug, lang (poetry_id can be 0 for standalone couplets)' },
          { status: 400 }
        );
      }
    }
    console.log('Validation passed for all couplets');
    
    // Ensure system poetry record exists for standalone couplets
    if (coupletsData.some(c => c.poetry_id === 0)) {
      console.log('Checking for system poetry record...');
      try {
        // Check if system poetry record exists
        const { data: existingPoetry, error: checkError } = await supabase
          .from('poetry_main')
          .select('id')
          .eq('id', 0)
          .single();
        
        if (checkError && checkError.code === 'PGRST116') {
          // System poetry record doesn't exist, create it
          console.log('Creating system poetry record...');
          const { error: createError } = await supabase
            .from('poetry_main')
            .insert({
              id: 0,
              poetry_slug: 'system-standalone-couplets',
              poetry_tags: 'system,standalone,couplets',
              visibility: false,
              is_featured: false,
              category_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (createError) {
            console.error('Failed to create system poetry record:', createError);
            return NextResponse.json(
              { error: 'Failed to setup system for standalone couplets' },
              { status: 500 }
            );
          }
          console.log('System poetry record created successfully');
        } else if (existingPoetry) {
          console.log('System poetry record already exists');
        }
      } catch (error) {
        console.error('Error checking/creating system poetry record:', error);
        return NextResponse.json(
          { error: 'Failed to setup system for standalone couplets' },
          { status: 500 }
        );
      }
    }

    // Sanitize payload: strip id if present and normalize types
    const sanitized = coupletsData.map((c: any) => {
      const { id, ...rest } = c;
      const payload: any = {
        poetry_id: rest.poetry_id != null ? Number(rest.poetry_id) : null,
        poet_id: rest.poet_id != null ? Number(rest.poet_id) : null,
        couplet_slug: String(rest.couplet_slug),
        couplet_text: String(rest.couplet_text),
        lang: String(rest.lang)
      };
      
      // Handle couplet_tags - convert array to comma-separated string if needed
      if (rest.couplet_tags !== undefined && rest.couplet_tags !== null) {
        if (Array.isArray(rest.couplet_tags)) {
          payload.couplet_tags = rest.couplet_tags.join(', ');
        } else {
          payload.couplet_tags = String(rest.couplet_tags);
        }
      } else {
        payload.couplet_tags = '';
      }
      
      console.log('Sanitized payload:', payload);
      return payload;
    });

    // Workaround for broken sequence on integer primary key by assigning explicit incremental IDs
    let startId: number | null = null;
    try {
      const { data: maxRow } = await supabase
        .from('poetry_couplets')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      if (maxRow && typeof maxRow.id === 'number') {
        startId = maxRow.id + 1;
      } else {
        startId = 1;
      }
    } catch (_) {
      // ignore; fallback to server default
    }

    const payload = startId != null
      ? sanitized.map((row: any, idx: number) => ({ id: startId! + idx, ...row }))
      : sanitized;

        // Insert couplets
    console.log('Inserting payload into database:', payload);
    const { data, error } = await supabase
      .from('poetry_couplets')
      .insert(payload)
      .select();
    
    if (error) {
      console.error('Error creating poetry couplets:', error);
      console.error('Error details:', {
        message: error.message,
        details: (error as any).details,
        code: (error as any).code,
        hint: (error as any).hint
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create poetry couplets';
      if (error.message.includes('foreign key constraint')) {
        errorMessage = 'Foreign key constraint violation. Please ensure all referenced records exist.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'Duplicate key violation. Please use a unique couplet slug.';
      } else if (error.message.includes('not null')) {
        errorMessage = 'Required field is missing. Please check all required fields.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: error.message,
          code: (error as any).code,
          hint: (error as any).hint
        },
        { status: 500 }
      );
    }
    
    console.log('Couplets created successfully:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in poetry couplets POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
