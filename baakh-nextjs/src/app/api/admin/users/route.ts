import { NextResponse } from "next/server";
import { createClient } from "@getSupabaseClient()/getSupabaseClient()-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { users: [], note: "Supabase not configured (missing URL or service role key)" },
      { status: 200 }
    );
  }

  const getSupabaseClient() = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Fetch up to 1000 users; adjust as needed with pagination params
    const { data, error } = await getSupabaseClient().auth.getSupabaseClient().listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return NextResponse.json({ users: [], error: error.message }, { status: 500 });
    }

    const users = (data?.users || []).map((u) => {
      const metadata: any = u.user_metadata || {};
      const email = u.email || "";
      const name = metadata.name || email?.split("@")[0] || "User";
      // Map to the UI roles taxonomy when possible
      let role = metadata.role || "Viewer";
      if (role !== "SuperAdmin" && role !== "Admin" && role !== "Editor" && role !== "Viewer") {
        role = "Viewer";
      }
      const avatarUrl = metadata.avatar_url || "";
      const initialPassword = metadata.initial_password || null;
      return { id: u.id, email, name, role, avatarUrl, initialPassword };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ users: [], error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const body = await req.json();
    const { email, password, name, role } = body || {};
    if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });

    const { data, error } = await getSupabaseClient().auth.getSupabaseClient().createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split("@")[0],
        role: role || "SuperAdmin",
        initial_password: password,
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data.user });
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
    const { id, email, password, name, role } = body || {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const update: any = {};
    if (email) update.email = email;
    if (password) update.password = password;
    update.user_metadata = {
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
    };
    const { data, error } = await getSupabaseClient().auth.getSupabaseClient().updateUserById(id, update);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


