export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const lang = (searchParams.get('lang') || 'en').toLowerCase() === 'sd' ? 'sd' : 'en';

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createAdminClient();
    const results: any[] = [];

    // Search poets
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, poet_slug, file_url')
      .or(`sindhi_name.ilike.%${q}%,english_name.ilike.%${q}%`)
      .limit(5);

    if (poets && !poetsError) {
      for (const poet of poets) {
        results.push({
          id: String(poet.poet_id),
          type: 'poet',
          title: lang === 'sd' ? (poet.sindhi_name || poet.english_name) : (poet.english_name || poet.sindhi_name),
          subtitle: lang === 'sd' ? 'شاعر' : 'Poet',
          url: `/${lang}/poets/${poet.poet_slug || poet.poet_id}`,
          imageUrl: poet.file_url || null,
        });
      }
    }

    // Search poetry
    const { data: poetry, error: poetryError } = await supabase
      .from('poetry_translations')
      .select('poetry_id, title, lang')
      .eq('lang', lang)
      .ilike('title', `%${q}%`)
      .limit(5);

    if (poetry && !poetryError) {
      for (const poem of poetry) {
        results.push({
          id: String(poem.poetry_id),
          type: 'poem',
          title: poem.title,
          subtitle: lang === 'sd' ? 'شاعري' : 'Poetry',
          url: `/${lang}/poetry/${poem.poetry_id}`,
        });
      }
    }

    // Search tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, slug, label')
      .or(`label.ilike.%${q}%,slug.ilike.%${q}%`)
      .limit(3);

    if (tags && !tagsError) {
      for (const tag of tags) {
        results.push({
          id: String(tag.id),
          type: 'tag',
          title: tag.label || tag.slug,
          subtitle: lang === 'sd' ? 'موضوع' : 'Topic',
          url: `/${lang}/topics/${tag.slug}`,
        });
      }
    }

    console.log('Simple search results:', {
      query: q,
      lang,
      poets: poets?.length || 0,
      poetry: poetry?.length || 0,
      tags: tags?.length || 0,
      total: results.length
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error('Simple search error', e);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
