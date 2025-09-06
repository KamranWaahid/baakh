import { NextRequest, NextResponse } from 'next/server';
import { correctHesudharFast } from '../../../../../../lib/hesudhar-utils';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input. Please provide a text string.' 
      }, { status: 400 });
    }

    // Use fast local file-based correction
    const result = correctHesudharFast(text);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Hesudhar correction error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during hesudhar correction' 
    }, { status: 500 });
  }
}
