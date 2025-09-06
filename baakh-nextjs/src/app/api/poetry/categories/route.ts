import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const supabase = createAdminClient();

    // Get categories with their translations
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        slug,
        category_details (
          cat_name,
          lang
        )
      `)
      .is('deleted_at', null)
      .order('id', { ascending: true });

    if (error) {
      console.error('Categories fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Transform the data to get category names in the requested language
    const transformedCategories = categories?.map(category => {
      const details = Array.isArray(category.category_details) ? category.category_details : [];
      const translation = details.find(d => d.lang === lang);
      const name = translation?.cat_name || category.slug;
      
      return {
        id: category.id,
        slug: category.slug,
        name: name
      };
    }) || [];

    // Add "All Categories" option at the beginning
    const allCategoriesOption = {
      id: 0,
      slug: 'all',
      name: lang === 'sd' ? 'سموريون صنفون' : 'All Categories'
    };

    return NextResponse.json({
      categories: [allCategoriesOption, ...transformedCategories]
    });

  } catch (error) {
    console.error('Poetry categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
