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
import { useParams, usePathname, useRouter } from "next/navigation";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { getPrimaryPoetName, getSecondaryPoetName, getAvatarPoetName } from "@/lib/poet-name-utils";
import CoupletCard from "@/components/CoupletCard";
import PoetDescriptionModal from "@/components/ui/PoetDescriptionModal";

interface Poet {
  id: string;
  name: string;
  sindhiName: string;
  englishName: string;
  sindhi_laqab?: string;
  english_laqab?: string;
  sindhi_takhalus?: string;
  english_takhalus?: string;
  period: string;
  location: string;
  locationSd?: string;
  locationEn?: string;
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
  const router = useRouter();
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
    noPoetrySubtitle: isSindhi ? 'هن شاعر جي پاس هن وقت ڪوئي شاعري ناهي' : 'This poet doesn&apos;t have any poetry in the database yet.',
    similarPoets: isSindhi ? 'ملندڙ جلندڙ شاعر' : 'Similar Poets',
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
    poetry_id?: number | null;
    poetry?: Record<string, unknown> | null;
  }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [poetStats, setPoetStats] = useState({
    poetry: 0,
    couplets: 0,
    categories: 0
  });
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [morePoets, setMorePoets] = useState<Array<{ id: string; name: string; avatar?: string; period?: string; tagline?: string }>>([]);
  const [morePoetsLoading, setMorePoetsLoading] = useState(false);

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

  // Fetch poet stats
  const fetchPoetStats = useCallback(async () => {
    if (!poetId) return;
    
    try {
      const response = await fetch(`/api/poets/${poetId}/stats?lang=${language}`);
      if (response.ok) {
        const stats = await response.json();
        setPoetStats(stats);
      } else {
        console.log('🔄 Stats fetch failed, using default values');
        setPoetStats({
          poetry: 0,
          couplets: 0,
          categories: 0
        });
      }
    } catch (error) {
      console.error('Error fetching poet stats:', error);
      setPoetStats({
        poetry: 0,
        couplets: 0,
        categories: 0
      });
    }
  }, [poetId, language]);

  // Fetch poet data and categories
  const fetchPoetData = useCallback(async () => {
    if (!poetId || poetId === 'undefined' || poetId === 'null') {
      console.log('No valid poetId provided, skipping fetch. poetId:', poetId);
      setError(true);
      setLoading(false);
      return;
    }
    
    console.log('🔄 Starting to fetch poet data for:', poetId, 'Language:', language);
    setLoading(true);
    setCategoriesLoading(true);
    setError(false);
    
    try {
      const withTimeout = async (url: string) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000);
        try {
          const res = await fetch(url, { signal: controller.signal, headers: { 'Content-Type': 'application/json' } });
          return res;
        } finally {
          clearTimeout(id);
        }
      };

      const urls = [
        `/api/poets/${poetId}/direct?lang=${language}`,
        `/api/poets/${poetId}/direct-db?lang=${language}`,
        `/api/poets/${poetId}/mock?lang=${language}`
      ];

      let success = false;
      for (const url of urls) {
        console.log('📡 Trying URL:', url);
        let response: Response | null = null;
        try {
          response = await withTimeout(url);
        } catch (fetchError: unknown) {
          console.warn('⚠️ Fetch failed for', url, fetchError?.message || fetchError);
          continue;
        }

        console.log('📥 Response status:', response.status, response.ok, 'for', url);
        if (!response.ok) {
          // Continue to next URL on 404/503; break on other 5xx
          if (response.status === 404 || response.status === 503) {
            continue;
          }
          try {
            const errJson = await response.json().catch(() => ({}));
            console.error('Error details from', url, errJson);
          } catch {}
          continue;
        }

        const data = await response.json();
        console.log('✅ Poet data received from', url);
        setPoet(data.poet);
        setCategories(data.categories || []);
        if (Array.isArray(data.poet?.couplets) && data.poet.couplets.length > 0) {
          setPoetCouplets(data.poet.couplets);
        } else {
          setPoetCouplets([]);
          // Fallback: fetch couplets via public couplets API using poetId like homepage
          try {
            const fallbackParams = new URLSearchParams({
              poetId: String((data.poet as Record<string, unknown>).poetNumericId || (data.poet as Record<string, unknown>).poet_id || (data.poet as Record<string, unknown>).id || ''),
              lang: language,
              standalone: '1',
              limit: '12',
              sortBy: 'created_at',
              sortOrder: 'desc'
            });
            const fallbackRes = await fetch(`/api/couplets?${fallbackParams.toString()}`);
            if (fallbackRes.ok) {
              const fallbackJson = await fallbackRes.json();
              const mapped = (fallbackJson.couplets || []).map((c: Record<string, unknown>) => ({
                id: c.id,
                lines: Array.isArray(c.lines) ? c.lines.slice(0, 2) : String(c.couplet_text || '').split('\n').slice(0, 2),
                translatedTags: [],
                likes: c.likes || 0,
                views: c.views || 0,
                poetry_id: c.poetry?.id || c.poetry_id || null,
                poetry: c.poetry || null
              }));
              setPoetCouplets(mapped);
            } else {
              console.warn('Fallback couplets fetch failed:', fallbackRes.status);
            }
          } catch (fallbackErr) {
            console.warn('Fallback couplets fetch error:', fallbackErr);
          }
        }
        success = true;
        break;
      }

      if (!success) {
        console.error('❌ All poet data sources failed');
        setError(true);
        // Auto-retry on failure (max 3 attempts) - but not for 500 errors
        if (retryCount < 3) {
          console.log(`🔄 Auto-retrying... Attempt ${retryCount + 1}/3`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchPoetData();
          }, 2000);
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
    
    // Only fetch if component is mounted and poetId exists and is valid
    if (mounted && poetId && poetId !== 'undefined' && poetId !== 'null') {
      console.log('✅ Component mounted and poetId exists, calling fetchPoetData');
      fetchPoetData();
      fetchPoetStats();
    } else if (!mounted) {
      console.log('⏳ Component not yet mounted, waiting...');
    } else if (!poetId || poetId === 'undefined' || poetId === 'null') {
      console.log('❌ poetId is missing or invalid, redirecting to poets list. poetId:', poetId);
      // Redirect to poets list page after a short delay
      setTimeout(() => {
        router.push(`/${isSindhi ? 'sd' : 'en'}/poets`);
      }, 2000);
      setError(true);
      setLoading(false);
    }
  }, [poetId, fetchPoetData, mounted]);

  // Fallback: compute stats on client if API returns zeros
  useEffect(() => {
    // If any stat is non-zero, assume API provided meaningful data
    if (poetStats.poetry > 0 || poetStats.couplets > 0 || poetStats.categories > 0) return;

    const computedCategories = Array.isArray(categories) ? categories.length : 0;
    const computedPoetry = Array.isArray(categories)
      ? categories.reduce((sum, cat) => sum + (Number(cat.poetryCount) || 0), 0)
      : 0;
    const computedCouplets = Array.isArray(poetCouplets)
      ? poetCouplets.filter(c => !c.poetry_id || c.poetry_id === 0).length
      : 0;

    if (computedCategories || computedPoetry || computedCouplets) {
      setPoetStats({
        poetry: computedPoetry,
        couplets: computedCouplets,
        categories: computedCategories
      });
    }
  }, [categories, poetCouplets, poetStats.poetry, poetStats.couplets, poetStats.categories]);

  // Fetch more poets (up to 7), excluding current poet
  useEffect(() => {
    const fetchMorePoets = async () => {
      if (!poetId) return;
      try {
        setMorePoetsLoading(true);
        // Try to use the generic poets list API; fall back gracefully
        const res = await fetch(`/api/poets?limit=12&lang=${language}`);
        if (!res.ok) {
          setMorePoets([]);
          return;
        }
        const json = await res.json();
        const list: any[] = Array.isArray(json.poets) ? json.poets : (Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
        const normalized = list
          .map((p: any) => {
            const nameCandidate = (
              p.name || p.englishName || p.sindhiName || p.poet_name || p.primary_name || p.title || p.display_name || ''
            );
            const name = String(nameCandidate);
            const taglineCandidate = (
              (isSindhi ? p.sindhi_laqab : p.english_laqab) ||
              p.tagline ||
              (typeof p.description === 'string' ? p.description.split(/\n|\./)[0] : '')
            );
            return {
              id: String(p.id || p.slug || p.poet_id || p.identifier || name || ''),
              name,
              avatar: p.avatar || p.photo || p.image || '',
              period: p.period || p.years || p.active_years || '',
              tagline: taglineCandidate ? String(taglineCandidate) : ''
            };
          })
          .filter((p: any) => p.id && p.id !== String(poetId));
        setMorePoets(normalized.slice(0, 7));
      } catch (e) {
        setMorePoets([]);
      } finally {
        setMorePoetsLoading(false);
      }
    };

    fetchMorePoets();
  }, [poetId, language]);

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
              <div className="inline-flex items-center gap-2 w-32 h-10 bg-muted rounded-lg shimmer" />
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
                  className="h-40 w-40 rounded-full bg-muted ring-4 ring-gray-100 shadow-md shimmer"
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
                  <div className="h-12 bg-muted rounded w-3/4 shimmer" />
                  {/* Alternate Name Skeleton */}
                  <div className="h-8 bg-muted rounded w-1/2 shimmer" />
                  {/* Period Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded shimmer" />
                    <div className="h-5 bg-muted rounded w-24 shimmer" />
                  </div>
                  {/* Location Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded shimmer" />
                    <div className="h-5 bg-muted rounded w-32 shimmer" />
                  </div>
                  {/* Description Skeleton */}
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full shimmer" />
                    <div className="h-4 bg-muted rounded w-5/6 shimmer" />
                    <div className="h-4 bg-muted rounded w-4/5 shimmer" />
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
                    <div className="h-8 bg-muted rounded w-16 mx-auto mb-2 shimmer" />
                    <div className="h-5 bg-muted rounded w-20 mx-auto shimmer" />
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
                <div className="h-8 bg-muted rounded w-48 mb-2 shimmer" />
                <div className="h-5 bg-muted rounded w-96 shimmer" />
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
                      <div className="h-6 bg-muted rounded w-full shimmer" />
                      <div className="h-6 bg-muted rounded w-5/6 shimmer" />
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-muted rounded shimmer" />
                          <div className="h-4 bg-muted rounded w-12 shimmer" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-muted rounded shimmer" />
                          <div className="h-4 bg-muted rounded w-12 shimmer" />
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
                <div className="h-8 bg-muted rounded w-56 mb-2 shimmer" />
                <div className="h-5 bg-muted rounded w-80 shimmer" />
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
                        <div className="w-12 h-12 bg-muted rounded-lg shimmer" />
                        <div className="flex-1">
                          <div className="h-6 bg-muted rounded w-24 mb-2 shimmer" />
                          <div className="h-4 bg-muted rounded w-32 shimmer" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full shimmer" />
                        <div className="h-4 bg-muted rounded w-3/4 shimmer" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-muted rounded w-16 shimmer" />
                        <div className="h-8 bg-muted rounded w-20 shimmer" />
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
                <div className="h-8 bg-muted rounded w-40 mb-2 shimmer" />
                <div className="h-5 bg-muted rounded w-64 shimmer" />
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
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-3 shimmer" />
                    <div className="h-5 bg-muted rounded w-24 mx-auto mb-2 shimmer" />
                    <div className="h-4 bg-muted rounded w-20 mx-auto shimmer" />
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
              {poetId === 'undefined' || poetId === 'null' 
                ? (isSindhi ? 'شاعر جو نالو غلط آهي. توهان کي شاعرن جي فهرست ڏانهن موڪيو ويندو.' : 'Invalid poet ID provided. You will be redirected to the poets list.')
                : (isSindhi ? 'مهرباني ڪري چيڪ ڪريو ته شاعر جو نالو درست آهي.' : 'Please check if the poet name is correct.')
              }
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
                  
                  {/* Laqab (honorific title) - neutral color, no blue */}
                  {(poet as any).sindhi_laqab || (poet as any).english_laqab ? (
                    <p className={`text-xl text-gray-700 mb-1 ${getSmartFontClass(isSindhi ? (poet as any).sindhi_laqab : (poet as any).english_laqab)}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                      {isSindhi ? (poet as any).sindhi_laqab : (poet as any).english_laqab}
                    </p>
                  ) : null}

                  {/* Original/secondary name below */}
                  {(() => {
                    const secondaryName = getSecondaryPoetName(poet, isSindhi);
                    return secondaryName ? (
                      <p className={`text-base text-gray-600 mb-2 ${getSmartFontClass(secondaryName)}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                        {secondaryName}
                      </p>
                    ) : null;
                  })()}
                  
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-6">
                    {/* Birth and Death Dates */}
                    <span className={`inline-flex items-center gap-2 ${getSmartFontClass(poet.period)}`}>
                      <Calendar className="w-4 h-4" /> 
                      {(poet as any).birth_date && (poet as any).death_date ? (
                        <span>
                          {isSindhi ? 'پيدائش: ' : 'Born: '}{(poet as any).birth_date} • {isSindhi ? 'وفات: ' : 'Died: '}{(poet as any).death_date}
                        </span>
                      ) : (poet as any).birth_date ? (
                        <span>
                          {isSindhi ? 'پيدائش: ' : 'Born: '}{(poet as any).birth_date} • {isSindhi ? 'زنده' : 'Alive'}
                        </span>
                      ) : (
                        poet.period
                      )}
                    </span>
                    <span className="opacity-60">•</span>
                    <span className={`inline-flex items-center gap-2 ${getSmartFontClass(isSindhi ? (poet as any).birth_place_sd || (poet as any).birth_place : (poet as any).birth_place_en || (poet as any).birth_place)}`}>
                      <MapPin className="w-4 h-4" /> 
                      {isSindhi ? (poet as any).birth_place_sd || (poet as any).birth_place : (poet as any).birth_place_en || (poet as any).birth_place}
                    </span>
                    {/* Death place if different from birth place */}
                    {(poet as any).death_place && (poet as any).death_place !== (poet as any).birth_place && (
                      <>
                        <span className="opacity-60">•</span>
                        <span className={`inline-flex items-center gap-2 ${getSmartFontClass(isSindhi ? (poet as any).death_place_sd || (poet as any).death_place : (poet as any).death_place_en || (poet as any).death_place)}`}>
                          <MapPin className="w-4 h-4" /> 
                          {isSindhi ? (isSindhi ? 'وفات: ' : 'Died: ') + ((poet as any).death_place_sd || (poet as any).death_place) : (isSindhi ? 'وفات: ' : 'Died: ') + ((poet as any).death_place_en || (poet as any).death_place)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    {(() => {
                      const full = poet.description || '';
                      const firstParagraph = full.split('\n').map(s => s.trim()).filter(Boolean)[0] || full;
                      // Prefer first sentence boundary within first paragraph
                      const firstSentence = (() => {
                        const m = firstParagraph.match(/^([\s\S]+?[۔\.!?])\s+/u);
                        return m ? m[1].trim() : firstParagraph.trim();
                      })();
                      const maxChars = 220;
                      const excerpt = firstSentence.length > maxChars
                        ? firstSentence.slice(0, maxChars).trimEnd() + '…'
                        : firstSentence;
                      const hasMore = full.trim().length > excerpt.length;
                      return (
                        <>
                          <p className={`text-lg text-gray-700 leading-relaxed ${getSmartFontClass(excerpt)}`}>
                            {excerpt}
                          </p>
                          {hasMore && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDescriptionModalOpen(true)}
                              className="mt-3 text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            >
                              {isSindhi ? "مڪمل پڙهو" : "Read More"}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </>
                      );
                    })()}

                    {/* Additional details if available */}
                    {((poet as any).tags && (poet as any).tags.length > 0) && (
                      <div className="mt-4">
                        <h4 className={`text-sm font-medium text-gray-600 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'خاصيتون' : 'Characteristics'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(poet as any).tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold font-inter">
                        {poetStats.poetry}
                      </div>
                      <div className={`text-sm text-gray-600 ${getSmartFontClass(content.works)}`}>{content.works}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-inter">
                        {poetStats.couplets}
                      </div>
                      <div className={`text-sm text-gray-600 ${getSmartFontClass(content.couplets)}`}>{content.couplets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-inter">
                        {poetStats.categories}
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
              {/* Couplets - Show only standalone couplets (poetry_id null or 0) */}
              {(() => {
                const standaloneCouplets = poetCouplets?.filter(couplet => 
                  !couplet.poetry || 
                  !couplet.poetry_id || 
                  couplet.poetry_id === 0
                ) || [];
                console.log('🔍 Couplets section check:', {
                  totalCouplets: poetCouplets?.length || 0,
                  standaloneCouplets: standaloneCouplets.length,
                  willShow: standaloneCouplets.length > 0
                });
                return standaloneCouplets.length > 0;
              })() && (
                <section>
                  <div className="pb-3">
                    <h2 className={`text-2xl font-semibold mb-1 ${getSmartFontClass(content.famousCouplets)}`}>
                      {content.famousCouplets}
                    </h2>
                    <p className={`text-gray-600 ${getSmartFontClass(content.coupletsSubtitle)}`}>
                      {content.coupletsSubtitle}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                        {isSindhi ? 'صرف آزاد شعر' : 'Standalone Couplets Only'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                    {poetCouplets
                      .filter(couplet => !couplet.poetry_id || couplet.poetry_id === 0)
                      .slice(0, 4)
                      .map((couplet, index) => (
                      <motion.div
                        key={couplet.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <CoupletCard
                          couplet={{
                            id: typeof couplet.id === 'string' ? parseInt(couplet.id, 10) : couplet.id,
                            couplet_text: couplet.lines.join('\n'),
                            couplet_slug: `couplet-${couplet.id}`,
                            lang: isSindhi ? 'sd' : 'en',
                            lines: couplet.lines,
                            tags: couplet.translatedTags?.map(tag => typeof tag === 'string' ? tag : tag.name?.[isSindhi ? 'sd' : 'en'] || '') || [],
                            poet: {
                              name: getPrimaryPoetName(poet, isSindhi),
                              slug: poetId,
                              photo: poet.avatar
                            },
                            created_at: new Date().toISOString(),
                            likes: couplet.likes || 0,
                            views: couplet.views || 0
                          }}
                          isSindhi={isSindhi}
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* More Couplets Button */}
                  {poetCouplets.filter(couplet => !couplet.poetry_id || couplet.poetry_id === 0).length > 4 && (
                    <div className="mt-6 text-center">
                      <Link 
                        href={`/${isSindhi ? 'sd' : 'en'}/couplets?poet=${poetId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <span className={`font-medium ${getSmartFontClass(isSindhi ? 'سڀ شعر ڏسو' : 'View All Couplets')}`}>
                          {isSindhi ? 'سڀ شعر ڏسو' : 'View All Couplets'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </Link>
                    </div>
                  )}
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
                          <CardHeader className="pb-3 pt-5">
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
                          
                          <CardContent className="space-y-3 py-4">
                            {category.poetry.slice(0, 5).map((poem) => (
                              <div key={poem.id} className="p-3 rounded-lg bg-muted/10">
                                <Link href={isSindhi ? `/sd/poets/${poetId}/form/${category.slug}/${poem.slug}` : `/en/poets/${poetId}/form/${category.slug}/${poem.slug}`} className="block">
                                  <h4 className={`font-medium text-sm mb-1 line-clamp-1 text-foreground hover:underline ${getSmartFontClass(isSindhi ? poem.title : (poem.englishTitle || poem.title))}`}>
                                    {isSindhi ? poem.title : (poem.englishTitle || poem.title)}
                                  </h4>
                                </Link>
                                {(() => {
                                  const tagList = Array.isArray(poem.tags)
                                    ? poem.tags
                                    : (typeof poem.tags === 'string'
                                        ? (poem.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
                                        : []);
                                  return tagList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {tagList.slice(0, 2).map((tag: string, tagIndex: number) => (
                                        <span key={`${poem.id}-tag-${tagIndex}`} className="text-[10px] px-2 py-0.5 bg-muted/20 rounded-full text-muted-foreground">#{tag}</span>
                                      ))}
                                      {tagList.length > 2 && (
                                        <span key={`${poem.id}-more-tags`} className="text-[10px] px-2 py-0.5 bg-muted/20 rounded-full text-muted-foreground">+{tagList.length - 2}</span>
                                      )}
                                    </div>
                                  ) : null;
                                })()}
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
              {/* Similar Poets / Suggestions */}
              {(poet.similarPoets && poet.similarPoets.length > 0) ? (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className={`text-lg font-semibold text-gray-900 ${getSmartFontClass(content.similarPoets)}`}>
                      {content.similarPoets}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {poet.similarPoets.map((similarPoet, index) => (
                      <motion.div
                        key={similarPoet.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link href={isSindhi ? `/sd/poets/${similarPoet.id}` : `/en/poets/${similarPoet.id}`}>
                          <Card className="cursor-pointer rounded-xl bg-white border border-gray-200">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={similarPoet.avatar} alt={similarPoet.name} />
                                    <AvatarFallback className={`text-sm font-normal ${getSmartFontClass(similarPoet.name)}`}>
                                      {similarPoet.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className={`text-sm font-normal text-gray-900 ${getSmartFontClass(similarPoet.name)}`}>
                                      {similarPoet.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {similarPoet.period}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-gray-600" />
                    <h3 className={`text-lg font-semibold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {isSindhi ? 'تجويزات' : 'Suggestions'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Link href={isSindhi ? '/sd/poets' : '/en/poets'}>
                      <Card className="cursor-pointer rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <BookOpen className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className={`font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {isSindhi ? 'سڀ شاعر ڏسو' : 'Explore All Poets'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {isSindhi ? 'سڀ شاعرن کي ڳوليو' : 'Discover more poets'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href={isSindhi ? '/sd/couplets' : '/en/couplets'}>
                      <Card className="cursor-pointer rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Quote className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className={`font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {isSindhi ? 'شعر ڳوليو' : 'Explore Couplets'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {isSindhi ? 'مشهور شعر ڳوليو' : 'Find famous couplets'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </section>
              )}

              {/* More Poets (Suggestions list of ~7) */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className={`text-lg font-semibold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'وڌيڪ شاعر' : 'More Poets'}
                  </h3>
                </div>

                {morePoetsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-14 bg-muted animate-pulse rounded-xl border border-gray-200" />
                    ))}
                  </div>
                ) : morePoets.length > 0 ? (
                  <div className="space-y-4">
                    {morePoets.map((p, index) => (
                      <motion.div
                        key={`${p.id}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.07 }}
                      >
                        <Link href={isSindhi ? `/sd/poets/${p.id}` : `/en/poets/${p.id}`}>
                          <Card className="cursor-pointer rounded-xl bg-white border border-gray-200 hover:shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={p.avatar || ''} alt={p.name} />
                                    <AvatarFallback className={`text-sm font-normal ${getSmartFontClass(p.name)}`}>
                                      {p.name?.charAt(0) || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <h4 className={`text-sm font-medium text-gray-900 truncate ${getSmartFontClass(p.name)}`}>
                                      {p.name || (isSindhi ? 'نالو موجود ناهي' : 'Unnamed Poet')}
                                    </h4>
                                    {p.tagline ? (
                                      <p className={`text-xs text-gray-600 truncate ${getSmartFontClass(p.tagline)}`}>
                                        {p.tagline}
                                      </p>
                                    ) : p.period ? (
                                      <p className="text-xs text-gray-500 truncate">{p.period}</p>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
                                  <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>{isSindhi ? 'پروفائل' : 'Profile'}</span>
                                  <ChevronRight className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isSindhi ? 'هاڻي ڪو وڌيڪ شاعر موجود ناهي' : 'No more poets to show right now.'}
                  </p>
                )}
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Description Modal */}
      {poet && (
        <PoetDescriptionModal
          isOpen={isDescriptionModalOpen}
          onClose={() => setIsDescriptionModalOpen(false)}
          poet={poet}
          isSindhi={isSindhi}
          content={{
            fullDescription: isSindhi ? "مڪمل تفصيل" : "Full Biography",
            originalName: isSindhi ? "اصل نالو" : "Original Name",
            laqab: isSindhi ? "لقب" : "Laqab (Honorific Title)",
            takhalus: isSindhi ? "تخلص" : "Takhalus (Pen Name)"
          }}
        />
      )}
    </div>
  );
}