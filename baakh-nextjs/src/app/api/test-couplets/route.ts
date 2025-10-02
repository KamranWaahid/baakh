export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== TEST COUPLETS API ROUTE STARTED ===');
  
  try {
    const supabase = createAdminClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        message: 'Database client could not be initialized'
      }, { status: 500 });
    }
    
    // Test 1: Simple couplets query
    console.log('Testing simple couplets query...');
    const { data: couplets, error, count } = await supabase
      .from('poetry_couplets')
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
    
    // Test 2: Active filter (using existing column)
    console.log('Testing active filter...');
    const { data: activeCouplets, error: activeError } = await supabase
      .from('poetry_couplets')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .limit(3);
    
    if (activeError) {
      console.error('Active filter error:', activeError);
      return NextResponse.json({
        success: false,
        error: 'Active filter failed',
        details: activeError.message,
        code: activeError.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Couplets API test successful',
      data: {
        totalCouplets: count || 0,
        sampleCouplets: couplets || [],
        activeCouplets: activeCouplets || [],
        activeCount: activeCouplets?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in test couplets API:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
