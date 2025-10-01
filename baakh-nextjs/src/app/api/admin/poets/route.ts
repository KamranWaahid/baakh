import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withSecurity } from '@/lib/security/middleware';
import { validateApiInput, poetCreateSchema } from '@/lib/security/validation';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate offset - support both page and offset parameters
    const finalOffset = offset || (page - 1) * limit;

    let query = supabase
      .from('poets')
      .select('*', { count: 'exact' })
      .not("english_name", "is", null);

    // Apply search filter
    if (search) {
      query = query.or(`english_name.ilike.%${search}%,english_laqab.ilike.%${search}%,poet_slug.ilike.%${search}%,sindhi_name.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(finalOffset, finalOffset + limit - 1);

    const { data: poets, error, count } = await query;

    if (error) {
      console.error('Error fetching poets:', error);
      return NextResponse.json({ error: 'Failed to fetch poets' }, { status: 500 });
    }

    const hasMore = (poets?.length || 0) === limit && (count || 0) > finalOffset + limit;

    // Augment with works_count (number of couplets per poet)
    let poetsWithCounts = poets || [];
    try {
      if (poets && poets.length > 0) {
        // Prefer numeric poet_id if present (matches poetry_couplets.poet_id); fallback to id
        const poetIdKeys = poets.map((p: any) => (p.poet_id ?? p.id)).filter((v: any) => v !== null && v !== undefined);
        const uniquePoetIds = Array.from(new Set(poetIdKeys));

        if (uniquePoetIds.length > 0) {
          // Use per-poet head count queries for reliable counts
          const countResults = await Promise.all(uniquePoetIds.map(async (pid: any) => {
            const { count: cplCount } = await supabase
              .from('poetry_couplets')
              .select('*', { head: true, count: 'exact' })
              .eq('poet_id', pid);
            return { pid, count: cplCount || 0 };
          }));

          const countsMap = new Map<any, number>(countResults.map(r => [r.pid, r.count]));

          poetsWithCounts = poets.map((p: any) => {
            const key = p.poet_id ?? p.id;
            return { ...p, works_count: countsMap.get(key) ?? 0 };
          });
        }
      }
    } catch (e) {
      // Non-fatal: if counting fails, proceed without works_count
      console.warn('Failed to compute works_count for poets:', e);
    }

    return NextResponse.json({ 
      poets: poetsWithCounts, 
      hasMore,
      total: count || 0,
      page,
      limit
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate and sanitize input
    const validatedData = validateApiInput(body, poetCreateSchema);

    // Check if poet with same slug already exists
    const { data: existingPoet } = await supabase
      .from('poets')
      .select('id')
      .eq('poet_slug', validatedData.poet_slug)
      .single();

    if (existingPoet) {
      return NextResponse.json({ 
        error: 'Poet with this slug already exists' 
      }, { status: 409 });
    }

    // Prepare poet data for database using validated data
    const poetData = {
      poet_slug: validatedData.poet_slug,
      birth_date: validatedData.birth_date || null,
      death_date: validatedData.death_date || null,
      birth_place: validatedData.birth_place || null,
      death_place: validatedData.death_place || null,
      tags: validatedData.tags || [],
      file_url: validatedData.file_url || null,
      is_featured: validatedData.is_featured || false,
      is_hidden: validatedData.is_hidden || false,
      // Sindhi fields
      sindhi_name: validatedData.sindhi_name,
      sindhi_laqab: validatedData.sindhi_laqab || null,
      sindhi_takhalus: validatedData.sindhi_takhalus || null,
      sindhi_tagline: validatedData.sindhi_tagline || null,
      sindhi_details: validatedData.sindhi_details,
      // English fields
      english_name: validatedData.english_name,
      english_laqab: validatedData.english_laqab || null,
      english_takhalus: validatedData.english_takhalus || null,
      english_tagline: validatedData.english_tagline || null,
      english_details: validatedData.english_details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the poet
    const { data: newPoet, error: insertError } = await supabase
      .from('poets')
      .insert([poetData])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting poet:', insertError);
      return NextResponse.json({ error: 'Failed to create poet' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Poet created successfully', 
      poet: newPoet 
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withSecurity('admin')(postHandler);
