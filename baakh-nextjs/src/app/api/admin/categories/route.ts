import { NextResponse } from "next/server";
import { createClient } from "@getSupabaseClient()/getSupabaseClient()-js";

type CreateCategoryBody = {
  key: string;
  slug: string;
  english: { name: string; plural?: string; details: string };
  sindhi: { name: string; plural?: string; details: string };
  contentStyle?: string;
  gender?: string;
  isFeatured?: boolean;
};

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const getSupabaseClient() = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const trashed = searchParams.get("trashed") === "true";
    if (id) {
      const { data, error } = await getSupabaseClient()
        .from("categories")
        .select("id, slug, is_featured, content_style, gender, category_details:category_details(cat_name, cat_name_plural, cat_detail, lang)")
        .eq("id", id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const details = Array.isArray((data as any)?.category_details) ? (data as any).category_details : [];
      const en = details.find((d:any)=>d.lang === "en");
      const sd = details.find((d:any)=>d.lang === "sd");
      const result = {
        id: String((data as any).id),
        slug: (data as any).slug,
        isFeatured: Boolean((data as any).is_featured),
        contentStyle: (data as any).content_style || "justified",
        gender: (data as any).gender || "masculine",
        english: { name: en?.cat_name || "", plural: en?.cat_name_plural || "", details: en?.cat_detail || "" },
        sindhi: { name: sd?.cat_name || "", plural: sd?.cat_name_plural || "", details: sd?.cat_detail || "" },
      };
      return NextResponse.json({ category: result }, { status: 200 });
    }

    let query = getSupabaseClient()
      .from("categories")
      .select("id, slug, content_style, deleted_at, category_details:category_details(cat_name, cat_detail, lang)")
      .order("id", { ascending: false });
    if (trashed) {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data || []).map((c: any) => {
      const details = Array.isArray(c.category_details) ? c.category_details : [];
      const en = details.find((d:any)=>d.lang === "en");
      const sd = details.find((d:any)=>d.lang === "sd");
      return {
        id: String(c.id),
        name: en?.cat_name || sd?.cat_name || c.slug || "",
        information: en?.cat_detail || sd?.cat_detail || "",
        detailAlign: (c.content_style as string) || "start",
        languages: [ sd ? "Sindhi" : null, en ? "English" : null ].filter(Boolean),
      };
    });

    return NextResponse.json({ rows }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const body = await req.json();
    const id = body?.id as number | string | undefined;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const slug = String(body.slug || "").trim();
    if (body?.restore === true) {
      const { error: restoreErr } = await getSupabaseClient().from("categories").update({ deleted_at: null }).eq("id", id);
      if (restoreErr) return NextResponse.json({ error: restoreErr.message }, { status: 500 });
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const isFeatured = Boolean(body.isFeatured ?? false);
    const contentStyle = String(body.contentStyle || "justified");
    const gender = (String(body.gender || "masculine").toLowerCase() === "feminine") ? "feminine" : "masculine";
    const english = body.english || { name: "", plural: "", details: "" };
    const sindhi = body.sindhi || { name: "", plural: "", details: "" };

    // Update categories
    const updateCat: Record<string, any> = { is_featured: isFeatured, content_style: contentStyle, gender };
    if (slug) updateCat.slug = slug;
    const { error: upErr } = await getSupabaseClient().from("categories").update(updateCat).eq("id", id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // Upsert details
    const detailsPayload = [
      { cat_id: Number(id), cat_name: english.name || slug, cat_name_plural: english.plural || null, cat_detail: english.details || null, lang: "en" },
      { cat_id: Number(id), cat_name: sindhi.name || slug, cat_name_plural: sindhi.plural || null, cat_detail: sindhi.details || null, lang: "sd" },
    ];
    const { error: detErr } = await getSupabaseClient().from("category_details").upsert(detailsPayload, { onConflict: "cat_id,lang" });
    if (detErr) return NextResponse.json({ error: detErr.message }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const body = await req.json();
    const id = body?.id as number | string | undefined;
    const hard = Boolean(body?.hard);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (hard) {
      const { error: delErr } = await getSupabaseClient().from("categories").delete().eq("id", id);
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const { error: softErr } = await getSupabaseClient().from("categories").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (softErr) return NextResponse.json({ error: softErr.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const getSupabaseClient() = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const payload = (await req.json()) as CreateCategoryBody;
    const slug = String(payload.slug || "").trim();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    // Map UI values to DB expectations
    const isFeatured = Boolean(payload.isFeatured ?? false);
    const contentStyleUi = String(payload.contentStyle || "").toLowerCase();
    const contentStyle = contentStyleUi === "justified" ? "justified" : "justified"; // default
    const genderUi = String(payload.gender || "masculine").toLowerCase();
    const gender = genderUi === "feminine" ? "feminine" : "masculine"; // enum only allows masculine/feminine

    // 1) Find or insert into categories by unique slug (idempotent)
    let catId: number | null = null;
    {
      const { data: found, error: findErr } = await getSupabaseClient()
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .limit(1);
      if (!findErr && found && found[0]) catId = found[0].id as number;
    }
    if (!catId) {
      const { data: catRow, error: catErr } = await getSupabaseClient()
        .from("categories")
        .insert([{ slug, is_featured: isFeatured, content_style: contentStyle, gender }])
        .select("id, slug")
        .single();
      if (catErr) {
        // If duplicate slug (23505) due to race or prior insert, fetch existing id and continue
        const msg = (catErr as any)?.message || "";
        const code = (catErr as any)?.code || "";
        if (code === "23505" || msg.includes("duplicate key value") || msg.includes("categories_slug_key")) {
          const { data: foundAgain } = await getSupabaseClient()
            .from("categories")
            .select("id")
            .eq("slug", slug)
            .limit(1);
          catId = (foundAgain && (foundAgain[0]?.id as number | undefined)) ?? null;
        } else {
          return NextResponse.json({ error: catErr.message }, { status: 500 });
        }
      } else {
        catId = (catRow?.id as number | undefined) ?? null;
      }
    }
    if (!catId) return NextResponse.json({ error: "Failed to create or find category" }, { status: 500 });

    // 2) Insert localized details
    const english = payload.english || { name: "", details: "", plural: "" };
    const sindhi = payload.sindhi || { name: "", details: "", plural: "" };

    const detailsPayload = [
      { cat_id: catId, cat_name: english.name || slug, cat_name_plural: english.plural || null, cat_detail: english.details || null, lang: "en" },
      { cat_id: catId, cat_name: sindhi.name || slug, cat_name_plural: sindhi.plural || null, cat_detail: sindhi.details || null, lang: "sd" },
    ];

    const { error: detErr } = await getSupabaseClient()
      .from("category_details")
      .upsert(detailsPayload, { onConflict: "cat_id,lang" });
    if (detErr) return NextResponse.json({ error: detErr.message }, { status: 500 });

    return NextResponse.json({ id: catId, slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


