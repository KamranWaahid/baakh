import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key for full access
const admin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate offset - support both page and offset parameters
    const finalOffset = offset || (page - 1) * limit;

    let query = admin
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

    return NextResponse.json({ 
      poets: poets || [], 
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.poet_slug || !body.sindhi_name || !body.english_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: poet_slug, sindhi_name, english_name' 
      }, { status: 400 });
    }

    // Check if poet with same slug already exists
    const { data: existingPoet } = await admin
      .from('poets')
      .select('id')
      .eq('poet_slug', body.poet_slug)
      .single();

    if (existingPoet) {
      return NextResponse.json({ 
        error: 'Poet with this slug already exists' 
      }, { status: 409 });
    }

    // Prepare poet data for database
    const poetData = {
      poet_slug: body.poet_slug,
      birth_date: body.birth_date || null,
      death_date: body.death_date || null,
      birth_place: body.birth_place || null,
      death_place: body.death_place || null,
      tags: body.tags || [],
      file_url: body.file_url || null,
      is_featured: body.is_featured || false,
      is_hidden: body.is_hidden || false,
      // Sindhi fields
      sindhi_name: body.sindhi_name,
      sindhi_laqab: body.sindhi_laqab || null,
      sindhi_takhalus: body.sindhi_takhalus || null,
      sindhi_tagline: body.sindhi_tagline || null,
      sindhi_details: body.sindhi_details,
      // English fields
      english_name: body.english_name,
      english_laqab: body.english_laqab || null,
      english_takhalus: body.english_takhalus || null,
      english_tagline: body.english_tagline || null,
      english_details: body.english_details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the poet
    const { data: newPoet, error: insertError } = await admin
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
