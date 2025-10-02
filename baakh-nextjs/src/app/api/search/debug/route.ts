export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rewriteQuery } from '@/lib/search/rewrite';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const lang = (searchParams.get('lang') || 'en').toLowerCase() === 'sd' ? 'sd' : 'en';

    if (!q) {
      return NextResponse.json({ error: 'No query provided' });
    }

    const supabase = createAdminClient();

    // Debug the query rewrite
    const rq = rewriteQuery(q, lang);
    console.log('Query rewrite:', rq);

    // Test direct database queries
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, sindhi_laqab, english_laqab, sindhi_takhalus, english_takhalus, sindhi_tagline, english_tagline, poet_slug')
      .or(`sindhi_name.ilike.%${q}%,english_name.ilike.%${q}%,sindhi_laqab.ilike.%${q}%,english_laqab.ilike.%${q}%,sindhi_takhalus.ilike.%${q}%,english_takhalus.ilike.%${q}%,sindhi_tagline.ilike.%${q}%,english_tagline.ilike.%${q}%`);

    const { data: poetsFts, error: poetsFtsError } = await supabase
      .rpc('search_poets_sindhi', { q: q });

    const { data: poetry, error: poetryError } = await supabase
      .from('poetry_translations')
      .select('poetry_id, title, lang')
      .eq('lang', lang)
      .ilike('title', `%${q}%`);

    const { data: poetryFts, error: poetryFtsError } = await supabase
      .rpc('search_poetry_sindhi', { q: q, lang });

    const { data: couplets, error: coupletsError } = await supabase
      .from('couplets')
      .select('id, couplet_text, lang, poetry_id')
      .eq('lang', lang)
      .ilike('couplet_text', `%${q}%`);

    const { data: coupletsFts, error: coupletsFtsError } = await supabase
      .rpc('search_couplets_sindhi', { q: q, lang });

    const { data: simpleSearch, error: simpleSearchError } = await supabase
      .rpc('search_simple_ilike', { q: q, lang });

    return NextResponse.json({
      query: q,
      lang,
      rewrite: rq,
      poets: {
        data: poets,
        error: poetsError,
        count: poets?.length || 0
      },
      poetsFts: {
        data: poetsFts,
        error: poetsFtsError,
        count: poetsFts?.length || 0
      },
      poetry: {
        data: poetry,
        error: poetryError,
        count: poetry?.length || 0
      },
      poetryFts: {
        data: poetryFts,
        error: poetryFtsError,
        count: poetryFts?.length || 0
      },
      couplets: {
        data: couplets,
        error: coupletsError,
        count: couplets?.length || 0
      },
      coupletsFts: {
        data: coupletsFts,
        error: coupletsFtsError,
        count: coupletsFts?.length || 0
      },
      simpleSearch: {
        data: simpleSearch,
        error: simpleSearchError,
        count: simpleSearch?.length || 0
      }
    });
  } catch (e) {
    console.error('Debug search error', e);
    return NextResponse.json({ error: 'Debug search failed', details: e }, { status: 500 });
  }
}
