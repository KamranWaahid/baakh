import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { name, email, subject, message } = body || {};

    const errors: string[] = [];
    if (!name || String(name).trim().length < 2) errors.push("Name is required");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push("Valid email is required");
    if (!subject || String(subject).trim().length < 2) errors.push("Subject is required");
    if (!message || String(message).trim().length < 5) errors.push("Message is required");

    if (errors.length) return NextResponse.json({ error: errors.join(", ") }, { status: 400 });

    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || null;
    const user_agent = request.headers.get('user-agent') || null;

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        sender_name: String(name).trim(),
        sender_email: String(email).trim(),
        subject: String(subject).trim(),
        message: String(message),
        status: 'new',
        ip,
        user_agent,
        meta: {},
      });

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('Contact API error:', err?.message || String(err));
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}


