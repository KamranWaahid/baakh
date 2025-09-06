import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('poetry_couplets')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection test failed:', error);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      count: data || 0
    });
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    
    console.log('Test POST - Received body:', body);
    
    // Test with sample data
    const testCouplet = {
      poetry_id: 0, // 0 for system poetry record (standalone couplets)
      poet_id: 1,
      couplet_slug: 'test-slug',
      couplet_text: 'Test couplet text',
      couplet_tags: 'test',
      lang: 'sd'
    };
    
    console.log('Test POST - Test data:', testCouplet);
    
    // Try to insert test data
    const { data, error } = await supabase
      .from('poetry_couplets')
      .insert([testCouplet])
      .select();
    
    if (error) {
      console.error('Test insert failed:', error);
      return NextResponse.json({ 
        error: 'Test insert failed', 
        details: error.message 
      }, { status: 500 });
    }
    
    // Clean up test data
    if (data && data.length > 0) {
      await supabase
        .from('poetry_couplets')
        .delete()
        .eq('couplet_slug', 'test-slug');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test insert successful',
      data: data
    });
    
  } catch (error: any) {
    console.error('Test POST error:', error);
    return NextResponse.json({ 
      error: 'Test POST failed', 
      details: error.message 
    }, { status: 500 });
  }
}
