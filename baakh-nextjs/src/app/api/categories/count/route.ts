import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Get count of categories
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting categories count:', error);
      return NextResponse.json({ total: 0 });
    }

    return NextResponse.json({ total: count || 0 });
  } catch (error) {
    console.error('Categories count API error:', error);
    return NextResponse.json({ total: 0 });
  }
}
