"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Feather, ScrollText, Star, Calendar } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TimelinePeriod {
  id: string;
  period_slug: string;
  start_year: number;
  end_year?: number;
  is_ongoing: boolean;
  name: string;
  description?: string;
  characteristics: string[];
  color_code: string;
  icon_name?: string;
  is_featured: boolean;
  sort_order: number;
}

interface TimelineSectionProps {
  isSindhi: boolean;
}

export default function TimelineSection({ isSindhi }: TimelineSectionProps) {
  const [timelinePeriods, setTimelinePeriods] = useState<TimelinePeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeline/periods/?lang=${isSindhi ? 'sd' : 'en'}&featured=true&limit=3`);
      const data = await response.json();
      
      if (data.success) {
        setTimelinePeriods(data.periods);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  }, [isSindhi]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  // Fallback data if API fails
  const fallbackPeriods = [
    {
      id: "1",
      period_slug: "classical-sindhi-poetry",
      start_year: 1600,
      end_year: 1800,
      is_ongoing: false,
      name: isSindhi ? "ڪلاسيڪل (1600–1800)" : "Classical (1600–1800)",
      description: isSindhi 
        ? "سنڌي شاعري جو سنھري دور جيڪو روحاني ۽ عرفاني موضوعن سان ڀرپور آهي"
        : "The golden age of Sindhi poetry with mystical and spiritual themes",
      characteristics: isSindhi ? ["صوفي شاعري", "ڪلاسيڪل انداز"] : ["Sufi Poetry", "Classical Style"],
      color_code: "#6B7280",
      icon_name: "book-open",
      is_featured: true,
      sort_order: 1
    },
    {
      id: "2",
      period_slug: "modern-sindhi-literature",
      start_year: 1800,
      end_year: 2000,
      is_ongoing: false,
      name: isSindhi ? "جديد (1800–2000)" : "Modern (1800–2000)",
      description: isSindhi 
        ? "سنڌي شاعري جو ارتقا سماجي ۽ فلسفي موضوعن سان"
        : "Evolution of Sindhi poetry with social and philosophical themes",
      characteristics: isSindhi ? ["جديد شاعري", "نثري ادب"] : ["Modern Poetry", "Prose Literature"],
      color_code: "#6B7280",
      icon_name: "feather",
      is_featured: true,
      sort_order: 2
    },
    {
      id: "3",
      period_slug: "contemporary-sindhi-poetry",
      start_year: 2000,
      end_year: null,
      is_ongoing: true,
      name: isSindhi ? "عصري" : "Contemporary",
      description: isSindhi 
        ? "جديد سنڌي شاعري جيڪا موجوده وقت ۽ مسئلن کي عڪس ڪري ٿي"
        : "Modern Sindhi poetry reflecting current times and issues",
      characteristics: isSindhi ? ["عصري موضوعات", "نئين صنفون"] : ["Contemporary Themes", "New Genres"],
      color_code: "#6B7280",
      icon_name: "scroll-text",
      is_featured: true,
      sort_order: 3
    }
  ];

  const displayPeriods = timelinePeriods.length > 0 ? timelinePeriods : fallbackPeriods;

  const getIcon = (iconName?: string) => {
    const icons = {
      'book-open': BookOpen,
      'feather': Feather,
      'scroll-text': ScrollText,
      'calendar': Calendar
    };
    return icons[iconName as keyof typeof icons] || BookOpen;
  };

  if (loading) {
    return (
      <motion.section 
        id="timeline" 
        className="py-16 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              {isSindhi ? 'تاریخ لوڊ ٿي رهي آهي...' : 'Loading timeline...'}
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      id="timeline" 
      className="py-16 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <h2 className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
            {isSindhi ? 'تاريخي ٽائيم لائين' : 'Historical Timeline'}
          </h2>
          <p className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
            {isSindhi ? 'تاريخي دورن موجب شاعري ڳوليو ۽ سنڌي ادب جي ارتقا کي سمجهو' : 'Explore poetry by historical era and discover the evolution of Sindhi literature'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPeriods.map((period, index) => {
            const IconComponent = getIcon(period.icon_name);
            const yearRange = period.is_ongoing 
              ? `${period.start_year} - ${isSindhi ? 'هاڻوڪو' : 'Present'}`
              : `${period.start_year} - ${period.end_year || 'Present'}`;
            
            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className=""
              >
                <Card className="border border-gray-100 bg-white rounded-[8px] shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-[8px] flex items-center justify-center bg-gray-50"
                      >
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {period.is_featured && (
                          <Star className="w-4 h-4 text-gray-400" />
                        )}
                        <Badge variant="secondary" className={`text-xs px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                          {yearRange}
                        </Badge>
                      </div>
                    </div>
                    
                    <h3 className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[18px] leading-snug text-gray-900 font-normal'} mb-2`}>
                      {period.name}
                    </h3>
                    {period.description && (
                      <p className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-gray-600 text-[14px] leading-6'} mb-4 line-clamp-3`}>
                        {period.description.length > 120 
                          ? `${period.description.substring(0, 120)}...` 
                          : period.description
                        }
                      </p>
                    )}

                    {period.characteristics && period.characteristics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {period.characteristics.slice(0, 2).map((char, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-gray-200 text-gray-600 bg-white">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white"
                      asChild
                    >
                      <a href={`/admin/timeline?period=${period.period_slug}`}>
                        <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                          {isSindhi ? 'دور ڳوليو' : 'Explore era'}
                        </span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View Full Timeline Button */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-sm bg-white" asChild>
            <Link href="/admin/timeline">
              <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                {isSindhi ? 'مکمل تاريخ ڏسو' : 'View Full Timeline'}
              </span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
