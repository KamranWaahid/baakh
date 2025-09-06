"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, BookOpen, Languages, Sparkles, Hash, Filter, ChevronDown, Bookmark, Share2, Heart, User, Calendar, Eye, Clock, Star, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLanguageConfig } from '@/lib/language';

type Cat = { id:string; slug:string; englishName:string; sindhiName:string; englishPlural?:string; sindhiPlural?:string; englishDetails:string; sindhiDetails:string; languages:string[]; contentStyle:string };

// Updated to match the poetry page structure
interface Poem {
  id: string;
  slug: string;
  couplet_slug?: string;
  lang: string;
  title: string;
  info: string;
  poet: string;
  tags: string[];
  createdAt: string;
  views?: number;
  // Add fields to match poetry page structure
  poetry_slug?: string;
  poet_slug?: string;
  category?: string;
  category_slug?: string;
  is_featured?: boolean;
  likes?: number;
  bookmarks?: number;
}

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string; locale: string }>();
  const [category, setCategory] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [poems, setPoems] = useState<Poem[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Enhanced locale detection
  const currentLocale = useMemo(() => {
    if (params?.locale) return params.locale;
    if (pathname?.startsWith('/sd')) return 'sd';
    if (pathname?.startsWith('/en')) return 'en';
    return 'en'; // Default fallback
  }, [params?.locale, pathname]);
  
  const isSD = currentLocale === 'sd';
  const isEN = currentLocale === 'en';
  
  // Get language configuration
  const langConfig = getLanguageConfig(currentLocale);
  const t = langConfig.translations;
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = 12;

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(params.slug)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!ignore && res.ok) setCategory(json.category as Cat);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [params?.slug]);

  async function fetchPoetry() {
    if (!params?.slug) return;
    setLoading(true);
    try {
      const offset = (page - 1) * perPage;
      const res = await fetch(`/api/categories/${encodeURIComponent(String(params.slug))}/poetry?limit=${perPage}&offset=${offset}&lang=${currentLocale}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) {
        const next = (json.items || []) as Poem[];
        // Transform the data to match the poetry page structure
        const transformedPoems = next.map(poem => {
          // Debug logging to see what's received from API
          console.log('API response for poem:', {
            id: poem.id,
            title: poem.title,
            poet: poem.poet,
            poet_slug: poem.poet_slug
          });
          
          return {
            ...poem,
            poetry_slug: poem.slug,
            poet_slug: poem.poet_slug || 'unknown',
            category: params.slug,
            category_slug: params.slug,
            lang: poem.lang || currentLocale,
            title: poem.title || poem.slug,
            info: poem.info || '',
            tags: poem.tags || [],
            createdAt: poem.createdAt || new Date().toISOString(),
            views: poem.views || 0,
          };
        });
        
        setPoems(transformedPoems);
        setTotal(Number(json.total || 0));
      }
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchPoetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, params?.slug, currentLocale]);

  const filteredPoems = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return poems;
    return poems.filter(p => (
      p.title.toLowerCase().includes(term) ||
      (p.info||'').toLowerCase().includes(term) ||
      p.poet.toLowerCase().includes(term) ||
      p.tags.join(' ').toLowerCase().includes(term)
    ));
  }, [poems, q]);

  const title = useMemo(() => {
    if (!category) return '';
    return isSD ? (category.sindhiName || category.englishName || category.slug) : (category.englishName || category.sindhiName || category.slug);
  }, [category, isSD]);
  const details = useMemo(() => {
    if (!category) return '';
    return isSD ? (category.sindhiDetails || category.englishDetails || '') : (category.englishDetails || category.sindhiDetails || '');
  }, [category, isSD]);

  // Poetry Card Component - matching the poetry page structure
  const PoetryCard = ({ poem, index }: { poem: Poem; index: number }) => (
    <motion.div
      key={poem.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className="group"
    >
      <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none h-full">
        <CardContent className="p-6">
          {/* Poetry Content */}
          <div className="space-y-3 mb-5">
            <div className="space-y-2">
              <Link 
                href={`/${currentLocale}/poets/${poem.poet_slug || 'unknown'}/form/${poem.category_slug || 'poetry'}/${poem.poetry_slug || poem.slug}`} 
                className="block group"
              >
                <h3 className={`text-base font-medium text-gray-900 line-clamp-2 leading-tight hover:text-gray-700 hover:underline transition-colors ${langConfig.fontClass}`}>
                  {poem.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-gray-600" />
              </div>
                             <Badge variant="secondary" className={`text-xs px-2.5 py-1 bg-gray-100 text-gray-700 border-0 rounded-full font-normal ${langConfig.fontClass}`}>
                 {isSD && category?.sindhiName ? category.sindhiName : (poem.category || params.slug)}
               </Badge>
            </div>
            {poem.is_featured && (
              <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-2.5 py-1 rounded-full">
                <Star className="h-3 w-3 mr-1" />
                <span className={`text-xs font-medium ${langConfig.fontClass}`}>
                  {t.featured}
                </span>
              </Badge>
            )}
          </div>

          {/* Tags */}
          {poem.tags && poem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {poem.tags.slice(0, 3).map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className={`inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-normal ${langConfig.fontClass}`}
                >
                  {tag}
                </span>
              ))}
              {poem.tags.length > 3 && (
                <span className={`inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full border border-gray-200 font-normal ${langConfig.fontClass}`}>
                  +{poem.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Poet Info */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <Link 
                href={`/${currentLocale}/poets/${poem.poet_slug || 'unknown'}`}
                className="group/poet cursor-pointer"
              >
                <Avatar className="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm group-hover/poet:shadow-md group-hover/poet:border-gray-300 group-hover/poet:scale-105 transition-all duration-200">
                  <AvatarFallback className={`text-sm font-semibold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 ${langConfig.fontClass}`}>
                    {poem.poet.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/${currentLocale}/poets/${poem.poet_slug || 'unknown'}`}
                  className="block"
                >
                  <p className={`text-sm text-gray-900 font-medium truncate hover:text-gray-700 hover:underline transition-all duration-200 ${langConfig.fontClass}`}>
                    {poem.poet}
                  </p>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span className={langConfig.fontClass}>
                {t.readingTime}
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <Bookmark className="w-4 h-4 text-gray-600 hover:text-blue-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-4 h-4 text-gray-600 hover:text-green-500" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3.5 w-3.5" />
              <span className={langConfig.fontClass}>{poem.views || Math.floor(Math.random() * 100) + 50}</span>
            </div>
          </div>

          {/* View Poetry Button */}
          <Button 
            asChild 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-full py-2.5 transition-all duration-200 mt-5" 
            size="sm"
          >
            <Link href={`/${currentLocale}/poets/${poem.poet_slug || 'unknown'}/form/${poem.category_slug || 'poetry'}/${poem.poetry_slug || poem.slug}`}>
              <span className={`font-medium text-sm ${langConfig.fontClass}`}>
                {t.viewPoetry}
              </span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Skeleton loader component for poetry cards
  const PoetryCardSkeleton = () => (
    <div className="animate-pulse">
      <Card className="h-full border border-gray-200 bg-white overflow-hidden">
        {/* Header skeleton */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <CardContent className="p-6">
          {/* Poet info skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" dir={langConfig.direction}>
      <main className="pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="py-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isSD ? 'auto-sindhi-font h1' : ''}`} dir={isSD ? 'rtl' : 'ltr'}>
                    {loading ? <Skeleton className="h-8 w-64"/> : title}
                  </h1>
                  {!isSD && category?.sindhiName && (
                    <p className="text-lg md:text-xl text-muted-foreground mt-1 leading-snug auto-sindhi-font card-text" dir="rtl">{category.sindhiName}</p>
                  )}
                  {(category?.englishPlural || category?.sindhiPlural) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(category?.englishPlural || '')} {category?.sindhiPlural ? <span className="auto-sindhi-font stats-text" dir="rtl">· {category.sindhiPlural}</span> : null}
                    </div>
                  )}
                  <div className="mt-2 flex gap-1.5">
                    {(category?.languages || []).map(L => (
                      <Badge 
                        key={L} 
                        variant={L==='Sindhi'?'secondary':'outline'} 
                        className="text-[10px] rounded-full px-2.5 py-0.5 bg-white text-gray-700 border border-gray-200"
                      >
                        {L}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Description & Meta */}
          <section className="mt-2">
            <Card className="rounded-[12px] border border-gray-200/50 bg-white shadow-none">
              <CardContent className="p-5">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <>
                    <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${isSD ? 'auto-sindhi-font card-text' : ''}`} dir={isSD ? 'rtl' : 'ltr'}>{details || '—'}</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                      <div className="rounded-lg border border-gray-200/50 p-3 bg-white">
                        <div className={`uppercase tracking-wide ${langConfig.fontClass}`}>
                          {isSD ? 'اندراجات' : 'Entries'}
                        </div>
                        <div className="text-lg text-foreground">{total}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200/50 p-3 bg-white">
                        <div className={`uppercase tracking-wide ${langConfig.fontClass}`}>
                          {isSD ? 'ٻوليون' : 'Languages'}
                        </div>
                        <div className="text-foreground">{(category?.languages || []).join(' · ') || '—'}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200/50 p-3 bg-white">
                        <div className={`uppercase tracking-wide ${langConfig.fontClass}`}>
                          {isSD ? 'انداز' : 'Style'}
                        </div>
                        <div className="text-foreground">{category?.contentStyle || '—'}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200/50 p-3 bg-white">
                        <div className={`uppercase tracking-wide ${langConfig.fontClass}`}>
                          {isSD ? 'سلاگ' : 'Slug'}
                        </div>
                        <div className="inline-flex items-center gap-1 text-foreground">
                          <Hash className="w-3 h-3"/> {category?.slug}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Poetry Controls */}
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={()=>setShowFilters(v=>!v)} className="inline-flex items-center gap-1 border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-black hover:text-black transition-all duration-200 rounded-xl">
                  <Filter className="w-4 h-4"/> 
                  <span className={langConfig.fontClass}>{t.filter}</span> 
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                </Button>
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={langConfig.fontClass}>{t.search}</span>
                  <input 
                    value={q} 
                    onChange={(e)=>setQ(e.target.value)} 
                    placeholder={t.searchPlaceholder} 
                    className={`px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs w-64 focus:border-gray-300 focus:ring-0 transition-all duration-200 ${langConfig.fontClass}`} 
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-black hover:text-black transition-all duration-200 rounded-full">
                <span className={langConfig.fontClass}>{t.viewAll}</span>
              </Button>
            </div>
            {showFilters && (
              <div className="mt-3 p-4 rounded-[12px] bg-gray-50 border border-gray-200/50">
                <div className="md:hidden mb-3">
                  <input 
                    value={q} 
                    onChange={(e)=>setQ(e.target.value)} 
                    placeholder={t.searchPlaceholder} 
                    className={`px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm w-full focus:border-gray-300 focus:ring-0 transition-all duration-200 ${langConfig.fontClass}`} 
                  />
                </div>
                <div className={`text-xs text-muted-foreground ${langConfig.fontClass}`}>
                  {t.moreFiltersComing}
                </div>
              </div>
            )}
          </section>

          {/* Poetry list */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-xl font-semibold ${langConfig.fontClass}`}>
                {t.poetry}
              </h2>
                      </div>

            {loading ? (
              // Show skeleton loaders while loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <PoetryCardSkeleton />
                  </motion.div>
                            ))}
                          </div>
            ) : filteredPoems.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                              </div>
                <p className={`text-gray-500 text-xl ${langConfig.fontClass}`}>
                  {t.noPoetryFound}
                </p>
                          </div>
                        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoems.map((poem, index) => (
                  <PoetryCard key={poem.id} poem={poem} index={index} />
                          ))}
                        </div>
            )}
            
            {/* Pagination from Poetry Page */}
            {!loading && total > 0 && Math.ceil(total / perPage) > 1 && (
              <motion.div 
                className="flex justify-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    size="lg"
                    className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                  >
                    <span className={`font-medium ${langConfig.fontClass}`}>
                      {isSD ? '→' : '←'}
                    </span>
                  </Button>
                  
                  {/* Dynamic Page Numbers */}
                  {(() => {
                    const totalPages = Math.ceil(total / perPage);
                    const pages = [];
                    let startPage = 1;
                    let endPage = totalPages;
                    
                    if (totalPages <= 5) {
                      // Show all pages if total is 5 or less
                      startPage = 1;
                      endPage = totalPages;
                    } else if (page <= 3) {
                      // Show first 5 pages when on pages 1-3
                      startPage = 1;
                      endPage = 5;
                    } else if (page >= totalPages - 2) {
                      // Show last 5 pages when near the end
                      startPage = totalPages - 4;
                      endPage = totalPages;
                    } else {
                      // Show 5 pages centered around current page
                      startPage = page - 2;
                      endPage = page + 2;
                    }
                    
                    // Add first page if not in range
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key="first"
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          size="lg"
                          className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3"
                        >
                          <span className={langConfig.fontClass}>1</span>
                        </Button>
                      );
                      
                      // Add ellipsis if there's a gap
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className={`px-6 py-3 text-gray-500 ${langConfig.fontClass}`}>
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Add page numbers in range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={i === page ? "default" : "outline"}
                          onClick={() => handlePageChange(i)}
                          size="lg"
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            i === page 
                              ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg" 
                              : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <span className={langConfig.fontClass}>{i}</span>
                        </Button>
                      );
                    }
                    
                    // Add last page if not in range
                    if (endPage < totalPages) {
                      // Add ellipsis if there's a gap
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className={`px-6 py-3 text-gray-500 ${langConfig.fontClass}`}>
                            ...
                          </span>
                        );
                      }
                      
                      pages.push(
                        <Button
                          key="last"
                          variant="outline"
                          onClick={() => handlePageChange(totalPages)}
                          size="lg"
                          className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3"
                        >
                          <span className={langConfig.fontClass}>{totalPages}</span>
                        </Button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === Math.ceil(total / perPage)}
                    size="lg"
                    className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                  >
                    <span className={`font-medium ${langConfig.fontClass}`}>
                      {isSD ? '←' : '→'}
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}


