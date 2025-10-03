"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

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
  FileText,
  User,
  Tag,
  Globe,
  Quote,
  ArrowUpDown,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { supabase } from "@/lib/supabase/client";

interface PoetryItem {
  id: string;
  poetry_slug: string;
  poetry_tags: string;
  lang: string;
  visibility: boolean;
  is_featured: boolean;
  created_at: string;
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
  poetry_translations?: Array<{
    id: number;
    title: string;
    lang: string;
  }>;
  poetry_couplets?: Array<{
    id: number;
    couplet_text: string;
    couplet_slug: string;
    lang: string;
  }>;
}

export default function AdminPoetryListPage() {
  const [items, setItems] = useState<PoetryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'cards'|'table'>('table');
  const [sortKey, setSortKey] = useState<keyof PoetryItem>("id");
  const [sortAsc, setSortAsc] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'sd' | 'en'>('all');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Calculate insights for stats cards
  const insights = useMemo(() => {
    const total = items.length;
    const published = items.filter(item => item.visibility).length;
    const draft = items.filter(item => !item.visibility).length;
    const featured = items.filter(item => item.is_featured).length;
    const totalCouplets = items.reduce((sum, item) => sum + (item.poetry_couplets?.length || 0), 0);
    
    return { total, published, draft, featured, totalCouplets };
  }, [items]);

  // Server-driven pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pagePoetry = items;
  const startIdx = (page-1)*perPage + 1;

  // Load poetry data
  const fetchPoetry = useCallback(async (pageNum: number = 1, search: string = "", reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: perPage.toString(),
        search: search,
        status: filterStatus,
        lang: filterLanguage === 'all' ? '' : filterLanguage,
        sortBy: sortKey,
        sortOrder: sortAsc ? 'asc' : 'desc'
      });

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(`/api/admin/poetry/?${params}`, { 
        cache: 'no-store',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch poetry');
      }

      const data = await response.json();
      setItems(data.poetry || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: unknown) {
      console.error('Error fetching poetry:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch poetry');
    } finally {
      setLoading(false);
    }
  }, [perPage, sortKey, sortAsc, filterStatus, filterLanguage]);

  useEffect(() => {
    fetchPoetry(page, q, true);
  }, [fetchPoetry, page]);

  // Reset and reload when search or sort changes
  // Debounce the raw input value into searchTerm
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Refetch when filters/sort or debounced search changes
  useEffect(() => {
    setPage(1);
    fetchPoetry(1, searchTerm, true);
  }, [searchTerm, sortKey, sortAsc, filterStatus, filterLanguage]);

  const headerCell = (label: string, key: keyof PoetryItem | "index") => (
    <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]" onClick={() => {
      if (key === "index") return;
      if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key as keyof PoetryItem); setSortAsc(true); }
    }}>
      <span className="inline-flex items-center gap-1">
        {label}
        {key !== "index" && sortKey === key && (<span className="text-xs text-[#6B6B6B]">{sortAsc ? "▲" : "▼"}</span>)}
      </span>
    </th>
  );

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleFeatured = async (poetryId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(poetryId));
      
      const poetry = items.find(p => p.id === poetryId);
      if (!poetry) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(`/api/admin/poetry/${poetryId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          is_featured: !poetry.is_featured,
        }),
      });

      if (response.ok) {
        setItems(prev => prev.map(p => 
          p.id === poetryId ? { ...p, is_featured: !p.is_featured } : p
        ));
        showToast('Poetry featured status updated.', 'success');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update featured status');
        showToast('Failed to update featured status.', 'error');
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      showToast('Failed to update featured status.', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(poetryId);
        return newSet;
      });
    }
  };

  const handleToggleVisibility = async (poetryId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(poetryId));
      
      const poetry = items.find(p => p.id === poetryId);
      if (!poetry) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(`/api/admin/poetry/${poetryId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          visibility: !poetry.visibility,
        }),
      });

      if (response.ok) {
        setItems(prev => prev.map(p => 
          p.id === poetryId ? { ...p, visibility: !p.visibility } : p
        ));
        showToast('Poetry visibility updated.', 'success');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update visibility');
        showToast('Failed to update visibility.', 'error');
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      showToast('Failed to update visibility.', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(poetryId);
        return newSet;
      });
    }
  };

  const handleDelete = async (poetryId: string) => {
    if (!confirm('Are you sure you want to delete this poetry? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingItems(prev => new Set(prev).add(poetryId));
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(`/api/admin/poetry/${poetryId}/`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (response.ok) {
        setItems(prev => prev.filter(p => p.id !== poetryId));
        showToast('Poetry deleted successfully.', 'success');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete poetry');
        showToast('Failed to delete poetry.', 'error');
      }
    } catch (error) {
      console.error("Error deleting poetry:", error);
      showToast('Failed to delete poetry.', 'error');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(poetryId);
        return newSet;
      });
    }
  };

  const getLanguageBadges = (poetry: PoetryItem) => {
    const languages = new Set<string>();
    
    // Add main language
    if (poetry.lang) languages.add(poetry.lang);
    
    // Add translation languages
    if (poetry.poetry_translations) {
      poetry.poetry_translations.forEach(trans => {
        if (trans.lang) languages.add(trans.lang);
      });
    }
    
    // Add couplet languages
    if (poetry.poetry_couplets) {
      poetry.poetry_couplets.forEach(couplet => {
        if (couplet.lang) languages.add(couplet.lang);
      });
    }
    
    return Array.from(languages).map(lang => (
      <div 
        key={`${poetry.id}-${lang}`} 
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          lang === 'sd' 
            ? 'bg-[#1F1F1F] text-white' 
            : 'bg-white text-[#1F1F1F] border border-[#E5E5E5]'
        }`}
      >
        {lang.toUpperCase()}
      </div>
    ));
  };

  const getTagPills = (poetry: PoetryItem) => {
    if (!poetry.poetry_tags) return null;
    
    // Parse tags from comma-separated string
    const tags = poetry.poetry_tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // Define tag colors for specific themes
    const getTagColor = (tag: string) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes('nature') || lowerTag.includes('فطرت')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
      if (lowerTag.includes('wisdom') || lowerTag.includes('حڪمت') || lowerTag.includes('philosophy') || lowerTag.includes('فلسفو')) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
      }
      if (lowerTag.includes('romance') || lowerTag.includes('محبت') || lowerTag.includes('love') || lowerTag.includes('رومانس')) {
        return 'bg-rose-50 text-rose-700 border-rose-200';
      }
      if (lowerTag.includes('sadness') || lowerTag.includes('غم')) {
        return 'bg-slate-50 text-slate-700 border-slate-200';
      }
      if (lowerTag.includes('happiness') || lowerTag.includes('خوشي')) {
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      }
      if (lowerTag.includes('spiritual') || lowerTag.includes('روحاني')) {
        return 'bg-purple-50 text-purple-700 border-purple-200';
      }
      // Default color for other tags
      return 'bg-gray-50 text-gray-700 border-gray-200';
    };
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={`${poetry.id}-tag-${index}`}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            +{tags.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Poetry Collection"
          subtitle="Poetry Management"
          subtitleIcon={<BookOpen className="w-4 h-4" />}
          description="Manage your poetry collection with translations and couplets. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="inline-flex rounded-lg border border-[#E5E5E5] p-1 bg-white">
                {(['cards','table'] as const).map(v => (
                  <button 
                    key={v} 
                    className={`h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                      view===v
                        ? 'bg-[#1F1F1F] text-white'
                        : 'text-[#6B6B6B] hover:bg-[#F4F4F5]'
                    }`} 
                    onClick={()=>{ setView(v); setPage(1); }}
                  >
                    {v === 'cards' ? 'Card View' : 'Table View'}
                  </button>
                ))}
              </div>
              <Button 
                asChild
                variant="outline"
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <Link href="/admin/poetry/create">
                  <Plus className="w-4 h-4 mr-2" /> New Poetry
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <Link href="/admin/poetry/couplets/create">
                  <Quote className="w-4 h-4 mr-2" /> New Couplet
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Total Poetry</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{insights.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Published</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{insights.published}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Draft</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{insights.draft}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Featured</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{insights.featured}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/poetry/couplets'}>
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Quote className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Total Couplets</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{insights.totalCouplets}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#6B6B6B]">
                  Click to view all couplets
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#6B6B6B] font-medium">Show</span>
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      {[20,30,50,100].map(n => <SelectItem key={n} value={String(n)} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>
                
                <div className="inline-flex items-center gap-2 text-sm">
                  <Button 
                    variant={showTrash ? 'outline' : 'default'} 
                    size="sm" 
                    className={`h-9 px-4 rounded-lg transition-colors ${
                      showTrash 
                        ? 'border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]' 
                        : 'bg-[#1F1F1F] hover:bg-[#404040] text-white'
                    }`} 
                    onClick={()=>setShowTrash(false)}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={showTrash ? 'default' : 'outline'} 
                    size="sm" 
                    className={`h-9 px-4 rounded-lg transition-colors ${
                      showTrash 
                        ? 'bg-[#1F1F1F] hover:bg-[#404040] text-white' 
                        : 'border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]'
                    }`} 
                    onClick={()=>setShowTrash(true)}
                  >
                    Trash
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={(v: string) => { setFilterStatus(v as "all" | "draft" | "published"); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="all" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Status</SelectItem>
                      <SelectItem value="published" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Published</SelectItem>
                      <SelectItem value="draft" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterLanguage} onValueChange={(v: string) => { setFilterLanguage(v as "all" | "sd" | "en"); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="all" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Languages</SelectItem>
                      <SelectItem value="sd" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Sindhi</SelectItem>
                      <SelectItem value="en" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative md:ml-auto">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input 
                    value={q} 
                    onChange={(e)=>{setQ(e.target.value); setPage(1);}} 
                    placeholder="Search poetry..." 
                    className="pl-9 h-9 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {view === 'cards' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-lg bg-[#F4F4F5]" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32 bg-[#F4F4F5]" />
                            <Skeleton className="h-3 w-24 bg-[#F4F4F5]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full bg-[#F4F4F5]" />
                          <Skeleton className="h-3 w-3/4 bg-[#F4F4F5]" />
                        </div>
                        <div className="flex gap-2">
                          {[1,2,3].map(k=> <Skeleton key={k} className="h-6 w-12 bg-[#F4F4F5] rounded" />)}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : pagePoetry.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Card className="max-w-md mx-auto bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                      <CardContent className="p-12">
                        <div className="w-16 h-16 bg-[#F4F4F5] rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-[#6B6B6B]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">No poetry found</h3>
                        <p className="text-[#6B6B6B] mb-6">
                          {q ? "Try adjusting your search terms" : "Add your first poetry to get started"}
                        </p>
                        {!q && (
                          <Link href="/admin/poetry/create">
                            <Button className="bg-[#1F1F1F] hover:bg-[#404040] text-white px-6 py-2 rounded-lg">
                              <Plus className="w-4 h-4 mr-2" /> Add First Poetry
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  pagePoetry.map((poetry, idx) => (
                    <Card key={poetry.id} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:bg-[#F4F4F5] transition-colors duration-200">
                      <CardHeader className="pb-6 px-8 pt-8">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-[#1F1F1F] space-y-0.5">
                              {(() => {
                                const sd = poetry.poetry_translations?.find(t => t.lang === 'sd')?.title || '';
                                const en = poetry.poetry_translations?.find(t => t.lang === 'en')?.title || '';
                                if (sd || en) {
                                  return (
                                    <div>
                                      {sd && (
                                        <div className="sindhi-text sindhi-text-lg sindhi-font-medium sindhi-text-primary leading-snug">{sd}</div>
                                      )}
                                      {en && (
                                        <div className="text-sm text-[#6B6B6B] leading-snug">{en}</div>
                                      )}
                                    </div>
                                  );
                                }
                                return <span className="text-sm text-[#1F1F1F]">{poetry.poetry_slug}</span>;
                              })()}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-[#6B6B6B]">
                              {poetry.poets?.english_name && <span className="block mb-1">by {poetry.poets.english_name}</span>}
                            </CardDescription>
                            {getTagPills(poetry)}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <div className="flex gap-1">
                              {getLanguageBadges(poetry)}
                            </div>
                            <div className="flex gap-1">
                              {poetry.is_featured && <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200">⭐</Badge>}
                              {!poetry.visibility && <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-800 border border-red-200">👁️</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-8 pb-8">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" asChild>
                            <Link href={`/admin/poetry/${poetry.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                            onClick={() => handleDelete(poetry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-base text-[#1F1F1F]">Poetry List</CardTitle>
              <CardDescription className="text-[#6B6B6B]">Comprehensive table with poetry information and actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full bg-[#F4F4F5]" />
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-[#F9F9F9] text-[#1F1F1F]">
                      <tr className="border-b border-[#E5E5E5]">
                        {headerCell("ID","id")}
                        {headerCell("Title","poetry_slug")}
                        {headerCell("Poet","poetry_slug")}
                        {headerCell("Category","index")}
                        {headerCell("Languages","lang")}
                        {headerCell("Status","visibility")}
                        {headerCell("Created","created_at")}
                        <th className="text-right font-medium px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagePoetry.length === 0 ? (
                        <tr className="border-t border-[#E5E5E5]">
                          <td colSpan={7} className="px-4 py-10 text-center text-[#6B6B6B]">No poetry found</td>
                        </tr>
                      ) : (
                        pagePoetry.map((poetry, idx) => (
                          <tr key={poetry.id} className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors duration-200">
                            <td className="px-3 py-2">{poetry.id}</td>
                            <td className="px-3 py-2">
                              <div>
                                <div className="text-[#1F1F1F]">
                                  {(() => {
                                    const sd = poetry.poetry_translations?.find(t => t.lang === 'sd')?.title || '';
                                    const en = poetry.poetry_translations?.find(t => t.lang === 'en')?.title || '';
                                    if (sd || en) {
                                      return (
                                        <div className="space-y-0.5">
                                          {sd && <div className="sindhi-text sindhi-text-base sindhi-font-medium leading-snug">{sd}</div>}
                                          {en && <div className="text-xs text-[#6B6B6B] leading-snug">{en}</div>}
                                        </div>
                                      );
                                    }
                                    return <span className="text-sm">{poetry.poetry_slug}</span>;
                                  })()}
                                </div>
                                {getTagPills(poetry)}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {poetry.poets?.english_name || poetry.poets?.sindhi_name || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {poetry.categories?.slug || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {getLanguageBadges(poetry)}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleFeatured(poetry.id)}
                                  disabled={updatingItems.has(poetry.id)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                    poetry.is_featured
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                      : 'bg-[#F4F4F5] text-[#6B6B6B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'
                                  }`}
                                >
                                  {updatingItems.has(poetry.id) ? '...' : (poetry.is_featured ? 'Featured' : 'Not Featured')}
                                </button>
                                <button
                                  onClick={() => handleToggleVisibility(poetry.id)}
                                  disabled={updatingItems.has(poetry.id)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                    poetry.visibility
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : 'bg-[#F4F4F5] text-[#6B6B6B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'
                                  }`}
                                >
                                  {updatingItems.has(poetry.id) ? '...' : (poetry.visibility ? 'Published' : 'Draft')}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {new Date(poetry.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" asChild>
                                  <Link href={`/admin/poetry/${poetry.id}`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                                  onClick={() => handleDelete(poetry.id)}
                                  disabled={deletingItems.has(poetry.id)}
                                >
                                  {deletingItems.has(poetry.id) ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        )}

          {/* Quick Navigation */}
          <div className="mt-8">
            <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">Quick Actions</h3>
                    <p className="text-[#6B6B6B]">Manage your poetry collection and couplets</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      asChild
                      variant="outline"
                      className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                    >
                      <Link href="/admin/poetry/couplets">
                        <Quote className="w-4 h-4 mr-2" />
                        Manage Couplets
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-4 rounded-lg transition-colors"
                    >
                      <Link href="/admin/poetry/couplets/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Couplet
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <div className="text-sm text-[#6B6B6B] font-medium">
                Showing {startIdx} to {Math.min(startIdx + pagePoetry.length - 1, total)} of {total} results
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#6B6B6B] font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div
              className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {toast.message}
            </div>
          )}
              </div>
      </div>
    </AdminLayout>
  );
}


