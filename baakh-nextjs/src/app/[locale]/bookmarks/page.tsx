'use client';

import React from 'react';
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new';
import { motion } from 'framer-motion';
import { Bookmark, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import CoupletCard from '@/components/CoupletCard';

export default function BookmarksPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useE2EEAuth();
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [content, setContent] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${language}/login`);
      return;
    }

    if (isAuthenticated && user?.userId) {
      fetchBookmarks();
    }
  }, [authLoading, isAuthenticated, user, language, router]);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/bookmarks?userId=${user?.userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookmarks');
      }
      
      setBookmarks(data.bookmarks || []);
      setContent(data.bookmarks || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => `/${language}/dashboard`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={getBackLink()}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'sd' ? 'ڊش بورڊ تي واپس' : 'Back to Dashboard'}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {language === 'sd' ? 'مون جا بڪ مارڪ' : 'My Bookmarks'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">
              {language === 'sd' ? 'توهان جا بڪ مارڪ لوڊ ٿي رهيا آهن...' : 'Loading your bookmarks...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={fetchBookmarks} variant="outline" className="text-red-700 border-red-300 hover:bg-red-50">
                {language === 'sd' ? 'ٻيهر ڪوشش ڪريو' : 'Retry'}
              </Button>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {language === 'sd' ? 'توهان اڃان ڪا به شعر بڪ مارڪ نه ڪيا آهن' : "You haven't bookmarked any couplets yet"}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'sd' 
                ? 'شروع ڪريو ۽ ڪجهه شعر بڪ مارڪ ڪريو'
                : 'Start exploring and bookmark some couplets'
              }
            </p>
            <Link href={`/${language}`}>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                {language === 'sd' ? 'شعر ڳوليو' : 'Explore Couplets'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {language === 'sd' ? 'توهان جا بڪ مارڪ شعر' : 'Your Bookmarked Couplets'}
              </h2>
              <p className="text-gray-600">
                {language === 'sd' 
                  ? `${content.length} شعر بڪ مارڪ ڪيا ويا`
                  : `${content.length} couplets bookmarked`
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((couplet, index) => (
                <motion.div
                  key={`bookmarked-couplet-${couplet.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CoupletCard
                    couplet={couplet}
                    isSindhi={language === 'sd'}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}