import { NextRequest, NextResponse } from 'next/server';
import { romanizeTextFast } from '../../../../../../lib/romanizer-utils';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input. Please provide a text string.' 
      }, { status: 400 });
    }

    // Use fast local file-based romanization
    const result = romanizeTextFast(text);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Romanization error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during romanization' 
    }, { status: 500 });
  }
}
