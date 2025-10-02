export const runtime = 'edge'
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
    const sortBy = searchParams.get('sortBy') || 'province_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    const offset = (page - 1) * perPage;
    
    const supabase = createAdminClient();
    
    // Build base query for count
    let countQuery = supabase
      .from('location_provinces')
      .select('*', { count: 'exact', head: true });
    
    // Apply language filter to count
    if (lang !== 'all') {
      countQuery = countQuery.eq('lang', lang);
    }
    
    // Apply country filter to count
    if (countryId) {
      countQuery = countQuery.eq('country_id', countryId);
    }
    
    // Apply search filter to count
    if (search) {
      countQuery = countQuery.ilike('province_name', `%${search}%`);
    }
    
    // Get total count for pagination
    const { count: total } = await countQuery;
    
    // Build query for data
    let query = supabase
      .from('location_provinces')
      .select(`
        id,
        province_name,
        country_id,
        lang,
        created_at,
        updated_at
      `)
      .is('deleted_at', null);
    
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
    
    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + perPage - 1);
    
    const { data: provinces, error } = await query;
    
    if (error) {
      console.error('Error fetching provinces:', error);
      throw new Error('Failed to fetch provinces');
    }
    
    // Get country names and city counts for each province
    const countryIds = [...new Set(provinces?.map((p: any) => p.country_id) || [])];
    let countryNames: Record<number, string> = {};
    let citiesCount: Record<number, number> = {};
    
    if (countryIds.length > 0) {
      // Get country names
      const { data: countries } = await supabase
        .from('location_countries')
        .select('id, countryname, lang')
        .in('id', countryIds)
        .is('deleted_at', null);
      
      countries?.forEach((country: any) => {
        countryNames[country.id] = country.countryname;
      });
      
      // Get city counts
      const provinceIds = provinces?.map((p: any) => p.id) || [];
      const { data: cities } = await supabase
        .from('location_cities')
        .select('province_id')
        .in('province_id', provinceIds)
        .is('deleted_at', null);
      
      cities?.forEach((city: any) => {
        citiesCount[city.province_id] = (citiesCount[city.province_id] || 0) + 1;
      });
    }
    
    // Enhance provinces with country names and city counts
    const enhancedProvinces = provinces?.map((province: any) => ({
      ...province,
      country_name: countryNames[province.country_id] || 'Unknown Country',
      cities_count: citiesCount[province.id] || 0
    })) || [];
    
    return NextResponse.json({
      success: true,
      provinces: enhancedProvinces,
      pagination: {
        page,
        perPage,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / perPage)
      }
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { province_name, country_id, lang } = body;
    
    if (!province_name || !country_id || !lang) {
      return NextResponse.json(
        { success: false, error: 'Province name, country ID, and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if country exists
    const { data: country } = await supabase
      .from('location_countries')
      .select('id')
      .eq('id', country_id)
      .is('deleted_at', null)
      .single();
    
    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Selected country does not exist' },
        { status: 400 }
      );
    }
    
    // Check for duplicate province name in the same country and language
    const { data: existing } = await supabase
      .from('location_provinces')
      .select('id')
      .eq('province_name', province_name.trim())
      .eq('country_id', country_id)
      .eq('lang', lang)
      .is('deleted_at', null)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A province with this name already exists in this country and language' },
        { status: 409 }
      );
    }
    
    const { data: province, error } = await supabase
      .from('location_provinces')
      .insert({
        province_name: province_name.trim(),
        country_id,
        lang
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating province:', error);
      throw new Error('Failed to create province');
    }
    
    return NextResponse.json({
      success: true,
      province
    });
  } catch (error) {
    console.error('Error creating province:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create province' },
      { status: 500 }
    );
  }
}
