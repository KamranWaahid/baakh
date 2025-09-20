import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
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

    // Use the secure function to insert like with polymorphic structure and slug
    const { data, error } = await supabase
      .rpc('insert_user_like', {
        p_user_uuid: userId,
        p_likeable_id: coupletId,
        p_likeable_type: 'couplet',
        p_couplet_slug: coupletData.couplet_slug
      });

    if (error) {
      console.error('Error inserting like:', error);
      return NextResponse.json(
        { error: 'Failed to like couplet', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Couplet liked successfully',
      couplet_slug: coupletData.couplet_slug
    });

  } catch (error) {
    console.error('Like creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coupletId = searchParams.get('coupletId');
    const userId = searchParams.get('userId');

    if (!coupletId || !userId) {
      return NextResponse.json(
        { error: 'Couplet ID and User ID are required' },
        { status: 400 }
      );
    }

    // Use the secure function to delete like with polymorphic structure
    const { data, error } = await supabase
      .rpc('delete_user_like', {
        p_user_uuid: userId,
        p_likeable_id: coupletId,
        p_likeable_type: 'couplet'
      });

    if (error) {
      console.error('Error deleting like:', error);
      return NextResponse.json(
        { error: 'Failed to delete like', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Like removed successfully'
    });

  } catch (error) {
    console.error('Like deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coupletId = searchParams.get('coupletId');
    const userId = searchParams.get('userId');

    if (!coupletId || !userId) {
      return NextResponse.json(
        { error: 'Couplet ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user has liked this couplet using service role
    const { data: like, error: likeError } = await supabase
      .from('user_likes')
      .select('id')
      .eq('likeable_id', coupletId)
      .eq('likeable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking like status:', likeError);
      return NextResponse.json(
        { error: 'Failed to check like status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isLiked: !!like,
      likeId: like?.id || null
    });

  } catch (error) {
    console.error('Like status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
