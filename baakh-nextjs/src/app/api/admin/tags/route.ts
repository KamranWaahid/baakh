import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  
  const supabase = createClient(url, serviceKey, { 
    auth: { autoRefreshToken: false, persistSession: false } 
  });
  
  try {
    // Check if tables exist first
    const { data: tableCheck, error: tableError } = await supabase
      .from("tags")
      .select("id")
      .limit(1);

    if (tableError) {
      console.error("Tags table not accessible:", tableError);
      return NextResponse.json({ 
        error: "Tags table not accessible. Please run the database setup script first.",
        details: tableError.message 
      }, { status: 500 });
    }

    // Fetch tags with their translations (exclude poet tag types)
    const poetTagTypes = [
      'Era / Tradition', 'Language', 'Identity / Group', 'Form / Style', 
      'Theme / Subject', 'Region / Locale', 'Stage / Career', 
      'Influence / Aesthetic', 'Genre / Output', 'Script / Metadata'
    ];
    
    const { data: allTags, error: tagsError } = await supabase
      .from("tags")
      .select("id, slug, label, tag_type, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      return NextResponse.json({ error: String(tagsError.message) }, { status: 500 });
    }

    // Filter out poet tags
    const tags = allTags.filter(tag => !poetTagTypes.includes(tag.tag_type));

    // Fetch translations for all tags
    const { data: translations, error: translationsError } = await supabase
      .from("tags_translations")
      .select("tag_id, lang_code, title, detail");

    if (translationsError) {
      console.error("Error fetching translations:", translationsError);
      // If translations table doesn't exist, return tags without translations
      if (translationsError.code === '42P01') { // Table doesn't exist
        const tagsWithoutTranslations = tags.map(tag => ({
          id: tag.id,
          slug: tag.slug,
          label: tag.label,
          tag_type: tag.tag_type,
          created_at: tag.created_at,
          updated_at: tag.updated_at,
          sindhi: { title: tag.label, details: '' },
          english: { title: tag.label, details: '' }
        }));
        return NextResponse.json({ tags: tagsWithoutTranslations });
      }
      return NextResponse.json({ error: String(translationsError.message) }, { status: 500 });
    }

    // Combine tags with their translations
    const tagsWithTranslations = tags.map(tag => {
      const tagTranslations = translations.filter(t => t.tag_id === tag.id);
      const sindhi = tagTranslations.find(t => t.lang_code === 'sd') || { title: '', detail: '' };
      const english = tagTranslations.find(t => t.lang_code === 'en') || { title: '', detail: '' };
      
      return {
        id: tag.id,
        slug: tag.slug,
        label: tag.label,
        tag_type: tag.tag_type,
        created_at: tag.created_at,
        updated_at: tag.updated_at,
        sindhi: {
          title: sindhi.title || tag.label,
          details: sindhi.detail || ''
        },
        english: {
          title: english.title || tag.label,
          details: english.detail || ''
        }
      };
    });

    return NextResponse.json({ tags: tagsWithTranslations });
    
  } catch (err: any) {
    console.error("Error fetching tags:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  
  const supabase = createClient(url, serviceKey, { 
    auth: { autoRefreshToken: false, persistSession: false } 
  });
  
  try {
    const body = await request.json();
    const { slug, type, sindhi, english } = body;

    if (!slug || !sindhi?.title || !english?.title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing tag:", checkError);
      return NextResponse.json({ error: String(checkError.message) }, { status: 500 });
    }

    let tagId: number;

    if (existingTag) {
      // Update existing tag
      tagId = existingTag.id;
      const { error: updateError } = await supabase
        .from("tags")
        .update({ 
          label: sindhi.title, // Use Sindhi title as label
          tag_type: type || 'Topic',
          updated_at: new Date().toISOString()
        })
        .eq("id", tagId);

      if (updateError) {
        console.error("Error updating tag:", updateError);
        return NextResponse.json({ error: String(updateError.message) }, { status: 500 });
      }
    } else {
      // Create new tag
      const { data: newTag, error: insertError } = await supabase
        .from("tags")
        .insert({
          slug,
          label: sindhi.title, // Use Sindhi title as label
          tag_type: type || 'Topic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating tag:", insertError);
        return NextResponse.json({ error: String(insertError.message) }, { status: 500 });
      }

      tagId = newTag.id;
    }

    // Upsert translations with better error handling
    const translations = [
      { tag_id: tagId, lang_code: 'sd', title: sindhi.title, detail: sindhi.details || '' },
      { tag_id: tagId, lang_code: 'en', title: english.title, detail: english.details || '' }
    ];

    for (const translation of translations) {
      try {
        const { error: translationError } = await supabase
          .from("tags_translations")
          .upsert(translation, { onConflict: 'tag_id,lang_code' });

        if (translationError) {
          console.error("Error upserting translation:", translationError);
          // If translation fails, try to delete the tag to maintain consistency
          if (!existingTag) {
            await supabase.from("tags").delete().eq("id", tagId);
          }
          return NextResponse.json({ error: String(translationError.message) }, { status: 500 });
        }
      } catch (translationErr: any) {
        console.error("Error upserting translation:", translationErr);
        // If translation fails, try to delete the tag to maintain consistency
        if (!existingTag) {
          await supabase.from("tags").delete().eq("id", tagId);
        }
        return NextResponse.json({ error: String(translationErr?.message || translationErr) }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: existingTag ? "Tag updated successfully" : "Tag created successfully",
      tag_id: tagId 
    });

  } catch (err: any) {
    console.error("Error creating/updating tag:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    // Delete translations first
    const { error: translationsError } = await supabase
      .from("tags_translations")
      .delete()
      .eq("tag_id", id);

    if (translationsError) {
      console.error("Error deleting translations:", translationsError);
      return NextResponse.json({ error: String(translationsError.message) }, { status: 500 });
    }

    // Delete the tag
    const { error: tagError } = await supabase
      .from("tags")
      .delete()
      .eq("id", id);

    if (tagError) {
      console.error("Error deleting tag:", tagError);
      return NextResponse.json({ error: String(tagError.message) }, { status: 500 });
    }

    return NextResponse.json({ message: "Tag deleted successfully" });

  } catch (err: any) {
    console.error("Error deleting tag:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


