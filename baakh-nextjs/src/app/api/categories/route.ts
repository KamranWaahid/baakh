import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const getAll = searchParams.get('all') === 'true';
    const limit = getAll ? 1000 : Math.max(1, Math.min(48, Number(searchParams.get('limit') || 12)));
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const lang = searchParams.get('lang') || 'en';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    const to = offset + limit - 1;

    console.log('Categories API - Starting query with', `page: ${page}, limit: ${limit}, offset: ${offset}`, 'lang:', lang);
    
    // Get total count first for accurate pagination
    const { count: totalCount } = await supabase
      .from('categories')
      .select('*', { head: true, count: 'exact' })
      .is('deleted_at', null);
    
    console.log('Categories API - Total count in database:', totalCount);
    
    let query = supabase
      .from('categories')
      .select(`
        id, 
        slug, 
        content_style, 
        deleted_at, 
        category_details:category_details(cat_name, cat_name_plural, cat_detail, lang)
      `)
      .is('deleted_at', null);

    // Apply search filter if provided
    if (search) {
      query = query.or(`category_details.cat_name.ilike.%${search}%,category_details.cat_detail.ilike.%${search}%`);
    }

    // Apply sorting
    if (sortBy === 'name') {
      // For name sorting, we'll sort by ID for now since nested sorting is complex
      query = query.order('id', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'count') {
      // For count sorting, we'll need to join with poetry_main to get actual counts
      // For now, just sort by ID
      query = query.order('id', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('id', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, to);

    const { data, error } = await query;
      
    console.log('Categories API - Query result:', { data: data?.length, error });
    
    if (error) {
      console.error('Categories API - Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Check if we have any data
    if (!data || data.length === 0) {
      console.log('Categories API - No categories found in database');
      return NextResponse.json({ 
        items: [], 
        total: totalCount || 0,
        page: page,
        limit: limit,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasNext: page * limit < (totalCount || 0),
          hasPrev: page > 1
        }
      }, { status: 200 });
    }
    
    console.log('Categories API - Processing data, count:', data?.length);
    
    // Get poetry counts for each category
    const categoryIds = data?.map((c: any) => c.id) || [];
    let poetryCounts: { [key: number]: number } = {};
    
    if (categoryIds.length > 0) {
      const { data: countData, error: countError } = await supabase
        .from('poetry_main')
        .select('category_id')
        .in('category_id', categoryIds)
        .eq('visibility', true)
        .is('deleted_at', null);
      
      if (countError) {
        console.error('Categories API - Error fetching poetry counts:', countError);
      } else {
        // Count poetry entries per category
        countData?.forEach((poem: any) => {
          const categoryId = poem.category_id;
          poetryCounts[categoryId] = (poetryCounts[categoryId] || 0) + 1;
        });
      }
    }
    
    let items = (data || []).map((c: any) => {
      console.log('Categories API - Processing category:', c);
      
      const details = Array.isArray(c.category_details) ? c.category_details : [];
      const en = details.find((d: any) => d.lang === 'en');
      const sd = details.find((d: any) => d.lang === 'sd');
      
      const englishName = en?.cat_name || '';
      const sindhiName = sd?.cat_name || '';
      const englishPlural = (en as any)?.cat_name_plural || '';
      const sindhiPlural = (sd as any)?.cat_name_plural || '';
      const englishDetails = en?.cat_detail || '';
      const sindhiDetails = sd?.cat_detail || '';
      
      // Only include languages that have content
      const languages = [];
      if (sindhiName || sindhiDetails) languages.push('Sindhi');
      if (englishName || englishDetails) languages.push('English');
      
      // Create a more focused summary based on the requested language
      const primaryName = lang === 'sd' ? sindhiName : englishName;
      const primaryDetails = lang === 'sd' ? sindhiDetails : englishDetails;
      
      // For Sindhi locale, prioritize Sindhi content even if English is available
      const summary = lang === 'sd' 
        ? (sindhiDetails || `${sindhiName} brings together notable works and references in this form. Explore key themes, stylistic patterns, and historical usage curated by our editors.`)
        : (primaryDetails || `${primaryName} brings together notable works and references in this form. Explore key themes, stylistic patterns, and historical usage curated by our editors.`);
      
      const processed = {
        id: String(c.id),
        slug: c.slug as string,
        contentStyle: c.content_style as string,
        englishName,
        sindhiName,
        englishPlural,
        sindhiPlural,
        englishDetails,
        sindhiDetails,
        languages,
        summary,
        count: poetryCounts[c.id] || 0,
      };
      
      console.log('Categories API - Processed category:', processed);
      return processed;
    });
    
    // Filter out categories that don't have content in the requested language
    if (lang === 'sd') {
      console.log('Categories API - Filtering for Sindhi locale, total items before filter:', items.length);
      items = items.filter(item => item.sindhiName || item.sindhiDetails);
      console.log('Categories API - Items after Sindhi filter:', items.length);
      
      // For Sindhi locale, ensure we prioritize categories with Sindhi content
      items.sort((a, b) => {
        const aHasSindhi = a.sindhiName && a.sindhiDetails;
        const bHasSindhi = b.sindhiName && b.sindhiDetails;
        if (aHasSindhi && !bHasSindhi) return -1;
        if (!aHasSindhi && bHasSindhi) return 1;
        return 0;
      });
      
      // Log the first few items to verify Sindhi content
      console.log('Categories API - First 3 items for Sindhi locale:');
      items.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.slug}: "${item.sindhiName}" (${item.sindhiPlural})`);
      });
    } else if (lang === 'en') {
      items = items.filter(item => item.englishName || item.englishDetails);
    }
    
    // Calculate pagination info
    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);
    
    const response = { 
      items, 
      total,
      page,
      limit,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    
    console.log('Categories API - Final response:', response);
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error('Categories API - Error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


