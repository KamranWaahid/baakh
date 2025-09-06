'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { getSmartFontClass } from '@/lib/font-detection-utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Eye, Share2, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Languages } from 'lucide-react';

interface PoetryItem {
  id: number;
  title: string;
  englishTitle?: string;
  description: string;
  slug: string;
  tags: string[];
  isFeatured: boolean;
  created_at?: string;
}

interface FormData {
  id: number;
  slug: string;
  name: string;
  namePlural: string;
  description: string;
  poetryCount: number;
  poetry: PoetryItem[];
}

interface PoetData {
  id: string;
  name: string;
  sindhiName: string;
  period: string;
  location: string;
  avatar: string;
  description: string;
}

function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-200/70 animate-pulse" />
            <div className="flex-1">
              <Skeleton className="h-7 w-56 mb-2 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
          <div className="max-w-3xl">
            <Skeleton className="h-4 w-full mb-2 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-5">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PoetFormPage() {
  const params = useParams();
  const pathname = usePathname();
  const poetId = params.id as string;
  const formSlug = params.form as string;
  
  // Detect current locale
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  // Multi-lingual content
  const content = {
    backToPoet: isSindhi ? 'واپس موٽيو' : 'Back to',
    poeticFormNotFound: isSindhi ? 'شاعري جي صنف نه ملي' : 'Poetic Form Not Found',
    formNotFoundMessage: isSindhi ? 'هي شاعري جي صنف هن شاعر لاءِ نه ملي سگهي.' : 'The requested poetic form could not be found for this poet.',
    backToPoetButton: isSindhi ? 'شاعر ڏانهن واپس' : 'Back to Poet',
    by: isSindhi ? 'جو' : 'by',
    poeticForm: isSindhi ? 'شاعري جي صنف' : 'Poetic Form',
    collection: isSindhi ? 'مجموعو' : 'Collection',
    noPoetryFound: isSindhi ? 'نہ' : 'No',
    found: isSindhi ? 'مليو' : 'found for this poet.',
    featured: isSindhi ? 'چونڊ' : 'Featured',
    like: isSindhi ? 'پسند' : 'Like',
    view: isSindhi ? 'ڏٺل' : 'View',
    read: isSindhi ? 'پڙهو' : 'Read',
    browseAllPoets: isSindhi ? 'سڀ شاعر ڳولھيو' : 'Browse All Poets',
    more: isSindhi ? 'وڌيڪ' : 'more',
    unknownDate: isSindhi ? 'اڻڄاتل تاريخ' : 'Unknown date'
  };
  
  const [loading, setLoading] = useState(true);
  const [poet, setPoet] = useState<PoetData | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [poetry, setPoetry] = useState<PoetryItem[]>([]);
  
  // Apply Sindhi font only when the text contains Arabic/Sindhi characters (avoid numbers)
  const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'auto-sindhi-font' : '');

  const fetchFormData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/poets/${poetId}?lang=${isSindhi ? 'sd' : 'en'}`);
      if (!response.ok) throw new Error('Failed to fetch poet data');
      
      const data = await response.json();
      setPoet(data.poet);
      
      // Find the specific form
      const foundForm = data.categories.find((cat: FormData) => 
        cat.slug === formSlug
      );
      
      if (foundForm) {
        setForm(foundForm);
        setPoetry(foundForm.poetry);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  }, [poetId, formSlug, isSindhi]);

  useEffect(() => {
    if (poetId && formSlug) {
      fetchFormData();
    }
  }, [poetId, formSlug, fetchFormData]);

  if (loading) {
    return <Loading />;
  }

  if (!poet || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold text-foreground mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {content.poeticFormNotFound}
          </h1>
          <p className={`text-muted-foreground mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {content.formNotFoundMessage}
          </p>
          <Button asChild>
            <Link href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {content.backToPoetButton}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return content.unknownDate;
    try {
      return new Date(dateString).toLocaleDateString(isSindhi ? 'sd' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return content.unknownDate;
    }
  };

  // Get display names based on language
  const getDisplayName = (poet: PoetData) => {
    if (isSindhi && poet.sindhiName) {
      return poet.sindhiName;
    }
    return poet.name;
  };

  const getDisplayFormName = (form: FormData) => {
    // For now, using the name field - you might want to add sindhiName to FormData interface
    return form.name;
  };

  const getDisplayFormPlural = (form: FormData) => {
    // For now, using the namePlural field - you might want to add sindhiNamePlural to FormData interface
    return form.namePlural;
  };

  // Sindhi possessive for plural nouns: basic heuristic based on common endings
  const getSindhiPluralPossessive = (word: string) => {
    // If plural likely ends with يون/ون/ات use "جون" else default to "جا"
    const w = word || '';
    if (/يون$|ون$|ات$/u.test(w)) return 'جون';
    return 'جا';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className={`pt-4 pb-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <Button variant="outline" asChild className="mb-4 rounded-full border border-gray-200 bg-white text-foreground hover:bg-gray-50 hover:border-gray-300">
              <Link href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}`}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                {content.backToPoet} {getDisplayName(poet)}
              </Link>
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              {poet.avatar && (
                <img
                  src={poet.avatar}
                  alt={getDisplayName(poet)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className={`text-3xl md:text-4xl font-extrabold text-foreground`}>
                  {isSindhi ? (
                    <>
                      <span>{getDisplayName(poet)}</span>{' '}
                      <span className={getSmartFontClass(getSindhiPluralPossessive(getDisplayFormPlural(form)))}>
                        {getSindhiPluralPossessive(getDisplayFormPlural(form))}
                      </span>{' '}
                      <span className={getSmartFontClass(getDisplayFormPlural(form))}>{getDisplayFormPlural(form)}</span>
                    </>
                  ) : (
                    `${getDisplayFormName(form)} ${content.by} ${getDisplayName(poet)}`
                  )}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {poet.sindhiName && isSindhi && (
                    <span className="block auto-sindhi-font" dir="rtl">{poet.sindhiName}</span>
                  )}
                  {poet.period && (
                    <span className={`block text-sm ${getSmartFontClass(poet.period)}`}>
                      {poet.period}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="max-w-4xl">
              <p className={`text-muted-foreground leading-7 md:leading-8 text-justify ${getSmartFontClass(form.description)}`}>
                {form.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>
                  <span className="font-mono">{form.poetryCount}</span>{' '}
                  <span className={getSmartFontClass(getDisplayFormPlural(form))}>{getDisplayFormPlural(form)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className={getSmartFontClass(content.poeticForm)}>
                  {content.poeticForm}
                </span>
              </div>
            </div>
          </div>

          {/* Poetry List */}
          <div className="space-y-6">
            <h2 className={`text-2xl font-semibold text-foreground ${getSmartFontClass(getDisplayFormName(form) + ' ' + content.collection)}`}>
              {getDisplayFormName(form)} {content.collection}
            </h2>
            
            {poetry.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-muted-foreground text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.noPoetryFound} {getDisplayFormName(form).toLowerCase()} {content.found}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poetry.map((poem, index) => (
                  <motion.div
                    key={poem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className={`text-base font-semibold leading-tight line-clamp-2 group-hover:opacity-90 ${getSmartFontClass(isSindhi ? poem.title : (poem.englishTitle || poem.title))}`}>
                            {isSindhi ? poem.title : (poem.englishTitle || poem.title)}
                          </CardTitle>
                          {poem.isFeatured && (
                            <Badge variant="secondary" className={`text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-700 border-gray-200 ${getSmartFontClass(content.featured)}`}>
                              {content.featured}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {poem.description && poem.description !== 'No description available' && (
                          <p className={`text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed ${getSmartFontClass(poem.description)}`}>
                            {poem.description}
                          </p>
                        )}
                        
                        {poem.tags && poem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {poem.tags.slice(0, 3).map((tag, tagIndex) => {
                              const clean = tag.replace(/[\[\]"]/g, '');
                              return (
                                <Badge key={tagIndex} variant="outline" className={`text-[10px] ${getSmartFontClass(clean)}`}>
                                  {clean}
                                </Badge>
                              );
                            })}
                            {poem.tags.length > 3 && (
                              <Badge variant="outline" className={`text-[10px] ${getSmartFontClass(content.more)}`}>
                                +{poem.tags.length - 3} {content.more}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          <div className="flex items-center gap-5 text-sm text-muted-foreground">
                            <button
                              title={content.like}
                              aria-label={content.like}
                              className={`flex items-center gap-2 hover:text-foreground transition-colors ${getSmartFontClass(content.like)}`}
                            >
                              <Heart className="w-5 h-5" />
                              <span>{content.like}</span>
                            </button>
                            <button
                              title={content.view}
                              aria-label={content.view}
                              className={`flex items-center gap-2 hover:text-foreground transition-colors ${getSmartFontClass(content.view)}`}
                            >
                              <Eye className="w-5 h-5" />
                              <span>{content.view}</span>
                            </button>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="rounded-full border border-gray-200 bg-white text-foreground hover:bg-gray-50 hover:border-gray-300 px-4 shadow-sm hover:shadow"
                          >
                            <Link href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}/form/${formSlug}/${poem.slug}`}>
                              {content.read} {getDisplayFormName(form)}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {content.backToPoet} {getDisplayName(poet)}
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href={`/${isSindhi ? 'sd' : 'en'}/poets`}>
                  {content.browseAllPoets}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
