import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client function to avoid build-time errors
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn('Supabase not configured, using mock client');
    // Return a mock client that won't crash during build
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        })
      }),
      auth: {
        admin: {
          getUserById: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
        }
      }
    } as any;
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });
}

// GET supabase settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const section = searchParams.get("section");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get supabase settings from database
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching supabase settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user profile information from profiles table
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

    // If no settings found, return default settings with profile data
    if (!settings) {
      const defaultSettings = {
        profile: {
          firstName: firstName || "Admin",
          lastName: lastName || "User",
          email: authUser?.user?.email || profile?.email || "",
          phone: "",
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

      return NextResponse.json({ settings: defaultSettings });
    }

    // Parse settings JSON and merge with profile data
    const parsedSettings = {
      profile: {
        firstName: firstName || settings.profile_settings?.firstName || "Admin",
        lastName: lastName || settings.profile_settings?.lastName || "User",
        email: authUser?.user?.email || profile?.email || settings.profile_settings?.email || "",
        phone: settings.profile_settings?.phone || "",
        avatar: profile?.avatar_url || settings.profile_settings?.avatar || "",
        bio: settings.profile_settings?.bio || "System administrator for Baakh poetry archive"
      },
      security: settings.security_settings || {
        twoFactorEnabled: false,
        sessionTimeout: "30",
        loginNotifications: true
      },
      notifications: settings.notification_settings || {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        weeklyReports: true,
        systemAlerts: true,
        userActivity: false
      },
      system: settings.system_settings || {
        language: "en",
        timezone: "Asia/Karachi",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        theme: "light",
        autoBackup: true,
        backupFrequency: "daily"
      }
    };

    // Return specific section if requested
    if (section && parsedSettings[section as keyof typeof parsedSettings]) {
      return NextResponse.json({ 
        settings: { [section]: parsedSettings[section as keyof typeof parsedSettings] }
      });
    }

    return NextResponse.json({ settings: parsedSettings });

  } catch (error) {
    console.error("Error in GET /api/supabase/settings/supabase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT supabase settings
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();
    const { userId, section, data } = body;

    if (!userId || !section || !data) {
      return NextResponse.json(
        { error: "User ID, section, and data are required" },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = ["profile", "security", "notifications", "system"];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: "Invalid section. Must be one of: profile, security, notifications, system" },
        { status: 400 }
      );
    }

    // Check if settings exist for this supabase user
    const { data: existingSettings, error: fetchError } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing supabase settings:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const settingsColumn = `${section}_settings`;
    const updateData = {
      user_id: userId,
      [settingsColumn]: data,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingSettings) {
      // Update existing settings
      const { data: updatedSettings, error: updateError } = await supabase
        .from("admin_settings")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating supabase settings:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      result = updatedSettings;
    } else {
      // Create new settings
      const { data: newSettings, error: insertError } = await supabase
        .from("admin_settings")
        .insert({
          user_id: userId,
          [settingsColumn]: data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating supabase settings:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      result = newSettings;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${section} settings updated successfully`,
      settings: result
    });

  } catch (error) {
    console.error("Error in POST /api/supabase/settings/supabase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
