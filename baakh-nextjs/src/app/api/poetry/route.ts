import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const lang = searchParams.get('lang') || 'en';

    // Helper: build enhanced mock response (used when DB/env not available)
    const buildMockResponse = () => {
      // Enhanced mock data with more realistic content
      const mockPoetry = [
        {
          id: '1',
          poetry_slug: 'shah-latif-ghazal-1',
          title: lang === 'sd' ? 'شاه لطيف جي غزل' : 'Shah Latif\'s Ghazal',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت', 'روحاني'] : ['Sufi', 'Love', 'Devotion', 'Spiritual'],
          poet_name: lang === 'sd' ? 'شاه عبداللطيف' : 'Shah Abdul Latif',
          poet_slug: 'shah-abdul-latif',
          poet_laqab: lang === 'sd' ? 'شاه لطيف' : 'Shah Latif',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي عظيم صوفي شاعر' : 'Great Sufi Poet of Sindh',
          category: lang === 'sd' ? 'غزل' : 'Ghazal',
          category_slug: 'ghazal',
          is_featured: true,
          views: 1250,
          likes: 89,
          bookmarks: 23,
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          poetry_slug: 'sachal-nazm-1',
          title: lang === 'sd' ? 'سچل سرمست جي نظم' : 'Sachal Sarmast\'s Nazm',
          tags: lang === 'sd' ? ['روحاني', 'دانش', 'فلسفي'] : ['Spiritual', 'Wisdom', 'Philosophical'],
          poet_name: lang === 'sd' ? 'سچل سرمست' : 'Sachal Sarmast',
          poet_slug: 'sachal-sarmast',
          poet_laqab: lang === 'sd' ? 'سچل' : 'Sachal',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي عظيم شاعر' : 'Great Poet of Sindh',
          category: lang === 'sd' ? 'نظم' : 'Nazm',
          category_slug: 'nazm',
          is_featured: false,
          views: 890,
          likes: 45,
          bookmarks: 12,
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          id: '3',
          poetry_slug: 'shah-inaat-rubai-1',
          title: lang === 'sd' ? 'شاه عنايت جي رباعي' : 'Shah Inayat\'s Rubai',
          tags: lang === 'sd' ? ['فلسفي', 'حكمت', 'دانش'] : ['Philosophical', 'Wisdom', 'Knowledge'],
          poet_name: lang === 'sd' ? 'شاه عنايت' : 'Shah Inayat',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي فلسفي شاعر' : 'Philosophical Poet of Sindh',
          category: lang === 'sd' ? 'رباعي' : 'Rubai',
          is_featured: true,
          views: 567,
          likes: 34,
          bookmarks: 8,
          created_at: '2024-01-05T00:00:00Z'
        },
        {
          id: '4',
          poetry_slug: 'bulleh-shah-ghazal-1',
          title: lang === 'sd' ? 'بلھے شاہ جي غزل' : 'Bulleh Shah\'s Ghazal',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت', 'روحاني'] : ['Sufi', 'Love', 'Devotion', 'Spiritual'],
          poet_name: lang === 'sd' ? 'بلھے شاہ' : 'Bulleh Shah',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'پنجاب جي عظيم صوفي شاعر' : 'Great Sufi Poet of Punjab',
          category: lang === 'sd' ? 'غزل' : 'Ghazal',
          is_featured: true,
          views: 2100,
          likes: 156,
          bookmarks: 45,
          created_at: '2024-01-20T00:00:00Z'
        },
        {
          id: '5',
          poetry_slug: 'makhdoom-nazm-1',
          title: lang === 'sd' ? 'مخدوم جي نظم' : 'Makhdoom\'s Nazm',
          tags: lang === 'sd' ? ['قومي', 'وطن', 'آزادي'] : ['National', 'Patriotism', 'Freedom'],
          poet_name: lang === 'sd' ? 'مخدوم محمد ہاشم' : 'Makhdoom Muhammad Hashim',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي قومي شاعر' : 'National Poet of Sindh',
          category: lang === 'sd' ? 'نظم' : 'Nazm',
          is_featured: false,
          views: 756,
          likes: 67,
          bookmarks: 19,
          created_at: '2024-01-08T00:00:00Z'
        },
        {
          id: '6',
          poetry_slug: 'sami-rubai-1',
          title: lang === 'sd' ? 'سامي جي رباعي' : 'Sami\'s Rubai',
          tags: lang === 'sd' ? ['فلسفي', 'حكمت', 'دانش'] : ['Philosophical', 'Wisdom', 'Knowledge'],
          poet_name: lang === 'sd' ? 'سامي' : 'Sami',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي فلسفي شاعر' : 'Philosophical Poet of Sindh',
          category: lang === 'sd' ? 'رباعي' : 'Rubai',
          is_featured: false,
          views: 432,
          likes: 28,
          bookmarks: 6,
          created_at: '2024-01-12T00:00:00Z'
        },
        {
          id: '7',
          poetry_slug: 'shah-karim-ghazal-1',
          title: lang === 'sd' ? 'شاه ڪريم جي غزل' : 'Shah Karim\'s Ghazal',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت'] : ['Sufi', 'Love', 'Devotion'],
          poet_name: lang === 'sd' ? 'شاه ڪريم' : 'Shah Karim',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي صوفي شاعر' : 'Sufi Poet of Sindh',
          category: lang === 'sd' ? 'غزل' : 'Ghazal',
          is_featured: true,
          views: 1890,
          likes: 134,
          bookmarks: 38,
          created_at: '2024-01-18T00:00:00Z'
        },
        {
          id: '8',
          poetry_slug: 'sachal-masnavi-1',
          title: lang === 'sd' ? 'سچل جي مثنوي' : 'Sachal\'s Masnavi',
          tags: lang === 'sd' ? ['روحاني', 'دانش', 'فلسفي'] : ['Spiritual', 'Wisdom', 'Philosophical'],
          poet_name: lang === 'sd' ? 'سچل سرمست' : 'Sachal Sarmast',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي عظيم شاعر' : 'Great Poet of Sindh',
          category: lang === 'sd' ? 'مثنوي' : 'Masnavi',
          is_featured: false,
          views: 654,
          likes: 42,
          bookmarks: 11,
          created_at: '2024-01-14T00:00:00Z'
        },
        {
          id: '9',
          poetry_slug: 'shah-latif-qasida-1',
          title: lang === 'sd' ? 'شاه لطيف جي قصيدو' : 'Shah Latif\'s Qasida',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت'] : ['Sufi', 'Love', 'Devotion'],
          poet_name: lang === 'sd' ? 'شاه عبداللطيف' : 'Shah Abdul Latif',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي عظيم صوفي شاعر' : 'Great Sufi Poet of Sindh',
          category: lang === 'sd' ? 'قصيده' : 'Qasida',
          is_featured: true,
          views: 1456,
          likes: 98,
          bookmarks: 27,
          created_at: '2024-01-22T00:00:00Z'
        },
        {
          id: '10',
          poetry_slug: 'bulleh-shah-doha-1',
          title: lang === 'sd' ? 'بلھے شاہ جي دوها' : 'Bulleh Shah\'s Doha',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت'] : ['Sufi', 'Love', 'Devotion'],
          poet_name: lang === 'sd' ? 'بلھے شاہ' : 'Bulleh Shah',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'پنجاب جي عظيم صوفي شاعر' : 'Great Sufi Poet of Punjab',
          category: lang === 'sd' ? 'دوها' : 'Doha',
          is_featured: false,
          views: 789,
          likes: 56,
          bookmarks: 15,
          created_at: '2024-01-16T00:00:00Z'
        },
        {
          id: '11',
          poetry_slug: 'makhdoom-ghazal-1',
          title: lang === 'sd' ? 'مخدوم جي غزل' : 'Makhdoom\'s Ghazal',
          tags: lang === 'sd' ? ['قومي', 'وطن', 'آزادي'] : ['National', 'Patriotism', 'Freedom'],
          poet_name: lang === 'sd' ? 'مخدوم محمد ہاشم' : 'Makhdoom Muhammad Hashim',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي قومي شاعر' : 'National Poet of Sindh',
          category: lang === 'sd' ? 'غزل' : 'Ghazal',
          is_featured: false,
          views: 567,
          likes: 38,
          bookmarks: 9,
          created_at: '2024-01-11T00:00:00Z'
        },
        {
          id: '12',
          poetry_slug: 'shah-karim-rubai-1',
          title: lang === 'sd' ? 'شاه ڪريم جي رباعي' : 'Shah Karim\'s Rubai',
          tags: lang === 'sd' ? ['صوفي', 'عشق', 'محبت'] : ['Sufi', 'Love', 'Devotion'],
          poet_name: lang === 'sd' ? 'شاه ڪريم' : 'Shah Karim',
          poet_avatar: null,
          poet_tagline: lang === 'sd' ? 'سنڌ جي صوفي شاعر' : 'Sufi Poet of Sindh',
          category: lang === 'sd' ? 'رباعي' : 'Rubai',
          is_featured: false,
          views: 445,
          likes: 31,
          bookmarks: 7,
          created_at: '2024-01-09T00:00:00Z'
        }
      ];

      // Apply search/category/sort/pagination to mock data
      let filteredPoetry = mockPoetry;
      if (search) {
        filteredPoetry = mockPoetry.filter(poem => 
          poem.title.toLowerCase().includes(search.toLowerCase()) ||
          poem.poetry_slug.toLowerCase().includes(search.toLowerCase()) ||
          poem.poet_name.toLowerCase().includes(search.toLowerCase()) ||
          poem.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }
      if (category && category !== 'All Categories' && category !== 'سڀ ڪيٽيگري') {
        filteredPoetry = filteredPoetry.filter(poem => poem.category === category);
      }
      if (sortBy === 'title') {
        filteredPoetry.sort((a, b) => {
          const result = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? result : -result;
        });
      } else if (sortBy === 'is_featured') {
        filteredPoetry.sort((a, b) => {
          const result = Number(b.is_featured) - Number(a.is_featured);
          return sortOrder === 'asc' ? -result : result;
        });
      } else {
        filteredPoetry.sort((a, b) => {
          const result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          return sortOrder === 'asc' ? result : -result;
        });
      }
      const total = filteredPoetry.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedPoetry = filteredPoetry.slice(start, end);

      return NextResponse.json({
        poetry: paginatedPoetry,
        total,
        page,
        limit,
        message: 'Using enhanced mock data - database not available'
      });
    };

    // Use admin client to avoid RLS read issues on public schema
    const supabase = createAdminClient();

    // First, check if the poetry_main table exists and has data
    const { data: tableCheck, error: tableError } = await supabase
      .from('poetry_main')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Poetry table access error:', tableError);
      return buildMockResponse();
    }

    // Check if there's any data
    if (!tableCheck || tableCheck.length === 0) {
      return NextResponse.json({
        poetry: [],
        total: 0,
        page,
        limit,
        message: 'No poetry data available yet'
      });
    }

    // Base query: fetch from poetry_main without relational hints (schema cache mismatch)
    let query = supabase
      .from('poetry_main')
      .select(
        `id, poetry_slug, is_featured, created_at, visibility, lang, poet_id, category_id`
      )
      .eq('visibility', true)
      .is('deleted_at', null);

    // Apply search filter
    if (search) {
      query = query.or(`poetry_slug.ilike.%${search}%`);
    }

    // Resolve category filter to category_id
    let categoryIdFilter: number | undefined = undefined;
    if (category && category !== 'All Categories' && category !== 'سڀ ڪيٽيگري') {
      const categoryMap: { [key: string]: string } = {
        'Ghazal': 'ghazal',
        'غزل': 'ghazal',
        'Nazm': 'nazm',
        'نظم': 'nazm',
        'Rubai': 'rubai',
        'رباعي': 'rubai',
        'Masnavi': 'masnavi',
        'مثنوي': 'masnavi',
        'Qasida': 'qasida',
        'قصيده': 'qasida',
        'Doha': 'doha',
        'دوها': 'doha'
      };
      const categorySlug = categoryMap[category];
      if (categorySlug) {
        const { data: catRow } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', categorySlug)
          .maybeSingle();
        if (catRow?.id) {
          categoryIdFilter = catRow.id as number;
          query = query.eq('category_id', categoryIdFilter);
        }
      }
    }

    // Apply sorting
    let orderColumn = sortBy;
    if (sortBy === 'is_featured') {
      orderColumn = 'is_featured';
    } else if (sortBy === 'title') {
      orderColumn = 'poetry_slug';
    } else {
      orderColumn = 'created_at';
    }

    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

    // Get total count for pagination
    const countQuery = supabase
      .from('poetry_main')
      .select('id', { count: 'exact', head: true })
      .eq('visibility', true)
      .is('deleted_at', null);

    if (search) {
      countQuery.or(`poetry_slug.ilike.%${search}%`);
    }
    if (categoryIdFilter) {
      countQuery.eq('category_id', categoryIdFilter);
    }

    const { count } = await countQuery;

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: poetryRows, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return buildMockResponse();
    }

    // If no rows, return early
    if (!poetryRows || poetryRows.length === 0) {
      return NextResponse.json({ poetry: [], total: count || 0, page, limit });
    }

    // Collect foreign keys
    const poetIds = Array.from(new Set(poetryRows.map((r: any) => r.poet_id).filter(Boolean)));
    const categoryIds = Array.from(new Set(poetryRows.map((r: any) => r.category_id).filter(Boolean)));
    const poetryIds = Array.from(new Set(poetryRows.map((r: any) => r.id)));

    // Fetch related data in parallel
    const [poetsRes, categoriesRes, translationsRes] = await Promise.all([
      poetIds.length > 0
        ? supabase.from('poets').select('poet_id, poet_slug, sindhi_name, english_name, sindhi_laqab, english_laqab, file_url, sindhi_tagline, english_tagline').in('poet_id', poetIds)
        : Promise.resolve({ data: [], error: null } as any),
      categoryIds.length > 0
        ? supabase.from('categories').select('id, slug').in('id', categoryIds)
        : Promise.resolve({ data: [], error: null } as any),
      poetryIds.length > 0
        ? supabase.from('poetry_translations').select('poetry_id, title, lang').in('poetry_id', poetryIds)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    if (poetsRes.error || categoriesRes.error || translationsRes.error) {
      console.error('Related fetch error:', { poetsError: poetsRes.error, categoriesError: categoriesRes.error, translationsError: translationsRes.error });
    }

    const poetById: Map<number, any> = new Map((poetsRes.data || []).map((p: any) => [p.poet_id, p]));
    const categoryById: Map<number, any> = new Map((categoriesRes.data || []).map((c: any) => [c.id, c]));
    const translationsByPoetryId: Map<number, any[]> = new Map();
    (translationsRes.data || []).forEach((t: any) => {
      const arr = translationsByPoetryId.get(t.poetry_id) || [];
      arr.push(t);
      translationsByPoetryId.set(t.poetry_id, arr);
    });

    // Transform
    const transformedPoetry = poetryRows.map((poem: any) => {
      const poet = (poem.poet_id ? poetById.get(poem.poet_id) : null) as any;
      const category = (poem.category_id ? categoryById.get(poem.category_id) : null) as any;

      const poetName = lang === 'sd' ? poet?.sindhi_name : poet?.english_name;
      const poetLaqab = lang === 'sd' ? poet?.sindhi_laqab : poet?.english_laqab;
      const poetTagline = lang === 'sd' ? poet?.sindhi_tagline : poet?.english_tagline;
      const poetSlug = poet?.poet_slug || 'unknown';

      let categoryName = category?.slug || 'Unknown';
      let categorySlug = category?.slug || 'unknown';
      if (lang === 'sd') {
        const categoryTranslations: { [key: string]: string } = {
          'ghazal': 'غزل',
          'nazm': 'نظم',
          'rubai': 'رباعي',
          'masnavi': 'مثنوي',
          'qasida': 'قصيده',
          'doha': 'دوها'
        };
        categoryName = categoryTranslations[category?.slug] || category?.slug || 'Unknown';
      }

      let title = poem.poetry_slug;
      const translations = translationsByPoetryId.get(poem.id) || [];
      const tForLang = translations.find((t: any) => t.lang === lang);
      if (tForLang?.title) title = tForLang.title;

      return {
        id: poem.id,
        poetry_slug: poem.poetry_slug,
        title,
        tags: [],
        poet_name: poetName || 'Unknown Poet',
        poet_slug: poetSlug,
        poet_laqab: poetLaqab || null,
        poet_avatar: poet?.file_url || null,
        poet_tagline: poetTagline || null,
        category: categoryName,
        category_slug: categorySlug,
        is_featured: !!poem.is_featured,
        views: 0,
        likes: 0,
        bookmarks: 0,
        created_at: poem.created_at,
      };
    });

    return NextResponse.json({
      poetry: transformedPoetry,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Poetry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
