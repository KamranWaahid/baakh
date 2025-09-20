import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get count of poetry_main (public poetry only)
    const { count, error } = await supabase
      .from('poetry_main')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', true);

    if (error) {
      console.error('Error getting poetry count:', error);
      return NextResponse.json({ total: 0 });
    }

    return NextResponse.json({ total: count || 0 });
  } catch (error) {
    console.error('Poetry count API error:', error);
    return NextResponse.json({ total: 0 });
  }
}
