import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const isSindhi = lang === 'sd';
    
    const supabase = createAdminClient();

    // Fetch poet data
    const { data: poet, error: poetError } = await supabase
      .from('poets')
      .select('*')
      .eq('poet_slug', id)
      .single();

    if (poetError || !poet) {
      return NextResponse.json({ error: 'Poet not found' }, { status: 404 });
    }

    // Fetch poetry by this poet (include translations of all languages; order newest first)
    const { data: poetry, error: poetryError } = await supabase
      .from('poetry_main')
      .select(`
        id, poetry_slug, poetry_tags, is_featured, category_id, created_at,
        poetry_translations (
          title,
          lang
        )
      `)
      .eq('poet_id', poet.poet_id)
      .eq('visibility', true)
      .order('id', { ascending: false });

    if (poetryError) {
      console.error('Error fetching poetry:', poetryError);
    }

    // Fetch couplets by this poet
    const { data: couplets, error: coupletsError } = await supabase
      .from('poetry_couplets')
      .select('*')
      .eq('poet_id', poet.poet_id)
      .is('deleted_at', null);

    if (coupletsError) {
      console.error('Error fetching couplets:', coupletsError);
    }

    // Fetch categories for the poetry with proper language support
    let categories: any[] = [];
    if (poetry && poetry.length > 0) {
      const poetryIds = poetry.map(p => p.category_id).filter(Boolean);
      if (poetryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select(`
            *,
            category_details (*)
          `)
          .in('id', poetryIds);

        if (!categoryError && categoryData) {
          categories = categoryData;
        }
      }
    }

    // Calculate statistics - only count what the poet actually has
    const stats = {
      works: poetry?.length || 0,
      couplets: couplets?.length || 0,
      nazams: 0, // Only count if poet actually has nazams
      vaayis: 0   // Only count if poet actually has vaayis
    };

    // Get couplet samples (first 5) with proper language handling
    const coupletSamples = (couplets || []).slice(0, 5).map(couplet => {
      // Split couplet text into lines
      const lines = couplet.couplet_text?.split('\n').filter((line: string) => line.trim()) || [];
      
      // For Sindhi, show Sindhi text first, for English show English text first
      let displayText = '';
      if (isSindhi && lines.length > 0) {
        displayText = lines[0]; // First line is usually Sindhi
      } else if (lines.length > 1) {
        displayText = lines[1]; // Second line is usually English
      } else if (lines.length > 0) {
        displayText = lines[0]; // Fallback to first line
      }
      
      return {
        id: couplet.id,
        sindhi: lines[0] || '',
        english: lines[1] || '',
        displayText: displayText,
        likes: Math.floor(Math.random() * 1000) + 100, // Placeholder
        views: Math.floor(Math.random() * 5000) + 500   // Placeholder
      };
    });

    // Sort newest first for samples and category blocks
    const sortedPoetry = (poetry || []).sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));

    // Get poetry samples - prioritize newest
    const poetrySamples = sortedPoetry.slice(0, 5).map((poem: any) => {
      const sdTitle = poem.poetry_translations?.find((t: any) => t.lang === 'sd')?.title;
      const enTitle = poem.poetry_translations?.find((t: any) => t.lang === 'en')?.title;
      return {
        id: poem.id,
        title: sdTitle || enTitle || poem.poetry_slug,
        englishTitle: enTitle || poem.poetry_slug,
        description: poem.poetry_tags || 'No description available',
        slug: poem.poetry_slug,
        tags: poem.poetry_tags ? poem.poetry_tags.split(',').map((t: string) => t.trim()) : [],
        isFeatured: poem.is_featured
      };
    });

    // Fetch similar poets (based on tags or period)
    const { data: similarPoets, error: similarError } = await supabase
      .from('poets')
      .select('poet_slug, english_name, sindhi_name, file_url, birth_date, death_date')
      .neq('poet_slug', id)
      .eq('is_hidden', false)
      .limit(3);

    if (similarError) {
      console.error('Error fetching similar poets:', similarError);
    }

    // Resolve poet tag translations from DB (supports ids or slugs in poet.tags)
    let translatedTags: string[] = [];
    try {
      const poetTags = Array.isArray(poet.tags) ? poet.tags : [];
      let tagIds: number[] = [];
      const slugOrLabelCandidates: string[] = [];
      poetTags.forEach((t: any) => {
        const s = String(t).trim();
        if (/^\d+$/.test(s)) tagIds.push(parseInt(s, 10));
        else if (s) slugOrLabelCandidates.push(s);
      });

      // If we have slugs/labels, resolve to IDs using slug OR label
      if (slugOrLabelCandidates.length > 0) {
        const { data: tagsResolved } = await supabase
          .from('tags')
          .select('id, slug, label')
          .or(`slug.in.(${slugOrLabelCandidates.map(v => `"${v}"`).join(',')}),label.in.(${slugOrLabelCandidates.map(v => `"${v}"`).join(',')})`);
        if (tagsResolved && tagsResolved.length > 0) {
          tagIds = tagIds.concat(tagsResolved.map((t: any) => t.id));
        }
      }

      if (tagIds.length > 0) {
        const { data: tr } = await supabase
          .from('tags_translations')
          .select('tag_id, lang_code, title')
          .eq('lang_code', isSindhi ? 'sd' : 'en')
          .in('tag_id', tagIds);
        translatedTags = (tr || []).map((t: any) => t.title).filter(Boolean);
      }
    } catch (e) {
      console.warn('Warning resolving tag translations for poet');
    }

    const similarPoetsFormatted = (similarPoets || []).map(sp => ({
      id: sp.poet_slug,
      name: isSindhi && sp.sindhi_name ? sp.sindhi_name : (sp.english_name || sp.sindhi_name || 'Unknown Poet'),
      avatar: sp.file_url || `/avatars/${sp.poet_slug || 'default'}.jpg`,
      period: sp.birth_date && sp.death_date 
        ? `${sp.birth_date.split('-')[0]}-${sp.death_date.split('-')[0]}`
        : sp.birth_date 
        ? `${sp.birth_date.split('-')[0]}-present`
        : 'Unknown period'
    }));

    // Language-aware location fields
    const birthPlaceRaw = poet.birth_place || '';
    const deathPlaceRaw = poet.death_place || '';

    // Try to resolve location via database tables (location_cities/provinces)
    async function resolveLocalizedLocation(raw: string): Promise<{ sd?: string; en?: string }> {
      if (!raw) return {};
      
      // Split location into parts (e.g., "Larkana City, Sindh")
      const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return {};

      // Try to find city in location_cities table
      const cityName = parts[0];

      // Find city in both languages with province info
      const { data: cities, error: cityErr } = await supabase
        .from('location_cities')
        .select(`
          id,
          city_name,
          lang,
          province_id,
          location_provinces:province_id (
            id,
            province_name,
            lang
          )
        `)
        .ilike('city_name', `%${cityName}%`)
        .in('lang', ['en', 'sd']);

      if (cityErr || !cities || cities.length === 0) {
        return {};
      }

      // Group by language
      const cityByLang: { [key: string]: any } = {};
      cities.forEach(city => {
        const province = city.location_provinces;
        cityByLang[city.lang] = {
          city: city.city_name,
          province: province?.province_name || ''
        };
      });

      // Compose location strings
      const sd = cityByLang.sd ? `${cityByLang.sd.city}${cityByLang.sd.province ? `, ${cityByLang.sd.province}` : ''}` : '';
      const en = cityByLang.en ? `${cityByLang.en.city}${cityByLang.en.province ? `, ${cityByLang.en.province}` : ''}` : '';

      return { 
        sd: sd || undefined, 
        en: en || undefined 
      };
    }

    const dbLoc = await resolveLocalizedLocation(birthPlaceRaw);

    // Fallback mapper for common English->Sindhi location terms when sd rows are missing in DB
    function mapEnToSdPlace(input: string): string {
      if (!input) return input;
      const replacements: Record<string, string> = {
        'Larkana City': 'لاڙڪاڻو شهر',
        'Larkana': 'لاڙڪاڻو',
        'Sindh': 'سنڌ',
        'Karachi': 'ڪراچي',
        'Hyderabad': 'حيدرآباد',
        'City': 'شهر'
      };
      let out = input;
      // Replace longer keys first
      Object.keys(replacements)
        .sort((a, b) => b.length - a.length)
        .forEach((key) => {
          const re = new RegExp(`\\b${key}\\b`, 'g');
          out = out.replace(re, replacements[key]);
        });
      return out;
    }

    const locationSd = dbLoc.sd || birthPlaceRaw;
    const locationEn = dbLoc.en || birthPlaceRaw;
    const finalLocationSd = dbLoc.sd || (isSindhi ? mapEnToSdPlace(dbLoc.en || birthPlaceRaw) : locationSd);

    // Format the response with proper language handling
    const formattedPoet = {
      id: poet.poet_slug,
      poetNumericId: poet.poet_id,
      name: isSindhi && poet.sindhi_name ? poet.sindhi_name : (poet.english_name || poet.sindhi_name || 'Unknown Poet'),
      sindhiName: poet.sindhi_name || poet.english_name || '',
      englishName: poet.english_name || poet.sindhi_name || '',
      period: (() => {
        const birthYear = poet.birth_date ? poet.birth_date.split('-')[0] : '';
        const deathYear = poet.death_date ? poet.death_date.split('-')[0] : '';
        // Naive women-poet detection when tags are strings
        const hasWomenTag = Array.isArray(poet.tags)
          ? poet.tags.some((t: any) => typeof t === 'string' && /women|woman|female|عورت|اِرت/gi.test(t))
          : false;
        if (birthYear && !deathYear) {
          if (isSindhi) {
            const aliveWord = hasWomenTag ? 'جيئري' : 'جيئرو';
            return `${birthYear}-${aliveWord}`;
          } else {
            return `${birthYear}-alive`;
          }
        }
        if (birthYear && deathYear) return `${birthYear}-${deathYear}`;
        return 'Unknown period';
      })(),
      location: isSindhi ? finalLocationSd : locationEn,
      locationSd: finalLocationSd,
      locationEn,
      birthPlace: birthPlaceRaw,
      deathPlace: deathPlaceRaw,
      avatar: poet.file_url || `/avatars/${poet.poet_slug || 'default'}.jpg`,
      description: isSindhi && poet.sindhi_details
        ? poet.sindhi_details.substring(0, 200) + '...'
        : poet.english_details 
        ? poet.english_details.substring(0, 200) + '...'
        : poet.sindhi_details
        ? poet.sindhi_details.substring(0, 200) + '...'
        : 'A distinguished poet whose works continue to inspire generations.',
      longDescription: isSindhi && poet.sindhi_details 
        ? poet.sindhi_details 
        : poet.english_details || poet.sindhi_details || 'No detailed description available.',
      stats,
      categories: poet.tags && poet.tags.length > 0 
        ? poet.tags 
        : poet.english_details 
        ? (poet.english_details.includes('Sufi') ? ['Sufi', 'Spiritual'] : 
           poet.english_details.includes('Mystic') ? ['Mystic', 'Spiritual'] : 
           poet.english_details.includes('Philosophy') ? ['Philosophy', 'Wisdom'] : 
           ['Poet', 'Literature'])
        : ['Poet', 'Literature'],
      translatedTags,
      couplets: coupletSamples,
      nazams: [], // Only show if poet actually has nazams
      vaayis: [], // Only show if poet actually has vaayis
      similarPoets: similarPoetsFormatted
    };

    return NextResponse.json({
      poet: formattedPoet,
      categories: categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: isSindhi 
          ? cat.category_details?.find((d: any) => d.lang === 'sd')?.cat_name || 
            cat.category_details?.find((d: any) => d.lang === 'en')?.cat_name || 
            cat.slug
          : cat.category_details?.find((d: any) => d.lang === 'en')?.cat_name || 
            cat.slug,
        namePlural: isSindhi 
          ? cat.category_details?.find((d: any) => d.lang === 'sd')?.cat_name_plural || 
            cat.category_details?.find((d: any) => d.lang === 'en')?.cat_name_plural || 
            cat.slug
          : cat.category_details?.find((d: any) => d.lang === 'en')?.cat_name_plural || 
            cat.slug,
        description: isSindhi 
          ? cat.category_details?.find((d: any) => d.lang === 'sd')?.cat_detail || 
            cat.category_details?.find((d: any) => d.lang === 'en')?.cat_detail || 
            `Poetry in ${cat.slug} style`
          : cat.category_details?.find((d: any) => d.lang === 'en')?.cat_detail || 
            `Poetry in ${cat.slug} style`,
        poetryCount: (poetry || []).filter((p: any) => p.category_id === cat.id).length || 0,
        poetry: sortedPoetry
          .filter((p: any) => p.category_id === cat.id)
          .map((poem: any) => {
            const sdTitle = poem.poetry_translations?.find((t: any) => t.lang === 'sd')?.title;
            const enTitle = poem.poetry_translations?.find((t: any) => t.lang === 'en')?.title;
            return {
              id: poem.id,
              title: sdTitle || enTitle || poem.poetry_slug,
              englishTitle: enTitle || poem.poetry_slug,
              description: poem.poetry_tags || 'No description available',
              slug: poem.poetry_slug,
              tags: poem.poetry_tags ? poem.poetry_tags.split(',').map((t: string) => t.trim()) : [],
              isFeatured: poem.is_featured
            };
          }) || []
      }))
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}