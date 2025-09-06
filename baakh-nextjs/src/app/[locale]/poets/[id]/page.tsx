"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowLeft,
  Users,
  Quote,
  Heart,
  Eye,
  Calendar,
  MapPin,
  BookOpen,
  Star,
  Sparkles,
  Music,
  FileText,
  Hash,
  Clock,
  Languages,
  ChevronRight,
  ExternalLink,
  Loader2,
  User,
  Share2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { getPrimaryPoetName, getSecondaryPoetName, getAvatarPoetName } from "@/lib/poet-name-utils";

interface Poet {
  id: string;
  name: string;
  sindhiName: string;
  englishName: string;
  period: string;
  location: string;
  avatar: string;
  description: string;
  longDescription: string;
  stats: {
    works: number;
    couplets: number;
    nazams: number;
    vaayis: number;
  };
  categories: string[];
  couplets: Array<{
    id: number;
    sindhi: string;
    english: string;
    displayText: string;
    likes: number;
    views: number;
    tags?: string[];
  }>;
  nazams: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  vaayis: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  similarPoets: Array<{
    id: string;
    name: string;
    avatar: string;
    period: string;
  }>;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  namePlural: string;
  description: string;
  poetryCount: number;
  poetry: Array<{
    id: string;
    title: string;
    description: string;
    slug: string;
    tags: string[];
    isFeatured: boolean;
    englishTitle?: string;
  }>;
}

export default function PoetPage() {
  const params = useParams();
  const pathname = usePathname();
  const poetId = params.id as string;
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const language = isSindhi ? 'sd' : 'en';

  // Multi-lingual content
  const content = {
    backToPoets: isSindhi ? 'شاعرن ڏانهن واپس' : 'Back to Poets',
    works: isSindhi ? 'ڪم' : 'Works',
    couplets: isSindhi ? 'شعر' : 'Couplets',
    poems: isSindhi ? 'شاعري' : 'Poems',
    famousCouplets: isSindhi ? 'مشهور شعر' : 'Famous Couplets',
    coupletsSubtitle: isSindhi ? 'هن شاعر جي مجموعي مان ڪجھ مشهور شعر' : 'Some of the most beloved couplets from this poet\'s collection',
    poetryByForm: isSindhi ? 'صنف جي لحاظ سان شاعري' : 'Poetry by Form',
    poetryByFormSubtitle: isSindhi ? 'شاعري جي صنفن ۽ اندازن جي لحاظ سان هن شاعر جا ڪم ڏسو' : 'Explore this poet\'s works organized by poetic forms and styles',
    worksLabel: isSindhi ? 'ڪم' : 'works',
    moreWorks: isSindhi ? 'وڌيڪ ڪم' : 'more works',
    explore: isSindhi ? 'ڏسو' : 'Explore',
    nazams: isSindhi ? 'نظم' : 'Nazams',
    nazamsSubtitle: isSindhi ? 'ڊگهي شاعري' : 'Longer poetic compositions',
    vaayis: isSindhi ? 'وائي' : 'Vaayis',
    vaayisSubtitle: isSindhi ? 'عبادي ۽ روحاني شاعري' : 'Devotional and spiritual compositions',
    musicalComposition: isSindhi ? 'موسيقي شاعري' : 'Musical composition',
    devotionalPoetry: isSindhi ? 'عبادي شاعري' : 'Devotional poetry',
    noPoetryFound: isSindhi ? 'ڪائي شاعري نه ملي' : 'No Poetry Found',
    noPoetrySubtitle: isSindhi ? 'هن شاعر جي پاس هن وقت ڪوئي شاعري ناهي' : 'This poet doesn\'t have any poetry in the database yet.',
    similarPoets: isSindhi ? 'ملندڙ جلندڙ شاعر' : 'Similar Poets',
    poetryStats: isSindhi ? 'شاعري جا انگ اکر' : 'Poetry Stats',
    totalWorks: isSindhi ? 'سڀ ڪم' : 'Total Works',
    coupletsLabel: isSindhi ? 'شعر' : 'Couplets',
    nazamsLabel: isSindhi ? 'نظم' : 'Nazams',
    vaayisLabel: isSindhi ? 'وائي' : 'Vaayis'
  };
  
  const [poet, setPoet] = useState<Poet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [poetCouplets, setPoetCouplets] = useState<Array<{
    id: string | number;
    lines: string[];
    translatedTags: Array<{ id: string; name: { en: string; sd: string } }>;
    likes: number;
    views: number;
  }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Apply Sindhi font only when text contains Arabic/Sindhi characters
  const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'sindhi-text' : '');

  // Ensure couplets render as two centered lines
  const getCoupletLines = (couplet: {
    sindhi?: string;
    english?: string;
    displayText?: string;
  }): string[] => {
    const baseText = (isSindhi ? (couplet.sindhi ?? couplet.displayText) : (couplet.english ?? couplet.displayText)) || '';
    const trimSafe = (s: string) => s.replace(/\s+/g, ' ').trim();
    const trySplit = (s: string): string[] => {
      // Prefer explicit newline split
      const nl = s.indexOf('\n');
      if (nl >= 0) {
        return [trimSafe(s.slice(0, nl)), trimSafe(s.slice(nl + 1))];
      }
      // Unicode-aware split keeping punctuation (Arabic comma/semicolon/period and Latin variants)
      const m = s.match(/^([\s\S]+?[،؛۔,;—])\s*(.+)$/u);
      if (m) {
        return [trimSafe(m[1]), trimSafe(m[2])];
      }
      // Fallback: split near middle at whitespace
      const mid = Math.floor(s.length / 2);
      const left = s.lastIndexOf(' ', mid);
      const idx = left > 0 ? left : s.indexOf(' ', mid);
      if (idx > 0) return [trimSafe(s.slice(0, idx)), trimSafe(s.slice(idx + 1))];
      return [trimSafe(s), ''];
    };
    const lines = trySplit(baseText).filter(Boolean).slice(0, 2);
    if (lines.length === 1) lines.push('');
    return lines;
  };

  // Fetch poet data and categories
  const fetchPoetData = useCallback(async () => {
    if (!poetId) {
      console.log('No poetId provided, skipping fetch');
      return;
    }
    
    console.log('🔄 Starting to fetch poet data for:', poetId, 'Language:', language);
    setLoading(true);
    setCategoriesLoading(true);
    setError(false);
    
    try {
      const apiUrl = `/api/poets/${poetId}?lang=${language}`;
      console.log('📡 Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('📥 Response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Poet data received:', data);
        
        setPoet(data.poet);
        setCategories(data.categories || []);
        
        // Seed with couplet samples immediately so UI shows content
        if (Array.isArray(data.poet?.couplets) && data.poet.couplets.length > 0) {
          console.log('📝 Setting couplet samples:', data.poet.couplets.length);
          // Normalize to structure used in UI
          const seeded = data.poet.couplets.map((c: any) => ({
            id: c.id,
            lines: c.lines || (c.displayText ? [c.displayText, ''] : []),
            translatedTags: c.translatedTags || [],
            likes: c.likes || 0,
            views: c.views || 0
          }));
          setPoetCouplets(seeded);
        }
        
        // Fetch standalone couplets by poet (poetry_id null or 0)
        if (data.poet?.poetNumericId) {
          console.log('🔍 Fetching standalone couplets for poet ID:', data.poet.poetNumericId);
          const params = new URLSearchParams({
            lang: isSindhi ? 'sd' : 'en',
            limit: '6',
            sortBy: 'created_at',
            sortOrder: 'desc',
            standalone: '1',
            poetId: String(data.poet.poetNumericId)
          });
          
          const coupletsUrl = `/api/couplets?${params.toString()}`;
          console.log('📡 Fetching couplets from:', coupletsUrl);
          
          const cl = await fetch(coupletsUrl, {
            signal: AbortSignal.timeout(10000)
          });
          
          if (cl.ok) {
            const cj = await cl.json();
            console.log('✅ Couplets received:', cj.couplets?.length || 0);
            setPoetCouplets(Array.isArray(cj.couplets) ? cj.couplets : []);
          } else {
            console.warn('⚠️ Couplets fetch failed:', cl.status);
          }
        }
      } else {
        console.error('❌ Poet fetch failed:', response.status, response.statusText);
        setError(true);
        
        // Auto-retry on failure (max 3 attempts)
        if (retryCount < 3) {
          console.log(`🔄 Auto-retrying... Attempt ${retryCount + 1}/3`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchPoetData();
          }, 2000); // Wait 2 seconds before retry
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        const isTimeout =
          error.name === 'AbortError' ||
          error.name === 'TimeoutError' ||
          /timed out/i.test(error.message) ||
          /signal timed out/i.test(error.message);
        if (isTimeout) {
          console.warn('⏰ Poet detail request timed out');
        } else {
          console.error('💥 Error fetching poet data:', error);
        }
      } else {
        console.error('💥 Unknown error fetching poet data:', error);
      }
      setError(true);
    } finally {
      console.log('🏁 Fetch completed, setting loading to false');
      setLoading(false);
      setCategoriesLoading(false);
    }
  }, [poetId, language, isSindhi]);

  // Ensure component is mounted before fetching data
  useEffect(() => {
    setMounted(true);
    console.log('🚀 Component mounted');
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered with poetId:', poetId, 'language:', language, 'mounted:', mounted);
    
    // Only fetch if component is mounted and poetId exists
    if (mounted && poetId) {
      console.log('✅ Component mounted and poetId exists, calling fetchPoetData');
      fetchPoetData();
    } else if (!mounted) {
      console.log('⏳ Component not yet mounted, waiting...');
    } else if (!poetId) {
      console.log('❌ poetId is missing, cannot fetch data');
    }
  }, [poetId, fetchPoetData, mounted]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('📊 State update - loading:', loading, 'poet:', !!poet, 'error:', error, 'retryCount:', retryCount);
  }, [loading, poet, error, retryCount]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="pt-6 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button Skeleton */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 w-32 h-10 bg-muted animate-pulse rounded-lg" />
            </motion.div>

            {/* Poet Header Skeleton */}
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex flex-col lg:flex-row items-start gap-10 md:gap-12">
                {/* Avatar Skeleton */}
                <motion.div 
                  className="h-40 w-40 rounded-full bg-muted animate-pulse ring-4 ring-gray-100 shadow-md"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                
                {/* Content Skeleton */}
                <motion.div 
                  className="flex-1 space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {/* Name Skeleton */}
                  <div className="h-12 bg-muted animate-pulse rounded w-3/4" />
                  {/* Alternate Name Skeleton */}
                  <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                  {/* Period Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                    <div className="h-5 bg-muted animate-pulse rounded w-24" />
                  </div>
                  {/* Location Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                    <div className="h-5 bg-muted animate-pulse rounded w-32" />
                  </div>
                  {/* Description Skeleton */}
                  <div className="space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Stats Section Skeleton */}
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i} 
                    className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + (i * 0.1) }}
                  >
                    <div className="h-8 bg-muted animate-pulse rounded w-16 mx-auto mb-2" />
                    <div className="h-5 bg-muted animate-pulse rounded w-20 mx-auto" />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Famous Couplets Section Skeleton */}
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="mb-8">
                <div className="h-8 bg-muted animate-pulse rounded w-48 mb-2" />
                <div className="h-5 bg-muted animate-pulse rounded w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div 
                    key={i} 
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + (i * 0.05) }}
                  >
                    <div className="space-y-4">
                      <div className="h-6 bg-muted animate-pulse rounded w-full" />
                      <div className="h-6 bg-muted animate-pulse rounded w-5/6" />
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 bg-muted animate-pulse rounded w-12" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 bg-muted animate-pulse rounded w-12" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Poetry by Form Section Skeleton */}
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="mb-8">
                <div className="h-8 bg-muted animate-pulse rounded w-56 mb-2" />
                <div className="h-5 bg-muted animate-pulse rounded w-80" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i} 
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 + (i * 0.1) }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
                        <div className="flex-1">
                          <div className="h-6 bg-muted animate-pulse rounded w-24 mb-2" />
                          <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-muted animate-pulse rounded w-16" />
                        <div className="h-8 bg-muted animate-pulse rounded w-20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Similar Poets Section Skeleton */}
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              <div className="mb-8">
                <div className="h-8 bg-muted animate-pulse rounded w-40 mb-2" />
                <div className="h-5 bg-muted animate-pulse rounded w-64" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i} 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.1 + (i * 0.1) }}
                  >
                    <div className="w-20 h-20 bg-muted animate-pulse rounded-full mx-auto mb-3" />
                    <div className="h-5 bg-muted animate-pulse rounded w-24 mx-auto mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-20 mx-auto" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="pt-6 pb-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <Users className="h-12 w-12 text-red-500" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'پروفائل لوڊ ڪرڻ ۾ مسئلو' : 'Error Loading Poet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSindhi ? 'مهرباني ڪري ٻيهر ڪوشش ڪريو.' : 'Please try again.'}
            </p>
            <Button 
              onClick={() => {
                setRetryCount(0);
                setError(false);
                fetchPoetData();
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl"
            >
              <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'ٻيهر ڪوشش' : 'Try Again'}
              </span>
            </Button>
            
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {isSindhi ? `ٻيهر ڪوشش ڪئي: ${retryCount}/3` : `Retry attempts: ${retryCount}/3`}
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // If we're not loading, have no error, but no poet data, show a message
  if (!loading && !error && !poet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="pt-6 pb-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
              <Users className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'شاعر نه مليو' : 'Poet Not Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSindhi ? 'مهرباني ڪري چيڪ ڪريو ته شاعر جو نالو درست آهي.' : 'Please check if the poet name is correct.'}
            </p>
            <Button 
              onClick={() => {
                setRetryCount(0);
                setError(false);
                fetchPoetData();
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl"
            >
              <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'ٻيهر ڪوشش' : 'Try Again'}
              </span>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!poet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Poet Header */}
          <section className="mb-12">
            <div className="flex flex-col lg:flex-row items-start gap-10 md:gap-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Avatar className="h-40 w-40 rounded-full ring-4 ring-gray-100 shadow-md">
                  <AvatarImage src={poet.avatar} alt={getPrimaryPoetName(poet, isSindhi)} />
                  <AvatarFallback className={`text-4xl font-semibold ${getSmartFontClass(getAvatarPoetName(poet, isSindhi))}`}>
                    {getAvatarPoetName(poet, isSindhi).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-2 ${getSmartFontClass(getPrimaryPoetName(poet, isSindhi))}`}>
                    {getPrimaryPoetName(poet, isSindhi)}
                  </h1>
                  {/* Show secondary name if available */}
                  {getSecondaryPoetName(poet, isSindhi) && (
                    <p className={`text-2xl text-gray-600 mb-6 ${getSmartFontClass(getSecondaryPoetName(poet, isSindhi)!)}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                      {getSecondaryPoetName(poet, isSindhi)}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-6">
                    <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> {poet.period}</span>
                    <span className="opacity-60">•</span>
                    <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {isSindhi ? (poet as any).locationSd || poet.location : (poet as any).locationEn || poet.location}</span>
                  </div>
                  
                  <p className={`text-lg text-gray-700 mb-6 leading-relaxed ${getSmartFontClass(poet.description)}`}>
                    {poet.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">
                        {poet.stats.works}
                      </div>
                      <div className={`text-sm text-gray-600 ${getSmartFontClass(content.works)}`}>{content.works}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">
                        {poet.stats.couplets}
                      </div>
                      <div className={`text-sm text-gray-600 ${getSmartFontClass(content.couplets)}`}>{content.couplets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">
                        {poet.stats.nazams + poet.stats.vaayis}
                      </div>
                      <div className={`text-sm text-gray-600 ${getSmartFontClass(content.poems)}`}>{content.poems}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-200/70 my-8" />

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Couplets */}
              {poetCouplets && poetCouplets.length > 0 && (
                <section>
                  <div className="pb-3">
                    <h2 className={`text-2xl font-semibold mb-1 ${getSmartFontClass(content.famousCouplets)}`}>
                      {content.famousCouplets}
                    </h2>
                    <p className={`text-gray-600 ${getSmartFontClass(content.coupletsSubtitle)}`}>
                      {content.coupletsSubtitle}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                    {poetCouplets.slice(0, 4).map((couplet, index) => (
                      <motion.div
                        key={couplet.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                {poet.avatar ? (
                                  <img 
                                    src={poet.avatar} 
                                    alt={poet.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-border/30"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-border/30">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                                <CardTitle className={`text-base group-hover:opacity-90 ${getSmartFontClass(getPrimaryPoetName(poet, isSindhi))}`}>{getPrimaryPoetName(poet, isSindhi)}</CardTitle>
                              </div>
                              <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <button aria-label="Like" className="hover:text-foreground">
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button aria-label="Share" className="hover:text-foreground">
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="text-sm text-muted-foreground">
                            <div className="text-center space-y-1">
                              {couplet.lines.slice(0, 2).map((line: string, lineIndex: number) => (
                                <div key={`line-${lineIndex}`} className={`leading-relaxed ${getSmartFontClass(line)}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                                  {line}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Tags section - only show if tags exist */}
                                {couplet.translatedTags && couplet.translatedTags.length > 0 ? (
                                  <>
                                    {couplet.translatedTags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                      <Link key={`${couplet.id}-tag-${tagIndex}-${tag}`} href={isSindhi ? `/sd/couplets?tag=${encodeURIComponent(tag)}` : `/en/couplets?tag=${encodeURIComponent(tag)}`}>
                                        <Badge variant="outline" className={`text-[10px] ${getSmartFontClass(tag)}`}>#{tag}</Badge>
                                      </Link>
                                    ))}
                                    {couplet.translatedTags.length > 3 && (
                                      <Badge key={`${couplet.id}-more-tags`} variant="outline" className="text-[10px]">
                                        +{couplet.translatedTags.length - 3}
                                      </Badge>
                                    )}
                                  </>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5" />
                                  {couplet.likes || 0}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  {couplet.views || 0}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              <div className="h-px bg-gray-200/70 my-8" />

              {/* Poetry by Form */}
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className={`ml-2 text-muted-foreground ${isSindhi ? 'auto-sindhi-font' : ''}`}>Loading poetic forms...</span>
                </div>
              ) : categories.length > 0 ? (
                <section>
                  <div className="pb-3">
                    <h2 className={`text-2xl font-semibold mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {content.poetryByForm}
                    </h2>
                    <p className={`text-muted-foreground ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {content.poetryByFormSubtitle}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="h-full"
                      >
                        <Card className="h-full rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                  <BookOpen className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="min-w-0">
                                  <CardTitle className={`text-lg leading-tight truncate ${getSmartFontClass(category.name)}`}>{category.name}</CardTitle>
                                  {/* Subtitle removed for a cleaner, minimal look */}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-700 border-gray-200">
                                {category.poetryCount} {content.worksLabel}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3">
                            {category.poetry.slice(0, 5).map((poem) => (
                              <div key={poem.id} className="p-3 rounded-lg bg-muted/10">
                                <Link href={isSindhi ? `/sd/poets/${poetId}/form/${category.slug}/${poem.slug}` : `/en/poets/${poetId}/form/${category.slug}/${poem.slug}`} className="block">
                                  <h4 className={`font-medium text-sm mb-1 line-clamp-1 text-foreground hover:underline ${getSmartFontClass(isSindhi ? poem.title : (poem.englishTitle || poem.title))}`}>
                                    {isSindhi ? poem.title : (poem.englishTitle || poem.title)}
                                  </h4>
                                </Link>
                                {poem.tags && poem.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {poem.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <span key={`${poem.id}-tag-${tagIndex}`} className="text-[10px] px-2 py-0.5 bg-muted/20 rounded-full text-muted-foreground">#{tag}</span>
                                    ))}
                                    {poem.tags.length > 2 && (
                                      <span key={`${poem.id}-more-tags`} className="text-[10px] px-2 py-0.5 bg-muted/20 rounded-full text-muted-foreground">+{poem.tags.length - 2}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className="flex items-center justify-between pt-2 border-t border-thin border-subtle">
                              <span className={`text-xs text-muted-foreground ${getSmartFontClass(content.moreWorks)}`}>
                                {category.poetry.length > 5 ? `+${category.poetry.length - 5} ${content.moreWorks}` : ''}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                asChild
                                className="rounded-full border-border/30 bg-white text-foreground hover:bg-muted/20 hover:text-foreground px-4"
                              >
                                <Link href={isSindhi ? `/sd/poets/${poetId}/form/${category.slug}` : `/en/poets/${poetId}/form/${category.slug}`}>
                                  <span className={`${getSmartFontClass(content.explore)} ${getSmartFontClass(category.namePlural)}`}>
                                    {content.explore} {category.namePlural}
                                  </span>
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`text-lg font-medium mb-2 ${getSmartFontClass(content.noPoetryFound)}`}>{content.noPoetryFound}</h3>
                  <p className={`text-muted-foreground ${getSmartFontClass(content.noPoetrySubtitle)}`}>
                    {content.noPoetrySubtitle}
                  </p>
                </div>
              )}

              {/* Nazams */}
              {poet.nazams && poet.nazams.length > 0 && (
                <section>
                  <div className="pb-3">
                    <h2 className={`text-2xl font-semibold mb-1 ${getSmartFontClass(content.nazams)}`}>
                      {content.nazams}
                    </h2>
                    <p className={`text-muted-foreground ${getSmartFontClass(content.nazamsSubtitle)}`}>
                      {content.nazamsSubtitle}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {poet.nazams.map((nazam, index) => (
                      <motion.div
                        key={nazam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-colors"
                      >
                        <h3 className={`font-medium mb-1 ${getSmartFontClass(nazam.title)}`}>
                          {nazam.title}
                        </h3>
                        <p className={`text-sm text-muted-foreground ${getSmartFontClass(nazam.description)}`}>
                          {nazam.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          <div className={`text-sm text-muted-foreground ${getSmartFontClass(content.musicalComposition)}`}>
                            <Music className="w-4 h-4 inline mr-1" />
                            {content.musicalComposition}
                          </div>
                          <Button variant="outline" size="sm">
                            <span className={`${getSmartFontClass(content.explore)}`}>
                              {content.explore}
                            </span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Vaayis */}
              {poet.vaayis && poet.vaayis.length > 0 && (
                <section>
                  <div className="pb-3">
                    <h2 className={`text-2xl font-semibold mb-1 ${getSmartFontClass(content.vaayis)}`}>
                      {content.vaayis}
                    </h2>
                    <p className={`text-muted-foreground ${getSmartFontClass(content.vaayisSubtitle)}`}>
                      {content.vaayisSubtitle}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {poet.vaayis.map((vaai, index) => (
                      <motion.div
                        key={vaai.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-colors"
                      >
                        <h3 className={`font-medium mb-1 ${getSmartFontClass(vaai.title)}`}>
                          {vaai.title}
                        </h3>
                        <p className={`text-sm text-muted-foreground ${getSmartFontClass(vaai.description)}`}>
                          {vaai.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          <div className={`text-sm text-muted-foreground ${getSmartFontClass(content.devotionalPoetry)}`}>
                            <FileText className="w-4 h-4 inline mr-1" />
                            {content.devotionalPoetry}
                          </div>
                          <Button variant="outline" size="sm">
                            <span className={`${getSmartFontClass(content.explore)}`}>
                              {content.explore}
                            </span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Similar Poets */}
              {poet.similarPoets && poet.similarPoets.length > 0 && (
                <section>
                  <h3 className={`text-lg font-semibold mb-3 ${getSmartFontClass(content.similarPoets)}`}>
                    {content.similarPoets}
                  </h3>
                  <div className="space-y-3">
                    {poet.similarPoets.map((similarPoet, index) => (
                      <motion.div
                        key={similarPoet.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link href={isSindhi ? `/sd/poets/${similarPoet.id}` : `/en/poets/${similarPoet.id}`}>
                          <Card className="cursor-pointer rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 md:gap-5">
                                  <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                                    <AvatarImage src={similarPoet.avatar} alt={similarPoet.name} />
                                    <AvatarFallback className={`text-sm font-semibold ${getSmartFontClass(similarPoet.name)}`}>
                                      {similarPoet.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className={`font-medium ${getSmartFontClass(similarPoet.name)}`}>
                                      {similarPoet.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {similarPoet.period}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Stats */}
              <section>
                <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${getSmartFontClass(content.poetryStats)}`}>{content.poetryStats}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { k: content.totalWorks, v: poet.stats.works },
                      ...(poet.stats.couplets > 0 ? [{ k: content.coupletsLabel, v: poet.stats.couplets }] : []),
                      ...(poet.stats.nazams > 0 ? [{ k: content.nazamsLabel, v: poet.stats.nazams }] : []),
                      ...(poet.stats.vaayis > 0 ? [{ k: content.vaayisLabel, v: poet.stats.vaayis }] : [])
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-t first:border-t-0 border-border/60">
                        <span className={`text-sm text-muted-foreground ${getSmartFontClass(row.k)}`}>
                          {row.k}
                        </span>
                        <span className="text-sm font-medium">{row.v}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}