export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    const supabase = createAdminClient();
    
    // Fetch cities with their province information
    const { data: cities, error: citiesError } = await supabase
      .from('location_cities')
      .select(`
        id,
        city_name,
        lang,
        province_id
      `)
      .eq('lang', lang)
      .order('city_name');

    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cities' },
        { status: 500 }
      );
    }

    // Fetch provinces for the cities
    const { data: provinces, error: provincesError } = await supabase
      .from('location_provinces')
      .select('id, province_name, lang')
      .eq('lang', lang);

    if (provincesError) {
      console.error('Error fetching provinces:', provincesError);
      // Continue without province data
    }

    // Process cities with related province data
    const processedCities = cities?.map((city: any) => {
      const province = provinces?.find((p: any) => p.id === city.province_id);
      
      return {
        ...city,
        province: province ? { province_name: province.province_name } : undefined
      };
    }) || [];

    return NextResponse.json({
      success: true,
      cities: processedCities
    });
  } catch (error) {
    console.error('Error in cities API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
