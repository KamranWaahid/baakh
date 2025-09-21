"use client";

import { useState, useEffect, useMemo } from "react";

import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Activity,
  Tag,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Zap,
  TrendingDown,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

// Types for analytics data
interface AnalyticsMetrics {
  totalViews: number;
  totalUsers: number;
  totalContent: number;
  avgSession: string;
  viewsChange: number;
  usersChange: number;
  contentChange: number;
  sessionChange: number;
}

interface TopPoet {
  name: string;
  reads: number;
  change: number;
  trend: "up" | "down";
}

interface TrendingTag {
  tag: string;
  change: number;
  count: number;
}

interface RecentActivity {
  action: string;
  time: string;
  type: "user" | "social" | "engagement" | "view" | "search";
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics data state
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [topPoets, setTopPoets] = useState<TopPoet[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      // Set the fetched data
      setMetrics(data.metrics || null);
      setTopPoets(data.topPoets || []);
      setTrendingTags(data.trendingTags || []);
      setRecentActivity(data.recentActivity || []);
      setChartData(data.chartData || null);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      
      // Set fallback data for demo purposes
      setMetrics({
        totalViews: 12847,
        totalUsers: 2847,
        totalContent: 1234,
        avgSession: "4m 32s",
        viewsChange: 12,
        usersChange: 8,
        contentChange: 23,
        sessionChange: 5
      });
      
      setTopPoets([
        { name: "Shah Abdul Latif", reads: 8200, change: 15, trend: "up" },
        { name: "Sachal Sarmast", reads: 6400, change: 8, trend: "up" },
        { name: "Bedil", reads: 5200, change: -3, trend: "down" },
        { name: "Makhdoom Bilawal", reads: 4800, change: 12, trend: "up" },
        { name: "Qadir Bux Bedil", reads: 4200, change: 6, trend: "up" }
      ]);
      
      setTrendingTags([
        { tag: "Sufi", change: 12, count: 156 },
        { tag: "Mysticism", change: 9, count: 89 },
        { tag: "Romance", change: 6, count: 234 },
        { tag: "Wisdom", change: 4, count: 67 },
        { tag: "Nature", change: 18, count: 123 }
      ]);
      
      setRecentActivity([
        { action: "New user registered", time: "2 minutes ago", type: "user" },
        { action: "Poetry shared on social", time: "5 minutes ago", type: "social" },
        { action: "New comment added", time: "12 minutes ago", type: "engagement" },
        { action: "Poet profile viewed", time: "18 minutes ago", type: "view" },
        { action: "Search performed", time: "25 minutes ago", type: "search" }
      ]);
      
      // Generate sample chart data
      const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
      const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      setChartData({
        labels,
        datasets: [
          {
            label: "Views",
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 500),
            borderColor: "#1F1F1F",
            backgroundColor: "rgba(31, 31, 31, 0.1)"
          }
        ]
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [range]);

  const getTrendIcon = (trend: "up" | "down") => {
    if (trend === "up") {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (trend: "up" | "down") => {
    if (trend === "up") {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const formatChange = (change: number) => {
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData();
    setIsRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${range}`);
      if (!response.ok) {
        throw new Error('Failed to export analytics data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${range}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Analytics data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export analytics data');
    }
  };

  // Memoized metrics for display
  const displayMetrics = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { 
        title: "Total Views", 
        value: metrics.totalViews.toLocaleString(), 
        change: formatChange(metrics.viewsChange), 
        icon: Eye, 
        trend: (metrics.viewsChange >= 0 ? "up" : "down") as "up" | "down"
      },
      { 
        title: "Total Users", 
        value: metrics.totalUsers.toLocaleString(), 
        change: formatChange(metrics.usersChange), 
        icon: Users, 
        trend: (metrics.usersChange >= 0 ? "up" : "down") as "up" | "down"
      },
      { 
        title: "Total Content", 
        value: metrics.totalContent.toLocaleString(), 
        change: formatChange(metrics.contentChange), 
        icon: BookOpen, 
        trend: (metrics.contentChange >= 0 ? "up" : "down") as "up" | "down"
      },
      { 
        title: "Avg. Session", 
        value: metrics.avgSession, 
        change: formatChange(metrics.sessionChange), 
        icon: Clock, 
        trend: (metrics.sessionChange >= 0 ? "up" : "down") as "up" | "down"
      }
    ];
  }, [metrics]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Performance Insights"
          subtitle="Analytics & Insights"
          subtitleIcon={<BarChart3 className="w-4 h-4" />}
          description="Track traffic, engagement, and reading trends across your poetry archive. Monitor user behavior and content performance."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button 
                variant="outline" 
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="h-10 px-6 rounded-lg bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-10 w-[160px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-6 rounded-lg">
              <Calendar className="w-4 h-4 mr-2" /> 
              Custom Range
            </Button>
          </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24 bg-[#F4F4F5]" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-20 bg-[#F4F4F5]" />
                        <Skeleton className="h-4 w-12 bg-[#F4F4F5]" />
                      </div>
                    </div>
                    <Skeleton className="w-12 h-12 bg-[#F4F4F5] rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full">
              <Card className="bg-white border-red-200 rounded-lg shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-red-600 mb-2">
                    <AlertCircle className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-red-600 font-medium">Failed to load analytics data</p>
                  <p className="text-sm text-gray-600 mt-1">{error}</p>
                  <Button 
                    onClick={handleRefresh}
                    variant="outline"
                    className="mt-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            displayMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.title} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-[#6B6B6B] font-medium">{m.title}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-[#1F1F1F]">{m.value}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(m.trend)}
                            <span className={`text-sm font-medium ${getTrendColor(m.trend)}`}>
                              {m.change}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#1F1F1F]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Charts and Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Poets Performance */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-[#1F1F1F]">Top Performing Poets</CardTitle>
                    <CardDescription className="text-[#6B6B6B]">
                      Most read poets in the last {range === "7d" ? "7 days" : range === "30d" ? "30 days" : range === "90d" ? "90 days" : "year"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Performance
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-[#F9F9F9]">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-8 h-8 bg-[#F4F4F5] rounded-lg" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32 bg-[#F4F4F5]" />
                            <Skeleton className="h-3 w-20 bg-[#F4F4F5]" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-12 bg-[#F4F4F5]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topPoets.map((poet, index) => (
                      <div key={poet.name} className="flex items-center justify-between p-4 rounded-lg bg-[#F9F9F9] hover:bg-[#F4F4F5] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center text-sm font-bold text-[#1F1F1F]">
                            {index + 1}
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-[#1F1F1F]">{poet.name}</p>
                            <p className="text-sm text-[#6B6B6B]">
                              {poet.reads.toLocaleString()} reads
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(poet.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(poet.trend)}`}>
                            {formatChange(poet.change)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trending Tags */}
          <div>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F]">Trending Tags</CardTitle>
                  <CardDescription className="text-[#6B6B6B]">
                    Most popular poetry themes and topics
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#F9F9F9]">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4 bg-[#F4F4F5]" />
                          <div>
                            <Skeleton className="h-4 w-20 bg-[#F4F4F5] mb-1" />
                            <Skeleton className="h-3 w-16 bg-[#F4F4F5]" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-8 bg-[#F4F4F5]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingTags.map((tag) => (
                      <div key={tag.tag} className="flex items-center justify-between p-3 rounded-lg bg-[#F9F9F9] hover:bg-[#F4F4F5] transition-colors">
                        <div className="flex items-center gap-3">
                          <Tag className="w-4 h-4 text-[#6B6B6B]" />
                          <div>
                            <p className="text-sm font-medium text-[#1F1F1F]">{tag.tag}</p>
                            <p className="text-xs text-[#6B6B6B]">
                              {tag.count} poems
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            {formatChange(tag.change)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F]">Recent Activity</CardTitle>
                  <CardDescription className="text-[#6B6B6B]">
                    Live updates from your poetry archive
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-4 p-4">
                      <Skeleton className="w-10 h-10 bg-[#F4F4F5] rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48 bg-[#F4F4F5]" />
                        <Skeleton className="h-3 w-24 bg-[#F4F4F5]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-[#E5E5E5]" aria-hidden />
                  <ul className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'user': return <Users className="w-4 h-4 text-blue-600" />;
                          case 'social': return <TrendingUp className="w-4 h-4 text-green-600" />;
                          case 'engagement': return <Tag className="w-4 h-4 text-purple-600" />;
                          case 'view': return <Eye className="w-4 h-4 text-orange-600" />;
                          case 'search': return <Target className="w-4 h-4 text-indigo-600" />;
                          default: return <Activity className="w-4 h-4 text-[#6B6B6B]" />;
                        }
                      };

                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case 'user': return 'bg-blue-500/10';
                          case 'social': return 'bg-green-500/10';
                          case 'engagement': return 'bg-purple-500/10';
                          case 'view': return 'bg-orange-500/10';
                          case 'search': return 'bg-indigo-500/10';
                          default: return 'bg-[#F4F4F5]';
                        }
                      };

                      return (
                        <li
                          key={index}
                          className="relative pl-12"
                        >
                          <div className="absolute left-4 top-2 w-4 h-4 rounded-full border-2 border-white bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#1F1F1F]" />
                          </div>
                          <div className="group flex items-start gap-4 rounded-xl p-4 hover:bg-[#F4F4F5] transition-all duration-200">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-base font-medium text-[#1F1F1F]">
                                {activity.action}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <div>
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardHeader className="pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-[#1F1F1F]">Performance Summary</CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Key insights and recommendations for your poetry archive
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-600">Strengths</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">Strong engagement with Sufi poetry content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">Growing user base with 8% monthly increase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">High session duration averaging 4m 32s</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-orange-600">Opportunities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">Expand content in Nature poetry category</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">Increase engagement with Bedil's poetry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-base text-[#1F1F1F]">Optimize mobile reading experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}


