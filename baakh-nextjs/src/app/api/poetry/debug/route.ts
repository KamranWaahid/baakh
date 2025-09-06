import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Test 1: Basic table access
    console.log('Testing basic table access...');
    const { data: basicData, error: basicError } = await supabase
      .from('poetry_main')
      .select('*')
      .limit(1);
    
    console.log('Basic access result:', { data: basicData, error: basicError });
    
    // Test 2: Check table structure
    console.log('Testing table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('poetry_main')
      .select('id, poetry_slug, is_featured, created_at, visibility, lang')
      .limit(1);
    
    console.log('Structure check result:', { data: structureData, error: structureError });
    
    // Test 3: Check foreign key relationships
    console.log('Testing foreign key relationships...');
    const { data: fkData, error: fkError } = await supabase
      .from('poetry_main')
      .select(`
        id,
        poetry_slug,
        poet:poets!poetry_main_poet_id_fkey(
          poet_id,
          sindhi_name,
          english_name
        ),
        category:categories!poetry_main_category_id_fkey(
          id,
          slug
        )
      `)
      .limit(1);
    
    console.log('FK check result:', { data: fkData, error: fkError });
    
    // Test 4: Check if poets table exists
    console.log('Testing poets table...');
    const { data: poetsData, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, file_url')
      .limit(1);
    
    console.log('Poets check result:', { data: poetsData, error: poetsError });
    
    // Test 5: Check if categories table exists
    console.log('Testing categories table...');
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug')
      .limit(1);
    
    console.log('Categories check result:', { data: categoriesData, error: categoriesError });
    
    // Test 6: Check poetry_translations table
    console.log('Testing poetry_translations table...');
    const { data: translationsData, error: translationsError } = await supabase
      .from('poetry_translations')
      .select('poetry_id, title, info, lang')
      .limit(1);
    
    console.log('Translations check result:', { data: translationsData, error: translationsError });
    
    // Test 7: Try a simple join with correct schema
    console.log('Testing simple join with correct schema...');
    const { data: joinData, error: joinError } = await supabase
      .from('poetry_main')
      .select(`
        id,
        poetry_slug,
        poets!poetry_main_poet_id_fkey(sindhi_name, english_name)
      `)
      .limit(1);
    
    console.log('Join test result:', { data: joinData, error: joinError });
    
    // Test 8: Check if there's any data in poetry_main
    console.log('Checking poetry_main data count...');
    const { count: poetryCount, error: countError } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true });
    
    console.log('Poetry count result:', { count: poetryCount, error: countError });
    
    return NextResponse.json({
      success: true,
      tests: {
        basic_access: { success: !basicError, data: basicData, error: basicError },
        structure: { success: !structureError, data: structureData, error: structureError },
        foreign_keys: { success: !fkError, data: fkData, error: fkError },
        poets_table: { success: !poetsError, data: poetsData, error: poetsError },
        categories_table: { success: !categoriesError, data: categoriesData, error: categoriesError },
        translations_table: { success: !translationsError, data: translationsData, error: translationsError },
        join_test: { success: !joinError, data: joinData, error: joinError },
        poetry_count: { success: !countError, count: poetryCount, error: countError }
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
