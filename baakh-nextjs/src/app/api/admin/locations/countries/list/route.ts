export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    const supabase = createAdminClient();
    
    const { data: countries, error } = await supabase
      .from('location_countries')
      .select('id, countryname, abbreviation, lang')
      .eq('lang', lang)
      .is('deleted_at', null)
      .order('countryname', { ascending: true });

    if (error) {
      console.error('Error fetching countries list:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      countries: countries || []
    });
  } catch (error) {
    console.error('Error in countries list API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}