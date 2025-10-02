export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const countryId = searchParams.get('country_id');
    
    const supabase = createAdminClient();
    
    let query = supabase
      .from('location_provinces')
      .select('id, province_name, country_id, lang')
      .eq('lang', lang)
      .is('deleted_at', null)
      .order('province_name', { ascending: true });

    if (countryId) {
      query = query.eq('country_id', countryId);
    }

    const { data: provinces, error } = await query;

    if (error) {
      console.error('Error fetching provinces list:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch provinces' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provinces: provinces || []
    });
  } catch (error) {
    console.error('Error in provinces list API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}