export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Test basic connection
    console.log('Testing database connection...');
    
    // Check if tables exist and have data
    const { data: countries, error: countriesError } = await supabase
      .from('location_countries')
      .select('count')
      .limit(1);
    
    console.log('Countries query result:', { countries, countriesError });
    
    const { data: provinces, error: provincesError } = await supabase
      .from('location_provinces')
      .select('count')
      .limit(1);
    
    console.log('Provinces query result:', { provinces, provincesError });
    
    const { data: cities, error: citiesError } = await supabase
      .from('location_cities')
      .select('count')
      .limit(1);
    
    console.log('Cities query result:', { cities, citiesError });
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'location_countries' })
      .single();
    
    console.log('Table info result:', { tableInfo, tableError });
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      results: {
        countries: { data: countries, error: countriesError },
        provinces: { data: provinces, error: provincesError },
        cities: { data: cities, error: citiesError },
        tableInfo: { data: tableInfo, error: tableError }
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
