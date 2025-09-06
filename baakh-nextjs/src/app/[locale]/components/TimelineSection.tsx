"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Feather, ScrollText } from 'lucide-react';

interface TimelineSectionProps {
  isSindhi: boolean;
}

export default function TimelineSection({ isSindhi }: TimelineSectionProps) {
  // Multi-lingual mock data for timeline
  const timelinePeriods = [
    {
      id: 1,
      period: {
        en: "Classical (1600–1800)",
        sd: "ڪلاسيڪل (1600–1800)"
      },
      description: {
        en: "The golden age of Sindhi poetry with mystical and spiritual themes",
        sd: "سنڌي شاعري جو سنھري دور جيڪو روحاني ۽ عرفاني موضوعن سان ڀرپور آهي"
      },
      count: 200,
      priority: "high",
      icon: BookOpen
    },
    {
      id: 2,
      period: {
        en: "Modern (1800–2000)",
        sd: "جديد (1800–2000)"
      },
      description: {
        en: "Evolution of Sindhi poetry with social and philosophical themes",
        sd: "سنڌي شاعري جو ارتقا سماجي ۽ فلسفي موضوعن سان"
      },
      count: 180,
      priority: "medium",
      icon: Feather
    },
    {
      id: 3,
      period: {
        en: "Contemporary",
        sd: "عصري"
      },
      description: {
        en: "Modern Sindhi poetry reflecting current times and issues",
        sd: "جديد سنڌي شاعري جيڪا موجوده وقت ۽ مسئلن کي عڪس ڪري ٿي"
      },
      count: 120,
      priority: "low",
      icon: ScrollText
    }
  ];

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
          {timelinePeriods.map((period, index) => {
            const displayPeriod = isSindhi ? period.period.sd : period.period.en;
            const displayDescription = isSindhi ? period.description.sd : period.description.en;
            
            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="transition-all duration-200"
              >
                <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-[12px] flex items-center justify-center">
                        <period.icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <Badge variant="secondary" className={`text-xs px-3 py-1 bg-gray-100 text-gray-700 border-0 rounded-full font-normal ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        {period.count} {isSindhi ? 'ڪم' : 'works'}
                      </Badge>
                    </div>
                    
                    <h3 className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[18px] leading-snug text-gray-900 font-normal'} mb-2`}>
                      {displayPeriod}
                    </h3>
                    <p className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-gray-600 text-[14px] leading-6'} mb-5`}>
                      {displayDescription}
                    </p>
                    
                    <Button variant="ghost" size="sm" className="h-9 px-4 text-sm font-normal text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full border border-gray-200">
                      <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                        {isSindhi ? 'دور ڳوليو' : 'Explore era'}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
