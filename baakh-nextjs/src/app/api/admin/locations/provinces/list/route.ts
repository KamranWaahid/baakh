import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'all';
    const countryId = searchParams.get('country_id') || '';
    const search = searchParams.get('search') || '';
    
    const supabase = createAdminClient();
    
    let query = supabase
      .from('location_provinces')
      .select('id, province_name, country_id, lang')
      .is('deleted_at', null)
      .order('province_name');
    
    // Apply language filter
    if (lang !== 'all') {
      query = query.eq('lang', lang);
    }
    
    // Apply country filter
    if (countryId) {
      query = query.eq('country_id', countryId);
    }
    
    // Apply search filter
    if (search) {
      query = query.ilike('province_name', `%${search}%`);
    }
    
    const { data: provinces, error } = await query;
    
    if (error) {
      console.error('Error fetching provinces list:', error);
      throw new Error('Failed to fetch provinces');
    }
    
    return NextResponse.json({
      success: true,
      provinces: provinces || []
    });
  } catch (error) {
    console.error('Error fetching provinces list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}
