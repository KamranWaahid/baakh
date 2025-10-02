export const runtime = 'edge'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client function to avoid build-time errors
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing required environment variables');
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });
}

// Test endpoint to verify settings functionality with real profile data
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get real profile data from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, email, avatar_url")
      .eq("id", userId)
      .single();

    // Get user email from auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    // Extract name parts from display_name
    const displayName = profile?.display_name || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Return mock settings with real profile data
    const mockSettings = {
      profile: {
        firstName: firstName || "Admin",
        lastName: lastName || "User",
        email: authUser?.user?.email || profile?.email || "supabase@baakh.com",
        phone: "+92 300 1234567",
        avatar: profile?.avatar_url || "",
        bio: "System administrator for Baakh poetry archive"
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: "30",
        loginNotifications: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        weeklyReports: true,
        systemAlerts: true,
        userActivity: false
      },
      system: {
        language: "en",
        timezone: "Asia/Karachi",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        theme: "light",
        autoBackup: true,
        backupFrequency: "daily"
      }
    };

    return NextResponse.json({ 
      success: true,
      settings: mockSettings,
      message: "Mock settings loaded successfully"
    });

  } catch (error) {
    console.error("Error in test settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Mock save operation
    console.log(`Mock save: ${section} settings for user ${userId}`, data);

    return NextResponse.json({ 
      success: true, 
      message: `${section} settings saved successfully (mock)`,
      data: data
    });

  } catch (error) {
    console.error("Error in test settings save:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
