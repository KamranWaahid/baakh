import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  
  const supabase = createClient(url, serviceKey, { 
    auth: { autoRefreshToken: false, persistSession: false } 
  });
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Search for topic tags only
    const { data: tags, error: tagsError } = await getSupabaseClient()
      .from("tags")
      .select(`
        id, 
        slug, 
        label, 
        tag_type,
        tags_translations!inner(
          lang_code,
          title,
          detail
        )
      `)
      .eq('tag_type', 'Topic')
      .ilike('label', `%${query}%`)
      .limit(limit);

    if (tagsError) {
      console.error("Error searching tags:", tagsError);
      return NextResponse.json({ error: String(tagsError.message) }, { status: 500 });
    }

    // Format the response
    const formattedTags = tags?.map(tag => {
      const sindhi = tag.tags_translations?.find((t: any) => t.lang_code === 'sd');
      const english = tag.tags_translations?.find((t: any) => t.lang_code === 'en');
      
      return {
        id: tag.id,
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type,
        sindhi: {
          title: sindhi?.title || tag.label,
          details: sindhi?.detail || ''
        },
        english: {
          title: english?.title || tag.label,
          details: english?.detail || ''
        }
      };
    }) || [];

    return NextResponse.json({ 
      tags: formattedTags,
      count: formattedTags.length
    });
    
  } catch (err: any) {
    console.error("Error searching tags:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
