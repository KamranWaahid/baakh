export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== TEST COUPLETS SIMPLE API ROUTE STARTED ===');
  
  try {
    const supabase = createAdminClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        message: 'Database client could not be initialized'
      }, { status: 500 });
    }
    
    // Test 1: Simple couplets query without any filters
    console.log('Testing simple couplets query...');
    const { data: couplets, error, count } = await supabase
      .from('couplets')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('Couplets query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    // Test 2: Check if is_standalone column exists
    console.log('Testing is_standalone column...');
    const { data: columnTest, error: columnError } = await supabase
      .from('couplets')
      .select('is_standalone')
      .limit(1);
    
    if (columnError) {
      console.warn('is_standalone column test failed:', columnError.message);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Couplets API test successful',
      data: {
        totalCouplets: count || 0,
        sampleCouplets: couplets || [],
        hasStandaloneColumn: !columnError,
        columnError: columnError?.message || null
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in test couplets simple API:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
