import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or headers
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching likes for user:', userId);

    // Fetch user likes from e2ee_user_data table
    const { data: likesData, error: likesError } = await supabase
      .from('e2ee_user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', 'like');

    if (likesError) {
      console.error('❌ Error fetching likes:', likesError);
      return NextResponse.json(
        { error: 'Failed to fetch likes' },
        { status: 500 }
      );
    }

    console.log('✅ Likes fetched successfully:', likesData?.length || 0);

    return NextResponse.json({
      success: true,
      likes: likesData || [],
      count: likesData?.length || 0
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
