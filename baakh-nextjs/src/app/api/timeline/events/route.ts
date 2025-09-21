import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    const supabase = await supabaseServer();
    let query = supabase
      .from('timeline_events')
      .select(`
        *,
        period:timeline_periods(id, slug, name, color_code),
        poet:poets(id, slug, name, photo)
      `, { count: 'exact' })
      .order('event_year', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline events:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch timeline events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      total: count || 0
    });

  } catch (error) {
    console.error('Error in timeline events API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      event_slug,
      event_date,
      event_year,
      is_approximate,
      period_id,
      poet_id,
      poetry_id,
      sindhi_title,
      sindhi_description,
      sindhi_location,
      english_title,
      english_description,
      english_location,
      event_type,
      importance_level,
      tags,
      color_code,
      icon_name,
      is_featured,
      sort_order
    } = body;

    // Validate required fields
    if (!event_slug || !event_year || !english_title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { data: event, error } = await supabase
      .from('timeline_events')
      .insert({
        event_slug,
        event_date,
        event_year,
        is_approximate: is_approximate || false,
        period_id,
        poet_id,
        poetry_id,
        sindhi_title,
        sindhi_description,
        sindhi_location,
        english_title,
        english_description,
        english_location,
        event_type: event_type || 'historical',
        importance_level: importance_level || 1,
        tags: tags || [],
        color_code,
        icon_name,
        is_featured: is_featured || false,
        sort_order: sort_order || 0
      })
      .select(`
        *,
        period:timeline_periods(id, slug, name, color_code),
        poet:poets(id, slug, name, photo)
      `)
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create timeline event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Error in timeline events POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
