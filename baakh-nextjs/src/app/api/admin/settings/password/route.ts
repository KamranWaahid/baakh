import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@getSupabaseClient()/getSupabaseClient()-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Supabase not configured");
}

const getSupabaseClient() = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

// Change password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "User ID, current password, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if password contains required characters
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        { 
          error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        },
        { status: 400 }
      );
    }

    // Get user email for verification
    const { data: userData, error: userError } = await getSupabaseClient().auth.getSupabaseClient().getUserById(userId);
    if (userError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the current password matches the user's actual password
    const { error: verifyError } = await getSupabaseClient().auth.signInWithPassword({
      email: userData.user.email || '',
      password: currentPassword
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update password
    const { data: updateData, error: updateError } = await getSupabaseClient().auth.getSupabaseClient().updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log password change activity (optional)
    console.log(`Password changed for user ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: "Password updated successfully" 
    });

  } catch (error) {
    console.error("Error in POST /api/getSupabaseClient()/settings/password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify current password
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword } = body;

    if (!userId || !currentPassword) {
      return NextResponse.json(
        { error: "User ID and current password are required" },
        { status: 400 }
      );
    }

    // Get user email
    const { data: userData, error: userError } = await getSupabaseClient().auth.getSupabaseClient().getUserById(userId);
    if (userError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const { error: verifyError } = await getSupabaseClient().auth.signInWithPassword({
      email: userData.user.email || '',
      password: currentPassword
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Current password verified" 
    });

  } catch (error) {
    console.error("Error in PUT /api/getSupabaseClient()/settings/password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
