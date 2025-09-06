"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit, Trash2, Users, RotateCcw } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Poet {
  id: string;
  poet_slug: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  death_place?: string;
  tags?: string[];
  file_url?: string | null;
  is_featured: boolean;
  is_hidden: boolean;
  sindhi_name?: string;
  sindhi_laqab?: string;
  sindhi_takhalus?: string;
  sindhi_tagline?: string;
  sindhi_details?: string;
  english_name: string;
  english_laqab?: string;
  english_takhalus?: string;
  english_tagline?: string;
  english_details?: string;
  created_at: string;
  updated_at: string;
}

export default function PoetsPage() {
  const [poets, setPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  // Removed cards view - only table view is available
  // Removed unused state variables for sorting and trash view

  // Calculate insights for stats cards
  const insights = useMemo(() => {
    const featured = poets.filter(p => p.is_featured).length;
    const living = poets.filter(p => !p.death_date).length;
    const deceased = poets.filter(p => p.death_date).length;
    
    return { featured, living, deceased };
  }, [poets]);

  // Server-driven pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pagePoets = poets;
  const startIdx = (page-1)*perPage + 1;

  // Load poets with server-side pagination
  const fetchPoets = useCallback(async (pageNum: number = 1, search: string = "", reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: perPage.toString(),
        search: search
      });

      const res = await fetch(`/api/admin/poets?${params}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch poets');
      
      if (reset) {
        setPoets(json.poets || []);
      } else {
        setPoets(prev => {
          const byId = new Map(prev.map(it => [it.id, it] as const));
          for (const it of (json.poets || [])) byId.set(it.id, it);
          return Array.from(byId.values());
        });
      }
      
      setTotal(json.total || 0);
      setTotalPages(Math.ceil((json.total || 0) / perPage));
    } catch (error: any) {
      console.error('Error fetching poets:', error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchPoets(page, q, true);
  }, [page, perPage, fetchPoets]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(q);
    }, 500);

    return () => clearTimeout(timer);
  }, [q]);

  // Reset and reload when search changes
  useEffect(() => {
    setPage(1);
    fetchPoets(1, searchTerm, true);
  }, [searchTerm, fetchPoets]);

  // Removed headerCell function as it's no longer needed

  const handleToggleFeatured = async (poetId: string) => {
      try {
        const response = await fetch(`/api/admin/poets/${poetId}`, {
        method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          is_featured: !poets.find(p => p.id === poetId)?.is_featured
          }),
        });

        if (response.ok) {
        setPoets(prev => prev.map(poet => 
          poet.id === poetId 
            ? { ...poet, is_featured: !poet.is_featured }
            : poet
        ));
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleToggleHidden = async (poetId: string) => {
      try {
        const response = await fetch(`/api/admin/poets/${poetId}`, {
        method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          is_hidden: !poets.find(p => p.id === poetId)?.is_hidden
          }),
        });

        if (response.ok) {
        setPoets(prev => prev.map(poet => 
          poet.id === poetId 
            ? { ...poet, is_hidden: !poet.is_hidden }
            : poet
        ));
      }
    } catch (error) {
      console.error('Error toggling hidden status:', error);
    }
  };

  const handleDelete = async (poetId: string) => {
    if (!confirm('Are you sure you want to delete this poet? This action cannot be undone.')) {
      return;
    }
      try {
        const response = await fetch(`/api/admin/poets/${poetId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
        setPoets(prev => prev.filter(p => p.id !== poetId));
        setTotal(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting poet:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <Users className="w-4 h-4 mr-2" />
                  Poets Management
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Poets Collection</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Manage poetry collection authors and their comprehensive details. 
                  Add new poets, update profiles, and curate the archive.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button asChild className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg" disabled={loading}>
                  <Link href="/admin/poets/create">
                    <Plus className="w-4 h-4 mr-2" /> 
                    New Poet
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Total Poets</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{total}</div>
                  <div className="text-xs text-[#6B6B6B]">Active in collection</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Featured</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{insights.featured}</div>
                  <div className="text-xs text-[#6B6B6B]">Highlighted authors</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Living</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{insights.living}</div>
                  <div className="text-xs text-[#6B6B6B]">Contemporary</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Deceased</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{insights.deceased}</div>
                  <div className="text-xs text-[#6B6B6B]">Historical</div>
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
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }} disabled={loading}>
                    <SelectTrigger className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      {[10,25,50,100].map(n => <SelectItem key={n} value={String(n)} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => fetchPoets(page, searchTerm, true)}
                  disabled={loading}
                >
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input 
                    value={q} 
                    onChange={(e)=>{setQ(e.target.value); setPage(1);}} 
                    placeholder="Search poets by name, slug, or details..." 
                    className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors" 
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poets Table - Designed to match /admin/tags exactly */}
           <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden mb-8">
             <CardHeader className="py-6">
               <div className="space-y-2">
                 <CardTitle className="text-xl font-bold text-[#1F1F1F]">Poet List</CardTitle>
                 <p className="text-base text-[#6B6B6B]">
                   {pagePoets.length} poets found • Showing {pagePoets.length} of {total}
                 </p>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 {loading || pageLoading ? (
                   <div className="p-6 space-y-3">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex items-center gap-4">
                         <Skeleton className="h-4 w-8 bg-[#F4F4F5] rounded" />
                         <Skeleton className="h-4 w-32 bg-[#F4F4F5] rounded" />
                         <Skeleton className="h-4 w-24 bg-[#F4F4F5] rounded" />
                         <Skeleton className="h-4 w-20 bg-[#F4F4F5] rounded" />
                         <Skeleton className="h-4 w-16 bg-[#F4F4F5] rounded" />
                       </div>
                     ))}
                   </div>
                 ) : pagePoets.length === 0 ? (
                   <div className="p-16 text-center text-[#6B6B6B]">
                     <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                     <p className="text-lg font-medium text-[#1F1F1F]">
                       {loading || pageLoading ? 'Loading poets...' : 'No poets found'}
                     </p>
                     <p className="text-sm">
                       {loading || pageLoading ? 'Please wait while we fetch the data...' : (q ? "Try adjusting your search terms" : "Create your first poet to get started")}
                     </p>
                   </div>
                 ) : (
                   <table className="w-full text-sm">
                     <thead className="bg-[#F9F9F9] text-[#1F1F1F]">
                       <tr className="border-b border-[#E5E5E5]">
                         <th className="text-left font-semibold px-4 py-3">Poet</th>
                         <th className="text-left font-semibold px-4 py-3">Status</th>
                         <th className="text-left font-semibold px-4 py-3">Languages</th>
                         <th className="text-left font-semibold px-4 py-3">Created</th>
                         <th className="text-right font-semibold px-4 py-3">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {pagePoets.map((poet, index) => {
                         return (
                           <tr 
                             key={poet.id} 
                             className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors duration-200"
                           >
                             <td className="px-4 py-3">
                               <div className="flex items-center gap-3">
                                 <div className="p-2 rounded-full bg-green-100 text-green-800 border border-green-200">
                                   <Users className="w-4 h-4" />
                                 </div>
                                 <div>
                                   <div className="font-medium text-[#1F1F1F]">
                                     {poet.english_name || poet.sindhi_name}
                                   </div>
                                   <div className="text-xs text-[#6B6B6B] font-mono">
                                     {poet.poet_slug}
                                   </div>
                                   {poet.sindhi_name && (
                                     <div className="text-sm text-[#6B6B6B] mt-1" dir="rtl">
                                       {poet.sindhi_name}
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </td>
                             <td className="px-4 py-3">
                               <div className="flex items-center gap-2">
                                 <button
                                   onClick={() => handleToggleFeatured(poet.id)}
                                   className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                     poet.is_featured
                                       ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                       : 'border border-[#E5E5E5] text-[#6B6B6B] bg-white hover:bg-[#F4F4F5]'
                                   }`}
                                 >
                                   {poet.is_featured ? '⭐ Featured' : 'Not Featured'}
                                 </button>
                                 <button
                                   onClick={() => handleToggleHidden(poet.id)}
                                   className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                     poet.is_hidden
                                       ? 'bg-red-100 text-red-800 border border-red-200'
                                       : 'border border-[#E5E5E5] text-[#6B6B6B] bg-white hover:bg-[#F4F4F5]'
                                   }`}
                                 >
                                   {poet.is_hidden ? '👁️ Hidden' : 'Visible'}
                                 </button>
                               </div>
                             </td>
                             <td className="px-4 py-3">
                               <div className="flex gap-2">
                                 <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F1F1] text-[#2B2B2B] border border-[#E7E7E7]">
                                   EN
                                 </div>
                                 {poet.sindhi_name && (
                                   <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F1F1] text-[#2B2B2B] border border-[#E7E7E7]">
                                     SD
                                   </div>
                                 )}
                               </div>
                             </td>
                             <td className="px-4 py-3 text-[#6B6B6B]">
                               {new Date(poet.created_at).toLocaleDateString()}
                             </td>
                             <td className="px-4 py-3 text-right">
                               <div className="flex items-center justify-end gap-1">
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" 
                                   asChild
                                 >
                                   <Link href={`/admin/poets/${poet.id}`}>
                                     <Edit className="w-4 h-4" />
                                   </Link>
                                 </Button>
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                                   onClick={() => handleDelete(poet.id)}
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </div>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 )}
               </div>
             </CardContent>
           </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <div className="text-sm text-[#6B6B6B] font-medium">
                Showing {startIdx} to {Math.min(startIdx + pagePoets.length - 1, total)} of {total} results
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || pageLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#6B6B6B] px-4 font-medium">
                  Page {page} of {totalPages}
                  {pageLoading && <span className="ml-2 text-blue-600">Loading...</span>}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || pageLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Load More Button */}
          {totalPages > 1 && page < totalPages && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-8 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                onClick={() => setPage(page + 1)}
                disabled={pageLoading}
              >
                {pageLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  `Load More Poets (${total - (page * perPage)} remaining)`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 