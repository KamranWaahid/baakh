import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Fetch counts excluding soft-deleted records
    const { data: countries, error: countriesError } = await supabase
      .from('location_countries')
      .select('id')
      .is('deleted_at', null);

    const { data: provinces, error: provincesError } = await supabase
      .from('location_provinces')
      .select('id')
      .is('deleted_at', null);

    const { data: cities, error: citiesError } = await supabase
      .from('location_cities')
      .select('id')
      .is('deleted_at', null);

    if (countriesError || provincesError || citiesError) {
      console.error('Database errors:', { countriesError, provincesError, citiesError });
      throw new Error('Failed to fetch location data from database');
    }

    const stats = {
      countries: countries?.length || 0,
      provinces: provinces?.length || 0,
      cities: cities?.length || 0,
      total: (countries?.length || 0) + (provinces?.length || 0) + (cities?.length || 0)
    };

    return NextResponse.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching location stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location statistics' },
      { status: 500 }
    );
  }
}
