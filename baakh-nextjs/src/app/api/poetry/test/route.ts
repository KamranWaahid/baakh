import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('poetry_main')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }
    
    // Test poets table
    const { data: poetsData, error: poetsError } = await supabase
      .from('poets')
      .select('id, sindhi_name, english_name')
      .limit(1);
    
    if (poetsError) {
      console.error('Poets table test failed:', poetsError);
      return NextResponse.json({
        error: 'Poets table access failed',
        details: poetsError.message,
        code: poetsError.code
      }, { status: 500 });
    }
    
    // Test categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug')
      .limit(1);
    
    if (categoriesError) {
      console.error('Categories table test failed:', categoriesError);
      return NextResponse.json({
        error: 'Categories table access failed',
        details: categoriesError.message,
        code: categoriesError.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All database connections working',
      poetry_count: testData?.length || 0,
      poets_count: poetsData?.length || 0,
      categories_count: categoriesData?.length || 0,
      poetry_sample: testData,
      poets_sample: poetsData,
      categories_sample: categoriesData
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
