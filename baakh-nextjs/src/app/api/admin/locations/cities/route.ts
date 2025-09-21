import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const search = searchParams.get('search') || '';
    const lang = searchParams.get('lang') || 'all';
    const countryId = searchParams.get('country_id') || '';
    const provinceId = searchParams.get('province_id') || '';
    const sortBy = searchParams.get('sortBy') || 'city_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    const offset = (page - 1) * perPage;
    
    const supabase = createAdminClient();
    
    // Build base query for count
    let countQuery = supabase
      .from('location_cities')
      .select('*', { count: 'exact', head: true });
    
    // Apply language filter to count
    if (lang !== 'all') {
      countQuery = countQuery.eq('lang', lang);
    }
    
    // Apply province filter to count
    if (provinceId) {
      countQuery = countQuery.eq('province_id', provinceId);
    }
    
    // Apply search filter to count
    if (search) {
      countQuery = countQuery.ilike('city_name', `%${search}%`);
    }
    
    // Get total count for pagination
    const { count: total } = await countQuery;
    
    // Build query for data
    let query = supabase
      .from('location_cities')
      .select(`
        id,
        city_name,
        province_id,
        geo_lat,
        geo_long,
        lang,
        created_at,
        updated_at
      `)
      .is('deleted_at', null);
    
    // Apply language filter
    if (lang !== 'all') {
      query = query.eq('lang', lang);
    }
    
    // Apply province filter
    if (provinceId) {
      query = query.eq('province_id', provinceId);
    }
    
    // Apply search filter
    if (search) {
      query = query.ilike('city_name', `%${search}%`);
    }
    
    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + perPage - 1);
    
    const { data: cities, error } = await query;
    
    if (error) {
      console.error('Error fetching cities:', error);
      throw new Error('Failed to fetch cities');
    }
    
    // Get province and country names for each city
    const provinceIds = [...new Set(cities?.map((c: any) => c.province_id) || [])];
    const provinceNames: Record<number, string> = {};
    const countryNames: Record<number, string> = {};
    
    if (provinceIds.length > 0) {
      // Get province names and country IDs
      const { data: provinces } = await supabase
        .from('location_provinces')
        .select('id, province_name, country_id, lang')
        .in('id', provinceIds)
        .is('deleted_at', null);
      
      provinces?.forEach((province: any) => {
        provinceNames[province.id] = province.province_name;
      });
      
      // Get country names
      const countryIds = [...new Set(provinces?.map((p: any) => p.country_id) || [])];
      const { data: countries } = await supabase
        .from('location_countries')
        .select('id, countryname, lang')
        .in('id', countryIds)
        .is('deleted_at', null);
      
      countries?.forEach((country: any) => {
        countryNames[country.id] = country.countryname;
      });
      
      // Map country names to provinces
      provinces?.forEach((province: any) => {
        if (province.country_id) {
          provinceNames[province.id] = `${provinceNames[province.id]} (${countryNames[province.country_id] || 'Unknown Country'})`;
        }
      });
    }
    
    // Enhance cities with province and country names
    const enhancedCities = cities?.map((city: any) => ({
      ...city,
      province_name: provinceNames[city.province_id] || 'Unknown Province'
    })) || [];
    
    return NextResponse.json({
      success: true,
      cities: enhancedCities,
      pagination: {
        page,
        perPage,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / perPage)
      }
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city_name, province_id, geo_lat, geo_long, lang } = body;
    
    if (!city_name || !province_id || !lang) {
      return NextResponse.json(
        { success: false, error: 'City name, province ID, and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if province exists
    const { data: province } = await supabase
      .from('location_provinces')
      .select('id')
      .eq('id', province_id)
      .is('deleted_at', null)
      .single();
    
    if (!province) {
      return NextResponse.json(
        { success: false, error: 'Selected province does not exist' },
        { status: 400 }
      );
    }
    
    // Check for duplicate city name in the same province and language
    const { data: existing } = await supabase
      .from('location_cities')
      .select('id')
      .eq('city_name', city_name.trim())
      .eq('province_id', province_id)
      .eq('lang', lang)
      .is('deleted_at', null)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A city with this name already exists in this province and language' },
        { status: 409 }
      );
    }
    
    const { data: city, error } = await supabase
      .from('location_cities')
      .insert({
        city_name: city_name.trim(),
        province_id,
        geo_lat: geo_lat?.trim() || null,
        geo_long: geo_long?.trim() || null,
        lang
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating city:', error);
      throw new Error('Failed to create city');
    }
    
    return NextResponse.json({
      success: true,
      city
    });
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create city' },
      { status: 500 }
    );
  }
}
