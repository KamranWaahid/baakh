import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sindhiName, language } = await request.json()
    
    console.log('Received request:', { userId, sindhiName, language })
    
    if (!userId || !sindhiName) {
      console.error('Missing required fields:', { userId: !!userId, sindhiName: !!sindhiName })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate Sindhi name length
    if (sindhiName.trim().length < 2) {
      console.error('Sindhi name too short:', sindhiName)
      return NextResponse.json(
        { error: 'Sindhi name must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    console.log('Starting database operations...')
    
    // Update the e2ee_users table with the Sindhi name
    console.log('Updating e2ee_users table...')
    const { error: e2eeError } = await getSupabaseClient()
      .from('e2ee_users')
      .update({
        sindhi_name: sindhiName,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId) // Use user_id not id
    
    if (e2eeError) {
      console.error('Error updating e2ee_users table:', e2eeError)
      return NextResponse.json(
        { error: `Failed to update e2ee_users table: ${e2eeError.message}` },
        { status: 500 }
      )
    }
    
    console.log('Successfully updated e2ee_users table')
    
    // Also try to update the profiles table if it exists
    try {
      console.log('Attempting to update profiles table...')
      const { error: profileError } = await getSupabaseClient()
        .from('profiles')
        .upsert({
          id: userId,
          display_name: sindhiName, // Use display_name instead of sindhi_name
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.warn('Warning: Could not update profiles table:', profileError)
        // Don't fail the request if profiles table update fails
      } else {
        console.log('Successfully updated profiles table')
      }
    } catch (profileErr) {
      console.warn('Warning: Profiles table might not exist:', profileErr)
      // Don't fail the request if profiles table doesn't exist
    }
    
    console.log('All operations completed successfully')
    
    // Generate JWT token for automatic login
    const token = jwt.sign(
      {
        sub: userId,
        username: userId, // Using userId as username for now
        role: 'e2ee_user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      },
      process.env.SUPABASE_JWT_SECRET!,
      { algorithm: 'HS256' }
    )
    
    console.log('JWT token generated for user:', userId)
    
    return NextResponse.json({
      success: true,
      message: language === 'sd' ? 'سندي نالو محفوظ ٿي ويو' : 'Sindhi name saved successfully',
      sindhiName,
      token
    })
    
  } catch (error) {
    console.error('Error in save-sindhi-name API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
