export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withSearchRateLimit } from '@/lib/security/rate-limiter';
import { validateApiInput, apiSchemas, sanitizeSQLInput } from '@/lib/security/input-validation';

async function searchHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const lang = (searchParams.get('lang') || 'en').toLowerCase() === 'sd' ? 'sd' : 'en';

    if (!q) {
      return NextResponse.json({ results: [] });
    }
    
    // Validate and sanitize search input
    const searchData = validateApiInput({ q, lang }, apiSchemas.search);
    const sanitizedQuery = sanitizeSQLInput(searchData.q);

    const supabase = createAdminClient();
    const results: any[] = [];

    console.log('Searching for:', sanitizedQuery, 'in language:', lang);

    // Search poets - including all name variations with sanitized query
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, sindhi_laqab, english_laqab, sindhi_takhalus, english_takhalus, sindhi_tagline, english_tagline, poet_slug, file_url')
      .or(`sindhi_name.ilike.%${sanitizedQuery}%,english_name.ilike.%${sanitizedQuery}%,poet_slug.ilike.%${sanitizedQuery}%,sindhi_laqab.ilike.%${sanitizedQuery}%,english_laqab.ilike.%${sanitizedQuery}%,sindhi_takhalus.ilike.%${sanitizedQuery}%,english_takhalus.ilike.%${sanitizedQuery}%,sindhi_tagline.ilike.%${sanitizedQuery}%,english_tagline.ilike.%${sanitizedQuery}%`)
      .limit(5);

    if (poets && !poetsError) {
      for (const poet of poets) {
        // Determine which name field matched and create appropriate display
        const qLower = sanitizedQuery.toLowerCase();
        let matchedField = '';
        let displayName = '';
        
        if (lang === 'sd') {
          if (poet.sindhi_name?.toLowerCase().includes(qLower)) {
            matchedField = 'sindhi_name';
            displayName = poet.sindhi_name;
          } else if (poet.poet_slug?.toLowerCase().includes(qLower)) {
            matchedField = 'poet_slug';
            displayName = `${poet.sindhi_name || poet.english_name} (${poet.poet_slug})`;
          } else if (poet.sindhi_laqab?.toLowerCase().includes(qLower)) {
            matchedField = 'sindhi_laqab';
            displayName = `${poet.sindhi_name || poet.english_name} (${poet.sindhi_laqab})`;
          } else if (poet.sindhi_takhalus?.toLowerCase().includes(qLower)) {
            matchedField = 'sindhi_takhalus';
            displayName = `${poet.sindhi_name || poet.english_name} (${poet.sindhi_takhalus})`;
          } else if (poet.sindhi_tagline?.toLowerCase().includes(qLower)) {
            matchedField = 'sindhi_tagline';
            displayName = `${poet.sindhi_name || poet.english_name} (${poet.sindhi_tagline})`;
          } else {
            displayName = poet.sindhi_name || poet.english_name;
          }
        } else {
          if (poet.english_name?.toLowerCase().includes(qLower)) {
            matchedField = 'english_name';
            displayName = poet.english_name;
          } else if (poet.poet_slug?.toLowerCase().includes(qLower)) {
            matchedField = 'poet_slug';
            displayName = `${poet.english_name || poet.sindhi_name} (${poet.poet_slug})`;
          } else if (poet.english_laqab?.toLowerCase().includes(qLower)) {
            matchedField = 'english_laqab';
            displayName = `${poet.english_name || poet.sindhi_name} (${poet.english_laqab})`;
          } else if (poet.english_takhalus?.toLowerCase().includes(qLower)) {
            matchedField = 'english_takhalus';
            displayName = `${poet.english_name || poet.sindhi_name} (${poet.english_takhalus})`;
          } else if (poet.english_tagline?.toLowerCase().includes(qLower)) {
            matchedField = 'english_tagline';
            displayName = `${poet.english_name || poet.sindhi_name} (${poet.english_tagline})`;
          } else {
            displayName = poet.english_name || poet.sindhi_name;
          }
        }

        results.push({
          id: String(poet.poet_id),
          type: 'poet',
          title: displayName,
          subtitle: lang === 'sd' ? 'شاعر' : 'Poet',
          url: `/${lang}/poets/${poet.poet_slug || poet.poet_id}`,
          imageUrl: poet.file_url || null,
          matchedField: matchedField, // For debugging
          metadata: {
            poet: displayName,
            slug: poet.poet_slug,
            hasImage: !!poet.file_url
          }
        });
      }
    }

    // Search poetry - try multiple approaches
    try {
      // First try the complex query with full hierarchical data
      const { data: poetryComplex, error: poetryComplexError } = await supabase
        .from('poetry_main')
        .select(`
          id,
          poetry_slug,
          content_style,
          poet_id,
          category_id,
          poets!inner(
            poet_slug
          ),
          categories!inner(
            slug
          ),
          poetry_translations!inner(
            title,
            lang
          )
        `)
        .eq('poetry_translations.lang', lang)
        .ilike('poetry_translations.title', `%${sanitizedQuery}%`)
        .eq('visibility', true)
        .is('deleted_at', null)
        .limit(5);

      if (poetryComplex && !poetryComplexError && poetryComplex.length > 0) {
        // Use complex hierarchical data
        for (const poem of poetryComplex) {
          const poet = poem.poets?.[0];
          const category = poem.categories?.[0];
          const translation = poem.poetry_translations?.[0];
          
          if (poet && category && translation) {
            results.push({
              id: String(poem.id),
              type: 'poem',
              title: translation.title,
              subtitle: lang === 'sd' ? 'شاعري' : 'Poetry',
              url: `/${lang}/poets/${poet.poet_slug}/form/${category.slug}/${poem.poetry_slug}`,
              metadata: {
                poetryId: poem.id,
                language: translation.lang,
                poetSlug: poet.poet_slug,
                categorySlug: category.slug,
                poetrySlug: poem.poetry_slug,
                form: poem.content_style
              }
            });
          }
        }
      } else {
        // Fallback to simple poetry table
        const { data: poetrySimple, error: poetrySimpleError } = await supabase
          .from('poetry')
          .select('poetry_id, title, lang')
          .eq('lang', lang)
          .ilike('title', `%${sanitizedQuery}%`)
          .limit(5);

        if (poetrySimple && !poetrySimpleError) {
          for (const poem of poetrySimple) {
            // Generate hierarchical URL structure with fallback data
            const poetrySlug = poem.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
            const poetSlug = 'jahangeer-dahri'; // Example poet slug
            const categorySlug = 'ghazal'; // Example category slug
            
            results.push({
              id: String(poem.poetry_id),
              type: 'poem',
              title: poem.title,
              subtitle: lang === 'sd' ? 'شاعري' : 'Poetry',
              url: `/${lang}/poets/${poetSlug}/form/${categorySlug}/${poetrySlug}`,
              metadata: {
                poetryId: poem.poetry_id,
                language: poem.lang,
                poetSlug: poetSlug,
                categorySlug: categorySlug,
                poetrySlug: poetrySlug
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Poetry search error:', error);
    }

    // Search tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, slug, label')
      .or(`label.ilike.%${sanitizedQuery}%,slug.ilike.%${sanitizedQuery}%`)
      .limit(3);

    if (tags && !tagsError) {
      for (const tag of tags) {
        results.push({
          id: String(tag.id),
          type: 'tag',
          title: tag.label || tag.slug,
          subtitle: lang === 'sd' ? 'موضوع' : 'Topic',
          url: `/${lang}/topic/${tag.slug}`,
          metadata: {
            tagSlug: tag.slug,
            tagLabel: tag.label
          }
        });
      }
    }

    console.log('Search results:', {
      query: sanitizedQuery,
      lang,
      poets: poets?.length || 0,
      tags: tags?.length || 0,
      total: results.length
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error('Search error', e);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}

export const GET = withSearchRateLimit(searchHandler);