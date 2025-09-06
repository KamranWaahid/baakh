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

interface LikeItem {
  record_id: string;
  target_id: string;
  target_type: 'poem' | 'poet' | 'couplet';
  created_at: string;
  metadata_cipher: string;
  metadata_nonce: string;
  metadata_aad: string;
}

interface ContentItem {
  id: string;
  type: 'poem' | 'poet' | 'couplet';
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  likes?: number;
  created_at: string;
}

const getLikesTranslations = (language: 'en' | 'sd') => {
  const translations = {
    en: {
      title: 'My Liked Content',
      subtitle: 'Content you have liked and saved',
      noLikes: 'You haven\'t liked any content yet',
      startExploring: 'Start exploring and like some content',
      exploreButton: 'Explore Content',
      backToProfile: 'Back to Profile',
      loading: 'Loading your likes...',
      error: 'Error loading likes',
      retry: 'Retry',
      couplets: 'Couplets',
      poets: 'Poets',
      poetry: 'Poetry',
      likedOn: 'Liked on',
      noContent: 'No content found',
      filterAll: 'All',
      filterCouplets: 'Couplets',
      filterPoets: 'Poets',
      filterPoetry: 'Poetry'
    },
    sd: {
      title: 'منهنجو پسنديده مواد',
      subtitle: 'اهو مواد جيڪو توهان پسند ڪيو آهي ۽ محفوظ ڪيو آهي',
      noLikes: 'توهان اڃان ڪو به مواد پسند نه ڪيو آهي',
      startExploring: 'مواد ڳولڻ شروع ڪريو ۽ ڪجهه پسند ڪريو',
      exploreButton: 'مواد ڳوليو',
      backToProfile: 'پروفائل ڏانهن واپس',
      loading: 'توهان جا پسند لوڊ ٿي رهيا آهن...',
      error: 'پسند لوڊ ڪرڻ ۾ خطا',
      retry: 'دوبارہ ڪوشش ڪريو',
      couplets: 'شعر',
      poets: 'شاعر',
      poetry: 'شاعري',
      likedOn: 'پسند ڪيو',
      noContent: 'ڪو مواد نه مليو',
      filterAll: 'سڀ',
      filterCouplets: 'شعر',
      filterPoets: 'شاعر',
      filterPoetry: 'شاعري'
    }
  };
  return translations[language];
};

export default function LikesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useE2EEAuth();
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'couplet' | 'poet' | 'poem'>('all');

  const t = getLikesTranslations(language);

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
      // For now, we'll create mock content items
      // In a real implementation, you'd fetch actual content based on the likes
      const mockContent: ContentItem[] = data.likes?.map((like: LikeItem) => ({
        id: like.target_id,
        type: like.target_type,
        title: `${like.target_type.charAt(0).toUpperCase() + like.target_type.slice(1)} ${like.target_id}`,
        subtitle: `Sample ${like.target_type}`,
        content: `This is a sample ${like.target_type} content that the user liked.`,
        likes: Math.floor(Math.random() * 100),
        created_at: like.created_at
      })) || [];
      
      setContent(mockContent);
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch likes');
    } finally {
      setIsLoading(false);
    }
  };

  const getBackLink = () => `/${language}/profile`;

  const getFilteredContent = () => {
    if (filter === 'all') return content;
    return content.filter(item => item.type === filter);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'couplet':
        return <Quote className="w-5 h-5" />;
      case 'poet':
        return <User className="w-5 h-5" />;
      case 'poem':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'couplet':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'poet':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'poem':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={getBackLink()}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToProfile}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 mb-4">{t.error}</p>
              <Button onClick={fetchLikes} variant="outline" className="text-red-700 border-red-300 hover:bg-red-50">
                {t.retry}
              </Button>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.noLikes}</h2>
            <p className="text-gray-600 mb-6">{t.startExploring}</p>
            <Link href={`/${language}`}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                {t.exploreButton}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: 'all', label: t.filterAll },
                  { key: 'couplet', label: t.filterCouplets },
                  { key: 'poet', label: t.filterPoets },
                  { key: 'poem', label: t.filterPoetry }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredContent().map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className={isRTL ? 'auto-sindhi-font' : ''}>
                          {item.type === 'couplet' ? t.couplets : item.type === 'poet' ? t.poets : t.poetry}
                        </span>
                      </div>
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {item.subtitle && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                    
                    {item.content && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {item.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.likes} likes</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                {t.title} - {t.subtitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{content.filter(c => c.type === 'couplet').length}</div>
                  <div className="text-sm text-gray-600">{t.couplets}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{content.filter(c => c.type === 'poet').length}</div>
                  <div className="text-sm text-gray-600">{t.poets}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{content.filter(c => c.type === 'poem').length}</div>
                  <div className="text-sm text-gray-600">{t.poetry}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
