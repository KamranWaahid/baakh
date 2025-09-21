'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberFont } from '@/components/ui/NumberFont';
import { 
  Search, 
  ChevronDown,
  Filter,
  BookOpenCheck,
  Hash
} from 'lucide-react';
import Link from 'next/link';

interface Topic {
  id: string;
  slug: string;
  label: string;
  tag_type: string;
  created_at: string;
  tags_translations: Array<{
    lang_code: string;
    title: string;
    detail: string;
  }>;
  englishTitle: string;
  sindhiTitle: string;
  englishDetail: string;
  sindhiDetail: string;
}

export default function TopicsPage() {
  const pathname = usePathname();
  const isSindhi = pathname.startsWith('/sd');
  const isRTL = isSindhi;

  // State management
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const perPage = 12;

  console.log('TopicsPage component rendered, isSindhi:', isSindhi);

  // Content translations
  const content = {
    title: {
      en: 'Poetry Topics',
      sd: 'شاعري جا موضوع'
    },
    subtitle: {
      en: 'Explore poetry by themes, topics, and styles. Discover the diverse world of Sindhi literature, reflecting centuries of literary tradition',
      sd: 'موضوعن، ٽڪليون، ۽ اندازن سان شاعري ڏسو. سنڌي ادب جي متنوع دنيا ڏسو، صدين جي ادبي روايت جو عڪس'
    },
    totalTopics: {
      en: 'Total Topics',
      sd: 'سڀئي موضوع'
    },
    uniqueTypes: {
      en: 'Unique Types',
      sd: 'منفرد قسم'
    },
    searchPlaceholder: {
      en: 'Search topics...',
      sd: 'موضوع ڳوليو...'
    },
    sortByName: {
      en: 'Sort by Name',
      sd: 'نالي مطابق'
    },
    sortByCount: {
      en: 'Sort by Count',
      sd: 'ڳڻپ مطابق'
    },
    sortByDate: {
      en: 'Sort by Date',
      sd: 'تاريخ مطابق'
    },
    clearFilters: {
      en: 'Clear Filters',
      sd: 'فلٽر صاف ڪريو'
    },
    resultsText: {
      en: 'Found {total} topics, showing page {start}-{end}.',
      sd: 'پاڻ کي {total} موضوع ملي آھي، جنھن مان پيج {start}-{end} ڏيکار رھيا آھون.'
    }
  };

  // Get display name based on language
  const getDisplayName = (topic: Topic): string => {
    if (isSindhi) {
      return topic.sindhiTitle || topic.label;
    }
    return topic.englishTitle || topic.label;
  };

  // Get display detail based on language  
  const getDisplayDetail = (topic: Topic): string => {
    if (isSindhi) {
      return topic.sindhiDetail || '';
    }
    return topic.englishDetail || '';
  };

  // Get tag color based on tag type
  const getTagColor = useCallback((tagType: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200'
    ];

    // Create a simple hash from the tag type string
    const hash = tagType.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side filtering
  const filteredTopics = useMemo(() => {
    let filtered = [...topics];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(topic => 
        getDisplayName(topic).toLowerCase().includes(query) ||
        getDisplayDetail(topic).toLowerCase().includes(query) ||
        topic.slug.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = getDisplayName(a).toLowerCase();
          bValue = getDisplayName(b).toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'count':
        default:
          aValue = getDisplayName(a).toLowerCase();
          bValue = getDisplayName(b).toLowerCase();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [topics, debouncedSearchQuery, sortBy, sortOrder, isSindhi]);

  // Client-side pagination
  const paginatedTopics = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredTopics.slice(startIndex, endIndex);
  }, [filteredTopics, page, perPage]);

  // Calculate totals
  const total = filteredTopics.length;
  const totalPages = Math.ceil(total / perPage);
  const uniqueTypesCount = new Set(topics.map(t => t.tag_type)).size;

  // Fetch topics from API
  const fetchTopics = useCallback(async () => {
    console.log('fetchTopics called, isSindhi:', isSindhi);
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        lang: isSindhi ? 'sd' : 'en',
        type: 'Topic'
      });

      console.log('Fetching with params:', Object.fromEntries(params));
      const response = await fetch(`/api/tags?${params}`);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        const rawTopicsData = data.tags || [];
        console.log('Raw topics data:', rawTopicsData);
        
        // Process topics data to extract translations
        const topicsData = rawTopicsData.map((topic: Record<string, unknown>) => {
          // The API now returns the proper translated title in the 'title' field
          // and the language-specific detail in the 'detail' field
          const englishTranslation = (topic.tags_translations as Record<string, unknown>[])?.find((t: Record<string, unknown>) => t.lang_code === 'en');
          const sindhiTranslation = (topic.tags_translations as Record<string, unknown>[])?.find((t: Record<string, unknown>) => t.lang_code === 'sd');
          
          return {
            ...topic,
            // Use the API's title field which already has the proper translation
            englishTitle: topic.lang_code === 'en' ? topic.title : (englishTranslation?.title || topic.label),
            sindhiTitle: topic.lang_code === 'sd' ? topic.title : (sindhiTranslation?.title || topic.label),
            englishDetail: englishTranslation?.detail || '',
            sindhiDetail: sindhiTranslation?.detail || ''
          };
        });
        
        console.log('Processed topics:', topicsData);
        console.log('Topics count:', topicsData.length);
        setTopics(topicsData);
      } else {
        console.error('Failed to fetch topics:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [isSindhi]);

  // Initial fetch
  useEffect(() => {
    console.log('useEffect running, calling fetchTopics, isSindhi:', isSindhi);
    fetchTopics();
  }, [fetchTopics]);

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      topics: topics.length,
      loading,
      total,
      totalPages
    });
  }, [topics, loading, total, totalPages]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  // Calculate display numbers
  const startIdx = total > 0 ? (page - 1) * perPage + 1 : 0;
  const endIdx = Math.min(page * perPage, total);

  // Skeleton loader component for topic chips
  const TopicChipSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded-full w-24"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {content.title[isSindhi ? 'sd' : 'en']}
          </h1>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {content.subtitle[isSindhi ? 'sd' : 'en']}
          </p>
          
          {/* Statistics */}
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{topics.length}</NumberFont>
              <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.totalTopics[isSindhi ? 'sd' : 'en']}
              </div>
            </div>
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">{uniqueTypesCount}</NumberFont>
              <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.uniqueTypes[isSindhi ? 'sd' : 'en']}
              </div>
            </div>
          </div>

          {/* Feature Badge */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
              <BookOpenCheck className="h-4 w-4 text-blue-600" />
              <p className={`text-sm text-blue-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'سنڌي ادب جي عظيم رويت، مختلف موضوعن ۽ ٽڪليون سان' : 'Explore the rich heritage of Sindhi literature through diverse topics and themes'}
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
            <div className="mb-4">
              <div className="relative max-w-lg">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${isRTL ? 'left-4' : 'right-4'}`} />
                <Input
                  type="text"
                  className={`h-10 text-base ${isRTL ? 'pl-12' : 'pr-12'} border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 rounded-xl transition-all duration-200 ${isSindhi ? 'auto-sindhi-font' : ''}`}
                  placeholder={content.searchPlaceholder[isSindhi ? 'sd' : 'en']}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Sort By */}
              <div>
                <label className={`block text-xs font-semibold text-gray-700 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.sortByName[isSindhi ? 'sd' : 'en']}
                </label>
                <div className="relative group">
                  <select 
                    className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'created_at')}
                  >
                    <option value="name" className={isSindhi ? 'auto-sindhi-font' : ''}>{content.sortByName[isSindhi ? 'sd' : 'en']}</option>
                    <option value="count" className={isSindhi ? 'auto-sindhi-font' : ''}>{content.sortByCount[isSindhi ? 'sd' : 'en']}</option>
                    <option value="created_at" className={isSindhi ? 'auto-sindhi-font' : ''}>{content.sortByDate[isSindhi ? 'sd' : 'en']}</option>
                  </select>
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-2' : 'right-0 pr-2'} flex items-center pointer-events-none`}>
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">A-Z</label>
                <div className="relative group">
                  <select 
                    className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">A-Z</option>
                    <option value="desc">Z-A</option>
                  </select>
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-2' : 'right-0 pr-2'} flex items-center pointer-events-none`}>
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm"
                >
                  <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {content.clearFilters[isSindhi ? 'sd' : 'en']}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Results Summary */}
        <div className="mb-8 text-center">
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <p className={`text-gray-600 text-lg mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'پاڻ کي' : 'Found'} <NumberFont className="font-semibold text-gray-900">{total}</NumberFont> {isSindhi ? 'موضوع ملي آھي، جنھن مان پيج' : 'topics, showing page'} <NumberFont className="font-semibold text-gray-900">{startIdx}-{endIdx}</NumberFont> {isSindhi ? 'ڏيکار رھيا آھون.' : '.'}
            </p>
          </div>
        </div>

        {/* Topics Grid */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {loading ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {paginatedTopics.map((topic, index) => {
                const displayTitle = getDisplayName(topic);
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ y: -2 }}
                    className="flex-shrink-0"
                  >
                    <Link href={isSindhi ? `/sd/topics/${topic.slug}` : `/en/topics/${topic.slug}`} title={displayTitle}>
                      <Button
                        variant="ghost"
                        className={`h-auto flex items-center justify-between gap-3 rounded-full border px-4 py-3 ${getTagColor(topic.tag_type)} transition-all duration-200 hover:scale-105`}
                        aria-label={`#${displayTitle}`}
                      >
                        <span className={`truncate text-sm font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          <Hash className="inline w-3 h-3 mr-1" />
                          {displayTitle}
                        </span>
                        <span className="text-xs opacity-75 font-medium bg-white/50 px-2 py-1 rounded-full">
                          {topic.tag_type?.charAt(0) || 'T'}
                        </span>
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
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