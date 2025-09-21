import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Use service role key for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the timeline period by slug
    const { data: period, error: periodError } = await supabase
      .from('timeline_periods')
      .select('*')
      .eq('period_slug', slug)
      .is('deleted_at', null)
      .single();

    if (periodError) {
      console.error('Error fetching timeline period:', periodError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Timeline period not found',
          details: periodError.message
        },
        { status: 404 }
      );
    }

    if (!period) {
      return NextResponse.json(
        { success: false, error: 'Timeline period not found' },
        { status: 404 }
      );
    }

    // Transform period data
    const isSindhi = lang === 'sd';
    const transformedPeriod = {
      id: period.id,
      period_slug: period.period_slug,
      start_year: period.start_year,
      end_year: period.end_year,
      is_ongoing: period.is_ongoing,
      name: isSindhi ? period.sindhi_name : period.english_name,
      description: isSindhi ? period.sindhi_description : period.english_description,
      characteristics: (isSindhi ? (period.sindhi_characteristics || []) : (period.english_characteristics || [])).filter((char: any) => char && char.trim() !== ''),
      color_code: period.color_code,
      icon_name: period.icon_name,
      is_featured: period.is_featured,
      sort_order: period.sort_order,
      created_at: period.created_at,
      updated_at: period.updated_at
    };

    // Get events for this period
    const { data: events, error: eventsError } = await supabase
      .from('timeline_events')
      .select(`
        *,
        timeline_periods!left(
          id,
          period_slug,
          sindhi_name,
          english_name,
          color_code
        ),
        poets!left(
          id,
          poet_slug,
          sindhi_name,
          english_name,
          file_url
        )
      `)
      .eq('period_id', period.id)
      .is('deleted_at', null)
      .order('event_year', { ascending: true });

    if (eventsError) {
      console.error('Error fetching timeline events:', eventsError);
      // Don't fail the request if events can't be fetched
    }

    // Transform events data
    const transformedEvents = (events || []).map(event => ({
      id: event.id,
      event_slug: event.event_slug,
      event_date: event.event_date,
      event_year: event.event_year,
      is_approximate: event.is_approximate,
      title: isSindhi ? event.sindhi_title : event.english_title,
      description: isSindhi ? event.sindhi_description : event.english_description,
      location: isSindhi ? event.sindhi_location : event.english_location,
      event_type: event.event_type,
      importance_level: event.importance_level,
      tags: event.tags || [],
      color_code: event.color_code,
      icon_name: event.icon_name,
      is_featured: event.is_featured,
      period: event.timeline_periods ? {
        id: event.timeline_periods.id,
        slug: event.timeline_periods.period_slug,
        name: isSindhi ? event.timeline_periods.sindhi_name : event.timeline_periods.english_name,
        color_code: event.timeline_periods.color_code
      } : null,
      poet: event.poets ? {
        id: event.poets.id,
        slug: event.poets.poet_slug,
        name: isSindhi ? event.poets.sindhi_name : event.poets.english_name,
        file_url: event.poets.file_url
      } : null
    }));

    return NextResponse.json({
      success: true,
      period: transformedPeriod,
      events: transformedEvents
    });

  } catch (error) {
    console.error('Error in timeline period API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
