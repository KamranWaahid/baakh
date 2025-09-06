import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Helper: build mock response compatible with topics page expectations
  const buildMockResponse = (limit: number, offset: number, type: string | null) => {
    const mockTags = [
      {
        id: '1',
        slug: 'love',
        label: 'محبت',
        tag_type: 'Topic',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Love', detail: 'Poetry about love and romance' },
          { lang_code: 'sd', title: 'محبت', detail: 'محبت ۽ رومانس بابت شاعري' }
        ],
        englishTitle: 'Love',
        sindhiTitle: 'محبت',
        englishDetail: 'Poetry about love and romance',
        sindhiDetail: 'محبت ۽ رومانس بابت شاعري'
      },
      {
        id: '2',
        slug: 'nature',
        label: 'طبيعت',
        tag_type: 'Topic',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Nature', detail: 'Poetry about nature and landscapes' },
          { lang_code: 'sd', title: 'طبيعت', detail: 'طبيعت ۽ منظرن بابت شاعري' }
        ],
        englishTitle: 'Nature',
        sindhiTitle: 'طبيعت',
        englishDetail: 'Poetry about nature and landscapes',
        sindhiDetail: 'طبيعت ۽ منظرن بابت شاعري'
      },
      {
        id: '3',
        slug: 'religion',
        label: 'مذهب',
        tag_type: 'Topic',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Religion', detail: 'Spiritual and religious poetry' },
          { lang_code: 'sd', title: 'مذهب', detail: 'روحاني ۽ مذهبي شاعري' }
        ],
        englishTitle: 'Religion',
        sindhiTitle: 'مذهب',
        englishDetail: 'Spiritual and religious poetry',
        sindhiDetail: 'روحاني ۽ مذهبي شاعري'
      },
      {
        id: '4',
        slug: 'ghazal',
        label: 'غزل',
        tag_type: 'Form',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Ghazal', detail: 'Traditional poetic form' },
          { lang_code: 'sd', title: 'غزل', detail: 'روايتي شاعري جو انداز' }
        ],
        englishTitle: 'Ghazal',
        sindhiTitle: 'غزل',
        englishDetail: 'Traditional poetic form',
        sindhiDetail: 'روايتي شاعري جو انداز'
      },
      {
        id: '5',
        slug: 'culture',
        label: 'ثقافت',
        tag_type: 'Topic',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Culture', detail: 'Cultural themes and traditions' },
          { lang_code: 'sd', title: 'ثقافت', detail: 'ثقافتي موضوع ۽ روايتون' }
        ],
        englishTitle: 'Culture',
        sindhiTitle: 'ثقافت',
        englishDetail: 'Cultural themes and traditions',
        sindhiDetail: 'ثقافتي موضوع ۽ روايتون'
      },
      {
        id: '6',
        slug: 'homeland',
        label: 'وطن',
        tag_type: 'Topic',
        created_at: new Date().toISOString(),
        tags_translations: [
          { lang_code: 'en', title: 'Homeland', detail: 'Poetry about homeland and identity' },
          { lang_code: 'sd', title: 'وطن', detail: 'وطن ۽ سڃاڻپ بابت شاعري' }
        ],
        englishTitle: 'Homeland',
        sindhiTitle: 'وطن',
        englishDetail: 'Poetry about homeland and identity',
        sindhiDetail: 'وطن ۽ سڃاڻپ بابت شاعري'
      }
    ];

    let filtered = mockTags;
    if (type) {
      filtered = filtered.filter(t => t.tag_type === type);
    }
    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);
    return NextResponse.json({ items, total }, { status: 200 });
  };

  // If env missing, return mock instead of failing
  if (!url || !serviceKey) {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(48, Number(searchParams.get('limit') || 12)));
    const offset = Math.max(0, Number(searchParams.get('offset') || 0));
    const type = searchParams.get('type') || null;
    return buildMockResponse(limit, offset, type);
  }

  // Use shared admin client factory for consistency
  let admin;
  try {
    admin = createAdminClient();
  } catch (e: any) {
    return NextResponse.json({ error: 'Supabase admin init failed' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(48, Number(searchParams.get('limit') || 12)));
    const offset = Math.max(0, Number(searchParams.get('offset') || 0));
    const lang = searchParams.get('lang') || 'en';
    const type = searchParams.get('type') || null;
    const to = offset + limit - 1;
    
    // Build the base query with JOIN to tags_translations
    let query = admin
      .from('tags')
      .select(`
        id, 
        slug, 
        label, 
        tag_type, 
        created_at,
        tags_translations(
          lang_code,
          title,
          detail
        )
      `);
    
    // Add type filter if specified
    if (type) {
      query = query.ilike('tag_type', type);
    }
    
    // Add ordering and range
    query = query.order('created_at', { ascending: false }).range(offset, to);
    
    const { data, error } = await query;

    if (error) {
      console.error('Tags API - Database error:', error);
      return buildMockResponse(limit, offset, type);
    }
    
    // Check if we have any data - if not, use mock data
    if (!data || data.length === 0) {
      console.log('Tags API - No data found, returning empty list');
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }
    
    // Get total count for pagination (with type filter if specified)
    let countQuery = admin
      .from('tags')
      .select('*', { head: true, count: 'exact' });
    
    if (type) {
      countQuery = countQuery.ilike('tag_type', type);
    }
    const { count: total } = await countQuery;
    
    let items = (data || []).map((tag: any) => {
      const translations = Array.isArray(tag.tags_translations) ? tag.tags_translations : [];
      const en = translations.find((t: any) => t.lang_code === 'en');
      const sd = translations.find((t: any) => t.lang_code === 'sd');
      
      const processed = {
        id: String(tag.id),
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type,
        created_at: tag.created_at,
        tags_translations: translations,
        // For backward compatibility, also include direct fields
        englishTitle: en?.title || tag.label,
        sindhiTitle: sd?.title || tag.label,
        englishDetail: en?.detail || '',
        sindhiDetail: sd?.detail || ''
      };
      
      return processed;
    });
    
    // Filter tags based on requested language if needed
    if (lang === 'sd') {
      // For Sindhi locale, prioritize tags that have Sindhi translations
      items.sort((a, b) => {
        const aHasSindhi = a.tags_translations.some((t: any) => t.lang_code === 'sd');
        const bHasSindhi = b.tags_translations.some((t: any) => t.lang_code === 'sd');
        if (aHasSindhi && !bHasSindhi) return -1;
        if (!aHasSindhi && bHasSindhi) return 1;
        return 0;
      });
    }
    
    const response = { items, total: total ?? items.length };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error('Tags API - Error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
