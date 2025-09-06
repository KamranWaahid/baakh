import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Fetch various statistics from the database
    const [
      poetsCount,
      poetryCount,
      tagsCount,
      categoriesCount,
      coupletsCount,
      recentPoets,
      recentPoetry,
      recentTags
    ] = await Promise.all([
      // Total poets count
      supabase
        .from('poets')
        .select('id', { count: 'exact', head: true }),
      
      // Total poetry count
      supabase
        .from('poetry')
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
        .from('couplets')
        .select('id', { count: 'exact', head: true }),
      
      // Recent poets (last 7 days)
      supabase
        .from('poets')
        .select('id, name, slug, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent poetry (last 7 days)
      supabase
        .from('poetry')
        .select('id, title, slug, created_at, poets(name, slug)')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent tags (last 7 days)
      supabase
        .from('tags')
        .select('id, label, slug, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Calculate weekly changes (mock for now, can be enhanced with actual analytics)
    const weeklyChanges = {
      poets: '+12%',
      poetry: '+8%',
      tags: '+5%',
      views: '+23%'
    };

    // Format the response
    const stats = {
      totalPoets: poetsCount.count || 0,
      totalPoetry: poetryCount.count || 0,
      totalTags: tagsCount.count || 0,
      totalCategories: categoriesCount.count || 0,
      totalCouplets: coupletsCount.count || 0,
      weeklyChanges,
      recentActivity: {
        poets: recentPoets.data || [],
        poetry: recentPoetry.data || [],
        tags: recentTags.data || []
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

