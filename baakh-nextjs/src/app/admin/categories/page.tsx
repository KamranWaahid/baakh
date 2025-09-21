"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Eye,
  BookOpen,
  Users,
  Calendar,
  Tag,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  RotateCcw,
  Layers,
  Copy
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";

type Alignment = "start" | "center" | "justified";
type Language = "Sindhi" | "English";
type CategoryRow = {
  id: string;
  name: string;
  information: string;
  detailAlign: Alignment;
  languages: Language[];
  slug?: string;
};

type CategoryDetail = {
  id: string;
  slug: string;
  contentStyle: string;
  gender: string;
  isFeatured: boolean;
  english: {
    name: string;
    plural: string;
    details: string;
  };
  sindhi: {
    name: string;
    plural: string;
    details: string;
  };
  error?: string;
};

const initialRows: CategoryRow[] = [];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'cards'|'table'>('cards');
  const [langFilter, setLangFilter] = useState<'All'|'Sindhi'|'English'>('All');
  const [alignFilter, setAlignFilter] = useState<'All'|Alignment>('All');
  const [sortKey, setSortKey] = useState<keyof CategoryRow>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [draft, setDraft] = useState<CategoryRow | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<CategoryDetail | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CategoryDetail | null>(null);
  const [editDraft, setEditDraft] = useState<CategoryDetail | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState<string>("");
  const [hardDelete, setHardDelete] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  // Mock data for demonstration
  const mockCategories = [
    {
      id: "1",
      name: "Ghazal",
      information: "Lyrical poetry form with rhyming couplets",
      detailAlign: "center" as Alignment,
      languages: ["Sindhi", "English"] as Language[]
    },
    {
      id: "2", 
      name: "Nazam",
      information: "Long narrative poem with structured verses",
      detailAlign: "justified" as Alignment,
      languages: ["Sindhi", "English"] as Language[]
    },
    {
      id: "3",
      name: "Rubai",
      information: "Four-line poem with specific rhyme scheme",
      detailAlign: "start" as Alignment,
      languages: ["Sindhi"] as Language[]
    }
  ];

  // Fetch real categories data
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Debug logging
      console.log('API Response:', data);
      console.log('Categories data:', data.rows);
      
      // Transform API data to match our CategoryRow type
      const transformedCategories: CategoryRow[] = data.rows?.map((cat: Record<string, unknown>) => {
        // Detect languages based on available data
        const languages: Language[] = [];
        if (cat.languages?.includes('English')) languages.push('English');
        if (cat.languages?.includes('Sindhi')) languages.push('Sindhi');
        
        // If no specific language data, assume both
        if (languages.length === 0) languages.push('Sindhi', 'English');
        
        return {
          id: cat.id,
          name: cat.name || 'Unnamed Category',
          information: cat.information || 'No description available',
          detailAlign: cat.detailAlign || 'start',
          languages: languages
        };
      }) || [];
      
      setCategories(transformedCategories);
      setFilteredCategories(transformedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      // Fallback to mock data if API fails
      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category actions
  const handleEdit = (category: CategoryRow) => {
    router.push(`/admin/categories/edit/${category.id}`);
  };

  const handleDelete = async (category: CategoryRow) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryToDelete.id })
      });
      
      if (response.ok) {
        // Remove from local state
        const updatedCategories = categories.filter(c => c.id !== categoryToDelete.id);
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
        showToast('success', `Category "${categoryToDelete.name}" deleted successfully`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  // Keyboard shortcut to close delete dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmOpen) {
        cancelDelete();
      }
    };

    if (deleteConfirmOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [deleteConfirmOpen]);

  const handleView = (category: CategoryRow) => {
    router.push(`/admin/categories/view/${category.id}`);
  };

  const handleDuplicate = async (category: CategoryRow) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `${category.name}_copy`,
          slug: `${category.slug}-copy`,
          english: { 
            name: `${category.name} (Copy)`, 
            plural: category.languages.includes('English') ? `${category.name}s (Copy)` : '', 
            details: category.information 
          },
          sindhi: { 
            name: category.languages.includes('Sindhi') ? `${category.name} (کاپی)` : '', 
            plural: category.languages.includes('Sindhi') ? `${category.name}s (کاپی)` : '', 
            details: category.information 
          },
          contentStyle: 'start',
          gender: 'neutral',
          isFeatured: false,
        }),
      });
      
      if (response.ok) {
        const newCategory = await response.json();
        showToast('success', `Category "${category.name}" duplicated successfully`);
        // Refresh the categories list without full page reload
        fetchCategories();
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to duplicate category');
      }
    } catch (err) {
      console.error('Error duplicating category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate category';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search and filters
  const filteredAndSortedCategories = useMemo(() => {
    const filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(q.toLowerCase()) ||
                           category.information.toLowerCase().includes(q.toLowerCase());
      const matchesLang = langFilter === 'All' || category.languages.includes(langFilter);
      const matchesAlign = alignFilter === 'All' || category.detailAlign === alignFilter;
      
      return matchesSearch && matchesLang && matchesAlign;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = String(a[sortKey] || '').toLowerCase();
      const bVal = String(b[sortKey] || '').toLowerCase();
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return filtered;
  }, [categories, q, langFilter, alignFilter, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCategories.length / perPage));
  const pageCategories = filteredAndSortedCategories.slice((page-1)*perPage, page*perPage);
  const startIdx = (page-1)*perPage + 1;

  const headerCell = (label: string, key: keyof CategoryRow | "index") => (
    <th className="text-left font-semibold px-4 py-3 cursor-pointer select-none hover:bg-[#F4F4F5] transition-colors bg-[#F9F9F9] border-b border-[#E5E5E5]" onClick={() => {
      if (key === "index") return;
      if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key as keyof CategoryRow); setSortAsc(true); }
    }}>
      <span className="inline-flex items-center gap-2 text-[#1F1F1F]">
        {label}
        {key !== "index" && sortKey === key && (
          <span className="text-xs text-[#6B6B6B] font-medium">
            {sortAsc ? "▲" : "▼"}
          </span>
        )}
      </span>
    </th>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <Layers className="w-4 h-4 mr-2" />
                  Categories Management
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Poetry Categories</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Organize and manage poetry categories, forms, and classifications. 
                  Create structured collections for better content organization.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex rounded-full border border-[#E5E5E5] p-1 bg-white">
                    {(['cards','table'] as const).map(v => (
                      <button 
                        key={v} 
                        className={`h-10 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                          view===v
                            ? 'bg-[#1F1F1F] text-white shadow-md' 
                            : 'hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F]'
                        }`} 
                        onClick={()=>{ setView(v); setPage(1); }}
                      >
                        {v === 'cards' ? 'Cards' : 'Table'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button asChild className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg">
                  <Link href="/admin/categories/create">
                    <Plus className="w-4 h-4 mr-2" /> 
                    New Category
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700">
                  {error} - Showing fallback data
                </p>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-[#E5E5E5] rounded-full"></div>
                    <div className="absolute inset-0 w-8 h-8 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium text-[#1F1F1F]">Processing...</p>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#6B6B6B] font-medium">Show</span>
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:border-[#1F1F1F] transition-colors">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      {[10,25,50,100].map(n => <SelectItem key={n} value={String(n)} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={langFilter} onValueChange={(v) => { setLangFilter(v as Language); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[140px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="All" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Languages</SelectItem>
                      <SelectItem value="Sindhi" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Sindhi</SelectItem>
                      <SelectItem value="English" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">English</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={alignFilter} onValueChange={(v) => { setAlignFilter(v as Alignment); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[160px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Alignment" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="All" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Alignments</SelectItem>
                      <SelectItem value="start" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Start</SelectItem>
                      <SelectItem value="center" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Center</SelectItem>
                      <SelectItem value="justified" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Justified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input 
                    value={q} 
                    onChange={(e)=>{setQ(e.target.value); setPage(1);}} 
                    placeholder="Search categories..." 
                    className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {view === 'cards' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-40 bg-[#F4F4F5] rounded" />
                        <Skeleton className="h-4 w-3/4 bg-[#F4F4F5] rounded" />
                        <Skeleton className="h-4 w-2/3 bg-[#F4F4F5] rounded" />
                        <div className="flex gap-2">
                          {[1,2].map(k=> <Skeleton key={k} className="h-7 w-20 bg-[#F4F4F5] rounded" />)}
                      </div>
                    </CardContent>
                  </Card>
                ))
                ) : pageCategories.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                  <Card className="max-w-md mx-auto bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                    <CardContent className="p-12">
                      <div className="w-16 h-16 bg-[#F4F4F5] rounded-full flex items-center justify-center mx-auto mb-6">
                          <Layers className="w-8 h-8 text-[#6B6B6B]" />
                      </div>
                        <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">No categories found</h3>
                      <p className="text-base text-[#6B6B6B] mb-8">
                          {q ? "Try adjusting your search terms or filters" : "Add your first category to organize poetry forms"}
                      </p>
                        {!q && (
                        <Link href="/admin/categories/create">
                          <Button className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-11 px-8 rounded-lg transition-colors">
                              <Plus className="w-5 h-5 mr-2" /> 
                              Add First Category
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                  </div>
              ) : (
                  pageCategories.map((category, idx) => (
                  <div key={category.id}>
                    <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <CardTitle className="text-lg font-bold text-[#1F1F1F] leading-tight">{category.name}</CardTitle>
                            <CardDescription className="text-sm text-[#6B6B6B] line-clamp-2">
                              {category.information}
                            </CardDescription>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize border-[#E5E5E5] text-[#6B6B6B] bg-white">
                              {category.detailAlign}
                            </Badge>
                          </div>
                            </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {category.languages.map((lang) => (
                              <Badge key={lang} className="bg-[#1F1F1F] text-white text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                              onClick={() => handleView(category)}
                              title="View Category"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                              onClick={() => handleEdit(category)}
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors" 
                              onClick={() => handleDuplicate(category)}
                              title="Duplicate Category"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                              onClick={() => handleDelete(category)}
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
              </div>
            </>
                   ) : (
             <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden mb-8">
               <CardHeader className="py-6">
                 <div className="space-y-2">
                   <CardTitle className="text-xl font-bold text-[#1F1F1F]">Category List</CardTitle>
                   <CardDescription className="text-base text-[#6B6B6B]">
                     Comprehensive table with category information and management actions.
                   </CardDescription>
                 </div>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="overflow-x-auto">
                   {loading ? (
                     <div className="p-6 space-y-3">
                       {Array.from({ length: 6 }).map((_, i) => (
                         <Skeleton key={i} className="h-12 w-full bg-[#F4F4F5] rounded" />
                       ))}
                     </div>
                   ) : (
                     <table className="min-w-[800px]">
                       <thead>
                         <tr className="border-b border-[#E5E5E5]">
                           {headerCell("Sr #","index")}
                           {headerCell("Name","name")}
                           {headerCell("Description","information")}
                           {headerCell("Alignment","detailAlign")}
                           {headerCell("Languages","languages")}
                           <th className="text-right font-semibold px-4 py-3">Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {pageCategories.length === 0 ? (
                           <tr>
                             <td colSpan={6} className="px-6 py-16 text-center text-[#6B6B6B]">
                               <div className="space-y-2">
                                 <Layers className="w-8 h-8 mx-auto text-[#6B6B6B]/50" />
                                 <p className="text-base">No categories found</p>
                                 <p className="text-sm text-[#6B6B6B]">
                                   {q ? "Try adjusting your search terms" : "Add your first category to get started"}
                                 </p>
                               </div>
                             </td>
                           </tr>
                         ) : (
                           pageCategories.map((category, idx) => (
                             <tr key={category.id} className="hover:bg-[#F4F4F5] transition-colors duration-200 border-b border-[#E5E5E5]">
                               <td className="px-4 py-3 font-medium text-[#1F1F1F]">{startIdx + idx}</td>
                               <td className="px-4 py-3">
                                 <div className="text-base font-semibold text-[#1F1F1F]">{category.name}</div>
                               </td>
                               <td className="px-4 py-3">
                                 <div className="text-sm text-[#6B6B6B] max-w-xs truncate">
                                   {category.information}
                                 </div>
                               </td>
                               <td className="px-4 py-3">
                                 <Badge variant="outline" className="text-xs capitalize border-[#E5E5E5] text-[#6B6B6B] bg-white">
                                   {category.detailAlign}
                                 </Badge>
                               </td>
                               <td className="px-4 py-3">
                                 <div className="flex gap-2">
                                   {category.languages.map((lang) => (
                                     <Badge key={lang} className="bg-[#1F1F1F] text-white text-xs">
                                       {lang}
                                     </Badge>
                                   ))}
                                 </div>
                               </td>
                               <td className="px-4 py-3 text-right">
                                 <div className="inline-flex items-center gap-1">
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                     onClick={() => handleView(category)}
                                     title="View Category"
                                   >
                                     <Eye className="w-4 h-4" />
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                     onClick={() => handleEdit(category)}
                                     title="Edit Category"
                                   >
                                     <Edit className="w-4 h-4" />
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors" 
                                     onClick={() => handleDuplicate(category)}
                                     title="Duplicate Category"
                                   >
                                     <Copy className="w-4 h-4" />
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" 
                                     onClick={() => handleDelete(category)}
                                     title="Delete Category"
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
                   )}
          </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <div className="text-sm text-[#6B6B6B] font-medium">
                Showing {startIdx} to {Math.min(startIdx + pageCategories.length - 1, filteredAndSortedCategories.length)} of {filteredAndSortedCategories.length} results
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
                <span className="text-sm text-[#6B6B6B] px-4 font-medium">
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmOpen && categoryToDelete && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => cancelDelete()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-4">Confirm Deletion</h3>
              <p className="text-base text-[#6B6B6B] mb-6">
                Are you sure you want to delete "{categoryToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete} className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete} className="h-10 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}


