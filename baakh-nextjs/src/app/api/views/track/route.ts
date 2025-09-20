import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { contentId, contentType, sessionId } = await request.json();
    
    // Validate input
    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'contentId and contentType are required' }, { status: 400 });
    }
    
    if (!['couplet', 'poetry', 'poet'].includes(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType. Must be one of: couplet, poetry, poet' }, { status: 400 });
    }
    
    const supabase = createAdminClient();
    
    // Get client IP and user agent
    const userIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Attempt to use cookie-stored viewer_session_id if body sessionId missing
    let effectiveSessionId = sessionId;
    try {
      if (!effectiveSessionId) {
        const cookieHeader = request.headers.get('cookie') || '';
        const match = cookieHeader.match(/(?:^|;\s*)viewer_session_id=([^;]+)/);
        if (match && match[1]) {
          effectiveSessionId = decodeURIComponent(match[1]);
        }
      }
    } catch {}

    // Track the view using the database function
    const { data, error } = await supabase.rpc('track_content_view', {
      p_content_id: parseInt(contentId),
      p_content_type: contentType,
      p_session_id: effectiveSessionId || null,
      p_user_ip: userIP,
      p_user_agent: userAgent
    });
    
    if (error) {
      console.error('Error tracking view:', error);
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, tracked: data });
    
  } catch (error) {
    console.error('Error in track view API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    
    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'contentId and contentType are required' }, { status: 400 });
    }
    
    const supabase = createAdminClient();
    
    // Get view count for the content
    const { data, error } = await supabase
      .from('content_view_counts')
      .select('*')
      .eq('content_id', parseInt(contentId))
      .eq('content_type', contentType)
      .single();
    
    if (error) {
      console.error('Error fetching view count:', error);
      return NextResponse.json({ viewCount: 0 });
    }
    
    return NextResponse.json({ 
      viewCount: data?.view_count || 0,
      uniqueViews: data?.unique_session_views || 0,
      lastViewed: data?.last_viewed_at || null
    });
    
  } catch (error) {
    console.error('Error in get view count API:', error);
    return NextResponse.json({ viewCount: 0 });
  }
}
