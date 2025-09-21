"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SmartPagination from '@/components/ui/SmartPagination';

interface CategoriesSectionProps {
  isSindhi: boolean;
  categories?: Array<{
    id: string;
    slug: string;
    englishName: string;
    sindhiName?: string | null;
    englishPlural?: string | null;
    sindhiPlural?: string | null;
    englishDetails: string;
    sindhiDetails: string;
    languages: string[];
    contentStyle: string;
    summary?: string;
    count?: number;
  }>;
}

export default function CategoriesSection({ isSindhi, categories: categoriesProp }: CategoriesSectionProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Array<{
    id: string;
    slug: string;
    englishName: string;
    sindhiName?: string | null;
    englishPlural?: string | null;
    sindhiPlural?: string | null;
    englishDetails: string;
    sindhiDetails: string;
    languages: string[];
    contentStyle: string;
    summary?: string;
    count?: number;
  }>>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(4);

  // Handle responsive perPage
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPerPage(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setPerPage(2); // Tablet: 2 cards
      } else {
        setPerPage(4); // Desktop: 4 cards
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all categories; if a small prop list is provided, still fetch full list
  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      try {
        const timeoutSignal = AbortSignal.timeout(10000);
        const combinedSignal = (AbortSignal as unknown as { any?: (signals: AbortSignal[]) => AbortSignal }).any ? (AbortSignal as unknown as { any: (signals: AbortSignal[]) => AbortSignal }).any([controller.signal, timeoutSignal]) : timeoutSignal;
        const res = await fetch(`/api/categories?limit=1000`, { signal: combinedSignal, cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.items) {
          setCategories(json.items);
          return;
        }
      } catch (e: unknown) {
        const error = e as Error;
        if (error?.name === 'AbortError' || /timed out|signal timed out/i.test(String(error?.message))) {
          console.warn('Homepage categories request timed out');
        } else {
          console.error('Error loading categories:', e);
        }
      }
      // Fallback to provided categories if fetch failed
      if (categoriesProp && categoriesProp.length > 0) setCategories(categoriesProp);
    }
    loadCategories();
    return () => controller.abort();
  }, [categoriesProp]);

  return (
    <motion.section 
      id="categories" 
      className="py-20 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
            {isSindhi ? 'شاعري جا موضوع' : 'Poetry Categories'}
          </h2>
          <p className={`${isSindhi ? 'auto-sindhi-font card-text' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
            {isSindhi ? 'شاعري جي مختلف صنفن ۽ موضوعن کي ڳوليو' : 'Explore different genres and themes of poetry'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories
            .slice((page - 1) * perPage, page * perPage)
            .map((category, index) => {
            const displayName = isSindhi ? (category.sindhiName || category.englishName) : category.englishName;
            const displayPlural = isSindhi ? (category.sindhiPlural || category.englishPlural) : category.englishPlural;
            const displayDetails = isSindhi ? (category.sindhiDetails || category.englishDetails) : category.englishDetails;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="transition-all duration-200"
              >
                <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-gray-100">
                        <BookOpen className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-medium text-gray-900 mb-1 ${isSindhi ? 'auto-sindhi-font card-text' : ''}`}>
                          {displayName}
                        </h3>
                        {displayPlural && (
                          <p className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                            {displayPlural}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-gray-600 text-[13px] mb-4 line-clamp-2 ${isSindhi ? 'auto-sindhi-font card-text' : ''}`}>
                      {displayDetails}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
                        <span className="font-mono">{category.count || 0}</span>
                        {isSindhi ? ' ڪم' : ' works'}
                      </span>
                      <Button asChild variant="ghost" size="sm" className="h-8 px-4 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-full border border-gray-300">
                        <Link href={isSindhi ? `/sd/categories/${category.slug}` : `/en/categories/${category.slug}`}>
                          <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                            {isSindhi ? 'ڳوليو' : 'Explore'}
                          </span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {categories.length > perPage && (
          <div className="mt-12">
            <SmartPagination
              currentPage={page}
              totalPages={Math.ceil(categories.length / perPage)}
              onPageChange={setPage}
              isRTL={isSindhi}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
}
