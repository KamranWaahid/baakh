/**
 * Hook for managing optimistic like and bookmark actions
 * Provides optimistic UI updates with background synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mutationQueue } from '@/lib/mutation-queue';
import { backgroundFlusher } from '@/lib/background-flusher';
import { 
  getCrossLanguageEntityId, 
  enqueueCrossLanguageMutation, 
  onCrossLanguageChange 
} from '@/lib/cross-language-sync';

export interface OptimisticActionsOptions {
  entityId: string;
  entityType?: 'couplet';
  initialLiked?: boolean;
  initialBookmarked?: boolean;
  initialLikeCount?: number;
  onStatusChange?: (status: 'online' | 'offline' | 'syncing' | 'error') => void;
  enableCrossLanguageSync?: boolean;
  currentLanguage?: 'en' | 'sd';
}

export interface OptimisticActionsReturn {
  // State
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  isLoading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  
  // Actions
  toggleLike: () => void;
  toggleBookmark: () => void;
  
  // Queue info
  queueStats: { total: number; pending: number; failed: number };
}

export function useOptimisticActions({
  entityId,
  entityType = 'couplet',
  initialLiked = false,
  initialBookmarked = false,
  initialLikeCount = 0,
  onStatusChange,
  enableCrossLanguageSync = true,
  currentLanguage = 'en'
}: OptimisticActionsOptions): OptimisticActionsReturn {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueStats, setQueueStats] = useState({ total: 0, pending: 0, failed: 0 });

  // Keep a stable ref to onStatusChange to avoid effect loops
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Update status from background flusher (polling with change checks)
  useEffect(() => {
    // Set initial values
    const status = backgroundFlusher.getStatus();
    setIsOnline(status.isOnline);
    setIsSyncing(status.isFlushing);
    setQueueStats(status.queueStats);

    const intervalId = setInterval(() => {
      const current = backgroundFlusher.getStatus();

      // Only update when changed to prevent re-render loops
      setIsOnline((prev) => {
        if (prev !== current.isOnline) {
          onStatusChangeRef.current?.(current.isOnline ? 'online' : 'offline');
          return current.isOnline;
        }
        return prev;
      });

      setIsSyncing((prev) => {
        if (prev !== current.isFlushing) {
          if (current.isFlushing) {
            onStatusChangeRef.current?.('syncing');
          }
          return current.isFlushing;
        }
        return prev;
      });

      setQueueStats((prev) => {
        const changed =
          prev.total !== current.queueStats.total ||
          prev.pending !== current.queueStats.pending ||
          prev.failed !== current.queueStats.failed;
        return changed ? current.queueStats : prev;
      });
    }, 1000);

    // Also reflect native online/offline events quickly
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state with latest mutations in queue
  useEffect(() => {
    const syncWithQueue = () => {
      const latestMutation = mutationQueue.getLatestMutationForEntity(entityId, entityType);
      
      if (latestMutation) {
        switch (latestMutation.op) {
          case 'like':
            setIsLiked(true);
            break;
          case 'unlike':
            setIsLiked(false);
            break;
          case 'bookmark':
            setIsBookmarked(true);
            break;
          case 'unbookmark':
            setIsBookmarked(false);
            break;
        }
      }
    };

    // Initial sync
    syncWithQueue();

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mutQueue') {
        syncWithQueue();
      }
    };

    // Listen for cross-language changes
    let unsubscribeCrossLanguage: (() => void) | null = null;
    if (enableCrossLanguageSync) {
      unsubscribeCrossLanguage = onCrossLanguageChange((data) => {
        // Parse entityId to get coupletId and userId
        const [coupletId, userId] = entityId.split(':');
        if (data.coupletId === coupletId && data.userId === userId) {
          // This is a cross-language change for the same couplet
          syncWithQueue();
        }
      });
    }

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (unsubscribeCrossLanguage) {
        unsubscribeCrossLanguage();
      }
    };
  }, [entityId, entityType, enableCrossLanguageSync]);

  const toggleLike = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const newLikedState = !isLiked;
      const newLikeCount = newLikedState ? likeCount + 1 : Math.max(likeCount - 1, 0);
      
      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount(newLikeCount);
      
      // Enqueue mutation with cross-language sync
      const op = newLikedState ? 'like' : 'unlike';
      
      if (enableCrossLanguageSync) {
        // Parse entityId to get coupletId and userId
        const [coupletId, userId] = entityId.split(':');
        enqueueCrossLanguageMutation(op, coupletId, userId, currentLanguage);
      } else {
        mutationQueue.enqueue(op, entityId, entityType);
      }
      
      // Trigger immediate flush if online
      if (isOnline) {
        backgroundFlusher.flushImmediately();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, likeCount, isLoading, entityId, entityType, isOnline, enableCrossLanguageSync]);

  const toggleBookmark = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const newBookmarkedState = !isBookmarked;
      
      // Optimistic update
      setIsBookmarked(newBookmarkedState);
      
      // Enqueue mutation with cross-language sync
      const op = newBookmarkedState ? 'bookmark' : 'unbookmark';
      
      if (enableCrossLanguageSync) {
        // Parse entityId to get coupletId and userId
        const [coupletId, userId] = entityId.split(':');
        enqueueCrossLanguageMutation(op, coupletId, userId, currentLanguage);
      } else {
        mutationQueue.enqueue(op, entityId, entityType);
      }
      
      // Trigger immediate flush if online
      if (isOnline) {
        backgroundFlusher.flushImmediately();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsLoading(false);
    }
  }, [isBookmarked, isLoading, entityId, entityType, isOnline, enableCrossLanguageSync]);

  return {
    isLiked,
    isBookmarked,
    likeCount,
    isLoading,
    isOnline,
    isSyncing,
    toggleLike,
    toggleBookmark,
    queueStats
  };
}
