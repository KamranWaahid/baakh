import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poetIds = searchParams.get('poetIds');
    
    if (!poetIds) {
      return NextResponse.json({ error: 'Poet IDs are required' }, { status: 400 });
    }

    const poetIdArray = poetIds.split(',');
    
    // For now, return mock data. In production, you would query your database
    // to get real view counts and poetry counts for each poet
    const stats = poetIdArray.map(poetId => ({
      poet_id: poetId,
      total_views: Math.floor(Math.random() * 1000) + 100, // Mock views count
      poetry_count: Math.floor(Math.random() * 50) + 5     // Mock poetry count
    }));

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching poet stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
