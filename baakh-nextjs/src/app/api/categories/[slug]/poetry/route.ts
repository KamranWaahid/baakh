import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(48, Number(searchParams.get('limit') || 12)));
    const offset = Math.max(0, Number(searchParams.get('offset') || 0));
    const to = offset + limit - 1;

    // Detect preferred language from request headers or query params
    const acceptLanguage = req.headers.get('accept-language') || '';
    const preferredLang = searchParams.get('lang') || 
                         (acceptLanguage.includes('sd') ? 'sd' : 'en');

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const { data: cat, error: catErr } = await admin
      .from('categories')
      .select('id')
      .eq('slug', decodedSlug)
      .is('deleted_at', null)
      .single();
    if (catErr || !cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    // First, let's check if we have any poetry in this category
    const { data: poems, error: pErr } = await admin
      .from('poetry_main')
      .select('id, poetry_slug, lang, poetry_tags, created_at, poet_id, category_id')
      .eq('category_id', cat.id)
      .is('deleted_at', null)
      .eq('visibility', true)
      .order('created_at', { ascending: false })
      .range(offset, to);
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    // If no poetry found by category_id, try to find by tags that match the category slug
    let additionalPoems: any[] = [];
    if (!poems || poems.length === 0) {
      const { data: tagPoems, error: tagErr } = await admin
        .from('poetry_main')
        .select('id, poetry_slug, lang, poetry_tags, created_at, poet_id, category_id')
        .ilike('poetry_tags', `%${decodedSlug}%`)
        .is('deleted_at', null)
        .eq('visibility', true)
        .order('created_at', { ascending: false })
        .range(offset, to);
      
      if (!tagErr && tagPoems) {
        additionalPoems = tagPoems;
      }
    }

    // Combine both results
    const allPoems = [...(poems || []), ...additionalPoems];

    const ids = allPoems.map((p:any)=>p.id);
    let titles: Record<string, { title?: string; info?: string; lang?: string }> = {};
    if (ids.length) {
      const { data: tr } = await admin
        .from('poetry_translations')
        .select('poetry_id, title, info, lang')
        .in('poetry_id', ids)
        .or('lang.eq.en,lang.eq.sd');
      
      for (const t of tr || []) {
        const key = String((t as any).poetry_id);
        const currentLang = (t as any).lang;
        
        // Prioritize content in the preferred language
        if (!titles[key] || currentLang === preferredLang) {
          titles[key] = { 
            title: (t as any).title || titles[key]?.title, 
            info: (t as any).info || titles[key]?.info,
            lang: currentLang
          };
        }
      }
    }

    // Fetch poets for display with language preference
    const poetIds = Array.from(new Set(allPoems.map((p:any)=>p.poet_id).filter(Boolean)));
    const poetMap: Record<string, { name: string; lang: string; slug: string }> = {};
    if (poetIds.length) {
      const { data: poets } = await admin.from('poets').select('poet_id, sindhi_laqab, english_laqab, poet_slug, sindhi_name, english_name').in('poet_id', poetIds);
      for (const p of poets || []) {
        const poetId = String((p as any).poet_id);
        const sindhiLaqab = (p as any).sindhi_laqab;
        const englishLaqab = (p as any).english_laqab;
        const sindhiName = (p as any).sindhi_name;
        const englishName = (p as any).english_name;
        const poetSlug = (p as any).poet_slug || 'unknown';
        
        // Debug logging to see what's in the database
        console.log('Raw poet data:', {
          poetId,
          sindhiLaqab,
          englishLaqab,
          sindhiName,
          englishName,
          poetSlug
        });
        
        // Clean up laqab field to get only the first/main name
        const cleanLaqab = (laqab: string) => {
          if (!laqab) return '';
          // Remove common separators and get the first name
          const cleaned = laqab.split(/[،,;|]/)[0].trim();
          console.log('Cleaned laqab:', { original: laqab, cleaned });
          return cleaned;
        };
        
        // Choose laqab (pen name) based on preferred language
        if (preferredLang === 'sd' && sindhiLaqab) {
          poetMap[poetId] = { name: cleanLaqab(sindhiLaqab), lang: 'sd', slug: poetSlug };
        } else if (englishLaqab) {
          poetMap[poetId] = { name: cleanLaqab(englishLaqab), lang: 'en', slug: poetSlug };
        } else if (sindhiLaqab) {
          poetMap[poetId] = { name: cleanLaqab(sindhiLaqab), lang: 'sd', slug: poetSlug };
        } else {
          poetMap[poetId] = { name: 'Unknown', lang: 'en', slug: poetSlug };
        }
        
        console.log('Final poet mapping:', { poetId, finalName: poetMap[poetId].name });
      }
    }

    const items = allPoems.map((p:any) => {
      const key = String(p.id);
      const t = titles[key] || {};
      const poetInfo = poetMap[String(p.poet_id)] || { name: 'Unknown', lang: 'en', slug: 'unknown' };
      const tagList = (p.poetry_tags || '').split(',').map((s:string)=>s.trim()).filter(Boolean);
      
      return {
        id: String(p.id),
        slug: p.poetry_slug as string,
        couplet_slug: p.poetry_slug as string,
        lang: t.lang || p.lang || preferredLang,
        title: t.title || (p.poetry_slug as string),
        info: t.info || '',
        poet: poetInfo.name,
        poet_lang: poetInfo.lang,
        poet_slug: poetInfo.slug, // Use the proper English slug for URLs
        tags: tagList,
        createdAt: p.created_at,
        views: Math.floor(Math.random() * 100) + 50,
        preferred_lang: preferredLang,
      };
    });

    // Calculate total count including both category_id and tag-based matches
    const { count: categoryCount } = await admin
      .from('poetry_main')
      .select('*', { head: true, count: 'exact' })
      .eq('category_id', cat.id)
      .is('deleted_at', null)
      .eq('visibility', true);

    const { count: tagCount } = await admin
      .from('poetry_main')
      .select('*', { head: true, count: 'exact' })
      .ilike('poetry_tags', `%${decodedSlug}%`)
      .is('deleted_at', null)
      .eq('visibility', true);

    const total = (categoryCount || 0) + (tagCount || 0);

    return NextResponse.json({ 
      items, 
      total: total ?? items.length,
      preferred_lang: preferredLang,
      category_slug: decodedSlug
    }, { status: 200 });
  } catch (err:any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


