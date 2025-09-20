"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrendingUp, Hash } from 'lucide-react';
import Link from 'next/link';

interface TagsSectionProps {
  isSindhi: boolean;
  tags?: Tag[];
}

interface Tag {
  id: string;
  slug: string;
  label: string;
  tag_type: string;
  created_at: string;
  tags_translations?: Array<{
    lang_code: string;
    title: string;
    detail: string;
  }>;
}

// Fallback tags for when API fails
function getFallbackTags(lang: string): Tag[] {
  const fallbackTags = [
    { id: '1', slug: 'love', label: 'Love', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '2', slug: 'nature', label: 'Nature', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '3', slug: 'wisdom', label: 'Wisdom', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '4', slug: 'family', label: 'Family', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '5', slug: 'friendship', label: 'Friendship', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '6', slug: 'life', label: 'Life', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '7', slug: 'hope', label: 'Hope', tag_type: 'Topic', created_at: new Date().toISOString() },
    { id: '8', slug: 'peace', label: 'Peace', tag_type: 'Topic', created_at: new Date().toISOString() }
  ];

  if (lang === 'sd') {
    return fallbackTags.map(tag => ({
      ...tag,
      tags_translations: [{
        lang_code: 'sd',
        title: getSindhiTranslation(tag.slug),
        detail: ''
      }]
    }));
  }

  return fallbackTags;
}

function getSindhiTranslation(slug: string): string {
  const translations: { [key: string]: string } = {
    'love': 'محبت',
    'wisdom': 'حڪمت',
    'life': 'زندگي',
    'death': 'موت',
    'faith': 'ايمان',
    'hope': 'اميد',
    'patience': 'صبرو',
    'friendship': 'دوستي',
    'nature': 'فطرت',
    'freedom': 'آزادي',
    'justice': 'انصاف',
    'peace': 'امن',
    'social-justice': 'سماجي انصاف',
    'sufism': 'تصوف',
    'homeland': 'وطن',
    'culture': 'ثقافت',
    'religion': 'مذهب',
    'poetry': 'شاعري',
    'literature': 'ادب',
    'beauty': 'خوبصورتي',
    'sorrow': 'غم',
    'happiness': 'خوشي',
    'time': 'وقت',
    'youth': 'جواني',
    'old-age': 'ڏاڙهپ',
    'mother': 'ماءُ',
    'father': 'پيءُ',
    'child': 'ٻار',
    'woman': 'عورت',
    'man': 'مرد',
    'heart': 'دل',
    'soul': 'روح',
    'mind': 'دماغ',
    'eyes': 'اکيون',
    'tears': 'آنسو',
    'smile': 'مسڪر',
    'dream': 'سپنو',
    'reality': 'حقيقت',
    'truth': 'سچ',
    'lie': 'ڪوڙ',
    'good': 'سٺو',
    'bad': 'خراب',
    'right': 'صحيح',
    'wrong': 'غلط',
    'light': 'روشني',
    'darkness': 'اندھيرو',
    'day': 'ڏينهن',
    'night': 'رات',
    'morning': 'صبح',
    'evening': 'شام',
    'spring': 'بسنت',
    'summer': 'گرمي',
    'winter': 'سردي',
    'autumn': 'خزاں',
    'rain': 'مينهن',
    'sun': 'سج',
    'moon': 'چنڊ',
    'stars': 'تارا',
    'sky': 'آسمان',
    'earth': 'زمين',
    'water': 'پاڻي',
    'fire': 'باڻ',
    'wind': 'هوا',
    'flower': 'پھول',
    'tree': 'وڻ',
    'bird': 'پکي',
    'river': 'درياءُ',
    'mountain': 'پهاڙ',
    'sea': 'سمنڊ',
    'desert': 'ريگستان',
    'forest': 'جنگل',
    'garden': 'باغ',
    'home': 'گھر',
    'village': 'ڳوٺ',
    'city': 'شھر',
    'country': 'ملڪ',
    'world': 'دنيا',
    'universe': 'ڪائنات'
  };
  return translations[slug] || slug;
}

export default function TagsSection({ isSindhi, tags }: TagsSectionProps) {
  const [popularTags, setPopularTags] = useState<Tag[]>(tags || []);
  const [loading, setLoading] = useState(!tags);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (tags && tags.length > 0) {
      setPopularTags(tags);
      setLoading(false);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller for this request
    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    async function loadTags() {
      try {
        setLoading(true);
        const lang = isSindhi ? 'sd' : 'en';
        
        // Use traditional timeout approach for better compatibility
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(`/api/tags?lang=${lang}&type=Topic&limit=18`, { 
          signal: controller.signal, 
          cache: 'no-store' 
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          // Handle different error status codes gracefully
          if (res.status === 500) {
            console.warn('Tags API returned 500 - likely database not configured. Using fallback data.');
            setPopularTags(getFallbackTags(lang));
            return;
          }
          console.error('Failed to fetch tags:', res.status);
          // Use fallback data for other errors too
          setPopularTags(getFallbackTags(lang));
          return;
        }
        
        const json = await res.json();
        if (json?.tags && Array.isArray(json.tags)) {
          setPopularTags(json.tags);
        } else {
          // Fallback if response format is unexpected
          setPopularTags(getFallbackTags(lang));
        }
      } catch (e: any) {
        // Only log errors that aren't abort errors
        if (e.name !== 'AbortError') {
          if (/timed out|signal timed out/i.test(String(e?.message))) {
            console.warn('Tags request timed out - using fallback data');
            setPopularTags(getFallbackTags(isSindhi ? 'sd' : 'en'));
          } else {
            console.error('Error loading tags:', e);
            // Provide fallback data even on error
            setPopularTags(getFallbackTags(isSindhi ? 'sd' : 'en'));
          }
        }
      } finally {
        // Only update loading state if this request wasn't aborted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTags();

    return () => {
      // Cleanup: abort the request if component unmounts or effect re-runs
      if (controller && !controller.signal.aborted) {
        controller.abort();
      }
    };
  }, [isSindhi, tags]);

  function getTagColorClasses(slug: string): string {
    const palettes = [
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/20',
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-emerald-400/20',
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/20',
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/20',
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/20',
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/20',
      'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-500/15 dark:text-lime-300 dark:border-lime-400/20',
      'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-400/20',
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/20',
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/20'
    ];
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return palettes[hash % palettes.length];
  }

  // Get display title based on language
  function getDisplayTitle(tag: Tag): string {
    // The API now returns the proper translated title in the 'title' field
    // Use the same fallback logic as the API
    if (isSindhi) {
      // Use the title field if it exists and is not just the slug
      if (tag.title && tag.title !== tag.slug) {
        return tag.title;
      }
      // Fallback to the hardcoded translations
      return getSindhiTranslation(tag.slug);
    }
    return tag.label;
  }

  return (
    <motion.section 
      id="tags" 
      className="py-16 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <h2 className={`${isSindhi ? 'sd-title' : 'text-[22px] leading-snug text-gray-900 font-normal'} mb-2`}>
            {isSindhi ? 'ٽڪليون ۽ موضوع' : 'Tags & Topics'}
          </h2>
          <p className={`${isSindhi ? 'sd-subtitle' : 'text-[16px] leading-7 text-gray-600 font-light'} max-w-2xl mx-auto`}>
            {isSindhi ? 'جلدي فلٽرنگ ۽ دريافت لاءِ ڪلڪ ڪرڻ لائق ٽڪليون' : 'Clickable tags for quick topical filtering and discovery'}
          </p>
        </motion.div>
        
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="h-10 px-6 border border-gray-300 text-gray-700 rounded-full font-medium bg-white flex items-center justify-center">
            {isSindhi ? (
              <>
                <span className="auto-sindhi-font stats-text">ٽرينڊنگ</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <TrendingUp className="h-4 w-4 ml-3" />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-3" />
                </motion.div>
                <span>Trending</span>
              </>
            )}
          </div>
          <span className={`text-gray-500 text-sm font-medium ${isSindhi ? 'auto-sindhi-font card-text' : ''}`}>
            {isSindhi ? 'مشغوليءَ جي بنياد تي مشهور ٽڪليون' : 'Popular tags based on engagement'}
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-12">
          {loading && (
            <div className={`text-center text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
              {isSindhi ? 'ٽڪليون لوڊ ٿي رهيون آهن…' : 'Loading tags…'}
            </div>
          )}
          
          {!loading && popularTags.length === 0 && (
            <div className={`text-center text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font stats-text' : ''}`}>
              {isSindhi ? 'ڪو ٽڪليون نه مليا' : 'No tags found'}
            </div>
          )}
          
          {popularTags.map((tag, index) => {
            const displayTitle = getDisplayTitle(tag);
            const color = getTagColorClasses(tag.slug);
            return (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="transition-all duration-200"
              >
                <Link href={isSindhi ? `/sd/topics/${tag.slug}` : `/en/topics/${tag.slug}`}>
                  <Button
                    variant="ghost"
                    className={`h-8 px-4 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 ${isSindhi ? 'auto-sindhi-font button-text' : ''} transition-colors hover:bg-gray-50 whitespace-nowrap`}
                    aria-label={`#${displayTitle}`}
                    style={{
                      minWidth: 'fit-content',
                      maxWidth: '200px'
                    }}
                  >
                    <Hash className="w-3 h-3 opacity-70" />
                    <span className={`text-sm font-medium truncate ${isSindhi ? 'text-right' : 'text-left'}`} style={{ direction: isSindhi ? 'rtl' : 'ltr' }}>
                      {displayTitle}
                    </span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        {!loading && popularTags.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium text-base bg-white"
            >
              <Link href={isSindhi ? '/sd/topics' : '/en/topics'}>
                <span className={isSindhi ? 'auto-sindhi-font button-text' : ''}>
                  {isSindhi ? 'سڀ ٽڪليون ڏسو' : 'View All Tags'}
                </span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
