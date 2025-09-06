import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Test database connection
    const { data: poetsTest, error: poetsError } = await supabase
      .from('poets')
      .select('poet_slug, sindhi_name, english_name')
      .limit(5);

    if (poetsError) {
      return NextResponse.json({ error: 'Poets table error', details: poetsError.message }, { status: 500 });
    }

    // Test categories
    const { data: categoriesTest, error: categoriesError } = await supabase
      .from('categories')
      .select('slug')
      .limit(5);

    if (categoriesError) {
      return NextResponse.json({ error: 'Categories table error', details: categoriesError.message }, { status: 500 });
    }

    // Test poetry
    const { data: poetryTest, error: poetryError } = await supabase
      .from('poetry_main')
      .select('poetry_slug, poet_id, category_id, visibility')
      .limit(5);

    if (poetryError) {
      return NextResponse.json({ error: 'Poetry table error', details: poetryError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database connection test successful',
      poets: poetsTest,
      categories: categoriesTest,
      poetry: poetryTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
