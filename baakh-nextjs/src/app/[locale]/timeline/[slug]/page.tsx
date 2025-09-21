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
  Heart as HeartIcon
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { NumberFont } from "@/components/ui/NumberFont";

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

export default function SingleTimelinePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;

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
    noEventsFound: isSindhi ? 'ڪو به واقعو نہيں مليو' : 'No events found',
    noEventsDescription: isSindhi ? 'هن دور سان لاڳاپيل ڪو به واقعو دستياب نہيں آهي' : 'No events are available for this period.',
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
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              {/* Header Skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-12 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-24 bg-muted rounded-lg"></div>
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !timelinePeriod) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-2">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">
                    {content.errorOccurred}
                  </h3>
                </div>
                <p className={`text-sm text-red-700 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {error || 'Timeline period not found'}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mr-2"
                >
                  {content.tryAgain}
                </Button>
                <Button 
                  onClick={() => router.push(isSindhi ? '/sd/timeline' : '/en/timeline')} 
                  variant="outline"
                >
                  {content.backToTimeline}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => router.push(isSindhi ? '/sd/timeline' : '/en/timeline')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {content.backToTimeline}
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full mb-6`}>
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className={`text-sm text-blue-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.timeline}
                </p>
              </div>
            </div>

            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {timelinePeriod.name}
            </h1>
            
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-8 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {timelinePeriod.description || (isSindhi ? 'تفصيل دستياب نہيں' : 'Description not available')}
            </p>

            {/* Period Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">
                  {formatYears(timelinePeriod.start_year, timelinePeriod.end_year, timelinePeriod.is_ongoing)}
                </NumberFont>
                <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.timeSpan}
                </div>
              </div>
              <div className="text-center">
                <NumberFont className="text-3xl font-bold text-gray-900" size="2xl" weight="bold">
                  {timelineEvents.length}
                </NumberFont>
                <div className={`text-sm text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.totalEvents}
                </div>
              </div>
              {timelinePeriod.is_featured && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600">
                    <Star className="h-6 w-6" />
                    <span className={`text-sm font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {isSindhi ? 'خاص' : 'Featured'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-200 hover:border-gray-300"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {content.share}
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 hover:border-gray-300"
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {content.bookmark}
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 hover:border-gray-300"
              >
                <HeartIcon className="h-4 w-4 mr-2" />
                {content.like}
              </Button>
            </div>
          </motion.section>

          {/* Period Details */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="rounded-2xl border border-gray-200/50 shadow-sm">
              <CardHeader className="pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${getColorClasses(timelinePeriod.color_code)}`}>
                    {React.createElement(getIconComponent(timelinePeriod.icon_name), { className: "h-8 w-8" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`text-2xl font-semibold leading-tight mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {content.periodDetails}
                    </CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{timelinePeriod.start_year} - {timelinePeriod.end_year || (timelinePeriod.is_ongoing ? 'Present' : 'Ongoing')}</span>
                      </div>
                      {timelinePeriod.is_featured && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600">Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                {timelinePeriod.characteristics && timelinePeriod.characteristics.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`text-lg font-medium mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {content.characteristics}:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {timelinePeriod.characteristics.map((characteristic, charIndex) => (
                        <Badge 
                          key={charIndex} 
                          variant="secondary" 
                          className="text-sm px-3 py-1 rounded-full"
                        >
                          {characteristic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200/40">
                  <p className={`text-sm text-muted-foreground ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {timelinePeriod.description || (isSindhi ? 'دور جي اهميت ۽ تفصيل دستياب نہيں' : 'Period significance and details not available')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Key Events */}
          {timelineEvents.length > 0 && (
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className={`text-3xl font-bold text-gray-900 mb-8 text-center ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {content.keyEvents}
              </h2>
              
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group cursor-pointer rounded-xl border border-gray-200/50 hover:border-gray-300 shadow-sm transition-all bg-white hover:bg-gray-50">
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
                                <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                                  {event.event_year}
                                </Badge>
                                {event.is_featured && (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{event.event_date}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                <span>{getEventTypeDisplay(event.event_type)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                <span>{getImportanceDisplay(event.importance_level)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 pb-6">
                        {event.description && (
                          <p className={`text-sm text-muted-foreground mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {event.description}
                          </p>
                        )}

                        {event.tags && event.tags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {event.tags.map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/40">
                          <div className="text-sm text-muted-foreground">
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                              {isSindhi ? 'واقعي جي اهميت' : 'Event Significance'}: {getImportanceDisplay(event.importance_level)}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty Events State */}
          {timelineEvents.length === 0 && (
            <motion.section 
              className="text-center py-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className={`text-lg font-medium mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.noEventsFound}
                </h3>
                <p className={`text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.noEventsDescription}
                </p>
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
