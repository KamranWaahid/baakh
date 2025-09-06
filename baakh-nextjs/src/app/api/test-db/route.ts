import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Test basic table queries
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name, poet_slug')
      .limit(5);

    const { data: poetry, error: poetryError } = await supabase
      .from('poetry_translations')
      .select('poetry_id, title, lang')
      .limit(5);

    const { data: couplets, error: coupletsError } = await supabase
      .from('couplets')
      .select('id, couplet_text, lang, poetry_id')
      .limit(5);

    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, slug, label')
      .limit(5);

    // Test if our custom functions exist
    const { data: poetsSearch, error: poetsSearchError } = await supabase
      .rpc('search_poets_sindhi', { q: 'test' });

    const { data: simpleSearch, error: simpleSearchError } = await supabase
      .rpc('search_simple_ilike', { q: 'test', lang: 'sd' });

    return NextResponse.json({
      success: true,
      tables: {
        poets: {
          data: poets,
          error: poetsError,
          count: poets?.length || 0
        },
        poetry: {
          data: poetry,
          error: poetryError,
          count: poetry?.length || 0
        },
        couplets: {
          data: couplets,
          error: coupletsError,
          count: couplets?.length || 0
        },
        tags: {
          data: tags,
          error: tagsError,
          count: tags?.length || 0
        }
      },
      functions: {
        poetsSearch: {
          data: poetsSearch,
          error: poetsSearchError,
          count: poetsSearch?.length || 0
        },
        simpleSearch: {
          data: simpleSearch,
          error: simpleSearchError,
          count: simpleSearch?.length || 0
        }
      }
    });
  } catch (e) {
    console.error('Database test error', e);
    return NextResponse.json({ 
      success: false, 
      error: 'Database test failed', 
      details: e 
    }, { status: 500 });
  }
}
