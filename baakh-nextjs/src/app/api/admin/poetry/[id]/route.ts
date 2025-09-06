import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    // First get the main poetry data
    const { data: poetryData, error: poetryError } = await supabase
      .from('poetry_main')
      .select('*')
      .eq('id', id)
      .single();

    if (poetryError) {
      console.error('Error fetching poetry:', poetryError);
      return NextResponse.json({ error: 'Poetry not found' }, { status: 404 });
    }

    // Get poet data
    const { data: poetData } = await supabase
      .from('poets')
      .select('poet_id, poet_slug, sindhi_name, english_name')
      .eq('poet_id', poetryData.poet_id)
      .single();

    // Get category data
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('id', poetryData.category_id)
      .single();

    // Get translations
    const { data: translationsData } = await supabase
      .from('poetry_translations')
      .select('id, title, lang, info, source')
      .eq('poetry_id', id);

    // Get couplets
    const { data: coupletsData } = await supabase
      .from('poetry_couplets')
      .select('id, couplet_text, couplet_slug, couplet_tags, lang')
      .eq('poetry_id', id);

    // Combine all data
    const data = {
      ...poetryData,
      poets: poetData,
      categories: categoryData,
      poetry_translations: translationsData || [],
      poetry_couplets: coupletsData || []
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in poetry GET API:', error);
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
      .from('poetry_main')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating poetry:', error);
      return NextResponse.json({ error: 'Failed to update poetry' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in poetry PUT API:', error);
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
      .from('poetry_main')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting poetry:', error);
      return NextResponse.json({ error: 'Failed to delete poetry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Poetry deleted successfully' });
  } catch (error: any) {
    console.error('Error in poetry DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
