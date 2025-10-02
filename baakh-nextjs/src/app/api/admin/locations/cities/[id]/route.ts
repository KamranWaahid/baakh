export const runtime = 'edge'
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
        { success: false, error: 'Invalid city ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    const { data: city, error } = await supabase
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
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error || !city) {
      return NextResponse.json(
        { success: false, error: 'City not found' },
        { status: 404 }
      );
    }
    
    // Get province and country names
    const { data: province } = await supabase
      .from('location_provinces')
      .select('province_name, country_id, lang')
      .eq('id', city.province_id)
      .is('deleted_at', null)
      .single();
    
    let countryName = 'Unknown Country';
    if (province?.country_id) {
      const { data: country } = await supabase
        .from('location_countries')
        .select('countryname, lang')
        .eq('id', province.country_id)
        .is('deleted_at', null)
        .single();
      
      countryName = country?.countryname || 'Unknown Country';
    }
    
    const enhancedCity = {
      ...city,
      province_name: province?.province_name || 'Unknown Province',
      country_name: countryName
    };
    
    return NextResponse.json({
      success: true,
      city: enhancedCity
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch city' },
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
        { success: false, error: 'Invalid city ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { city_name, province_id, geo_lat, geo_long, lang } = body;
    
    if (!city_name || !province_id || !lang) {
      return NextResponse.json(
        { success: false, error: 'City name, province ID, and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if city exists
    const { data: existing } = await supabase
      .from('location_cities')
      .select('id, lang')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'City not found' },
        { status: 404 }
      );
    }
    
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
    
    // Check for duplicate city name in the same province and language (excluding current city)
    const { data: duplicate } = await supabase
      .from('location_cities')
      .select('id')
      .eq('city_name', city_name.trim())
      .eq('province_id', province_id)
      .eq('lang', lang)
      .neq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'A city with this name already exists in this province and language' },
        { status: 409 }
      );
    }
    
    const { data: city, error } = await supabase
      .from('location_cities')
      .update({
        city_name: city_name.trim(),
        province_id,
        geo_lat: geo_lat?.trim() || null,
        geo_long: geo_long?.trim() || null,
        lang,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating city:', error);
      throw new Error('Failed to update city');
    }
    
    return NextResponse.json({
      success: true,
      city
    });
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update city' },
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
        { success: false, error: 'Invalid city ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Soft delete the city
    const { error } = await supabase
      .from('location_cities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting city:', error);
      throw new Error('Failed to delete city');
    }
    
    return NextResponse.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete city' },
      { status: 500 }
    );
  }
}
