export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin stats API: Starting request');
    const supabase = createAdminClient();
    
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Admin stats API: Supabase not configured, returning mock data');
      return NextResponse.json({
        totalPoets: 0,
        totalPoetry: 0,
        totalTags: 0,
        totalCategories: 0,
        totalCouplets: 0,
        weeklyChanges: {
          poets: '0%',
          poetry: '0%',
          tags: '0%',
          views: '0%'
        },
        recentActivity: {
          poets: [],
          poetry: [],
          tags: [],
          categories: []
        }
      });
    }
    
    const now = Date.now();
    const last7Start = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const prev7Start = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    // Fetch various statistics from the database
    const [
      poetsCount,
      poetryCount,
      tagsCount,
      categoriesCount,
      coupletsCount,
      recentPoets,
      recentPoetry,
      recentTags,
      recentCategories,
      // Weekly counts (current 7 days)
      poetsWeek,
      poetryWeek,
      tagsWeek,
      coupletsWeek,
      // Previous 7 days window
      poetsPrevWeek,
      poetryPrevWeek,
      tagsPrevWeek,
      coupletsPrevWeek
    ] = await Promise.all([
      // Total poets count
      supabase
        .from('poets')
        .select('id', { count: 'exact', head: true }),
      
      // Total poetry count
      supabase
        .from('poetry_main')
        .select('id', { count: 'exact', head: true }),
      
      // Total tags count
      supabase
        .from('tags')
        .select('id', { count: 'exact', head: true }),
      
      // Total categories count
      supabase
        .from('categories')
        .select('id', { count: 'exact', head: true }),
      
      // Total couplets count
      supabase
        .from('poetry_couplets')
        .select('id', { count: 'exact', head: true }),
      
      // Recent poets (last 7 days) - alias columns to match frontend expectations
      supabase
        .from('poets')
        .select('id, name:english_name, slug:poet_slug, created_at')
        .gte('created_at', last7Start)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent poetry (last 7 days) - alias columns to match frontend expectations
      supabase
        .from('poetry_main')
        .select('id, title:english_title, slug:poetry_slug, created_at, poets(name:english_name, slug:poet_slug)')
        .gte('created_at', last7Start)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent tags (last 7 days)
      supabase
        .from('tags')
        .select('id, label, slug, created_at')
        .gte('created_at', last7Start)
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent categories (last 7 days)
      supabase
        .from('categories')
        .select('id, label, slug, created_at')
        .gte('created_at', last7Start)
        .order('created_at', { ascending: false })
        .limit(5),

      // Counts for current 7 days
      supabase.from('poets').select('id', { head: true, count: 'exact' }).gte('created_at', last7Start),
      supabase.from('poetry_main').select('id', { head: true, count: 'exact' }).gte('created_at', last7Start),
      supabase.from('tags').select('id', { head: true, count: 'exact' }).gte('created_at', last7Start),
      supabase.from('poetry_couplets').select('id', { head: true, count: 'exact' }).gte('created_at', last7Start),

      // Counts for previous 7-day window
      supabase.from('poets').select('id', { head: true, count: 'exact' }).gte('created_at', prev7Start).lt('created_at', last7Start),
      supabase.from('poetry_main').select('id', { head: true, count: 'exact' }).gte('created_at', prev7Start).lt('created_at', last7Start),
      supabase.from('tags').select('id', { head: true, count: 'exact' }).gte('created_at', prev7Start).lt('created_at', last7Start),
      supabase.from('poetry_couplets').select('id', { head: true, count: 'exact' }).gte('created_at', prev7Start).lt('created_at', last7Start)
    ]);

    // Calculate weekly change percentages
    function growth(current?: number | null, previous?: number | null) {
      const c = current || 0;
      const p = previous || 0;
      if (p === 0) return p === c ? 0 : 100; // if no items previous week, treat any new as 100%
      return Math.round(((c - p) / p) * 100);
    }
    const weeklyChanges = {
      poets: `${growth(poetsWeek.count, poetsPrevWeek.count)}%`,
      poetry: `${growth(poetryWeek.count, poetryPrevWeek.count)}%`,
      tags: `${growth(tagsWeek.count, tagsPrevWeek.count)}%`,
      couplets: `${growth(coupletsWeek.count, coupletsPrevWeek.count)}%`
    };

    // Format the response
    const stats = {
      totalPoets: poetsCount.count || 0,
      totalPoetry: poetryCount.count || 0,
      totalTags: tagsCount.count || 0,
      totalCategories: categoriesCount.count || 0,
      totalCouplets: coupletsCount.count || 0,
      weeklyChanges,
      weeklyCounts: {
        poets: poetsWeek.count || 0,
        poetry: poetryWeek.count || 0,
        tags: tagsWeek.count || 0,
        couplets: coupletsWeek.count || 0,
      },
      recentActivity: {
        poets: recentPoets.data || [],
        poetry: recentPoetry.data || [],
        tags: recentTags.data || [],
        categories: recentCategories.data || []
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

