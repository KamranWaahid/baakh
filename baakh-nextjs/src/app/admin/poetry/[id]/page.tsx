"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  BookOpen,
  FileText,
  User,
  Tag,
  Globe,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layouts/AdminLayout";

interface PoetryItem {
  id: string;
  poetry_slug: string;
  poetry_tags: string;
  lang: string;
  visibility: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
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
    info?: string;
    source?: string;
  }>;
  poetry_couplets?: Array<{
    id: number;
    couplet_text: string;
    couplet_slug: string;
    couplet_tags?: string;
    lang: string;
  }>;
}

interface Poet {
  poet_id: number;
  poet_slug: string;
  sindhi_name: string;
  english_name: string;
}

interface Category {
  id: number;
  slug: string;
  category_details?: Array<{
    cat_name: string;
    cat_name_plural?: string;
    cat_detail?: string;
    lang: string;
  }>;
}

export default function PoetryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poetryId = params.id as string;

  const [poetry, setPoetry] = useState<PoetryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poets, setPoets] = useState<Poet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    poetry_slug: '',
    poetry_tags: '',
    lang: 'sd',
    visibility: true,
    is_featured: false,
    poet_id: '',
    category_id: '',
    translations: [] as Array<{
      id?: number;
      title: string;
      lang: string;
      info: string;
      source: string;
    }>,
    couplets: [] as Array<{
      id?: number;
      couplet_text: string;
      couplet_slug: string;
      couplet_tags: string;
      lang: string;
    }>
  });

  // Fetch poetry data
  useEffect(() => {
    if (poetryId) {
      fetchPoetry();
      fetchPoets();
      fetchCategories();
    }
  }, [poetryId]);

  const fetchPoetry = async () => {
    try {
      setLoading(true);
      console.log('Fetching poetry with ID:', poetryId);
      const response = await fetch(`/api/admin/poetry/${poetryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch poetry');
      }
      const data = await response.json();
      console.log('Poetry data received:', data);
      
      if (!data || !data.id) {
        throw new Error('Invalid poetry data received from API');
      }
      
      setPoetry(data);
      
      // Initialize form data
      const initialFormData = {
        poetry_slug: data.poetry_slug || '',
        poetry_tags: data.poetry_tags || '',
        lang: data.lang || 'sd',
        visibility: data.visibility || true,
        is_featured: data.is_featured || false,
        poet_id: data.poets?.poet_id?.toString() || '',
        category_id: data.categories?.id?.toString() || '',
        translations: data.poetry_translations?.map((t: { id: string; title: string; lang: string; info: string; source?: string }) => ({
          id: t.id,
          title: t.title || '',
          lang: t.lang || 'sd',
          info: t.info || '',
          source: t.source || ''
        })) || [],
        couplets: data.poetry_couplets?.map((c: { id: string; couplet_text: string; couplet_slug: string; couplet_tags?: string; lang: string }) => ({
          id: c.id,
          couplet_text: c.couplet_text || '',
          couplet_slug: c.couplet_slug || '',
          couplet_tags: c.couplet_tags || '',
          lang: c.lang || 'sd'
        })) || []
      };
      
      console.log('Initializing form data:', initialFormData);
      setFormData(initialFormData);
    } catch (err: unknown) {
      console.error('Error fetching poetry:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPoets = async () => {
    try {
      const response = await fetch('/api/admin/poets');
      if (response.ok) {
        const data = await response.json();
        const rawPoets = Array.isArray(data?.poets) ? data.poets : (Array.isArray(data) ? data : []);
        const mappedPoets: Poet[] = rawPoets.map((p: { poet_id?: number; id?: number; poet_slug?: string; sindhi_name?: string; english_name?: string }) => ({
          poet_id: Number(p.poet_id ?? p.id ?? 0),
          poet_slug: String(p.poet_slug ?? ''),
          sindhi_name: String(p.sindhi_name ?? ''),
          english_name: String(p.english_name ?? '')
        })).filter((p: Poet) => !!p.poet_id);
        setPoets(mappedPoets);
      }
    } catch (err) {
      console.error('Failed to fetch poets:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        const rows = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : []);
        const mappedCategories: Category[] = rows.map((row: { id?: number; slug?: string; name?: string }) => ({
          id: Number(row.id ?? 0),
          slug: String(row.slug ?? row.name ?? '')
        })).filter((c: Category) => !!c.id);
        setCategories(mappedCategories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update main poetry
      const poetryResponse = await fetch(`/api/admin/poetry/${poetryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poetry_slug: formData.poetry_slug,
          poetry_tags: formData.poetry_tags,
          lang: formData.lang,
          visibility: formData.visibility,
          is_featured: formData.is_featured,
          poet_id: parseInt(formData.poet_id),
          category_id: parseInt(formData.category_id)
        })
      });

      if (!poetryResponse.ok) {
        throw new Error('Failed to update poetry');
      }

      // Update translations
      for (const translation of formData.translations) {
        if (translation.id) {
          // Update existing translation
          await fetch(`/api/admin/poetry/translations/${translation.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: translation.title,
              lang: translation.lang,
              info: translation.info,
              source: translation.source
            })
          });
        } else {
          // Create new translation
          await fetch('/api/admin/poetry/translations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              poetry_id: parseInt(poetryId),
              title: translation.title,
              lang: translation.lang,
              info: translation.info,
              source: translation.source
            })
          });
        }
      }

      // Update couplets
      for (const couplet of formData.couplets) {
        if (couplet.id) {
          // Update existing couplet
          await fetch(`/api/admin/poetry/couplets/${couplet.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couplet_text: couplet.couplet_text,
              couplet_slug: couplet.couplet_slug,
              couplet_tags: couplet.couplet_tags,
              lang: couplet.lang
            })
          });
        } else {
          // Create new couplet
          await fetch('/api/admin/poetry/couplets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              poetry_id: parseInt(poetryId),
              couplet_text: couplet.couplet_text,
              couplet_slug: couplet.couplet_slug,
              couplet_tags: couplet.couplet_tags,
              lang: couplet.lang
            })
          });
        }
      }

      setToast({ message: 'Poetry updated successfully!', type: 'success' });
      setEditing(false);
      fetchPoetry(); // Refresh data
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addTranslation = () => {
    setFormData(prev => ({
      ...prev,
      translations: [...prev.translations, { title: '', lang: 'sd', info: '', source: '' }]
    }));
  };

  const removeTranslation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.filter((_, i) => i !== index)
    }));
  };

  const addCouplet = () => {
    setFormData(prev => ({
      ...prev,
      couplets: [...prev.couplets, { 
        couplet_text: '', 
        couplet_slug: '', 
        couplet_tags: '', 
        lang: 'sd' 
      }]
    }));
  };

  const removeCouplet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      couplets: prev.couplets.filter((_, i) => i !== index)
    }));
  };

  const updateTranslation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map((t, i) => 
        i === index ? { ...t, [field]: value } : t
      )
    }));
  };

  const updateCouplet = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      couplets: prev.couplets.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !poetry) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Poetry</h2>
            <p className="text-gray-600 mb-4">{error || 'Poetry not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Poetry Details</h1>
              <p className="text-gray-600">Manage poetry information, translations, and couplets</p>
              <div className="text-sm text-gray-500 mt-1">
                {poetry.poets ? (
                  <span>
                    Poet: {poetry.poets.english_name} (
                    <span className="sindhi-text" dir="rtl">{poetry.poets.sindhi_name}</span>
                    )
                  </span>
                ) : (
                  <span>Poet: —</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => {
                console.log('Edit button clicked, current editing state:', editing);
                console.log('Current form data:', formData);
                setEditing(true);
                console.log('Editing state set to true');
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Poetry
              </Button>
            )}
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p><strong>Editing State:</strong> {editing ? 'true' : 'false'}</p>
          <p><strong>Poetry ID:</strong> {poetryId}</p>
          <p><strong>Poetry Data:</strong> {poetry ? 'Loaded' : 'Not loaded'}</p>
          <p><strong>Form Data:</strong> {formData.poetry_slug ? 'Initialized' : 'Not initialized'}</p>
          <p><strong>Poet ID:</strong> {formData.poet_id || 'Not set'}</p>
          <p><strong>Category ID:</strong> {formData.category_id || 'Not set'}</p>
          <button 
            onClick={() => setEditing(!editing)} 
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Toggle Edit Mode
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Poetry Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Poetry Slug</Label>
                    {editing ? (
                      <Input
                        value={formData.poetry_slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, poetry_slug: e.target.value }))}
                        placeholder="poetry-slug"
                        className="bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-gray-300"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">{poetry.poetry_slug}</div>
                    )}
                  </div>
                  <div>
                    <Label>Language</Label>
                    {editing ? (
                      <Select value={formData.lang} onValueChange={(value) => setFormData(prev => ({ ...prev, lang: value }))}>
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-md">
                          <SelectItem value="sd" className="focus:bg-gray-100">Sindhi</SelectItem>
                          <SelectItem value="en" className="focus:bg-gray-100">English</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        <Badge variant={poetry.lang === 'sd' ? 'default' : 'secondary'}>
                          {poetry.lang === 'sd' ? 'Sindhi' : 'English'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200" />

                <div>
                  <Label>Tags</Label>
                  {editing ? (
                    <Input
                      value={formData.poetry_tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, poetry_tags: e.target.value }))}
                      placeholder="comma, separated, tags"
                      className="bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-gray-300"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      {poetry.poetry_tags || 'No tags'}
                    </div>
                  )}
                </div>

                <div className="my-4 border-t border-gray-200" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visibility"
                      checked={editing ? formData.visibility : poetry.visibility}
                      onCheckedChange={(checked) => editing && setFormData(prev => ({ ...prev, visibility: checked }))}
                      disabled={!editing}
                    />
                    <Label htmlFor="visibility">Publicly Visible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={editing ? formData.is_featured : poetry.is_featured}
                      onCheckedChange={(checked) => editing && setFormData(prev => ({ ...prev, is_featured: checked }))}
                      disabled={!editing}
                    />
                    <Label htmlFor="featured">Featured Poetry</Label>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Poet</Label>
                    {editing ? (
                      <Select value={formData.poet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, poet_id: value }))}>
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select poet" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-md max-h-72">
                          {poets.map((poet) => (
                            <SelectItem key={poet.poet_id} value={poet.poet_id.toString()} className="focus:bg-gray-100">
                              {poet.english_name} (<span className="sindhi-text" dir="rtl">{poet.sindhi_name}</span>)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {poetry.poets?.english_name || 'Unknown poet'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Category</Label>
                    {editing ? (
                      <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-md max-h-72">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()} className="focus:bg-gray-100">
                              {category.slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        {poetry.categories?.slug || 'Uncategorized'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translations */}
            <Card className="shadow-sm border border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Translations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing && (
                  <Button onClick={addTranslation} variant="outline" size="sm" className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Translation
                  </Button>
                )}
                
                <div className="space-y-4">
                  {formData.translations.map((translation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Translation {index + 1}</Label>
                        {editing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTranslation(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          {editing ? (
                            <Input
                              value={translation.title}
                              onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                              placeholder="Translation title"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded border">{translation.title}</div>
                          )}
                        </div>
                        <div>
                          <Label>Language</Label>
                          {editing ? (
                            <Select value={translation.lang} onValueChange={(value) => updateTranslation(index, 'lang', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sd">Sindhi</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-2 bg-gray-50 rounded border">
                              <Badge variant={translation.lang === 'sd' ? 'default' : 'secondary'}>
                                {translation.lang === 'sd' ? 'Sindhi' : 'English'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="my-3 border-t border-gray-200" />
                      
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label>Additional Info</Label>
                          {editing ? (
                            <Textarea
                              value={translation.info}
                              onChange={(e) => updateTranslation(index, 'info', e.target.value)}
                              placeholder="Additional information about this translation"
                              rows={2}
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded border">{translation.info || 'No additional info'}</div>
                          )}
                        </div>
                        <div>
                          <Label>Source</Label>
                          {editing ? (
                            <Input
                              value={translation.source}
                              onChange={(e) => updateTranslation(index, 'source', e.target.value)}
                              placeholder="Source of this translation"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded border">{translation.source || 'No source specified'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.translations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No translations available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Couplets */}
            <Card className="shadow-sm border border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Couplets ({formData.couplets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing && (
                  <Button onClick={addCouplet} variant="outline" size="sm" className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Couplet
                  </Button>
                )}
                
                <div className="space-y-4">
                  {formData.couplets.map((couplet, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Couplet {index + 1}</Label>
                        {editing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCouplet(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Couplet Text</Label>
                          {editing ? (
                            <Textarea
                              value={couplet.couplet_text}
                              onChange={(e) => updateCouplet(index, 'couplet_text', e.target.value)}
                              placeholder="Enter couplet text (supports multiple lines)"
                              rows={2}
                              className="whitespace-pre-wrap"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded border font-medium whitespace-pre-wrap">
                              {couplet.couplet_text}
                            </div>
                          )}
                        </div>

                        <div className="my-3 border-t border-gray-200" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Slug</Label>
                            {editing ? (
                              <Input
                                value={couplet.couplet_slug}
                                onChange={(e) => updateCouplet(index, 'couplet_slug', e.target.value)}
                                placeholder="couplet-slug"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded border text-sm">{couplet.couplet_slug}</div>
                            )}
                          </div>
                          <div>
                            <Label>Tags</Label>
                            {editing ? (
                              <Input
                                value={couplet.couplet_tags}
                                onChange={(e) => updateCouplet(index, 'couplet_tags', e.target.value)}
                                placeholder="comma, separated, tags"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded border text-sm">{couplet.couplet_tags || 'No tags'}</div>
                            )}
                          </div>
                          <div>
                            <Label>Language</Label>
                            {editing ? (
                              <Select value={couplet.lang} onValueChange={(value) => updateCouplet(index, 'lang', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sd">Sindhi</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-2 bg-gray-50 rounded border">
                                <Badge variant={couplet.lang === 'sd' ? 'default' : 'secondary'}>
                                  {couplet.lang === 'sd' ? 'Sindhi' : 'English'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.couplets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No couplets available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Status & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <Badge variant={poetry.visibility ? 'default' : 'secondary'}>
                    {poetry.visibility ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Featured</span>
                  <Badge variant={poetry.is_featured ? 'default' : 'secondary'}>
                    {poetry.is_featured ? 'Featured' : 'Not Featured'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Language</span>
                  <Badge variant={poetry.lang === 'sd' ? 'default' : 'secondary'}>
                    {poetry.lang === 'sd' ? 'Sindhi' : 'English'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Created</Label>
                  <div className="text-sm font-medium">
                    {new Date(poetry.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Last Updated</Label>
                  <div className="text-sm font-medium">
                    {new Date(poetry.updated_at).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Translations</span>
                  <Badge variant="outline">{formData.translations.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Couplets</span>
                  <Badge variant="outline">{formData.couplets.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tags</span>
                  <Badge variant="outline">
                    {formData.poetry_tags ? formData.poetry_tags.split(',').length : 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
    </AdminLayout>
  );
}
