import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/getSupabaseClient()/server';
import { createClient } from '@getSupabaseClient()/getSupabaseClient()-js';

export async function GET(request: NextRequest) {
  try {
    // Use service role key for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const getSupabaseClient() = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const lang = searchParams.get('lang') || 'en';

    let query = getSupabaseClient()
      .from('timeline_periods')
      .select('*', { count: 'exact' })
      .order('start_year', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: periods, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline periods:', error);
      
      if (error.code === '42501') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Timeline tables not set up',
            details: 'The timeline_periods table does not exist. Please run the database setup script.',
            code: 'TABLE_NOT_EXISTS',
            instructions: 'Go to Supabase Dashboard > SQL Editor and run the setup_timeline_tables.sql script'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch timeline periods',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Transform the data to match the component's expected interface
    const isSindhi = lang === 'sd';
    const transformedPeriods = (periods || []).map(period => ({
      id: period.id,
      period_slug: period.period_slug,
      start_year: period.start_year,
      end_year: period.end_year,
      is_ongoing: period.is_ongoing,
      name: isSindhi ? period.sindhi_name : period.english_name,
      description: isSindhi ? period.sindhi_description : period.english_description,
      characteristics: (isSindhi ? (period.sindhi_characteristics || []) : (period.english_characteristics || [])).filter((char: any) => char && char.trim() !== ''),
      color_code: period.color_code,
      icon_name: period.icon_name,
      is_featured: period.is_featured,
      sort_order: period.sort_order
    }));

    return NextResponse.json({
      success: true,
      periods: transformedPeriods,
      total: count || 0
    });

  } catch (error) {
    console.error('Error in timeline periods API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use service role key for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const getSupabaseClient() = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    
    const {
      period_slug,
      start_year,
      end_year,
      is_ongoing,
      sindhi_name,
      sindhi_description,
      sindhi_characteristics,
      english_name,
      english_description,
      english_characteristics,
      color_code,
      is_featured,
      sort_order
    } = body;

    // Validate required fields
    if (!period_slug || !start_year || !english_name || !sindhi_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: period_slug, start_year, english_name, and sindhi_name are required' },
        { status: 400 }
      );
    }

    // Test database connection first
    const { data: testData, error: testError } = await getSupabaseClient()
      .from('timeline_periods')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      
      if (testError.code === '42501') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Timeline tables not set up',
            details: 'The timeline_periods table does not exist. Please run the database setup script.',
            code: 'TABLE_NOT_EXISTS',
            instructions: 'Go to Supabase Dashboard > SQL Editor and run the setup_timeline_tables.sql script'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: testError.message,
          code: testError.code
        },
        { status: 500 }
      );
    }

    console.log('Database connection test successful');

    const { data: period, error } = await getSupabaseClient()
      .from('timeline_periods')
      .insert({
        period_slug,
        start_year,
        end_year,
        is_ongoing: is_ongoing || false,
        sindhi_name,
        sindhi_description,
        sindhi_characteristics: sindhi_characteristics || [],
        english_name,
        english_description,
        english_characteristics: english_characteristics || [],
        color_code: color_code || '#3B82F6',
        is_featured: is_featured || false,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline period:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Data being inserted:', JSON.stringify({
        period_slug,
        start_year,
        end_year,
        is_ongoing: is_ongoing || false,
        sindhi_name,
        sindhi_description,
        sindhi_characteristics: sindhi_characteristics || [],
        english_name,
        english_description,
        english_characteristics: english_characteristics || [],
        color_code: color_code || '#3B82F6',
        is_featured: is_featured || false,
        sort_order: sort_order || 0
      }, null, 2));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create timeline period',
          details: error.message || 'Unknown database error',
          code: error.code || 'UNKNOWN'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      period
    });

  } catch (error) {
    console.error('Error in timeline periods POST API:', error);
    
    // Provide more specific error information
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
