import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { withSecurity } from '@/lib/security/middleware';

async function getHandler(request: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // First, get the user's bookmarked couplet IDs from user_bookmarks table with stored slugs
    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from('user_bookmarks')
      .select('bookmarkable_id, created_at, couplet_slug', { count: 'exact' })
      .eq('user_uuid', user.id)
      .eq('bookmarkable_type', 'couplet')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (bookmarksError) {
      console.error('❌ Error fetching bookmarks:', bookmarksError);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    if (!bookmarksData || bookmarksData.length === 0) {
      return NextResponse.json({
        success: true,
        bookmarks: [],
        count: 0,
        page,
        limit
      });
    }

    // Extract couplet IDs
    const coupletIds = bookmarksData.map((bookmark: { bookmarkable_id: number }) => bookmark.bookmarkable_id);
    console.log('📝 Found bookmarked couplet IDs:', coupletIds);

    // Fetch the actual couplet data with poet information using proper join
    const { data: coupletsData, error: coupletsError } = await supabase
      .from('poetry_couplets')
      .select(`
        id,
        couplet_text,
        couplet_slug,
        lang,
        couplet_tags,
        created_at,
        poetry_id,
        poet_id,
        poets (
          id,
          english_name,
          sindhi_name,
          english_laqab,
          sindhi_laqab,
          file_url
        )
      `)
      .in('id', coupletIds);

    if (coupletsError) {
      console.error('❌ Error fetching couplets:', coupletsError);
      return NextResponse.json(
        { error: 'Failed to fetch couplet details' },
        { status: 500 }
      );
    }

    // Get view counts for the couplets
    let viewCounts: Record<number, number> = {};
    if (coupletIds.length > 0) {
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('content_view_counts')
          .select('content_id, view_count')
          .eq('content_type', 'couplet')
          .in('content_id', coupletIds);

        if (!viewError && viewData) {
          viewCounts = viewData.reduce((acc: Record<number, number>, item: { content_id: number, view_count: number }) => {
            acc[item.content_id] = item.view_count;
            return acc;
          }, {} as Record<number, number>);
        }
      } catch (error) {
        console.warn('Error fetching view counts:', error);
      }
    }

    // Get like counts for the couplets
    let likeCounts: Record<number, number> = {};
    if (coupletIds.length > 0) {
      try {
        const { data: likeData, error: likeError } = await supabase
          .from('user_likes')
          .select('likeable_id')
          .eq('likeable_type', 'couplet')
          .in('likeable_id', coupletIds);

        if (!likeError && likeData) {
          likeCounts = likeData.reduce((acc: Record<number, number>, item: { likeable_id: number }) => {
            acc[item.likeable_id] = (acc[item.likeable_id] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);
        }
      } catch (error) {
        console.warn('Error fetching like counts:', error);
      }
    }

    // Transform the data to match frontend expectations
    interface CoupletRow {
      id: number;
      couplet_text: string | null;
      couplet_slug: string | null;
      lang: string | null;
      couplet_tags: any;
      created_at: string;
      poetry_id: number | null;
      poet_id: number | null;
      poets?: any;
    }
    const transformedCouplets = (coupletsData as CoupletRow[] | null)?.map((couplet: CoupletRow) => ({
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter((line: string) => line.trim()) : [],
      tags: couplet.couplet_tags || [],
      created_at: couplet.created_at,
      poetry_id: couplet.poetry_id,
      poet_id: couplet.poet_id,
      poet: couplet.poets || null, // Include poet data from join
      views: viewCounts[couplet.id] || 0,
      likes: likeCounts[couplet.id] || 0
    })) || [];

    console.log('✅ Bookmarked couplets fetched successfully:', transformedCouplets.length);

    return NextResponse.json({
      success: true,
      bookmarks: transformedCouplets,
      count: transformedCouplets.length,
      page,
      limit
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'internal-server-error' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity('api')(getHandler);
