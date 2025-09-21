import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@getSupabaseClient()/getSupabaseClient()-js';
import { cookies } from 'next/headers';
import { SubmitReportData, ReportCategory, ReportReason } from '@/types/reports';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
export async function POST(request: NextRequest) {
  try {
    const body: SubmitReportData = await request.json();
    const { poetry_id, category, reason, description } = body;

    // Validate required fields
    if (!poetry_id || !category || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: poetry_id, category, and reason are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: ReportCategory[] = ['common', 'additional'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be "common" or "additional"' },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons: ReportReason[] = [
      'contentError', 'offensive', 'copyright', 'spam', 'misinformation',
      'lowQuality', 'wrongPoet', 'triggering', 'wrongCategory', 'duplicate', 'other'
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason. Must be one of the valid report reasons' },
        { status: 400 }
      );
    }

    // For anonymous reports, we'll allow submission without authentication
    // In a production setup, you might want to implement rate limiting for anonymous users
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('baakh_supabase_auth');
    const localTokenCookie = cookieStore.get('baakh_local_auth');
    
    // Allow anonymous reports for now
    // if (!sessionCookie && !localTokenCookie) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // Check if poetry exists
    const { data: poetry, error: poetryError } = await getSupabaseClient()
      .from('poetry_main')
      .select('id')
      .eq('id', poetry_id)
      .single();

    if (poetryError || !poetry) {
      return NextResponse.json(
        { error: 'Poetry not found' },
        { status: 404 }
      );
    }

    // For anonymous reports, we'll set reporter_id to null
    // This allows anonymous users to submit reports without authentication

    // Submit the report using the service role (bypasses RLS)
    // Cast to proper enum types
    const { data: reportData, error: submitError } = await getSupabaseClient()
      .from('poetry_reports')
      .insert({
        poetry_id: parseInt(poetry_id), // Convert to bigint
        reporter_id: null, // Anonymous report - no user ID
        category: category as any, // Cast to enum type
        reason: reason as any, // Cast to enum type
        description: description || null,
        status: 'pending' as any // Cast to enum type
      })
      .select('id')
      .single();

    if (submitError) {
      console.error('Error submitting report:', submitError);
      console.error('Report data:', { poetry_id, category, reason, description });
      console.error('Supabase error details:', {
        message: submitError.message,
        details: submitError.details,
        hint: submitError.hint,
        code: submitError.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to submit report',
          details: submitError.message,
          hint: submitError.hint,
          code: submitError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report_id: reportData.id,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error in submit report API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
