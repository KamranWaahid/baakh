import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { AdminReportView, ReportFilters, UpdateReportStatusData } from '@/types/reports';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase not configured, using mock client');
    // Return a mock client that won't crash during build
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          }),
          order: () => ({
            range: () => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            })
          })
        })
      })
    } as any;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET - Fetch reports for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const reason = searchParams.get('reason') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Temporarily disable authentication for testing
    // TODO: Re-enable authentication in production
    // const cookieStore = await cookies();
    // const sessionCookie = cookieStore.get('baakh_supabase_auth');
    // const localTokenCookie = cookieStore.get('baakh_local_auth');
    
    // if (!sessionCookie && !localTokenCookie) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // For now, we'll use the service role to access reports
    // In a production setup, you'd want to verify the user's admin role
    // This is a simplified version that trusts the cookie authentication

    // Get reports using direct query instead of function
    let query = supabase
      .from('poetry_reports')
      .select(`
        id,
        poetry_id,
        category,
        reason,
        description,
        status,
        admin_notes,
        created_at,
        updated_at,
        resolved_at,
        reporter_id,
        resolved_by,
        poetry_main!inner(
          poetry_slug,
          poet_id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    if (reason) {
      query = query.eq('reason', reason);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching admin reports:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch reports',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Get poet information for all reports
    const poetIds = reports?.map((report: any) => report.poetry_main?.poet_id).filter(Boolean) || [];
    let poetsData: any[] = [];
    
    if (poetIds.length > 0) {
      const { data: poets, error: poetsError } = await supabase
        .from('poets')
        .select('poet_id, sindhi_name, english_name')
        .in('poet_id', poetIds);
      
      if (!poetsError) {
        poetsData = poets || [];
      }
    }

    // Transform the data to match the expected format
    const transformedReports = reports?.map((report: any) => {
      const poet = poetsData.find(p => p.poet_id === report.poetry_main?.poet_id);
      return {
        report_id: report.id,
        poetry_id: report.poetry_id,
        poetry_slug: report.poetry_main?.poetry_slug || '',
        poet_name: poet?.sindhi_name || '',
        poet_english_name: poet?.english_name || '',
        category: report.category,
        reason: report.reason,
        description: report.description,
        status: report.status,
        admin_notes: report.admin_notes,
        created_at: report.created_at,
        updated_at: report.updated_at,
        resolved_at: report.resolved_at,
        reporter_email: null, // Will need to fetch from auth.users if needed
        reporter_name: null, // Will need to fetch from auth.users if needed
        resolved_by_email: null, // Will need to fetch from auth.users if needed
        resolved_by_name: null // Will need to fetch from auth.users if needed
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: transformedReports,
      pagination: {
        limit,
        offset,
        hasMore: transformedReports.length === limit
      }
    });

  } catch (error) {
    console.error('Error in admin reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update report status
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: UpdateReportStatusData = await request.json();
    const { report_id, status, admin_notes } = body;

    // Validate required fields
    if (!report_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: report_id and status are required' },
        { status: 400 }
      );
    }

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

    // For now, we'll use the service role to update reports
    // In a production setup, you'd want to verify the user's admin role
    // This is a simplified version that trusts the cookie authentication

    // Update report status using the database function
    const { data: success, error: updateError } = await supabase
      .rpc('update_report_status', {
        report_uuid: report_id,
        new_status: status,
        admin_notes: admin_notes || null
      });

    if (updateError) {
      console.error('Error updating report status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update report status' },
        { status: 500 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report status updated successfully'
    });

  } catch (error) {
    console.error('Error in update report status API:', error);
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

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
