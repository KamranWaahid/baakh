export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('baakh_roman_words')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`word_sd.ilike.%${search}%,word_roman.ilike.%${search}%`);
    }

    const { data: words, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching roman words:', error);
      return NextResponse.json({ error: 'Failed to fetch roman words' }, { status: 500 });
    }

    return NextResponse.json({
      romanWords: words || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    });
  } catch (error) {
    console.error('Error in roman words API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { word_sd, word_roman, user_id } = body;

    if (!word_sd || !word_roman) {
      return NextResponse.json({ error: 'word_sd and word_roman are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('baakh_roman_words')
      .insert([{ word_sd, word_roman, user_id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating roman word:', error);
      return NextResponse.json({ error: 'Failed to create roman word' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in roman words POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, word_sd, word_roman, user_id } = body;

    if (!id || !word_sd || !word_roman) {
      return NextResponse.json({ error: 'id, word_sd, and word_roman are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('baakh_roman_words')
      .update({ word_sd, word_roman, user_id, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating roman word:', error);
      return NextResponse.json({ error: 'Failed to update roman word' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in roman words PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('baakh_roman_words')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting roman word:', error);
      return NextResponse.json({ error: 'Failed to delete roman word' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in roman words DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
