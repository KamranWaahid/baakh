/**
 * Cache revalidation utilities for optimistic updates
 * Handles revalidation of Next.js cache after successful mutations
 */

import { revalidateTag, revalidatePath } from 'next/cache';

export interface RevalidationOptions {
  coupletId?: string;
  poetId?: string;
  categoryId?: string;
  path?: string;
  tags?: string[];
}

/**
 * Revalidate cache after successful like/bookmark operations
 */
export async function revalidateAfterMutation(options: RevalidationOptions): Promise<void> {
  try {
    const { coupletId, poetId, categoryId, path, tags } = options;

    // Revalidate specific tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }

    // Revalidate couplet-specific tags
    if (coupletId) {
      revalidateTag(`couplet:${coupletId}`);
      revalidateTag(`couplet:${coupletId}:likes`);
      revalidateTag(`couplet:${coupletId}:bookmarks`);
    }

    // Revalidate poet-specific tags
    if (poetId) {
      revalidateTag(`poet:${poetId}`);
      revalidateTag(`poet:${poetId}:couplets`);
    }

    // Revalidate category-specific tags
    if (categoryId) {
      revalidateTag(`category:${categoryId}`);
      revalidateTag(`category:${categoryId}:couplets`);
    }

    // Revalidate specific paths
    if (path) {
      revalidatePath(path);
    }

    // Revalidate common paths that might show like counts
    revalidatePath('/en/couplets');
    revalidatePath('/sd/couplets');
    revalidatePath('/en');
    revalidatePath('/sd');

    console.log('Cache revalidated successfully', { coupletId, poetId, categoryId, path, tags });
  } catch (error) {
    console.error('Cache revalidation error:', error);
    // Don't throw - revalidation failure shouldn't break the mutation
  }
}

/**
 * Generate cache tags for a couplet
 */
export function getCoupletCacheTags(coupletId: string, poetId?: string, categoryId?: string): string[] {
  const tags = [
    `couplet:${coupletId}`,
    `couplet:${coupletId}:likes`,
    `couplet:${coupletId}:bookmarks`
  ];

  if (poetId) {
    tags.push(`poet:${poetId}`);
    tags.push(`poet:${poetId}:couplets`);
  }

  if (categoryId) {
    tags.push(`category:${categoryId}`);
    tags.push(`category:${categoryId}:couplets`);
  }

  return tags;
}

/**
 * Generate cache tags for a poet
 */
export function getPoetCacheTags(poetId: string): string[] {
  return [
    `poet:${poetId}`,
    `poet:${poetId}:couplets`,
    `poet:${poetId}:likes`,
    `poet:${poetId}:bookmarks`
  ];
}

/**
 * Generate cache tags for a category
 */
export function getCategoryCacheTags(categoryId: string): string[] {
  return [
    `category:${categoryId}`,
    `category:${categoryId}:couplets`,
    `category:${categoryId}:likes`,
    `category:${categoryId}:bookmarks`
  ];
}
