import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { slug } = params;

    // First, get the tag information
    const { data: tag, error: tagError } = await admin
      .from("tags")
      .select("id, slug, label, tag_type, created_at")
      .eq("slug", slug)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Get translations for the tag
    const { data: translations, error: translationsError } = await admin
      .from("tags_translations")
      .select("lang_code, title, detail")
      .eq("tag_id", tag.id);

    if (translationsError && translationsError.code !== '42P01') {
      console.error("Error fetching translations:", translationsError);
      return NextResponse.json({ error: String(translationsError.message) }, { status: 500 });
    }

    // Get English title and description
    let title = tag.label;
    let description = `Explore all categories related to ${tag.label}`;
    
    if (translations && translations.length > 0) {
      const english = translations.find(t => t.lang_code === 'en');
      if (english) {
        title = english.title || tag.label;
        description = english.detail || `Explore all categories related to ${title}`;
      }
    }

    // For now, we'll return some sample categories since we need to implement
    // the relationship between tags and categories
    // In a real implementation, you would query categories that are related to this tag
    
    const sampleCategories = [
      {
        id: 1,
        name: "Sufi Poetry",
        slug: "sufi-poetry",
        count: 156,
        description: "Classical Sufi poetry and spiritual verses"
      },
      {
        id: 2,
        name: "Divine Love",
        slug: "divine-love",
        count: 89,
        description: "Poetry exploring the love for the divine"
      },
      {
        id: 3,
        name: "Mystical Wisdom",
        slug: "mystical-wisdom",
        count: 123,
        description: "Ancient wisdom and philosophical insights"
      }
    ];

    // Filter categories based on the tag (this is a simplified example)
    let relatedCategories = sampleCategories;
    if (slug === "sufi") {
      relatedCategories = sampleCategories.filter(cat => 
        cat.slug.includes("sufi") || cat.slug.includes("mystical")
      );
    } else if (slug === "divine-love") {
      relatedCategories = sampleCategories.filter(cat => 
        cat.slug.includes("divine") || cat.slug.includes("love")
      );
    }

    const topicData = {
      title: title,
      description: description,
      totalCategories: relatedCategories.length,
      totalItems: relatedCategories.reduce((sum, cat) => sum + cat.count, 0)
    };

    return NextResponse.json({
      topic: topicData,
      categories: relatedCategories
    });

  } catch (err: any) {
    console.error("Error fetching topic data:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
