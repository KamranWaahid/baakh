import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'crypto';

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
  
  // Create a hash of the combined data
  const hash = createHash('sha256').update(fingerprintData).digest('hex');
  
  // Return a shorter, more manageable fingerprint
  return `fp_${hash.substring(0, 16)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poetId } = await params;
    const supabase = createAdminClient();
    
    // Get the poet's integer ID from the poets table
    const { data: poetData, error: poetError } = await supabase
      .from('poets')
      .select('poet_id')
      .eq('id', poetId)
      .single();

    if (poetError || !poetData) {
      console.error(`Poet not found for ID ${poetId}:`, poetError);
      return NextResponse.json({ error: 'Poet not found' }, { status: 404 });
    }

    const integerPoetId = poetData.poet_id;

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

    // Check if view already exists for this fingerprint
    const { data: existingView, error: checkError } = await supabase
      .from('content_views')
      .select('id')
      .eq('content_id', integerPoetId)
      .eq('content_type', 'poet')
      .eq('session_id', fingerprint)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing view:', checkError);
      return NextResponse.json({ error: 'Failed to check existing view' }, { status: 500 });
    }

    // If view already exists, return without tracking
    if (existingView) {
      console.log(`View already exists for poet ${poetId} (${integerPoetId}) with fingerprint ${fingerprint}`);
      return NextResponse.json({ 
        success: true, 
        newView: false,
        message: 'View already exists for this device+IP+browser+location combination'
      });
    }

    // Track the view using the database function
    const { data, error } = await supabase.rpc('track_content_view', {
      p_content_id: integerPoetId,
      p_content_type: 'poet',
      p_session_id: fingerprint,
      p_user_ip: userIP,
      p_user_agent: userAgent
    });
    
    if (error) {
      console.error('Error tracking poet view:', error);
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }
    
    console.log(`New view tracked for poet ${poetId} (${integerPoetId}) with fingerprint ${fingerprint}`);
    
    return NextResponse.json({ 
      success: true, 
      newView: true,
      message: 'New view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking poet view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
