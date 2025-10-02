export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminClient();
    
    const { data: poet, error } = await admin
      .from('poets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Poet not found' }, { status: 404 });
      }
      console.error('Error fetching poet:', error);
      return NextResponse.json({ error: 'Failed to fetch poet' }, { status: 500 });
    }

    return NextResponse.json({ poet }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = getAdminClient();
    
    // For PATCH, we only update the fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided in the request
    if (body.poet_slug !== undefined) updateData.poet_slug = body.poet_slug;
    if (body.birth_date !== undefined) updateData.birth_date = body.birth_date;
    if (body.death_date !== undefined) updateData.death_date = body.death_date;
    if (body.birth_place !== undefined) updateData.birth_place = body.birth_place;
    if (body.death_place !== undefined) updateData.death_place = body.death_place;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.file_url !== undefined) updateData.file_url = body.file_url;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_hidden !== undefined) updateData.is_hidden = body.is_hidden;
    if (body.sindhi_name !== undefined) updateData.sindhi_name = body.sindhi_name;
    if (body.sindhi_laqab !== undefined) updateData.sindhi_laqab = body.sindhi_laqab;
    if (body.sindhi_takhalus !== undefined) updateData.sindhi_takhalus = body.sindhi_takhalus;
    if (body.sindhi_tagline !== undefined) updateData.sindhi_tagline = body.sindhi_tagline;
    if (body.sindhi_details !== undefined) updateData.sindhi_details = body.sindhi_details;
    if (body.english_name !== undefined) updateData.english_name = body.english_name;
    if (body.english_laqab !== undefined) updateData.english_laqab = body.english_laqab;
    if (body.english_takhalus !== undefined) updateData.english_takhalus = body.english_takhalus;
    if (body.english_tagline !== undefined) updateData.english_tagline = body.english_tagline;
    if (body.english_details !== undefined) updateData.english_details = body.english_details;

    // If updating poet_slug, check for uniqueness
    if (body.poet_slug) {
      const { data: existingPoet } = await admin
        .from('poets')
        .select('id')
        .eq('poet_slug', body.poet_slug)
        .neq('id', id)
        .single();

      if (existingPoet) {
        return NextResponse.json({ 
          error: 'Poet with this slug already exists' 
        }, { status: 409 });
      }
    }

    // Update the poet
    const { data: updatedPoet, error: updateError } = await admin
      .from('poets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating poet:', updateError);
      return NextResponse.json({ error: 'Failed to update poet' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Poet updated successfully', 
      poet: updatedPoet 
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = getAdminClient();
    
    // Validate required fields
    if (!body.poet_slug || !body.sindhi_name || !body.english_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: poet_slug, sindhi_name, english_name' 
      }, { status: 400 });
    }

    // Check if poet with same slug already exists (excluding current poet)
    const { data: existingPoet } = await admin
      .from('poets')
      .select('id')
      .eq('poet_slug', body.poet_slug)
      .neq('id', id)
      .single();

    if (existingPoet) {
      return NextResponse.json({ 
        error: 'Poet with this slug already exists' 
      }, { status: 409 });
    }

    // Prepare poet data for database update
    const poetData = {
      poet_slug: body.poet_slug,
      birth_date: body.birth_date || null,
      death_date: body.death_date || null,
      birth_place: body.birth_place || null,
      death_place: body.death_place || null,
      tags: body.tags || [],
      file_url: body.file_url || null,
      is_featured: body.is_featured || false,
      is_hidden: body.is_hidden || false,
      // Sindhi fields
      sindhi_name: body.sindhi_name,
      sindhi_laqab: body.sindhi_laqab || null,
      sindhi_takhalus: body.sindhi_takhalus || null,
      sindhi_tagline: body.sindhi_tagline || null,
      sindhi_details: body.sindhi_details,
      // English fields
      english_name: body.english_name,
      english_laqab: body.english_laqab || null,
      english_takhalus: body.english_takhalus || null,
      english_tagline: body.english_tagline || null,
      english_details: body.english_details,
      updated_at: new Date().toISOString(),
    };

    // Update the poet
    const { data: updatedPoet, error: updateError } = await admin
      .from('poets')
      .update(poetData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating poet:', updateError);
      return NextResponse.json({ error: 'Failed to update poet' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Poet updated successfully', 
      poet: updatedPoet 
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminClient();
    
    // Delete the poet
    const { error: deleteError } = await admin
      .from('poets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting poet:', deleteError);
      return NextResponse.json({ error: 'Failed to delete poet' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Poet deleted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
