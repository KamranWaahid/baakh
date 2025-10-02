export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== POETS API ROUTE STARTED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const period = searchParams.get('period') || '';
    const startYear = searchParams.get('start_year');
    const endYear = searchParams.get('end_year');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const lang = searchParams.get('lang') || 'en';
    const countOnly = searchParams.get('countOnly') === 'true';
    const isFeatured = searchParams.get('is_featured') === 'true';
    
    console.log('Query parameters:', {
      page, limit, search, period, sortBy, sortOrder, lang, countOnly, isFeatured
    });
    
    const supabase = createAdminClient();
    
    // Check if Supabase client is properly configured
    if (!supabase) {
      console.error('Supabase client not properly configured');
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          details: 'Supabase client could not be initialized. Please check environment variables.'
        }, 
        { status: 500 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('poets')
      .select('*', { count: 'exact' })
      .eq('is_hidden', false);
    
    // Apply search filter
    if (search) {
      if (lang === 'sd') {
        query = query.or(`sindhi_name.ilike.%${search}%,sindhi_laqab.ilike.%${search}%,sindhi_tagline.ilike.%${search}%`);
      } else {
        query = query.or(`english_name.ilike.%${search}%,english_laqab.ilike.%${search}%,english_tagline.ilike.%${search}%`);
      }
    }
    
    // Apply period filter (ignore "All Periods" and empty values)
    if (period && period !== 'All Periods' && period !== '') {
      // Filter by birth_date based on period
      const currentYear = new Date().getFullYear();
      let startYear, endYear;
      
      switch (period) {
        case '17th Century':
          startYear = 1601;
          endYear = 1700;
          break;
        case '18th Century':
          startYear = 1701;
          endYear = 1800;
          break;
        case '19th Century':
          startYear = 1801;
          endYear = 1900;
          break;
        case '20th Century':
          startYear = 1901;
          endYear = 2000;
          break;
        default:
          // If period doesn't match any known values, skip filtering
          break;
      }
      
      if (startYear && endYear) {
        query = query
          .gte('birth_date', `${startYear}-01-01`)
          .lte('birth_date', `${endYear}-12-31`);
      }
    }

    // Apply year range filter (for timeline periods)
    if (startYear && endYear) {
      console.log('Applying year range filter:', { startYear, endYear });
      // Include poets who were alive during this era:
      // 1. Born before or during the era AND died after or during the era
      // 2. Born during the era (regardless of death date)
      // 3. Died during the era (regardless of birth date)
      // This covers all cases where someone was alive at any point during the period
      query = query.or(
        `and(birth_date.lte.${endYear}-12-31,or(death_date.gte.${startYear}-01-01,death_date.is.null)),` +
        `and(birth_date.gte.${startYear}-01-01,birth_date.lte.${endYear}-12-31),` +
        `and(death_date.gte.${startYear}-01-01,death_date.lte.${endYear}-12-31)`
      );
      console.log('Applied year range filter query');
    }
    
    // Apply featured filter
    if (isFeatured) {
      query = query.eq('is_featured', true);
    }
    
    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });
    
    // Apply pagination
    if (!countOnly) {
      query = query.range(offset, offset + limit - 1);
    }
    
    console.log('Executing Supabase query...');
    const { data: poets, error, count } = await query;
    console.log('Query result:', { poetsCount: poets?.length || 0, totalCount: count, error: error?.message });
    
    // Debug: Log sample poets to see their birth/death dates
    if (poets && poets.length > 0) {
      console.log('Sample poets from query:', poets.slice(0, 3).map((p: any) => ({
        name: p.english_name || p.sindhi_name,
        birth_date: p.birth_date,
        death_date: p.death_date,
        poet_slug: p.poet_slug
      })));
      
      // Check specifically for Iqbal Rind
      const iqbalRind = poets.find((p: any) => 
        (p.english_name && p.english_name.toLowerCase().includes('iqbal')) ||
        (p.sindhi_name && p.sindhi_name.toLowerCase().includes('اقبال'))
      );
      if (iqbalRind) {
        console.log('Found Iqbal Rind in results:', {
          name: iqbalRind.english_name || iqbalRind.sindhi_name,
          birth_date: iqbalRind.birth_date,
          death_date: iqbalRind.death_date,
          poet_slug: iqbalRind.poet_slug
        });
      }
    }
    
    if (error) {
      console.error('Supabase query error:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
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
      poets: poets || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
    
    console.log('Poets response:', {
      success: response.success,
      poetsCount: response.poets.length,
      total: response.total
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unexpected error in poets API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== POETS POST API ROUTE STARTED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const supabase = createAdminClient();
    
    const { data: poet, error } = await supabase
      .from('poets')
      .insert(body)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          error: 'Database insert failed', 
          details: error.message
        }, 
        { status: 500 }
      );
    }
    
    console.log('Poet created successfully:', poet);
    
    return NextResponse.json({
      success: true,
      poet,
      message: 'Poet created successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error in poets POST API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}