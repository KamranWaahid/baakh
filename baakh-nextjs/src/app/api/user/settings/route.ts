import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Supabase not configured");
}

const getSupabaseClient() = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

// GET user settings (for regular users in e2ee_users table)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const section = searchParams.get("section");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user settings from e2ee_users table
    const { data: userData, error } = await getSupabaseClient()
      .from("e2ee_users")
      .select("profile_cipher, profile_nonce, profile_aad")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, return default settings since we need to decrypt the profile
    // In a real implementation, you would decrypt the profile_cipher here
    const defaultSettings = {
      profile: {
        firstName: "User",
        lastName: "",
        email: "",
        phone: "",
        avatar: "",
        bio: "Regular user of Baakh poetry archive"
      },
      preferences: {
        language: "en",
        timezone: "Asia/Karachi",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        theme: "light",
        notifications: true
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        allowMessages: true
      }
    };

    // Return specific section if requested
    if (section && defaultSettings[section as keyof typeof defaultSettings]) {
      return NextResponse.json({ 
        settings: { [section]: defaultSettings[section as keyof typeof defaultSettings] }
      });
    }

    return NextResponse.json({ settings: defaultSettings });

  } catch (error) {
    console.error("Error in GET /api/user/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT user settings (for regular users)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, section, data } = body;

    if (!userId || !section || !data) {
      return NextResponse.json(
        { error: "User ID, section, and data are required" },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = ["profile", "preferences", "privacy"];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: "Invalid section. Must be one of: profile, preferences, privacy" },
        { status: 400 }
      );
    }

    // For now, just return success since we need to encrypt the data
    // In a real implementation, you would:
    // 1. Get the user's master key
    // 2. Encrypt the new settings data
    // 3. Update the profile_cipher in the database

    console.log(`Mock save: ${section} settings for user ${userId}`, data);

    return NextResponse.json({ 
      success: true, 
      message: `${section} settings updated successfully (mock - encryption needed)`,
      data: data
    });

  } catch (error) {
    console.error("Error in POST /api/user/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
