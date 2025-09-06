import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key for now to bypass permission issues
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  console.log('=== POETS API ROUTE STARTED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key exists:', !!supabaseServiceKey);
    
    // Simple test query to check connection
    try {
      const testResult = await supabase.from('poets').select('count').limit(1);
      console.log('Supabase connection test result:', testResult);
      
      if (testResult.error) {
        console.error('Supabase connection test failed:', testResult.error);
        return NextResponse.json({ 
          error: 'Database connection failed', 
          details: testResult.error.message 
        }, { status: 500 });
      }
    } catch (connectionError) {
      console.error('Supabase connection test exception:', connectionError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const period = searchParams.get('period') || '';
    const sortBy = searchParams.get('sortBy') || 'english_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const lang = searchParams.get('lang') || 'en';
    const isSindhi = lang === 'sd';

    console.log('=== POETS API - PARSED PARAMS ===');
    console.log('Page:', page);
    console.log('Limit:', limit);
    console.log('Search:', search);
    console.log('Period:', period);
    console.log('SortBy:', sortBy);
    console.log('SortOrder:', sortOrder);
    console.log('Lang:', lang);
    console.log('IsSindhi:', isSindhi);

    console.log('API Route - Environment variables:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Not set'
    });

    // Calculate offset
    const offset = (page - 1) * limit;

    let query = supabase
      .from('poets')
      .select('id, poet_id, poet_slug, birth_date, death_date, birth_place, death_place, tags, file_url, is_featured, is_hidden, sindhi_name, sindhi_laqab, sindhi_takhalus, sindhi_tagline, sindhi_details, english_name, english_laqab, english_takhalus, english_tagline, english_details, created_at, updated_at', { count: 'exact' })
      .not("english_name", "is", null)
      .eq('is_hidden', false); // Only show non-hidden poets

    // Apply search filter - prioritize the current language
    if (search) {
      if (isSindhi) {
        // For Sindhi, search in Sindhi fields first, then English
        query = query.or(`sindhi_name.ilike.%${search}%,sindhi_laqab.ilike.%${search}%,sindhi_details.ilike.%${search}%,poet_slug.ilike.%${search}%,english_name.ilike.%${search}%,english_laqab.ilike.%${search}%`);
      } else {
        // For English, search in English fields first, then Sindhi
        query = query.or(`english_name.ilike.%${search}%,english_laqab.ilike.%${search}%,english_details.ilike.%${search}%,poet_slug.ilike.%${search}%,sindhi_name.ilike.%${search}%,sindhi_laqab.ilike.%${search}%`);
      }
    }

    // Apply period filter
    if (period && period !== 'All Periods') {
      if (period === '17th Century') {
        query = query.filter('birth_date', 'lte', '1700').filter('death_date', 'gte', '1600');
      } else if (period === '18th Century') {
        query = query.filter('birth_date', 'lte', '1800').filter('death_date', 'gte', '1700');
      } else if (period === '19th Century') {
        query = query.filter('birth_date', 'lte', '1900').filter('death_date', 'gte', '1800');
      } else if (period === '20th Century') {
        query = query.filter('birth_date', 'lte', '2000').filter('death_date', 'gte', '1900');
      }
    }

    // Apply sorting - prioritize the current language
    let sortField = sortBy;
    if (sortBy === 'english_name') {
      sortField = isSindhi ? 'sindhi_name' : 'english_name';
    }
    
    // Handle chronological sorting for birth_date
    if (sortBy === 'birth_date') {
      // For chronological sorting, we want older poets (earlier birth dates) first
      // So we use ascending order by default, which puts earlier dates first
      query = query.order('birth_date', { ascending: sortOrder === 'asc' });
      
      // If birth_date is null, we can't sort chronologically, so fall back to name
      // We'll handle this in the post-processing
    } else {
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    console.log('API Route - Executing query with params:', { page, limit, search, period, sortBy, sortOrder, offset, lang, isSindhi });

    let poets: any[] = [];
    let count: number = 0;
    
    try {
      const result = await query;
      poets = result.data || [];
      count = result.count || 0;
      
      console.log('API Route - Query executed successfully');
      console.log('Poets count:', poets?.length || 0);
      console.log('Total count:', count || 0);

      if (result.error) {
        console.error('API Route - Supabase error:', result.error);
        console.error('API Route - Error details:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        return NextResponse.json({ error: 'Failed to fetch poets', details: result.error.message }, { status: 500 });
      }

      console.log('API Route - Successfully fetched poets:', {
        count: poets?.length || 0,
        total: count || 0
      });
    } catch (queryError) {
      console.error('API Route - Query execution failed:', queryError);
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Debug: Log first poet data to check file_url
    if (poets && poets.length > 0) {
      console.log('API Route - First poet data sample:', {
        name: poets[0].english_name,
        file_url: poets[0].file_url,
        hasFileUrl: !!poets[0].file_url
      });
    }

    // Fetch tag translations for the current language
    let tagTranslations: { [key: string]: string } = {};
    let tagIdToName: { [key: string]: string } = {};
    
    if (poets && poets.length > 0) {
      // Get unique tags from all poets
      const allTags = [...new Set(poets.flatMap(poet => poet.tags || []))];
      
      if (allTags.length > 0) {
        try {
          // First, get the tag names from the tags table
          const { data: tagNames, error: tagError } = await supabase
            .from('tags')
            .select('id, name')
            .in('id', allTags);
          
          if (!tagError && tagNames) {
            // Create a mapping of tag ID to tag name
            tagNames.forEach(tag => {
              tagIdToName[tag.id] = tag.name;
            });
            
            // Now fetch translations for the tag names
            const tagNamesList = tagNames.map(tag => tag.name);
            const { data: translations, error: translationError } = await supabase
              .from('tags_translations')
              .select('tag_id, title')
              .eq('lang_code', isSindhi ? 'sd' : 'en')
              .in('tag_id', tagNamesList);
            
            if (!translationError && translations) {
              translations.forEach(translation => {
                tagTranslations[translation.tag_id] = translation.title;
              });
            }
            
            console.log('API Route - Tag translations fetched:', {
              language: isSindhi ? 'sd' : 'en',
              tagsCount: tagNames.length,
              translationsCount: Object.keys(tagTranslations).length,
              sampleTags: tagNames.slice(0, 3),
              sampleTranslations: Object.entries(tagTranslations).slice(0, 3)
            });
          }
        } catch (translationError) {
          console.error('API Route - Error fetching tag translations:', translationError);
        }
      }
    }

    // Transform the data to prioritize the current language
    let transformedPoets = poets?.map(poet => ({
      ...poet,
      // Prioritize the current language for display
      display_name: isSindhi && poet.sindhi_name ? poet.sindhi_name : poet.english_name,
      display_laqab: isSindhi && poet.sindhi_laqab ? poet.sindhi_laqab : poet.english_laqab,
      display_tagline: isSindhi && poet.sindhi_tagline ? poet.sindhi_tagline : poet.english_tagline,
      display_details: isSindhi && poet.sindhi_details ? poet.sindhi_details : poet.english_details,
      // Add translated tags
      translated_tags: poet.tags ? poet.tags.map(tagId => {
        // First get the tag name from the ID, then get the translation
        const tagName = tagIdToName[tagId] || tagId;
        return tagTranslations[tagName] || tagName;
      }) : []
    })) || [];

    // Apply chronological sorting if requested
    if (sortBy === 'birth_date') {
      transformedPoets = transformedPoets.sort((a, b) => {
        // Handle null birth dates - put them at the end
        if (!a.birth_date && !b.birth_date) return 0;
        if (!a.birth_date) return 1;
        if (!b.birth_date) return -1;
        
        // Parse birth dates
        const dateA = new Date(a.birth_date);
        const dateB = new Date(b.birth_date);
        
        // Check if dates are valid
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        // Sort by birth date (older first for ascending, younger first for descending)
        if (sortOrder === 'asc') {
          return dateA.getTime() - dateB.getTime(); // Older dates first
        } else {
          return dateB.getTime() - dateA.getTime(); // Newer dates first
        }
      });
    }

    const hasMore = (poets?.length || 0) === limit && (count || 0) > offset + limit;

    return NextResponse.json({ 
      poets: transformedPoets, 
      hasMore,
      total: count || 0,
      page,
      limit,
      lang
    }, { status: 200 });
  } catch (error) {
    console.error('API Route - Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
