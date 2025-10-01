"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar,
  Star,
  Eye,
  BookOpen,
  Share,
  Heart,
  Bookmark,
  ChevronDown,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { NumberFont, MixedContentWithNumbers } from "@/components/ui/NumberFont";
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthModal } from '@/components/ui/AuthModal';
import { useOptimisticActions } from '@/hooks/useOptimisticActions';

interface Poetry {
  id: string;
  poetry_slug: string;
  title: string;
  tags?: string[];
  poet_name: string;
  poet_slug: string;
  poet_laqab?: string;
  poet_avatar?: string;
  poet_tagline?: string;
  poet_location?: string;
  category: string;
  category_slug: string;
  is_featured?: boolean;
  views: number;
  likes: number;
  bookmarks: number;
  created_at: string;
}

interface PoetryResponse {
  poetry: Poetry[];
  total: number;
  page: number;
  limit: number;
}

export default function PoetryPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  const { isAuthenticated, showAuthModal, authContext, requireAuth, closeAuthModal, user } = useAuthRequired();
  
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'is_featured'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [perPage] = useState(12);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Array<{id: number, slug: string, name: string}>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);


  // Multi-lingual content
  const content = {
    title: isSindhi ? 'سنڌي شاعري' : 'Sindhi Poetry',
    subtitle: isSindhi 
      ? 'سنڌي شاعريءَ جي عظيم رچنا کي ڳوليو، جنھن کي صدين جي ادبي روايت آھي'
      : 'Discover the great works of Sindhi poetry, bearers of centuries of literary tradition',
    searchPlaceholder: isSindhi ? 'شاعري ڳوليو...' : 'Search poetry...',
    allCategories: isSindhi ? 'سموريون صنفون' : 'All Categories',
    ghazal: isSindhi ? 'غزل' : 'Ghazal',
    nazm: isSindhi ? 'نظم' : 'Nazm',
    rubai: isSindhi ? 'رباعي' : 'Rubai',
    masnavi: isSindhi ? 'مثنوي' : 'Masnavi',
    qasida: isSindhi ? 'قصيده' : 'Qasida',
    doha: isSindhi ? 'دوها' : 'Doha',

    viewPoetry: isSindhi ? 'شاعري ڏسو' : 'View Poetry',
    featured: isSindhi ? 'چونڊ' : 'Featured',
    category: isSindhi ? 'صنف' : 'Category',
    noPoetryFound: isSindhi ? 'ڪا شاعري نه ملي' : 'No poetry found',
    loading: isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...',
    sortByTitle: isSindhi ? 'عنوان مطابق' : 'Sort by Title',
    sortByDate: isSindhi ? 'تاريخ مطابق' : 'Sort by Date',
    sortByFeatured: isSindhi ? 'چونڊ مطابق' : 'Sort by Featured',
    ascending: isSindhi ? 'ماضيءَ پهرين' : 'Oldest First',
    descending: isSindhi ? 'حال پهرين' : 'Newest First',
    clearFilters: isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters',
    poetsFound: isSindhi ? 'شاعري ملي' : 'poetry found',
    showing: isSindhi ? 'ڏيکاري رهيا آهيون' : 'Showing',
    of: isSindhi ? 'جي' : 'of',
    total: isSindhi ? 'سمورا' : 'total',
    chronologicalSorting: isSindhi ? 'شاعري کي تاريخ جي حساب سان ترتيب ڏنو ويو آهي - نئين شاعري پهرين ۽ پوڙهي شاعري آخر ۾' : 'Poetry is arranged chronologically by date - newest poetry first, oldest poetry last'
  };

  // Categories will be fetched from database

  // Removed unused sd function

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`/api/poetry/categories?lang=${isSindhi ? 'sd' : 'en'}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }, [isSindhi]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIdx = (page-1)*perPage + 1;

  const fetchPoetry = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        search: searchQuery,
        category: selectedCategory,
        sortBy,
        sortOrder,
        lang: isSindhi ? 'sd' : 'en'
      });

      const response = await fetch(`/api/poetry?${params}`);
      if (response.ok) {
        const data: PoetryResponse = await response.json();
        setPoetry(data.poetry || []);
        setTotal(data.total || 0);
      } else {
        console.error('Failed to fetch poetry:', response.status);
      }
    } catch (error) {
      console.error("Error fetching poetry:", error);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchQuery, selectedCategory, sortBy, sortOrder, isSindhi]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Action handlers for like, bookmark, and share
  const handleLike = (poemId: string) => {
    if (!isAuthenticated) {
      requireAuth(() => {}, 'like');
      return;
    }
    
    if (!user?.userId) return;
    
    // For now, we'll implement a simple toggle without the optimistic actions hook
    // In a real implementation, you'd use the useOptimisticActions hook here
    console.log('Like clicked for poem:', poemId);
  };

  const handleBookmark = (poemId: string) => {
    if (!isAuthenticated) {
      requireAuth(() => {}, 'bookmark');
      return;
    }
    
    if (!user?.userId) return;
    
    // For now, we'll implement a simple toggle without the optimistic actions hook
    // In a real implementation, you'd use the useOptimisticActions hook here
    console.log('Bookmark clicked for poem:', poemId);
  };

  const handleShare = async (poem: Poetry) => {
    try {
      const shareUrl = `${window.location.origin}/${isSindhi ? 'sd' : 'en'}/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}`;
      const shareText = `${poem.title}\n\n- ${poem.poet_name}`;
      
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: `${poem.poet_name} - ${isSindhi ? 'شاعري' : 'Poetry'}`,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard (silent)
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      }
    } catch (error: any) {
      // Ignore user-cancelled share dialogs
      const message = String(error?.message || '').toLowerCase();
      const name = String(error?.name || '').toLowerCase();
      if (name.includes('abort') || message.includes('abort') || message.includes('canceled') || message.includes('cancelled')) {
        return;
      }
      console.error('Error sharing poetry:', error);
      // Fallback: just copy the URL
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/${isSindhi ? 'sd' : 'en'}/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}`);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
    setSelectedCategory("all");
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  useEffect(() => {
    fetchPoetry();
  }, [page, perPage, searchQuery, selectedCategory, sortBy, sortOrder, fetchPoetry]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [isSindhi, fetchCategories]);


  // Debug: Log poetry data when it changes
  useEffect(() => {
    if (poetry.length > 0) {
      console.log('Poetry data received:', poetry);
      console.log('Sample poetry item:', poetry[0]);
    }
  }, [poetry]);


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
  
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Hero Section - From Poets */}
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

        {/* Search and Filters */}
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
                  disabled={categoriesLoading}
                  className={`h-10 text-base ${isRTL ? 'pr-12' : 'pl-12'} border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 rounded-xl transition-all duration-200 ${isSindhi ? 'auto-sindhi-font' : ''} ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {categoriesLoading && (
                  <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.category)}`}>
                  {content.category}
                </label>
                <div className="relative group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    disabled={categoriesLoading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${getSmartFontClass(selectedCategory)} ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {categoriesLoading ? (
                      <option value="" disabled>
                        {isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...'}
                      </option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.slug} value={category.slug} className={getSmartFontClass(category.name)}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByTitle)}`}>
                  {content.sortByTitle}
                </label>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                    disabled={categoriesLoading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${getSmartFontClass(content.sortByTitle)} ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="title" className={getSmartFontClass(content.sortByTitle)}>{content.sortByTitle}</option>
                    <option value="created_at" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
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
                    disabled={categoriesLoading}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer ${getSmartFontClass(content.ascending)} ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={categoriesLoading}
                  className={`w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm ${categoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <p className={`text-gray-600 text-lg mb-3 ${getSmartFontClass(content.showing)}`}>
                {isSindhi ? (
                  <>پاڻ کي <NumberFont className={`font-semibold text-gray-900 ${getSmartFontClass('')}`}>{total}</NumberFont> شاعري ملي آھي، جنھن مان پيج <NumberFont className={`font-semibold text-gray-900 ${getSmartFontClass('')}`}>{startIdx}-{Math.min(startIdx + poetry.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
                ) : (
                  <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + poetry.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.poetsFound}</>
                )}
              </p>
            </div>
          )}
        </motion.div>

        {/* Poetry Grid */}
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
                  <PoetryCardSkeleton />
                </motion.div>
              ))}
            </div>
          ) : poetry.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className={`text-gray-500 text-xl ${getSmartFontClass(content.noPoetryFound)}`}>{content.noPoetryFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {poetry.map((poem, index) => (
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
                            <Link href={isSindhi ? `/sd/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}` : `/en/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}`} className="block group">
                              <h4 className={`!text-[7px] font-medium text-gray-900 line-clamp-2 leading-tight hover:text-gray-700 hover:underline transition-colors font-sindhi`}>
                                {poem.title}
                              </h4>
                            </Link>
                          </div>
                      </div>

                      {/* Category and Tags */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <Badge variant="secondary" className={`text-xs px-2.5 py-1 bg-gray-100 text-gray-700 border-0 rounded-full font-normal ${getSmartFontClass(poem.category)}`}>
                            {poem.category}
                          </Badge>
                        </div>
                        {poem.is_featured && (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-2.5 py-1 rounded-full">
                            <Star className="h-3 w-3 mr-1" />
                            <span className={`text-xs font-medium ${getSmartFontClass(content.featured)}`}>
                              {content.featured}
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
                              className={`inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-normal ${getSmartFontClass(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {poem.tags.length > 3 && (
                            <span className={`inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full border border-gray-200 font-normal ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              +<NumberFont size="xs">{poem.tags.length - 3}</NumberFont>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Poet Info */}
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <Link 
                            href={isSindhi ? `/sd/poets/${poem.poet_slug}` : `/en/poets/${poem.poet_slug}`}
                            className="group/poet cursor-pointer"
                          >
                            <Avatar className="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm group-hover/poet:shadow-md group-hover/poet:border-gray-300 group-hover/poet:scale-105 transition-all duration-200">
                              <AvatarImage 
                                src={poem.poet_avatar} 
                                alt={poem.poet_laqab || poem.poet_name}
                                className="object-cover"
                              />
                              <AvatarFallback className={`text-sm font-semibold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 ${getSmartFontClass(poem.poet_laqab || poem.poet_name)}`}>
                                {(poem.poet_laqab || poem.poet_name).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="block group/poet-name cursor-pointer">
                              <Link 
                                href={isSindhi ? `/sd/poets/${poem.poet_slug}` : `/en/poets/${poem.poet_slug}`}
                                className="block"
                              >
                                <p className={`text-sm text-gray-900 font-medium truncate hover:text-gray-700 hover:underline transition-all duration-200 ${getSmartFontClass(poem.poet_laqab || poem.poet_name)}`}>
                                  {poem.poet_laqab || poem.poet_name}
                                </p>
                              </Link>
                              {poem.poet_tagline && (
                                <p className={`text-[8px] md:text-[9px] leading-tight text-gray-500 truncate ${getSmartFontClass(poem.poet_tagline)}`}>
                                  {poem.poet_tagline}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <MixedContentWithNumbers 
                            text={isSindhi ? '2 منٽ' : '2 min'}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Action Icons */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center gap-3">
                           <button 
                             onClick={() => handleLike(poem.id)}
                             className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                             title={isAuthenticated ? 'Like this poetry' : 'Login to like'}
                           >
                             <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                           </button>
                           <button 
                             onClick={() => handleBookmark(poem.id)}
                             className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                             title={isAuthenticated ? 'Bookmark this poetry' : 'Login to bookmark'}
                           >
                             <Bookmark className="h-4 w-4 text-gray-600 hover:text-blue-500" />
                           </button>
                           <button 
                             onClick={() => handleShare(poem)}
                             className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                             title={isSindhi ? "شئير ڪريو" : "Share"}
                           >
                             <Share className="h-4 w-4 text-gray-600 hover:text-green-500" />
                           </button>
                          </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="h-3.5 w-3.5" />
                          <NumberFont size="xs">{poem.views}</NumberFont>
                        </div>
                      </div>

                      {/* View Poetry Button */}
                      <Button 
                        asChild 
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-full py-2.5 transition-all duration-200 mt-5" 
                        size="sm"
                      >
                        <Link href={isSindhi ? `/sd/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}` : `/en/poets/${poem.poet_slug}/form/${poem.category_slug}/${poem.poetry_slug}`}>
                          <span className={`font-medium text-sm ${getSmartFontClass(content.viewPoetry)}`}>
                            {content.viewPoetry}
                          </span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center"
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
                <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isRTL ? '→' : '←'}
                </span>
              </Button>
              
              {/* Dynamic Page Numbers */}
              {(() => {
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
                      <NumberFont>1</NumberFont>
                    </Button>
                  );
                  
                  // Add ellipsis if there's a gap
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className={`px-6 py-3 text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
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
                      <NumberFont>{i}</NumberFont>
                    </Button>
                  );
                }
                
                // Add last page if not in range
                if (endPage < totalPages) {
                  // Add ellipsis if there's a gap
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className={`px-6 py-3 text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
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
                      <NumberFont>{totalPages}</NumberFont>
                    </Button>
                  );
                }
                
                return pages;
              })()}
              
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


