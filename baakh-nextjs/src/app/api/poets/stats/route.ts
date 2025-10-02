export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poetIds = searchParams.get('poetIds');
    
    if (!poetIds) {
      return NextResponse.json({ error: 'Poet IDs are required' }, { status: 400 });
    }

    const poetIdArray = poetIds.split(',');
    const supabase = createAdminClient();
    
    // Fetch real statistics for each poet
    const statsPromises = poetIdArray.map(async (poetId) => {
      try {
        // First, get the poet's integer ID from the poets table
        const { data: poetData, error: poetError } = await supabase
          .from('poets')
          .select('poet_id')
          .eq('id', poetId)
          .single();

        if (poetError || !poetData) {
          console.error(`Poet not found for ID ${poetId}:`, poetError);
          return {
            poet_id: poetId,
            total_views: 0,
            poetry_count: 0
          };
        }

        const integerPoetId = poetData.poet_id;

        // Get poetry count for this poet from poetry_main
        const { count: poetryCount, error: poetryError } = await supabase
          .from('poetry_main')
          .select('*', { count: 'exact', head: true })
          .eq('poet_id', integerPoetId)
          .eq('visibility', true)
          .is('deleted_at', null);

        // Get couplets count for this poet (standalone couplets)
        const { count: coupletsCount, error: coupletsError } = await supabase
          .from('poetry_couplets')
          .select('*', { count: 'exact', head: true })
          .eq('poet_id', integerPoetId)
          .or('poetry_id.is.null,poetry_id.eq.0');

        // Get all couplets count for this poet (including those with poetry_id)
        const { count: allCoupletsCount, error: allCoupletsError } = await supabase
          .from('poetry_couplets')
          .select('*', { count: 'exact', head: true })
          .eq('poet_id', integerPoetId);

        // Get real view counts from content_view_counts
        let totalViews = 0;
        try {
          // Get view counts for poet's couplets
          const { data: coupletViews, error: coupletViewsError } = await supabase
            .from('content_view_counts')
            .select('view_count')
            .eq('content_type', 'couplet')
            .in('content_id', await getCoupletIdsForPoet(supabase, integerPoetId));

          if (!coupletViewsError && coupletViews) {
            totalViews += (coupletViews as Array<{ view_count?: number }>).reduce(
              (sum: number, view: { view_count?: number }) => sum + (Number(view.view_count) || 0),
              0
            );
          }

          // Get view counts for poet's poetry works
          const { data: poetryViews, error: poetryViewsError } = await supabase
            .from('content_view_counts')
            .select('view_count')
            .eq('content_type', 'poetry')
            .in('content_id', await getPoetryIdsForPoet(supabase, integerPoetId));

          if (!poetryViewsError && poetryViews) {
            totalViews += (poetryViews as Array<{ view_count?: number }>).reduce(
              (sum: number, view: { view_count?: number }) => sum + (Number(view.view_count) || 0),
              0
            );
          }

          // Get view count for the poet profile itself
          const { data: poetViews, error: poetViewsError } = await supabase
            .from('content_view_counts')
            .select('view_count')
            .eq('content_type', 'poet')
            .eq('content_id', integerPoetId)
            .single();

          if (!poetViewsError && poetViews) {
            totalViews += poetViews.view_count || 0;
          }
        } catch (error) {
          console.error('Error fetching view counts:', error);
          // Fallback to estimated views if view tracking fails
          totalViews = Math.max(50, (allCoupletsCount || 0) * 5);
        }

        // Debug logging (can be removed in production)
        console.log(`Poet ${poetId} (${integerPoetId}) stats:`, {
          poetryCount,
          coupletsCount,
          allCoupletsCount,
          totalViews
        });

        // Calculate total works (poetry + all couplets)
        const totalWorks = (poetryCount || 0) + (allCoupletsCount || 0);

        return {
          poet_id: poetId,
          total_views: totalViews,
          poetry_count: totalWorks
        };
      } catch (error) {
        console.error(`Error fetching stats for poet ${poetId}:`, error);
        return {
          poet_id: poetId,
          total_views: 0,
          poetry_count: 0
        };
      }
    });

    const stats = await Promise.all(statsPromises);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching poet stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get couplet IDs for a poet
async function getCoupletIdsForPoet(supabase: any, poetId: number): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('poetry_couplets')
      .select('id')
      .eq('poet_id', poetId);
    
    if (error) {
      console.error('Error fetching couplet IDs:', error);
      return [];
    }
    
    return data?.map((item: any) => parseInt(item.id)) || [];
  } catch (error) {
    console.error('Error in getCoupletIdsForPoet:', error);
    return [];
  }
}

// Helper function to get poetry IDs for a poet
async function getPoetryIdsForPoet(supabase: any, poetId: number): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('poetry_main')
      .select('id')
      .eq('poet_id', poetId)
      .eq('visibility', true)
      .is('deleted_at', null);
    
    if (error) {
      console.error('Error fetching poetry IDs:', error);
      return [];
    }
    
    return data?.map((item: any) => parseInt(item.id)) || [];
  } catch (error) {
    console.error('Error in getPoetryIdsForPoet:', error);
    return [];
  }
}
