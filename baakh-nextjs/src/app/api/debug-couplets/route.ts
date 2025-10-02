export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== DEBUG COUPLETS API ROUTE STARTED ===');
  
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
    
    // Test 1: Simple couplets query without joins
    console.log('Testing simple couplets query...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('couplets')
      .select('id, english_text, sindhi_text')
      .limit(1);
    
    if (simpleError) {
      console.error('Simple couplets query error:', simpleError);
      return NextResponse.json({
        success: false,
        error: 'Simple couplets query failed',
        details: simpleError.message,
        code: simpleError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    // Test 2: Couplets query with count
    console.log('Testing couplets query with count...');
    const { data: countData, error: countError, count } = await supabase
      .from('couplets')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (countError) {
      console.error('Couplets count query error:', countError);
      return NextResponse.json({
        success: false,
        error: 'Couplets count query failed',
        details: countError.message,
        code: countError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    // Test 3: Couplets query with poets join
    console.log('Testing couplets query with poets join...');
    const { data: joinData, error: joinError } = await supabase
      .from('couplets')
      .select(`
        id,
        english_text,
        sindhi_text,
        poets (
          id,
          english_name,
          sindhi_name
        )
      `)
      .limit(3);
    
    if (joinError) {
      console.error('Couplets join query error:', joinError);
      return NextResponse.json({
        success: false,
        error: 'Couplets join query failed',
        details: joinError.message,
        code: joinError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    // Test 4: Standalone filter
    console.log('Testing standalone filter...');
    const { data: standaloneData, error: standaloneError } = await supabase
      .from('couplets')
      .select('id, is_standalone')
      .eq('is_standalone', true)
      .limit(3);
    
    if (standaloneError) {
      console.error('Standalone filter error:', standaloneError);
      return NextResponse.json({
        success: false,
        error: 'Standalone filter failed',
        details: standaloneError.message,
        code: standaloneError.code,
        environment: envCheck
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All couplets tests passed',
      data: {
        simpleQuery: simpleData,
        countQuery: countData,
        count: count,
        joinQuery: joinData,
        standaloneQuery: standaloneData
      },
      environment: envCheck
    });
    
  } catch (error) {
    console.error('Unexpected error in debug couplets API:', error);
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
