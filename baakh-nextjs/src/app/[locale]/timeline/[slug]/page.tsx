"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Clock,
  Users,
  Quote,
  Heart,
  BookOpen,
  Sparkles,
  Star,
  TrendingUp,
  Award,
  Eye,
  Bookmark,
  Globe,
  Palette,
  ChevronRight,
  Calendar,
  FileText,
  History,
  User,
  Languages,
  AlertCircle,
  MapPin,
  Tag,
  Share2,
  BookmarkPlus,
  Heart as HeartIcon,
  Search,
  Filter
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { NumberFont } from "@/components/ui/NumberFont";
import SmartPagination from "@/components/ui/SmartPagination";
import Link from "next/link";

interface TimelinePeriod {
  id: string;
  period_slug: string;
  start_year: number;
  end_year: number | null;
  is_ongoing: boolean;
  name: string;
  description: string;
  characteristics: string[];
  color_code: string;
  icon_name: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface TimelineEvent {
  id: string;
  event_slug: string;
  event_date: string;
  event_year: number;
  is_approximate: boolean;
  title: string;
  description: string;
  location: string;
  event_type: string;
  importance_level: number;
  tags: string[];
  color_code: string;
  icon_name: string | null;
  is_featured: boolean;
  period?: {
    id: string;
    slug: string;
    name: string;
    color_code: string;
  };
  poet?: {
    id: string;
    slug: string;
    name: string;
    file_url: string;
  };
}

interface Poet {
  id: string;
  poet_slug: string;
  english_name: string;
  sindhi_name: string;
  english_laqab: string;
  sindhi_laqab: string;
  english_tagline: string;
  sindhi_tagline: string;
  birth_date: string;
  death_date: string | null;
  birth_place: string;
  death_place: string | null;
  file_url: string | null;
  photo: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface Poetry {
  id: string;
  slug: string;
  title: string;
  sindhi_title: string;
  description: string;
  sindhi_description: string;
  category_slug: string;
  category_name: string;
  sindhi_category_name: string;
  poet_id: string;
  poet_slug: string;
  poet_name: string;
  sindhi_poet_name: string;
  created_at: string;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  bookmark_count: number;
}

export default function SingleTimelinePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [poets, setPoets] = useState<Poet[]>([]);
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for poets
  const [poetsPage, setPoetsPage] = useState(1);
  const poetsPerPage = 8;
  const router = useRouter();
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;

  // Pagination logic for poets
  const totalPoetsPages = Math.ceil(poets.length / poetsPerPage);
  const startIndex = (poetsPage - 1) * poetsPerPage;
  const endIndex = startIndex + poetsPerPage;
  const paginatedPoets = poets.slice(startIndex, endIndex);

  const handlePoetsPageChange = (page: number) => {
    setPoetsPage(page);
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

  // Multi-lingual content
  const content = {
    backToTimeline: isSindhi ? 'ٽائيم لائين ڏانهن واپس' : 'Back to Timeline',
    exploreEra: isSindhi ? 'دور ڳوليو' : 'Explore Era',
    viewDetails: isSindhi ? 'تفصيل ڏسو' : 'View Details',
    totalEvents: isSindhi ? 'سڀئي واقعا' : 'Total Events',
    poets: isSindhi ? 'شاعر' : 'Poets',
    works: isSindhi ? 'ڪم' : 'Works',
    years: isSindhi ? 'سال' : 'Years',
    significance: isSindhi ? 'اهميت' : 'Significance',
    tags: isSindhi ? 'ٽڪليون' : 'Tags',
    notablePoets: isSindhi ? 'مشهور شاعر' : 'Notable Poets',
    eraOverview: isSindhi ? 'دور جو جائزو' : 'Era Overview',
    culturalImpact: isSindhi ? 'ثقافتي اثر' : 'Cultural Impact',
    literaryEvolution: isSindhi ? 'ادبي ارتقا' : 'Literary Evolution',
    keyEvents: isSindhi ? 'اھم واقعا' : 'Key Events',
    timeline: isSindhi ? 'ٽائيم لائين' : 'Timeline',
    periodDetails: isSindhi ? 'دور جي تفصيل' : 'Period Details',
    characteristics: isSindhi ? 'خاصيتون' : 'Characteristics',
    description: isSindhi ? 'تفصيل' : 'Description',
    timeSpan: isSindhi ? 'وقت' : 'Time Span',
    location: isSindhi ? 'مقام' : 'Location',
    eventType: isSindhi ? 'واقعي جو قسم' : 'Event Type',
    importance: isSindhi ? 'اهميت' : 'Importance',
    relatedPoets: isSindhi ? 'لاڳاپيل شاعر' : 'Related Poets',
    eraPoets: isSindhi ? 'دور جا شاعر' : 'Era Poets',
    eraPoetry: isSindhi ? 'دور جي شاعري' : 'Era Poetry',
    viewProfile: isSindhi ? 'پروفائل ڏسو' : 'View Profile',
    viewPoetry: isSindhi ? 'شاعري ڏسو' : 'View Poetry',
    birthYear: isSindhi ? 'پيدائش' : 'Born',
    deathYear: isSindhi ? 'وفات' : 'Died',
    totalPoets: isSindhi ? 'سڀئي شاعر' : 'Total Poets',
    totalPoetry: isSindhi ? 'سڀئي شاعري' : 'Total Poetry',
    loading: isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...',
    errorOccurred: isSindhi ? 'خرابي آئي آهي' : 'Error occurred',
    tryAgain: isSindhi ? 'دوبارہ ڪوشش ڪريو' : 'Try Again',
    share: isSindhi ? 'ونڊ ڪريو' : 'Share',
    bookmark: isSindhi ? 'بڪ مارڪ' : 'Bookmark',
    like: isSindhi ? 'پسند ڪريو' : 'Like'
  };

  // Fetch timeline period data
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const lang = isSindhi ? 'sd' : 'en';
        
        // Fetch period by slug
        const periodResponse = await fetch(`/api/timeline/periods?lang=${lang}&search=${slug}`);
        
        if (!periodResponse.ok) {
          throw new Error(`Failed to fetch timeline period: ${periodResponse.status}`);
        }
        
        const periodData = await periodResponse.json();
        
        if (periodData.success && periodData.periods.length > 0) {
          const period = periodData.periods.find((p: TimelinePeriod) => p.period_slug === slug);
          if (period) {
            setTimelinePeriod(period);
            
            // Fetch events for this period
            const eventsResponse = await fetch(`/api/timeline/events?lang=${lang}&period_id=${period.id}`);
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              if (eventsData.success) {
                setTimelineEvents(eventsData.events || []);
              }
            }

            // Fetch poets for this era based on birth/death dates
            const startYear = period.start_year;
            const endYear = period.end_year || new Date().getFullYear();
            console.log('Fetching poets for era:', { 
              startYear, 
              endYear, 
              periodName: period.name,
              periodSlug: period.period_slug,
              isOngoing: period.is_ongoing
            });
            
            const poetsResponse = await fetch(`/api/poets?lang=${lang}&start_year=${startYear}&end_year=${endYear}&limit=50`);
            if (poetsResponse.ok) {
              const poetsData = await poetsResponse.json();
              console.log('Poets API response:', { success: poetsData.success, count: poetsData.poets?.length || 0 });
              if (poetsData.success) {
                // Ensure client-side match: keep only poets whose lifespan overlaps the period
                const allPoets: Poet[] = poetsData.poets || [];
                const periodStart = startYear;
                const periodEnd = endYear;
                const filteredPoets = allPoets.filter((p: Poet) => {
                  const birthYear = p.birth_date ? new Date(p.birth_date).getFullYear() : null;
                  const deathYear = p.death_date ? new Date(p.death_date).getFullYear() : null;
                  const poetStart = birthYear ?? periodStart;
                  const poetEnd = deathYear ?? periodEnd;
                  return poetStart <= periodEnd && poetEnd >= periodStart;
                });
                console.log('Filtered poets count (client-side overlap):', filteredPoets.length);
                setPoets(filteredPoets);
              }
            } else {
              console.error('Poets API error:', poetsResponse.status, poetsResponse.statusText);
            }

            // Fetch poetry for this era
            const poetryResponse = await fetch(`/api/poetry?lang=${lang}&start_year=${period.start_year}&end_year=${period.end_year || new Date().getFullYear()}&limit=50`);
            if (poetryResponse.ok) {
              const poetryData = await poetryResponse.json();
              if (poetryData.success) {
                setPoetry(poetryData.poetry || []);
              }
            }
          } else {
            throw new Error('Timeline period not found');
          }
        } else {
          throw new Error('Timeline period not found');
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTimelineData();
    }
  }, [slug, isSindhi]);

  // Helper function to get icon component
  const getIconComponent = (iconName: string | null) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'history': History,
      'star': Star,
      'sparkles': Sparkles,
      'trending-up': TrendingUp,
      'globe': Globe,
      'book': BookOpen,
      'users': Users,
      'clock': Clock,
      'heart': Heart,
      'quote': Quote,
      'award': Award,
      'eye': Eye,
      'bookmark': Bookmark,
      'palette': Palette,
      'calendar': Calendar,
      'file-text': FileText,
      'user': User,
      'languages': Languages,
      'search': Search,
      'filter': Filter
    };
    return iconMap[iconName || 'history'] || History;
  };

  // Helper function to get color classes
  const getColorClasses = (colorCode: string) => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      '#10B981': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      '#F59E0B': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      '#EF4444': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      '#8B5CF6': 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      '#F97316': 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      '#06B6D4': 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      '#84CC16': 'bg-lime-100 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400'
    };
    return colorMap[colorCode] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  // Helper function to format years
  const formatYears = (startYear: number, endYear: number | null, isOngoing: boolean) => {
    if (isOngoing) {
      return `${startYear}-Present`;
    }
    if (endYear) {
      return `${startYear}-${endYear}`;
    }
    return `${startYear}`;
  };

  // Helper function to get event type display
  const getEventTypeDisplay = (eventType: string) => {
    const typeMap: { [key: string]: string } = {
      'historical': isSindhi ? 'تاريخي' : 'Historical',
      'literary': isSindhi ? 'ادبي' : 'Literary',
      'cultural': isSindhi ? 'ثقافتي' : 'Cultural',
      'political': isSindhi ? 'سياسي' : 'Political',
      'birth': isSindhi ? 'پيدائش' : 'Birth',
      'death': isSindhi ? 'وفات' : 'Death',
      'publication': isSindhi ? 'اشاعت' : 'Publication',
      'award': isSindhi ? 'انعام' : 'Award'
    };
    return typeMap[eventType] || eventType;
  };

  // Helper function to get importance level display
  const getImportanceDisplay = (level: number) => {
    const levels = isSindhi 
      ? ['عام', 'اھم', 'وڏي اھميت', 'انتہائي اھم', 'تاريخ ساز']
      : ['Low', 'Medium', 'High', 'Very High', 'Historic'];
    return levels[Math.min(level - 1, 4)] || levels[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded-full w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-12 border-t border-gray-200/50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                  <div className="h-7 w-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-8">
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !timelinePeriod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {content.errorOccurred}
            </h3>
            <p className={`text-gray-500 text-lg mb-6 max-w-md mx-auto ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {error || 'Timeline period not found'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="h-11 px-6 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white"
              >
                {content.tryAgain}
              </Button>
              <Button 
                onClick={() => router.push(isSindhi ? '/sd/timeline' : '/en/timeline')} 
                variant="outline"
                className="h-11 px-6 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white"
              >
                {content.backToTimeline}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Back Button */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button 
            variant="outline" 
            onClick={() => router.push(isSindhi ? '/sd/timeline' : '/en/timeline')}
            className="border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white h-10 px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {content.backToTimeline}
          </Button>
        </motion.div>

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
              {/* Timeline Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full mb-6`}>
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className={`text-sm text-blue-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.timeline}
                </p>
              </div>

              <h1 
                className={`${isSindhi ? 'sd-hero-title' : 'text-4xl md:text-5xl font-serif text-black leading-tight tracking-tight'}`}
                style={isSindhi ? undefined : {}}
              >
                {timelinePeriod.name}
              </h1>
            </motion.div>

            {/* Period Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-12 border-t border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                  {formatYears(timelinePeriod.start_year, timelinePeriod.end_year, timelinePeriod.is_ongoing)}
                </NumberFont>
                <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.timeSpan}
                </div>
              </div>
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                  {timelineEvents.length}
                </NumberFont>
                <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalEvents}
                </div>
              </div>
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                  {poets.length}
                </NumberFont>
                <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalPoets}
                </div>
              </div>
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-4 flex flex-col items-center justify-center h-[100px]">
                <NumberFont className="text-2xl text-gray-900 font-normal mb-1" size="xl" weight="normal">
                  {poetry.length}
                </NumberFont>
                <div className={`text-[12px] text-gray-600 font-normal ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalPoetry}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Period Details */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className={`p-4 rounded-xl ${getColorClasses(timelinePeriod.color_code)}`}>
                {React.createElement(getIconComponent(timelinePeriod.icon_name), { className: "h-8 w-8" })}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-2xl font-semibold leading-tight mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.periodDetails}
                </h2>
                <div className="flex gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className={isSindhi ? 'font-english' : ''}>{timelinePeriod.start_year} - {timelinePeriod.end_year || (timelinePeriod.is_ongoing ? 'Present' : 'Ongoing')}</span>
                  </div>
                  {timelinePeriod.is_featured && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Featured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {timelinePeriod.characteristics && timelinePeriod.characteristics.length > 0 && (
              <div className="mb-8">
                <h4 className={`text-lg font-medium mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.characteristics}:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {timelinePeriod.characteristics.map((characteristic, charIndex) => (
                    <Badge 
                      key={charIndex} 
                      variant="secondary" 
                      className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      <span className={isSindhi ? 'font-english' : ''}>{characteristic}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200/50">
              <p className={`text-gray-600 leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {timelinePeriod.description || (isSindhi ? 'دور جي اهميت ۽ تفصيل دستياب نہيں' : 'Period significance and details not available')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Key Events */}
        {timelineEvents.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <h2 className={`text-[22px] leading-snug text-gray-900 font-normal mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.keyEvents}
              </h2>
              <p className={`text-[16px] leading-7 text-gray-600 font-light max-w-2xl mx-auto ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'هن دور جي اهم واقعا ۽ تاريخي گھڙيون' : 'Important events and historical moments of this era'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {timelineEvents.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full border border-gray-200 bg-white overflow-hidden rounded-xl hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pt-6 pb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getColorClasses(event.color_code || timelinePeriod.color_code)}`}>
                          {React.createElement(getIconComponent(event.icon_name), { className: "h-6 w-6" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className={`text-xl font-semibold leading-tight group-hover:opacity-90 transition-opacity ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-gray-200 bg-gray-50">
                                <span className="number">{event.event_year}</span>
                              </Badge>
                              {event.is_featured && (
                                <Star className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span className={isSindhi ? 'font-english' : ''}>{event.event_date}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className={isSindhi ? 'font-english' : ''}>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-6">
                      {event.description && (
                        <p className={`text-sm text-gray-600 mb-4 line-clamp-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Tag className="w-4 h-4" />
                        <span>{getEventTypeDisplay(event.event_type)}</span>
                        <Award className="w-4 h-4 ml-2" />
                        <span>{getImportanceDisplay(event.importance_level)}</span>
                      </div>

                      {event.tags && event.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {event.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                <span className={isSindhi ? 'font-english' : ''}>{tag}</span>
                              </Badge>
                            ))}
                            {event.tags.length > 3 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                <span className="number">+{event.tags.length - 3}</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                        <div className="text-sm text-gray-500">
                          <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                            {isSindhi ? 'واقعي جي اهميت' : 'Event Significance'}: {getImportanceDisplay(event.importance_level)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}


        {/* Era Poets Section */}
        {poets.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className={`text-[22px] leading-snug text-gray-900 font-normal mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.eraPoets}
              </h2>
              <p className={`text-[16px] leading-7 text-gray-600 font-light max-w-2xl mx-auto ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'هن دور جا مشهور شاعر ۽ انھن جي ادبي خدمتون' : 'Famous poets of this era and their literary contributions'}
              </p>
              <div className="mt-4">
                <NumberFont className="text-2xl font-bold text-gray-900" size="xl" weight="bold">
                  {poets.length}
                </NumberFont>
                <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalPoets}
                </div>
              </div>
            </div>
            
            {/* Poets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
              {paginatedPoets.map((poet, index) => (
                <motion.div 
                  key={poet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border border-gray-200 bg-white overflow-hidden rounded-xl">
                    <CardHeader className="pt-6 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const poetImgSrc = resolveImageSrc(poet.file_url);
                            return poetImgSrc ? (
                              <img 
                                src={poetImgSrc} 
                                alt={isSindhi ? poet.sindhi_name : poet.english_name}
                                className="w-16 h-16 rounded-xl object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null;
                          })()}
                          <div className={`w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white font-medium text-lg ${poet.file_url ? 'hidden' : ''}`}>
                            {(isSindhi ? (poet.sindhi_laqab || poet.sindhi_name) : (poet.english_laqab || poet.english_name))?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className={`text-xl font-semibold leading-tight mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? (poet.sindhi_laqab || poet.sindhi_name) : (poet.english_laqab || poet.english_name)}
                          </CardTitle>
                          {(poet.sindhi_tagline || poet.english_tagline) && (
                            <p className={`text-xs text-gray-500 line-clamp-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? poet.sindhi_tagline : poet.english_tagline}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-6">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                            {content.birthYear}: <span className="number">{new Date(poet.birth_date).getFullYear()}</span>
                          </span>
                        </div>
                        {poet.death_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                              {content.deathYear}: <span className="number">{new Date(poet.death_date).getFullYear()}</span>
                            </span>
                          </div>
                        )}
                        {poet.birth_place && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className={`line-clamp-1 ${isSindhi ? 'font-english' : ''}`}>
                              {poet.birth_place}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200/50">
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm"
                          className="w-full h-10 border border-gray-300 text-gray-700 rounded-full font-medium text-sm bg-white"
                        >
                          <Link href={isSindhi ? `/sd/poets/${poet.poet_slug}` : `/en/poets/${poet.poet_slug}`}>
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                              {content.viewProfile}
                            </span>
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPoetsPages > 1 && (
              <div className="flex justify-center">
                <SmartPagination
                  currentPage={poetsPage}
                  totalPages={totalPoetsPages}
                  onPageChange={handlePoetsPageChange}
                  isRTL={isRTL}
                  className="mt-8"
                />
              </div>
            )}
          </motion.section>
        )}


        {/* Era Poetry Section */}
        {poetry.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className={`text-[22px] leading-snug text-gray-900 font-normal mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.eraPoetry}
              </h2>
              <p className={`text-[16px] leading-7 text-gray-600 font-light max-w-2xl mx-auto ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'هن دور جي شاعري ۽ ادبي ڪم' : 'Poetry and literary works from this era'}
              </p>
              <div className="mt-4">
                <NumberFont className="text-2xl font-bold text-gray-900" size="xl" weight="bold">
                  {poetry.length}
                </NumberFont>
                <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalPoetry}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {poetry.map((poem, index) => (
                <motion.div 
                  key={poem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full border border-gray-200 bg-white overflow-hidden rounded-xl hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pt-6 pb-4">
                      <CardTitle className={`text-xl font-semibold leading-tight mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? poem.sindhi_title : poem.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className={`line-clamp-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? poem.sindhi_poet_name : poem.poet_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span className={`line-clamp-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? poem.sindhi_category_name : poem.category_name}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-6">
                      {(poem.description || poem.sindhi_description) && (
                        <p className={`text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? poem.sindhi_description : poem.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                        <div className="text-sm text-gray-500">
                          <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                            {content.viewPoetry}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}
