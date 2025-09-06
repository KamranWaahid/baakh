"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FeaturedPoetsProps {
  isSindhi: boolean;
}

export default function FeaturedPoets({ isSindhi }: FeaturedPoetsProps) {
  const pathname = usePathname();
  const [featuredPoets, setFeaturedPoets] = useState<Array<{
    id: string;
    poet_slug: string;
    english_name: string;
    sindhi_name?: string | null;
    english_tagline?: string | null;
    sindhi_tagline?: string | null;
    file_url?: string | null;
    is_featured?: boolean;
  }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeaturedPoets() {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '3',
          sortBy: 'is_featured',
          sortOrder: 'desc'
        });
        const timeoutSignal = AbortSignal.timeout(10000);
        const combinedSignal = (AbortSignal as any).any ? (AbortSignal as any).any([controller.signal, timeoutSignal]) : timeoutSignal;
        const res = await fetch(`/api/poets?${params.toString()}`, { signal: combinedSignal, cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.poets) {
          const featuredOnly = (json.poets as typeof featuredPoets).filter((p) => p.is_featured);
          const topThree = (featuredOnly.length > 0 ? featuredOnly : json.poets).slice(0, 3);
          setFeaturedPoets(topThree as typeof featuredPoets);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError' || /timed out|signal timed out/i.test(String(e?.message))) {
          console.warn('Featured poets request timed out');
        } else {
          console.error('Error loading featured poets:', e);
        }
      }
    }
    loadFeaturedPoets();
    return () => controller.abort();
  }, []);

  return (
    <motion.section 
      id="poets" 
      className="py-20 px-4 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
            {isSindhi ? 'شاعرن جي فھرست' : 'Featured Poets'}
          </h2>
          <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
            {isSindhi ? 'سنڌي ادب جا عظيم شاعر' : 'Discover legendary figures of Sindhi literature'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPoets.map((poet, index) => {
            const displayName = isSindhi ? (poet.sindhi_name || poet.english_name) : poet.english_name;
            const displayTagline = isSindhi ? (poet.sindhi_tagline || poet.english_tagline) : poet.english_tagline;
            const initials = poet.english_name.split(' ').map(n => n[0]).join('');
            return (
              <motion.div
                key={poet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="transition-all duration-200"
              >
                <Card className="border border-gray-200 bg-white rounded-xl text-center">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-serif text-gray-700">{initials}</span>
                    </div>
                    
                    <h3 className={`text-lg font-serif text-black mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {displayName}
                    </h3>
                    
                    {displayTagline && (
                      <Badge variant="secondary" className="mb-6 text-xs px-3 py-1 bg-gray-100 text-gray-700 border-0 rounded-full font-medium">
                        {displayTagline}
                      </Badge>
                    )}
                    
                    <Button asChild variant="outline" size="sm" className="w-full h-10 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium bg-white">
                      <Link href={isSindhi ? `/sd/poets/${poet.poet_slug}` : `/en/poets/${poet.poet_slug}`} className="w-full">
                        <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                          {isSindhi ? 'پروفائل ڏسو' : 'View Profile'}
                        </span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="h-12 px-8 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium bg-white">
            <Link href={isSindhi ? "/sd/poets" : "/en/poets"}>
              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                {isSindhi ? 'سڀ شاعر ڏسو' : 'View all poets'}
              </span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
