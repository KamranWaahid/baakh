export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Lightweight non-cryptographic hash for stable fingerprints on Edge
function djb2Hex(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  // Convert to unsigned and hex
  const unsigned = hash >>> 0;
  return unsigned.toString(16).padStart(8, '0');
}

// Create a device fingerprint based on multiple factors
function createDeviceFingerprint(data: {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
}): string {
  // Combine all factors to create a unique fingerprint
  const fingerprintData = [
    data.ip,
    data.userAgent,
    data.acceptLanguage,
    data.acceptEncoding
  ].join('|');
  
  // Create a stable hash of the combined data (Edge-safe)
  const hash = djb2Hex(fingerprintData);
  
  // Return a shorter, more manageable fingerprint
  return `fp_${hash.substring(0, 16)}`;
}

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
    
    // Get client information for fingerprinting
    const userIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'unknown';
    const acceptEncoding = request.headers.get('accept-encoding') || 'unknown';
    
    // Create a persistent fingerprint based on device + IP + browser + location
    // This ensures one view per unique combination of these factors
    const fingerprint = createDeviceFingerprint({
      ip: userIP,
      userAgent,
      acceptLanguage,
      acceptEncoding
    });

    // Track the view using the database function
    // Use fingerprint as session_id to ensure one view per unique device+IP+browser+location
    const { data, error } = await supabase.rpc('track_content_view', {
      p_content_id: parseInt(contentId),
      p_content_type: contentType,
      p_session_id: fingerprint,
      p_user_ip: userIP,
      p_user_agent: userAgent
    });
    
    if (error) {
      console.error('Error tracking view:', error);
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }
    
    // Parse the JSON response from the database function
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    
    return NextResponse.json({ 
      success: result.success, 
      newView: result.new_view,
      message: result.message 
    });
    
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
