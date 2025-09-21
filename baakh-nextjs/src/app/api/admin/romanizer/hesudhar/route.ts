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
      .from('baakh_hesudhars')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`word.ilike.%${search}%,correct.ilike.%${search}%`);
    }

    const { data: hesudhars, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching hesudhars:', error);
      return NextResponse.json(
        { error: 'Failed to fetch hesudhars' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hesudhars: hesudhars || [],
      total: count || 0,
      page,
      limit,
      hasMore: (hesudhars?.length || 0) === limit
    });
  } catch (error) {
    console.error('Hesudhar GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { word, correct } = await request.json();

    if (!word || !correct) {
      return NextResponse.json(
        { error: 'Word and correct form are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('baakh_hesudhars')
      .insert([
        {
          word,
          correct,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating hesudhar:', error);
      return NextResponse.json(
        { error: 'Failed to create hesudhar entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Hesudhar entry created successfully',
      hesudhar: data
    });
  } catch (error) {
    console.error('Hesudhar POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { id, word, correct } = await request.json();

    if (!id || !word || !correct) {
      return NextResponse.json(
        { error: 'ID, word, and correct form are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('baakh_hesudhars')
      .update({
        word,
        correct,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hesudhar:', error);
      return NextResponse.json(
        { error: 'Failed to update hesudhar entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Hesudhar entry updated successfully',
      hesudhar: data
    });
  } catch (error) {
    console.error('Hesudhar PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('baakh_hesudhars')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting hesudhar:', error);
      return NextResponse.json(
        { error: 'Failed to delete hesudhar entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Hesudhar entry deleted successfully'
    });
  } catch (error) {
    console.error('Hesudhar DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
