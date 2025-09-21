import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timeline event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete timeline event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Timeline event deleted successfully'
    });

  } catch (error) {
    console.error('Error in timeline event DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { data: event, error } = await supabase
      .from('timeline_events')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        period:timeline_periods(id, slug, name, color_code),
        poet:poets(id, slug, name, photo)
      `)
      .single();

    if (error) {
      console.error('Error updating timeline event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update timeline event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Error in timeline event PATCH API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
