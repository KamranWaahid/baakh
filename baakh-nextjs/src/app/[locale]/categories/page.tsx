"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { NumberFont } from "@/components/ui/NumberFont";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Hash,
  BookOpen,
  ChevronRight,
  Search,
  ChevronDown,
  BookOpenCheck
} from "lucide-react";

type Cat = { 
  id: string; 
  slug: string; 
  englishName: string; 
  sindhiName: string; 
  englishPlural?: string; 
  sindhiPlural?: string; 
  englishDetails: string; 
  sindhiDetails: string; 
  languages: string[]; 
  contentStyle: string; 
  summary?: string; 
  count?: number 
};

export default function CategoriesPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(12);

  // Debounce search query to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const content = {
    title: isSindhi ? 'شاعري جا موضوع' : 'Poetry Categories',
    subtitle: isSindhi 
      ? 'موضوعن، صنفن، ۽ اندازن سان شاعري ڏسو. سنڌي ادب جي متنوع دنيا ڏسو، صدين جي ادبي روايت جو عڪس'
      : 'Explore poetry by themes, genres, and styles. Discover the diverse world of Sindhi literature, a reflection of centuries of literary heritage',
    searchPlaceholder: isSindhi ? 'موضوع ڳوليو...' : 'Search categories...',
    noCategoriesFound: isSindhi ? 'ڪوئي موضوع نه ملي' : 'No categories found',
    loading: isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...',
    totalCategories: isSindhi ? 'مجموعي موضوع' : 'Total Categories',
    uniqueStyles: isSindhi ? 'منفرد انداز' : 'Unique Styles',
    page: isSindhi ? 'صفحو' : 'Page',
    perPage: isSindhi ? 'ہر صفحي ۾' : 'per page',
    sortByName: isSindhi ? 'نالو مطابق' : 'Sort by Name',
    sortByCount: isSindhi ? 'ڳڻپ مطابق' : 'Sort by Count',
    sortByDate: isSindhi ? 'تاريخ مطابق' : 'Sort by Date',
    ascending: isSindhi ? 'A-Z' : 'A-Z',
    descending: isSindhi ? 'Z-A' : 'Z-A',
    clearFilters: isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters',
    showing: isSindhi ? 'ڏيکاري رهيا آهيون' : 'Showing',
    of: isSindhi ? 'جي' : 'of',
    total: isSindhi ? 'ڪل' : 'total',
    categoriesFound: isSindhi ? 'موضوع ملي' : 'categories found',
    literaryHeritage: isSindhi ? 'سنڌي ادب جي عظيم رويت، مختلف صنفن ۽ اندازن سان' : 'Great tradition of Sindhi literature with diverse genres and styles',
    viewCategory: isSindhi ? 'موضوع ڏسو' : 'View Category',
    availableIn: isSindhi ? 'دستياب آهي' : 'Available in',
    layout: isSindhi ? 'ترتيب' : 'Layout'
  };

  // Apply Sindhi font only if text contains Arabic/Sindhi characters
  // const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'auto-sindhi-font' : '');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        search: debouncedSearchQuery,
        sortBy,
        sortOrder,
        lang: isSindhi ? 'sd' : 'en'
      });

      console.log('Categories Page - Fetching with params:', Object.fromEntries(params));
      const response = await fetch(`/api/categories/?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Categories Page - API response:', data);
        setCategories(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        console.log('Categories Page - State updated:', {
          categories: data.items?.length || 0,
          total: data.total || 0,
          totalPages: data.pagination?.totalPages || 1,
          currentPage: page
        });
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchQuery, sortBy, sortOrder, isSindhi, perPage]);

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
      setSortOrder('asc');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, page, debouncedSearchQuery, sortBy, sortOrder, isSindhi]);

  const uniqueStylesCount = new Set(categories.map(c => c.contentStyle)).size;
  const startIdx = (page - 1) * perPage + 1;

  // Debug pagination state
  console.log('Categories Page - Current state:', {
    total,
    totalPages,
    page,
    perPage,
    categoriesCount: categories.length,
    startIdx,
    shouldShowPagination: totalPages > 1
  });

  // Skeleton loader component for category cards
  const CategoryCardSkeleton = () => (
    <div className="animate-pulse">
      <Card className="h-full border border-gray-200 bg-white overflow-hidden rounded-xl">
        <CardHeader className="pb-6 px-6 pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="flex gap-2 flex-wrap">
                <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
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
                <div className={`text-sm text-gray-600 ${getSmartFontClass(content.totalCategories)}`}>
                  {content.totalCategories}
                </div>
              </div>
              <div className="text-center">
                <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{uniqueStylesCount}</NumberFont>
                <div className={`text-sm text-gray-600 ${getSmartFontClass(content.uniqueStyles)}`}>
                  {content.uniqueStyles}
                </div>
              </div>
            </div>
            
            {/* Academic Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                <BookOpenCheck className="h-4 w-4 text-blue-600" />
                <p className={`text-sm text-blue-700 font-medium ${getSmartFontClass(content.literaryHeritage)}`}>
                  {content.literaryHeritage}
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
                  <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByName)}`}>
                    {content.sortByName}
                  </label>
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                      className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
                    >
                      <option value="name" className={getSmartFontClass(content.sortByName)}>{content.sortByName}</option>
                      <option value="count" className={getSmartFontClass(content.sortByCount)}>{content.sortByCount}</option>
                      <option value="created_at" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
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
                  <>پاڻ کي <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> موضوع ملي آھي، جنھن مان پيج <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + categories.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
                ) : (
                  <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + categories.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.categoriesFound}</>
                )}
              </p>
            </div>
          </motion.div>

          {/* Loading Skeleton for Categories Grid */}
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
                  <CategoryCardSkeleton />
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
        
        {/* Hero Section */}
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
              <div className={`text-sm text-gray-600 ${getSmartFontClass(content.totalCategories)}`}>
                {content.totalCategories}
              </div>
            </div>
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{uniqueStylesCount}</NumberFont>
              <div className={`text-sm text-gray-600 ${getSmartFontClass(content.uniqueStyles)}`}>
                {content.uniqueStyles}
              </div>
            </div>
          </div>
          
          {/* Academic Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
              <BookOpenCheck className="h-4 w-4 text-blue-600" />
              <p className={`text-sm text-blue-700 font-medium ${getSmartFontClass(content.literaryHeritage)}`}>
                {content.literaryHeritage}
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
                  className={`h-10 text-base ${isRTL ? 'pr-12' : 'pl-12'} border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 rounded-xl transition-all duration-200 ${getSmartFontClass(content.searchPlaceholder)}`}
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Sort By */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${getSmartFontClass(content.sortByName)}`}>
                  {content.sortByName}
                </label>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                    className={`w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer`}
                  >
                    <option value="name" className={getSmartFontClass(content.sortByName)}>{content.sortByName}</option>
                    <option value="count" className={getSmartFontClass(content.sortByCount)}>{content.sortByCount}</option>
                    <option value="created_at" className={getSmartFontClass(content.sortByDate)}>{content.sortByDate}</option>
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

        {/* Results Summary */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <p className={`text-gray-600 text-lg mb-3 ${getSmartFontClass(content.showing)}`}>
              {isSindhi ? (
                <>پاڻ کي <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> موضوع ملي آھي، جنھن مان پيج <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + categories.length - 1, total)}</NumberFont> ڏيکار رھيا آھون.</>
              ) : (
                <>{content.showing} <NumberFont className="font-semibold text-gray-900">{startIdx}-{Math.min(startIdx + categories.length - 1, total)}</NumberFont> {content.of} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {content.categoriesFound}</>
              )}
            </p>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                // Use language-specific content based on current locale
                const displayName = isSindhi ? category.sindhiName : category.englishName;
                const displayPlural = isSindhi ? category.sindhiPlural : category.englishPlural;
                const displayDetails = isSindhi ? category.sindhiDetails : category.englishDetails;
                
                return (
                  <motion.div 
                    key={`${category.id}-${category.slug}`} 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group"
                  >
                    <Link 
                      href={isSindhi ? `/sd/categories/${encodeURIComponent(category.slug)}` : `/en/categories/${encodeURIComponent(category.slug)}`} 
                      className="block" 
                      aria-label={displayName}
                    >
                      <Card className="h-full border border-gray-200 bg-white overflow-hidden rounded-xl">
                        <CardHeader className="pb-6 px-6 pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className={`text-lg font-medium leading-tight mb-2 ${getSmartFontClass(displayName)}`} style={{
                                fontFeatureSettings: '"kern" 1, "liga" 1',
                                letterSpacing: '0.01em'
                              }}>
                                {displayName}
                              </CardTitle>
                              {displayPlural && (
                                <div className={`text-xs text-gray-500 mb-3 ${getSmartFontClass(displayPlural)}`} style={{
                                  fontFeatureSettings: '"kern" 1, "liga" 1',
                                  letterSpacing: '0.01em',
                                  lineHeight: '1.4'
                                }}>
                                  {displayPlural}
                                </div>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                {category.languages.map((lang) => (
                                  <Badge 
                                    key={lang} 
                                    variant={lang === 'Sindhi' ? 'secondary' : 'outline'} 
                                    className={`text-[10px] rounded-full px-2.5 py-0.5 font-light ${
                                      lang === 'Sindhi' 
                                        ? 'bg-gray-100 text-gray-700 border-gray-200' 
                                        : 'bg-transparent text-gray-500 border-gray-200/50'
                                    }`}
                                  >
                                    {isSindhi 
                                      ? (lang === 'Sindhi' ? 'سنڌي' : 'انگريزي')
                                      : lang
                                    }
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0">
                          {displayDetails && (
                            <p className={`text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed ${getSmartFontClass(displayDetails)}`} style={{
                              fontFeatureSettings: '"kern" 1, "liga" 1',
                              letterSpacing: '0.01em',
                              lineHeight: '1.6'
                            }}>
                              {displayDetails}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="inline-flex items-center gap-2 text-sm text-gray-500 font-light" style={{
                              fontFeatureSettings: '"kern" 1, "liga" 1',
                              letterSpacing: '0.01em'
                            }}>
                              <Hash className="w-4 h-4" />
                              <NumberFont>{category.count ?? 0}</NumberFont>
                              <span className="text-xs text-gray-400">
                                {isSindhi ? 'شاعري' : 'poems'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className={`text-gray-500 text-xl ${getSmartFontClass(content.noCategoriesFound)}`}>
                {content.noCategoriesFound}
              </p>
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
    </div>
  );
} 