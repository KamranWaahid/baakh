import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // In a real application, you would fetch data from your database
    // For now, we'll return mock data based on the range
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    
    // Generate mock analytics data
    const metrics = {
      totalViews: Math.floor(Math.random() * 50000) + 10000,
      totalUsers: Math.floor(Math.random() * 10000) + 2000,
      totalContent: Math.floor(Math.random() * 5000) + 1000,
      avgSession: "4m 32s",
      viewsChange: Math.floor(Math.random() * 30) - 10,
      usersChange: Math.floor(Math.random() * 20) - 5,
      contentChange: Math.floor(Math.random() * 40) - 10,
      sessionChange: Math.floor(Math.random() * 15) - 5
    };

    const topPoets = [
      { name: "Shah Abdul Latif", reads: Math.floor(Math.random() * 10000) + 5000, change: Math.floor(Math.random() * 30) - 5, trend: "up" as const },
      { name: "Sachal Sarmast", reads: Math.floor(Math.random() * 8000) + 4000, change: Math.floor(Math.random() * 25) - 5, trend: "up" as const },
      { name: "Bedil", reads: Math.floor(Math.random() * 6000) + 3000, change: Math.floor(Math.random() * 20) - 10, trend: Math.random() > 0.5 ? "up" as const : "down" as const },
      { name: "Makhdoom Bilawal", reads: Math.floor(Math.random() * 5000) + 2000, change: Math.floor(Math.random() * 25) - 5, trend: "up" as const },
      { name: "Qadir Bux Bedil", reads: Math.floor(Math.random() * 4000) + 2000, change: Math.floor(Math.random() * 20) - 5, trend: "up" as const }
    ];

    const trendingTags = [
      { tag: "Sufi", change: Math.floor(Math.random() * 20) + 5, count: Math.floor(Math.random() * 200) + 100 },
      { tag: "Mysticism", change: Math.floor(Math.random() * 15) + 5, count: Math.floor(Math.random() * 150) + 50 },
      { tag: "Romance", change: Math.floor(Math.random() * 10) + 5, count: Math.floor(Math.random() * 300) + 100 },
      { tag: "Wisdom", change: Math.floor(Math.random() * 8) + 2, count: Math.floor(Math.random() * 100) + 50 },
      { tag: "Nature", change: Math.floor(Math.random() * 25) + 10, count: Math.floor(Math.random() * 150) + 80 }
    ];

    const recentActivity = [
      { action: "New user registered", time: "2 minutes ago", type: "user" as const },
      { action: "Poetry shared on social", time: "5 minutes ago", type: "social" as const },
      { action: "New comment added", time: "12 minutes ago", type: "engagement" as const },
      { action: "Poet profile viewed", time: "18 minutes ago", type: "view" as const },
      { action: "Search performed", time: "25 minutes ago", type: "search" as const }
    ];

    // Generate chart data
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: "Views",
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 500),
          borderColor: "#1F1F1F",
          backgroundColor: "rgba(31, 31, 31, 0.1)"
        }
      ]
    };

    return NextResponse.json({
      metrics,
      topPoets,
      trendingTags,
      recentActivity,
      chartData
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
