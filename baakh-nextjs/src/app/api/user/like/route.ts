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
    const supabase = createClient(
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

    // Insert the like record
    const { data, error } = await getSupabaseClient()
      .from('e2ee_user_data')
      .insert({
        type: 'like',
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
        { error: 'Failed to create like' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      likeId: data.record_id,
      message: 'Like created successfully'
    });

  } catch (error) {
    console.error('Like creation error:', error);
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
    const supabase = createClient(
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

    // Delete the like record
    const { error } = await getSupabaseClient()
      .from('e2ee_user_data')
      .delete()
      .eq('type', 'like')
      .eq('target_id', targetId)
      .eq('target_type', targetType);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to remove like' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Like removed successfully'
    });

  } catch (error) {
    console.error('Like removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
