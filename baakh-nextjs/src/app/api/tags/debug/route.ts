import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  
  const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  
  try {
    // Check tags table
    const { data: tags, error: tagsError } = await getSupabaseClient()
      .from('tags')
      .select('*')
      .limit(10);
    
    if (tagsError) {
      console.error('Tags table error:', tagsError);
      return NextResponse.json({ error: tagsError.message }, { status: 500 });
    }
    
    // Check tags_translations table
    const { data: translations, error: translationsError } = await getSupabaseClient()
      .from('tags_translations')
      .select('*')
      .limit(10);
    
    if (translationsError) {
      console.error('Translations table error:', translationsError);
      return NextResponse.json({ error: translationsError.message }, { status: 500 });
    }
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await getSupabaseClient()
      .from('tags')
      .select('*', { head: true, count: 'exact' });
    
    return NextResponse.json({
      tagsCount: tableInfo?.length || 0,
      tags: tags || [],
      translations: translations || [],
      message: 'Debug info retrieved successfully'
    });
    
  } catch (err: any) {
    console.error('Debug API - Error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
