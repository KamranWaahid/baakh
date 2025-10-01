import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import CoupletCard from '@/components/CoupletCard';
import PoetDetailsClient from '@/components/poets/PoetDetailsClient';
import PoetAvatar from '@/components/poets/PoetAvatar';

interface PageParams {
  params: { locale: string; slug: string };
}

function resolveImageSrc(src?: string | null): string | null {
  if (!src) return null;
  const url = String(src).trim();
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return url;
  if (url.startsWith('public/')) return `/${url.slice(7)}`;
  return `/${url}`;
}

function formatLifespan(lang: 'en' | 'sd', birth?: string | null, death?: string | null, tags?: string[] | null): string {
  const b = birth ? parseInt(String(birth), 10) : NaN;
  const d = death ? parseInt(String(death), 10) : NaN;
  const isWomen = Array.isArray(tags) && tags.some(t => /women|woman|female|عورت|اِرت/i.test(String(t)));
  if (!isNaN(b) && !isNaN(d)) return `${b} - ${d}`;
  if (!isNaN(b) && isNaN(d)) return lang === 'sd' ? `${b} - ${isWomen ? 'جيئري' : 'جيئرو'}` : `${b} - alive`;
  return '';
}

export default async function PoetProfileLegacyBySlug({ params }: PageParams) {
  const { locale, slug } = params;
  const lang: 'en' | 'sd' = locale === 'sd' ? 'sd' : 'en';
  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const baseUrl = `${proto}://${host}`;

  // Try direct database connection first, then fallback to API
  let poet = null;
  let payload = null;
  
  try {
    // Try direct database connection
    const directRes = await fetch(`${baseUrl}/api/poets/${encodeURIComponent(slug)}/direct?lang=${lang}`, { cache: 'no-store' });
    if (directRes.ok) {
      payload = await directRes.json();
      poet = payload?.poet || null;
    }
  } catch (error) {
    console.log('Direct database connection failed, trying API fallback:', error);
  }
  
  // Fallback to backend API if direct connection failed
  if (!poet) {
    try {
      const poetRes = await fetch(`${baseUrl}/api/poets/${encodeURIComponent(slug)}?lang=${lang}`, { cache: 'no-store' });
      if (poetRes.ok) {
        payload = await poetRes.json();
        poet = payload?.poet || null;
      }
    } catch (error) {
      console.log('Backend API also failed:', error);
    }
  }
  
  // If both APIs failed, try to create a basic poet object from the slug
  if (!poet) {
    console.log('Both APIs failed, creating basic poet object for slug:', slug);
    // Create a basic poet object based on the slug
    const basicPoet = {
      id: slug,
      poet_slug: slug,
      slug: slug,
      english_name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      sindhi_name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      english_laqab: '',
      sindhi_laqab: '',
      english_tagline: '',
      sindhi_tagline: '',
      english_details: 'Poet information is being loaded...',
      sindhi_details: 'شاعر جي معلومات لوڊ ٿي رهي آهي...',
      birth_date: null,
      death_date: null,
      birth_place: '',
      file_url: null,
      photo: null,
      tags: [],
      period: '',
      period_name: ''
    };
    poet = basicPoet;
    payload = { poet: basicPoet };
  }
  
  if (!poet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{lang === 'sd' ? 'شاعر نه مليو' : 'Poet not found'}</h1>
          <p className="text-gray-600 mb-6">{lang === 'sd' ? 'مھرباني ڪري ٻيهر ڪوشش ڪريو.' : 'Please try again.'}</p>
          <Link href={`/${lang}/poets`} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800">{lang === 'sd' ? 'واپس' : 'Back to poets'}</Link>
        </div>
      </div>
    );
  }
  if (!poet || (!poet.id && !poet.poet_slug)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{lang === 'sd' ? 'شاعر نه مليو' : 'Poet not found'}</h1>
          <Link href={`/${lang}/poets`} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800">{lang === 'sd' ? 'واپس' : 'Back to poets'}</Link>
        </div>
      </div>
    );
  }

  const namePrimary = lang === 'sd' ? (poet.sindhi_laqab || poet.sindhi_name || poet.english_name || poet.name) : (poet.english_laqab || poet.english_name || poet.name);
  const tagline = lang === 'sd' ? poet.sindhi_tagline : poet.english_tagline;
  const photo = resolveImageSrc(poet.file_url || poet.photo || null);
  const lifespan = formatLifespan(lang, poet.birth_date, poet.death_date, poet.tags);
  const detail = lang === 'sd' ? (poet.sindhi_details || '') : (poet.english_details || '');

  // Couplets by poet id
  const poetId = String(poet.id || '');
  const poetSlugForQuery = String(slug || ''); // Use URL slug instead of poet.poet_slug
  let couplets: any[] = [];
  let hasMoreCouplets = false;
  
  try {
    const coupletsRes = poetSlugForQuery ? await fetch(`${baseUrl}/api/couplets?poet=${encodeURIComponent(poetSlugForQuery)}&lang=${lang}&standalone=1&limit=12&sortBy=created_at&sortOrder=desc`, { cache: 'no-store' }) : ({ ok: false } as any);
    if ((coupletsRes as any).ok) {
      const json = await (coupletsRes as any).json();
      const list = Array.isArray(json?.couplets) ? json.couplets : [];
      hasMoreCouplets = list.length > 4;
      couplets = list.slice(0, 4);
    }
  } catch (error) {
    console.log('Couplets API failed:', error);
    // Set empty couplets array on error
    couplets = [];
    hasMoreCouplets = false;
  }

  // Build categories with up to 4 poetry items per category for this poet
  const categories: any[] = [];
  const catMap: Record<string, { slug: string; id?: string | number; sindhi_name?: string; english_name?: string; items: any[] }>
    = Object.create(null);
  try {
    // Use the URL slug for the API call (this matches the public poets API)
    const poetryListRes = await fetch(`${baseUrl}/api/poetry/by-poet?poetSlug=${encodeURIComponent(slug)}&limit=100&page=1&lang=${lang}`, { cache: 'no-store' });
    console.log('Poetry API response status:', poetryListRes.status);
    if (poetryListRes.ok) {
      const poetryJson = await poetryListRes.json();
      console.log('Poetry API response:', poetryJson);
      const list: any[] = Array.isArray(poetryJson?.poetry) ? poetryJson.poetry : [];
      console.log('Poetry list length:', list.length);
      for (const p of list) {
        const cat = p?.category;
        if (!cat || !cat.slug) continue;
        const key = String(cat.slug);
        if (!catMap[key]) {
          catMap[key] = {
            slug: key,
            id: cat.id,
            sindhi_name: cat?.category_details?.[0]?.cat_name || undefined,
            english_name: cat?.category_details?.[0]?.cat_name || undefined,
            items: []
          };
        }
        if (catMap[key].items.length < 4) {
          catMap[key].items.push(p);
        }
      }
      for (const value of Object.values(catMap)) categories.push(value);
      console.log('Categories built:', categories.length);
    } else {
      console.log('Poetry API error:', await poetryListRes.text());
    }
  } catch (error) {
    console.log('Poetry API exception:', error);
    // ignore errors; categories will be empty
  }

  let otherPoets: Array<any> = [];
  try {
    const othersRes = await fetch(`${baseUrl}/api/poets?limit=6&sortBy=is_featured&sortOrder=desc&lang=${lang}`, { cache: 'no-store' });
    if (othersRes.ok) {
      const json = await othersRes.json();
      otherPoets = (json?.poets || []).filter((p: any) => String(p.id) !== poetId).slice(0, 12);
    }
  } catch (error) {
    console.log('Other poets API failed:', error);
    // Set empty other poets array on error
    otherPoets = [];
  }

  // Load Sindhi tag translations from DB when on /sd
  const tagTranslationMap: Record<string, string> = Object.create(null);
  const normalizeKey = (s: string) => s.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const addVariants = (key: string, value: string) => {
    const norm = normalizeKey(key);
    tagTranslationMap[norm] = value;
    // hyphen variant
    tagTranslationMap[norm.replace(/\s+/g, '-')] = value;
    // singular/plural variants
    if (norm.endsWith('s')) tagTranslationMap[norm.replace(/s$/, '')] = value;
    else tagTranslationMap[`${norm}s`] = value;
  };
  if (lang === 'sd') {
    try {
      const tagRes = await fetch(`${baseUrl}/api/tags?lang=sd&type=Poet`, { cache: 'no-store' });
      if (tagRes.ok) {
        const tagJson: any = await tagRes.json();
        const tags: any[] = Array.isArray(tagJson?.tags) ? tagJson.tags : [];
        for (const t of tags) {
          const title = String(t.title || '');
          const slug = String(t.slug || '');
          const label = String(t.label || '');
          if (title) {
            if (slug) addVariants(slug, title);
            if (label) addVariants(label, title);
            addVariants(title, title);
          }
        }
      }
    } catch (error) {
      console.log('Tags API failed:', error);
      // Continue without tag translations
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main content */}
          <div className="lg:col-span-8">
            {/* Header Card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    <PoetAvatar src={photo} alt={namePrimary} size={112} fallbackInitial={String(namePrimary || '—')} isSindhi={lang === 'sd'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className={`text-3xl font-semibold text-gray-900 mb-1 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{namePrimary || '—'}</h1>
                    {tagline && (
                      <p className={`text-gray-600 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{tagline}</p>
                    )}
                    {lifespan && (
                      <p className="text-sm text-gray-500 mt-2">{lifespan}</p>
                    )}
                    {detail && (
                      <p className={`mt-3 text-sm text-gray-700 leading-relaxed line-clamp-2 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
                <PoetDetailsClient
                  poet={{
                    name: String(namePrimary || ''),
                    sindhiName: String(poet.sindhi_name || ''),
                    englishName: String(poet.english_name || ''),
                    sindhi_laqab: poet.sindhi_laqab,
                    english_laqab: poet.english_laqab,
                    sindhi_takhalus: poet.sindhi_takhalus,
                    english_takhalus: poet.english_takhalus,
                    longDescription: poet.longDescription,
                    sindhi_details: poet.sindhi_details,
                    english_details: poet.english_details,
                    period: String(poet.period || poet.period_name || ''),
                    location: String(poet.birth_place || ''),
                    locationSd: String(poet.birth_place || ''),
                    locationEn: String(poet.birth_place || ''),
                    birth_date: poet.birth_date || null,
                    death_date: poet.death_date || null,
                    birth_place: poet.birth_place || null,
                    death_place: poet.death_place || null,
                  }}
                  isSindhi={lang === 'sd'}
                  snippet={detail}
                  buttonLabel={lang === 'sd' ? 'وڌيڪ تفصيل ڏسو' : 'View more details'}
                />
              </div>
            </section>

            {/* Couplets */}
            <section className="mb-10">
              <h2 className={`text-[22px] leading-snug text-gray-900 font-normal mb-4 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                {lang === 'sd' ? 'چونڊ شعر' : 'Selected Couplets'}
              </h2>
              {couplets.length === 0 ? (
                <div className="text-gray-500 text-sm">{lang === 'sd' ? 'شاعر جا ڪو به آزاد شعر موجود ناهن' : 'No standalone couplets available.'}</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {couplets.map((c: any, index: number) => (
                    <CoupletCard key={`c-${c.id || index}`} couplet={{
                      id: Number(c.id || 0),
                      couplet_text: String(c.couplet_text || ''),
                      couplet_slug: String(c.couplet_slug || ''),
                      lang: String(c.lang || lang),
                      lines: Array.isArray(c.lines) ? c.lines : String(c.couplet_text || '').split('\n').slice(0, 2),
                      tags: Array.isArray(c.tags) ? c.tags : [],
                      poet: {
                        name: String(poet.english_name || poet.sindhi_name || 'Poet'),
                        slug: String(poet.poet_slug || poet.slug || slug),
                        photo: poet.photo || poet.file_url || null
                      },
                      created_at: String(c.created_at || new Date().toISOString()),
                      likes: Number(c.likes || 0),
                      views: Number(c.views || 0)
                    }} isSindhi={lang === 'sd'} index={index} />
                  ))}
                </div>
              )}
              {hasMoreCouplets && (
                <div className="mt-6">
              <Link href={`/${lang}/couplets?poet=${encodeURIComponent(poetSlugForQuery)}`} className="inline-flex h-9 items-center rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:border-black hover:text-black">
                    {lang === 'sd' ? 'وڌيڪ ڏسو' : 'See more'}
                  </Link>
                </div>
              )}
            </section>

            {/* Categories */}
            <section className="mb-10">
              <h2 className={`text-[22px] leading-snug text-gray-900 font-normal mb-4 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                {lang === 'sd' ? 'صنفون' : 'Categories'}
              </h2>
              {categories.length === 0 ? (
                <div className="text-gray-500 text-sm">{lang === 'sd' ? 'ڪو به صنف موجود ناهي' : 'No categories available.'}</div>
              ) : (
                <div className="space-y-6">
                  {categories.map((cat: any, idx: number) => {
                    const cslug = String(cat.slug);
                    const title = lang === 'sd' ? (cat.sindhi_name || cslug) : (cat.english_name || cslug);
                    const items = Array.isArray(cat.items) ? cat.items : [];
                    return (
                      <div key={`cat-${cslug}-${idx}`} className="border border-gray-200 rounded-xl bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`text-base text-gray-900 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{title}</div>
                          <Link href={`/${lang}/categories/${cslug}`} className="inline-flex h-9 items-center rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:border-black hover:text-black">{lang === 'sd' ? 'سڀ ڏسو' : 'View all'}</Link>
                        </div>
                        {items.length === 0 ? (
                          <div className="text-xs text-gray-500">{lang === 'sd' ? 'ڪو ڪم موجود ناهي' : 'No works available.'}</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map((p: any, i: number) => (
                              <Link key={`poem-${cslug}-${i}-${p.id}`} href={`/${lang}/poets/${slug}/form/${cslug}/${p.slug}`} className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                                <div className={`text-sm text-gray-900 mb-1 hover:underline ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{p.title}</div>
                                {p.description && (
                                  <div className="text-xs text-gray-500 line-clamp-2">{p.description}</div>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            {/* Tags Card */}
            {Array.isArray((poet as any)?.tags) && (poet as any).tags.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="p-5">
                  <h3 className={`text-sm font-semibold text-gray-900 mb-3 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                    {lang === 'sd' ? 'ٽڪليون' : 'Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.from(new Set(
                      ((poet as any).tags as unknown[])
                        .filter((t: unknown): t is string => typeof t === 'string')
                        .map((t: string) => t.trim())
                        .filter((t: string) => Boolean(t))
                    )) as string[]).slice(0, 20).map((tag: string, idx: number) => {
                      const colorClasses = [
                        'bg-blue-50 text-blue-700 border-blue-200',
                        'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'bg-amber-50 text-amber-800 border-amber-200',
                        'bg-violet-50 text-violet-700 border-violet-200',
                        'bg-rose-50 text-rose-700 border-rose-200',
                        'bg-cyan-50 text-cyan-700 border-cyan-200'
                      ];
                      const cls = colorClasses[idx % colorClasses.length];
                      const key = normalizeKey(tag);
                      const displayTag = lang === 'sd' ? (tagTranslationMap[key] || tag) : tag;
                      return (
                        <Link
                          key={`tag-${idx}-${tag}`}
                          href={`/${lang}/tags/${encodeURIComponent(normalizeKey(tag).replace(/\s+/g,'-'))}`}
                          className={`inline-block px-3 py-1.5 text-xs rounded-full border ${cls} ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}
                        >
                          {displayTag}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5">
                <h3 className={`text-sm font-semibold text-gray-900 mb-3 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                  {lang === 'sd' ? 'ٻيا شاعر' : 'Other Poets'}
                </h3>
                <div className="space-y-2">
                  {otherPoets.length === 0 ? (
                    <div className="text-gray-500 text-sm">{lang === 'sd' ? 'ڪو به شاعر ناهي' : 'No poets found'}</div>
                  ) : (
                    otherPoets.map((p: any) => (
                      <Link key={p.id} href={`/${lang}/poets/${p.poet_slug || p.slug || p.id}`} className="block px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            <PoetAvatar 
                              src={resolveImageSrc(p.file_url || p.photo || null)} 
                              alt={String(p.english_name || p.sindhi_name || 'Poet')} 
                              size={32}
                              fallbackInitial={String(p.sindhi_laqab || p.sindhi_name || p.english_laqab || p.english_name || 'P')}
                              isSindhi={lang === 'sd'}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className={`truncate text-sm text-gray-800 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                              {lang === 'sd' ? (p.sindhi_laqab || p.sindhi_name || p.english_name) : (p.english_laqab || p.english_name)}
                            </div>
                            {p.english_tagline && lang !== 'sd' && (
                              <div className="text-[11px] text-gray-500 truncate">{p.english_tagline}</div>
                            )}
                            {p.sindhi_tagline && lang === 'sd' && (
                              <div className={`text-[11px] text-gray-500 truncate ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{p.sindhi_tagline}</div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  <div className="mt-3">
                    <Link href={`/${lang}/poets`} className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 h-9 text-sm font-medium text-gray-700 hover:text-black">
                      {lang === 'sd' ? 'وڌيڪ ڏسو' : 'View more poets'}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
