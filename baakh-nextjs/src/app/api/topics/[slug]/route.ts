export const runtime = 'edge'
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const { slug } = await params;

    console.log('Topics API called with params:', { slug, lang, page, limit });

    const admin = createAdminClient();

    // First, get the tag information
    const { data: tag, error: tagError } = await admin
      .from("tags")
      .select("id, slug, label, tag_type, created_at")
      .eq("slug", slug)
      .single();

    if (tagError || !tag) {
      console.log('Tag not found:', slug);
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    console.log('Found tag:', tag);

    // Get translations for the tag
    const { data: translations, error: translationsError } = await admin
      .from("tags_translations")
      .select("lang_code, title, detail")
      .eq("tag_id", tag.id);

    if (translationsError && translationsError.code !== '42P01') {
      console.error("Error fetching translations:", translationsError);
    }

    // Get title and description based on language with fallback
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'nature': { 'sd': 'فطرت', 'en': 'Nature' },
      'love': { 'sd': 'محبت', 'en': 'Love' },
      'wisdom': { 'sd': 'حڪمت', 'en': 'Wisdom' },
      'life': { 'sd': 'زندگي', 'en': 'Life' },
      'death': { 'sd': 'موت', 'en': 'Death' },
      'faith': { 'sd': 'ايمان', 'en': 'Faith' },
      'hope': { 'sd': 'اميد', 'en': 'Hope' },
      'patience': { 'sd': 'صبرو', 'en': 'Patience' },
      'friendship': { 'sd': 'دوستي', 'en': 'Friendship' },
      'freedom': { 'sd': 'آزادي', 'en': 'Freedom' },
      'justice': { 'sd': 'انصاف', 'en': 'Justice' },
      'peace': { 'sd': 'امن', 'en': 'Peace' },
      'social-justice': { 'sd': 'سماجي انصاف', 'en': 'Social Justice' },
      'sufism': { 'sd': 'تصوف', 'en': 'Sufism' },
      'homeland': { 'sd': 'وطن', 'en': 'Homeland' },
      'culture': { 'sd': 'ثقافت', 'en': 'Culture' },
      'religion': { 'sd': 'مذهب', 'en': 'Religion' }
    };

    let title = tag.label;
    let description = `Explore all content related to ${tag.label}`;
    
    if (translations && translations.length > 0) {
      const translation = translations.find((t: any) => t.lang_code === lang);
      if (translation) {
        // Use fallback if existing title is just the slug or label
        if (translation.title && translation.title !== tag.slug && translation.title !== tag.label) {
          title = translation.title;
        } else if (lang === 'sd' && fallbackTranslations[tag.slug]) {
          title = fallbackTranslations[tag.slug].sd;
        } else if (lang === 'en' && fallbackTranslations[tag.slug]) {
          title = fallbackTranslations[tag.slug].en;
        }
        description = translation.detail || `Explore all content related to ${title}`;
      }
    } else if (lang === 'sd' && fallbackTranslations[tag.slug]) {
      title = fallbackTranslations[tag.slug].sd;
      description = `هي موضوع بابت خوبصورت شعر ۽ شاعري ڏسو`;
    } else if (lang === 'en' && fallbackTranslations[tag.slug]) {
      title = fallbackTranslations[tag.slug].en;
      description = `Explore beautiful couplets and poetry on this topic`;
    }

    // Override description for homeland topic to remove unwanted text
    if (slug === 'homeland' && lang === 'sd') {
      description = `هي موضوع بابت خوبصورت شعر ۽ شاعري ڏسو`;
    }

    // Fetch couplets with this tag (only standalone couplets with poetry_id = 0 or null)
    const { data: coupletsData, error: coupletsError } = await admin
      .from('poetry_couplets')
      .select(`
        id,
        couplet_text,
        couplet_slug,
        couplet_tags,
        lang,
        created_at,
        poet_id,
        poetry_id
      `)
      .ilike('couplet_tags', `%${slug}%`)
      .or('poetry_id.is.null,poetry_id.eq.0') // Only standalone couplets
      .order('created_at', { ascending: false })
      .limit(limit);

    if (coupletsError) {
      console.error('Error fetching couplets:', coupletsError);
    }
    
    console.log('Couplets data:', coupletsData);
    console.log('Couplets count:', coupletsData?.length);

    // Fetch poet information for couplets
    let poetsData: any[] = [];
    if (coupletsData && coupletsData.length > 0) {
      const poetIds = [...new Set(coupletsData.map((c: any) => c.poet_id).filter(Boolean))];
      if (poetIds.length > 0) {
        const { data: poets, error: poetsError } = await admin
          .from('poets')
          .select('poet_id, english_name, sindhi_name, file_url')
          .in('poet_id', poetIds);
        
        if (poetsError) {
          console.error('Error fetching poets:', poetsError);
        } else {
          poetsData = poets || [];
        }
      }
    }

    // Fetch poetry with this tag
    const { data: poetryData, error: poetryError } = await admin
      .from('poetry_main')
      .select(`
        id,
        poetry_slug,
        lang,
        created_at,
        poet_id,
        category_id,
        poetry_tags
      `)
      .ilike('poetry_tags', `%${slug}%`)
      .eq('visibility', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (poetryError) {
      console.error('Error fetching poetry:', poetryError);
    }

    // Get total counts
    const { count: coupletsCount } = await admin
      .from('poetry_couplets')
      .select('*', { count: 'exact', head: true })
      .ilike('couplet_tags', `%${slug}%`)
      .or('poetry_id.is.null,poetry_id.eq.0'); // Only standalone couplets (count across all languages)

    const { count: poetryCount } = await admin
      .from('poetry_main')
      .select('id', { count: 'exact', head: true })
      .ilike('poetry_tags', `%${slug}%`)
      .eq('visibility', true)
      .is('deleted_at', null);

    // Get all unique tag slugs from couplets and poetry
    const allTagSlugs = new Set<string>();
    (coupletsData || []).forEach((couplet: any) => {
      if (couplet.couplet_tags) {
        const tags = couplet.couplet_tags.split(',').map((tag: string) => tag.trim());
        tags.forEach((tagSlug: string) => allTagSlugs.add(tagSlug));
      }
    });
    (poetryData || []).forEach((poem: any) => {
      if (poem.poetry_tags) {
        const tags = poem.poetry_tags.split(',').map((tag: string) => tag.trim());
        tags.forEach((tagSlug: string) => allTagSlugs.add(tagSlug));
      }
    });

    // Fetch tag information for all unique tags
    const { data: tagsData, error: tagsError } = await admin
      .from('tags')
      .select('slug, label, tag_type')
      .in('slug', Array.from(allTagSlugs));

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
    }

    // Create a map of slug to tag info
    const tagMap = new Map();
    (tagsData || []).forEach((tag: any) => {
      tagMap.set(tag.slug, {
        id: tag.slug,
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type
      });
    });

    // Build lookup maps for poetry relations
    const poetryPoetIds = [...new Set((poetryData || []).map((p: any) => p.poet_id).filter(Boolean))];
    const poetryCategoryIds = [...new Set((poetryData || []).map((p: any) => p.category_id).filter(Boolean))];
    let poetryPoets: any[] = [];
    let poetryCategories: any[] = [];
    if (poetryPoetIds.length > 0) {
      const { data: ppoets } = await admin
        .from('poets')
        .select('poet_id, poet_slug, english_name, sindhi_name, file_url')
        .in('poet_id', poetryPoetIds);
      poetryPoets = ppoets || [];
    }
    if (poetryCategoryIds.length > 0) {
      // First get the base category info
      const { data: pcats } = await admin
        .from('categories')
        .select('id, slug')
        .in('id', poetryCategoryIds);
      
      // Then get the category details (names) for both languages
      const { data: categoryDetails } = await admin
        .from('category_details')
        .select('cat_id, cat_name, lang')
        .in('cat_id', poetryCategoryIds);
      
      // Combine the data
      poetryCategories = (pcats || []).map((cat: any) => {
        const enDetail = categoryDetails?.find((d: any) => d.cat_id === cat.id && d.lang === 'en');
        const sdDetail = categoryDetails?.find((d: any) => d.cat_id === cat.id && d.lang === 'sd');
        return {
          ...cat,
          english_name: enDetail?.cat_name,
          sindhi_name: sdDetail?.cat_name
        };
      });
    }
    const poetMap = new Map(poetryPoets.map((poet: any) => [poet.poet_id, poet]));
    const categoryMap = new Map(poetryCategories.map((c: any) => [c.id, c]));

    // Transform couplets data
    const couplets = (coupletsData || []).map((couplet: any) => {
      const poet = poetMap.get(couplet.poet_id);
      return {
        id: couplet.id,
        lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter((line: string) => line.trim()) : [],
        lang: couplet.lang,
        slug: couplet.couplet_slug,
        tags: (couplet.couplet_tags || '').split(',').map((tagSlug: string) => tagMap.get(tagSlug.trim()) || { id: tagSlug.trim(), slug: tagSlug.trim(), label: tagSlug.trim(), tag_type: 'unknown' }),
        created_at: couplet.created_at,
        view_count: 0,
        poet: {
          id: poet?.poet_id || 'unknown',
          name: lang === 'sd' 
            ? (poet?.sindhi_name || poet?.english_name || 'Unknown')
            : (poet?.english_name || poet?.sindhi_name || 'Unknown'),
          slug: 'unknown', // Will need to fetch poet slug separately if needed
          photo: poet?.file_url || null
        }
      };
    });

    // Transform poetry data
    const categoryNameFromSlug = (slug: string | undefined, langCode: string) => {
      const map: Record<string, { en: string; sd: string }> = {
        ghazal: { en: 'Ghazal', sd: 'غزل' },
        nazm: { en: 'Nazm', sd: 'نظم' },
        rubai: { en: 'Rubai', sd: 'رباعي' },
        masnavi: { en: 'Masnavi', sd: 'مثنوي' },
        qasida: { en: 'Qasida', sd: 'قصيده' },
        doha: { en: 'Doha', sd: 'دوها' },
        qata: { en: 'Qata', sd: 'قطعو' },
        marsiya: { en: 'Marsiya', sd: 'مرثيو' },
        chausittaa: { en: 'Chausittaa', sd: 'چوڱيتا' }
      };
      if (!slug) return 'Unknown';
      const entry = map[slug];
      if (!entry) return slug;
      return langCode === 'sd' ? entry.sd : entry.en;
    };

    const deriveCategoryFromTags = (tags: string | undefined, categoryMap: Map<string, any>): string | undefined => {
      if (!tags) return undefined;
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      const knownSlugs = Array.from(categoryMap.values()).map(cat => cat.slug).filter(Boolean);
      return tagList.find(t => knownSlugs.includes(t));
    };

    const poetry = (poetryData || []).map((poem: any) => {
      const poet = poetMap.get(poem.poet_id) || null;
      let cat = categoryMap.get(poem.category_id) || null;
      let catSlug: string | undefined = cat?.slug;
      
      if (!catSlug || catSlug === 'unknown') {
        catSlug = deriveCategoryFromTags(poem.poetry_tags, categoryMap) || catSlug;
      }
      const englishName = cat?.english_name || categoryNameFromSlug(catSlug, 'en');
      const sindhiName = cat?.sindhi_name || categoryNameFromSlug(catSlug, 'sd');
      return {
        id: poem.id,
        title: poem.poetry_slug,
        slug: poem.poetry_slug,
        lang: poem.lang,
        created_at: poem.created_at,
        view_count: 0,
        reading_time: 5,
        tags: (poem.poetry_tags || '').split(',').map((tagSlug: string) => tagMap.get(tagSlug.trim()) || { id: tagSlug.trim(), slug: tagSlug.trim(), label: tagSlug.trim(), tag_type: 'unknown' }),
        poet: {
          id: poet?.poet_id || 'unknown',
          name: lang === 'sd'
            ? (poet?.sindhi_name || poet?.english_name || 'Unknown')
            : (poet?.english_name || poet?.sindhi_name || 'Unknown'),
          slug: poet?.poet_slug || 'unknown',
          photo: poet?.file_url || null
        },
        category: {
          id: cat?.id || catSlug || 'unknown',
          slug: catSlug || 'unknown',
          englishName,
          sindhiName
        }
      };
    });

    const topicData = {
      id: tag.id,
      slug: tag.slug,
      label: tag.label,
      tag_type: tag.tag_type,
      created_at: tag.created_at,
      translations: translations || [],
      englishTitle: lang === 'en' ? title : (fallbackTranslations[tag.slug]?.en || tag.label),
      sindhiTitle: lang === 'sd' ? title : (fallbackTranslations[tag.slug]?.sd || tag.label),
      englishDetail: lang === 'en' ? description : (translations?.find((t: any) => t.lang_code === 'en')?.detail || `Explore all content related to ${fallbackTranslations[tag.slug]?.en || tag.label}`),
      sindhiDetail: lang === 'sd' ? description : (translations?.find((t: any) => t.lang_code === 'sd')?.detail || `هي موضوع بابت خوبصورت شعر ۽ شاعري ڏسو`)
    };

    console.log('Returning topic data:', {
      topic: topicData,
      coupletsCount: couplets.length,
      poetryCount: poetry.length,
      totalCouplets: coupletsCount || 0,
      totalPoetry: poetryCount || 0
    });

    return NextResponse.json({
      topic: topicData,
      couplets: couplets,
      poetry: poetry,
      totalCouplets: coupletsCount || 0,
      totalPoetry: poetryCount || 0,
      page: page,
      limit: limit
    });

  } catch (err: any) {
    console.error("Error fetching topic data:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
