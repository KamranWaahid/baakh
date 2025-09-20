import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const provinceId = searchParams.get('province_id');
    
    const supabase = createAdminClient();
    
    let query = supabase
      .from('location_cities')
      .select('id, city_name, province_id, lang')
      .eq('lang', lang)
      .is('deleted_at', null)
      .order('city_name', { ascending: true });

    if (provinceId) {
      query = query.eq('province_id', provinceId);
    }

    const { data: cities, error } = await query;

    if (error) {
      console.error('Error fetching cities list:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cities' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cities: cities || []
    });
  } catch (error) {
    console.error('Error in cities list API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



