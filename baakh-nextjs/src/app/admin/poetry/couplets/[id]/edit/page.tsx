"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  Quote,
  User,
  BookOpen,
  Tag,
  Globe,
  Calendar,
  Plus,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AdminLayout from "@/components/layouts/AdminLayout";

interface CoupletData {
  id: number;
  couplet_text: string;
  couplet_slug: string;
  couplet_tags: string;
  lang: string;
  created_at: string;
  updated_at: string;
  poets: {
    poet_id: number;
    poet_slug: string;
    sindhi_name: string;
    english_name: string;
    sindhi_laqab?: string;
    english_laqab?: string;
    file_url?: string;
  };
  poetry_main: {
    id: string;
    poetry_slug: string;
    poetry_tags: string;
    visibility: boolean;
    is_featured: boolean;
  };
  categories: {
    id: number;
    slug: string;
  };
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

interface Poet {
  poet_id: number;
  poet_slug: string;
  sindhi_name: string;
  english_name: string;
}

interface Tag {
  id: number;
  slug: string;
  label: string;
  tag_type: string;
  sindhi: {
    title: string;
    details: string;
  };
  english: {
    title: string;
    details: string;
  };
}

interface TagFormData {
  slug: string;
  type: string;
  sindhi: { title: string; details: string };
  english: { title: string; details: string };
}

export default function AdminCoupletEditPage() {
  const router = useRouter();
  const params = useParams();
  const coupletParam = params.id as string;
  
  // Determine if the parameter is an ID (numeric) or slug (string)
  const isNumericId = !isNaN(Number(coupletParam));
  const coupletId = isNumericId ? coupletParam : null;
  const coupletSlug = !isNumericId ? coupletParam : null;


  const [couplet, setCouplet] = useState<CoupletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poets, setPoets] = useState<Poet[]>([]);

  const [formData, setFormData] = useState({
    couplet_text: '',
    couplet_slug: '',
    couplet_tags: '',
    lang: 'sd',
    poetry_id: ''
  });

  const [englishFormData, setEnglishFormData] = useState({
    couplet_text: '',
    couplet_slug: '',
    couplet_tags: '',
    lang: 'en',
    poetry_id: ''
  });

  // Tag-related state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagData, setNewTagData] = useState<TagFormData>({
    slug: '',
    type: 'Topic',
    sindhi: { title: '', details: '' },
    english: { title: '', details: '' }
  });
  const [tagSearchLoading, setTagSearchLoading] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create an async function to handle the data fetching
    const loadData = async () => {
      try {
        await Promise.allSettled([
          fetchCouplet(),
          fetchPoets()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [coupletParam]);

  const fetchCouplet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use different API endpoints based on whether we have an ID or slug
      const apiUrl = isNumericId 
        ? `/api/admin/poetry/couplets/${coupletId}`
        : `/api/admin/poetry/couplets/by-slug/${coupletSlug}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch couplet`);
      }

      const data = await response.json();
      
      if (!data || !data.id) {
        throw new Error('Invalid couplet data received');
      }
      
      setCouplet(data);
      setFormData({
        couplet_text: data.couplet_text || '',
        couplet_slug: data.couplet_slug || '',
        couplet_tags: data.couplet_tags || '',
        lang: data.lang || 'sd',
        poetry_id: data.poetry_main?.id || ''
      });

      // Set English couplet data if available
      if (data.english_couplet) {
        setEnglishFormData({
          couplet_text: data.english_couplet.couplet_text || '',
          couplet_slug: data.couplet_slug || '', // Use same slug as main couplet
          couplet_tags: data.english_couplet.couplet_tags || '',
          lang: 'en',
          poetry_id: data.poetry_main?.id || ''
        });
      }
    } catch (err) {
      console.error('Error fetching couplet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch couplet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoets = async () => {
    try {
      const response = await fetch('/api/admin/poets');
      if (response.ok) {
        const data = await response.json();
        setPoets(data.poets || []);
      } else {
        console.warn('Failed to fetch poets:', response.status);
        setPoets([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error('Error fetching poets:', err);
      setPoets([]); // Set empty array as fallback
      // Don't set error state for poets as it's not critical
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save Sindhi couplet
      const response = await fetch(`/api/admin/poetry/couplets/${coupletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update couplet`);
      }

      const result = await response.json();
      console.log('Sindhi couplet updated successfully:', result);

      // Save English couplet if it exists and has changes
      if (couplet?.english_couplet && englishFormData.couplet_text.trim()) {
        const englishDataToSave = {
          ...englishFormData,
          couplet_slug: formData.couplet_slug // Ensure both use the same slug
        };
        
        const englishResponse = await fetch(`/api/admin/poetry/couplets/${couplet.english_couplet.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(englishDataToSave),
        });

        if (!englishResponse.ok) {
          const errorData = await englishResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${englishResponse.status}: Failed to update English couplet`);
        }

        const englishResult = await englishResponse.json();
        console.log('English couplet updated successfully:', englishResult);
      }
      
      toast.success('Couplets updated successfully!');
      router.push('/admin/poetry/couplets');
    } catch (err) {
      console.error('Error updating couplets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update couplets';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Sync slug to English form if it's the slug field
    if (field === 'couplet_slug') {
      setEnglishFormData(prev => ({
        ...prev,
        couplet_slug: value
      }));
    }
  };

  const handleEnglishInputChange = (field: string, value: string) => {
    setEnglishFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Sync slug to main form if it's the slug field
    if (field === 'couplet_slug') {
      setFormData(prev => ({
        ...prev,
        couplet_slug: value
      }));
    }
  };

  const parseTags = (tagsString: string) => {
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  const formatTags = (tags: string[]) => {
    return tags.join(', ');
  };

  const addTag = (newTag: string) => {
    if (!newTag.trim()) return;
    const currentTags = parseTags(formData.couplet_tags);
    if (!currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()];
      handleInputChange('couplet_tags', formatTags(updatedTags));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = parseTags(formData.couplet_tags);
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    handleInputChange('couplet_tags', formatTags(updatedTags));
  };

  // Tag search and management functions
  const searchTags = async (query: string) => {
    if (query.length < 2) {
      setAvailableTags([]);
      setShowTagSuggestions(false);
      return;
    }

    try {
      setTagSearchLoading(true);
      const response = await fetch(`/api/admin/tags/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
        setShowTagSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching tags:', error);
    } finally {
      setTagSearchLoading(false);
    }
  };

  const handleTagSearch = (query: string) => {
    setTagSearchQuery(query);
    searchTags(query);
  };

  const selectTag = (tag: Tag) => {
    const currentTags = parseTags(formData.couplet_tags);
    if (!currentTags.includes(tag.slug)) {
      const updatedTags = [...currentTags, tag.slug];
      handleInputChange('couplet_tags', formatTags(updatedTags));
    }
    setTagSearchQuery('');
    setShowTagSuggestions(false);
  };

  const createNewTag = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTagData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }

      toast.success('Tag created successfully');
      setShowTagModal(false);
      setNewTagData({
        slug: '',
        type: 'Topic',
        sindhi: { title: '', details: '' },
        english: { title: '', details: '' }
      });
      
      // Add the new tag to the current tags
      const currentTags = parseTags(formData.couplet_tags);
      const updatedTags = [...currentTags, newTagData.slug];
      handleInputChange('couplet_tags', formatTags(updatedTags));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
      toast.error(errorMessage);
    }
  };

  const resetTagForm = () => {
    setNewTagData({
      slug: '',
      type: 'Topic',
      sindhi: { title: '', details: '' },
      english: { title: '', details: '' }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6B6B6B]" />
            <p className="text-[#6B6B6B]">Loading couplet...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !couplet) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-semibold text-[#1F1F1F] mb-2">Error</h1>
            <p className="text-[#6B6B6B] mb-4">{error || 'Couplet not found'}</p>
            <Button onClick={() => router.push('/admin/poetry/couplets')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Couplets
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin/poetry/couplets')}
                  className="h-10 w-10 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] leading-tight">Edit Couplet</h1>
                  <p className="text-sm sm:text-base text-[#6B6B6B] mt-1">Update couplet details and content</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/poetry/couplets')}
                  className="h-10 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-4 rounded-lg bg-[#1F1F1F] text-white hover:bg-[#333333] disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Combined Couplet Content */}
              <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 space-y-6">
                {/* Sindhi Couplet */}
                <div className="space-y-3">
                  <Label htmlFor="couplet_text" className="text-sm font-medium text-[#1F1F1F] block">
                    Sindhi Couplet Text
                  </Label>
                  <Textarea
                    id="couplet_text"
                    value={formData.couplet_text}
                    onChange={(e) => handleInputChange('couplet_text', e.target.value)}
                    placeholder="Enter the Sindhi couplet text..."
                    className="min-h-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-2 focus:ring-[#1F1F1F]/20 transition-colors resize-none sindhi-text text-right font-sindhi"
                    dir="rtl"
                    lang="sd"
                  />
                </div>

                {/* English Couplet */}
                {couplet?.english_couplet && (
                  <div className="space-y-3">
                    <Label htmlFor="english_couplet_text" className="text-sm font-medium text-[#1F1F1F] block">
                      English Couplet Text
                    </Label>
                    <Textarea
                      id="english_couplet_text"
                      value={englishFormData.couplet_text}
                      onChange={(e) => handleEnglishInputChange('couplet_text', e.target.value)}
                      placeholder="Enter the English translation..."
                      className="min-h-[120px] rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-2 focus:ring-[#1F1F1F]/20 transition-colors resize-none"
                      dir="ltr"
                      lang="en"
                    />
                  </div>
                )}
                
                {/* Single Slug Input */}
                <div className="space-y-3">
                  <Label htmlFor="couplet_slug" className="text-sm font-medium text-[#1F1F1F] block">
                    Couplet Slug
                  </Label>
                  <Input
                    id="couplet_slug"
                    value={formData.couplet_slug}
                    onChange={(e) => handleInputChange('couplet_slug', e.target.value)}
                    placeholder="couplet-slug"
                    className="rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-2 focus:ring-[#1F1F1F]/20 transition-colors"
                  />
                </div>
              </div>

              {/* Tags with Search */}
              <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-[#1F1F1F]">
                    Couplet Tags
                  </Label>
                  <Button
                    onClick={() => setShowTagModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Tag
                  </Button>
                </div>

                {/* Selected Tags Display */}
                {parseTags(formData.couplet_tags).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parseTags(formData.couplet_tags).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-[#F4F4F5] text-[#1F1F1F] hover:bg-[#E5E5E5] cursor-pointer transition-colors px-3 py-1"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                    <Input
                      ref={tagInputRef}
                      value={tagSearchQuery}
                      onChange={(e) => handleTagSearch(e.target.value)}
                      onFocus={() => setShowTagSuggestions(tagSearchQuery.length >= 2)}
                      placeholder="Search existing tags..."
                      className="pl-10 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-2 focus:ring-[#1F1F1F]/20 transition-colors"
                    />
                    {tagSearchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4 animate-spin" />
                    )}
                  </div>

                  {/* Tag Suggestions Dropdown */}
                  <AnimatePresence>
                    {showTagSuggestions && availableTags.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-10 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {availableTags.map((tag, index) => (
                          <motion.div
                            key={tag.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            onClick={() => selectTag(tag)}
                            className="px-4 py-3 hover:bg-[#F4F4F5] cursor-pointer border-b border-[#E5E5E5] last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-[#1F1F1F]">{tag.english.title}</div>
                                <div className="text-sm text-[#6B6B6B]">{tag.slug}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {tag.tag_type}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-xs text-[#6B6B6B]">
                  Search existing topic tags or create new ones
                </p>
              </div>
            </div>

            {/* Minimal Sidebar */}
            <div className="space-y-4">
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Couplet ID</span>
                    <div className="font-semibold text-[#1F1F1F]">#{couplet.id}</div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Created</span>
                    <div className="font-semibold text-[#1F1F1F]">
                      {new Date(couplet.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Language</span>
                    <div className="font-semibold text-[#1F1F1F]">{formData.lang.toUpperCase()}</div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Poetry</span>
                    <div className="font-semibold text-[#1F1F1F] truncate">
                      {couplet.poetry_main?.poetry_slug || 'No poetry linked'}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Poet</span>
                    <div className="font-semibold text-[#1F1F1F] truncate">
                      {couplet.poets?.english_laqab || couplet.poets?.sindhi_laqab || 'Unknown poet'}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-[#6B6B6B]">Category</span>
                    <div className="font-semibold text-[#1F1F1F] truncate">
                      {couplet.categories?.slug || 'No category'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Tag Creation Modal */}
        <AnimatePresence>
          {showTagModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white border border-[#E5E5E5] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#1F1F1F] rounded flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F1F1F]">Create New Tag</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTagModal(false);
                      resetTagForm();
                    }}
                    className="text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#E5E5E5] rounded-md p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">Slug</Label>
                    <Input
                      value={newTagData.slug}
                      onChange={(e) => setNewTagData({ ...newTagData, slug: e.target.value })}
                      placeholder="tag-slug"
                      className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">Type</Label>
                    <Select value={newTagData.type} onValueChange={(v: string) => setNewTagData({ ...newTagData, type: v })}>
                      <SelectTrigger className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        {(['Topic', 'Form', 'Theme', 'Emotion'] as const).map(t => (
                          <SelectItem key={t} value={t} className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">Sindhi Title</Label>
                    <Input
                      value={newTagData.sindhi.title}
                      onChange={(e) => setNewTagData({ 
                        ...newTagData, 
                        sindhi: { ...newTagData.sindhi, title: e.target.value }
                      })}
                      placeholder="سنڌي عنوان"
                      className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">English Title</Label>
                    <Input
                      value={newTagData.english.title}
                      onChange={(e) => setNewTagData({ 
                        ...newTagData, 
                        english: { ...newTagData.english, title: e.target.value }
                      })}
                      placeholder="English Title"
                      className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">Sindhi Details</Label>
                    <Textarea
                      value={newTagData.sindhi.details}
                      onChange={(e) => setNewTagData({ 
                        ...newTagData, 
                        sindhi: { ...newTagData.sindhi, details: e.target.value }
                      })}
                      placeholder="سنڌي تفصيل"
                      className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#1F1F1F]">English Details</Label>
                    <Textarea
                      value={newTagData.english.details}
                      onChange={(e) => setNewTagData({ 
                        ...newTagData, 
                        english: { ...newTagData.english, details: e.target.value }
                      })}
                      placeholder="English Details"
                      className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="px-6 py-4 border-t border-[#E5E5E5] bg-[#F9F9F9]"
              >
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTagModal(false);
                      resetTagForm();
                    }}
                    className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createNewTag}
                    disabled={!newTagData.slug || !newTagData.sindhi.title || !newTagData.english.title}
                    className="bg-[#1F1F1F] text-white hover:bg-[#333333] disabled:opacity-50 transition-colors"
                  >
                    Create Tag
                  </Button>
                </div>
              </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
