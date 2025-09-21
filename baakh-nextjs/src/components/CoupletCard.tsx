'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Heart, Bookmark, Share2, Eye, WifiOff } from 'lucide-react';
import { NumberFont, MixedContentWithNumbers } from '@/components/ui/NumberFont';
import { cn } from '@/lib/utils';
import { useViewTracking } from '@/hooks/useViewTracking';
import { motion } from 'framer-motion';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthModal } from '@/components/ui/AuthModal';
import { useOptimisticActions } from '@/hooks/useOptimisticActions';
import { useState, useEffect } from 'react';

interface CoupletCardProps {
  couplet: {
    id: number;
    couplet_text: string;
    couplet_slug: string;
    lang: string;
    lines: string[];
    tags: string[];
    poet: {
      name: string;
      slug: string;
      photo: string | null;
      sindhiName?: string;
      englishName?: string;
      sindhi_laqab?: string;
      english_laqab?: string;
    };
    created_at: string;
    likes: number;
    views: number;
  };
  isSindhi: boolean;
  index: number;
}

export default function CoupletCard({ couplet, isSindhi, index }: CoupletCardProps) {
  const { isAuthenticated, showAuthModal, authContext, requireAuth, closeAuthModal, user } = useAuthRequired();
  
  // Use optimistic actions hook with cross-language sync
  const {
    isLiked,
    isBookmarked,
    likeCount,
    isLoading,
    isOnline,
    isSyncing,
    toggleLike,
    toggleBookmark,
    queueStats
  } = useOptimisticActions({
    entityId: `${couplet.id}:${user?.userId || 'anonymous'}`,
    entityType: 'couplet',
    initialLiked: false, // Will be set from server data
    initialBookmarked: false, // Will be set from server data
    initialLikeCount: couplet.likes || 0,
    enableCrossLanguageSync: true, // Enable cross-language synchronization
    currentLanguage: isSindhi ? 'sd' : 'en', // Pass current language
    onStatusChange: (status) => {
      // Optional: Handle status changes
      console.log('CoupletCard status change:', status);
    }
  });
  
  // Track view for this couplet
  useViewTracking({
    contentId: couplet.id,
    contentType: 'couplet',
    enabled: true,
    delay: 2000 // Track after 2 seconds of viewing
  });

  // Only render couplets that match the current locale
  if ((isSindhi && couplet.lang !== 'sd') || (!isSindhi && couplet.lang === 'sd')) {
    return null;
  }

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => {}, 'like');
      return;
    }
    
    if (!user?.userId) return;
    
    toggleLike();
  };

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => {}, 'bookmark');
      return;
    }
    
    if (!user?.userId) return;
    
    toggleBookmark();
  };

  const handleShareClick = async () => {
    try {
      const shareUrl = `${window.location.origin}/${isSindhi ? 'sd' : 'en'}/couplets/${couplet.couplet_slug}`;
      const shareText = `${couplet.couplet_text}\n\n- ${couplet.poet.name}`;
      
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: `${couplet.poet.name} - ${isSindhi ? 'شعر' : 'Couplet'}`,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard (silent)
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      }
    } catch (error) {
      console.error('Error sharing couplet:', error);
      // Fallback: just copy the URL
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/${isSindhi ? 'sd' : 'en'}/couplets/${couplet.couplet_slug}`);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="transition-all duration-200"
    >
      <Card className="border border-gray-200/50 bg-white rounded-[12px] shadow-none">
        <CardContent className="p-8">
          {/* Couplet Content */}
          <div className="space-y-2 mb-6">
            <div className="text-center space-y-1 w-full">
              <div
                className={`leading-relaxed ${
                  isSindhi 
                    ? 'text-lg font-medium text-black auto-sindhi-font' 
                    : 'text-base font-light text-gray-800 tracking-wide'
                }`}
                dir={isSindhi ? 'rtl' : 'ltr'}
                style={{
                  fontFamily: isSindhi ? 'var(--font-sindhi-primary)' : 'Georgia, serif',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  textAlign: 'center',
                  lineHeight: isSindhi ? '1.6' : '1.8',
                  marginBottom: '0',
                  fontStyle: !isSindhi ? 'italic' : 'normal',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
              >
                {couplet.couplet_text}
              </div>
            </div>
          </div>

          {/* Poet Info */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 bg-background border border-gray-200/30 shadow-sm">
                <AvatarImage src={couplet.poet?.photo || undefined} alt={couplet.poet?.englishName || couplet.poet?.sindhiName || 'Unknown Poet'} />
                <AvatarFallback className={cn(
                  "text-sm font-medium text-foreground bg-gray-50 border border-gray-200/40",
                  couplet.lang === 'sd' ? 'auto-sindhi-font' : ''
                )}>
                  {couplet.poet?.englishName || couplet.poet?.sindhiName ? (
                    couplet.lang === 'sd' 
                      ? (couplet.poet.sindhiName || couplet.poet.englishName).charAt(0)
                      : (couplet.poet.englishName || couplet.poet.sindhiName).charAt(0).toUpperCase()
                  ) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className={`text-sm text-gray-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {couplet.poet ? (
                  isSindhi
                    ? (couplet.poet.sindhi_laqab || couplet.poet.sindhiName || couplet.poet.englishName)
                    : (couplet.poet.english_laqab || couplet.poet.englishName || couplet.poet.sindhiName)
                ) : (
                  isSindhi ? 'نامعلوم شاعر' : 'Unknown Poet'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-4 w-4" />
              <MixedContentWithNumbers 
                text={isSindhi ? '2 منٽ' : '2 min'}
                className="text-xs"
                sindhiClass="auto-sindhi-font"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <motion.button 
                onClick={handleLikeClick}
                disabled={isLoading}
                className={`p-2 hover:bg-gray-100 rounded-full transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                } hover:bg-gray-50`}
                title={isAuthenticated ? (isLiked ? 'Unlike this couplet' : 'Like this couplet') : 'Login to like'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <motion.div 
                    className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Heart className={`h-4 w-4 transition-all duration-200 ${
                      isLiked 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-gray-600 hover:text-red-500'
                    }`} />
                  </motion.div>
                )}
                {likeCount > 0 && !isLoading && (
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <NumberFont size="xs" className={`text-gray-600 transition-colors ${
                      isLiked ? 'text-red-600' : ''
                    }`}>
                      {likeCount}
                    </NumberFont>
                  </motion.div>
                )}
              </motion.button>
              <motion.button 
                onClick={handleBookmarkClick}
                disabled={isLoading}
                className={`p-2 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                } hover:bg-gray-50`}
                title={isAuthenticated ? (isBookmarked ? 'Remove bookmark' : 'Bookmark this couplet') : 'Login to bookmark'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={isBookmarked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <motion.div 
                    className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <motion.div
                    animate={isBookmarked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Bookmark className={`h-4 w-4 transition-all duration-200 ${
                      isBookmarked 
                        ? 'text-blue-500 fill-blue-500' 
                        : 'text-gray-600 hover:text-blue-500'
                    }`} />
                  </motion.div>
                )}
              </motion.button>
              <motion.button 
                onClick={handleShareClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isSindhi ? "شئير ڪريو" : "Share"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="h-4 w-4 text-gray-600 hover:text-green-500" />
              </motion.button>
            </div>
            <div className="flex items-center gap-2">
              {/* Offline indicator only */}
              {!isOnline && (
                <motion.div 
                  className="flex items-center gap-1 text-xs text-amber-600" 
                  title="Working offline"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">{isSindhi ? 'آف لائن' : 'Offline'}</span>
                </motion.div>
              )}
              {/* Views */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="h-4 w-4" />
                <NumberFont size="xs">{couplet.views}</NumberFont>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        context={authContext}
      />
    </motion.div>
  );
}
