"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Filter, 
  Calendar, 
  BookOpen, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  FileText,
  User,
  Tag,
  Globe,
  MoreHorizontal,
  PlusCircle,
  Quote
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/layouts/AdminLayout";

interface CoupletItem {
  id: number;
  couplet_text: string;
  couplet_slug: string;
  couplet_tags: string;
  lang: string;
  created_at: string;
  poetry_main?: {
    id: string;
    poetry_slug: string;
    poetry_tags: string;
    visibility: boolean;
    is_featured: boolean;
  } | null;
  poets?: {
    poet_id: number;
    poet_slug: string;
    sindhi_name: string;
    english_name: string;
  } | null;
  categories?: {
    id: number;
    slug: string;
  } | null;
}

interface CoupletResponse {
  couplets: CoupletItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const COUPLETS_PER_PAGE = 10;

export default function AdminCoupletsListPage() {
  const router = useRouter();
  const [items, setItems] = useState<CoupletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'couplet_slug' | 'lang'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'sd' | 'en'>('all');

  // Calculate counts for stats cards
  const totalCouplets = total;
  const sindhiCouplets = items.filter(item => item.lang === 'sd').length;
  const englishCouplets = items.filter(item => item.lang === 'en').length;
  const totalPoetry = items.reduce((sum, item) => sum + (item.poetry_main ? 1 : 0), 0);

  const fetchCouplets = useCallback(async (page: number = 1, search: string = "", reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      if (reset) {
        setCurrentPage(1);
        page = 1;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: COUPLETS_PER_PAGE.toString(),
        search: search,
        lang: filterLanguage !== 'all' ? filterLanguage : '',
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const response = await fetch(`/api/admin/poetry/couplets?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch couplets');
      }

      const data: CoupletResponse = await response.json();
      setItems(data.couplets);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      console.error('Error fetching couplets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch couplets');
    } finally {
      setLoading(false);
    }
  }, [filterLanguage, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchCouplets(1, searchTerm, true);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm, fetchCouplets]);

  // Fetch data when filters change
  useEffect(() => {
    fetchCouplets(1, searchTerm, true);
  }, [filterLanguage, sortBy, sortOrder, fetchCouplets]);

  const handlePageChange = (page: number) => {
    fetchCouplets(page, searchTerm);
  };

  // Group duplicate couplets (sd/en) into a single row with combined language tags
  const groupedItems = useMemo(() => {
    const groups: Record<string, {
      base: CoupletItem;
      langs: Set<string>;
      textsByLang: Record<string, string>;
    }> = {};
    for (const it of items) {
      const key = `${it.poetry_main?.id || 'x'}::${it.couplet_slug}`;
      if (!groups[key]) {
        groups[key] = { base: it, langs: new Set(), textsByLang: {} };
      }
      groups[key].langs.add(it.lang);
      groups[key].textsByLang[it.lang] = it.couplet_text;
      // Prefer filling missing base poet/category/poetry if any are null
      if (!groups[key].base.poets && it.poets) groups[key].base.poets = it.poets;
      if (!groups[key].base.categories && it.categories) groups[key].base.categories = it.categories;
      if (!groups[key].base.poetry_main && it.poetry_main) groups[key].base.poetry_main = it.poetry_main;
    }
    return Object.values(groups).map(g => {
      const hasSd = g.langs.has('sd');
      const displayText = hasSd ? (g.textsByLang['sd'] || g.base.couplet_text) : (g.textsByLang['en'] || g.base.couplet_text);
      return {
        ...g.base,
        couplet_text: displayText,
        _languages: Array.from(g.langs).sort(),
      } as CoupletItem & { _languages: string[] };
    });
  }, [items]);

  const handleToggleVisibility = async (poetryId: string) => {
    try {
      const response = await fetch(`/api/admin/poetry/${poetryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility: !items.find(item => item.poetry_main?.id === poetryId)?.poetry_main?.visibility
        }),
      });

      if (response.ok) {
        // Refresh the data
        fetchCouplets(currentPage, searchTerm);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleToggleFeatured = async (poetryId: string) => {
    try {
      const response = await fetch(`/api/admin/poetry/${poetryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_featured: !items.find(item => item.poetry_main?.id === poetryId)?.poetry_main?.is_featured
        }),
      });

      if (response.ok) {
        // Refresh the data
        fetchCouplets(currentPage, searchTerm);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const getLanguageBadge = (lang: string) => {
    const colors = {
      'sd': 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      'en': 'bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
      'ur': 'bg-purple-500/20 text-purple-600 border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      'ar': 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    };
    return colors[lang as keyof typeof colors] || colors['sd'];
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Couplets</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchCouplets(1, searchTerm, true)}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <Quote className="w-4 h-4 mr-2" />
                  Couplets Management
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Couplets Management</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Manage and view all couplets in the system with comprehensive tools
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">Total Couplets</p>
                  <p className="text-2xl font-semibold text-[#1F1F1F]">{totalCouplets}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <Quote className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">Sindhi Couplets</p>
                  <p className="text-2xl font-semibold text-[#1F1F1F]">{sindhiCouplets}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">English Couplets</p>
                  <p className="text-2xl font-semibold text-[#1F1F1F]">{englishCouplets}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">Total Poetry</p>
                  <p className="text-2xl font-semibold text-[#1F1F1F]">{totalPoetry}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                  <Input
                    placeholder="Search couplets by text, slug, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 rounded-lg border-[#E5E5E5] bg-white text-[#1F1F1F] placeholder:text-[#6B6B6B] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-3">
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value as 'all' | 'sd' | 'en')}
                    className="px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F] focus:border-[#1F1F1F]"
                  >
                    <option value="all">All Languages</option>
                    <option value="sd">Sindhi</option>
                    <option value="en">English</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created_at' | 'couplet_slug' | 'lang')}
                    className="px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg bg-white text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F] focus:border-[#1F1F1F]"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="couplet_slug">Slug</option>
                    <option value="lang">Language</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="h-10 w-10 p-0 border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mt-3">
                <Filter className="w-4 h-4" />
                <span>Showing {items.length} of {total} couplets</span>
                {searchTerm && <span>• Filtered by &quot;{searchTerm}&quot;</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Couplets Table */}
        <div className="space-y-4">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1F1F1F]">Couplets List</CardTitle>
                <Button
                  onClick={() => router.push('/admin/poetry/couplets/create')}
                  className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-4 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Couplet
                </Button>
              </div>
              <CardDescription className="text-[#6B6B6B]">
                Manage and view all couplets in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`skeleton-row-${i}`} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <Quote className="w-12 h-12 text-[#6B6B6B] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F1F1F] mb-2">No couplets found</h3>
                  <p className="text-[#6B6B6B] mb-4">
                    {searchTerm ? `No couplets match "${searchTerm}"` : 'Get started by adding your first couplet'}
                  </p>
                  <Button asChild>
                    <Link href="/admin/poetry/couplets/create">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Couplet
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Couplet</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Poetry</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Poet</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Category</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Language</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Created</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[#1F1F1F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems.map((item) => (
                        <tr key={item.id} className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors">
                          <td className="px-4 py-3">
                            <div className="space-y-3">
                              {/* Couplet Text - Minimal */}
                              <div className={`text-lg font-medium text-[#1F1F1F] leading-7 max-w-md whitespace-pre-wrap ${Array.isArray((item as any)._languages) && (item as any)._languages.includes('sd') ? 'sindhi-text text-right' : ''}`} dir={(Array.isArray((item as any)._languages) && (item as any)._languages.includes('sd')) ? 'rtl' : 'ltr'}>
                                {item.couplet_text}
                              </div>
                              
                              {/* Copyable URL Structure - Minimal, Coding Font */}
                              <div 
                                className="relative font-mono text-xs text-[#1F1F1F] bg-[#F4F4F5] px-2 py-1.5 rounded border border-[#E5E5E5] select-all cursor-pointer hover:bg-[#EDEDED] transition-colors group"
                                onClick={() => {
                                  const poetSlug = item.poets?.poet_slug || 'unknown-poet';
                                  const url = `/${poetSlug}/${item.categories?.slug || 'no-category'}/${item.poetry_main?.poetry_slug || 'no-poetry'}/couplet/${item.couplet_slug}`;
                                  navigator.clipboard.writeText(url);
                                }}
                                title="Click to copy URL"
                              >
                                <span className="text-[#6B6B6B]">
                                  {item.poets?.poet_slug || 'unknown-poet'}
                                </span>
                                <span className="text-[#9A9A9A] mx-1">/</span>
                                <span className="text-[#1F1F1F]">
                                  {item.categories?.slug || 'no-category'}
                                </span>
                                <span className="text-[#9A9A9A] mx-1">/</span>
                                <span className="text-[#1F1F1F]">
                                  {item.poetry_main?.poetry_slug || 'no-poetry'}
                                </span>
                                <span className="text-[#9A9A9A] mx-1">/</span>
                                <span className="text-[#1F1F1F]">
                                  couplet/{item.couplet_slug}
                                </span>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#1F1F1F]/80 rounded">
                                  <span className="text-xs text-white font-medium">Click to Copy</span>
                                </div>
                              </div>
                              
                              {/* Copy Button */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const poetSlug = item.poets?.poet_slug || 'unknown-poet';
                                    const url = `/${poetSlug}/${item.categories?.slug || 'no-category'}/${item.poetry_main?.poetry_slug || 'no-poetry'}/couplet/${item.couplet_slug}`;
                                    navigator.clipboard.writeText(url);
                                  }}
                                  className="h-7 px-2 text-xs text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                                >
                                  Copy URL
                                </Button>
                                <span className="text-xs text-[#9A9A9A]">Click to copy the couplet URL</span>
                              </div>
                              
                              {/* Tags as small badges */}
                              {item.couplet_tags && (
                                <div className="flex flex-wrap gap-1">
                                  {item.couplet_tags.split(',').map((tag, index) => (
                                    <span 
                                      key={index}
                                      className="inline-block px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-md border border-slate-600/30"
                                    >
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-[#1F1F1F]">
                                {item.poetry_main?.poetry_slug || 'No Poetry'}
                              </div>
                              {item.poetry_main?.poetry_tags && (
                                <div className="text-slate-400 text-xs">
                                  {item.poetry_main.poetry_tags}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-[#1F1F1F] sindhi-text" dir="rtl">
                                {item.poets?.sindhi_name || 'Unknown'}
                              </div>
                              {item.poets?.english_name && (
                                <div className="text-slate-600 text-xs">
                                  {item.poets.english_name}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-white">
                                {item.categories?.slug || 'No Category'}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {((item as any)._languages || [item.lang]).map((lg: string) => (
                                <Badge key={lg} className={`text-xs ${getLanguageBadge(lg)}`}>
                                  {lg.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-400">
                              {new Date(item.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {item.poetry_main && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleVisibility(item.poetry_main!.id)}
                                    className="h-8 w-8 p-0 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                                    title={item.poetry_main.visibility ? 'Hide poetry' : 'Show poetry'}
                                  >
                                    {item.poetry_main.visibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleFeatured(item.poetry_main!.id)}
                                    className="h-8 w-8 p-0 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                                    title={item.poetry_main.is_featured ? 'Remove from featured' : 'Add to featured'}
                                  >
                                    {item.poetry_main.is_featured ? <Star className="w-4 h-4 text-yellow-500" /> : <StarOff className="w-4 h-4" />}
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                              >
                                <Link href={`/admin/poetry/couplets/${item.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete couplet"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage 
                      ? "bg-[#1F1F1F] text-white" 
                      : "border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                    }
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F5F5] hover:border-[#E5E5E5]"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
