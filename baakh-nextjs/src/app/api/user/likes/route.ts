export const runtime = 'edge'
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

    const { data: likesData, error: likesError } = await supabase
      .from('user_likes')
      .select('likeable_id, created_at, couplet_slug', { count: 'exact' })
      .eq('user_uuid', user.id)
      .eq('likeable_type', 'couplet')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (likesError) {
      return NextResponse.json(
        { error: 'failed-to-fetch-likes' },
        { status: 500 }
      );
    }

    if (!likesData || likesData.length === 0) {
      return NextResponse.json({
        success: true,
        likes: [],
        count: 0,
        page,
        limit
      });
    }

    const coupletIds = likesData.map((like: { likeable_id: number }) => like.likeable_id);

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
      return NextResponse.json(
        { error: 'failed-to-fetch-couplet-details' },
        { status: 500 }
      );
    }

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
    const validCouplets = (coupletsData as CoupletRow[] | null)?.filter((couplet: CoupletRow) => couplet.id) || [];

    const transformedCouplets = validCouplets.map((couplet: CoupletRow) => ({
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter((line: string) => line.trim()) : [],
      tags: couplet.couplet_tags || [],
      created_at: couplet.created_at,
      poetry_id: couplet.poetry_id,
      poet_id: couplet.poet_id,
      poet: couplet.poets || null,
      views: 0,
      likes: 0
    }));

    return NextResponse.json({
      success: true,
      likes: transformedCouplets,
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
