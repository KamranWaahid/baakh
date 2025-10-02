export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== DEBUG POETS API ROUTE STARTED ===');
  
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('Environment check:', envCheck);
    
    const supabase = createAdminClient();
    
    // Check if client is properly configured
    const isConfigured = supabase && typeof supabase.from === 'function';
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not properly configured',
        environment: envCheck,
        clientType: typeof supabase
      }, { status: 500 });
    }
    
    // Try a simple query first
    console.log('Testing simple query...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('poets')
      .select('id, english_name')
      .limit(1);
    
    if (simpleError) {
      console.error('Simple query error:', simpleError);
      return NextResponse.json({
        success: false,
        error: 'Simple query failed',
        details: simpleError.message,
        code: simpleError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    // Try the full query with count
    console.log('Testing full query with count...');
    const { data: fullData, error: fullError, count } = await supabase
      .from('poets')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (fullError) {
      console.error('Full query error:', fullError);
      return NextResponse.json({
        success: false,
        error: 'Full query failed',
        details: fullError.message,
        code: fullError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      data: {
        simpleQuery: simpleData,
        fullQuery: fullData,
        count: count
      },
      environment: envCheck
    });
    
  } catch (error) {
    console.error('Unexpected error in debug API:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
