"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wand2, Save, Languages, Info, Link2, Text, Asterisk, Plus } from "lucide-react";

type Gender = "masculine" | "feminine" | "neutral";

type LocalizedFields = {
  name: string;
  plural: string;
  details: string;
};

type CategoryDraft = {
  id: string;
  key: string; // canonical key
  slug: string;
  contentStyle: string;
  gender: Gender;
  isFeatured: boolean;
  sindhi: LocalizedFields;
  english: LocalizedFields;
};

type ContentStyle = "Classic" | "Modern" | "Didactic" | "Mystic" | "Narrative";

const styles = ["Classic", "Modern", "Didactic", "Mystic", "Narrative"];

export default function CreateCategoryPage() {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const [draft, setDraft] = useState<CategoryDraft>({
    id: crypto.randomUUID(),
    key: "",
    slug: "",
    contentStyle: styles[0],
    gender: "neutral",
    isFeatured: false,
    sindhi: { name: "", plural: "", details: "" },
    english: { name: "", plural: "", details: "" },
  });

  const isNonEmpty = (v?: string) => Boolean(v && v.trim().length > 0);
  const errors = {
    slug: !isNonEmpty(draft.slug),
    sindhi: {
      name: !isNonEmpty(draft.sindhi.name),
      plural: !isNonEmpty(draft.sindhi.plural),
      details: !isNonEmpty(draft.sindhi.details),
    },
    english: {
      name: !isNonEmpty(draft.english.name),
      plural: !isNonEmpty(draft.english.plural),
      details: !isNonEmpty(draft.english.details),
    },
  };

  const canonicalKey = useCallback(() => {
    const base = (draft.english.name || draft.sindhi.name || draft.key).trim();
    return base.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
  }, [draft.english.name, draft.sindhi.name, draft.key]);

  useEffect(() => {
    if (!slugTouched) {
      setDraft((d) => ({ ...d, slug: canonicalKey() }));
    }
  }, [draft.english.name, draft.sindhi.name, draft.key, slugTouched, canonicalKey]);

  const canSave = () => {
    return (
      !errors.slug &&
      !errors.sindhi.name && !errors.sindhi.plural && !errors.sindhi.details &&
      !errors.english.name && !errors.english.plural && !errors.english.details
    );
  };

  const save = async () => {
    if (!canSave()) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: draft.key,
          slug: draft.slug,
          english: { name: draft.english.name, plural: draft.english.plural, details: draft.english.details },
          sindhi: { name: draft.sindhi.name, plural: draft.sindhi.plural, details: draft.sindhi.details },
          contentStyle: draft.contentStyle,
          gender: draft.gender,
          isFeatured: draft.isFeatured,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      router.push("/admin/categories");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to save category: ${errorMessage}`);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                    <Plus className="w-3 h-3 mr-1" />
                    Create Category
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Add New Category</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Create a new poetry category with multilingual support and detailed metadata
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors rounded-lg"
                  onClick={() => router.push("/admin/categories")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Button>
                <Button 
                  className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors rounded-lg"
                  disabled={!canSave()} 
                  onClick={save}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Category
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  <Wand2 className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                  Category Details
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Canonical fields and metadata for the new category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F]">Category Key</Label>
                    <Input 
                      value={draft.key} 
                      onChange={(e)=>setDraft({ ...draft, key: e.target.value })} 
                      placeholder="Enter category key" 
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                      <Link2 className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                      Category Slug / URL
                    </Label>
                    <Input 
                      aria-invalid={errors.slug} 
                      value={draft.slug} 
                      onChange={(e)=>{ setSlugTouched(true); setDraft({ ...draft, slug: e.target.value }); }} 
                      placeholder="enter-category-slug" 
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                    />
                    {errors.slug && (<p className="text-xs text-red-600">Slug is required</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                      <Wand2 className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                      Content Style
                    </Label>
                    <Select value={draft.contentStyle} onValueChange={(v: ContentStyle) => setDraft({ ...draft, contentStyle: v })}>
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue placeholder="Select Style"/>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        {styles.map((s)=> (
                          <SelectItem key={s} value={s} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                      <Text className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                      Gender
                    </Label>
                    <Select value={draft.gender} onValueChange={(v: Gender) => setDraft({ ...draft, gender: v })}>
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue placeholder="Select Gender"/>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        <SelectItem value="masculine" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Masculine (مذڪر)</SelectItem>
                        <SelectItem value="feminine" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Feminine (مونث)</SelectItem>
                        <SelectItem value="neutral" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Featured Category</Label>
                  <div className="inline-flex rounded-lg border border-[#E5E5E5] p-1 bg-white">
                    {[
                      { label: "No", value: false },
                      { label: "Yes", value: true },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                          draft.isFeatured === opt.value 
                            ? 'bg-[#1F1F1F] text-white' 
                            : 'text-[#6B6B6B] hover:bg-[#F4F4F5]'
                        }`}
                        onClick={()=>setDraft({ ...draft, isFeatured: opt.value })}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                  Guidelines
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Best practices for creating multilingual categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#6B6B6B]">
                <div className="space-y-2">
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Prefer English name for slug if available; fallback to Sindhi.
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use plural thoughtfully (e.g., ghazals, nazams) for lists.
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Details should describe form, meter, or usage context.
                  </p>
                </div>
                <div className="p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                  <div className="font-medium text-[#1F1F1F] mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                    Pro Tip
                  </div>
                  <p className="text-sm">
                    Keep canonical key and slug stable; attach language-specific labels, plurals, and descriptions as localized fields.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Localized sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  Sindhi
                  <Badge className="ml-2 bg-[#1F1F1F] text-white text-xs">NameSindhi</Badge>
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Labels and details in Sindhi language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                    Name <Asterisk className="w-3 h-3 text-red-500 ml-1"/>
                  </Label>
                  <Input 
                    aria-invalid={errors.sindhi.name} 
                    dir="rtl" 
                    value={draft.sindhi.name} 
                    onChange={(e)=>setDraft({ ...draft, sindhi: { ...draft.sindhi, name: e.target.value } })} 
                    placeholder="Enter Category Name" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.sindhi.name && (<p className="text-xs text-red-600">Sindhi name is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Category Plural</Label>
                  <Input 
                    aria-invalid={errors.sindhi.plural} 
                    dir="rtl" 
                    value={draft.sindhi.plural} 
                    onChange={(e)=>setDraft({ ...draft, sindhi: { ...draft.sindhi, plural: e.target.value } })} 
                    placeholder="Insert Category Plural" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.sindhi.plural && (<p className="text-xs text-red-600">Sindhi plural is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Details</Label>
                  <Textarea 
                    aria-invalid={errors.sindhi.details} 
                    dir="rtl" 
                    value={draft.sindhi.details} 
                    onChange={(e)=>setDraft({ ...draft, sindhi: { ...draft.sindhi, details: e.target.value } })} 
                    placeholder="Insert description..." 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors min-h-28" 
                  />
                  {errors.sindhi.details && (<p className="text-xs text-red-600">Sindhi details are required</p>)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  English
                  <Badge variant="outline" className="ml-2 border-[#E5E5E5] text-[#6B6B6B] bg-white text-xs">NameEnglish</Badge>
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Labels and details in English language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                    Name <Asterisk className="w-3 h-3 text-red-500 ml-1"/>
                  </Label>
                  <Input 
                    aria-invalid={errors.english.name} 
                    value={draft.english.name} 
                    onChange={(e)=>setDraft({ ...draft, english: { ...draft.english, name: e.target.value } })} 
                    placeholder="Enter Category Name" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.english.name && (<p className="text-xs text-red-600">English name is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Category Plural</Label>
                  <Input 
                    aria-invalid={errors.english.plural} 
                    value={draft.english.plural} 
                    onChange={(e)=>setDraft({ ...draft, english: { ...draft.english, plural: e.target.value } })} 
                    placeholder="Insert Category Plural" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.english.plural && (<p className="text-xs text-red-600">English plural is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Details</Label>
                  <Textarea 
                    aria-invalid={errors.english.details} 
                    value={draft.english.details} 
                    onChange={(e)=>setDraft({ ...draft, english: { ...draft.english, details: e.target.value } })} 
                    placeholder="Insert description..." 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors min-h-28" 
                  />
                  {errors.english.details && (<p className="text-xs text-red-600">English details are required</p>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
            <Button 
              variant="outline" 
              className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors rounded-lg"
              onClick={() => router.push("/admin/categories")}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors rounded-lg"
              disabled={!canSave()} 
              onClick={save}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Category
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


