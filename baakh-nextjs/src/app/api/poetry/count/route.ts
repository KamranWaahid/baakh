import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get counts for all categories
    const [poetryResult, poetsResult, categoriesResult, topicsResult] = await Promise.all([
      supabase
        .from('poetry_main')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', true),
      supabase
        .from('poets')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', true),
      supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', true),
      supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', true)
    ]);

    return NextResponse.json({
      totalPoetry: poetryResult.count || 0,
      totalPoets: poetsResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalTopics: topicsResult.count || 0
    });
  } catch (error) {
    console.error('Poetry count API error:', error);
    return NextResponse.json({
      totalPoetry: 0,
      totalPoets: 0,
      totalCategories: 0,
      totalTopics: 0
    });
  }
}
