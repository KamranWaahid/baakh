'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Heart, Share2, MessageCircle, BookOpen, Clock, User, Tag, Calendar, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getSmartFontClass, processMixedContent } from '@/lib/sindhi-font-utils';
import { NumberFont, MixedContentWithNumbers } from '@/components/ui/NumberFont';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PoetryData {
  id: string;
  poetry_slug: string;
  poetry_tags?: string;
  lang: string;
  content_style?: string;
  form?: string;
  created_at: string;
  poets?: {
    id: string;
    sindhi_name: string;
    english_name: string;
    sindhi_laqab?: string;
    english_laqab?: string;
    english_tagline?: string;
    sindhi_tagline?: string;
    file_url?: string; // Added for poet image
  };
  categories?: {
    id: string;
    slug: string;
    name: string;
    content_style?: string;
  };
  poetry_translations?: Array<{
    id: string;
    title: string;
    info: string;
    lang: string;
  }>;
  poetry_couplets?: Array<{
    id: string;
    couplet_text: string;
    couplet_slug: string;
    couplet_tags?: string;
    lang: string;
  }>;
}

// Skeleton Loading Components
const PoetrySkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-lg w-32 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Poetry Content Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded-lg w-1/4 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="h-6 bg-gray-200 rounded-lg w-24 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>

        {/* About Poet Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded-lg w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded-lg w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function PoetryPage() {
  const params = useParams();
  const pathname = usePathname();
  let poetId = params.id as string;
  const formSlug = params.form as string;
  const poetrySlug = params.poetry as string;
  
  // Detect current locale
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const currentLang = isSindhi ? 'sd' : 'en';

  // Remove @ symbol if present
  if (poetId.startsWith('@')) {
    poetId = poetId.substring(1);
  }

  // Multi-lingual content
  const multiLangContent = {
    loading: isSindhi ? 'شاعري لوڊ ٿي رهي آهي...' : 'Loading poetry...',
    errorLoading: isSindhi ? 'شاعري لوڊ ڪرڻ ۾ خرابي' : 'Error Loading Poetry',
    tryAgain: isSindhi ? 'ٻيھر ڪوشش ڪريو' : 'Try Again',
    poetryNotFound: isSindhi ? 'شاعري نه ملي' : 'Poetry Not Found',
    poetryNotExist: isSindhi ? 'جيڪا شاعري توهان ڳولي رهيا آهيو اها موجود نه آهي.' : "The poetry you're looking for doesn't exist.",
    poetry: isSindhi ? 'شاعري' : 'Poetry',
    comment: isSindhi ? 'تبصرو' : 'Comment',
    share: isSindhi ? 'شيئر' : 'Share',
    view: isSindhi ? 'ڏٺل' : 'View',
    linkCopied: isSindhi ? '✓ ڳنڍڻو ڪاپي ٿي ويو!' : '✓ Link copied!',
    tags: isSindhi ? 'ٽڪليون' : 'Tags',
    about: isSindhi ? 'اسان بابت' : 'About',
    talentedPoet: isSindhi ? 'هڪ قابل شاعر' : 'A talented poet',
    knownFor: isSindhi ? 'جيڪو ان جي ڪم لاءِ مشهور آهي' : 'known for their work in',
    variousForms: isSindhi ? 'مختلف صنفون' : 'various forms',
    contributingHeritage: isSindhi ? 'سنڌي شاعري جي امير ورثي ۾ حصو وٺي رهيو آهي.' : 'contributing to the rich heritage of Sindhi poetry.',
    sindhiPoetryArchive: isSindhi ? 'سنڌي شاعري جو آرڪائيو' : 'Sindhi Poetry Archive',
    min: isSindhi ? 'منٽ' : 'min',
    otherPoetry: isSindhi ? 'ٻي شاعري' : 'Other Poetry',
    nextPoetry: isSindhi ? 'اڳيان واري شاعري' : 'Next Poetry',
    previousPoetry: isSindhi ? 'پوئين شاعري' : 'Previous Poetry',
    noMorePoetry: isSindhi ? 'وڌيڪ شاعري نه آهي' : 'No more poetry available',
    exploreMore: isSindhi ? 'وڌيڪ ڳوليو' : 'Explore More'
  };

  const [poetry, setPoetry] = useState<PoetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  const [otherPoetry, setOtherPoetry] = useState<PoetryData[]>([]);
  const [loadingOtherPoetry, setLoadingOtherPoetry] = useState(false);

  // Fetch poetry data from database
  const fetchPoetry = async () => {
    if (!poetrySlug || !poetId || !formSlug) {
      console.log('Missing parameters:', { poetrySlug, poetId, formSlug });
      return;
    }
    
    try {
      setLoading(true);
      const apiUrl = `/api/poetry/detail?poetrySlug=${poetrySlug}&poetSlug=${poetId}&categorySlug=${formSlug}&lang=${currentLang}`;
      console.log('Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch poetry: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      setPoetry(data.poetry);
    } catch (error) {
      console.error('Error fetching poetry:', error);
      setError('Failed to load poetry');
    } finally {
      setLoading(false);
    }
  };

  // Fetch other poetry for pagination
  const fetchOtherPoetry = async () => {
    if (!poetId || !formSlug) return;
    
    try {
      setLoadingOtherPoetry(true);
      const response = await fetch(`/api/poets/${poetId}?lang=${currentLang}`);
      if (!response.ok) throw new Error('Failed to fetch other poetry');
      
      const data = await response.json();
      
      // Get all poetry from the same form first, then other forms
      const currentFormPoetry = data.categories.find((cat: any) => cat.slug === formSlug)?.poetry || [];
      const otherFormsPoetry = data.categories
        .filter((cat: any) => cat.slug !== formSlug)
        .flatMap((cat: any) => cat.poetry || []);
      
      // Combine and filter out current poetry
      const allOtherPoetry = [...currentFormPoetry, ...otherFormsPoetry]
        .filter((poem: any) => poem.poetry_slug !== poetrySlug)
        .slice(0, 6); // Limit to 6 items for pagination
      
      setOtherPoetry(allOtherPoetry);
    } catch (error) {
      console.error('Error fetching other poetry:', error);
    } finally {
      setLoadingOtherPoetry(false);
    }
  };

  useEffect(() => {
    fetchPoetry();
    fetchOtherPoetry();
  }, [poetrySlug, poetId, formSlug, currentLang]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareFeedback(true);
    setTimeout(() => setShowShareFeedback(false), 2000);
  };

  const handleView = () => {
    // Handle view functionality - could scroll to top or show view stats
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate reading time based on content length
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Get title in specified language
  const getTitle = () => {
    if (poetry?.poetry_translations && poetry.poetry_translations.length > 0) {
      // First try to find translation in current language
      const currentLangTranslation = poetry.poetry_translations.find(t => t.lang === currentLang);
      if (currentLangTranslation?.title && currentLangTranslation.title.trim() !== '') {
        return currentLangTranslation.title;
      }
      
      // Fallback to any available translation
      const anyTranslation = poetry.poetry_translations.find(t => t.title && t.title.trim() !== '');
      if (anyTranslation?.title) {
        return anyTranslation.title;
      }
    }
    if (poetry?.poetry_slug && poetry.poetry_slug.trim() !== '') {
      return poetry.poetry_slug;
    }
    return null; // Return null instead of default text
  };

  // Get description in specified language
  const getDescription = () => {
    if (poetry?.poetry_translations && poetry.poetry_translations.length > 0) {
      // First try to find translation in current language
      const currentLangTranslation = poetry.poetry_translations.find(t => t.lang === currentLang);
      if (currentLangTranslation?.info && currentLangTranslation.info.trim() !== '') {
        return currentLangTranslation.info;
      }
      
      // Fallback to any available translation
      const anyTranslation = poetry.poetry_translations.find(t => t.info && t.info.trim() !== '');
      if (anyTranslation?.info) {
        return anyTranslation.info;
      }
    }
    return null; // Return null instead of default text
  };

  // Get poetry content in specified language
  const getContent = () => {
    if (poetry?.poetry_couplets && poetry.poetry_couplets.length > 0) {
      // Filter couplets by current language
      const currentLangCouplets = poetry.poetry_couplets.filter(c => c.lang === currentLang);
      const otherCouplets = poetry.poetry_couplets.filter(c => c.lang !== currentLang);
      
      // Use current language couplets if available, otherwise use any available
      const coupletsToUse = currentLangCouplets.length > 0 ? currentLangCouplets : otherCouplets;
      
      if (coupletsToUse.length > 0) {
        return coupletsToUse
          .map(couplet => couplet.couplet_text)
          .join('\n\n');
      }
    }
    return isSindhi ? 'شاعري جو مواد هتي ڏيکاريو ويندو جڏهن بيت دستياب هوندا.' : 'Poetry content will be displayed here once couplets are available.';
  };

  // Get tags from poetry_tags field
  const getTags = () => {
    if (poetry?.poetry_tags) {
      return poetry.poetry_tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  // Get poet name in specified language (prefer laqab)
  const getPrimaryPoetTitle = () => {
    if (!poetry?.poets) return null;
    if (isSindhi) {
      return poetry.poets.sindhi_laqab?.trim() || poetry.poets.sindhi_name?.trim() || null;
    }
    return poetry.poets.english_laqab?.trim() || poetry.poets.english_name?.trim() || null;
  };

  // Get secondary subtitle if different from primary (show remaining name)
  const getSecondaryPoetSubtitle = () => {
    if (!poetry?.poets) return null;
    const primary = getPrimaryPoetTitle();
    if (isSindhi) {
      const candidate = poetry.poets.sindhi_name?.trim() || '';
      return candidate && candidate !== primary ? candidate : null;
    }
    const candidate = poetry.poets.english_name?.trim() || '';
    return candidate && candidate !== primary ? candidate : null;
  };

  const getPoetTagline = () => {
    if (!poetry?.poets) return null;
    if (isSindhi) return poetry.poets.sindhi_tagline?.trim() || null;
    return poetry.poets.english_tagline?.trim() || null;
  };

  // Get text alignment style based on category or poetry content_style
  const getTextAlignment = () => {
    // Priority: poetry content_style > category content_style > default
    const alignment = poetry?.content_style || poetry?.categories?.content_style || 'justified';
    
    // Debug logging
    console.log('Content alignment debug:', {
      poetryContentStyle: poetry?.content_style,
      categoryContentStyle: poetry?.categories?.content_style,
      finalAlignment: alignment
    });
    
    switch (alignment) {
      case 'centered':
        return 'text-center';
      case 'left-aligned':
        return 'text-left';
      case 'right-aligned':
        return 'text-right';
      case 'justified':
      default:
        return 'text-justify';
    }
  };

  // Get additional alignment classes for specific styles
  const getAlignmentClasses = () => {
    const alignment = poetry?.content_style || poetry?.categories?.content_style || 'justified';
    
    // Debug logging
    console.log('Alignment classes debug:', {
      alignment,
      poetryContentStyle: poetry?.content_style,
      categoryContentStyle: poetry?.categories?.content_style
    });
    
    switch (alignment) {
      case 'centered':
        return 'text-center mx-auto max-w-2xl';
      case 'left-aligned':
        return 'text-left';
      case 'right-aligned':
        return 'text-right';
      case 'justified':
      default:
        return 'text-justify';
    }
  };

  // Loading state
  if (loading) {
    return <PoetrySkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h1 className={`text-3xl font-bold text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {multiLangContent.errorLoading}
          </h1>
          <p className={`text-gray-600 mb-8 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>{error}</p>
          <button 
            onClick={() => fetchPoetry()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {multiLangContent.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // No poetry data
  if (!poetry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-gray-500 text-6xl mb-6">📝</div>
          <h1 className={`text-3xl font-bold text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {multiLangContent.poetryNotFound}
          </h1>
          <p className={`text-gray-600 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {multiLangContent.poetryNotExist}
          </p>
        </div>
      </div>
    );
  }

  const title = getTitle();
  const description = getDescription();
  const poetryContent = getContent();
  const tags = getTags();
  const readingTime = calculateReadingTime(poetryContent);

  return (
    <motion.div 
      className="min-h-screen bg-white" 
      dir={isRTL ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main Content - Optimized for poetry reading */}
      <main>
        <motion.div 
          className="max-w-[640px] mx-auto px-8 py-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Hero Section */}
          <motion.div 
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Title - Refined, modern typography */}
            {title && (
              <h1 className={`${isSindhi ? 'text-6xl md:text-7xl font-extrabold leading-[1.1]' : 'text-3xl md:text-4xl font-light leading-[1.2]'} text-gray-900 mb-6 tracking-normal ${getSmartFontClass(title, { baseClass: 'sindhi-heading-1', isHeading: true })}`}>
                {title}
              </h1>
            )}

            {/* Description - Only if meaningful content exists */}
            {description && description.trim() !== '' && (
              <p className={`text-base text-gray-600 mb-10 leading-[1.6] max-w-xl font-light ${getSmartFontClass(description, { baseClass: 'sindhi-text-base' })}`}>
                {description}
              </p>
            )}

            {/* Fallback when no title or description */}
            {!title && !description && (
              <div className="mb-10 text-center py-8">
                <div className="text-gray-400 mb-3">
                  <BookOpen className="h-12 w-12 mx-auto" />
                </div>
                <h3 className={`text-lg font-medium text-gray-600 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'شاعري جو عنوان ۽ تفصيل دستياب ناهي' : 'Poetry title and description not available'}
                </h3>
                <p className={`text-sm text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'هن شاعري لاءِ عنوان يا تفصيل اڃا شامل نه ڪيو ويو آهي' : 'Title or description for this poetry has not been added yet'}
                </p>
              </div>
            )}

            {/* Byline + Metadata - Clean and minimal */}
            {poetry.poets && poetry.created_at && (
              <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100">
                <div className={`flex items-center gap-2 md:gap-3`}>
                  <motion.div 
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {poetry.poets?.file_url ? (
                      <img 
                        src={poetry.poets.file_url} 
                        alt={getPrimaryPoetTitle() || 'Poet'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-medium text-sm ${poetry.poets?.file_url ? 'hidden' : ''}`}>
                      {poetry.poets?.english_name 
                        ? poetry.poets.english_name.split(' ').map(n => n[0]).join('')
                        : 'P'
                      }
                    </div>
                  </motion.div>
                  <div>
                    {getPrimaryPoetTitle() && (
                      <h3 className={`text-sm font-semibold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {getPrimaryPoetTitle()}
                      </h3>
                    )}
                    {getSecondaryPoetSubtitle() && (
                      <p className={`text-xs text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {getSecondaryPoetSubtitle()}
                      </p>
                    )}
                    {getPoetTagline() && (
                      <p className={`text-xs text-gray-500 mt-0.5 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {getPoetTagline()}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Reading time and date - Subtle */}
                <div className="text-right text-xs text-gray-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3 w-3" />
                    <MixedContentWithNumbers 
                      text={`${readingTime} ${multiLangContent.min}`}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span className={`${getSmartFontClass(new Date(poetry.created_at).toLocaleDateString(currentLang === 'sd' ? 'sd' : 'en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }), { baseClass: 'sindhi-text-sm' })}`}>
                      {new Date(poetry.created_at).toLocaleDateString(currentLang === 'sd' ? 'sd' : 'en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Poetry Content - Refined typography */}
          {poetryContent && poetryContent.trim() !== '' && !poetryContent.includes('will be displayed here') && !poetryContent.includes('هتي ڏيکاريو ويندو') ? (
            <motion.article 
              className="mb-20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={`text-lg leading-[1.75] text-gray-800 font-serif ${getAlignmentClasses()} ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {/* Preserve line breaks and stanza spacing */}
                {poetryContent.split('\n\n').map((stanza, index) => (
                  <motion.div 
                    key={index} 
                    className="mb-10 last:mb-0"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  >
                    {stanza.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex} className="mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.article>
          ) : (
            <div className="mb-20 text-center py-16">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-16 w-16 mx-auto" />
              </div>
              <h3 className={`text-lg font-medium text-gray-600 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'شاعري جو مواد دستياب ناهي' : 'Poetry content not available'}
              </h3>
              <p className={`text-sm text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'هن شاعري لاءِ بيت يا مواد اڃا شامل نه ڪيو ويو آهي' : 'Couplets or content for this poetry have not been added yet'}
              </p>
            </div>
          )}

          {/* Interaction Bar - Ultra minimal */}
          {poetryContent && poetryContent.trim() !== '' && !poetryContent.includes('will be displayed here') && !poetryContent.includes('هتي ڏيکاريو ويندو') && (
            <motion.div 
              className="flex items-center justify-center space-x-6 py-10 border-y border-gray-100 mb-20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  liked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span className={`text-sm font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>{likes}</span>
              </motion.button>
              
              <motion.button
                onClick={handleView}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="h-4 w-4" />
                <span className={`text-sm font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {multiLangContent.view}
                </span>
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="h-4 w-4" />
                <span className={`text-sm font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {multiLangContent.share}
                </span>
              </motion.button>
              
              <AnimatePresence>
                {showShareFeedback && (
                  <motion.span 
                    className={`text-sm text-green-600 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {multiLangContent.linkCopied}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tags - Minimal and clean */}
          {tags.length > 0 && (
            <motion.div 
              className="mb-16"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="h-4 w-4 text-gray-400" />
                <h3 className={`text-sm font-medium text-gray-700 uppercase tracking-wide ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {multiLangContent.tags}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className={`px-3 py-2 bg-gray-50 text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors border border-gray-200 ${isSindhi ? 'auto-sindhi-font' : ''}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Poet Bio - Clean and focused */}
          {poetry.poets && (
            <motion.div 
              className="mb-16 p-6 bg-slate-50 rounded-xl border border-slate-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className={`flex items-start gap-3 md:gap-4`}>
                <motion.div 
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {poetry.poets?.file_url ? (
                    <img 
                      src={poetry.poets.file_url} 
                      alt={getPrimaryPoetTitle() || 'Poet'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-medium text-sm ${poetry.poets?.file_url ? 'hidden' : ''}`}>
                    {poetry.poets.english_name 
                      ? poetry.poets.english_name.split(' ').map(n => n[0]).join('')
                      : 'P'
                    }
                  </div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-medium text-gray-900 mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {multiLangContent.about} {getPrimaryPoetTitle()}
                  </h3>
                  <p className={`text-sm text-gray-600 leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {poetry.poets.english_laqab || poetry.poets.sindhi_laqab 
                      ? `${multiLangContent.talentedPoet} ${multiLangContent.knownFor} ${poetry.categories?.name || multiLangContent.variousForms}.`
                      : `${multiLangContent.talentedPoet} ${multiLangContent.contributingHeritage}`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer - Ultra minimal */}
          <motion.footer 
            className="text-center text-xs text-gray-400 border-t border-gray-100 pt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2">
              <BookOpen className="h-3 w-3" />
              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                {multiLangContent.sindhiPoetryArchive}
              </span>
            </div>
          </motion.footer>
        </motion.div>
      </main>

      {/* Mobile Action Bar - Minimal and unobtrusive */}
      {poetryContent && poetryContent.trim() !== '' && !poetryContent.includes('will be displayed here') && !poetryContent.includes('هتي ڏيکاريو ويندو') && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="flex items-center justify-around">
            <motion.button
              onClick={handleLike}
              className={`flex flex-col items-center space-y-1 ${
                liked ? 'text-red-600' : 'text-gray-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
              <span className={`text-xs font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>{likes}</span>
            </motion.button>
            <motion.button
              onClick={handleView}
              className="flex flex-col items-center space-y-1 text-gray-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="h-6 w-6" />
              <span className={`text-xs font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {multiLangContent.view}
              </span>
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="flex flex-col items-center space-y-1 text-gray-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-6 w-6" />
              <span className={`text-xs font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {multiLangContent.share}
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Other Poetry Section - Matching Main Page Design */}
      {otherPoetry.length > 0 && (
        <motion.section 
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
                {multiLangContent.otherPoetry}
              </h2>
              <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
                {isSindhi 
                  ? 'هن شاعر جي ٻي شاعري ڏسو' 
                  : 'Explore more poetry from this poet'
                }
              </p>
            </motion.div>
            
            {loadingOtherPoetry ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                      <CardContent className="p-8">
                        <div className="flex justify-end mb-6">
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-4 mb-8">
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {otherPoetry.map((poem, index) => (
                  <motion.div
                    key={`poem-${poem.id || `unknown-${index}`}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="transition-all duration-200"
                  >
                    <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
                      <CardContent className="p-8">
                        {/* Poetry Content */}
                        <div className="space-y-2 mb-6">
                          <div className="text-center space-y-1">
                            <h3 className={`text-lg font-medium text-black leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? poem.poetry_translations?.find(t => t.lang === 'sd')?.title : poem.poetry_translations?.find(t => t.lang === 'en')?.title || 'Untitled'}
                            </h3>
                            {poem.poetry_translations?.[0]?.info && (
                              <p className={`text-sm text-gray-600 leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {poem.poetry_translations[0].info}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Poet Info */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 bg-background border border-border/20 shadow-sm">
                              <AvatarImage src={poetry.poets?.file_url || undefined} alt={getPrimaryPoetTitle() || 'Poet'} />
                              <AvatarFallback className={cn(
                                "text-sm font-medium text-foreground",
                                isSindhi ? 'auto-sindhi-font' : ''
                              )}>
                                {getPrimaryPoetTitle()?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`text-sm text-gray-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {getPrimaryPoetTitle()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <MixedContentWithNumbers 
                              text={`${Math.ceil((poem.poetry_couplets?.length || 0) * 0.5)} ${multiLangContent.min}`}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <Share2 className="h-4 w-4 text-gray-600 hover:text-green-500" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="h-4 w-4" />
                            <NumberFont size="xs">{Math.floor(Math.random() * 100) + 50}</NumberFont>
                          </div>
                        </div>

                        {/* Read Button */}
                        <div className="pt-4">
                          <Link 
                            href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}/form/${poem.categories?.slug || formSlug}/${poem.poetry_slug}`}
                            className="block w-full text-center py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm"
                          >
                            {isSindhi ? 'پڙهو' : 'Read'} →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Explore More Button */}
            <div className="text-center mt-16">
              <Link 
                href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors font-medium"
              >
                {multiLangContent.exploreMore}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
