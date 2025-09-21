import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@getSupabaseClient()/getSupabaseClient()-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetId, targetType, metadata } = body;
    
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Create Supabase client with user JWT
    const getSupabaseClient() = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Check if bookmark already exists
    const { data: existing } = await getSupabaseClient()
      .from('e2ee_user_data')
      .select('record_id')
      .eq('type', 'bookmark')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bookmark already exists' },
        { status: 409 }
      );
    }

    // Insert the bookmark record
    const { data, error } = await getSupabaseClient()
      .from('e2ee_user_data')
      .insert({
        type: 'bookmark',
        target_id: targetId,
        target_type: targetType,
        metadata_cipher: metadata.cipher,
        metadata_nonce: metadata.nonce,
        metadata_aad: metadata.aad
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmarkId: data.record_id,
      message: 'Bookmark created successfully'
    });

  } catch (error) {
    console.error('Bookmark creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    
    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: 'Missing targetId or targetType' },
        { status: 400 }
      );
    }

    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Create Supabase client with user JWT
    const getSupabaseClient() = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Delete the bookmark record
    const { error } = await getSupabaseClient()
      .from('e2ee_user_data')
      .delete()
      .eq('type', 'bookmark')
      .eq('target_id', targetId)
      .eq('target_type', targetType);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Bookmark removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Create Supabase client with user JWT
    const getSupabaseClient() = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Get user's bookmarks
    const { data: bookmarks, error } = await getSupabaseClient()
      .from('e2ee_user_data')
      .select('*')
      .eq('type', 'bookmark')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks || []
    });

  } catch (error) {
    console.error('Bookmark fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
