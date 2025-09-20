import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Period ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('timeline_periods')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timeline period:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete timeline period' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Timeline period deleted successfully'
    });

  } catch (error) {
    console.error('Error in timeline period DELETE API:', error);
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
        { success: false, error: 'Period ID is required' },
        { status: 400 }
      );
    }

    const { data: period, error } = await supabase
      .from('timeline_periods')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline period:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update timeline period' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      period
    });

  } catch (error) {
    console.error('Error in timeline period PATCH API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
