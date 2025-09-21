import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient() = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const tagTypeRaw = searchParams.get('type') || 'Poet';
    const normalizedType = (tagTypeRaw || '').trim().toLowerCase();
    const tagType = normalizedType === 'topic' || normalizedType === 'topics'
      ? 'Topic'
      : normalizedType === 'poet' || normalizedType === 'poets'
        ? 'Poet'
        : tagTypeRaw;
    const limitParam = parseInt(searchParams.get('limit') || '18', 10);
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 18 : limitParam));
    const offset = Math.max(0, isNaN(offsetParam) ? 0 : offsetParam);

    console.log('=== TAGS API ROUTE STARTED ===');
    console.log('Language:', lang);
    console.log('Tag Type:', tagType);

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here') {
      console.warn('Supabase not configured - returning 503');
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure Supabase environment variables'
      }, { status: 503 });
    }

    // Fetch tags with their translations
    const { data: tags, error: tagsError } = await getSupabaseClient()
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
      `)
      .ilike('tag_type', tagType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return NextResponse.json({ 
        error: 'Failed to fetch tags',
        details: tagsError.message 
      }, { status: 500 });
    }

    // Fallback Sindhi titles for common slugs when translations are missing
    const sdFallback: Record<string, string> = {
      'love': 'محبت',
      'wisdom': 'حڪمت',
      'life': 'زندگي',
      'death': 'موت',
      'faith': 'ايمان',
      'hope': 'اميد',
      'patience': 'صبرو',
      'friendship': 'دوستي',
      'nature': 'فطرت',
      'freedom': 'آزادي',
      'justice': 'انصاف',
      'peace': 'امن',
      'social-justice': 'سماجي انصاف',
      'sufism': 'تصوف',
      'homeland': 'وطن',
      'culture': 'ثقافت',
      'religion': 'مذهب',
      'poetry': 'شاعري',
      'literature': 'ادب',
      'beauty': 'خوبصورتي',
      'sorrow': 'غم',
      'happiness': 'خوشي',
      'time': 'وقت',
      'youth': 'جواني',
      'old-age': 'ڏاڙهپ',
      'mother': 'ماءُ',
      'father': 'پيءُ',
      'child': 'ٻار',
      'woman': 'عورت',
      'man': 'مرد',
      'heart': 'دل',
      'soul': 'روح',
      'mind': 'دماغ',
      'eyes': 'اکيون',
      'tears': 'آنسو',
      'smile': 'مسڪر',
      'dream': 'سپنو',
      'reality': 'حقيقت',
      'truth': 'سچ',
      'lie': 'ڪوڙ',
      'good': 'سٺو',
      'bad': 'خراب',
      'right': 'صحيح',
      'wrong': 'غلط',
      'light': 'روشني',
      'darkness': 'اندھيرو',
      'day': 'ڏينهن',
      'night': 'رات',
      'morning': 'صبح',
      'evening': 'شام',
      'spring': 'بسنت',
      'summer': 'گرمي',
      'winter': 'سردي',
      'autumn': 'خزاں',
      'rain': 'مينهن',
      'sun': 'سج',
      'moon': 'چنڊ',
      'stars': 'تارا',
      'sky': 'آسمان',
      'earth': 'زمين',
      'water': 'پاڻي',
      'fire': 'باڻ',
      'wind': 'هوا',
      'flower': 'پھول',
      'tree': 'وڻ',
      'bird': 'پکي',
      'river': 'درياءُ',
      'mountain': 'پهاڙ',
      'sea': 'سمنڊ',
      'desert': 'ريگستان',
      'forest': 'جنگل',
      'garden': 'باغ',
      'home': 'گھر',
      'village': 'ڳوٺ',
      'city': 'شھر',
      'country': 'ملڪ',
      'world': 'دنيا',
      'universe': 'ڪائنات'
    };

    // Transform the data to a more usable format
    const transformedTags = tags?.map(tag => {
      const translations = Array.isArray(tag.tags_translations) ? [...tag.tags_translations] : [];
      const existing = translations.find((t: any) => t.lang_code === lang);
      const fallbackTitle = lang === 'sd' ? (sdFallback[tag.slug] || tag.label) : tag.label;
      // Use fallback if existing title is just the slug (not a proper translation)
      const title = (existing?.title && existing.title !== tag.slug) ? existing.title : fallbackTitle;
      const detail = existing?.detail || '';

      // Ensure a translation object exists for the requested lang so UI can pick it
      if (!existing) {
        translations.push({ lang_code: lang, title, detail });
      }

      return {
        id: tag.id,
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type,
        created_at: tag.created_at,
        tags_translations: translations,
        title,
        detail,
        lang_code: lang
      };
    }) || [];

    console.log('=== TAGS API SUCCESS ===');
    console.log('Tags fetched:', transformedTags.length);

    return NextResponse.json({
      tags: transformedTags,
      total: transformedTags.length,
      language: lang,
      type: tagType,
      limit,
      offset
    });

  } catch (error) {
    console.error('Tags API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, label, tag_type = 'Poet', translations } = body;

    if (!slug || !label || !translations) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the main tag
    const { data: tagData, error: tagError } = await getSupabaseClient()
      .from('tags')
      .insert({
        slug,
        label,
        tag_type
      })
      .select('id')
      .single();

    if (tagError) {
      console.error('Error creating tag:', tagError);
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }

    // Insert translations
    const translationInserts = Object.entries(translations).map(([lang_code, translation]: [string, any]) => ({
      tag_id: tagData.id,
      lang_code,
      title: translation.title,
      detail: translation.detail || ''
    }));

    const { error: translationError } = await getSupabaseClient()
      .from('tags_translations')
      .insert(translationInserts);

    if (translationError) {
      console.error('Error creating translations:', translationError);
      return NextResponse.json({ error: 'Failed to create translations' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Tag created successfully', 
      id: tagData.id 
    });

  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}