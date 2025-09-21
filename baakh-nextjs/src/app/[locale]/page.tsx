'use client';

import { 
  Search, Users, BookOpen, Heart, Clock, Tag, Calendar, ArrowRight, Star, 
  TrendingUp, Eye, Sparkles, Globe, Quote, BookOpenCheck, Zap, ChevronDown,
  Play, Pause, Volume2, Bookmark, Share2, MoreHorizontal, Filter,
  Award, Target, Lightbulb, Compass, Layers, Cpu, Brain, Palette, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// Import components directly
import CategoriesSection from './components/CategoriesSection';
import SmartPagination from '@/components/ui/SmartPagination';
import TimelineSection from './components/TimelineSection';
import TagsSection from './components/TagsSection';
import { useAnniversary } from '@/hooks/useAnniversary';
import AnniversaryBadge from '@/components/ui/AnniversaryBadge';
import SearchInterface from '@/components/ui/SearchInterface';
import { Logo } from '@/components/ui/logo';
import { NumberFont, MixedContentWithNumbers } from '@/components/ui/NumberFont';
import { useViewTracking } from '@/hooks/useViewTracking';
import CoupletCard from '@/components/CoupletCard';
import { OfflineStatus } from '@/components/ui/OfflineStatus';


export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  // Modern font system - Clean & Minimal
  const fontClass = isSindhi ? 'font-sindhi' : 'font-inter';
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [coupletsPage, setCoupletsPage] = useState(1);
  const coupletsPerPage = 3;
  const [poetsPage, setPoetsPage] = useState(1);
  const poetsPerPage = 4;
  
  // Stats data
  const [stats, setStats] = useState({
    totalPoetry: 0,
    totalPoets: 0,
    totalCategories: 0,
    totalTopics: 0,
    loading: true
  });
  
  // Get current anniversary data
  const { currentAnniversary, isLoading: anniversaryLoading } = useAnniversary();
  
  // Fetch stats data
  useEffect(() => {
    const controller = new AbortController();
    async function loadStats() {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // Fetch all stats in parallel
        const [poetryRes, poetsRes, categoriesRes, topicsRes] = await Promise.all([
          fetch('/api/poetry/count', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/poets?limit=1&countOnly=true', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/categories/count', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/topics/count', { signal: controller.signal, cache: 'no-store' })
        ]);
        
        const [poetryData, poetsData, categoriesData, topicsData] = await Promise.all([
          poetryRes.json(),
          poetsRes.json(),
          categoriesRes.json(),
          topicsRes.json()
        ]);
        
        setStats({
          totalPoetry: poetryData.total || 0,
          totalPoets: poetsData.total || 0,
          totalCategories: categoriesData.total || 0,
          totalTopics: topicsData.total || 0,
          loading: false
        });
      } catch (e: unknown) {
        const error = e as Error;
        if (error?.name === 'AbortError') {
          console.warn('Stats request was aborted');
        } else {
          console.error('Error loading stats:', e);
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    }
    
    loadStats();
    return () => controller.abort();
  }, []);
  
  // Smooth scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // unified loading is computed from individual data loads; initial spinner remains until all complete

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handlePoetClick = (poet: HomePoet) => {
    try {
      if (!poet.slug) {
        console.warn('Poet has no slug:', poet);
        return;
      }
      const url = isSindhi ? `/sd/poets/${poet.slug}` : `/en/poets/${poet.slug}`;
      router.push(url);
    } catch (error) {
      console.error('Error navigating to poet:', error, poet);
    }
  };

  function getTagColorClasses(slug: string): string {
    const palettes = [
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/20',
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/20',
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/20',
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/20',
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/20',
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/20',
      'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-500/15 dark:text-lime-300 dark:border-lime-400/20',
      'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-400/20',
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/20',
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/20'
    ];
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return palettes[hash % palettes.length];
  }
  
  // Content based on language
  const content = {
    title: isSindhi ? 'سنڌي شاعري جو خزانو' : 'Sindhi Poetry Archive',
    subtitle: isSindhi 
      ? 'صدين جي سنڌي ادب ۽ شاعريءَ جو شاندار مجموعو ۽ ادبي روايتن جو جديد دنيا ۾ تحفظ'
      : 'A comprehensive collection of centuries-old Sindhi literature and poetry, and the preservation of literary traditions in the modern world.',
    searchPlaceholder: isSindhi ? 'شاعري، شاعر، يا موضوع ڳوليو...' : 'Search poetry, poets, or themes...',
    meetPoets: isSindhi ? 'شاعر ڏسو' : 'Explore Poets',
    couplets: isSindhi ? 'شاعري' : 'Browse Poetry',
    explorePoetry: isSindhi ? 'شاعري ڳوليو' : 'Discover Poetry',
    browsePoets: isSindhi ? 'شاعر ڏسو' : 'Meet Poets',
    heroDescription: isSindhi
      ? 'سنڌي شاعري جي خوبصورتي دنيا ۾ داخل ٿيو، جتي هر لفظ روحاني تجربو آهي'
      : 'Step into the beautiful world of Sindhi poetry, where every word is a spiritual experience'
  };

  // Featured couplets from database (two-liners with poet info) - both EN and SD
  const [featuredCouplets, setFeaturedCouplets] = useState<Array<{
    id: number;
    couplet_text: string;
    couplet_slug: string;
    lang: string;
    lines: string[];
    tags: string[];
    poet: {
      name: string;
      slug: string;
      photo: string | null;
    };
    created_at: string;
    likes: number;
    views: number;
  }>>([]);
  const [coupletsLoaded, setCoupletsLoaded] = useState(false);

  const totalCoupletsPages = Math.max(1, Math.ceil(featuredCouplets.length / coupletsPerPage));
  const handleCoupletsPageChange = (p: number) => {
    if (p >= 1 && p <= totalCoupletsPages && p !== coupletsPage) setCoupletsPage(p);
  };
  
  // Unique poets derived from featuredCouplets for Authors row
  // Poets for Authors row: prefer API (6 senior + 6 junior); fallback to couplets-derived unique poets
  interface HomePoet { id?: string; slug: string; name: string; sindhiName?: string | null; laqab?: string | null; sindhiLaqab?: string | null; englishTagline?: string | null; sindhiTagline?: string | null; photo?: string | null; is_featured?: boolean }
  const [homePoets, setHomePoets] = useState<HomePoet[]>([]);
  const [poetsLoading, setPoetsLoading] = useState<boolean>(true);
  useEffect(() => {
    const controller = new AbortController();
    async function loadHomePoets() {
      try {
        setPoetsLoading(true);
        // Use traditional timeout approach instead of AbortSignal.timeout
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const combinedSignal = controller.signal;
        const res = await fetch(`/api/poets?limit=50&sortBy=is_featured&sortOrder=desc`, { signal: combinedSignal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        const poets = (json?.poets || []) as Array<any>;
        if (Array.isArray(poets) && poets.length > 0) {
          const seniors = poets.filter((p) => p.is_featured).slice(0, 6);
          const juniors = poets.filter((p) => !p.is_featured).slice(0, 6);
          const combined = [...seniors, ...juniors].map((p) => ({ 
            id: p.id, 
            slug: p.poet_slug || p.slug || '', 
            name: p.english_name || p.name || 'Unknown Poet', 
            sindhiName: p.sindhi_name || null, 
            laqab: p.english_laqab || null, 
            sindhiLaqab: p.sindhi_laqab || null, 
            englishTagline: p.english_tagline || null, 
            sindhiTagline: p.sindhi_tagline || null, 
            photo: p.file_url || p.photo, 
            is_featured: p.is_featured 
          }));
          setHomePoets(combined);
        } else {
          setHomePoets([]);
        }
      } catch (e) {
        console.warn('Error loading home poets:', e);
        // Fallback: derive from featured couplets if API fails
        try {
          const unique = Array.from(new Map(featuredCouplets.map((c) => [c.poet.slug, c.poet])).values()).slice(0, 12)
            .map((p: any) => ({ 
              slug: p.slug || '', 
              name: p.name || 'Unknown Poet', 
              sindhiName: p.sindhi_name || null, 
              laqab: null, 
              sindhiLaqab: null, 
              englishTagline: null, 
              sindhiTagline: null, 
              photo: p.photo 
            }));
          setHomePoets(unique as HomePoet[]);
        } catch (fallbackError) {
          console.warn('Error in fallback poet loading:', fallbackError);
          setHomePoets([]);
        }
      } finally {
        setPoetsLoading(false);
      }
    }
    
    // Wrap the async function to catch any unhandled rejections
    loadHomePoets().catch((error) => {
      console.error('Unhandled error in loadHomePoets:', error);
      setHomePoets([]);
      setPoetsLoading(false);
    });
    
    return () => controller.abort();
  }, [featuredCouplets]);

  const totalPoetsPages = Math.max(1, Math.ceil((homePoets.slice(0, 12)).length / poetsPerPage));
  const handlePoetsPageChange = (p: number) => {
    if (p >= 1 && p <= totalPoetsPages && p !== poetsPage) setPoetsPage(p);
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeaturedCouplets() {
      try {
        const currentLang = isSindhi ? 'sd' : 'en';
        console.log('Loading couplets for language:', currentLang);
        
        // Fetch couplets in the current language, more to ensure variety
        const params = new URLSearchParams({
          page: '1',
          limit: '60', // Get more to ensure we can find enough from different poets
          sortBy: 'created_at',
          sortOrder: 'desc',
          lang: currentLang, // Pass current language to API
          standalone: '1' // Only standalone couplets (poetry_id null or 0)
        });
        
        console.log('API request params:', params.toString());
        // Use traditional timeout approach instead of AbortSignal.timeout
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const combinedSignal = controller.signal;
        const res = await fetch(`/api/couplets?${params.toString()}`, { signal: combinedSignal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (!res.ok) {
          console.error('API response not ok:', res.status, res.statusText);
          setFeaturedCouplets([]);
          setCoupletsLoaded(true);
          return;
        }
        const json = await res.json();
        if (json?.couplets) {
          console.log('Received couplets:', json.couplets.length, 'Language requested:', currentLang);
          
          // Group couplets by poet and find the poet with most couplets
          const poetGroups: Record<string, { poet: any; couplets: any[] }> = json.couplets.reduce((acc: Record<string, { poet: any; couplets: any[] }>, couplet: any) => {
            const poetId = couplet.poet?.id || couplet.poet?.slug || 'unknown';
            if (!acc[poetId]) {
              acc[poetId] = {
                poet: couplet.poet,
                couplets: []
              };
            }
            acc[poetId].couplets.push(couplet);
            return acc;
          }, {});
          
          // Ensure one couplet per poet for maximum diversity
          const allPoets = Object.values(poetGroups);
          const selectedCouplets: any[] = [];
          const usedPoetIds = new Set<string>();
          
          // Shuffle the poets array for random selection
          const shuffledPoets = allPoets.sort(() => Math.random() - 0.5);
          
          // Take exactly one couplet from each unique poet
          const maxCouplets = Math.min(24, shuffledPoets.length); // Don't exceed available poets
          
          for (const poetGroup of shuffledPoets) {
            if (selectedCouplets.length >= maxCouplets) break;
            
            const poetId = poetGroup.poet?.id || poetGroup.poet?.slug || 'unknown';
            
            // Skip if we already have a couplet from this poet
            if (usedPoetIds.has(poetId)) continue;
            
            // Select one couplet from this poet
            const randomCouplet = poetGroup.couplets[Math.floor(Math.random() * poetGroup.couplets.length)];
            selectedCouplets.push(randomCouplet);
            usedPoetIds.add(poetId); // Mark this poet as used
          }
          
          setFeaturedCouplets(selectedCouplets);
          console.log('Selected couplets from different poets:', selectedCouplets.length, 'Unique poets used:', usedPoetIds.size, 'Total available poets:', allPoets.length, 'Max couplets:', maxCouplets);
        } else {
          console.log('No couplets in response:', json);
          setFeaturedCouplets([]);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError' || /timed out|signal timed out/i.test(String(e?.message))) {
          console.warn('Featured couplets request timed out');
        } else {
          console.error('Error loading featured couplets:', e);
        }
        // Set empty array on error to prevent infinite loading
        setFeaturedCouplets([]);
      }
      finally {
        console.log('Setting coupletsLoaded to true');
        setCoupletsLoaded(true);
      }
    }
    loadFeaturedCouplets();
    return () => controller.abort();
  }, [isSindhi]); // Add isSindhi as dependency to refetch when language changes

  // Categories from database (localized display)
  const [categories, setCategories] = useState<Array<{
    id: string;
    slug: string;
    englishName: string;
    sindhiName: string;
    englishPlural?: string;
    sindhiPlural?: string;
    englishDetails: string;
    sindhiDetails: string;
    contentStyle: string;
    languages: string[];
    summary: string;
  }>>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      try {
        const params = new URLSearchParams({
          limit: '4'
        });
        // Use traditional timeout approach instead of AbortSignal.timeout
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const combinedSignal = controller.signal;
        const res = await fetch(`/api/categories?${params.toString()}`, { signal: combinedSignal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (!res.ok) return;
        const json = await res.json();
        if (json?.items) {
          setCategories(json.items as typeof categories);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError' || /timed out|signal timed out/i.test(String(e?.message))) {
          console.warn('Homepage categories request timed out');
        } else {
          console.error('Error loading homepage categories:', e);
        }
      } finally {
        setCategoriesLoaded(true);
      }
    }
    loadCategories();
    return () => controller.abort();
  }, []);

  // Tags from database for Topics
  interface TagItem {
    id: string;
    slug: string;
    label: string;
    tag_type: string;
    created_at: string;
    tags_translations?: Array<{
      lang_code: string;
      title: string;
      detail: string;
    }>;
  }
  const [tags, setTags] = useState<TagItem[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function loadTags() {
      try {
        const lang = isSindhi ? 'sd' : 'en';
        // Use traditional timeout approach instead of AbortSignal.timeout
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const combinedSignal = controller.signal;
        const res = await fetch(`/api/tags?lang=${lang}&type=Topic&limit=18`, { signal: combinedSignal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (!res.ok) return;
        const json = await res.json();
        if (json?.tags) {
          setTags(json.tags as TagItem[]);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError' || /timed out|signal timed out/i.test(String(e?.message))) {
          console.warn('Homepage tags request timed out');
        } else {
          console.error('Error loading homepage tags:', e);
        }
      } finally {
        setTagsLoaded(true);
      }
    }
    loadTags();
    return () => controller.abort();
  }, [isSindhi]);

  // compute unified loading state - include all sections
  useEffect(() => {
    // Set a very short timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, forcing load complete');
      setIsLoading(false);
    }, 1000); // 1 second timeout

    // Force loading to complete after 1 second regardless
    const criticalLoaded = !coupletsLoaded;
    console.log('Loading states:', {
      anniversaryLoading,
      poetsLoading,
      coupletsLoaded,
      categoriesLoaded,
      tagsLoaded,
      criticalLoaded
    });
    
    setIsLoading(criticalLoaded);
    
    return () => clearTimeout(timeoutId);
  }, [coupletsLoaded]);

  // Featured poets are now lazy loaded in the LazyFeaturedPoets component

  // Timeline and tags are now lazy loaded in their respective components



  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    setCurrentTime(time);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Offline Status Indicator */}
      <OfflineStatus isSindhi={isSindhi} />
      
      {false ? ( // Temporarily disable loading state
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
        <div className="max-w-[1200px] mx-auto px-4">







      {/* Hero Section */}
          <motion.section 
            id="hero" 
            className="pt-16 pb-20 bg-white border-b border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-4xl mx-auto space-y-10 text-center">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Anniversary Badge */}
                {anniversaryLoading ? (
                  <motion.div 
                    className="flex justify-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-flex items-center gap-3 px-4 py-3 border rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex flex-col gap-1">
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>
                ) : currentAnniversary ? (
                  <AnniversaryBadge
                    poetName={currentAnniversary.poetName}
                    avatarUrl={currentAnniversary.avatarUrl}
                    anniversaryType={currentAnniversary.anniversaryType}
                    date={currentAnniversary.date}
                    isSindhi={isSindhi}
                    poetSlug={currentAnniversary.poetSlug}
                  />
                ) : null}
                
                {/* Logo */}
                <motion.div 
                  className="flex justify-center items-center mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <img
                    src="/Baakh.svg"
                    alt="Baakh"
                    className="h-16 w-auto"
                  />
                </motion.div>

                <h1 
                  className={`${isSindhi ? 'sd-hero-title' : 'text-4xl md:text-5xl font-serif text-black leading-tight tracking-tight'}`}
                  style={isSindhi ? undefined : {}}
                >
                  {content.title}
                </h1>
                <p 
                  className={`text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light ${isSindhi ? 'auto-sindhi-font card-text' : ''}`}
                  style={isSindhi ? { fontFamily: 'var(--font-sindhi-primary)' } : {}}
                >
                  {content.subtitle}
                </p>
            

              </motion.div>
          
          {/* Search Bar */}
              <motion.div 
                className="max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchInterface />
              </motion.div>

          {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button asChild variant="outline" size="lg" className="h-12 px-8 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-base bg-white">
              <Link href={isSindhi ? "/sd/poets" : "/en/poets"}>
                    <Users className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                      {content.meetPoets}
                    </span>
              </Link>
            </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-base bg-white">
              <Link href={isSindhi ? "/sd/couplets" : "/en/couplets"}>
                    <BookOpen className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                      {content.couplets}
                    </span>
              </Link>
            </Button>
              </motion.div>

          {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-12 border-t border-gray-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
            <div key="poetry-stat" className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-7 w-12 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                        {stats.totalPoetry.toLocaleString()}
                      </NumberFont>
                      <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        {isSindhi ? 'شاعري' : 'Poetry'}
                      </div>
                    </>
                  )}
            </div>
            <div key="poets-stat" className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-7 w-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-8 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                        {stats.totalPoets.toLocaleString()}
                      </NumberFont>
                      <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        {isSindhi ? 'شاعر' : 'Poets'}
                      </div>
                    </>
                  )}
            </div>
            <div key="categories-stat" className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-7 w-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                        {stats.totalCategories.toLocaleString()}
                      </NumberFont>
                      <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        {isSindhi ? 'صنفون' : 'Categories'}
                      </div>
                    </>
                  )}
            </div>
            <div key="topics-stat" className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-7 w-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                        {stats.totalTopics.toLocaleString()}
                      </NumberFont>
                      <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        {isSindhi ? 'موضوع' : 'Topics'}
                      </div>
                    </>
                  )}
            </div>
              </motion.div>
          </div>
          </motion.section>

          {/* Trusted by Poets Section */}
          <motion.section 
            className="py-16 bg-gray-50/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Headline */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
                  {isSindhi ? 'سنڌي ٻوليءَ جا شاعر' : 'Contributing Poets'}
                </h2>
                <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
                  {isSindhi 
                    ? 'تخليقي آواز جيڪي جديد شاعريءَ جي اظهار کي شڪل ڏين ٿا.'
                    : 'Exploring the creative voices shaping contemporary poetic expression.'
                  }
                </p>
              </motion.div>

              {/* Avatar Row - Only show if poets are available */}
              {homePoets.length > 0 ? (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {/* Desktop: Two rows of avatars */}
                  <div className="hidden md:block">
                    <div className="flex justify-center items-center gap-4 mb-4">
                      {/* First row - up to 7 avatars */}
                      {homePoets.slice(0, 7).map((poet, index) => {
                        const colors = ['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-orange-100', 'bg-pink-100', 'bg-indigo-100', 'bg-teal-100'];
                        const color = colors[index % colors.length];
                        
                        return (
                          <Tooltip key={poet.slug || index}>
                            <TooltipTrigger asChild>
                              <div 
                                onClick={() => handlePoetClick(poet)}
                                className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-gray-700 font-medium text-xl cursor-pointer hover:scale-105 transition-transform`}
                              >
                                <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? (poet.sindhiName || poet.name).charAt(0) : poet.name.charAt(0)}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              sideOffset={6}
                              className="bg-black border-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
                              avoidCollisions={true}
                              collisionPadding={4}
                            >
                              {isSindhi ? (poet.sindhiName || poet.name) : poet.name}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                    {homePoets.length > 7 && (
                      <div className="flex justify-center items-center gap-4">
                        {/* Second row - remaining avatars */}
                        {homePoets.slice(7, 12).map((poet, index) => {
                          const colors = ['bg-rose-100', 'bg-cyan-100', 'bg-amber-100', 'bg-emerald-100', 'bg-violet-100'];
                          const color = colors[index % colors.length];
                          
                          return (
                            <Tooltip key={poet.slug || (index + 7)}>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={() => handlePoetClick(poet)}
                                  className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-gray-700 font-medium text-xl cursor-pointer hover:scale-105 transition-transform`}
                                >
                                  <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                    {isSindhi ? (poet.sindhiName || poet.name).charAt(0) : poet.name.charAt(0)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                sideOffset={6}
                                className="bg-black border-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
                                avoidCollisions={true}
                                collisionPadding={4}
                              >
                                {isSindhi ? (poet.sindhiName || poet.name) : poet.name}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile: Horizontal scrollable */}
                  <div className="md:hidden">
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                      {homePoets.slice(0, 12).map((poet, index) => {
                        const colors = ['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-orange-100', 'bg-pink-100', 'bg-indigo-100', 'bg-teal-100', 'bg-rose-100', 'bg-cyan-100', 'bg-amber-100', 'bg-emerald-100', 'bg-violet-100'];
                        const color = colors[index % colors.length];
                        
                        return (
                          <Tooltip key={poet.slug || index}>
                            <TooltipTrigger asChild>
                              <div 
                                onClick={() => handlePoetClick(poet)}
                                className={`w-18 h-18 rounded-full ${color} flex items-center justify-center text-gray-700 font-medium text-lg cursor-pointer flex-shrink-0 snap-center hover:scale-105 transition-transform`}
                              >
                                <span className={`${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? (poet.sindhiName || poet.name).charAt(0) : poet.name.charAt(0)}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              sideOffset={6}
                              className="bg-black border-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
                              avoidCollisions={true}
                              collisionPadding={4}
                            >
                              {isSindhi ? (poet.sindhiName || poet.name) : poet.name}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="mb-8 text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className={`text-gray-500 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'ڪو به شاعر دستياب ناهي' : 'No poets available at the moment'}
                  </p>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button asChild variant="outline" size="lg" className="h-11 px-6 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white">
                  <Link href={isSindhi ? "/sd/poets" : "/en/poets"}>
                    <Users className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                      {isSindhi ? 'شاعر ڳوليو' : 'Explore Poets'}
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white">
                  <Link href={isSindhi ? "/sd/submit" : "/en/submit"}>
                    <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                      {isSindhi ? 'پنهنجو ڪم پيش ڪريو' : 'Submit Your Work'}
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.section>

          {/* Authors Row */}
          <motion.section 
            className="py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div 
                key="poets-grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                layout
              >
                {poetsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <motion.div 
                      key={`poet-skel-${i}`} 
                      className="border border-gray-200/50 rounded-[12px] bg-white p-3 flex items-center gap-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  homePoets.slice(0, 12)
                    .slice((poetsPage - 1) * poetsPerPage, poetsPage * poetsPerPage)
                    .map((poet: any, index: number) => (
                    <motion.div
                      key={poet.slug}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      layout
                    >
                      <Link href={`${isSindhi ? '/sd' : '/en'}/poets/${poet.slug}`} className="group">
                        <motion.div 
                          className="border border-gray-200/50 rounded-[12px] bg-white p-3 flex items-center gap-3 transition-colors hover:bg-gray-50"
                        >
                          <Avatar className="w-8 h-8 rounded-full ring-0">
                            <AvatarImage src={poet.photo || undefined} alt={poet.name} />
                            <AvatarFallback className={cn(
                              "text-[11px] font-medium bg-gray-50 border border-gray-200/40 text-foreground",
                              isSindhi ? 'auto-sindhi-font' : ''
                            )}>
                              {isSindhi 
                                ? poet.name.charAt(0)
                                : poet.name
                                    .split(' ')
                                    .map((n: string) => n.charAt(0))
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          <motion.div 
                            className="min-w-0"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                          >
                            <div className={`truncate ${isSindhi ? 'auto-sindhi-font card-text' : 'text-[15px] text-gray-900'}`}>
                              {isSindhi
                                ? (poet.sindhiLaqab || poet.sindhiName || poet.name)
                                : (poet.laqab || poet.name)}
                            </div>
                            <div className={`truncate ${isSindhi ? 'auto-sindhi-font text-[10px] text-gray-500' : 'text-xs text-gray-500'}`}>
                              {isSindhi ? (poet.sindhiTagline || '') : (poet.englishTagline || '')}
                            </div>
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
              {!poetsLoading && homePoets.slice(0, 12).length > poetsPerPage && (
                <motion.div 
                  className="mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <SmartPagination
                    currentPage={poetsPage}
                    totalPages={totalPoetsPages}
                    onPageChange={handlePoetsPageChange}
                    isRTL={isRTL}
                  />
                </motion.div>
              )}
            </div>
          </motion.section>

      {/* Featured Couplets */}
          <motion.section 
            id="featured" 
            className="py-20 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
        <div className="max-w-6xl mx-auto">
              <motion.div 
                className="text-center mb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
                  {isSindhi ? 'چونڊ شعر' : 'Featured Couplets'}
                </h2>
                <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
                  {isSindhi
                    ? 'اسانجي مجموعي مان سڀ کان خوبصورت ۽ معنيٰ خيز شعر'
                    : 'Discover the most beautiful and meaningful couplets from our collection'}
                </p>
                <div className="mt-6" />
              </motion.div>
              
              {/* Filters removed */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {!coupletsLoaded ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                        <CardContent className="p-8">
                          <div className="flex justify-end mb-6">
                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                          </div>
                          <div className="space-y-4 mb-8">
                            <div className="h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="h-6 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  featuredCouplets
                    .slice((coupletsPage - 1) * coupletsPerPage, (coupletsPage) * coupletsPerPage)
                    .map((couplet, index) => (
                      <CoupletCard
                        key={`couplet-${couplet.id || `unknown-${(coupletsPage - 1) * coupletsPerPage + index}`}`}
                        couplet={couplet}
                        isSindhi={isSindhi}
                        index={index}
                      />
                    ))
                )}
              </div>

              {featuredCouplets.length > coupletsPerPage && (
                <div className="mt-16">
                  <SmartPagination
                    currentPage={coupletsPage}
                    totalPages={totalCoupletsPages}
                    onPageChange={handleCoupletsPageChange}
                    isRTL={isRTL}
                  />
                </div>
              )}

        </div>
          </motion.section>



      {/* Categories */}
      <CategoriesSection isSindhi={isSindhi} categories={categories} />

      {/* Featured Poets removed per request */}

      {/* Historical Timeline */}
      <TimelineSection isSindhi={isSindhi} />

      {/* Tags & Topics */}
      <TagsSection isSindhi={isSindhi} tags={tags} />

    
      {/* Scroll to Top Button */}
      {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
        <Button
          onClick={scrollToTop}
          size="lg"
                className="fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 shadow-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black z-50"
          aria-label="Scroll to top"
        >
          <ChevronDown className="h-5 w-5 rotate-180" />
        </Button>
            </motion.div>
      )}

      {/* Footer is now handled by the reusable Footer component in layout.tsx */}
          </div>
          </>
        )}
    </div>
  );
}
