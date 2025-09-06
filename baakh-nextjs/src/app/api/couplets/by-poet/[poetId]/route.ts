import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poetId: string }> }
) {
  try {
    console.log('API Route - Starting couplets by poet request');
    
    const { poetId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    console.log('API Route - Couplets by poet request:', { 
      poetId, 
      page, 
      limit, 
      lang, 
      sortBy, 
      sortOrder, 
      offset 
    });

    if (!poetId) {
      return NextResponse.json({ error: 'Poet ID is required' }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      
      // Resolve poet by UUID, numeric ID (poet_id), or slug
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isNumeric = /^\d+$/.test(poetId);
      let poetData: any = null;

      if (uuidRe.test(poetId)) {
        const { data } = await supabase
          .from('poets')
          .select('id, poet_id, poet_slug, sindhi_name, english_name, sindhi_laqab, english_laqab, sindhi_takhalus, english_takhalus, file_url')
          .eq('id', poetId)
          .single();
        poetData = data;
      } else if (isNumeric) {
        const { data } = await supabase
          .from('poets')
          .select('id, poet_id, poet_slug, sindhi_name, english_name, sindhi_laqab, english_laqab, sindhi_takhalus, english_takhalus, file_url')
          .eq('poet_id', parseInt(poetId, 10))
          .single();
        poetData = data;
      } else {
        const { data } = await supabase
          .from('poets')
          .select('id, poet_id, poet_slug, sindhi_name, english_name, sindhi_laqab, english_laqab, sindhi_takhalus, english_takhalus, file_url')
          .eq('poet_slug', poetId)
          .single();
        poetData = data;
      }

      if (!poetData) {
        console.error('Poet not found for identifier:', poetId);
        return NextResponse.json({ error: 'Poet not found' }, { status: 404 });
      }

      console.log('Found poet:', poetData.poet_slug);

      // Build the query to fetch couplets by poet_id (numeric)
      let query = supabase
        .from('poetry_couplets')
        .select(`
          *
        `, { count: 'exact' })
        .eq('poet_id', poetData.poet_id);

      // Apply language filter if specified
      if (lang) {
        query = query.eq('lang', lang);
        console.log('Applied language filter:', lang);
      }

      // Apply sorting
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'couplet_slug') {
        query = query.order('couplet_slug', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'lang') {
        query = query.order('lang', { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      console.log('Executing couplets query for poet_id:', poetData.poet_id);
      const { data: coupletsData, error: coupletsError, count: totalCount } = await query;

      console.log('Database query result:', { 
        coupletsCount: coupletsData?.length || 0, 
        error: coupletsError, 
        totalCount 
      });

      if (coupletsError) {
        console.error('Error fetching couplets:', coupletsError);
        throw coupletsError;
      }

      if (!coupletsData || coupletsData.length === 0) {
        console.log('No couplets found for poet:', poetId);
        return NextResponse.json({
          couplets: [],
          poet: {
            id: poetData.id,
            slug: poetData.poet_slug,
            name: poetData.sindhi_name || poetData.english_name,
            sindhi_name: poetData.sindhi_name,
            english_name: poetData.english_name,
            photo: poetData.file_url
          },
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }

      console.log('Processing couplets data for poet:', poetId);

      // Process the couplets data
      const processedCouplets = coupletsData.map((couplet: any) => {
        // Split couplet text into lines
        const lines = couplet.couplet_text ? couplet.couplet_text.split('\n').filter((line: string) => line.trim()) : [];
        
        // Keep two lines; if not exactly two, coerce to two with empty second line
        let finalLines = lines.slice(0, 2);
        if (finalLines.length === 1) finalLines.push('');
        if (finalLines.length === 0) finalLines = ['', ''];

        // If requesting Sindhi, enforce Arabic script presence in at least one line
        if (lang === 'sd') {
          const hasArabic = (s: string) => /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s);
          const filtered = finalLines.filter(l => hasArabic(l));
          if (filtered.length === 2) {
            finalLines = filtered;
          } else if (filtered.length === 1) {
            finalLines = [filtered[0], ''];
          } else {
            // No Arabic lines, drop this couplet
            return null;
          }
        }

        // Clean up tags - handle both comma-separated and JSON array formats
        let cleanTags: string[] = [];
        if (couplet.couplet_tags) {
          try {
            const parsedTags = JSON.parse(couplet.couplet_tags);
            if (Array.isArray(parsedTags)) {
              cleanTags = parsedTags.filter((tag: any) => typeof tag === 'string' && tag.trim());
            }
          } catch {
            cleanTags = couplet.couplet_tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          }
        }

        return {
          id: couplet.id,
          couplet_text: couplet.couplet_text,
          couplet_slug: couplet.couplet_slug,
          lang: couplet.lang,
          lines: finalLines,
          tags: cleanTags,
          poet: {
            name: poetData.sindhi_name || poetData.english_name,
            slug: poetData.poet_slug,
            photo: poetData.file_url
          },
          poetry: null,
          created_at: couplet.created_at,
          likes: Math.floor(Math.random() * 1000) + 100,
          views: Math.floor(Math.random() * 5000) + 500
        };
      }).filter(Boolean);

      console.log('Processed couplets for poet:', processedCouplets.length);

      // Resolve translated tag titles for all couplets in one pass
      const allRawTags = Array.from(new Set(processedCouplets.flatMap(c => c.tags)));
      let tagIdToTranslated: Record<string, string> = {};
      if (allRawTags.length > 0) {
        const { data: tagsResolved } = await supabase
          .from('tags')
          .select('id, slug, label')
          .or(`slug.in.(${allRawTags.map(v => `"${v}"`).join(',')}),label.in.(${allRawTags.map(v => `"${v}"`).join(',')})`);
        const ids = (tagsResolved || []).map((t: any) => t.id);
        if (ids.length > 0) {
          const { data: trs } = await supabase
            .from('tags_translations')
            .select('tag_id, title, lang_code')
            .eq('lang_code', lang || 'sd')
            .in('tag_id', ids);
          const idToTitle: Record<number, string> = {};
          (trs || []).forEach((t: any) => { idToTitle[t.tag_id] = t.title; });
          (tagsResolved || []).forEach((t: any) => {
            const title = idToTitle[t.id] || t.label || t.slug;
            tagIdToTranslated[t.slug] = title;
            tagIdToTranslated[t.label] = title;
          });
        }
      }

      const processedWithTranslations = processedCouplets.map(c => ({
        ...c,
        translatedTags: c.tags.map(t => tagIdToTranslated[t] || t)
      }));

      const totalPages = Math.ceil((totalCount || 0) / limit);

      return NextResponse.json({
        couplets: processedWithTranslations,
        poet: {
          id: poetData.id,
          slug: poetData.poet_slug,
          name: poetData.sindhi_name || poetData.english_name,
          sindhi_name: poetData.sindhi_name,
          english_name: poetData.english_name,
          photo: poetData.file_url
        },
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
