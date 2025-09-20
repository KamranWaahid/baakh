import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidateAfterMutation, getCoupletCacheTags } from '@/lib/cache-revalidation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Mutation {
  id: string;
  op: 'like' | 'unlike' | 'bookmark' | 'unbookmark';
  entityId: string;
  entityType: 'couplet';
  ts: number;
  attempts?: number;
}

interface BatchRequest {
  ops: Mutation[];
}

interface ProcessedResult {
  id: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const { ops } = body;

    if (!ops || !Array.isArray(ops) || ops.length === 0) {
      return NextResponse.json(
        { error: 'No operations provided' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (ops.length > 100) {
      return NextResponse.json(
        { error: 'Batch size too large' },
        { status: 400 }
      );
    }

    const results: ProcessedResult[] = [];
    const processedIds: string[] = [];

    // Process each mutation
    for (const mutation of ops) {
      try {
        const result = await processMutation(mutation);
        results.push({ id: mutation.id, success: result.success });
        
        if (result.success) {
          processedIds.push(mutation.id);
        }
      } catch (error) {
        console.error(`Error processing mutation ${mutation.id}:`, error);
        results.push({ 
          id: mutation.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`Batch processed: ${successCount} successful, ${failureCount} failed`);

    // Revalidate cache for successful mutations
    if (successCount > 0) {
      const successfulMutations = results.filter(r => r.success);
      const coupletIds = new Set<string>();
      
      // Extract couplet IDs from successful mutations
      for (const mutation of ops) {
        if (successfulMutations.some(r => r.id === mutation.id)) {
          const [coupletId] = mutation.entityId.split(':');
          coupletIds.add(coupletId);
        }
      }

      // Revalidate cache for each affected couplet
      for (const coupletId of coupletIds) {
        await revalidateAfterMutation({
          coupletId,
          tags: getCoupletCacheTags(coupletId)
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedIds,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Batch mutation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processMutation(mutation: Mutation): Promise<{ success: boolean; error?: string }> {
  const { id, op, entityId, entityType } = mutation;

  // Validate mutation
  if (!id || !op || !entityId || !entityType) {
    return { success: false, error: 'Invalid mutation format' };
  }

  if (entityType !== 'couplet') {
    return { success: false, error: 'Unsupported entity type' };
  }

  // Extract user ID from entityId (assuming it's in format "coupletId:userId")
  const [coupletId, userId] = entityId.split(':');
  if (!coupletId || !userId) {
    return { success: false, error: 'Invalid entity ID format' };
  }

  try {
    switch (op) {
      case 'like':
        return await handleLike(coupletId, userId, id);
      case 'unlike':
        return await handleUnlike(coupletId, userId, id);
      case 'bookmark':
        return await handleBookmark(coupletId, userId, id);
      case 'unbookmark':
        return await handleUnbookmark(coupletId, userId, id);
      default:
        return { success: false, error: 'Unknown operation' };
    }
  } catch (error) {
    console.error(`Error processing ${op} for ${entityId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleLike(coupletId: string, userId: string, mutationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if like already exists (idempotency)
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('likeable_id', coupletId)
      .eq('likeable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (existingLike) {
      // Like already exists, consider it successful
      return { success: true };
    }

    // Get couplet slug for the like
    const { data: coupletData, error: coupletError } = await supabase
      .from('poetry_couplets')
      .select('couplet_slug')
      .eq('id', coupletId)
      .single();

    if (coupletError || !coupletData) {
      return { success: false, error: 'Couplet not found' };
    }

    // Insert the like using the secure function
    const { error } = await supabase
      .rpc('insert_user_like', {
        p_user_uuid: userId,
        p_likeable_id: coupletId,
        p_likeable_type: 'couplet',
        p_couplet_slug: coupletData.couplet_slug
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleUnlike(coupletId: string, userId: string, mutationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('likeable_id', coupletId)
      .eq('likeable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (!existingLike) {
      // Like doesn't exist, consider it successful (idempotent)
      return { success: true };
    }

    // Delete the like using the secure function
    const { error } = await supabase
      .rpc('delete_user_like', {
        p_user_uuid: userId,
        p_likeable_id: coupletId,
        p_likeable_type: 'couplet'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleBookmark(coupletId: string, userId: string, mutationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if bookmark already exists (idempotency)
    const { data: existingBookmark } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('bookmarkable_id', coupletId)
      .eq('bookmarkable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (existingBookmark) {
      // Bookmark already exists, consider it successful
      return { success: true };
    }

    // Get couplet slug for the bookmark
    const { data: coupletData, error: coupletError } = await supabase
      .from('poetry_couplets')
      .select('couplet_slug')
      .eq('id', coupletId)
      .single();

    if (coupletError || !coupletData) {
      return { success: false, error: 'Couplet not found' };
    }

    // Insert the bookmark using the secure function
    const { error } = await supabase
      .rpc('insert_user_bookmark', {
        p_user_uuid: userId,
        p_bookmarkable_id: coupletId,
        p_bookmarkable_type: 'couplet',
        p_couplet_slug: coupletData.couplet_slug
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleUnbookmark(coupletId: string, userId: string, mutationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('bookmarkable_id', coupletId)
      .eq('bookmarkable_type', 'couplet')
      .eq('user_uuid', userId)
      .single();

    if (!existingBookmark) {
      // Bookmark doesn't exist, consider it successful (idempotent)
      return { success: true };
    }

    // Delete the bookmark using the secure function
    const { error } = await supabase
      .rpc('delete_user_bookmark', {
        p_user_uuid: userId,
        p_bookmarkable_id: coupletId,
        p_bookmarkable_type: 'couplet'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
