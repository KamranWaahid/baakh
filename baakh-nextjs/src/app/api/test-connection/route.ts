import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== CONNECTION TEST API ROUTE STARTED ===');
  
  try {
    const supabase = createAdminClient();
    
    // Test basic connection by querying a simple table
    const { data, error, count } = await supabase
      .from('poets')
      .select('id, english_name, sindhi_name', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }
    
    console.log('Supabase connection test successful:', {
      poetsCount: data?.length || 0,
      totalCount: count || 0
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        samplePoets: data || [],
        totalPoets: count || 0,
        connectionStatus: 'Connected'
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in connection test:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
