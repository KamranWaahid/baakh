"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Filter, Tag as TagIcon, Eye, X, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type TagType = "Poetry" | "Topic" | "Form" | "Theme" | "Category" | "Emotion";

interface Tag {
  id: number;
  slug: string;
  label: string;
  tag_type: string;
  created_at: string;
  updated_at: string;
  sindhi: { title: string; details: string };
  english: { title: string; details: string };
}

interface TagFormData {
  slug: string;
  type: string;
  sindhi: { title: string; details: string };
  english: { title: string; details: string };
}

export default function PoetryTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TagType | "all">("all");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    slug: "",
    type: "Topic",
    sindhi: { title: "", details: "" },
    english: { title: "", details: "" },
  });

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tags");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tags");
      }
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error: any) {
      if (error.message.includes("database setup")) {
        toast.error("Database not set up. Please run the setup script first.");
      } else {
        toast.error(error.message || "Failed to load tags");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTags(); }, []);

  const filteredTags = tags.filter(tag => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = tag.slug.toLowerCase().includes(q) || tag.label.toLowerCase().includes(q) || tag.sindhi.title.toLowerCase().includes(q) || tag.english.title.toLowerCase().includes(q);
    const matchesType = filterType === "all" || tag.tag_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredTags.length / perPage);
  const paginatedTags = filteredTags.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => setFormData({ slug: "", type: "Topic", sindhi: { title: "", details: "" }, english: { title: "", details: "" } });

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to create tag");
      toast.success("Tag created successfully");
      setShowCreateModal(false);
      resetForm();
      loadTags();
    } catch (error: any) {
      if (error.message.includes("foreign key constraint")) {
        toast.error("Database setup issue. Please run the setup script first.");
      } else {
        toast.error(error.message || "Failed to create tag");
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedTag) return;
    try {
      const response = await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to update tag");
      toast.success("Tag updated successfully");
      setShowEditModal(false);
      setSelectedTag(null);
      resetForm();
      loadTags();
    } catch (error: any) {
      if (error.message.includes("foreign key constraint")) {
        toast.error("Database setup issue. Please run the setup script first.");
      } else {
        toast.error(error.message || "Failed to update tag");
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;
    try {
      const response = await fetch(`/api/admin/tags?id=${selectedTag.id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to delete tag");
      toast.success("Tag deleted successfully");
      setShowDeleteModal(false);
      setSelectedTag(null);
      loadTags();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tag");
    }
  };

  const openEditModal = (tag: Tag) => {
    setFormData({ slug: tag.slug, type: tag.tag_type as TagType, sindhi: { title: tag.sindhi.title || "", details: tag.sindhi.details || "" }, english: { title: tag.english.title || "", details: tag.english.details || "" } });
    setSelectedTag(tag);
    setShowEditModal(true);
  };

  const openViewModal = (tag: Tag) => { setSelectedTag(tag); setShowViewModal(true); };
  const openDeleteModal = (tag: Tag) => { setSelectedTag(tag); setShowDeleteModal(true); };

  const getTagTypeColor = (type: string) => {
    switch (type) {
      case "Poetry": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Poet": return "bg-green-100 text-green-800 border border-green-200";
      case "Topic": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Form": return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Theme": return "bg-pink-100 text-pink-800 border border-pink-200";
      case "Category": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Emotion": return "bg-rose-100 text-rose-800 border border-rose-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Tags & Topics"
          subtitle="Poetry Tags"
          subtitleIcon={<TagIcon className="w-4 h-4" />}
          description="Manage bilingual tags for poetry, topics, forms, and themes. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button 
                onClick={() => setShowCreateModal(true)} 
                variant="outline" 
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Poetry Tag
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)} 
                variant="outline" 
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Poet Tag
              </Button>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#6B6B6B] font-medium">Show</span>
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"><SelectValue placeholder="Rows" /></SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">{[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filterType} onValueChange={(v: any) => { setFilterType(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9 w-[140px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="all" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Types</SelectItem>
                      {["Poetry", "Poet", "Topic", "Form", "Theme", "Category", "Emotion"].map(t => <SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search tags..." className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden mb-8">
            <CardHeader className="py-6">
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold text-[#1F1F1F]">Tag List</CardTitle>
                <CardDescription className="text-base text-[#6B6B6B]">{filteredTags.length} tags found • Showing {paginatedTags.length} of {filteredTags.length}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-8 bg-[#F4F4F5] rounded" /><Skeleton className="h-4 w-32 bg-[#F4F4F5] rounded" /><Skeleton className="h-4 w-24 bg-[#F4F4F5] rounded" /><Skeleton className="h-4 w-20 bg-[#F4F4F5] rounded" /><Skeleton className="h-4 w-16 bg-[#F4F4F5] rounded" /></div>))}</div>
                ) : paginatedTags.length === 0 ? (
                  <div className="p-16 text-center text-[#6B6B6B]"><TagIcon className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium text-[#1F1F1F]">No tags found</p><p className="text-sm">Create your first tag to get started</p></div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9F9F9] text-[#1F1F1F]"><tr className="border-b border-[#E5E5E5]"><th className="text-left font-semibold px-4 py-3">Tag</th><th className="text-left font-semibold px-4 py-3">Type</th><th className="text-left font-semibold px-4 py-3">Languages</th><th className="text-left font-semibold px-4 py-3">Created</th><th className="text-right font-semibold px-4 py-3">Actions</th></tr></thead>
                    <tbody>
                      {paginatedTags.map(tag => (
                        <tr key={tag.id} className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors duration-200">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getTagTypeColor(tag.tag_type)}`}><TagIcon className="w-4 h-4" /></div>
                              <div>
                                <div className="font-medium text-[#1F1F1F]">{tag.english.title || tag.label}</div>
                                <div className="text-xs text-[#6B6B6B] font-mono">{tag.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getTagTypeColor(tag.tag_type)}`}>{tag.tag_type}</div></td>
                          <td className="px-4 py-3"><div className="flex gap-2"><div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">SD</div><div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">EN</div></div></td>
                          <td className="px-4 py-3 text-[#6B6B6B]">{new Date(tag.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" onClick={() => openViewModal(tag)}><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" onClick={() => openEditModal(tag)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" onClick={() => openDeleteModal(tag)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
              <div className="text-sm text-[#6B6B6B] font-medium">Showing {paginatedTags.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredTags.length)} of {filteredTags.length} entries</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</Button>
                <span className="text-sm text-[#6B6B6B] px-4 font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Create New Tag</h2><Button variant="ghost" size="sm" onClick={() => { setShowCreateModal(false); resetForm(); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Slug</label>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="tag-slug" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Type</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">{(["Poetry", "Topic", "Form", "Theme"] as TagType[]).map(t => (<SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{t}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Sindhi Title</label>
                    <Input dir="rtl" value={formData.sindhi.title} onChange={(e) => setFormData({ ...formData, sindhi: { ...formData.sindhi, title: e.target.value } })} placeholder="Tag Title" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">Sindhi Details</label>
                    <Textarea dir="rtl" value={formData.sindhi.details} onChange={(e) => setFormData({ ...formData, sindhi: { ...formData.sindhi, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">English Title</label>
                    <Input value={formData.english.title} onChange={(e) => setFormData({ ...formData, english: { ...formData.english, title: e.target.value } })} placeholder="Tag Title" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">English Details</label>
                    <Textarea value={formData.english.details} onChange={(e) => setFormData({ ...formData, english: { ...formData.english, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2"><Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button><Button onClick={handleCreate} disabled={!formData.slug || !formData.sindhi.title || !formData.english.title} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Save className="w-4 h-4 mr-2" /> Create Tag</Button></div>
            </div>
          </div>
        )}

        {showEditModal && selectedTag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Edit Tag</h2><Button variant="ghost" size="sm" onClick={() => { setShowEditModal(false); setSelectedTag(null); resetForm(); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Slug</label>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="tag-slug" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Type</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">{(["Poetry", "Topic", "Form", "Theme"] as TagType[]).map(t => (<SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{t}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Sindhi Title</label>
                    <Input dir="rtl" value={formData.sindhi.title} onChange={(e) => setFormData({ ...formData, sindhi: { ...formData.sindhi, title: e.target.value } })} placeholder="Tag Title" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">Sindhi Details</label>
                    <Textarea dir="rtl" value={formData.sindhi.details} onChange={(e) => setFormData({ ...formData, sindhi: { ...formData.sindhi, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">English Title</label>
                    <Input value={formData.english.title} onChange={(e) => setFormData({ ...formData, english: { ...formData.english, title: e.target.value } })} placeholder="Tag Title" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">English Details</label>
                    <Textarea value={formData.english.details} onChange={(e) => setFormData({ ...formData, english: { ...formData.english, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2"><Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedTag(null); resetForm(); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button><Button onClick={handleUpdate} disabled={!formData.slug || !formData.sindhi.title || !formData.english.title} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Save className="w-4 h-4 mr-2" /> Update Tag</Button></div>
            </div>
          </div>
        )}

        {showViewModal && selectedTag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Tag Details</h2><Button variant="ghost" size="sm" onClick={() => { setShowViewModal(false); setSelectedTag(null); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#6B6B6B]">Slug</label><p className="mt-1 font-mono bg-[#F4F4F5] p-2 rounded text-[#1F1F1F]">{selectedTag.slug}</p></div>
                  <div><label className="text-sm font-medium text-[#6B6B6B]">Type</label><div className="mt-1"><div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getTagTypeColor(selectedTag.tag_type)}`}>{selectedTag.tag_type}</div></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">Sindhi</label>
                    <div className="mt-1 space-y-2"><div className="bg-[#F4F4F5] p-3 rounded border border-[#E5E5E5]"><div className="font-medium text-[#1F1F1F]" dir="rtl">{selectedTag.sindhi.title || "Not set"}</div><div className="text-sm text-[#6B6B6B] mt-1" dir="rtl">{selectedTag.sindhi.details || "No description"}</div></div></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">English</label>
                    <div className="mt-1 space-y-2"><div className="bg-[#F4F4F5] p-3 rounded border border-[#E5E5E5]"><div className="font-medium text-[#1F1F1F]">{selectedTag.english.title || "Not set"}</div><div className="text-sm text-[#6B6B6B] mt-1">{selectedTag.english.details || "No description"}</div></div></div>
                  </div>
                </div>
                <div><label className="text-sm font-medium text-[#6B6B6B]">Languages</label><div className="mt-1 flex gap-2"><div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">SD</div><div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">EN</div></div></div>
                <div><label className="text-sm font-medium text-[#6B6B6B]">Created</label><p className="mt-1 text-sm text-[#1F1F1F]">{new Date(selectedTag.created_at).toLocaleString()}</p></div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2"><Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedTag(null); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Close</Button><Button onClick={() => { setShowViewModal(false); openEditModal(selectedTag); }} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Edit className="w-4 h-4 mr-2" /> Edit Tag</Button></div>
            </div>
          </div>
        )}

        {showDeleteModal && selectedTag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-[#E5E5E5]"><h2 className="text-xl font-semibold text-red-600">Delete Tag</h2><p className="text-[#6B6B6B] mt-2">Are you sure you want to delete the tag &quot;{selectedTag.english.title || selectedTag.slug}&quot;? This action cannot be undone.</p></div>
              <div className="p-6 flex items-center justify-end gap-2"><Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedTag(null); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button><Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white transition-colors"><Trash2 className="w-4 h-4 mr-2" /> Delete Tag</Button></div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


