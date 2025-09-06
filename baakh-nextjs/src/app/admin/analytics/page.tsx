"use client";

import { useState } from "react";

import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  RefreshCw
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = [
    { title: "Total Views", value: "12,847", change: "+12%", icon: Eye, trend: "up" },
    { title: "Total Users", value: "2,847", change: "+8%", icon: Users, trend: "up" },
    { title: "Total Content", value: "1,234", change: "+23%", icon: BookOpen, trend: "up" },
    { title: "Avg. Session", value: "4m 32s", change: "+5%", icon: Clock, trend: "up" }
  ];

  const topPoets = [
    { name: "Shah Abdul Latif", reads: 8200, change: "+15%", trend: "up" },
    { name: "Sachal Sarmast", reads: 6400, change: "+8%", trend: "up" },
    { name: "Bedil", reads: 5200, change: "-3%", trend: "down" },
    { name: "Makhdoom Bilawal", reads: 4800, change: "+12%", trend: "up" },
    { name: "Qadir Bux Bedil", reads: 4200, change: "+6%", trend: "up" }
  ];

  const trendingTags = [
    { tag: "Sufi", change: "+12%", count: 156 },
    { tag: "Mysticism", change: "+9%", count: 89 },
    { tag: "Romance", change: "+6%", count: 234 },
    { tag: "Wisdom", change: "+4%", count: 67 },
    { tag: "Nature", change: "+18%", count: 123 }
  ];

  const recentActivity = [
    { action: "New user registered", time: "2 minutes ago", type: "user" },
    { action: "Poetry shared on social", time: "5 minutes ago", type: "social" },
    { action: "New comment added", time: "12 minutes ago", type: "engagement" },
    { action: "Poet profile viewed", time: "18 minutes ago", type: "view" },
    { action: "Search performed", time: "25 minutes ago", type: "search" }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting analytics data...');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics & Insights
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Performance Insights</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Track traffic, engagement, and reading trends across your poetry archive. 
                  Monitor user behavior and content performance.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-4 rounded-lg"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

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
          {metrics.map((m) => {
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
          })}
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
                          {poet.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                          {tag.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
    </AdminLayout>
  );
}


