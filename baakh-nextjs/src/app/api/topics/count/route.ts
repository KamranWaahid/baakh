export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get count of topics (tags with type 'Topic')
    const { count, error } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_type', 'Topic');

    if (error) {
      console.error('Error getting topics count:', error);
      return NextResponse.json({ total: 0 });
    }

    return NextResponse.json({ total: count || 0 });
  } catch (error) {
    console.error('Topics count API error:', error);
    return NextResponse.json({ total: 0 });
  }
}
