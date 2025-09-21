import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: Request) {
  try {
    const admin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type") || "";
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 10));

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Use existing tags table with poet tag types
    let query = admin
      .from("tags")
      .select("id, slug, tag_type, created_at, updated_at", { count: "exact" })
      .in("tag_type", ["Era / Tradition", "Language", "Identity / Group", "Form / Style", "Theme / Subject", "Region / Locale", "Stage / Career", "Influence / Aesthetic", "Genre / Output", "Script / Metadata"])
      .order("created_at", { ascending: false });

    if (q) {
      // match slug or label
      query = query.or(`slug.ilike.%${q}%,label.ilike.%${q}%`);
    }
    if (type) {
      query = query.eq("tag_type", type);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // Fetch translations for all tags
    const { data: translations, error: translationsError } = await admin
      .from("tags_translations")
      .select("tag_id, lang_code, title, detail");

    if (translationsError) {
      console.error("Error fetching translations:", translationsError);
    }

    const tags = (data || []).map((row) => {
      const tagTranslations = translations ? translations.filter(t => t.tag_id === row.id) : [];
      const sindhi = tagTranslations.find(t => t.lang_code === 'sd') || { title: '', detail: '' };
      const english = tagTranslations.find(t => t.lang_code === 'en') || { title: '', detail: '' };
      
      return {
        id: row.id,
        slug: row.slug,
        label: sindhi.title || english.title || row.name,
        tag_type: row.tag_type || "",
        created_at: row.created_at,
        updated_at: row.updated_at,
        sindhi: { title: sindhi.title || "", details: sindhi.detail || "" },
        english: { title: english.title || "", details: english.detail || "" },
      };
    });

    // also expose distinct types for filters
    const { data: typesData } = await admin
      .from("tags")
      .select("tag_type")
      .in("tag_type", ["Era / Tradition", "Language", "Identity / Group", "Form / Style", "Theme / Subject", "Region / Locale", "Stage / Career", "Influence / Aesthetic", "Genre / Output", "Script / Metadata"])
      .not("tag_type", "is", null)
      .neq("tag_type", "")
      .order("tag_type", { ascending: true });

    const distinctTypes = Array.from(new Set((typesData || []).map((t: any) => t.tag_type)));

    return NextResponse.json({ tags, total: count || 0, page, pageSize, types: distinctTypes });
  } catch (err: any) {
    const message = err?.message || String(err);
    const status = message.includes("Supabase not configured") ? 500 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    const body = await request.json();
    const { slug, type, sindhi, english } = body || {};

    if (!slug || !sindhi?.title || !english?.title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ensure slug unique
    const { data: existing, error: existsErr } = await admin
      .from("tags")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existsErr && existsErr.code !== "PGRST116") {
      throw existsErr;
    }

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    // Insert the main tag
    const { data: tagData, error: tagError } = await admin
      .from("tags")
      .insert({
        slug,
        label: english.title, // Use English title as default label
        tag_type: type || "",
      })
      .select("id")
      .single();

    if (tagError) throw tagError;

    // Insert translations
    const translations = [
      { tag_id: tagData.id, lang_code: 'sd', title: sindhi.title, detail: sindhi.details || '' },
      { tag_id: tagData.id, lang_code: 'en', title: english.title, detail: english.details || '' }
    ];

    const { error: transError } = await admin
      .from("tags_translations")
      .insert(translations);

    if (transError) {
      console.error("Error inserting translations:", transError);
    }

    return NextResponse.json({ message: "Poet tag created", id: tagData.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = getAdminClient();
    const body = await request.json();
    const { id, slug, type, sindhi, english } = body || {};
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    if (slug) {
      const { data: existing, error: existsErr } = await admin
        .from("tags")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();
      if (existsErr && existsErr.code !== "PGRST116") throw existsErr;
      if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    // Update the main tag
    const { error: tagError } = await admin
      .from("tags")
      .update({
        slug,
        tag_type: type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (tagError) throw tagError;

    // Update translations if provided
    if (sindhi || english) {
      if (sindhi) {
        const { error: sdError } = await admin
          .from("tags_translations")
          .upsert({
            tag_id: id,
            lang_code: 'sd',
            title: sindhi.title,
            detail: sindhi.details || ''
          })
          .eq("tag_id", id)
          .eq("lang_code", 'sd');

        if (sdError) {
          console.error("Error updating Sindhi translation:", sdError);
        }
      }

      if (english) {
        const { error: enError } = await admin
          .from("tags_translations")
          .upsert({
            tag_id: id,
            lang_code: 'en',
            title: english.title,
            detail: english.details || ''
          })
          .eq("tag_id", id)
          .eq("lang_code", 'en');

        if (enError) {
          console.error("Error updating English translation:", enError);
        }
      }
    }

    return NextResponse.json({ message: "Poet tag updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Delete translations first
    try {
      await admin.from("tags_translations").delete().eq("tag_id", id);
    } catch (transError: any) {
      console.error("Error deleting translations:", transError);
    }

    // Delete the main tag
    const { error } = await admin.from("tags").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Poet tag deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}


