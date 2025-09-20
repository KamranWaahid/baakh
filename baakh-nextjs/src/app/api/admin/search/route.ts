import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ results: [] });

    const supabase = createAdminClient();

    // Parallel admin search across core entities
    const [poetsRes, poetryRes, tagsRes] = await Promise.all([
      supabase
        .from('poets')
        .select('id, english_name, sindhi_name, poet_slug')
        .or(`english_name.ilike.%${q}%,sindhi_name.ilike.%${q}%,poet_slug.ilike.%${q}%`)
        .limit(5),
      supabase
        .from('poetry_main')
        .select('id, english_title, poetry_slug, poets(english_name, poet_slug)')
        .or(`english_title.ilike.%${q}%,poetry_slug.ilike.%${q}%`)
        .limit(5),
      supabase
        .from('tags')
        .select('id, label, slug')
        .or(`label.ilike.%${q}%,slug.ilike.%${q}%`)
        .limit(5)
    ]);

    const results: Array<{ id: string; title: string; type: string; href: string }> = [];

    (poetsRes.data || []).forEach((p: any) => {
      results.push({
        id: `poet-${p.id}`,
        title: p.english_name || p.sindhi_name || p.poet_slug,
        type: 'poet',
        href: `/admin/poets`
      });
    });

    (poetryRes.data || []).forEach((poem: any) => {
      results.push({
        id: `poetry-${poem.id}`,
        title: poem.english_title || poem.poetry_slug,
        type: 'poetry',
        href: `/admin/poetry`
      });
    });

    (tagsRes.data || []).forEach((t: any) => {
      results.push({
        id: `tag-${t.id}`,
        title: t.label || t.slug,
        type: 'tag',
        href: `/admin/tags`
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}



