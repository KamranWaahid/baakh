import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@getSupabaseClient()/getSupabaseClient()-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to hash IP address for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.CSRF_SECRET).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, comment, locale } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Invalid rating. Must be between 1 and 5.' 
      }, { status: 400 });
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // Hash the IP for privacy
    const ipHash = hashIP(ip);

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here') {
      console.warn('Supabase not configured - feedback not saved');
      return NextResponse.json({ 
        success: true,
        message: 'Feedback received (not saved - database not configured)'
      });
    }

    // Insert feedback into database
    const { data, error } = await getSupabaseClient()
      .from('feedback')
      .insert({
        rating: parseInt(rating),
        comment: comment || null,
        ip_hash: ipHash
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      
      // If table doesn't exist, provide helpful message
      if (error.code === 'PGRST116' || error.message.includes('permission denied for table feedback')) {
        return NextResponse.json({ 
          error: 'Feedback table not found',
          message: 'Please create the feedback table in your Supabase database. See QUICK_FEEDBACK_SETUP.md for instructions.',
          details: 'The feedback table needs to be created manually in Supabase SQL Editor'
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save feedback',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Feedback saved successfully:', { id: data.id, rating, locale });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      id: data.id
    });

  } catch (error) {
    console.error('Feedback API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here') {
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure Supabase environment variables'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const checkSubmitted = searchParams.get('check_submitted');
    
    // If checking if feedback was submitted for this IP
    if (checkSubmitted === 'true') {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 
                 request.headers.get('x-real-ip') || 
                 '127.0.0.1';
      
      const ipHash = hashIP(ip);
      
      const { data: existingFeedback, error } = await getSupabaseClient()
        .from('feedback')
        .select('id')
        .eq('ip_hash', ipHash)
        .limit(1);

      if (error) {
        console.error('Error checking existing feedback:', error);
        return NextResponse.json({ 
          error: 'Failed to check feedback status',
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        hasSubmitted: existingFeedback && existingFeedback.length > 0
      });
    }

    // Regular feedback fetching
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch feedback with pagination
    const { data: feedback, error, count } = await getSupabaseClient()
      .from('feedback')
      .select('id, rating, comment, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch feedback',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      feedback: feedback || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Feedback GET API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
