import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Handle both single translation and array of translations
    const translationsData = Array.isArray(body) ? body : [body];

    // Validate required fields
    for (const translation of translationsData) {
      if (!translation.poetry_id || !translation.title || !translation.lang) {
        return NextResponse.json(
          { error: 'Missing required fields: poetry_id, title, or lang' },
          { status: 400 }
        );
      }
    }

    // Insert translations
    const { data, error } = await supabase
      .from('poetry_translations')
      .insert(translationsData)
      .select();

    if (error) {
      console.error('Error creating poetry translations:', error);
      return NextResponse.json(
        { error: 'Failed to create poetry translations' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in poetry translations POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const poetryId = searchParams.get('poetryId');
    const lang = searchParams.get('lang');

    let query = supabase
      .from('poetry_translations')
      .select('*');

    if (poetryId) {
      query = query.eq('poetry_id', poetryId);
    }

    if (lang) {
      query = query.eq('lang', lang);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching poetry translations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch poetry translations' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in poetry translations GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

