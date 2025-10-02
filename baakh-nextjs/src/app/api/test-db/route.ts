export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: 'Missing Supabase environment variables'
      });
    }

    console.log('Testing database connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('poets')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
    }
    
    // Get a few poets to see what's in the database
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, poet_slug, sindhi_name, english_name')
      .limit(5);
    
    if (poetsError) {
      console.error('Error fetching poets:', poetsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch poets',
        details: poetsError.message
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      poetsCount: poets?.length || 0,
      poets: poets || [],
      samplePoetSlugs: poets?.map(p => p.poet_slug) || []
    });
    
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}