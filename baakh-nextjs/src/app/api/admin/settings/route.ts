export const runtime = 'edge'
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
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            })
          })
        })
      })
    } as any;
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });
}

// GET settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const section = searchParams.get("section");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user settings from database using RPC to bypass RLS
    const { data: settings, error } = await supabase.rpc('get_admin_settings', {
      user_id: userId
    });

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no settings found, return default settings
    if (!settings) {
      const defaultSettings = {
        profile: {
          firstName: "Admin",
          lastName: "User",
          email: "",
          phone: "",
          avatar: "",
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

    // Parse settings JSON
    const parsedSettings = {
      profile: settings.profile_settings || {},
      security: settings.security_settings || {},
      notifications: settings.notification_settings || {},
      system: settings.system_settings || {}
    };

    // Return specific section if requested
    if (section && parsedSettings[section as keyof typeof parsedSettings]) {
      return NextResponse.json({ 
        settings: { [section]: parsedSettings[section as keyof typeof parsedSettings] }
      });
    }

    return NextResponse.json({ settings: parsedSettings });

  } catch (error) {
    console.error("Error in GET /api/supabase/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT settings
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

    // Check if settings exist for this user
    const { data: existingSettings, error: fetchError } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing settings:", fetchError);
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
        console.error("Error updating settings:", updateError);
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
        console.error("Error creating settings:", insertError);
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
    console.error("Error in POST /api/supabase/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE settings (reset to defaults)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const section = searchParams.get("section");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (section) {
      // Reset specific section to defaults
      const defaultSettings = {
        profile: {
          firstName: "Admin",
          lastName: "User",
          email: "",
          phone: "",
          avatar: "",
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

      const settingsColumn = `${section}_settings`;
      const { error } = await supabase
        .from("admin_settings")
        .update({
          [settingsColumn]: defaultSettings[section as keyof typeof defaultSettings],
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error resetting settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `${section} settings reset to defaults`
      });
    } else {
      // Delete all settings for user
      const { error } = await supabase
        .from("admin_settings")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "All settings deleted successfully"
      });
    }

  } catch (error) {
    console.error("Error in DELETE /api/supabase/settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
