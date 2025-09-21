import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    const { data: country, error } = await supabase
      .from('location_countries')
      .select(`
        id,
        countryname,
        abbreviation,
        countrydesc,
        continent,
        capital_city,
        lang,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error || !country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }
    
    // Get capital city name if exists
    let capitalCityName = null;
    if (country.capital_city) {
      const { data: capitalCity } = await supabase
        .from('location_cities')
        .select('city_name, lang')
        .eq('id', country.capital_city)
        .is('deleted_at', null)
        .single();
      
      capitalCityName = capitalCity?.city_name || null;
    }
    
    // Get province and city counts
    const { count: provincesCount } = await supabase
      .from('location_provinces')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', id)
      .is('deleted_at', null);
    
    const { count: citiesCount } = await supabase
      .from('location_cities')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', id)
      .is('deleted_at', null);
    
    const enhancedCountry = {
      ...country,
      capital_city_name: capitalCityName,
      provinces_count: provincesCount || 0,
      cities_count: citiesCount || 0
    };
    
    return NextResponse.json({
      success: true,
      country: enhancedCountry
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch country' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { countryname, abbreviation, countrydesc, continent, capital_city, lang } = body;
    
    if (!countryname || !lang) {
      return NextResponse.json(
        { success: false, error: 'Country name and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if country exists
    const { data: existing } = await supabase
      .from('location_countries')
      .select('id, lang')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }
    
    // Check for duplicate country name in the same language (excluding current country)
    const { data: duplicate } = await supabase
      .from('location_countries')
      .select('id')
      .eq('countryname', countryname.trim())
      .eq('lang', lang)
      .neq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'A country with this name already exists in this language' },
        { status: 409 }
      );
    }
    
    const { data: country, error } = await supabase
      .from('location_countries')
      .update({
        countryname: countryname.trim(),
        abbreviation: abbreviation?.toUpperCase().trim() || null,
        countrydesc: countrydesc?.trim() || null,
        continent: continent?.trim() || null,
        capital_city: capital_city || null,
        lang,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating country:', error);
      throw new Error('Failed to update country');
    }
    
    return NextResponse.json({
      success: true,
      country
    });
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update country' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if country has provinces
    const { count: provincesCount } = await supabase
      .from('location_provinces')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', id)
      .is('deleted_at', null);
    
    if (provincesCount && provincesCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete country with existing provinces',
          details: `This country has ${provincesCount} province(s). Please delete all provinces first.`
        },
        { status: 409 }
      );
    }
    
    // Soft delete the country
    const { error } = await supabase
      .from('location_countries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting country:', error);
      throw new Error('Failed to delete country');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Country deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete country' },
      { status: 500 }
    );
  }
}
