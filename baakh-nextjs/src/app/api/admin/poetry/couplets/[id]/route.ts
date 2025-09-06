import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

