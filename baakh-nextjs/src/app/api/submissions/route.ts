export const runtime = 'edge'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error("Supabase URL not configured");
  }
  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not configured");
  }
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const {
      submitter_name,
      submitter_email,
      submission_type,
      title,
      content,
      poet_name,
      category_slug,
      lang,
    } = body || {};

    // Basic validation
    const errors: string[] = [];
    if (!submitter_name || String(submitter_name).trim().length < 2) errors.push("Name is required");
    if (!submitter_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(submitter_email))) errors.push("Valid email is required");
    if (!submission_type || !['poetry','couplet','correction','suggestion','other'].includes(String(submission_type))) errors.push("Invalid submission type");
    if (!title || String(title).trim().length < 2) errors.push("Title is required");
    if (!content || String(content).trim().length < 5) errors.push("Content is required");

    const normalizedLang = (lang === 'sd' || lang === 'en') ? lang : 'sd';

    if (errors.length) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    // Diagnostics from headers
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || null;
    const user_agent = request.headers.get('user-agent') || null;

    const { error } = await supabase
      .from('submissions')
      .insert({
        submitter_name: String(submitter_name).trim(),
        submitter_email: String(submitter_email).trim(),
        submission_type: String(submission_type),
        title: String(title).trim(),
        content: String(content),
        poet_name: poet_name ? String(poet_name).trim() : null,
        category_slug: category_slug ? String(category_slug).trim() : null,
        lang: normalizedLang,
        status: 'pending',
        ip,
        user_agent,
        meta: {},
      });

    if (error) {
      console.error('Submissions insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    const message = err?.message || String(err);
    console.error('Submissions API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


