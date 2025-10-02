export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time errors
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();
    const { coupletId, userId } = body;

    if (!coupletId || !userId) {
      return NextResponse.json(
        { error: 'Couplet ID and User ID are required' },
        { status: 400 }
      );
    }

    // First, get the couplet slug from poetry_couplets table
    const { data: coupletData, error: coupletError } = await supabase
      .from('poetry_couplets')
      .select('couplet_slug')
      .eq('id', coupletId)
      .single();

    if (coupletError || !coupletData) {
      console.error('❌ Error fetching couplet slug:', coupletError);
      return NextResponse.json(
        { error: 'Failed to fetch couplet details' },
        { status: 500 }
      );
    }

    // Use the secure function to insert bookmark with polymorphic structure and slug
    const { data, error } = await supabase
      .rpc('insert_user_bookmark', {
        p_user_uuid: userId,
        p_bookmarkable_id: coupletId,
        p_bookmarkable_type: 'couplet',
        p_couplet_slug: coupletData.couplet_slug
      });

    if (error) {
      console.error('Error inserting bookmark:', error);
      return NextResponse.json(
        { error: 'Failed to bookmark couplet', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Couplet bookmarked successfully',
      couplet_slug: coupletData.couplet_slug
    });

  } catch (error) {
    console.error('Bookmark creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const coupletId = searchParams.get('coupletId');
    const userId = searchParams.get('userId');

    if (!coupletId || !userId) {
      return NextResponse.json(
        { error: 'Couplet ID and User ID are required' },
        { status: 400 }
      );
    }

    // Use the secure function to delete bookmark with polymorphic structure
    const { data, error } = await supabase
      .rpc('delete_user_bookmark', {
        p_user_uuid: userId,
        p_bookmarkable_id: coupletId,
        p_bookmarkable_type: 'couplet'
      });

    if (error) {
      console.error('Error deleting bookmark:', error);
      return NextResponse.json(
        { error: 'Failed to delete bookmark', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Bookmark deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const coupletId = searchParams.get('coupletId');
    const userId = searchParams.get('userId');

    if (!coupletId || !userId) {
      return NextResponse.json(
        { error: 'Couplet ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user has bookmarked this couplet using service role
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('bookmarkable_id', coupletId)
      .eq('bookmarkable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (bookmarkError && bookmarkError.code !== 'PGRST116') {
      console.error('Error checking bookmark status:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to check bookmark status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isBookmarked: !!bookmark,
      bookmarkId: bookmark?.id || null
    });

  } catch (error) {
    console.error('Bookmark status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
