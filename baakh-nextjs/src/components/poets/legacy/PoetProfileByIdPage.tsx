import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import CoupletCard from '@/components/CoupletCard';
import PoetDescriptionModal from '@/components/ui/PoetDescriptionModal';
import { Button } from '@/components/ui/button';
import PoetDetailsClient from '@/components/poets/PoetDetailsClient';

interface PageParams {
  params: { locale: string; id: string };
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

// This is intentionally kept as a server component that mirrors the old [id]/page.tsx for reference/preservation.
export default async function PoetProfileLegacyById({ params }: PageParams) {
  const { locale, id } = params;
  const lang: 'en' | 'sd' = locale === 'sd' ? 'sd' : 'en';
  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const baseUrl = `${proto}://${host}`;

  // Fetch poet core data
  const poetRes = await fetch(`${baseUrl}/api/poets/${encodeURIComponent(id)}?lang=${lang}`, { cache: 'no-store' });
  if (!poetRes.ok) {
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
  const poetPayload = await poetRes.json();
  const poet = poetPayload?.poet || ({} as any);
  const categories = Array.isArray(poetPayload?.categories) ? (poetPayload.categories as any[]) : [];

  const namePrimary = lang === 'sd' ? (poet.sindhi_laqab || poet.sindhi_name || poet.english_name || poet.name) : (poet.english_laqab || poet.english_name || poet.name);
  const tagline = lang === 'sd' ? poet.sindhi_tagline : poet.english_tagline;
  const photo = resolveImageSrc(poet.file_url || poet.photo || null);
  const lifespan = formatLifespan(lang, poet.birth_date, poet.death_date, poet.tags);
  const detail = lang === 'sd' ? (poet.sindhi_details || '') : (poet.english_details || '');

  // Fetch couplets by poet (then filter client-side for standalone if needed)
  const coupletsRes = await fetch(`${baseUrl}/api/couplets/by-poet/${encodeURIComponent(poet.id || id)}?lang=${lang}`, { cache: 'no-store' });
  let couplets: any[] = [];
  let hasMoreCouplets = false;
  if (coupletsRes.ok) {
    const json = await coupletsRes.json();
    const all = Array.isArray(json?.couplets) ? json.couplets : [];
    const standalone = all.filter((c: any) => c.poetry_id == null || c.poetry_id === 0);
    hasMoreCouplets = standalone.length > 4;
    couplets = standalone.slice(0, 4);
  }

  // Fetch other poets for sidebar
  const othersRes = await fetch(`${baseUrl}/api/poets?limit=12&sortBy=is_featured&sortOrder=desc&lang=${lang}`, { cache: 'no-store' });
  let otherPoets: Array<any> = [];
  if (othersRes.ok) {
    const json = await othersRes.json();
    otherPoets = (json?.poets || []).filter((p: any) => String(p.id) !== String(poet.id)).slice(0, 12);
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
                    {photo ? (
                      <Image src={photo} alt={namePrimary} width={112} height={112} className="w-28 h-28 object-cover" />
                    ) : (
                      <span className={`text-2xl font-semibold text-gray-700 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{String(namePrimary || '—').charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className={`text-3xl font-semibold text-gray-900 mb-1 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{namePrimary || '—'}</h1>
                    {tagline && (
                      <p className={`text-gray-600 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{tagline}</p>
                    )}
                    {lifespan && (
                      <p className="text-sm text-gray-500 mt-2">{lifespan}</p>
                    )}
                  </div>
                </div>
                {/* Detail snippet and modal trigger inside header card */}
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
                        slug: String(poet.poet_slug || poet.slug || ''),
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
                  <Button asChild variant="outline" className="h-9 px-4 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium bg-white">
                    <Link href={`/${lang}/couplets?poet=${encodeURIComponent(poet.id || id)}`}>
                      {lang === 'sd' ? 'وڌيڪ ڏسو' : 'See more'}
                    </Link>
                  </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat: any, idx: number) => {
                    const slug = String(cat.slug || cat.category_slug || '');
                    const title = lang === 'sd' ? (cat.sindhi_name || cat.sd_name || cat.name || '') : (cat.english_name || cat.en_name || cat.name || '');
                    return (
                      <Link key={`cat-${slug}-${idx}`} href={`/${lang}/categories/${slug}`} className="block border border-gray-200 rounded-xl bg-white p-4 hover:bg-gray-50">
                        <div className={`text-base text-gray-900 mb-1 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{title || slug}</div>
                        {typeof cat.count === 'number' && (
                          <div className="text-xs text-gray-500">{cat.count} {lang === 'sd' ? 'ڪم' : 'works'}</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
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
                      <Link key={p.id} href={`/${lang}/poets/${p.poet_slug || p.slug || p.id}`} className="block px-3 py-2 rounded-lg hover:bg-gray-50">
                        <div className={`truncate text-sm text-gray-800 ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                          {lang === 'sd' ? (p.sindhi_laqab || p.sindhi_name || p.english_name) : (p.english_laqab || p.english_name)}
                        </div>
                        {p.english_tagline && lang !== 'sd' && (
                          <div className="text-[11px] text-gray-500 truncate">{p.english_tagline}</div>
                        )}
                        {p.sindhi_tagline && lang === 'sd' && (
                          <div className={`text-[11px] text-gray-500 truncate ${lang === 'sd' ? 'auto-sindhi-font' : ''}`}>{p.sindhi_tagline}</div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
