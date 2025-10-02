export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // In a real application, you would fetch data from your database
    // For now, we'll generate mock CSV data
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    
    // Generate CSV headers
    const headers = [
      'Date',
      'Views',
      'Users',
      'Content Views',
      'New Users',
      'Sessions',
      'Avg Session Duration'
    ];
    
    // Generate CSV data
    const csvRows = [headers.join(',')];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const views = Math.floor(Math.random() * 1000) + 500;
      const users = Math.floor(Math.random() * 200) + 100;
      const contentViews = Math.floor(Math.random() * 800) + 300;
      const newUsers = Math.floor(Math.random() * 50) + 20;
      const sessions = Math.floor(Math.random() * 300) + 150;
      const avgSession = `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`;
      
      csvRows.push([
        dateStr,
        views,
        users,
        contentViews,
        newUsers,
        sessions,
        avgSession
      ].join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${range}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
