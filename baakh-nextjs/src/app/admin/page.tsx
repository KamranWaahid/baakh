"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Tag, 
  Eye,
  Calendar,
  Clock,
  ArrowUpRight,
  BarChart3,
  Activity,
  Target,
  Zap,
  Shield,
  FileText,
  Layers,
  Star,
  Plus,
  Loader2,
  Flag
} from "lucide-react";

interface AdminStats {
  totalPoets: number;
  totalPoetry: number;
  totalTags: number;
  totalCategories: number;
  totalCouplets: number;
  weeklyChanges: {
    poets: string;
    poetry: string;
    tags: string;
    views: string;
  };
  recentActivity: {
    poets: Array<{
      id: string;
      name: string;
      slug: string;
      created_at: string;
    }>;
    poetry: Array<{
      id: string;
      title: string;
      slug: string;
      created_at: string;
      poets: {
        name: string;
        slug: string;
      };
    }>;
    tags: Array<{
      id: string;
      label: string;
      slug: string;
      created_at: string;
    }>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const AnimatedNumber = ({ value }: { value: number }) => {
    const ref = useRef<HTMLSpanElement | null>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mv = useMotionValue(0);
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (isInView) {
        const controls = animate(mv, value, { duration: 0.8, ease: "easeOut",
          onUpdate: (latest) => setDisplay(Math.round(latest))
        });
        return () => controls.stop();
      }
    }, [isInView, value]);
    return <span ref={ref}>{display.toLocaleString()}</span>;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
  } | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    database: { healthy: boolean; message: string };
    api: { healthy: boolean; message: string };
    storage: { healthy: boolean; message: string };
    timestamp: string;
  } | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load admin profile data
  const loadAdminProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData.user?.id) {
          // Get profile data from profiles table
          const profileResponse = await fetch(`/api/admin/settings/admin?userId=${userData.user.id}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.settings?.profile) {
              const profile = profileData.settings.profile;
              setAdminProfile({
                firstName: profile.firstName || 'Admin',
                lastName: profile.lastName || 'User',
                email: profile.email || userData.user.email || '',
                displayName: profile.firstName || 'Admin'
              });
            } else {
              // Fallback to display_name from profiles table
              setAdminProfile({
                firstName: userData.profile?.display_name?.split(' ')[0] || 'Admin',
                lastName: userData.profile?.display_name?.split(' ').slice(1).join(' ') || 'User',
                email: userData.user.email || '',
                displayName: userData.profile?.display_name?.split(' ')[0] || 'Admin'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
      // Set fallback values
      setAdminProfile({
        firstName: 'Admin',
        lastName: 'User',
        email: '',
        displayName: 'Admin'
      });
    }
  }, []);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchStats = useCallback(async () => {
    try {
      console.log('AdminDashboard: Fetching stats...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/stats', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      console.log('AdminDashboard: Stats fetched successfully:', data);
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('AdminDashboard: Component mounted, fetching stats...');
    loadAdminProfile();
    fetchStats();
    // Fetch system status (non-blocking)
    fetch('/api/admin/system-status', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('status fetch failed')))
      .then((data) => setSystemStatus(data))
      .catch(() => setSystemStatus(null));
  }, [loadAdminProfile, fetchStats]);

  // Hoisted helper so it's available before useMemo calls
  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = await res.json();
        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } catch {
        setSearchResults([]);
      }
    }, 250);
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const statsData = useMemo(() => {
    const calc = (s?: string): { change: string; changeType: 'positive' | 'negative' } => {
      const str = s || '+0%';
      const num = Number(str.replace('%', ''));
      return { change: str, changeType: num >= 0 ? 'positive' : 'negative' };
    };
    const poets = calc(stats?.weeklyChanges?.poets);
    const poetry = calc(stats?.weeklyChanges?.poetry);
    const tags = calc(stats?.weeklyChanges?.tags);
    // No couplets change provided in API; reuse poetry change as a proxy
    const couplets = calc(stats?.weeklyChanges?.poetry);
    return [
      {
        title: "Total Poets",
        value: stats?.totalPoets?.toLocaleString() || '0',
        change: poets.change,
        changeType: poets.changeType,
        icon: Users,
        description: "vs last 7 days",
        href: '/admin/poets'
      },
      {
        title: "Poetry Works",
        value: stats?.totalPoetry?.toLocaleString() || '0',
        change: poetry.change,
        changeType: poetry.changeType,
        icon: BookOpen,
        description: "vs last 7 days",
        href: '/admin/poetry'
      },
      {
        title: "Active Tags",
        value: stats?.totalTags?.toLocaleString() || '0',
        change: tags.change,
        changeType: tags.changeType,
        icon: Tag,
        description: "vs last 7 days",
        href: '/admin/tags'
      },
      {
        title: "Total Couplets",
        value: stats?.totalCouplets?.toLocaleString() || '0',
        change: couplets.change,
        changeType: couplets.changeType,
        icon: Eye,
        description: "vs last 7 days",
        href: '/admin/poetry/couplets'
      }
    ];
  }, [stats]);

  const recentActivityData = useMemo(() => [
    ...(stats?.recentActivity.poets || []).map(poet => ({
      id: `poet-${poet.id}`,
      type: "poet_added",
      title: "New poet added",
      description: `${poet.name} was added to the archive`,
      time: formatRelativeTime(poet.created_at),
      icon: Users,
      color: "#1F1F1F",
      href: `/admin/poets/${poet.id}`
    })),
    ...(stats?.recentActivity.poetry || []).map(poem => ({
      id: `poetry-${poem.id}`,
      type: "poetry_added",
      title: "Poetry added",
      description: `${poem.title} by ${poem.poets?.name || 'Unknown'} was added`,
      time: formatRelativeTime(poem.created_at),
      icon: BookOpen,
      color: "#6B6B6B",
      href: `/admin/poetry`
    })),
    ...(stats?.recentActivity.tags || []).map(tag => ({
      id: `tag-${tag.id}`,
      type: "tag_created",
      title: "New tag created",
      description: `Tag '${tag.label}' was created`,
      time: formatRelativeTime(tag.created_at),
      icon: Tag,
      color: "#1F1F1F",
      href: `/admin/tags`
    }))
  ].slice(0, 6), [stats]);

  const mockQuickActions = useMemo(() => [
    {
      title: "Add New Poet",
      description: "Create a new poet profile",
      icon: Users,
      href: "/admin/poets/create",
      color: "#1F1F1F"
    },
    {
      title: "Upload Poetry",
      description: "Add new poetry works",
      icon: BookOpen,
      href: "/admin/poetry/create",
      color: "#6B6B6B"
    },
    {
      title: "Manage Tags",
      description: "Organize poetry tags",
      icon: Tag,
      href: "/admin/tags",
      color: "#1F1F1F"
    },
    {
      title: "Manage Locations",
      description: "Manage countries, provinces, and cities",
      icon: Layers,
      href: "/admin/locations",
      color: "#3B82F6"
    },
    {
      title: "View Reports",
      description: "Review and manage user reports",
      icon: Flag,
      href: "/admin/reports",
      color: "#EF4444"
    },
    {
      title: "View Analytics",
      description: "Check performance metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "#6B6B6B"
    }
  ], []);

  console.log('AdminDashboard: Rendering with loading:', loading, 'error:', error, 'stats:', !!stats);

  // Loading state with skeletons
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9]">
          <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-7 w-56 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-20" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-3 border border-[#E5E5E5] rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-44" />
                            </div>
                            <Skeleton className="h-3 w-3 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 p-3">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-8">
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-14" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1F1F1F] mb-2">Error Loading Dashboard</h2>
            <p className="text-[#6B6B6B] mb-4">{error}</p>
            <Button onClick={fetchStats} className="bg-[#1F1F1F] hover:bg-[#404040]">
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
                  Welcome back, {adminProfile?.firstName || 'Admin'}
                </h1>
                <p className="text-[#6B6B6B] text-lg">
                  Here&apos;s what&apos;s happening with your poetry archive today
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                  <Input
                    placeholder="Search poets, poetry, tags..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-10">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="px-4 py-3 hover:bg-[#F4F4F5] cursor-pointer border-b border-[#E5E5E5] last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-[#1F1F1F]"></div>
                            <div>
                              <p className="font-medium text-[#1F1F1F]">{result.title}</p>
                              <p className="text-sm text-[#6B6B6B] capitalize">{result.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button className="bg-[#1F1F1F] hover:bg-[#404040] text-white px-6 py-2 rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Statistics Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => stat.href && router.push(stat.href)}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && stat.href) { e.preventDefault(); router.push(stat.href); } }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 * index }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6B6B6B] mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-[#1F1F1F] mb-1">
                          <AnimatedNumber value={Number(String(stat.value).replace(/,/g, ''))} />
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            stat.changeType === 'positive' ? 'text-[#1F1F1F]' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">{stat.description}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#6B6B6B]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions & Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }}>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-[#1F1F1F]" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-sm text-[#6B6B6B]">
                      Common tasks to get you started
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockQuickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <div
                            key={index}
                            className="p-3 border border-[#E5E5E5] rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer group"
                            role="button"
                            tabIndex={0}
                            onClick={() => router.push(action.href)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(action.href); } }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                                <Icon className="w-4 h-4 text-[#6B6B6B]" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-[#1F1F1F] group-hover:text-[#404040] transition-colors">
                                  {action.title}
                                </h3>
                                <p className="text-xs text-[#6B6B6B]">{action.description}</p>
                              </div>
                              <ArrowUpRight className="w-3 h-3 text-[#6B6B6B] group-hover:text-[#1F1F1F] transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-[#6B6B6B]">
                      Latest updates from your poetry archive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    {recentActivityData.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivityData.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div
                              key={activity.id}
                              className="flex items-start space-x-4 p-3 hover:bg-[#F4F4F5] rounded-lg transition-colors cursor-pointer"
                              role="button"
                              tabIndex={0}
                              onClick={() => activity.href && router.push(activity.href)}
                              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && activity.href) { e.preventDefault(); router.push(activity.href); } }}
                            >
                              <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4" style={{ color: activity.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#1F1F1F]">{activity.title}</p>
                                <p className="text-sm text-[#6B6B6B]">{activity.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-[#6B6B6B] flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>{activity.time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[#6B6B6B]">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-[#E5E5E5]" />
                        <p>No recent activity</p>
                      </div>
                    )}
                    <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                      <Button variant="outline" className="w-full border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] rounded-lg">
                        View All Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - System Status & Quick Stats */}
            <div className="space-y-8">
              {/* System Status */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }}>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${systemStatus?.database?.healthy ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span className="text-sm font-medium text-[#1F1F1F]">Database</span>
                      </div>
                      <Badge className={`${systemStatus?.database?.healthy ? 'bg-[#1F1F1F] text-white' : 'bg-red-600 text-white'} text-xs`}>
                        {systemStatus?.database?.healthy ? 'Healthy' : 'Down'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${systemStatus?.api?.healthy ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span className="text-sm font-medium text-[#1F1F1F]">API</span>
                      </div>
                      <Badge className={`${systemStatus?.api?.healthy ? 'bg-[#1F1F1F] text-white' : 'bg-red-600 text-white'} text-xs`}>
                        {systemStatus?.api?.healthy ? 'Online' : 'Down'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${systemStatus?.storage?.healthy ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span className="text-sm font-medium text-[#1F1F1F]">Storage</span>
                      </div>
                      <Badge className={`${systemStatus?.storage?.healthy ? 'bg-[#1F1F1F] text-white' : 'bg-red-600 text-white'} text-xs`}>
                        {systemStatus?.storage?.healthy ? 'Healthy' : 'Down'}
                      </Badge>
                    </div>
                    {systemStatus?.timestamp && (
                      <p className="text-[11px] text-[#6B6B6B] text-right">Updated {new Date(systemStatus.timestamp).toLocaleTimeString()}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
                <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6B6B]">New Poets</span>
                      <span className="font-medium text-[#1F1F1F]">
                        +{stats?.recentActivity.poets.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6B6B]">Poetry Added</span>
                      <span className="font-medium text-[#1F1F1F]">
                        +{stats?.recentActivity.poetry.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6B6B]">New Tags</span>
                      <span className="font-medium text-[#1F1F1F]">
                        +{stats?.recentActivity.tags.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6B6B]">New Categories</span>
                      <span className="font-medium text-[#1F1F1F]">
                        +{(stats?.recentActivity as Record<string, unknown>)?.categories?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Links */}
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-3">
                  <Button variant="ghost" className="w-full justify-start p-3 hover:bg-[#F4F4F5] text-[#1F1F1F] rounded-lg">
                    <FileText className="w-4 h-4 mr-3 text-[#6B6B6B]" />
                    Poetry Management
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 hover:bg-[#F4F4F5] text-[#1F1F1F] rounded-lg">
                    <Users className="w-4 h-4 mr-3 text-[#6B6B6B]" />
                    Poet Profiles
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 hover:bg-[#F4F4F5] text-[#1F1F1F] rounded-lg">
                    <Layers className="w-4 h-4 mr-3 text-[#6B6B6B]" />
                    Categories
                  </Button>
                  <Button variant="ghost" className="w-full justify-start p-3 hover:bg-[#F4F4F5] text-[#1F1F1F] rounded-lg">
                    <Tag className="w-4 h-4 mr-3 text-[#6B6B6B]" />
                    Tags & Topics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 