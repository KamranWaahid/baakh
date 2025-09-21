import { NextResponse } from 'next/server';
import { createClient } from '@getSupabaseClient()/getSupabaseClient()-js';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const { data, error } = await getSupabaseClient()
      .from('categories')
      .select('id, slug, content_style, deleted_at, category_details:category_details(cat_name, cat_name_plural, cat_detail, lang)')
      .eq('slug', decodedSlug)
      .is('deleted_at', null)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    const details = Array.isArray((data as any)?.category_details) ? (data as any).category_details : [];
    const en = details.find((d:any)=>d.lang==='en');
    const sd = details.find((d:any)=>d.lang==='sd');
    // lightweight stats
    const { count: poetryCount } = await getSupabaseClient()
      .from('poetry_main')
      .select('*', { head: true, count: 'exact' })
      .eq('category_id', (data as any).id);

    const payload = {
      id: String((data as any).id),
      slug: (data as any).slug as string,
      contentStyle: (data as any).content_style as string,
      englishName: en?.cat_name || '',
      sindhiName: sd?.cat_name || '',
      englishPlural: (en as any)?.cat_name_plural || '',
      sindhiPlural: (sd as any)?.cat_name_plural || '',
      englishDetails: en?.cat_detail || '',
      sindhiDetails: sd?.cat_detail || '',
      languages: [sd ? 'Sindhi' : null, en ? 'English' : null].filter(Boolean),
      poetryCount: poetryCount || 0,
    };
    return NextResponse.json({ category: payload }, { status: 200 });
  } catch (err:any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


