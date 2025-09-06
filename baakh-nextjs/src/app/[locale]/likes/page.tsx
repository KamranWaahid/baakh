'use client';

import React from 'react';
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, BookOpen, User, Quote, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LikesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useE2EEAuth();
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState([]);
  const [content, setContent] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${language}/login`);
      return;
    }

    if (isAuthenticated && user?.userId) {
      fetchLikes();
    }
  }, [authLoading, isAuthenticated, user, language, router]);

  const fetchLikes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/likes?userId=${user?.userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch likes');
      }
      
      setLikes(data.likes || []);
      setContent(data.likes || []);
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch likes');
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => `/${language}/profile`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={getBackLink()}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">My Liked Content</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Loading your likes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={fetchLikes} variant="outline" className="text-red-700 border-red-300 hover:bg-red-50">
                Retry
              </Button>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">You haven't liked any content yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and like some content</p>
            <Link href={`/${language}`}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Explore Content
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Heart className="w-4 h-4" />
                      <span>Liked Item</span>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Liked Content {index + 1}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    This is content that you have liked.
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>1 like</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
