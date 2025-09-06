import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'all';
    const search = searchParams.get('search') || '';
    
    const supabase = createAdminClient();
    
    let query = supabase
      .from('location_countries')
      .select('id, countryname, abbreviation, lang')
      .is('deleted_at', null)
      .order('countryname');
    
    // Apply language filter
    if (lang !== 'all') {
      query = query.eq('lang', lang);
    }
    
    // Apply search filter
    if (search) {
      query = query.ilike('countryname', `%${search}%`);
    }
    
    const { data: countries, error } = await query;
    
    if (error) {
      console.error('Error fetching countries list:', error);
      throw new Error('Failed to fetch countries');
    }
    
    return NextResponse.json({
      success: true,
      countries: countries || []
    });
  } catch (error) {
    console.error('Error fetching countries list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
