'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, Share2, MessageCircle, BookOpen, Clock, User, Tag, Calendar, ChevronRight, Eye, Flag, MoreHorizontal, AlertTriangle, Shield, MessageSquare, X } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { ReportCategory, ReportReason } from '@/types/reports';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getSmartFontClass } from '@/lib/sindhi-font-utils';
import { NumberFont, MixedContentWithNumbers } from '@/components/ui/NumberFont';
import { Card, CardContent } from '@/components/ui/card';
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
    birth_date?: string;
    death_date?: string;
    birth_place?: string;
    death_place?: string;
    sindhi_details?: string;
    english_details?: string;
    tags?: string[];
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

// API Response interfaces
interface CategoryPoetry {
  id: string;
  poetry_slug: string;
  poetry_tags?: string;
  lang: string;
  content_style?: string;
  form?: string;
  created_at: string;
}

interface CategoryData {
  slug: string;
  poetry: CategoryPoetry[];
}

interface ApiResponse {
  success: boolean;
  categories: CategoryData[];
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

  // Page-specific styles for sindhi-text spans in poetry content only
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Poetry page specific - Enhanced sindhi-text spans in poetry content only */
      [lang="sd"] .poetry-content span.sindhi-text,
      [dir="rtl"] .poetry-content span.sindhi-text {
        font-size: clamp(0.875rem, 2vw, 1.125rem) !important;
        line-height: 1.7 !important;
      }
      
      /* Ensure numbers never get Sindhi font on this page */
      [lang="sd"] .number,
      [dir="rtl"] .number,
      [lang="sd"] [data-number="true"],
      [dir="rtl"] [data-number="true"],
      [lang="sd"] .number-font,
      [dir="rtl"] .number-font {
        font-family: var(--font-inter) !important;
        font-weight: 500 !important;
      }
      
      /* Slightly increase time indicators like "منٽ" */
      [lang="sd"] span.sindhi-text:not(.poetry-content span),
      [dir="rtl"] span.sindhi-text:not(.poetry-content span) {
        font-size: 1.125rem !important;
      }
      
      @media (max-width: 640px) {
        [lang="sd"] .poetry-content span.sindhi-text,
        [dir="rtl"] .poetry-content span.sindhi-text {
          font-size: clamp(0.75rem, 2.5vw, 1rem) !important;
        }
        
        [lang="sd"] span.sindhi-text:not(.poetry-content span),
        [dir="rtl"] span.sindhi-text:not(.poetry-content span) {
          font-size: 1rem !important;
        }
      }
      
      @media (min-width: 1024px) {
        [lang="sd"] .poetry-content span.sindhi-text,
        [dir="rtl"] .poetry-content span.sindhi-text {
          font-size: clamp(1rem, 1.5vw, 1.375rem) !important;
        }
        
        [lang="sd"] span.sindhi-text:not(.poetry-content span),
        [dir="rtl"] span.sindhi-text:not(.poetry-content span) {
          font-size: 1.25rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
    about: isSindhi ? 'بابت' : 'About',
    talentedPoet: isSindhi ? 'هڪ قابل شاعر' : 'A talented poet',
    knownFor: isSindhi ? 'جيڪو ان جي ڪم لاءِ مشهور آهي' : 'known for their work in',
    variousForms: isSindhi ? 'مختلف صنفون' : 'various forms',
    contributingHeritage: isSindhi ? 'سنڌي شاعري جي امير ورثي ۾ حصو وٺي رهيو آهي.' : 'contributing to the rich heritage of Sindhi poetry.',
    min: isSindhi ? 'منٽ' : 'min',
    otherPoetry: isSindhi ? 'ٻي شاعري' : 'Other Poetry',
    nextPoetry: isSindhi ? 'اڳيان واري شاعري' : 'Next Poetry',
    previousPoetry: isSindhi ? 'پوئين شاعري' : 'Previous Poetry',
    noMorePoetry: isSindhi ? 'وڌيڪ شاعري نه آهي' : 'No more poetry available',
    exploreMore: isSindhi ? 'وڌيڪ ڳوليو' : 'Explore More',
    report: isSindhi ? 'رپورٽ' : 'Report',
    reportPoetry: isSindhi ? 'شاعري رپورٽ ڪريو' : 'Report Poetry',
    reportCategories: {
      common: isSindhi ? 'عام رپورٽ جا اختيار' : 'Common Reporting Options',
      additional: isSindhi ? 'اضافي اختيار' : 'Additional Options'
    },
    reportReasons: {
      contentError: isSindhi ? 'مواد ۾ غلطي – حقيقتي/گرامر غلطيون، ٽٽل فارميٽ، يا غلط نسبت' : 'Content Error – factual/grammatical issues, broken formatting, or wrong attribution',
      offensive: isSindhi ? 'نازيبا / نامناسب مواد – نفرت ڀريو خطاب، غير اخلاقي مواد، يا هراساڻي' : 'Offensive / Inappropriate Content – hate speech, explicit content, harassment, etc.',
      copyright: isSindhi ? 'ڪاپي رائيٽ / چوري ٿيل مواد – جيڪڏهن نظم چوري ٿيل يا غلط طريقي سان منسوب ٿيل هجي' : 'Copyright / Plagiarism – if the poem is stolen or improperly credited',
      spam: isSindhi ? 'اسپام / غير لاڳاپيل مواد – اشتهار، غير لاڳاپيل متن، يا بيڪار ورجايل مواد' : 'Spam / Irrelevant Content – advertisements, unrelated text, or repeated junk',
      misinformation: isSindhi ? 'غلط ڄاڻ – ڪوڙو دعويٰ جيڪو حقيقت طور پيش ڪيو ويو هجي' : 'Misinformation – false claims presented as facts',
      lowQuality: isSindhi ? 'گهٽ معيار / نظم نه آهي – بي ترتيب لفظ، بڪواس، يا غير شاعراڻو مواد' : 'Low Quality / Not a Poem – random text, gibberish, or non-poetry content',
      wrongPoet: isSindhi ? 'غلط شاعر – نظم غلط شاعر سان منسوب ٿيل' : 'Wrong Poet – poem attributed to the wrong poet',
      triggering: isSindhi ? 'حساس / ڏک پهچائيندڙ مواد – خودڪشي، تشدد وغيره جا حوالا' : 'Triggering / Sensitive Content – mentions of self-harm, violence, etc.',
      wrongCategory: isSindhi ? 'غلط درجو / ٽيگ – نظم غلط صنف ۾ رکيل' : 'Wrong Category / Tag – poem placed in the wrong genre',
      duplicate: isSindhi ? 'ورجايل داخلا – هي نظم اڳ ۾ ئي موجود آهي' : 'Duplicate Entry – already exists on the platform',
      other: isSindhi ? 'ٻيو (آزاد لکت) – جيڪو مٿي بيان ٿيل ناهي' : 'Other (Free Text) – for anything not covered'
    },
    reportDescription: isSindhi ? 'تفصيل (اختياري)' : 'Description (optional)',
    submitReport: isSindhi ? 'رپورٽ موڪليو' : 'Submit Report',
    cancel: isSindhi ? 'منسوخ' : 'Cancel',
    reportSubmitted: isSindhi ? 'رپورٽ موڪلي ويو' : 'Report submitted',
    thankYou: isSindhi ? 'شڪريا' : 'Thank you'
  };

  const [poetry, setPoetry] = useState<PoetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  const [otherPoetry, setOtherPoetry] = useState<PoetryData[]>([]);
  const [loadingOtherPoetry, setLoadingOtherPoetry] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportCategory, setSelectedReportCategory] = useState<ReportCategory | ''>('');
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | ''>('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Use the reports hook
  const { submitReport, loading: reportLoading, error: reportError } = useReports();

  // Fetch poetry data from database
  const fetchPoetry = useCallback(async () => {
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
      setPoetry(data.poetry);
    } catch (error) {
      console.error('Error fetching poetry:', error);
      setError('Failed to load poetry');
    } finally {
      setLoading(false);
    }
  }, [poetrySlug, poetId, formSlug, currentLang]);

  // Fetch other poetry for pagination
  const fetchOtherPoetry = useCallback(async () => {
    if (!poetId || !formSlug) return;
    
    try {
      setLoadingOtherPoetry(true);
      const response = await fetch(`/api/poets/${poetId}?lang=${currentLang}`);
      if (!response.ok) throw new Error('Failed to fetch other poetry');
      
      const data: ApiResponse = await response.json();
      
      // Get all poetry from the same form first, then other forms
      const currentFormPoetry = data.categories.find((cat: CategoryData) => cat.slug === formSlug)?.poetry || [];
      const otherFormsPoetry = data.categories
        .filter((cat: CategoryData) => cat.slug !== formSlug)
        .flatMap((cat: CategoryData) => cat.poetry || []);
      
      // Combine and filter out current poetry
      const allOtherPoetry = [...currentFormPoetry, ...otherFormsPoetry]
        .filter((poem: CategoryPoetry) => poem.poetry_slug !== poetrySlug)
        .slice(0, 6); // Limit to 6 items for pagination
      
      setOtherPoetry(allOtherPoetry);
    } catch (error) {
      console.error('Error fetching other poetry:', error);
    } finally {
      setLoadingOtherPoetry(false);
    }
  }, [poetId, formSlug, currentLang, poetrySlug]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPoetry();
        await fetchOtherPoetry();
      } catch (error) {
        console.error('Error loading poetry data:', error);
      }
    };
    
    loadData();
  }, [poetrySlug, poetId, formSlug, currentLang, fetchPoetry, fetchOtherPoetry]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReportDropdown) {
        const target = event.target as Element;
        if (!target.closest('.report-dropdown-container')) {
          setShowReportDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReportDropdown]);

  // Note: Global error handling is now handled by GlobalErrorHandler component

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShowShareFeedback(true);
      setTimeout(() => setShowShareFeedback(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Still show feedback even if copy fails
      setShowShareFeedback(true);
      setTimeout(() => setShowShareFeedback(false), 2000);
    }
  };

  const handleView = () => {
    // Handle view functionality - could scroll to top or show view stats
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportClick = () => {
    setShowReportDropdown(!showReportDropdown);
  };

  const handleReportCategoryClick = (category: ReportCategory) => {
    setSelectedReportCategory(category);
    setShowReportDropdown(false);
    setShowReportModal(true);
  };

  const handleReportReasonClick = (reason: ReportReason) => {
    setSelectedReportReason(reason);
  };

  const handleReportSubmit = async () => {
    if (!poetry?.id || !selectedReportCategory || !selectedReportReason) {
      return;
    }

    try {
      console.log('Submitting report with data:', {
        poetry_id: poetry.id.toString(),
        category: selectedReportCategory,
        reason: selectedReportReason,
        description: reportDescription
      });

      const result = await submitReport({
        poetry_id: poetry.id.toString(), // Ensure it's a string
        category: selectedReportCategory as ReportCategory,
        reason: selectedReportReason as ReportReason,
        description: reportDescription || undefined
      });

      console.log('Report submission result:', result);

      if (result.success) {
        setReportSubmitted(true);
        setShowReportModal(false);
        setSelectedReportCategory('');
        setSelectedReportReason('');
        setReportDescription('');
        
        // Show success message
        setTimeout(() => {
          setReportSubmitted(false);
        }, 3000);
      } else {
        console.error('Report submission failed:', result.error);
        console.error('Full result object:', result);
        alert(`Report submission failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the report';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleReportCancel = () => {
    setShowReportModal(false);
    setSelectedReportCategory('');
    setSelectedReportReason('');
    setReportDescription('');
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

  // Get couplets with language indicators
  const getCoupletsWithLanguageTags = () => {
    if (poetry?.poetry_couplets && poetry.poetry_couplets.length > 0) {
      // Filter couplets based on current locale
      let filteredCouplets = poetry.poetry_couplets;
      
      // If in Sindhi locale (/sd), remove English couplets
      if (isSindhi) {
        filteredCouplets = poetry.poetry_couplets.filter(couplet => couplet.lang !== 'en');
      }
      
      // Group couplets by their text content to identify which languages are available
      const coupletGroups = new Map();
      
      filteredCouplets.forEach(couplet => {
        const key = couplet.couplet_text;
        if (!coupletGroups.has(key)) {
          coupletGroups.set(key, []);
        }
        coupletGroups.get(key).push(couplet.lang);
      });
      
      // Create display rows with language tags
      return Array.from(coupletGroups.entries()).map(([coupletText, languages]) => ({
        text: coupletText,
        languages: languages.sort(), // Sort languages consistently
        hasEn: languages.includes('en'),
        hasSd: languages.includes('sd')
      }));
    }
    return [];
  };

  // Get tags from poetry_tags field
  const getTags = () => {
    if (poetry?.poetry_tags) {
      // Split comma-separated tags and clean them
      return poetry.poetry_tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  };

  // Translate tag to Sindhi if needed
  const translateTag = (tag: string) => {
    if (!isSindhi) return tag;
    
    const tagTranslations: { [key: string]: string } = {
      'love': 'محبت',
      'romance': 'رومانس',
      'nature': 'فطرت',
      'life': 'زندگي',
      'sadness': 'غم',
      'happiness': 'خوشي',
      'friendship': 'دوستي',
      'family': 'خاندان',
      'religion': 'مذهب',
      'spiritual': 'روحاني',
      'philosophy': 'فلسفو',
      'wisdom': 'حڪمت',
      'beauty': 'خوبصورتي',
      'peace': 'امن',
      'war': 'جنگ',
      'freedom': 'آزادي',
      'patriotism': 'وطن پرستي',
      'homeland': 'وطن',
      'nostalgia': 'يادگيري',
      'hope': 'اميد',
      'despair': 'نااميدي'
    };
    
    return tagTranslations[tag.toLowerCase()] || tag;
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

  // Generate short description for poet
  const getShortDescription = () => {
    if (!poetry?.poets) return '';
    
    const poet = poetry.poets;
    const parts = [];
    
    // Add period information
    if (poet.birth_date) {
      const birthYear = poet.birth_date.split('-')[0];
      const deathYear = poet.death_date && poet.death_date !== 'NULL' ? poet.death_date.split('-')[0] : null;
      
      if (deathYear) {
        parts.push(`${birthYear}-${deathYear}`);
      } else {
        parts.push(`${birthYear}-${isSindhi ? 'جيئرو' : 'alive'}`);
      }
    }
    
    // Add location if available
    if (poet.birth_place) {
      parts.push(poet.birth_place);
    }
    
    return parts.join(' • ');
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
        return 'text-center mx-auto max-w-4xl';
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
          <h1 className={`text-3xl font-light text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
            fontFeatureSettings: '"kern" 1, "liga" 1',
            letterSpacing: isSindhi ? '0.01em' : '0.01em'
          }}>
            {multiLangContent.errorLoading}
          </h1>
          <p className={`text-gray-600 mb-8 text-lg font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
            fontFeatureSettings: '"kern" 1, "liga" 1',
            letterSpacing: isSindhi ? '0.01em' : '0.01em',
            lineHeight: '1.6'
          }}>{error}</p>
          <button 
            onClick={async () => {
              try {
                await fetchPoetry();
              } catch (error) {
                console.error('Error retrying fetch:', error);
              }
            }} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-light"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              letterSpacing: '0.01em'
            }}
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
          <h1 className={`text-3xl font-light text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
            fontFeatureSettings: '"kern" 1, "liga" 1',
            letterSpacing: isSindhi ? '0.01em' : '0.01em'
          }}>
            {multiLangContent.poetryNotFound}
          </h1>
          <p className={`text-gray-600 text-lg font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
            fontFeatureSettings: '"kern" 1, "liga" 1',
            letterSpacing: isSindhi ? '0.01em' : '0.01em',
            lineHeight: '1.6'
          }}>
            {multiLangContent.poetryNotExist}
          </p>
        </div>
      </div>
    );
  }

  const title = getTitle();
  const description = getDescription();
  const poetryContent = getContent();
  const coupletsWithTags = getCoupletsWithLanguageTags();
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
              <h1 className={`${isSindhi ? 'text-3xl md:text-4xl font-normal leading-[1.1]' : 'text-2xl md:text-3xl font-light leading-[1.15] tracking-tight'} text-gray-900 mb-8 ${getSmartFontClass(title, { baseClass: 'sindhi-heading-1', isHeading: true })}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                letterSpacing: isSindhi ? '0.01em' : '-0.02em',
                wordSpacing: '0.02em'
              }}>
              
                {title}
              </h1>
            )}

            {/* Description - Only if meaningful content exists */}
            {description && description.trim() !== '' && (
              <p className={`text-lg text-gray-600 mb-12 leading-[1.7] max-w-2xl font-light ${getSmartFontClass(description, { baseClass: 'sindhi-text-base' })}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.01em',
                wordSpacing: '0.03em'
              }}>
                {description}
              </p>
            )}

            {/* Fallback when no title or description */}
            {!title && !description && (
              <div className="mb-10 text-center py-8">
                <div className="text-gray-400 mb-3">
                  <BookOpen className="h-12 w-12 mx-auto" />
                </div>
                <h3 className={`text-lg font-light text-gray-600 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: isSindhi ? '0.01em' : '0.01em'
                }}>
                  {isSindhi ? 'شاعري جو عنوان ۽ تفصيل دستياب ناهي' : 'Poetry title and description not available'}
                </h3>
                <p className={`text-sm text-gray-500 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: isSindhi ? '0.01em' : '0.01em',
                  lineHeight: '1.6'
                }}>
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
                      <Image 
                        src={poetry.poets.file_url} 
                        alt={getPrimaryPoetTitle() || 'Poet'} 
                        fill
                        className="object-cover"
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
                      <h3 className={`text-sm font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                        fontFeatureSettings: '"kern" 1, "liga" 1',
                        letterSpacing: isSindhi ? '0.01em' : '0.01em'
                      }}>
                        {getPrimaryPoetTitle()}
                      </h3>
                    )}
                    {getSecondaryPoetSubtitle() && (
                      <p className={`text-xs text-gray-600 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                        fontFeatureSettings: '"kern" 1, "liga" 1',
                        letterSpacing: isSindhi ? '0.01em' : '0.01em',
                        lineHeight: '1.5'
                      }}>
                        {getSecondaryPoetSubtitle()}
                      </p>
                    )}
                    {getPoetTagline() && (
                      <p className={`text-xs text-gray-500 mt-1 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                        fontFeatureSettings: '"kern" 1, "liga" 1',
                        letterSpacing: isSindhi ? '0.01em' : '0.01em',
                        lineHeight: '1.4'
                      }}>
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
                    <MixedContentWithNumbers 
                      text={new Date(poetry.created_at).toLocaleDateString(currentLang === 'sd' ? 'sd' : 'en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      className="text-xs"
                      sindhiClass="sindhi-text-sm"
                      englishClass="text-sm"
                      numberClass="number text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Poetry Content - Plain Couplets */}
          {coupletsWithTags.length > 0 ? (
            <motion.article 
              className="mb-20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={`poetry-content text-2xl md:text-3xl leading-[1.7] text-gray-900 font-light tracking-wide ${getAlignmentClasses()}`} style={{ 
                textAlign: getTextAlignment().replace('text-', '') as 'left' | 'right' | 'center' | 'justify',
                fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.015em',
                wordSpacing: '0.04em',
                lineHeight: '1.7',
                wordBreak: 'keep-all',
                overflowWrap: 'break-word'
              }}>
                {/* Display each couplet as plain text */}
                {coupletsWithTags.map((couplet, index) => (
                  <motion.div 
                    key={index} 
                    className="mb-8 last:mb-0"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  >
                    <p className={`${getSmartFontClass(couplet.text, { baseClass: isSindhi ? 'sindhi-text-2xl' : 'text-2xl' })}`} style={{
                      letterSpacing: isSindhi ? '0.01em' : '0.015em',
                      wordSpacing: '0.04em',
                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                      lineHeight: isSindhi ? '1.8' : '1.7',
                      fontSize: isSindhi ? '1.875rem' : '1.5rem'
                    }}>
                      <MixedContentWithNumbers 
                        text={couplet.text} 
                        className={`${getSmartFontClass(couplet.text, { baseClass: isSindhi ? 'sindhi-text-2xl' : 'text-2xl' })}`}
                      />
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.article>
          ) : (
            <div className="mb-20 text-center py-16">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-16 w-16 mx-auto" />
              </div>
              <h3 className={`text-lg font-light text-gray-600 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.01em'
              }}>
                {isSindhi ? 'شاعري جو مواد دستياب ناهي' : 'Poetry content not available'}
              </h3>
              <p className={`text-sm text-gray-500 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.01em',
                lineHeight: '1.6'
              }}>
                {isSindhi ? 'هن شاعري لاءِ بيت يا مواد اڃا شامل نه ڪيو ويو آهي' : 'Couplets or content for this poetry have not been added yet'}
              </p>
            </div>
          )}

          {/* Interaction Bar - Ultra minimal */}
          {coupletsWithTags.length > 0 && (
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
                <span className={`text-sm font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}>{likes}</span>
              </motion.button>
              
              <motion.button
                onClick={handleView}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="h-4 w-4" />
                <span className={`text-sm font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}>
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
                <span className={`text-sm font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}>
                  {multiLangContent.share}
                </span>
              </motion.button>

              {/* Report Button with Dropdown */}
              <div className="relative report-dropdown-container">
                <motion.button
                  onClick={handleReportClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Flag className="h-4 w-4" />
                  <span className={`text-sm font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {multiLangContent.report}
                  </span>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showReportDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <button
                        onClick={() => handleReportCategoryClick('common')}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100"
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportCategories.common}</span>
                      </button>
                      
                      <button
                        onClick={() => handleReportCategoryClick('additional')}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportCategories.additional}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence>
                {showShareFeedback && (
                  <motion.span 
                    className={`text-sm text-green-600 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`}
                    style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em'
                    }}
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
              <div className="flex items-center space-x-4 mb-4">
                <Tag className="h-4 w-4 text-gray-400 mx-2" />
                <h3 className={`text-sm font-light text-gray-700 uppercase tracking-wide ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.05em'
                }}>
                  {multiLangContent.tags}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag: string, index: number) => (
                  <motion.span
                    key={index}
                    className={`px-3 py-2 bg-gray-50 text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors border border-gray-200 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`}
                    style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em',
                      lineHeight: '1.4'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {translateTag(tag)}
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
                    <Image 
                      src={poetry.poets.file_url} 
                      alt={getPrimaryPoetTitle() || 'Poet'} 
                      fill
                      className="object-cover"
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
                  <h3 className={`text-base font-light text-gray-900 mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {isSindhi ? `${getPrimaryPoetTitle()} ${multiLangContent.about}` : `${multiLangContent.about} ${getPrimaryPoetTitle()}`}
                  </h3>
                  
                  {/* Real poet data */}
                  <div className={`text-sm text-gray-600 leading-relaxed space-y-2 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em',
                    lineHeight: '1.6'
                  }}>
                    {/* Short description */}
                    {getShortDescription() && (
                      <p className="text-xs text-gray-500 font-light" style={{
                        fontFeatureSettings: '"kern" 1, "liga" 1',
                        letterSpacing: '0.01em',
                        lineHeight: '1.5'
                      }}>
                        {(() => {
                          const poet = poetry.poets;
                          const parts = [];
                          
                          // Add period information with NumberFont
                          if (poet.birth_date) {
                            const birthYear = poet.birth_date.split('-')[0];
                            const deathYear = poet.death_date && poet.death_date !== 'NULL' ? poet.death_date.split('-')[0] : null;
                            
                            if (deathYear) {
                              parts.push(
                                <>
                                  <NumberFont>{birthYear}</NumberFont> - <NumberFont>{deathYear}</NumberFont>
                                </>
                              );
                            } else {
                              parts.push(
                                <>
                                  <NumberFont>{birthYear}</NumberFont> - <span className={isSindhi ? 'auto-sindhi-font' : ''}>{isSindhi ? 'جيئرو' : 'alive'}</span>
                                </>
                              );
                            }
                          }
                          
                          // Add location if available
                          if (poet.birth_place) {
                            parts.push(poet.birth_place);
                          }
                          
                          return parts.length > 0 ? parts.map((part, index) => (
                            <span key={index}>
                              {part}
                              {index < parts.length - 1 && ' • '}
                            </span>
                          )) : null;
                        })()}
                      </p>
                    )}
                    
                    {/* Poet description if available */}
                    {(poetry.poets.sindhi_details || poetry.poets.english_details || poetry.poets.sindhi_tagline || poetry.poets.english_tagline) ? (
                      <div className="space-y-2">
                        {/* Show detailed description if available */}
                        {(poetry.poets.sindhi_details || poetry.poets.english_details) && (
                          <p>
                            {isSindhi ? poetry.poets.sindhi_details : poetry.poets.english_details}
                          </p>
                        )}
                        
                        {/* Show tagline if available and no detailed description */}
                        {!(poetry.poets.sindhi_details || poetry.poets.english_details) && getPoetTagline() && (
                          <p className="italic text-gray-700">
                            &ldquo;{getPoetTagline()}&rdquo;
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Enhanced fallback with more meaningful information */
                      <div className="space-y-2">
                        {/* Show tagline if available */}
                        {getPoetTagline() && (
                          <p className="italic text-gray-700">
                            &ldquo;{getPoetTagline()}&rdquo;
                          </p>
                        )}
                        
                        
                        {/* Show category-specific information */}
                        <p>
                          {isSindhi ? (
                            <>
                              {poetry.poets.english_laqab || poetry.poets.sindhi_laqab 
                                ? `هي قابل شاعر ${poetry.categories?.slug === 'chausittaa' ? 'چوڱيتا' : poetry.categories?.slug === 'ghazal' ? 'غزل' : poetry.categories?.slug === 'nazm' ? 'نظم' : poetry.categories?.slug || 'مختلف صنفن'} ۾ پنهنجي فن جو مظاهرو ڪيو آهي.`
                                : `هي قابل شاعر سنڌي شاعري جي امير ورثي ۾ حصو وٺي رهيو آهي.`
                              }
                            </>
                          ) : (
                            <>
                              {poetry.poets.english_laqab || poetry.poets.sindhi_laqab 
                                ? `A talented poet known for their work in ${poetry.categories?.slug === 'chausittaa' ? 'Chausittaa' : poetry.categories?.slug === 'ghazal' ? 'Ghazal' : poetry.categories?.slug === 'nazm' ? 'Nazm' : poetry.categories?.slug || 'various forms'}.`
                                : `A talented poet contributing to the rich heritage of Sindhi poetry.`
                              }
                            </>
                          )}
                        </p>
                        
                        {/* Show tags if available */}
                        {poetry.poets.tags && poetry.poets.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {poetry.poets.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span 
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer - Ultra minimal */}
        </motion.div>
      </main>

      {/* Mobile Action Bar - Minimal and unobtrusive */}
      {coupletsWithTags.length > 0 && (
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
              <span className={`text-xs font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: '0.01em'
              }}>{likes}</span>
            </motion.button>
            <motion.button
              onClick={handleView}
              className="flex flex-col items-center space-y-1 text-gray-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="h-6 w-6" />
              <span className={`text-xs font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: '0.01em'
              }}>
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
              <span className={`text-xs font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: '0.01em'
              }}>
                {multiLangContent.share}
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Success Notification */}
      <AnimatePresence>
        {reportSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}>
                  {multiLangContent.reportSubmitted}
                </p>
                <p className={`text-sm text-green-100 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}>
                  {isSindhi ? 'شڪريا! اسان جلد ئي هن مسئلي کي حل ڪنداسين' : 'Thank you! We will review this issue soon.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleReportCancel()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {multiLangContent.reportPoetry}
                  </h3>
                  <button
                    onClick={handleReportCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Selected Category */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {isSindhi ? 'رپورٽ جو قسم' : 'Report Category'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className={`text-sm text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em'
                    }}>
                      {multiLangContent.reportCategories[selectedReportCategory as keyof typeof multiLangContent.reportCategories]}
                    </span>
                  </div>
                </div>

                {/* Report Reasons */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium text-gray-700 mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {isSindhi ? 'رپورٽ جو سبب چونڊيو' : 'Select reason for reporting'}
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedReportCategory === 'common' && (
                      <>
                        <button
                          onClick={() => handleReportReasonClick('contentError')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'contentError' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.contentError}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('offensive')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'offensive' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.offensive}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('copyright')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'copyright' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Flag className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.copyright}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('spam')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'spam' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MessageSquare className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.spam}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('misinformation')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'misinformation' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.misinformation}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('lowQuality')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'lowQuality' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.lowQuality}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('wrongPoet')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'wrongPoet' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.wrongPoet}</span>
                          </div>
                        </button>
                      </>
                    )}
                    
                    {selectedReportCategory === 'additional' && (
                      <>
                        <button
                          onClick={() => handleReportReasonClick('triggering')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'triggering' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.triggering}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('wrongCategory')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'wrongCategory' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Tag className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.wrongCategory}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('duplicate')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'duplicate' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MessageCircle className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.duplicate}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleReportReasonClick('other')}
                          className={`w-full p-3 text-left text-sm rounded-lg border transition-colors ${
                            selectedReportReason === 'other' 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MoreHorizontal className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{multiLangContent.reportReasons.other}</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    letterSpacing: '0.01em'
                  }}>
                    {multiLangContent.reportDescription}
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder={isSindhi ? 'وڌيڪ تفصيل لکيو...' : 'Please provide more details...'}
                    style={{
                      fontFamily: isSindhi ? 'var(--font-sindhi)' : 'inherit',
                      direction: isSindhi ? 'rtl' : 'ltr'
                    }}
                  />
                </div>

                {/* Error Display */}
                {reportError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className={`text-sm text-red-700 ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em'
                    }}>
                      {reportError}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReportCancel}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    <span className={isSindhi ? 'auto-sindhi-font' : ''} style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em'
                    }}>
                      {multiLangContent.cancel}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleReportSubmit().catch(error => {
                        console.error('Unhandled promise rejection in handleReportSubmit:', error);
                      });
                    }}
                    disabled={!selectedReportReason || reportLoading}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                      selectedReportReason && !reportLoading
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {reportLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className={isSindhi ? 'auto-sindhi-font' : ''} style={{
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      letterSpacing: '0.01em'
                    }}>
                      {reportLoading ? (isSindhi ? 'موڪلي رهيو...' : 'Submitting...') : multiLangContent.submitReport}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-light'} mb-2`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.01em'
              }}>
                {multiLangContent.otherPoetry}
              </h2>
              <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`} style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                letterSpacing: isSindhi ? '0.01em' : '0.01em',
                lineHeight: '1.7'
              }}>
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
                            <h3 className={`text-lg font-light text-black leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                              fontFeatureSettings: '"kern" 1, "liga" 1',
                              letterSpacing: isSindhi ? '0.01em' : '0.01em'
                            }}>
                              {isSindhi ? poem.poetry_translations?.find(t => t.lang === 'sd')?.title : poem.poetry_translations?.find(t => t.lang === 'en')?.title || 'Untitled'}
                            </h3>
                            {poem.poetry_translations?.[0]?.info && (
                              <p className={`text-sm text-gray-600 leading-relaxed font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                                fontFeatureSettings: '"kern" 1, "liga" 1',
                                letterSpacing: isSindhi ? '0.01em' : '0.01em',
                                lineHeight: '1.6'
                              }}>
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
                                "text-sm font-light text-foreground",
                                isSindhi ? 'auto-sindhi-font' : ''
                              )} style={{
                                fontFeatureSettings: '"kern" 1, "liga" 1',
                                letterSpacing: '0.01em'
                              }}>
                                {getPrimaryPoetTitle()?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`text-sm text-gray-700 font-light ${isSindhi ? 'auto-sindhi-font' : ''}`} style={{
                              fontFeatureSettings: '"kern" 1, "liga" 1',
                              letterSpacing: '0.01em'
                            }}>
                              {getPrimaryPoetTitle()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-light" style={{
                            fontFeatureSettings: '"kern" 1, "liga" 1',
                            letterSpacing: '0.01em'
                          }}>
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
                          <div className="flex items-center gap-1 text-xs text-gray-500 font-light" style={{
                            fontFeatureSettings: '"kern" 1, "liga" 1',
                            letterSpacing: '0.01em'
                          }}>
                            <Eye className="h-4 w-4" />
                            <NumberFont size="xs">{Math.floor(Math.random() * 100) + 50}</NumberFont>
                          </div>
                        </div>

                        {/* Read Button */}
                        <div className="pt-4">
                          <Link 
                            href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetId}/form/${poem.categories?.slug || formSlug}/${poem.poetry_slug}`}
                            className="block w-full text-center py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-light text-sm"
                            style={{
                              fontFeatureSettings: '"kern" 1, "liga" 1',
                              letterSpacing: '0.01em'
                            }}
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors font-light"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  letterSpacing: '0.01em'
                }}
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
