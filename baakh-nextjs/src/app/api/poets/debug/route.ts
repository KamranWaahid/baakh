export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: 'Missing Supabase environment variables'
      });
    }

    console.log('Debug API - Checking poets in database');
    
    // Get all poets to see what exists
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('poet_id, poet_slug, sindhi_name, english_name')
      .limit(10);

    if (poetsError) {
      console.error('Error fetching poets:', poetsError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch poets',
        details: poetsError.message
      });
    }

    console.log('Found poets:', poets);

    // Check specifically for "naveeda"
    const { data: naveedaPoet, error: naveedaError } = await supabase
      .from('poets')
      .select('*')
      .eq('poet_slug', 'naveeda')
      .single();

    console.log('Naveeda poet search result:', { naveedaPoet, naveedaError });

    return NextResponse.json({
      success: true,
      totalPoets: poets?.length || 0,
      poets: poets || [],
      naveedaPoet: naveedaPoet || null,
      naveedaError: naveedaError?.message || null
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
