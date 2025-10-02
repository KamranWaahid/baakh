export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poetSlug } = await params;
    
    console.log('Mock poet stats API - Poet slug:', poetSlug);
    
    // Mock stats data - Qazi Qadan specific
    const isQaziQadan = poetSlug === 'qazi-qadan';
    
    const stats = isQaziQadan ? {
      poetry: 25,
      couplets: 120,
      categories: 3
    } : {
      poetry: 15,
      couplets: 45,
      categories: 2
    };
    
    console.log('Mock poet stats for', poetSlug, ':', stats);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Mock poet stats API error:', error);
    return NextResponse.json({ 
      poetry: 0, 
      couplets: 0, 
      categories: 0 
    });
  }
}
