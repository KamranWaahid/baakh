"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wand2, Save, Languages, Info, Link2, Text, Asterisk, Edit, Loader2 } from "lucide-react";

type Gender = "masculine" | "feminine" | "neutral";

type LocalizedFields = {
  name: string;
  plural: string;
  details: string;
};

type CategoryData = {
  id: string;
  slug: string;
  isFeatured: boolean;
  contentStyle: string;
  gender: string;
  english: LocalizedFields;
  sindhi: LocalizedFields;
};

type ContentStyle = "Classic" | "Modern" | "Didactic" | "Mystic" | "Narrative";

const styles = ["Classic", "Modern", "Didactic", "Mystic", "Narrative"];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Fetch category data on component mount
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/categories?id=${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        
        const data = await response.json();
        setCategory(data.category);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Auto-generate slug from name changes
  useEffect(() => {
    if (!slugTouched && category) {
      const base = (category.english.name || category.sindhi.name || '').trim();
      const newSlug = base.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
      setCategory(prev => prev ? { ...prev, slug: newSlug } : null);
    }
  }, [category?.english.name, category?.sindhi.name, slugTouched]);

  const isNonEmpty = (v?: string) => Boolean(v && v.trim().length > 0);
  
  const errors = {
    slug: !isNonEmpty(category?.slug),
    sindhi: {
      name: !isNonEmpty(category?.sindhi.name),
      plural: !isNonEmpty(category?.sindhi.plural),
      details: !isNonEmpty(category?.sindhi.details),
    },
    english: {
      name: !isNonEmpty(category?.english.name),
      plural: !isNonEmpty(category?.english.plural),
      details: !isNonEmpty(category?.english.details),
    },
  };

  const canSave = () => {
    return category && (
      !errors.slug &&
      !errors.sindhi.name && !errors.sindhi.plural && !errors.sindhi.details &&
      !errors.english.name && !errors.english.plural && !errors.english.details
    );
  };

  const save = async () => {
    if (!canSave() || !category) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category.id,
          slug: category.slug,
          english: { 
            name: category.english.name, 
            plural: category.english.plural, 
            details: category.english.details 
          },
          sindhi: { 
            name: category.sindhi.name, 
            plural: category.sindhi.plural, 
            details: category.sindhi.details 
          },
          contentStyle: category.contentStyle,
          gender: category.gender,
          isFeatured: category.isFeatured,
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      
      // Show success and redirect
      alert('Category updated successfully!');
      router.push("/admin/categories");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to save category: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#E5E5E5] rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-[#1F1F1F]">Loading category...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !category) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Edit className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F]">Category Not Found</h1>
              <p className="text-base text-[#6B6B6B]">{error || 'The requested category could not be found'}</p>
            </div>
            <Button onClick={() => router.push('/admin/categories')} className="bg-[#1F1F1F] hover:bg-[#404040] text-white px-6 py-2 rounded-lg">
              Back to Categories
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
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Category
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Edit Category</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Update the category details and multilingual content
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
                  disabled={!canSave() || saving} 
                  onClick={save}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                  Update canonical fields and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F]">Category ID</Label>
                    <Input 
                      value={category.id} 
                      disabled
                      className="border-[#E5E5E5] bg-[#F4F4F5] text-[#6B6B6B] rounded-lg cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1F1F1F] flex items-center">
                      <Link2 className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                      Category Slug / URL
                    </Label>
                    <Input 
                      aria-invalid={errors.slug} 
                      value={category.slug} 
                      onChange={(e)=>{ 
                        setSlugTouched(true); 
                        setCategory({ ...category, slug: e.target.value }); 
                      }} 
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
                    <Select value={category.contentStyle} onValueChange={(v: ContentStyle) => setCategory({ ...category, contentStyle: v })}>
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
                    <Select value={category.gender} onValueChange={(v: Gender) => setCategory({ ...category, gender: v })}>
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
                          category.isFeatured === opt.value 
                            ? 'bg-[#1F1F1F] text-white' 
                            : 'text-[#6B6B6B] hover:bg-[#F4F4F5]'
                        }`}
                        onClick={()=>setCategory({ ...category, isFeatured: opt.value })}
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
                  Best practices for editing categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#6B6B6B]">
                <div className="space-y-2">
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Keep the slug stable to avoid breaking existing links.
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Update both languages to maintain consistency.
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Test changes before saving to ensure quality.
                  </p>
                </div>
                <div className="p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                  <div className="font-medium text-[#1F1F1F] mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                    Pro Tip
                  </div>
                  <p className="text-sm">
                    When editing categories, consider the impact on existing content and ensure all language versions remain synchronized.
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
                    value={category.sindhi.name} 
                    onChange={(e)=>setCategory({ ...category, sindhi: { ...category.sindhi, name: e.target.value } })} 
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
                    value={category.sindhi.plural} 
                    onChange={(e)=>setCategory({ ...category, sindhi: { ...category.sindhi, plural: e.target.value } })} 
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
                    value={category.sindhi.details} 
                    onChange={(e)=>setCategory({ ...category, sindhi: { ...category.sindhi, details: e.target.value } })} 
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
                    value={category.english.name} 
                    onChange={(e)=>setCategory({ ...category, english: { ...category.english, name: e.target.value } })} 
                    placeholder="Enter Category Name" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.english.name && (<p className="text-xs text-red-600">English name is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Category Plural</Label>
                  <Input 
                    aria-invalid={errors.english.plural} 
                    value={category.english.plural} 
                    onChange={(e)=>setCategory({ ...category, english: { ...category.english, plural: e.target.value } })} 
                    placeholder="Insert Category Plural" 
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" 
                  />
                  {errors.english.plural && (<p className="text-xs text-red-600">English plural is required</p>)}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1F1F1F]">Details</Label>
                  <Textarea 
                    aria-invalid={errors.english.details} 
                    value={category.english.details} 
                    onChange={(e)=>setCategory({ ...category, english: { ...category.english, details: e.target.value } })} 
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
              disabled={!canSave() || saving} 
              onClick={save}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
