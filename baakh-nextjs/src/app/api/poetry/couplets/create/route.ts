export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();
    
    // Fetch only topic tags with their translations
    const { data: tags, error: tagsError } = await admin
      .from('tags')
      .select(`
        id, 
        slug, 
        label, 
        tag_type, 
        created_at,
        tags_translations(
          lang_code,
          title,
          detail
        )
      `)
      .eq('tag_type', 'Topic')
      .order('created_at', { ascending: false });

    if (tagsError) {
      console.error('Error fetching topic tags:', tagsError);
      return NextResponse.json({ error: 'Failed to fetch topic tags' }, { status: 500 });
    }

    // Process tags to include translations in a structured format
    const processedTags = (tags || []).map((tag: any) => {
      const translations = Array.isArray(tag.tags_translations) ? tag.tags_translations : [];
      const en = translations.find((t: any) => t.lang_code === 'en');
      const sd = translations.find((t: any) => t.lang_code === 'sd');
      
      return {
        id: String(tag.id),
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type,
        created_at: tag.created_at,
        tags_translations: translations,
        // For backward compatibility, also include direct fields
        englishTitle: en?.title || tag.label,
        sindhiTitle: sd?.title || tag.label,
        englishDetail: en?.detail || '',
        sindhiDetail: sd?.detail || '',
        // Structured translations for easier access
        english: {
          title: en?.title || tag.label,
          details: en?.detail || ''
        },
        sindhi: {
          title: sd?.title || tag.label,
          details: sd?.detail || ''
        }
      };
    });

    return NextResponse.json({ 
      tags: processedTags,
      total: processedTags.length,
      type: 'Topic'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in poetry couplets create API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
