'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown,
  Filter,
  BookOpenCheck,
  Hash,
  Clock,
  Heart,
  Bookmark,
  Share2,
  Users,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { NumberFont, MixedContentWithNumbers } from '@/components/ui/NumberFont';
import { cn } from '@/lib/utils';

interface Couplet {
  id: string;
  lines: string[];
  lang: string;
  poet: {
    id: string;
    name: string;
    slug: string;
    photo?: string;
  };
  tags?: Array<{
    id: string;
    slug: string;
    label: string;
    tag_type: string;
  }>;
  created_at: string;
  view_count?: number;
}

interface Poetry {
  id: string;
  title: string;
  slug: string;
  lang: string;
  poet: {
    id: string;
    name: string;
    slug: string;
    photo?: string;
  };
  category: {
    id: string;
    slug: string;
    englishName: string;
    sindhiName: string;
  };
  tags?: Array<{
    id: string;
    slug: string;
    label: string;
    tag_type: string;
  }>;
  created_at: string;
  view_count?: number;
  reading_time?: number;
}

interface Topic {
  id: string;
  slug: string;
  label: string;
  tag_type: string;
  created_at: string;
  translations: Array<{
    lang_code: string;
    title: string;
    detail: string;
  }>;
  englishTitle: string;
  sindhiTitle: string;
  englishDetail: string;
  sindhiDetail: string;
}

export default function TopicPage() {
  const pathname = usePathname();
  const params = useParams();
  const topicSlug = params.slug as string;
  const isSindhi = pathname.startsWith('/sd');
  const isRTL = isSindhi;

  // State management
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [featuredCouplets, setFeaturedCouplets] = useState<Couplet[]>([]);
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [coupletsLoaded, setCoupletsLoaded] = useState(false);
  const [poetryLoaded, setPoetryLoaded] = useState(false);
  const [coupletsPage, setCoupletsPage] = useState(1);
  const [poetryPage, setPoetryPage] = useState(1);
  const coupletsPerPage = 6;
  const poetryPerPage = 12;

  console.log('TopicPage component rendered, isSindhi:', isSindhi, 'topicSlug:', topicSlug);

  // Content translations
  const content = {
    title: {
      en: 'Nature Poetry',
      sd: 'فطرت جي شاعري'
    },
    subtitle: {
      en: 'Explore beautiful couplets and poetry about nature, seasons, and the natural world',
      sd: 'فطرت، موسم، ۽ قدرتي دنيا بابت خوبصورت شعر ۽ شاعري ڏسو'
    },
    featuredCouplets: {
      en: 'Featured Couplets',
      sd: 'چونڊ شعر'
    },
    featuredCoupletsSubtitle: {
      en: 'Beautiful couplets about nature from our collection',
      sd: 'اسانجي مجموعي مان فطرت بابت خوبصورت شعر'
    },
    poetry: {
      en: 'Poetry Collections',
      sd: 'شاعري جا مجموعا'
    },
    poetrySubtitle: {
      en: 'Complete poetry works related to nature themes',
      sd: 'فطرت جي موضوعن سان لاڳاپيل مڪمل شاعري'
    },
    totalCouplets: {
      en: 'Total Couplets',
      sd: 'سڀئي شعر'
    },
    totalPoetry: {
      en: 'Total Poetry',
      sd: 'سڀئي شاعري'
    },
    readingTime: {
      en: 'min read',
      sd: 'منٽ پڙهو'
    },
    viewCount: {
      en: 'views',
      sd: 'ڏسو'
    },
    loadMore: {
      en: 'Load More',
      sd: 'وڌيڪ ڳوليو'
    }
  };

  // Get display name based on language
  const getDisplayName = (item: any): string => {
    if (isSindhi) {
      return item.sindhiTitle || item.sindhiName || item.title || item.name || item.label;
    }
    return item.englishTitle || item.englishName || item.title || item.name || item.label;
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

    const hash = tagType.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Fetch topic details
  const fetchTopic = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        lang: isSindhi ? 'sd' : 'en',
        type: 'Topic'
      });

      const response = await fetch(`/api/tags?${params}`);
      if (response.ok) {
        const data = await response.json();
        const topics = data.items || [];
        const foundTopic = topics.find((t: Topic) => t.slug === topicSlug);
        setTopic(foundTopic || null);
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured couplets with nature tag
  const fetchFeaturedCouplets = async () => {
    try {
      setCoupletsLoaded(false);
      const params = new URLSearchParams({
        limit: '24',
        page: '1',
        lang: isSindhi ? 'sd' : 'en',
        tags: topicSlug // Filter by nature tag
      });

      const response = await fetch(`/api/couplets?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.couplets) {
          // Group couplets by poet and select one from each
          const poetGroups: Record<string, { poet: any; couplets: any[] }> = data.couplets.reduce((acc: Record<string, { poet: any; couplets: any[] }>, couplet: any) => {
            const poetId = couplet.poet?.id || couplet.poet?.slug || 'unknown';
            if (!acc[poetId]) {
              acc[poetId] = {
                poet: couplet.poet || { id: 'unknown', name: 'Unknown Poet', slug: 'unknown' },
                couplets: []
              };
            }
            acc[poetId].couplets.push(couplet);
            return acc;
          }, {});

          const allPoets = Object.values(poetGroups);
          const selectedCouplets: any[] = [];
          const usedPoetIds = new Set<string>();
          
          const shuffledPoets = allPoets.sort(() => Math.random() - 0.5);
          const maxCouplets = Math.min(18, shuffledPoets.length);
          
          for (const poetGroup of shuffledPoets) {
            if (selectedCouplets.length >= maxCouplets) break;
            
            const poetId = poetGroup.poet?.id || poetGroup.poet?.slug || 'unknown';
            if (usedPoetIds.has(poetId)) continue;
            
            const randomCouplet = poetGroup.couplets[Math.floor(Math.random() * poetGroup.couplets.length)];
            selectedCouplets.push(randomCouplet);
            usedPoetIds.add(poetId);
          }
          
          setFeaturedCouplets(selectedCouplets);
        }
      }
    } catch (error) {
      console.error('Error fetching featured couplets:', error);
    } finally {
      setCoupletsLoaded(true);
    }
  };

  // Fetch poetry with nature category
  const fetchPoetry = async () => {
    try {
      setPoetryLoaded(false);
      const params = new URLSearchParams({
        limit: '24',
        page: '1',
        lang: isSindhi ? 'sd' : 'en',
        category: topicSlug // Filter by nature category
      });

      const response = await fetch(`/api/poetry?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.poetry) {
          setPoetry(data.poetry);
        }
      }
    } catch (error) {
      console.error('Error fetching poetry:', error);
    } finally {
      setPoetryLoaded(true);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTopic();
  }, [topicSlug, isSindhi]);

  useEffect(() => {
    if (topic) {
      fetchFeaturedCouplets();
      fetchPoetry();
    }
  }, [topic, isSindhi]);

  // Pagination handlers
  const handleCoupletsPageChange = (newPage: number) => {
    setCoupletsPage(newPage);
  };

  const handlePoetryPageChange = (newPage: number) => {
    setPoetryPage(newPage);
  };

  // Calculate pagination
  const totalCouplets = featuredCouplets.length;
  const totalPoetry = poetry.length;
  const coupletsTotalPages = Math.ceil(totalCouplets / coupletsPerPage);
  const poetryTotalPages = Math.ceil(totalPoetry / poetryPerPage);

  const paginatedCouplets = featuredCouplets.slice(
    (coupletsPage - 1) * coupletsPerPage,
    coupletsPage * coupletsPerPage
  );

  const paginatedPoetry = poetry.slice(
    (poetryPage - 1) * poetryPerPage,
    poetryPage * poetryPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="text-center">
            <h1 className={`text-4xl font-bold text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'موضوع نہ مليو' : 'Topic Not Found'}
            </h1>
            <p className={`text-lg text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'هي موضوع موجود ناهي' : 'The requested topic could not be found'}
            </p>
          </div>
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
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {getDisplayName(topic)}
          </h1>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {isSindhi ? topic.sindhiDetail : topic.englishDetail}
          </p>
          
          {/* Statistics */}
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900">{totalCouplets}</NumberFont>
              <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.totalCouplets[isSindhi ? 'sd' : 'en']}
              </div>
            </div>
            <div className="text-center">
              <NumberFont className="text-3xl font-bold text-gray-900">{totalPoetry}</NumberFont>
              <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.totalPoetry[isSindhi ? 'sd' : 'en']}
              </div>
            </div>
          </div>

          {/* Feature Badge */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
              <Tag className="h-4 w-4 text-green-600" />
              <p className={`text-sm text-green-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'فطرت جي خوبصورتي ۽ شاعري' : 'Nature\'s beauty and poetry'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Featured Couplets Section */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
              {content.featuredCouplets[isSindhi ? 'sd' : 'en']}
            </h2>
            <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
              {content.featuredCoupletsSubtitle[isSindhi ? 'sd' : 'en']}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {!coupletsLoaded ? (
              Array.from({ length: 6 }).map((_, i) => (
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
              paginatedCouplets.map((couplet, index) => (
                <motion.div
                  key={`couplet-${couplet.id || `unknown-${index}`}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transition-all duration-200"
                >
                  <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                    <CardContent className="p-8">
                      {/* Couplet Content */}
                      <div className="space-y-2 mb-6">
                        <div className="text-center space-y-1">
                          {couplet.lines.slice(0, 2).map((line, lineIndex) => (
                            <div 
                              key={`${couplet.id || 'unknown'}-line-${lineIndex}`}
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
                          <Avatar className="w-8 h-8 bg-background border border-border/20 shadow-sm">
                            <AvatarImage src={couplet.poet?.photo || undefined} alt={couplet.poet?.name || 'Unknown'} />
                            <AvatarFallback className={cn(
                              "text-sm font-medium text-foreground",
                              couplet.lang === 'sd' ? 'auto-sindhi-font' : ''
                            )}>
                              {couplet.lang === 'sd' 
                                ? (couplet.poet?.name || 'Unknown').charAt(0)
                                : (couplet.poet?.name || 'Unknown').charAt(0).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          <span className={`text-sm text-gray-700 font-medium ${couplet.lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                            {couplet.poet?.name || 'Unknown Poet'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-4 w-4" />
                          <MixedContentWithNumbers 
                            text={isSindhi ? '2 منٽ' : '2 min'}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4">
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Bookmark className="h-4 w-4 text-gray-600 hover:text-blue-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Share2 className="h-4 w-4 text-gray-600 hover:text-green-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="h-4 w-4" />
                          <NumberFont className="text-xs">
                            {couplet.view_count ? `${couplet.view_count}` : '0'}
                          </NumberFont>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Couplets Pagination */}
          {coupletsTotalPages > 1 && !coupletsLoaded && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleCoupletsPageChange(coupletsPage - 1)}
                  disabled={coupletsPage === 1}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                >
                  <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isRTL ? '→' : '←'}
                  </span>
                </Button>
                
                {Array.from({ length: coupletsTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === coupletsPage ? "default" : "outline"}
                    onClick={() => handleCoupletsPageChange(pageNum)}
                    size="lg"
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      pageNum === coupletsPage 
                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg" 
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <NumberFont>{pageNum}</NumberFont>
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleCoupletsPageChange(coupletsPage + 1)}
                  disabled={coupletsPage === coupletsTotalPages}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                >
                  <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isRTL ? '←' : '→'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Poetry Section */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
              {content.poetry[isSindhi ? 'sd' : 'en']}
            </h2>
            <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
              {content.poetrySubtitle[isSindhi ? 'sd' : 'en']}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!poetryLoaded ? (
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`poetry-skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                        <div className="flex items-center gap-3 pt-4">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              paginatedPoetry.map((poem, index) => (
                <motion.div
                  key={`poetry-${poem.id || `unknown-${index}`}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transition-all duration-200"
                >
                  <Link href={`${isSindhi ? '/sd' : '/en'}/poetry/${poem.slug}`}>
                    <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className={`text-lg font-semibold text-gray-900 line-clamp-2 ${poem.lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                            {poem.title}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getDisplayName(poem.category)}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-background border border-border/20 shadow-sm">
                                <AvatarImage src={poem.poet?.photo || undefined} alt={poem.poet?.name || 'Unknown'} />
                                <AvatarFallback className={cn(
                                  "text-sm font-medium text-foreground",
                                  poem.lang === 'sd' ? 'auto-sindhi-font' : ''
                                )}>
                                  {poem.lang === 'sd' 
                                    ? (poem.poet?.name || 'Unknown').charAt(0)
                                    : (poem.poet?.name || 'Unknown').charAt(0).toUpperCase()
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span className={`text-sm text-gray-700 font-medium ${poem.lang === 'sd' ? 'auto-sindhi-font' : ''}`}>
                                {poem.poet?.name || 'Unknown Poet'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-4 w-4" />
                              <MixedContentWithNumbers 
                                text={isSindhi ? `${poem.reading_time || 5} منٽ` : `${poem.reading_time || 5} min`}
                                className="text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Eye className="h-4 w-4" />
                              <NumberFont className="text-xs">
                                {poem.view_count ? `${poem.view_count}` : '0'}
                              </NumberFont>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(poem.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          {/* Poetry Pagination */}
          {poetryTotalPages > 1 && !poetryLoaded && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePoetryPageChange(poetryPage - 1)}
                  disabled={poetryPage === 1}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                >
                  <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isRTL ? '→' : '←'}
                  </span>
                </Button>
                
                {Array.from({ length: poetryTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === poetryPage ? "default" : "outline"}
                    onClick={() => handlePoetryPageChange(pageNum)}
                    size="lg"
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      pageNum === poetryPage 
                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg" 
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <NumberFont>{pageNum}</NumberFont>
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handlePoetryPageChange(poetryPage + 1)}
                  disabled={poetryPage === poetryTotalPages}
                  size="lg"
                  className="border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-6 py-3 disabled:opacity-50"
                >
                  <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isRTL ? '←' : '→'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
