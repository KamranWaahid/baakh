"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Filter, Tag as TagIcon, Eye, X, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type TagType = "Era / Tradition" | "Language" | "Identity / Group" | "Form / Style" | "Theme / Subject" | "Region / Locale" | "Stage / Career" | "Influence / Aesthetic" | "Genre / Output" | "Script / Metadata";

type PoetTag = {
  id: string;
  slug: string;
  label: string;
  tag_type: string;
  created_at: string;
  updated_at: string;
  sindhi: { title: string; details: string };
  english: { title: string; details: string };
};

type FormData = {
  slug: string;
  type: string;
  sindhi: { title: string; details: string };
  english: { title: string; details: string };
};

export default function PoetTagsPage() {
  const [tags, setTags] = useState<PoetTag[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<PoetTag | null>(null);
  const [form, setForm] = useState<FormData>({ slug: "", type: "Era / Tradition", sindhi: { title: "", details: "" }, english: { title: "", details: "" } });

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (type) params.set("type", type);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`/api/admin/poet-tags?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load poet tags");
      setTags(json.tags || []);
      setTotal(json.total || 0);
      setTypes(json.types || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load poet tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, type, page, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const resetForm = () => setForm({ slug: "", type: "Era / Tradition", sindhi: { title: "", details: "" }, english: { title: "", details: "" } });

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/poet-tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create");
      toast.success("Poet tag created");
      setShowCreate(false);
      resetForm();
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/admin/poet-tags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...form }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update");
      toast.success("Poet tag updated");
      setShowEdit(false);
      setSelected(null);
      resetForm();
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/poet-tags?id=${selected.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete");
      toast.success("Poet tag deleted");
      setShowDelete(false);
      setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  const setForEdit = (t: PoetTag) => {
    setSelected(t);
    setForm({ slug: t.slug, type: t.tag_type || "", sindhi: { title: t.sindhi.title, details: t.sindhi.details }, english: { title: t.english.title, details: t.english.details } });
    setShowEdit(true);
  };

  const typeBadge = (t: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border";
    
    switch (t) {
      case "Era / Tradition":
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
      case "Language":
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case "Identity / Group":
        return `${baseClasses} bg-purple-100 text-purple-800 border-purple-200`;
      case "Form / Style":
        return `${baseClasses} bg-orange-100 text-orange-800 border-orange-200`;
      case "Theme / Subject":
        return `${baseClasses} bg-pink-100 text-pink-800 border-pink-200`;
      case "Region / Locale":
        return `${baseClasses} bg-indigo-100 text-indigo-800 border-indigo-200`;
      case "Stage / Career":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case "Influence / Aesthetic":
        return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      case "Genre / Output":
        return `${baseClasses} bg-teal-100 text-teal-800 border-teal-200`;
      case "Script / Metadata":
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
      default:
        return `${baseClasses} bg-[#F4F4F5] text-[#1F1F1F] border-[#E5E5E5]`;
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case "Era / Tradition":
        return "bg-blue-500";
      case "Language":
        return "bg-green-500";
      case "Identity / Group":
        return "bg-purple-500";
      case "Form / Style":
        return "bg-orange-500";
      case "Theme / Subject":
        return "bg-pink-500";
      case "Region / Locale":
        return "bg-indigo-500";
      case "Stage / Career":
        return "bg-yellow-500";
      case "Influence / Aesthetic":
        return "bg-red-500";
      case "Genre / Output":
        return "bg-teal-500";
      case "Script / Metadata":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Poet Tags
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Tags & Topics</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">Manage bilingual tags for poets (era, language, identity, form, theme, region, career, influence, genre, script...).</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button onClick={() => setShowCreate(true)} className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg">
                  <Plus className="w-4 h-4 mr-2" /> New Poet Tag
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#6B6B6B] font-medium">Show</span>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[90px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      {[10, 25, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[#6B6B6B] font-medium">entries</span>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={type || "all"} onValueChange={(v: any) => { setType(v === "all" ? "" : v); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[160px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                      <SelectItem value="all" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Types</SelectItem>
                      {types.map((t) => (
                        <SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(t)}`}></div>
                            {t}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative flex-1 max-w-md">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                  <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search poet tags..." className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden mb-8">
            <CardHeader className="py-6">
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold text-[#1F1F1F]">Poet Tag List</CardTitle>
                <CardDescription className="text-base text-[#6B6B6B]">{total} tags found • Showing {tags.length} of {total}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
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
                ) : tags.length === 0 ? (
                  <div className="p-16 text-center text-[#6B6B6B]">
                    <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium text-[#1F1F1F]">No poet tags yet</p>
                    <p className="text-sm">Create your first poet tag to get started</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9F9F9] text-[#1F1F1F]">
                      <tr className="border-b border-[#E5E5E5]">
                        <th className="text-left font-semibold px-4 py-3">Tag</th>
                        <th className="text-left font-semibold px-4 py-3">Type</th>
                        <th className="text-left font-semibold px-4 py-3">Languages</th>
                        <th className="text-left font-semibold px-4 py-3">Created</th>
                        <th className="text-right font-semibold px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tags.map((tag) => (
                        <tr key={tag.id} className="border-b border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors duration-200">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full bg-[#F4F4F5] border border-[#E5E5E5]`}>
                                <TagIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-[#1F1F1F]">{tag.english.title || tag.label}</div>
                                <div className="text-xs text-[#6B6B6B] font-mono">{tag.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={typeBadge(tag.tag_type)}>{tag.tag_type || "—"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">SD</div>
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1F1F1F] text-white">EN</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#6B6B6B]">{new Date(tag.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" onClick={() => { setSelected(tag); setShowView(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" onClick={() => setForEdit(tag)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors" onClick={() => { setSelected(tag); setShowDelete(true); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
              <div className="text-sm text-[#6B6B6B] font-medium">Showing {tags.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <span className="text-sm text-[#6B6B6B] px-4 font-medium">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Create Poet Tag</h2><Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); resetForm(); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Slug</label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="poet-tag-slug" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Type</label>
                    <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        {(["Era / Tradition", "Language", "Identity / Group", "Form / Style", "Theme / Subject", "Region / Locale", "Stage / Career", "Influence / Aesthetic", "Genre / Output", "Script / Metadata"] as TagType[]).map(t => (
                          <SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(t)}`}></div>
                              {t}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Sindhi Title</label>
                    <Input dir="rtl" value={form.sindhi.title} onChange={(e) => setForm({ ...form, sindhi: { ...form.sindhi, title: e.target.value } })} placeholder="Title (Sindhi)" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">Sindhi Details</label>
                    <Textarea dir="rtl" value={form.sindhi.details} onChange={(e) => setForm({ ...form, sindhi: { ...form.sindhi, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">English Title</label>
                    <Input value={form.english.title} onChange={(e) => setForm({ ...form, english: { ...form.english, title: e.target.value } })} placeholder="Title (English)" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">English Details</label>
                    <Textarea value={form.english.details} onChange={(e) => setForm({ ...form, english: { ...form.english, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.slug || !form.sindhi.title || !form.english.title} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Save className="w-4 h-4 mr-2" /> Create Poet Tag</Button>
              </div>
            </div>
          </div>
        )}

        {showEdit && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Edit Poet Tag</h2><Button variant="ghost" size="sm" onClick={() => { setShowEdit(false); setSelected(null); resetForm(); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Slug</label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="poet-tag-slug" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Type</label>
                    <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        {(["Era / Tradition", "Language", "Identity / Group", "Form / Style", "Theme / Subject", "Region / Locale", "Stage / Career", "Influence / Aesthetic", "Genre / Output", "Script / Metadata"] as TagType[]).map(t => (
                          <SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(t)}`}></div>
                              {t}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">Sindhi Title</label>
                    <Input dir="rtl" value={form.sindhi.title} onChange={(e) => setForm({ ...form, sindhi: { ...form.sindhi, title: e.target.value } })} placeholder="Title (Sindhi)" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">Sindhi Details</label>
                    <Textarea dir="rtl" value={form.sindhi.details} onChange={(e) => setForm({ ...form, sindhi: { ...form.sindhi, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1F1F1F]">English Title</label>
                    <Input value={form.english.title} onChange={(e) => setForm({ ...form, english: { ...form.english, title: e.target.value } })} placeholder="Title (English)" className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                    <label className="text-sm font-medium mt-3 block text-[#1F1F1F]">English Details</label>
                    <Textarea value={form.english.details} onChange={(e) => setForm({ ...form, english: { ...form.english, details: e.target.value } })} placeholder="Insert description..." className="mt-2 min-h-20 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowEdit(false); setSelected(null); resetForm(); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button>
                <Button onClick={handleUpdate} disabled={!form.slug || !form.sindhi.title || !form.english.title} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Save className="w-4 h-4 mr-2" /> Update Poet Tag</Button>
              </div>
            </div>
          </div>
        )}

        {showView && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E5E5E5]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#1F1F1F]">Poet Tag Details</h2><Button variant="ghost" size="sm" onClick={() => { setShowView(false); setSelected(null); }} className="hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"><X className="w-4 h-4" /></Button></div></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">Slug</label>
                    <p className="mt-1 font-mono bg-[#F4F4F5] p-2 rounded text-[#1F1F1F]">{selected.slug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">Type</label>
                    <div className="mt-1"><div className={typeBadge(selected.tag_type)}>{selected.tag_type || "—"}</div></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">Sindhi</label>
                    <div className="mt-1 space-y-2"><div className="bg-[#F4F4F5] p-3 rounded border border-[#E5E5E5]"><div className="font-medium text-[#1F1F1F]" dir="rtl">{selected.sindhi.title || "Not set"}</div><div className="text-sm text-[#6B6B6B] mt-1" dir="rtl">{selected.sindhi.details || "No description"}</div></div></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#6B6B6B]">English</label>
                    <div className="mt-1 space-y-2"><div className="bg-[#F4F4F5] p-3 rounded border border-[#E5E5E5]"><div className="font-medium text-[#1F1F1F]">{selected.english.title || "Not set"}</div><div className="text-sm text-[#6B6B6B] mt-1">{selected.english.details || "No description"}</div></div></div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B6B6B]">Created</label>
                  <p className="mt-1 text-sm text-[#1F1F1F]">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowView(false); setSelected(null); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Close</Button>
                <Button onClick={() => { setShowView(false); setForEdit(selected); }} className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
              </div>
            </div>
          </div>
        )}

        {showDelete && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-[#E5E5E5]"><h2 className="text-xl font-semibold text-red-600">Delete Poet Tag</h2><p className="text-[#6B6B6B] mt-2">Are you sure you want to delete the poet tag "{selected.english.title || selected.slug}"? This action cannot be undone.</p></div>
              <div className="p-6 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null); }} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors">Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white transition-colors"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


