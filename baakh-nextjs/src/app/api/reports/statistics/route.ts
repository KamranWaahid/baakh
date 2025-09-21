import { NextRequest, NextResponse } from 'next/server';;
import { createClient } from '@supabase/supabase-js';;
import { cookies } from 'next/headers';
import { ReportStatistics } from '@/types/reports';

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
    const { searchParams } = new URL(request.url);
    const poetryId = searchParams.get('poetry_id');

    // Check authentication using cookies (same pattern as /api/auth/me)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('baakh_supabase_auth');
    const localTokenCookie = cookieStore.get('baakh_local_auth');
    
    if (!sessionCookie && !localTokenCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let query = getSupabaseClient()
      .from('report_statistics')
      .select('*');

    if (poetryId) {
      query = query.eq('poetry_id', poetryId);
    }

    const { data: statistics, error } = await query;

    if (error) {
      console.error('Error fetching report statistics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch report statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error in report statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
