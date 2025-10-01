"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronDown, 
  Heart, 
  Eye, 
  Share2, 
  Bookmark, 
  Calendar, 
  User,
  BookOpen,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { NumberFont, MixedContentWithNumbers } from "@/components/ui/NumberFont";
import { getSmartFontClass } from "@/lib/font-detection-utils";
// import { getPrimaryPoetName } from "@/lib/poet-name-utils";
import { useAuthRequired } from "@/hooks/useAuthRequired";
import { AuthModal } from "@/components/ui/AuthModal";
import { useViewTracking } from "@/hooks/useViewTracking";

// Couplet Card Component with View Tracking
function CoupletCard({ couplet, index, isSindhi, isAuthenticated, handleLikeClick, handleBookmarkClick }: {
  couplet: Couplet;
  index: number;
  isSindhi: boolean;
  isAuthenticated: boolean;
  handleLikeClick: (coupletId: string) => void;
  handleBookmarkClick: (coupletId: string) => void;
}) {
  // Track view for this couplet
  useViewTracking({
    contentId: parseInt(couplet.id),
    contentType: 'couplet',
    enabled: true,
    delay: 2000 // Track after 2 seconds of viewing
  });

  return (
    <motion.div
      key={`couplet-${couplet.id}-${index}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className="group"
    >
      <Card className="h-full border border-gray-200/50 bg-white rounded-[12px] shadow-none overflow-hidden">
        <CardContent className="p-8">
          {/* Couplet Content */}
          <div className="space-y-2 mb-6">
            <div className="text-center space-y-1">
              {couplet.lines.slice(0, 2).map((line, lineIndex) => (
                <div 
                  key={`${couplet.id}-line-${lineIndex}`}
                  className={`leading-relaxed ${
                    couplet.lang === 'sd' 
                      ? 'text-lg font-medium text-black auto-sindhi-font' 
                      : 'text-base font-light text-gray-800 tracking-wide'
                  }`}
                  dir={couplet.lang === 'sd' ? 'rtl' : 'ltr'}
                  style={{
                    fontFamily: couplet.lang === 'sd' ? 'var(--font-sindhi-primary)' : 'Georgia, serif',
                    whiteSpace: 'pre-line',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    textAlign: 'center',
                    lineHeight: couplet.lang === 'sd' ? '1.6' : '1.8',
                    marginBottom: '0',
                    fontStyle: couplet.lang === 'en' ? 'italic' : 'normal'
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Poet Info */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              {(() => {
                const poet = couplet.poet || { sindhi_laqab: '', english_laqab: '', sindhiName: '', englishName: '', name: '' };
                const displayNameRaw = isSindhi
                  ? (poet.sindhi_laqab || poet.english_laqab || poet.sindhiName || poet.englishName || poet.name)
                  : (poet.english_laqab || poet.sindhi_laqab || poet.englishName || poet.sindhiName || poet.name);
                const displayName = String(displayNameRaw || poet.name || '—');
                return (
                  <span className={`text-sm text-gray-700 font-medium ${getSmartFontClass(displayName)}`}>
                    {displayName}
                  </span>
                );
              })()}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-4 w-4" />
              <MixedContentWithNumbers 
                text={isSindhi ? '2 منٽ' : '2 min'}
                className="text-xs"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleLikeClick(couplet.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isAuthenticated ? 'Like this couplet' : 'Login to like'}
              >
                <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
              </button>
              <button 
                onClick={() => handleBookmarkClick(couplet.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isAuthenticated ? 'Bookmark this couplet' : 'Login to bookmark'}
              >
                <Bookmark className="h-4 w-4 text-gray-600 hover:text-blue-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="h-4 w-4 text-gray-600 hover:text-green-500" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-4 w-4" />
              <NumberFont className="text-xs">
                {couplet.views || 0}
              </NumberFont>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface Couplet {
  id: string;
  couplet_text: string;
  created_at: string;
  likes: number;
  views: number;
  tags: string[];
  lang: string;
  lines: string[];
  couplet_slug: string;
  poetry_id?: number | null;
  poetry?: unknown | null;
  poet: {
    id: string;
    name: string;
    slug: string;
    photo: string;
    sindhiName?: string;
    englishName?: string;
    sindhi_laqab?: string;
    english_laqab?: string;
  };
}

export default function CoupletsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const { isAuthenticated, showAuthModal, authContext, requireAuth, closeAuthModal } = useAuthRequired();
  
  const [couplets, setCouplets] = useState<Couplet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'created_at' | 'likes' | 'views'>('created_at');
  
  // Get poet filter from URL params
  const poetFilter = searchParams.get('poet') || '';

  const handleLikeClick = (coupletId: string) => {
    requireAuth(() => {
      // TODO: Implement like functionality for authenticated users
      console.log('Like clicked for couplet:', coupletId);
    }, 'like');
  };

  const handleBookmarkClick = (coupletId: string) => {
    requireAuth(() => {
      // TODO: Implement bookmark functionality for authenticated users
      console.log('Bookmark clicked for couplet:', coupletId);
    }, 'bookmark');
  };
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(12);

  const content = {
    title: isSindhi ? 'سنڌي شاعري' : 'Sindhi Couplets',
    subtitle: isSindhi 
      ? 'سنڌي شاعريءَ جي عظيم رويت جو حصو، صدين جي ادبي روايت جو عڪس'
      : 'Discover the great tradition of Sindhi poetry, a reflection of centuries of literary heritage',
    searchPlaceholder: isSindhi ? 'شاعري ڳوليو...' : 'Search couplets...',
    noCoupletsFound: isSindhi ? 'ڪوئي شاعري نه ملي' : 'No couplets found',
    loading: isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...',
    totalCouplets: isSindhi ? 'مجموعي شاعري' : 'Total Couplets',
    uniquePoets: isSindhi ? 'منفرد شاعر' : 'Unique Poets',
    page: isSindhi ? 'صفحو' : 'Page',
    perPage: isSindhi ? 'ہر صفحي ۾' : 'per page',
    sortByDate: isSindhi ? 'تاريخ مطابق' : 'Sort by Date',
    sortByLikes: isSindhi ? 'پسنديدگي مطابق' : 'Sort by Likes',
    sortByViews: isSindhi ? 'ڏٺل مطابق' : 'Sort by Views',
    ascending: isSindhi ? 'پوڙهي پهرين' : 'Oldest First',
    descending: isSindhi ? 'نئين پهرين' : 'Newest First',
    clearFilters: isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters',
    showing: isSindhi ? 'ڏيکاري رهيا آهيون' : 'Showing',
    of: isSindhi ? 'جي' : 'of',
    total: isSindhi ? 'ڪل' : 'total',
    coupletsFound: isSindhi ? 'شاعري ملي' : 'couplets found',
    chronologicalSorting: isSindhi ? 'شاعري کي تاريخ جي حساب سان ترتيب ڏنو ويو آهي - نئين شاعري پهرين ۽ پوڙهي شاعري آخر ۾' : 'Couplets are arranged chronologically by date - newest couplets first, oldest couplets last'
  };

  // Apply Sindhi font only if text contains Arabic/Sindhi characters
  // const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'auto-sindhi-font' : '');

  const fetchCouplets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        search: searchQuery,
        sortBy,
        sortOrder,
        lang: isSindhi ? 'sd' : 'en',
        standalone: '1' // Only fetch standalone couplets (poetry_id = 0 or null)
      });
      
      if (poetFilter) {
        // Always pass through a single `poet` param; backend accepts id-or-slug
        params.append('poet', poetFilter);
      }
      const response = await fetch(`/api/couplets?${params}`);
      if (response.ok) {
        const data = await response.json();
        const allCouplets: Couplet[] = data.couplets || [];
        // No need to filter since we're already getting standalone couplets from API
        setCouplets(allCouplets);
        setTotal(data.total || allCouplets.length);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to fetch couplets:', response.status);
      }
    } catch (error) {
      console.error("Error fetching couplets:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortBy, sortOrder, isSindhi, perPage, poetFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  useEffect(() => {
    fetchCouplets();
  }, [page, searchQuery, sortBy, sortOrder, isSindhi, poetFilter, fetchCouplets]);

  const uniquePoetsCount = new Set(couplets.map(c => c.poet.id)).size;
  const startIdx = (page - 1) * perPage + 1;

  // Skeleton loader component for couplet cards
  const CoupletCardSkeleton = () => (
    <div className="animate-pulse">
      <Card className="h-full border border-gray-200/50 bg-white rounded-[12px] shadow-none overflow-hidden">
        <CardContent className="p-8">
          {/* Couplet Content skeleton - matches actual couplet lines */}
          <div className="space-y-2 mb-6">
            <div className="text-center space-y-3">
              {/* First line of couplet */}
              <div className="h-6 bg-gray-200 rounded w-4/5 mx-auto"></div>
              {/* Second line of couplet */}
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>

          {/* Poet Info skeleton - matches actual poet section */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {/* Poet avatar skeleton */}
              <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
              {/* Poet name skeleton */}
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            {/* Reading time skeleton */}
            <div className="flex items-center gap-2 text-xs">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>

          {/* Action Icons skeleton - matches actual action buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              {/* Like button skeleton */}
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              {/* Bookmark button skeleton */}
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              {/* Share button skeleton */}
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            {/* View count skeleton */}
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          
          {/* Hero Section - Always Visible */}
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
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-6">
              <div className="text-center">
                <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{total.toLocaleString()}</NumberFont>
                <div className={`text-sm text-gray-600 ${getSmartFontClass(content.totalCouplets)}`}>
                  {content.totalCouplets}
                </div>
              </div>
              <div className="text-center">
                <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{uniquePoetsCount}</NumberFont>
                <div className={`text-sm text-gray-600 ${getSmartFontClass(content.uniquePoets)}`}>
                  {content.uniquePoets}
                </div>
              </div>
            </div>
            
            {/* Academic Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
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
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Sort By */}
                <div>
                  <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByDate)}`}>
                    {content.sortByDate}
                  </label>
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                      className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
                    >
                      <option value="created_at" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
                      <option value="likes" className={getSmartFontClass(content.sortByLikes)}>{content.sortByLikes}</option>
                      <option value="views" className={getSmartFontClass(content.sortByViews)}>{content.sortByViews}</option>
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
                      className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
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
                    className="w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm"
                  >
                    <span className={`font-medium ${getSmartFontClass(content.clearFilters)}`}>
                      {content.clearFilters}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Results Summary - Always Visible */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <p className={`text-gray-600 text-lg mb-3 ${getSmartFontClass(content.showing)}`}>
                {isSindhi ? (
                  <>پاڻ کي <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> شاعري ملي آھي، جنھن مان پيج <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + couplets.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
                ) : (
                  <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + couplets.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.coupletsFound}</>
                )}
              </p>
            </div>
          </motion.div>

          {/* Loading Skeleton for Couplets Grid */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-6">
              <div className={`text-lg text-gray-600 ${getSmartFontClass(content.loading)}`}>{content.loading}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <CoupletCardSkeleton />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        
        {/* Hero Section - Like Poets Page */}
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
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{total.toLocaleString()}</NumberFont>
              <div className={`text-sm text-gray-600 ${getSmartFontClass(content.totalCouplets)}`}>
                {content.totalCouplets}
              </div>
            </div>
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{uniquePoetsCount}</NumberFont>
              <div className={`text-sm text-gray-600 ${getSmartFontClass(content.uniquePoets)}`}>
                {content.uniquePoets}
              </div>
            </div>
          </div>
          
          {/* Academic Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <p className={`text-sm text-blue-700 font-medium ${getSmartFontClass(content.chronologicalSorting)}`}>
                {content.chronologicalSorting}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Search and Filters - Like Poets Page */}
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
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Sort By */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByDate)}`}>
                  {content.sortByDate}
                </label>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
                  >
                    <option value="created_at" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
                    <option value="likes" className={getSmartFontClass(content.sortByLikes)}>{content.sortByLikes}</option>
                    <option value="views" className={getSmartFontClass(content.sortByViews)}>{content.sortByViews}</option>
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
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
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
                  className="w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm"
                >
                  <span className={`font-medium ${getSmartFontClass(content.clearFilters)}`}>
                    {content.clearFilters}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Results Summary - Like Poets Page */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <p className={`text-gray-600 text-lg mb-3 ${getSmartFontClass(content.showing)}`}>
              {isSindhi ? (
                <>پاڻ کي <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> شاعري ملي آھي، جنھن مان پيج <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + couplets.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
              ) : (
                <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + couplets.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.coupletsFound}</>
              )}
            </p>
          </div>
        </motion.div>

        {/* Couplets Grid */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {couplets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {couplets.map((couplet, index) => (
                <CoupletCard
                  key={`couplet-${couplet.id}-${index}`}
                  couplet={couplet}
                  index={index}
                  isSindhi={isSindhi}
                  isAuthenticated={isAuthenticated}
                  handleLikeClick={handleLikeClick}
                  handleBookmarkClick={handleBookmarkClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className={`text-gray-500 text-xl ${getSmartFontClass(content.noCoupletsFound)}`}>
                {content.noCoupletsFound}
              </p>
            </div>
          )}
        </motion.section>

        {/* Pagination - Like Poets Page */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex gap-3">
              {/* Previous Page Button */}
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                size="lg"
                className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
              >
                <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isRTL ? '→' : '←'}
                </span>
              </Button>
              
              {/* Previous Set Button */}
              {page > 6 && (
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, page - 6))}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-3"
                >
                  <span className="font-medium">...</span>
                </Button>
              )}
              
              {/* Page Numbers - Show only 6 at a time */}
              {(() => {
                const startPage = Math.max(1, Math.min(page - 2, totalPages - 5));
                const endPage = Math.min(totalPages, startPage + 5);
                const pages = [];
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                
                return pages.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    size="lg"
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      pageNum === page 
                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg" 
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <NumberFont>
                      {pageNum}
                    </NumberFont>
                  </Button>
                ));
              })()}
              
              {/* Next Set Button */}
              {page < totalPages - 5 && (
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(totalPages, page + 6))}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-3"
                >
                  <span className="font-medium">...</span>
                </Button>
              )}
              
              {/* Next Page Button */}
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                size="lg"
                className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
              >
                <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isRTL ? '←' : '→'}
                </span>
              </Button>
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        context={authContext}
      />
    </div>
  );
}


