"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Calendar,
  Star,
  Eye,
  BookOpenCheck,
  Share,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
// Removed unused Avatar and Image imports
import { usePathname, useRouter } from "next/navigation";
import { NumberFont, MixedContentWithNumbers } from "@/components/ui/NumberFont";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { getPrimaryPoetName, getSecondaryPoetName, getAvatarPoetName } from "@/lib/poet-name-utils";
import SmartPagination from "@/components/ui/SmartPagination";
import { getErrorInfo, isApiError, isNetworkError, isTimeoutError } from "@/lib/error-types";

interface Poet {
  id: string;
  poet_slug: string;
  english_name: string;
  english_laqab?: string;
  english_tagline?: string;
  english_details?: string;
  sindhi_name?: string;
  sindhi_laqab?: string;
  sindhi_tagline?: string;
  sindhi_details?: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  death_place?: string;
  tags?: string[];
  translated_tags?: string[];
  file_url?: string | null;
  photo?: string;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  display_name?: string;
  display_laqab?: string;
  display_tagline?: string;
}

interface PoetsResponse {
  poets: Poet[];
  total: number;
  page: number;
  limit: number;
}

export default function PoetsPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const router = useRouter();
  
  const [poets, setPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("All Periods");
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'english_name' | 'birth_date' | 'is_featured'>('birth_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [perPage] = useState(12);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [poetStats, setPoetStats] = useState<{[key: string]: {views: number, poetryCount: number}}>({});
  const [copiedPoetId, setCopiedPoetId] = useState<string | null>(null);
  const [detailsPoet, setDetailsPoet] = useState<Poet | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Refs for timeout management
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animated counter component
  const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      const startValue = displayValue;
      const endValue = value;
      const duration = 500; // 500ms animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutCubic);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [value]);
    
    return (
      <motion.span
        key={value}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`number ${className || ''}`}
        data-number="true"
      >
        {displayValue}
      </motion.span>
    );
  };

  // Normalize image src for next/image (supports absolute URLs and public assets)
  const resolveImageSrc = (src: string | null | undefined): string | null => {
    if (!src) return null;
    const url = String(src).trim();
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.startsWith('/')) return url;
    // Strip leading public/ if present and ensure leading slash
    if (url.startsWith('public/')) return `/${url.slice(7)}`;
    return `/${url}`;
  };

  // Local component to avoid DOM mutations on image error and prevent duplicate avatars
  function PoetImage({ src, alt, isSindhi, fallbackInitial }: { src: string | null; alt: string; isSindhi: boolean; fallbackInitial: string }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className={`text-2xl font-semibold text-gray-700 ${getSmartFontClass(fallbackInitial)}`}>
              {fallbackInitial.charAt(0)}
            </span>
          </div>
        </div>
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        width={300}
        height={300}
        onError={() => setFailed(true)}
      />
    );
  }

  // Multi-lingual content
  const content = {
    title: isSindhi ? 'سنڌي شاعر' : 'Sindhi Poets',
    subtitle: isSindhi 
    ? 'سنڌي شاعريءَ جي خوبصورت شاعرن کي ڳوليو، جيڪي صدين کان سنڌي شاعري جي واٽ کي برقرار ڪندا اچن پيا '      : 'Discover the great poets of Sindhi poetry, bearers of centuries of literary tradition',
    searchPlaceholder: isSindhi ? 'شاعر ڳوليو...' : 'Search poets...',
    allPeriods: isSindhi ? 'سڀ دور' : 'All Periods',
    seventeenthCentury: isSindhi ? '17ھين صدي' : '17th Century',
    eighteenthCentury: isSindhi ? '18ھين صدي' : '18th Century',
    nineteenthCentury: isSindhi ? '19ھين صدي' : '19th Century',
    twentiethCentury: isSindhi ? '20ھين صدي' : '20th Century',

    viewProfile: isSindhi ? 'پروفائل ڏسو' : 'View Profile',
    featured: isSindhi ? 'چونڊ' : 'Featured',
    period: isSindhi ? 'دور' : 'Period',
    location: isSindhi ? 'مقام' : 'Location',
    noPoetsFound: isSindhi ? 'ڪوئي شاعر نه مليو' : 'No poets found',
    loading: isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...',
    sortByName: isSindhi ? 'نالي مطابق' : 'Sort by Name',
    sortByDate: isSindhi ? 'عمر مطابق' : 'Sort by Age',
    sortByFeatured: isSindhi ? 'چونڊ مطابق' : 'Sort by Featured',
    ascending: isSindhi ? 'وڏا پهرين' : 'Senior First',
    descending: isSindhi ? 'ننڍا پهرين' : 'Junior First',
    filters: isSindhi ? 'فلٽر' : 'Filters',
    clearFilters: isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters',
    applyFilters: isSindhi ? 'فلٽر لاڳو ڪريو' : 'Apply Filters',
    poetsFound: isSindhi ? 'شاعر مليا' : 'poets found',
    showing: isSindhi ? 'ڏيکاري رهيا آهيون' : 'Showing',
    of: isSindhi ? 'جي' : 'of',
    total: isSindhi ? 'ڪل' : 'total',
    explorePoets: isSindhi ? 'شاعر ڳوليو' : 'Explore Poets',
    discoverPoetry: isSindhi ? 'شاعري ڏسو' : 'Discover Poetry',
    literaryHeritage: isSindhi ? 'ادبي ورثو' : 'Literary Heritage',
    centuriesOfPoetry: isSindhi ? 'صدين جي شاعري' : 'Centuries of Poetry',
    chronologicalSorting: isSindhi ? 'شاعرن کي عمر جي حساب سان ترتيب ڏنو ويو آهي - وڏا شاعر پهرين ۽ ننڍا شاعر آخر ۾' : 'Poets are arranged chronologically by age - senior poets first, junior poets last',
    seniorPoetsFirst: isSindhi ? 'وڏا شاعر پهرين' : 'Senior Poets First',
    century: isSindhi ? 'صدي' : 'Century',
    yearsActive: isSindhi ? 'سرگرم سال' : 'Years Active',
    views: isSindhi ? 'ڏيکاريون' : 'Views',
    works: isSindhi ? 'ڪم' : 'Works',
    share: isSindhi ? 'ونڊيو' : 'Share'
  };

  const periods = [
    content.allPeriods, 
    content.seventeenthCentury, 
    content.eighteenthCentury, 
    content.nineteenthCentury, 
    content.twentiethCentury
  ];

  // Removed unused sd function
  // Handlers for card actions
  const handleViewClick = async (poet: Poet) => {
    // Track the view
    try {
      await fetch(`/api/poets/${poet.id}/view/`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
    
    const base = isSindhi ? '/sd' : '/en';
    router.push(`${base}/poets/${poet.poet_slug}`);
  };

  const handleWorksClick = (poet: Poet) => {
    const base = isSindhi ? '/sd' : '/en';
    router.push(`${base}/couplets?poet=${poet.id}`);
  };

  const handleShareClick = async (poet: Poet) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = isSindhi ? '/sd' : '/en';
    const url = `${origin}${base}/poets/${poet.poet_slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: poet.english_name || poet.sindhi_name || 'Poet', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopiedPoetId(poet.id);
        // Clear existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopiedPoetId((cur) => (cur === poet.id ? null : cur)), 1500);
      } else {
        // Fallback
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        setCopiedPoetId(poet.id);
        // Clear existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopiedPoetId((cur) => (cur === poet.id ? null : cur)), 1500);
      }
    } catch (error: unknown) {
      const errorInfo = getErrorInfo(error);
      const message = errorInfo.message.toLowerCase();
      const name = errorInfo.name.toLowerCase();
      
      if (name.includes('abort') || message.includes('abort') || message.includes('canceled') || message.includes('cancelled')) {
        return;
      }
      
      // Log specific error types for debugging
      if (isApiError(error)) {
        console.warn('Share API error:', errorInfo);
      } else if (isNetworkError(error)) {
        console.warn('Share network error:', errorInfo);
      } else {
        console.warn('Share error:', errorInfo);
      }
    }
  };


  

  // Fetch poet statistics (views and poetry count)
  const fetchPoetStats = useCallback(async (poetIds: string[]) => {
    try {
      const response = await fetch(`/api/poets/stats/?poetIds=${poetIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        const statsMap: {[key: string]: {views: number, poetryCount: number}} = {};
        data.stats?.forEach((stat: Record<string, unknown>) => {
          const poetId = String(stat.poet_id || '');
          statsMap[poetId] = {
            views: Number(stat.total_views || 0),
            poetryCount: Number(stat.poetry_count || 0)
          };
        });
        setPoetStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching poet stats:', error);
    }
  }, []);

  

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIdx = (page-1)*perPage + 1;

  const fetchPoets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        search: debouncedSearchQuery,
        period: selectedPeriod,
        sortBy,
        sortOrder,
        lang: isSindhi ? 'sd' : 'en'
      });

      console.log('Fetching poets with params:', params.toString());
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/poets/?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data: PoetsResponse = await response.json();
        const fp: Poet | null = data.poets?.[0] || null;
        console.log('Frontend - Received poets data:', {
          total: data.total,
          poetsCount: data.poets?.length || 0,
          firstPoetSample: fp ? {
            id: fp.id,
            slug: fp.poet_slug,
            english_name: fp.english_name,
            sindhi_name: fp.sindhi_name,
            english_laqab: fp.english_laqab,
            sindhi_laqab: fp.sindhi_laqab,
            sindhi_tagline: fp.sindhi_tagline,
            english_tagline: fp.english_tagline,
            sindhi_details: fp.sindhi_details?.slice?.(0, 60),
            english_details: fp.english_details?.slice?.(0, 60),
            birth_date: fp.birth_date,
            death_date: fp.death_date,
            file_url: fp.file_url,
            photo: fp.photo,
          } : null
        });
        setPoets(data.poets || []);
        setTotal(data.total || 0);
        
        // Fetch statistics for the loaded poets
        if (data.poets && data.poets.length > 0) {
          const poetIds = data.poets.map((poet: Poet) => poet.id);
          fetchPoetStats(poetIds);
        }
      } else {
        console.error('Failed to fetch poets:', response.status, response.statusText);
        const errorMessage = `Failed to load poets (${response.status})`;
        setError(errorMessage);
        // Set empty state on error
        setPoets([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching poets:", error);
      
      // Handle specific error types, including timeout variations
      let errorMessage = 'Failed to load poets';
      if (error instanceof Error) {
        const isTimeout =
          error.name === 'AbortError' ||
          error.name === 'TimeoutError' ||
          /timed out/i.test(error.message) ||
          /signal timed out/i.test(error.message);
        if (isTimeout) {
          errorMessage = 'Request timed out. Please try again.';
          console.error('Request timed out');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
          console.error('Network error - check if API server is running');
        } else {
          errorMessage = error.message || 'An unexpected error occurred';
        }
      }
      
      setError(errorMessage);
      // Set empty state on error
      setPoets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearchQuery, selectedPeriod, sortBy, sortOrder, isSindhi, fetchPoetStats]);

  const retryFetch = () => {
    fetchPoets();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setPage(1);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPeriod(content.allPeriods);
    setSortBy('birth_date');
    setSortOrder('asc');
    setPage(1);
  };

  

  useEffect(() => {
    // Check network status before fetching
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network.');
      setLoading(false);
      return;
    }
    
    console.log('Poets page useEffect triggered with:', {
      page,
      perPage,
      searchQuery,
      debouncedSearchQuery,
      selectedPeriod,
      sortBy,
      sortOrder,
      isSindhi,
      lang: isSindhi ? 'sd' : 'en'
    });
    
    fetchPoets();
  }, [page, perPage, debouncedSearchQuery, selectedPeriod, sortBy, sortOrder, fetchPoets, isSindhi]);

  // Add network status listeners
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is back online');
      if (error && error.includes('internet connection')) {
        setError(null);
        fetchPoets(); // Retry automatically when back online
      }
    };

    const handleOffline = () => {
      console.log('Network is offline');
      setError('No internet connection. Please check your network.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, fetchPoets]);

  // Use the new utility functions for consistent poet name handling
  const getDisplayName = (poet: Poet) => getPrimaryPoetName(poet, isSindhi);

  const getDisplayTagline = (poet: Poet) => {
    if ('display_tagline' in poet && poet.display_tagline) {
      return poet.display_tagline;
    }
    return isSindhi && poet.sindhi_tagline ? poet.sindhi_tagline : poet.english_tagline;
  };

  const getDisplayDetails = (poet: Poet) => {
    const text = isSindhi ? poet.sindhi_details : poet.english_details;
    return (text || '').toString().trim();
  };

  // Helper function to get century badge
  const getCenturyBadge = (birthDate?: string) => {
    if (!birthDate) return null;
    
    const birthYear = parseInt(birthDate);
    if (isNaN(birthYear)) return null;
    
    if (birthYear < 1700) return { label: isSindhi ? '17ھين صدي' : '17th Century', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    if (birthYear < 1800) return { label: isSindhi ? '18ھين صدي' : '18th Century', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    if (birthYear < 1900) return { label: isSindhi ? '19ھين صدي' : '19th Century', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    if (birthYear < 2000) return { label: isSindhi ? '20ھين صدي' : '20th Century', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return { label: isSindhi ? '21ھين صدي' : '21st Century', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  // Helper function to get years active
  const getYearsActive = (birthDate?: string, deathDate?: string, tags?: string[]) => {
    if (!birthDate) return null;

    // Determine women poet from tags (string-based)
    const isWomenPoet = Array.isArray(tags) && tags.some(t => /women|woman|female|عورت|اِرت/gi.test(String(t)));

    const birthYear = parseInt(birthDate);
    if (isNaN(birthYear)) return null;

    if (deathDate) {
      const deathYear = parseInt(deathDate);
      if (!isNaN(deathYear)) {
        return `${birthYear} - ${deathYear}`;
      }
    }

    return `${birthYear} - ${isSindhi ? (isWomenPoet ? 'جيئري' : 'جيئرو') : 'alive'}`;
  };



  // Skeleton loader component for poet cards
  const PoetCardSkeleton = () => (
    <div className="animate-pulse">
      <Card className="h-full border border-gray-200 bg-white overflow-hidden">
        {/* Image skeleton */}
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
          {/* Century badge skeleton */}
          <div className="absolute top-3 left-3">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          {/* Featured badge skeleton */}
          <div className="absolute top-3 right-3">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <CardContent className="p-6">
          {/* Name skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Tagline skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          {/* Years skeleton */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
  
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Hero Section - NOT TOUCHED as requested */}
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.title)}`}>
            {content.title}
          </h1>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 ${getSmartFontClass(content.subtitle)}`}>
            {content.subtitle}
          </p>
          
          {/* Academic Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className={`text-sm text-blue-700 font-medium ${getSmartFontClass(content.chronologicalSorting)}`}>
                {content.chronologicalSorting}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Search and Filters - Always Visible */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-lg">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                <Input
                  type="text"
                  placeholder={content.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`h-10 text-base ${isRTL ? 'pr-12' : 'pl-12'} border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 rounded-xl transition-all duration-200 ${getSmartFontClass(content.searchPlaceholder)}`}
                />
                {loading && searchQuery !== debouncedSearchQuery && (
                  <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Period Filter */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.period)}`}>
                  {content.period}
                </label>
                <div className="relative group">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    disabled={loading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${getSmartFontClass(selectedPeriod)} ${loading ? 'opacity-75' : ''}`}
                  >
                    {periods.map((period) => (
                      <option key={period} value={period} className={getSmartFontClass(period)}>
                        {period}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByName)}`}>
                  {content.sortByName}
                </label>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                    disabled={loading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${loading ? 'opacity-75' : ''}`}
                  >
                    <option value="english_name" className={getSmartFontClass(content.sortByName)}>{content.sortByName}</option>
                    <option value="birth_date" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
                    <option value="is_featured" className={getSmartFontClass(content.sortByFeatured)}>{content.sortByFeatured}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.ascending)}`}>
                  {content.ascending}
                </label>
                <div className="relative group">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    disabled={loading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${loading ? 'opacity-75' : ''}`}
                  >
                    <option value="asc" className={getSmartFontClass(content.ascending)}>{content.ascending}</option>
                    <option value="desc" className={getSmartFontClass(content.descending)}>{content.descending}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  disabled={loading}
                  className={`w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm ${loading ? 'opacity-75' : ''}`}
                >
                  <span className={`font-medium ${getSmartFontClass(content.clearFilters)}`}>
                    {content.clearFilters}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Results Summary */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ) : (
              <p className={`text-gray-600 text-lg mb-3 ${getSmartFontClass(content.showing)}`}>
                {isSindhi ? (
                  <>پاڻ کي <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> شاعر مليا آھن، جنھن مان پيج <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + poets.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
                ) : (
                  <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + poets.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.poetsFound}</>
                )}
              </p>
            )}
          </div>
        </motion.div>

        {/* Poets Grid */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {loading ? (
            // Show skeleton loaders while loading
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PoetCardSkeleton />
                </motion.div>
              ))}
            </div>
          ) : error ? (
            // Show error state with retry button
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                <Users className="h-12 w-12 text-red-500" />
              </div>
              <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${getSmartFontClass('Error loading poets')}`}>
                {isSindhi ? 'شاعرن کي لوڊ ڪرڻ ۾ مسئلو' : 'Error Loading Poets'}
              </h3>
              <p className={`text-gray-600 mb-6 max-w-md mx-auto ${getSmartFontClass(error)}`}>
                {error}
              </p>
              <Button 
                onClick={retryFetch}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl"
              >
                <span className={`font-medium ${getSmartFontClass('Try Again')}`}>
                  {isSindhi ? 'ٻيھر ڪوشش ڪريو' : 'Try Again'}
                </span>
              </Button>
            </div>
          ) : poets.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <p className={`text-gray-500 text-xl ${getSmartFontClass(content.noPoetsFound)}`}>{content.noPoetsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {poets.map((poet, index) => {
                const centuryBadge = getCenturyBadge(poet.birth_date);
                const yearsActive = getYearsActive(poet.birth_date, poet.death_date, poet.tags);
                
                // Debug logging for image issues and tags
                console.log(`Poet ${getPrimaryPoetName(poet, isSindhi)}:`, {
                  file_url: poet.file_url,
                  hasImage: !!poet.file_url,
                  name: getPrimaryPoetName(poet, isSindhi),
                  tags: poet.tags,
                  translated_tags: poet.translated_tags
                });
                
                return (
                  <motion.div
                    key={poet.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="group"
                  >
                    <Card className="h-full border border-gray-200 bg-white overflow-hidden">
                      {/* Poet Image and Century Badge */}
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                          <PoetImage
                            src={resolveImageSrc(poet.file_url || poet.photo || null)}
                            alt={getPrimaryPoetName(poet, isSindhi)}
                            isSindhi={!!isSindhi}
                            fallbackInitial={getAvatarPoetName(poet, isSindhi)}
                          />
                        </div>
                        
                        {/* Century Badge */}
                        {centuryBadge && (
                          <div className="absolute top-3 left-3">
                            <Badge className={`${centuryBadge.color} border px-3 py-1 rounded-full text-xs font-semibold ${getSmartFontClass(centuryBadge.label)}`}>
                              <MixedContentWithNumbers 
                                text={centuryBadge.label}
                                className="text-xs"
                              />
                            </Badge>
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {poet.is_featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1 rounded-full">
                              <Star className="h-3 w-3 mr-1" />
                              <span className={`text-xs font-semibold ${getSmartFontClass(content.featured)}`}>
                                {content.featured}
                              </span>
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Poet Info */}
                      <CardContent className="px-5 pt-4 pb-5">
                        {/* Main title as Laqab, subtitle as Tagline */}
                        <div className="mb-0">
                          <h3 className={`text-xl ${isSindhi ? 'font-bold' : 'font-semibold'} text-gray-900 ${getSmartFontClass(getDisplayName(poet))} group-hover:underline underline-offset-2`}>
                            {getDisplayName(poet)}
                          </h3>
                          {/* Show secondary name if available */}
                          {getSecondaryPoetName(poet, isSindhi) && (
                            <p className={`text-sm text-gray-500 -mt-1 ${getSmartFontClass(getSecondaryPoetName(poet, isSindhi)!)}`}>
                              {getSecondaryPoetName(poet, isSindhi)}
                            </p>
                          )}
                        </div>

                        {/* Tagline as subtitle */}
                        {getDisplayTagline(poet) && (
                          <p className={`text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed ${isSindhi ? 'font-light' : 'font-light'} ${getSmartFontClass(getDisplayTagline(poet) || '')}`}>
                            {getDisplayTagline(poet)}
                          </p>
                        )}

                        {/* Birth/Death and Years Active */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                              {isSindhi ? 'پيدائش' : 'Born'}: {poet.birth_date ? <span className="number">{parseInt(String(poet.birth_date))}</span> : (isSindhi ? 'نامعلوم' : 'Unknown')}
                            </span>
                          </div>
                          {poet.death_date && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                                {isSindhi ? 'وفات' : 'Died'}: <span className="number">{parseInt(String(poet.death_date))}</span>
                              </span>
                            </div>
                          )}
                          {yearsActive && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              <MixedContentWithNumbers 
                                text={yearsActive || ''}
                                className={isSindhi ? 'font-medium' : 'font-light'}
                              />
                            </div>
                          )}
                        </div>

                        {/* Short details/description */}
                        {getDisplayDetails(poet) && (
                          <p className={`text-[12px] text-gray-600 mb-3 leading-relaxed line-clamp-2 ${getSmartFontClass(getDisplayDetails(poet))}`}>
                            {getDisplayDetails(poet)}
                          </p>
                        )}
                        {yearsActive && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <MixedContentWithNumbers 
                              text={yearsActive || ''}
                              className={isSindhi ? 'font-medium' : 'font-light'}
                            />
                          </div>
                        )}

                        {/* Tags removed as requested */}

                        {/* Action Buttons - Medium.com Style with Icons and Numbers */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <button
                              onClick={() => handleViewClick(poet)}
                              aria-label={content.views}
                              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Eye className="h-3 w-3" />
                              </motion.div>
                              <motion.div
                                key={`views-${poet.id}-${poetStats[poet.id]?.views || 0}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  duration: 0.3,
                                  ease: "easeOut"
                                }}
                                className="flex items-center"
                              >
                                <NumberFont className="text-xs font-light">
                                  <AnimatedCounter 
                                    value={poetStats[poet.id]?.views || 0} 
                                    className="text-xs font-light"
                                  />
                                </NumberFont>
                              </motion.div>
                            </button>
                            <button
                              onClick={() => handleWorksClick(poet)}
                              aria-label={content.works}
                              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <BookOpenCheck className="h-3 w-3" />
                              </motion.div>
                              <motion.div
                                key={`works-${poet.id}-${poetStats[poet.id]?.poetryCount || 0}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  duration: 0.3,
                                  ease: "easeOut",
                                  delay: 0.1
                                }}
                                className="flex items-center"
                              >
                                <NumberFont className="text-xs font-light">
                                  <AnimatedCounter 
                                    value={poetStats[poet.id]?.poetryCount || 0} 
                                    className="text-xs font-light"
                                  />
                                </NumberFont>
                              </motion.div>
                            </button>
                          </div>
                          <button
                            onClick={() => handleShareClick(poet)}
                            aria-label={content.share}
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Share className={`h-3 w-3 ${copiedPoetId === poet.id ? 'text-green-600' : ''}`} />
                            </motion.div>
                            <AnimatePresence>
                              {copiedPoetId === poet.id && (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.5, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, y: 5 }}
                                  transition={{ 
                                    duration: 0.2,
                                    ease: "easeOut"
                                  }}
                                  className="text-[10px] text-green-600"
                                >
                                  {isSindhi ? 'ڪاپي ٿيو' : 'Copied'}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>

                        {/* View Profile and Details Buttons */}
                        <Button 
                          asChild 
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-300 rounded-xl py-3 transition-all duration-200" 
                          size="lg"
                        >
                          <Link href={isSindhi ? `/sd/poets/${poet.poet_slug}` : `/en/poets/${poet.poet_slug}`}>
                            <span className={`${isSindhi ? 'font-medium' : 'font-light'} ${getSmartFontClass(content.viewProfile)}`}>
                              {content.viewProfile}
                            </span>
                          </Link>
                        </Button>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border border-gray-300 text-gray-700 rounded-xl"
                            onClick={() => { setDetailsPoet(poet); setIsDetailsOpen(true); }}
                          >
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{isSindhi ? 'تفصيل ڏسو' : 'Quick details'}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Quick Details Modal */}
        {isDetailsOpen && detailsPoet && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {/* Reuse avatar logic */}
                    {/* fallback handled by span if no image */}
                    {(detailsPoet.file_url || detailsPoet.photo) ? (
                      <Image 
                        src={resolveImageSrc(detailsPoet.file_url || detailsPoet.photo) || ''}
                        alt={getPrimaryPoetName(detailsPoet, isSindhi)}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {getAvatarPoetName(detailsPoet, isSindhi).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-lg text-gray-900 ${getSmartFontClass(getDisplayName(detailsPoet))}`}>{getDisplayName(detailsPoet)}</div>
                    {getSecondaryPoetName(detailsPoet, isSindhi) && (
                      <div className={`text-xs text-gray-500 ${getSmartFontClass(getSecondaryPoetName(detailsPoet, isSindhi)!)}`}>{getSecondaryPoetName(detailsPoet, isSindhi)}</div>
                    )}
                  </div>
                </div>
                {getDisplayTagline(detailsPoet) && (
                  <p className={`mt-3 text-sm text-gray-600 ${getSmartFontClass(getDisplayTagline(detailsPoet) || '')}`}>{getDisplayTagline(detailsPoet)}</p>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <div>
                    {isSindhi ? 'پيدائش' : 'Born'}: {detailsPoet.birth_date ? <span className="number">{parseInt(String(detailsPoet.birth_date))}</span> : (isSindhi ? 'نامعلوم' : 'Unknown')}
                  </div>
                  {detailsPoet.death_date && (
                    <div>
                      {isSindhi ? 'وفات' : 'Died'}: <span className="number">{parseInt(String(detailsPoet.death_date))}</span>
                    </div>
                  )}
                </div>
                {getDisplayDetails(detailsPoet) && (
                  <p className={`mt-3 text-[13px] text-gray-700 leading-relaxed ${getSmartFontClass(getDisplayDetails(detailsPoet))}`}>
                    {getDisplayDetails(detailsPoet)}
                  </p>
                )}
              </div>
              <div className="px-5 pb-5 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 text-gray-700 rounded-xl"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  {isSindhi ? 'بند ڪريو' : 'Close'}
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                >
                  <Link href={isSindhi ? `/sd/poets/${detailsPoet.poet_slug}` : `/en/poets/${detailsPoet.poet_slug}`}>
                    {isSindhi ? 'سڀ تفصيل' : 'Full profile'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {loading ? (
              <div className="flex gap-1 sm:gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-10 sm:h-12 bg-gray-200 rounded-lg sm:rounded-xl w-8 sm:w-12"></div>
                  </div>
                ))}
              </div>
            ) : (
              <SmartPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isRTL={isRTL}
                className="w-full max-w-md"
              />
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
