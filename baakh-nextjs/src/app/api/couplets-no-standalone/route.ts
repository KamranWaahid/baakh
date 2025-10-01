import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== COUPLETS NO-STANDALONE API ROUTE STARTED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const poetId = searchParams.get('poet_id') || '';
    const categoryId = searchParams.get('category_id') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const lang = searchParams.get('lang') || 'en';
    
    console.log('Query parameters:', {
      page, limit, search, poetId, categoryId, sortBy, sortOrder, lang
    });
    
    const supabase = createAdminClient();
    
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          details: 'Supabase client could not be initialized. Please check environment variables.'
        }, 
        { status: 500 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Simple query without joins and without standalone filter
    let query = supabase
      .from('couplets')
      .select('*', { count: 'exact' });
    
    // Apply search filter
    if (search) {
      if (lang === 'sd') {
        query = query.or(`sindhi_text.ilike.%${search}%,sindhi_translation.ilike.%${search}%`);
      } else {
        query = query.or(`english_text.ilike.%${search}%,english_translation.ilike.%${search}%`);
      }
    }
    
    if (poetId) {
      query = query.eq('poet_id', poetId);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });
    
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
          code: error.code,
          hint: error.hint
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
    
    console.log('Couplets response:', {
      success: response.success,
      coupletsCount: response.couplets.length,
      total: response.total
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unexpected error in couplets no-standalone API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
