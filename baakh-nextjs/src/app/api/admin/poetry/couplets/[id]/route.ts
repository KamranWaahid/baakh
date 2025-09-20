import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('poetry_couplets')
      .select(`
        *,
        poets!inner(
          poet_id,
          poet_slug,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        ),
        poetry_main!inner(
          id,
          poetry_slug,
          poetry_tags,
          visibility,
          is_featured,
          category_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching couplet:', error);
      return NextResponse.json({ error: 'Couplet not found' }, { status: 404 });
    }

    // Fetch category separately since there's no direct relationship
    let categoryData = null;
    if (data.poetry_main?.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('id', data.poetry_main.category_id)
        .single();
      categoryData = category;
    }

    // Fetch English couplet if it exists for the same poetry work
    let englishCouplet = null;
    if (data.poetry_main?.id) {
      const { data: englishData } = await supabase
        .from('poetry_couplets')
        .select(`
          id,
          couplet_text,
          couplet_slug,
          couplet_tags,
          lang,
          created_at,
          updated_at
        `)
        .eq('poetry_id', data.poetry_main.id)
        .eq('lang', 'en')
        .single();
      
      englishCouplet = englishData;
    }

    // Add category data and English couplet to the response
    const responseData = {
      ...data,
      categories: categoryData,
      english_couplet: englishCouplet
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in couplet GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('poetry_couplets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating couplet:', error);
      return NextResponse.json({ error: 'Failed to update couplet' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in couplet PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from('poetry_couplets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting couplet:', error);
      return NextResponse.json({ error: 'Failed to delete couplet' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Couplet deleted successfully' });
  } catch (error: any) {
    console.error('Error in couplet DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

