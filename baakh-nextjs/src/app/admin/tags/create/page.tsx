"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Languages, Tag as TagIcon, Link2, Asterisk } from "lucide-react";
import { toast } from "sonner";

type TagType = "Poetry" | "Poet" | "Topic" | "Form" | "Theme";

type Locale = {
  title: string;
  details: string;
};

type TagDraft = {
  id: string;
  slug: string;
  type: TagType;
  sindhi: Locale;
  english: Locale;
};

export default function CreateTagPage() {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<TagDraft>({
    id: crypto.randomUUID(),
    slug: "",
    type: "Topic",
    sindhi: { title: "", details: "" },
    english: { title: "", details: "" },
  });

  const canonicalSlug = useMemo(() => {
    const base = (draft.english.title || draft.sindhi.title).trim();
    return base.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
  }, [draft.english.title, draft.sindhi.title]);

  if (!slugTouched && draft.slug !== canonicalSlug) {
    // sync once per render cycle until touched
    setTimeout(() => {
      if (!slugTouched) setDraft((d) => ({ ...d, slug: canonicalSlug }));
    }, 0);
  }

  const isNonEmpty = (v?: string) => Boolean(v && v.trim().length > 0);
  const canSave = (
    isNonEmpty(draft.slug) &&
    isNonEmpty(draft.sindhi.title) && isNonEmpty(draft.sindhi.details) &&
    isNonEmpty(draft.english.title) && isNonEmpty(draft.english.details)
  );

  const save = async () => {
    if (!canSave) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: draft.slug,
          type: draft.type,
          sindhi: draft.sindhi,
          english: draft.english,
        }),
      });

      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json?.error || "Failed to save tag");
      }

      toast.success("Tag created successfully!");
      router.push("/admin/tags");
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(`Failed to save tag: ${e.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs mb-1">Create</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">Add Tag</h1>
            <p className="text-muted-foreground">Bilingual tags for poetry, topics, forms, and themes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => router.push("/admin/tags")}>
              <ArrowLeft className="w-4 h-4 mr-2"/> Back
            </Button>
            <Button 
              className="rounded-full" 
              disabled={!canSave || loading} 
              onClick={save}
            >
              <Save className="w-4 h-4 mr-2"/> 
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <Card className="rounded-xl ring-1 ring-border/60 bg-card/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base inline-flex items-center gap-2">
                <TagIcon className="w-4 h-4"/> Tag
              </CardTitle>
              <CardDescription>Slug and classification</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm inline-flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5"/> Tag Slug
                </Label>
                <Input 
                  aria-invalid={!isNonEmpty(draft.slug)} 
                  value={draft.slug} 
                  onChange={(e) => {
                    setSlugTouched(true);
                    setDraft({ ...draft, slug: e.target.value });
                  }} 
                  placeholder="tag-slug" 
                  className="mt-2" 
                />
                {!isNonEmpty(draft.slug) && (
                  <p className="mt-1 text-xs text-destructive">Slug is required</p>
                )}
              </div>
              <div>
                <Label className="text-sm">Tag Type</Label>
                <Select 
                  value={draft.type} 
                  onValueChange={(v: any) => setDraft({ ...draft, type: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Type"/>
                  </SelectTrigger>
                  <SelectContent>
                    {(["Poetry", "Poet", "Topic", "Form", "Theme"] as TagType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Guide */}
          <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base inline-flex items-center gap-2">
                <Languages className="w-4 h-4"/> Multilingual
              </CardTitle>
              <CardDescription>Fill both languages to enable save.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Use concise titles. Details can explain usage, theme, or historical context.</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">EN</Badge>
                  <span>English content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">SD</Badge>
                  <span>Sindhi content (RTL)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">Sindhi</CardTitle>
              <CardDescription>Title and details (RTL)</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm inline-flex items-center gap-1">
                  Tag Title <Asterisk className="w-3 h-3 text-muted-foreground"/>
                </Label>
                <Input 
                  dir="rtl" 
                  aria-invalid={!isNonEmpty(draft.sindhi.title)} 
                  value={draft.sindhi.title} 
                  onChange={(e) => setDraft({ 
                    ...draft, 
                    sindhi: { ...draft.sindhi, title: e.target.value } 
                  })} 
                  placeholder="Tag Title" 
                  className="mt-2" 
                />
                {!isNonEmpty(draft.sindhi.title) && (
                  <p className="mt-1 text-xs text-destructive">Sindhi title is required</p>
                )}
              </div>
              <div>
                <Label className="text-sm">Details</Label>
                <Textarea 
                  dir="rtl" 
                  aria-invalid={!isNonEmpty(draft.sindhi.details)} 
                  value={draft.sindhi.details} 
                  onChange={(e) => setDraft({ 
                    ...draft, 
                    sindhi: { ...draft.sindhi, details: e.target.value } 
                  })} 
                  placeholder="Insert description..." 
                  className="mt-2 min-h-28" 
                />
                {!isNonEmpty(draft.sindhi.details) && (
                  <p className="mt-1 text-xs text-destructive">Sindhi details are required</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl ring-1 ring-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">English</CardTitle>
              <CardDescription>Title and details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm inline-flex items-center gap-1">
                  Tag Title <Asterisk className="w-3 h-3 text-muted-foreground"/>
                </Label>
                <Input 
                  aria-invalid={!isNonEmpty(draft.english.title)} 
                  value={draft.english.title} 
                  onChange={(e) => setDraft({ 
                    ...draft, 
                    english: { ...draft.english, title: e.target.value } 
                  })} 
                  placeholder="Tag Title" 
                  className="mt-2" 
                />
                {!isNonEmpty(draft.english.title) && (
                  <p className="mt-1 text-xs text-destructive">English title is required</p>
                )}
              </div>
              <div>
                <Label className="text-sm">Details</Label>
                <Textarea 
                  aria-invalid={!isNonEmpty(draft.english.details)} 
                  value={draft.english.details} 
                  onChange={(e) => setDraft({ 
                    ...draft, 
                    english: { ...draft.english, details: e.target.value } 
                  })} 
                  placeholder="Insert description..." 
                  className="mt-2 min-h-28" 
                />
                {!isNonEmpty(draft.english.details) && (
                  <p className="mt-1 text-xs text-destructive">English details are required</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            className="rounded-full" 
            onClick={() => router.push("/admin/tags")}
          >
            Cancel
          </Button>
          <Button 
            className="rounded-full" 
            disabled={!canSave || loading} 
            onClick={save}
          >
            <Save className="w-4 h-4 mr-2"/> 
            {loading ? "Saving..." : "Save Tag"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}


