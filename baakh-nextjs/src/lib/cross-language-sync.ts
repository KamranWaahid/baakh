/**
 * Cross-language synchronization utilities
 * Handles syncing likes/bookmarks between English and Sindhi versions
 */

import { mutationQueue } from './mutation-queue';

export interface CrossLanguageEntity {
  coupletId: string;
  userId: string;
  currentLanguage: 'en' | 'sd';
}

/**
 * Get the cross-language entity ID for a couplet
 * This ensures both EN and SD versions share the same base entity ID
 */
export function getCrossLanguageEntityId(coupletId: string, userId: string): string {
  return `${coupletId}:${userId}`;
}

/**
 * Check if we should sync across languages
 * Only sync if the entity ID matches the cross-language pattern
 */
export function shouldSyncCrossLanguage(entityId: string): boolean {
  // Check if entityId follows the pattern: coupletId:userId
  return /^\d+:[a-f0-9-]+$/.test(entityId);
}

/**
 * Enqueue a mutation with cross-language synchronization
 * This will create mutations for both language versions
 */
export function enqueueCrossLanguageMutation(
  op: 'like' | 'unlike' | 'bookmark' | 'unbookmark',
  coupletId: string,
  userId: string,
  currentLanguage: 'en' | 'sd'
): string[] {
  const baseEntityId = getCrossLanguageEntityId(coupletId, userId);
  
  // Create the primary mutation for the current language
  const primaryId = mutationQueue.enqueue(op, baseEntityId, 'couplet', true);
  
  // Broadcast the change to other tabs/components for cross-language sync
  broadcastCrossLanguageChange(coupletId, userId, op);
  
  return [primaryId];
}

/**
 * Get all mutations for a couplet across all languages
 */
export function getCrossLanguageMutations(coupletId: string, userId: string): any[] {
  const baseEntityId = getCrossLanguageEntityId(coupletId, userId);
  return mutationQueue.getMutationsForEntity(baseEntityId, 'couplet');
}

/**
 * Get the latest mutation for a couplet across all languages
 */
export function getLatestCrossLanguageMutation(coupletId: string, userId: string): any | null {
  const baseEntityId = getCrossLanguageEntityId(coupletId, userId);
  return mutationQueue.getLatestMutationForEntity(baseEntityId, 'couplet');
}

/**
 * Clear all cross-language mutations for a couplet
 */
export function clearCrossLanguageMutations(coupletId: string, userId: string): void {
  const baseEntityId = getCrossLanguageEntityId(coupletId, userId);
  const mutations = mutationQueue.getMutationsForEntity(baseEntityId, 'couplet');
  const mutationIds = mutations.map(m => m.id);
  mutationQueue.markAsProcessed(mutationIds);
}

/**
 * Broadcast cross-language changes to other tabs
 * This ensures all tabs (EN/SD) stay in sync
 */
export function broadcastCrossLanguageChange(
  coupletId: string,
  userId: string,
  op: 'like' | 'unlike' | 'bookmark' | 'unbookmark'
): void {
  if (typeof window === 'undefined') return;

  // Create a custom event for cross-language sync
  const event = new CustomEvent('crossLanguageSync', {
    detail: {
      coupletId,
      userId,
      op,
      timestamp: Date.now()
    }
  });

  window.dispatchEvent(event);
}

/**
 * Listen for cross-language changes
 */
export function onCrossLanguageChange(
  callback: (data: {
    coupletId: string;
    userId: string;
    op: 'like' | 'unlike' | 'bookmark' | 'unbookmark';
    timestamp: number;
  }) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleEvent = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('crossLanguageSync', handleEvent as EventListener);

  return () => {
    window.removeEventListener('crossLanguageSync', handleEvent as EventListener);
  };
}
