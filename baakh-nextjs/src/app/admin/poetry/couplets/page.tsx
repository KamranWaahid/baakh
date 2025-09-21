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
import AdminPageHeader from "@/components/ui/AdminPageHeader";

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
    sindhi_laqab: string;
    english_laqab: string;
  } | null;
  categories?: {
    id: number;
    slug: string;
  } | null;
  english_couplet?: {
    id: number;
    couplet_text: string;
    couplet_slug: string;
    couplet_tags: string;
    lang: string;
    created_at: string;
    updated_at: string;
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
  const sindhiCouplets = items.length; // All items are now Sindhi couplets
  const englishCouplets = items.filter(item => item.english_couplet).length; // Count items with English translations
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

  // Since we now only fetch Sindhi couplets as primary entries with English data included,
  // we can simplify the grouping logic
  const groupedItems = useMemo(() => {
    return items.map(item => {
      const languages = ['sd']; // All items are Sindhi
      if (item.english_couplet) {
        languages.push('en');
      }
      
      return {
        ...item,
        _languages: languages,
        _coupletIds: [item.id, ...(item.english_couplet ? [item.english_couplet.id] : [])],
      } as CoupletItem & { _languages: string[]; _coupletIds: number[] };
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

  const getTagPills = (couplet: CoupletItem) => {
    if (!couplet.couplet_tags) return null;
    
    // Parse tags from comma-separated string
    const tags = couplet.couplet_tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
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
            key={`${couplet.id}-tag-${index}`}
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
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Couplets Collection"
          subtitle="Couplets Management"
          subtitleIcon={<Quote className="w-4 h-4" />}
          description="Manage your couplets collection with translations and poetry associations. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button 
                asChild
                variant="outline"
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <Link href="/admin/poetry/couplets/create">
                  <Plus className="w-4 h-4 mr-2" /> New Couplet
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Quote className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Total Couplets</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{totalCouplets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Sindhi Couplets</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{sindhiCouplets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">English Couplets</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{englishCouplets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#1F1F1F]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] font-medium">Total Poetry</p>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{totalPoetry}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#6B6B6B] font-medium">Show</span>
                  <select
                    value={COUPLETS_PER_PAGE}
                    onChange={(e) => {
                      // This is a static value for now, but we could implement pagination changes here
                      console.log('Per page changed to:', e.target.value);
                    }}
                    className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors px-3 py-2 text-sm"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value as 'all' | 'sd' | 'en')}
                    className="h-9 w-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors px-3 py-2 text-sm"
                  >
                    <option value="all">All Languages</option>
                    <option value="sd">Sindhi</option>
                    <option value="en">English</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created_at' | 'couplet_slug' | 'lang')}
                    className="h-9 w-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors px-3 py-2 text-sm"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="couplet_slug">Slug</option>
                    <option value="lang">Language</option>
                  </select>
                </div>
                
                <div className="relative md:ml-auto">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input 
                    value={searchTerm} 
                    onChange={(e)=>{setSearchTerm(e.target.value);}} 
                    placeholder="Search couplets..." 
                    className="pl-9 h-9 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-base text-[#1F1F1F]">Couplets List</CardTitle>
              <CardDescription className="text-[#6B6B6B]">Comprehensive table with couplet information and actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full bg-[#F4F4F5]" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-[#F9F9F9] text-[#1F1F1F]">
                      <tr className="border-b border-[#E5E5E5]">
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">ID</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Couplet</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Poetry</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Poet</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Category</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Languages</th>
                        <th className="text-left font-medium px-3 py-2 cursor-pointer select-none text-[#1F1F1F]">Created</th>
                        <th className="text-right font-medium px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems.length === 0 ? (
                        <tr className="border-t border-[#E5E5E5]">
                          <td colSpan={8} className="px-4 py-10 text-center text-[#6B6B6B]">No couplets found</td>
                        </tr>
                      ) : (
                        groupedItems.map((item) => (
                          <tr key={item.id} className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors duration-200">
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {item.id}
                                {Array.isArray((item as any)._coupletIds) && (item as any)._coupletIds.length > 1 && (
                                  <div className="text-[10px] text-gray-400">
                                    +{(item as any)._coupletIds.length - 1} more
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="space-y-2">
                                {/* Sindhi Couplet Text */}
                                <div className={`text-[#1F1F1F] leading-6 max-w-md whitespace-pre-wrap sindhi-text text-right font-sindhi`} dir="rtl" lang="sd">
                                  {item.couplet_text}
                                </div>
                                
                                {/* English Couplet Text (if available) */}
                                {item.english_couplet && (
                                  <div className="text-[#6B6B6B] leading-5 max-w-md whitespace-pre-wrap text-sm" dir="ltr" lang="en">
                                    {item.english_couplet.couplet_text}
                                  </div>
                                )}
                                
                                {getTagPills(item)}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {item.couplet_slug || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {item.poets?.english_laqab || item.poets?.sindhi_laqab || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center">
                                {item.categories?.slug ? (
                                  <div className="text-xs text-[#6B6B6B]">
                                    {item.categories.slug}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                    Independent Couplet
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {/* Show both languages if English couplet is available, otherwise show only the main language */}
                                {item.english_couplet ? (
                                  <>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">
                                      SD
                                    </div>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-[#1F1F1F] border border-[#E5E5E5]">
                                      EN
                                    </div>
                                  </>
                                ) : (
                                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">
                                    {item.lang.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-[#6B6B6B]">
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" asChild>
                                  <Link href={`/admin/poetry/couplets/${item.couplet_slug}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <div className="text-sm text-[#6B6B6B] font-medium">
                Showing {((currentPage - 1) * COUPLETS_PER_PAGE) + 1} to {Math.min(currentPage * COUPLETS_PER_PAGE, total)} of {total} results
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#6B6B6B] font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </div>
    </AdminLayout>
  );
}
