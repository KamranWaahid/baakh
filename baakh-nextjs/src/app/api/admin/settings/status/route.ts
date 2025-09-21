import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client function to avoid build-time errors
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase not configured");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });
}

// Check if production database is accessible
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    // Test if we can access the admin_settings table
    const { data, error } = await supabase
      .from("admin_settings")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === '42501') {
        return NextResponse.json({
          status: 'permission_denied',
          message: 'RLS permissions need to be fixed',
          production_ready: false,
          error: error.message,
          instructions: {
            title: 'Fix RLS Permissions',
            steps: [
              'Go to your Supabase Dashboard',
              'Navigate to SQL Editor',
              'Run the provided SQL script',
              'Test the endpoints again'
            ],
            sql: `-- Fix RLS permissions for admin_settings table
GRANT ALL ON admin_settings TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON admin_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON admin_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON admin_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON admin_settings;

-- Create policy for service role
CREATE POLICY "Service role can manage all settings" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Create user-specific policies
CREATE POLICY "Users can view their own settings" ON admin_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON admin_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON admin_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON admin_settings
  FOR DELETE USING (auth.uid() = user_id);`
          }
        });
      } else {
        return NextResponse.json({
          status: 'error',
          message: 'Database error',
          production_ready: false,
          error: error.message
        });
      }
    }

    // If we get here, the database is accessible
    return NextResponse.json({
      status: 'ready',
      message: 'Production database is accessible',
      production_ready: true,
      data: data
    });

  } catch (error) {
    console.error("Error checking database status:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database status',
      production_ready: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
