export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { romanizeTextToSlug } from '../../../../../../lib/romanizer-utils';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input. Please provide a text string.' 
      }, { status: 400 });
    }

    // Generate romanized slug
    const slug = await romanizeTextToSlug(text);

    return NextResponse.json({
      success: true,
      originalText: text,
      slug: slug,
      message: 'Slug generated successfully'
    });

  } catch (error) {
    console.error('Slug generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during slug generation' 
    }, { status: 500 });
  }
}
