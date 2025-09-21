"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedTimelineSkeleton } from "@/components/ui/timeline-skeleton";
import { 
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
  Search,
  Filter,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

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
}

export default function TimelinePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const [timelinePeriods, setTimelinePeriods] = useState<TimelinePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;

  // Multi-lingual content
  const content = {
    title: isSindhi ? 'سنڌي شاعري جي تاريخي ٽائيم لائين' : 'Historical Timeline of Sindhi Poetry',
    subtitle: isSindhi ? 'سنڌي ادب جي ارتقا کي مختلف دورن ۾ ڏسو. هر دور جي شاعرن، شاعري، ۽ اهميت کي سمجھو.' : 'Explore the evolution of Sindhi literature through different eras. Understand the poets, poetry, and significance of each period.',
    chronologicalNote: isSindhi 
      ? 'ٽائيم لائين کي تاريخ موجب ترتيب ڏنو ويو آهي — قديم دور کان جديد دور تائين'
      : 'Timeline is arranged chronologically — from early eras to the modern period',
    back: isSindhi ? 'واپس' : 'Back',
    filters: isSindhi ? 'فلٽر' : 'Filters',
    allPeriods: isSindhi ? 'سڀ دور' : 'All Periods',
    exploreEra: isSindhi ? 'دور ڳوليو' : 'Explore Era',
    viewDetails: isSindhi ? 'تفصيل ڏسو' : 'View Details',
    totalPeriods: isSindhi ? 'سڀئي دور' : 'Total Periods',
    poets: isSindhi ? 'شاعر' : 'Poets',
    works: isSindhi ? 'ڪم' : 'Works',
    years: isSindhi ? 'سال' : 'Years',
    significance: isSindhi ? 'اهميت' : 'Significance',
    tags: isSindhi ? 'ٽڪليون' : 'Tags',
    notablePoets: isSindhi ? 'مشهور شاعر' : 'Notable Poets',
    eraOverview: isSindhi ? 'دور جو جائزو' : 'Era Overview',
    culturalImpact: isSindhi ? 'ثقافتي اثر' : 'Cultural Impact',
    literaryEvolution: isSindhi ? 'ادبي ارتقا' : 'Literary Evolution'
  };

  // Fetch timeline data from API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const lang = isSindhi ? 'sd' : 'en';
        const response = await fetch(`/api/timeline/periods?lang=${lang}&limit=100`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch timeline data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTimelinePeriods(data.periods || []);
        } else {
          throw new Error(data.error || 'Failed to fetch timeline data');
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [isSindhi]);

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

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredPeriods = useMemo(() => {
    // Use API data or fallback to empty array
    const displayPeriods = timelinePeriods.length > 0 ? timelinePeriods : [];
    let filtered = displayPeriods;
    
    // Filter by selected period
    if (selectedPeriod !== "All") {
      filtered = filtered.filter(period => 
        period.name.toLowerCase().includes(selectedPeriod.toLowerCase()) ||
        period.period_slug.toLowerCase().includes(selectedPeriod.toLowerCase())
      );
    }
    
    // Sort by start year or name
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.start_year - b.start_year;
      } else {
        return b.start_year - a.start_year;
      }
    });
    
    return filtered;
  }, [selectedPeriod, sortOrder, timelinePeriods]);

  return (
    <div key={`timeline-${isSindhi ? 'sd' : 'en'}`} className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section (copied from poetry page style) */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {content.title}
            </h1>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {content.subtitle}
            </p>

            {/* Feature Badge (from poetry hero) */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className={`text-sm text-blue-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.chronologicalNote}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Filters - styled like previous pages */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Period Filter */}
                <div>
                  <label className={`block text-xs font-semibold text-gray-700 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {content.allPeriods}
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="All" className={isSindhi ? 'auto-sindhi-font' : ''}>{content.allPeriods}</option>
                      <option value="17th">17th</option>
                      <option value="18th">18th</option>
                      <option value="19th">19th</option>
                      <option value="20th">20th</option>
                      <option value="21st">21st</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button 
                    onClick={() => { setSelectedPeriod('All'); setSortOrder('asc'); }}
                    variant="outline" 
                    className="w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm"
                  >
                    <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Loading State */}
          {loading && (
            <div className="py-8">
              <EnhancedTimelineSkeleton 
                count={6} 
                isSindhi={isSindhi} 
                isRTL={isRTL} 
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-2">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold">
                    {isSindhi ? 'خرابي آئي آهي' : 'Error occurred'}
                  </h3>
                </div>
                <p className={`text-sm text-red-700 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {error}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  {isSindhi ? 'دوبارہ ڪوشش ڪريو' : 'Try Again'}
                </Button>
              </div>
            </div>
          )}

          {/* Timeline Vertical */}
          {!loading && !error && (
          <section>
            <div className="relative">
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gray-200/60" aria-hidden="true" />
              <div className="space-y-8">
                {filteredPeriods.map((period, index) => (
                  <motion.div 
                    key={`${period.id}-${period.name}`} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: index * 0.06 }}
                    className="relative pl-12 sm:pl-16"
                  >
                    {/* Dot */}
                    <div className="absolute left-4 sm:left-8 mt-3 -translate-x-1/2">
                      <div className="h-3 w-3 rounded-full bg-foreground ring-4 ring-background" />
                    </div>

                    <Link href={isSindhi ? `/sd/timeline/${period.period_slug}` : `/en/timeline/${period.period_slug}`}>
                      <Card className="group cursor-pointer rounded-xl border border-gray-200/50 hover:border-gray-300 shadow-sm transition-all bg-white hover:bg-gray-50">
                        <CardHeader className="pt-6 pb-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-xl ${getColorClasses(period.color_code)}`}>
                              {React.createElement(getIconComponent(period.icon_name), { className: "h-8 w-8" })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <CardTitle className={`text-xl font-semibold leading-tight group-hover:opacity-90 transition-opacity ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {period.name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                                  {formatYears(period.start_year, period.end_year, period.is_ongoing)}
                                </Badge>
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{period.start_year} - {period.end_year || (period.is_ongoing ? 'Present' : 'Ongoing')}</span>
                                </div>
                                {period.is_featured && (
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
                          <p className={`text-sm text-muted-foreground mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {period.description || (isSindhi ? 'تفصيل دستياب نہيں' : 'Description not available')}
                          </p>

                          {period.characteristics && period.characteristics.length > 0 && (
                          <div className="mb-4">
                            <h4 className={`text-sm font-medium mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {isSindhi ? 'خاصيتون' : 'Characteristics'}:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {period.characteristics.map((characteristic, charIndex) => (
                                <Badge 
                                    key={charIndex} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 rounded-full"
                                >
                                    {characteristic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200/40 dark:border-white/10">
                            <div className="text-sm text-muted-foreground">
                              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                                {isSindhi ? 'دور جي اهميت' : 'Period Significance'}: {period.description || (isSindhi ? 'دستياب نہيں' : 'Not available')}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPeriods.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className={`text-lg font-medium mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'ڪو به دور نہيں مليا' : 'No periods found'}
                </h3>
                <p className={`text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'ڪو به دور دستياب نہيں آهي' : 'No timeline periods are available at the moment.'}
                </p>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
