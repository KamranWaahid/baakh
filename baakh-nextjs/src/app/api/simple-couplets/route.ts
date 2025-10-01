import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== SIMPLE COUPLETS API ROUTE STARTED ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const standalone = searchParams.get('standalone') === '1';
    
    console.log('Query parameters:', { page, limit, standalone });
    
    const supabase = createAdminClient();
    
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          details: 'Supabase client could not be initialized.'
        }, 
        { status: 500 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Simple query without joins
    let query = supabase
      .from('poetry_couplets')
      .select('*', { count: 'exact' });
    
    // Apply active filter if requested (standalone functionality)
    if (standalone) {
      query = query.eq('is_active', true);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    console.log('Executing simple query...');
    const { data: couplets, error, count } = await query;
    
    if (error) {
      console.error('Simple query error:', error);
      return NextResponse.json(
        { 
          error: 'Database query failed', 
          details: error.message,
          code: error.code
        }, 
        { status: 500 }
      );
    }
    
    const response = {
      success: true,
      couplets: couplets || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
    
    console.log('Simple couplets response:', {
      success: response.success,
      coupletsCount: response.couplets.length,
      total: response.total
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unexpected error in simple couplets API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
