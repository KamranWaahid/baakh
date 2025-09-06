import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid province ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    const { data: province, error } = await supabase
      .from('location_provinces')
      .select(`
        id,
        province_name,
        country_id,
        lang,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error || !province) {
      return NextResponse.json(
        { success: false, error: 'Province not found' },
        { status: 404 }
      );
    }
    
    // Get country name
    const { data: country } = await supabase
      .from('location_countries')
      .select('countryname, lang')
      .eq('id', province.country_id)
      .is('deleted_at', null)
      .single();
    
    // Get city count
    const { count: citiesCount } = await supabase
      .from('location_cities')
      .select('*', { count: 'exact', head: true })
      .eq('province_id', id)
      .is('deleted_at', null);
    
    const enhancedProvince = {
      ...province,
      country_name: country?.countryname || 'Unknown Country',
      cities_count: citiesCount || 0
    };
    
    return NextResponse.json({
      success: true,
      province: enhancedProvince
    });
  } catch (error) {
    console.error('Error fetching province:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch province' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid province ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { province_name, country_id, lang } = body;
    
    if (!province_name || !country_id || !lang) {
      return NextResponse.json(
        { success: false, error: 'Province name, country ID, and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if province exists
    const { data: existing } = await supabase
      .from('location_provinces')
      .select('id, lang')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Province not found' },
        { status: 404 }
      );
    }
    
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
    
    // Check for duplicate province name in the same country and language (excluding current province)
    const { data: duplicate } = await supabase
      .from('location_provinces')
      .select('id')
      .eq('province_name', province_name.trim())
      .eq('country_id', country_id)
      .eq('lang', lang)
      .neq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'A province with this name already exists in this country and language' },
        { status: 409 }
      );
    }
    
    const { data: province, error } = await supabase
      .from('location_provinces')
      .update({
        province_name: province_name.trim(),
        country_id,
        lang,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating province:', error);
      throw new Error('Failed to update province');
    }
    
    return NextResponse.json({
      success: true,
      province
    });
  } catch (error) {
    console.error('Error updating province:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update province' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid province ID' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check if province has cities
    const { count: citiesCount } = await supabase
      .from('location_cities')
      .select('*', { count: 'exact', head: true })
      .eq('province_id', id)
      .is('deleted_at', null);
    
    if (citiesCount && citiesCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete province with existing cities',
          details: `This province has ${citiesCount} city(ies). Please delete all cities first.`
        },
        { status: 409 }
      );
    }
    
    // Soft delete the province
    const { error } = await supabase
      .from('location_provinces')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting province:', error);
      throw new Error('Failed to delete province');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Province deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting province:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete province' },
      { status: 500 }
    );
  }
}
