"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { compressImage, processPoetImage, generateAvatarColor, type AvatarColor } from "@/lib/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { checkAndRefreshSession, forceRefreshSession } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CitySearchDropdown from "@/components/ui/CitySearchDropdown";
import { AlertCircle, User, Globe, Calendar, MapPin, Tag, Upload, CheckCircle, Save, AlertTriangle, Info, Sparkles, Languages } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const poetSchema = z.object({
  poet_slug: z.string().min(1, "Poet slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  birth_date: z.date().optional().nullable(),
  death_date: z.date().optional().nullable(),
  birth_place: z.string().optional(),
  death_place: z.string().optional(),
  tags: z.array(z.string()), // Poet-specific tags only
  sindhi_name: z.string().min(1, "Sindhi name is required").max(100, "Name must be less than 100 characters"),
  sindhi_laqab: z.string().max(50, "Laqab must be less than 50 characters").optional(),
  sindhi_takhalus: z.string().max(50, "Takhalus must be less than 50 characters").optional(),
  sindhi_tagline: z.string().max(200, "Tagline must be less than 200 characters").optional(),
  sindhi_details: z.string().min(1, "Sindhi details are required").min(10, "Details must be at least 10 characters").max(2000, "Details must be less than 2000 characters"),
  english_name: z.string().min(1, "English name is required").max(100, "Name must be less than 100 characters"),
  english_laqab: z.string().max(50, "Laqab must be less than 50 characters").optional(),
  english_takhalus: z.string().max(50, "Takhalus must be less than 50 characters").optional(),
  english_tagline: z.string().max(200, "Tagline must be less than 200 characters").optional(),
  english_details: z.string().min(1, "English details are required").min(10, "Details must be at least 10 characters").max(2000, "Details must be less than 2000 characters"),
}).refine((data) => {
  // Ensure both Sindhi and English sections are complete
  return data.sindhi_name && data.sindhi_details && data.english_name && data.english_details;
}, {
  message: "Both Sindhi and English information must be complete",
  path: ["sindhi_name"],
}).refine((data) => {
  // Validate date logic - only if both dates are provided
  if (data.birth_date && data.death_date) {
    return data.death_date >= data.birth_date;
  }
  // If only birth date is provided (living poet), that's perfectly fine
  return true;
}, {
  message: "Death date must be after birth date (if both dates are provided)",
  path: ["death_date"],
});

type PoetFormData = z.infer<typeof poetSchema>;

interface PoetFormProps {
  mode: "create" | "edit";
  initialData?: any;
}

export default function PoetForm({ mode, initialData }: PoetFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [showSlugSuggestions, setShowSlugSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Array<{id: number, slug: string, label: string, tag_type: string, sindhi: {title: string, details: string}, english: {title: string, details: string}}>>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [avatarColor, setAvatarColor] = useState<AvatarColor | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const form = useForm<PoetFormData>({
    resolver: zodResolver(poetSchema),
    defaultValues: initialData || {
      poet_slug: "",
      birth_date: undefined,
      death_date: undefined,
      birth_place: "",
      death_place: "",
      tags: [] as string[], // Poet-specific tags array
      sindhi_name: "",
      sindhi_laqab: "",
      sindhi_takhalus: "",
      sindhi_tagline: "",
      sindhi_details: "",
      english_name: "",
      english_laqab: "",
      english_takhalus: "",
      english_tagline: "",
      english_details: "",
    },
  });

  const watchedValues = form.watch();

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'edit' && Object.keys(form.formState.dirtyFields).length > 0) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, mode]);

  // Generate slug suggestions
  useEffect(() => {
    if (watchedValues.english_name) {
      const suggestions = generateSlugSuggestions(watchedValues.english_name);
      setSlugSuggestions(suggestions);
    }
  }, [watchedValues.english_name]);

  // Set preview URL when editing with existing image
  useEffect(() => {
    if (mode === 'edit' && initialData?.file_url) {
      setPreviewUrl(initialData.file_url);
    }
  }, [mode, initialData?.file_url]);

  // Convert string dates to Date objects when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const convertedData = {
        ...initialData,
        birth_date: initialData.birth_date ? new Date(initialData.birth_date) : undefined,
        death_date: initialData.death_date ? new Date(initialData.death_date) : undefined,
      };
      
      // Validate dates before setting them
      try {
        if (convertedData.birth_date && isNaN(convertedData.birth_date.getTime())) {
          convertedData.birth_date = undefined;
        }
        if (convertedData.death_date && isNaN(convertedData.death_date.getTime())) {
          convertedData.death_date = undefined;
        }
      } catch (error) {
        console.warn('Error converting dates:', error);
        convertedData.birth_date = undefined;
        convertedData.death_date = undefined;
      }
      
      form.reset(convertedData);
    }
  }, [mode, initialData, form]);

  // Fetch available poet tags from database
  const fetchAvailableTags = useCallback(async () => {
    console.log('fetchAvailableTags called - fetching poet tags only');
    setTagsLoading(true);
    try {
      console.log('Fetching tags from /api/admin/poet-tags...');
      const response = await fetch('/api/admin/poet-tags?pageSize=100'); // Get all poet tags
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Poet tags data received:', data);
        if (data.tags && data.tags.length > 0) {
          console.log('Raw poet tags data:', data.tags);
          // All tags from poet-tags API are already poet-specific
          console.log('Setting availableTags to poet tags only:', data.tags);
          setAvailableTags(data.tags);
        } else {
          console.log('No poet tags data received');
          // Fallback to default poet tags if API returns empty
          setAvailableTags([
            { id: 1, slug: 'sufi-poet', label: 'صوفي شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'صوفي شاعر', details: '' }, english: { title: 'Sufi Poet', details: '' } },
            { id: 2, slug: 'classical-poet', label: 'ڪلاسيڪل شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'ڪلاسيڪل شاعر', details: '' }, english: { title: 'Classical Poet', details: '' } },
            { id: 3, slug: 'modern-poet', label: 'عصري شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'عصري شاعر', details: '' }, english: { title: 'Modern Poet', details: '' } },
            { id: 4, slug: 'mystic-poet', label: 'مڌي شاعر', tag_type: 'Influence / Aesthetic', sindhi: { title: 'مڌي شاعر', details: '' }, english: { title: 'Mystic Poet', details: '' } },
            { id: 5, slug: 'romantic-poet', label: 'رومانوي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'رومانوي شاعر', details: '' }, english: { title: 'Romantic Poet', details: '' } },
            { id: 6, slug: 'nationalist-poet', label: 'قومي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'قومي شاعر', details: '' }, english: { title: 'Nationalist Poet', details: '' } },
            { id: 7, slug: 'folk-poet', label: 'لوڪ شاعر', tag_type: 'Form / Style', sindhi: { title: 'لوڪ شاعر', details: '' }, english: { title: 'Folk Poet', details: '' } },
            { id: 8, slug: 'philosophical-poet', label: 'فلسفي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'فلسفي شاعر', details: '' }, english: { title: 'Philosophical Poet', details: '' } }
          ]);
        }
      } else {
        console.error('Failed to fetch tags:', response.statusText);
        // Fallback to default poet tags if API fails
        setAvailableTags([
          { id: 1, slug: 'sufi-poet', label: 'صوفي شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'صوفي شاعر', details: '' }, english: { title: 'Sufi Poet', details: '' } },
          { id: 2, slug: 'classical-poet', label: 'ڪلاسيڪل شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'ڪلاسيڪل شاعر', details: '' }, english: { title: 'Classical Poet', details: '' } },
          { id: 3, slug: 'modern-poet', label: 'عصري شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'عصري شاعر', details: '' }, english: { title: 'Modern Poet', details: '' } },
          { id: 4, slug: 'mystic-poet', label: 'مڌي شاعر', tag_type: 'Influence / Aesthetic', sindhi: { title: 'مڌي شاعر', details: '' }, english: { title: 'Mystic Poet', details: '' } },
          { id: 5, slug: 'romantic-poet', label: 'رومانوي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'رومانوي شاعر', details: '' }, english: { title: 'Romantic Poet', details: '' } },
          { id: 6, slug: 'nationalist-poet', label: 'قومي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'قومي شاعر', details: '' }, english: { title: 'Nationalist Poet', details: '' } },
          { id: 7, slug: 'folk-poet', label: 'لوڪ شاعر', tag_type: 'Form / Style', sindhi: { title: 'لوڪ شاعر', details: '' }, english: { title: 'Folk Poet', details: '' } },
          { id: 8, slug: 'philosophical-poet', label: 'فلسفي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'فلسفي شاعر', details: '' }, english: { title: 'Philosophical Poet', details: '' } }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Fallback to default poet tags if API fails
      console.log('Using fallback poet tags due to API error');
      setAvailableTags([
        { id: 1, slug: 'sufi-poet', label: 'صوفي شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'صوفي شاعر', details: '' }, english: { title: 'Sufi Poet', details: '' } },
        { id: 2, slug: 'classical-poet', label: 'ڪلاسيڪل شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'ڪلاسيڪل شاعر', details: '' }, english: { title: 'Classical Poet', details: '' } },
        { id: 3, slug: 'modern-poet', label: 'عصري شاعر', tag_type: 'Era / Tradition', sindhi: { title: 'عصري شاعر', details: '' }, english: { title: 'Modern Poet', details: '' } },
        { id: 4, slug: 'mystic-poet', label: 'مڌي شاعر', tag_type: 'Influence / Aesthetic', sindhi: { title: 'مڌي شاعر', details: '' }, english: { title: 'Mystic Poet', details: '' } },
        { id: 5, slug: 'romantic-poet', label: 'رومانوي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'رومانوي شاعر', details: '' }, english: { title: 'Romantic Poet', details: '' } },
        { id: 6, slug: 'nationalist-poet', label: 'قومي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'قومي شاعر', details: '' }, english: { title: 'Nationalist Poet', details: '' } },
        { id: 7, slug: 'folk-poet', label: 'لوڪ شاعر', tag_type: 'Form / Style', sindhi: { title: 'لوڪ شاعر', details: '' }, english: { title: 'Folk Poet', details: '' } },
        { id: 8, slug: 'philosophical-poet', label: 'فلسفي شاعر', tag_type: 'Theme / Subject', sindhi: { title: 'فلسفي شاعر', details: '' }, english: { title: 'Philosophical Poet', details: '' } }
      ]);
    } finally {
      setTagsLoading(false);
      console.log('Tags loading finished, availableTags count:', availableTags.length);
    }
  }, []);

  // Fetch available poet tags on component mount
  useEffect(() => {
    console.log('Component mounted, calling fetchAvailableTags for poet tags');
    fetchAvailableTags();
  }, [fetchAvailableTags]);

  // Debug: Monitor availableTags state changes (should only contain poet tags)
  useEffect(() => {
    console.log('availableTags state changed (poet tags only):', availableTags);
  }, [availableTags]);

  const generateSlugSuggestions = (name: string) => {
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    return [
      baseSlug,
      `${baseSlug}-poet`,
      `${baseSlug}-sindhi`,
      baseSlug.replace(/-/g, '')
    ];
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const getTagTypeColor = (type: string) => {
    switch (type) {
      // Poet tag types (new system)
      case "Era / Tradition": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Language": return "bg-green-100 text-green-800 border border-green-200";
      case "Identity / Group": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Form / Style": return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Theme / Subject": return "bg-pink-100 text-pink-800 border border-pink-200";
      case "Region / Locale": return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "Stage / Career": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Influence / Aesthetic": return "bg-red-100 text-red-800 border border-red-200";
      case "Genre / Output": return "bg-teal-100 text-teal-800 border border-teal-200";
      case "Script / Metadata": return "bg-gray-100 text-gray-800 border border-gray-200";
      
      // Legacy tag types (fallback)
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

  const getTagTypeDotColor = (type: string) => {
    switch (type) {
      // Poet tag types (new system)
      case "Era / Tradition": return "bg-blue-600";
      case "Language": return "bg-green-600";
      case "Identity / Group": return "bg-purple-600";
      case "Form / Style": return "bg-orange-600";
      case "Theme / Subject": return "bg-pink-600";
      case "Region / Locale": return "bg-indigo-600";
      case "Stage / Career": return "bg-yellow-600";
      case "Influence / Aesthetic": return "bg-red-600";
      case "Genre / Output": return "bg-teal-600";
      case "Script / Metadata": return "bg-gray-600";
      
      // Legacy tag types (fallback)
      case "Poetry": return "bg-blue-600";
      case "Poet": return "bg-green-600";
      case "Topic": return "bg-purple-600";
      case "Form": return "bg-orange-600";
      case "Theme": return "bg-pink-600";
      case "Category": return "bg-emerald-600";
      case "Emotion": return "bg-rose-600";
      default: return "bg-gray-600";
    }
  };

  const handleAutoSave = async () => {
    if (mode !== 'edit') return;
    
    setAutoSaveStatus('saving');
    try {
      const formData = form.getValues();
      const response = await fetch(`/api/admin/poets/${initialData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Auto-save failed');
      }
      
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setIsProcessingImage(true);
      try {
        // Get poet name for avatar color generation
        const poetName = watchedValues.english_name || watchedValues.sindhi_name || 'Unknown Poet';
        
        // Process image with background removal and compression
        const { file: processedFile, avatarColor: generatedColor } = await processPoetImage(
          file, 
          poetName,
          { 
            maxWidth: 800, 
            maxHeight: 800, 
            quality: 0.85, 
            mimeType: "image/webp",
            removeBackground: true,
            generateAvatarColors: true
          }
        );
        
        setSelectedFile(processedFile);
        setAvatarColor(generatedColor);
        
        // Create preview URL
        const url = URL.createObjectURL(processedFile);
        setPreviewUrl(url);
        
        console.log('Image processed successfully:', {
          originalSize: file.size,
          processedSize: processedFile.size,
          compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1) + '%',
          avatarColor: generatedColor
        });
        
      } catch (error) {
        console.error('Image processing failed:', error);
        // Fallback to original compression
        const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85, mimeType: "image/webp" });
        setSelectedFile(compressed);
        const url = URL.createObjectURL(compressed);
        setPreviewUrl(url);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    // Toggle poet tag selection
    const currentTags = form.getValues("tags") || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    form.setValue("tags", newTags);
  };

  const onSubmit = async (data: PoetFormData) => {
    console.log('Form submission started with data:', data);
    console.log('Date fields:', {
      birth_date: data.birth_date,
      death_date: data.death_date,
      birth_date_type: typeof data.birth_date,
      death_date_type: typeof data.death_date
    });
    setIsSubmitting(true);
    setValidationErrors([]);

    // Check authentication
    if (!user || authLoading) {
      setValidationErrors(["Please wait for authentication to complete or log in again"]);
      setIsSubmitting(false);
      return;
    }

    // Proactively check and refresh session
    const sessionStatus = await checkAndRefreshSession();
    
    if (!sessionStatus.isValid) {
      setValidationErrors([
        "Your session has expired. Please log in again.",
        "Click the login button below to refresh your session."
      ]);
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate form data
      console.log('Validating form data with schema...');
      const validationResult = poetSchema.safeParse(data);
      if (!validationResult.success) {
        console.log('Validation failed:', validationResult.error.issues);
        const errors = validationResult.error.issues.map((err: any) => err.message);
        setValidationErrors(errors);
        setIsSubmitting(false);
        return;
      }
      console.log('Validation passed successfully');

      // Handle file upload if there's a selected file
      let fileUrl = null;
      if (selectedFile) {
        console.log('Uploading image file...');
        // Upload via admin API to bypass storage RLS
        const formPayload = new FormData();
        formPayload.append('file', selectedFile);
        formPayload.append('filename', `${data.poet_slug}.webp`);

        const uploadRes = await fetch('/api/admin/poets/upload', {
          method: 'POST',
          body: formPayload,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          setValidationErrors([`Failed to upload image: ${err.error || uploadRes.statusText}`]);
          setIsSubmitting(false);
          return;
        }
        const uploadJson = await uploadRes.json();
        fileUrl = uploadJson.url;
        console.log('Image uploaded successfully:', fileUrl);
      }

      // Convert Date objects to ISO strings for API submission
      const poetData = {
        ...data,
        birth_date: data.birth_date ? data.birth_date.toISOString().split('T')[0] : null,
        death_date: data.death_date ? data.death_date.toISOString().split('T')[0] : null,
        // Preserve existing image unless a new file was uploaded
        file_url: selectedFile ? fileUrl : (initialData?.file_url ?? null),
        // tags field contains only poet-specific tags
      };

      console.log('Prepared poet data for API:', poetData);

      if (mode === 'create') {
        console.log('Creating new poet...');
        const response = await fetch('/api/admin/poets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(poetData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating poet:", errorData);
          setValidationErrors([errorData.error || "Failed to create poet"]);
          setIsSubmitting(false);
          return;
        }

        const result = await response.json();
        console.log('Poet created successfully:', result);
        router.push("/admin/poets");
      } else {
        console.log('Updating existing poet...');
        const response = await fetch(`/api/admin/poets/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(poetData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error updating poet:", errorData);
          setValidationErrors([errorData.error || "Failed to update poet"]);
          setIsSubmitting(false);
          return;
        }

        const result = await response.json();
        console.log('Poet updated successfully:', result);
        router.push("/admin/poets");
      }
    } catch (error) {
      console.error("Error:", error);
      setValidationErrors(["An unexpected error occurred"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageStatus = (language: 'sindhi' | 'english') => {
    if (language === 'sindhi') {
      const data = { name: watchedValues.sindhi_name, details: watchedValues.sindhi_details };
      const isComplete = data?.name && data?.details;
      return {
        isComplete,
        progress: data?.name && data?.details ? 100 : 
                  data?.name || data?.details ? 50 : 0
      };
    } else {
      const data = { name: watchedValues.english_name, details: watchedValues.english_details };
      const isComplete = data?.name && data?.details;
      return {
        isComplete,
        progress: data?.name && data?.details ? 100 : 
                  data?.name || data?.details ? 50 : 0
      };
    }
  };

  const sindhiStatus = getLanguageStatus('sindhi');
  const englishStatus = getLanguageStatus('english');

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">You must be logged in to access this form.</p>
            <Button onClick={() => router.push('/admin/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={authLoading || !user} className="disabled:opacity-60 disabled:pointer-events-none">
      {/* Auto-save Status */}
      <AnimatePresence>
        {autoSaveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              autoSaveStatus === 'saving' ? 'bg-muted text-muted-foreground' :
              autoSaveStatus === 'saved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
              'bg-destructive/10 text-destructive'
            }`}
          >
            {autoSaveStatus === 'saving' && <Save className="w-4 h-4 animate-spin" />}
            {autoSaveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
            {autoSaveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
            <span>
              {autoSaveStatus === 'saving' && 'Auto-saving...'}
              {autoSaveStatus === 'saved' && 'Auto-saved'}
              {autoSaveStatus === 'error' && 'Auto-save failed'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive mb-1">
                  Validation Errors
                </h3>
                <ul className="text-sm text-destructive/80 space-y-1 mb-3">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                
                {/* Show refresh session button if auth-related errors */}
                {validationErrors.some(error => 
                  error.toLowerCase().includes('authentication') || 
                  error.toLowerCase().includes('session') ||
                  error.toLowerCase().includes('log in')
                ) && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const status = await forceRefreshSession();
                          if (!status.isValid) throw new Error(status.error || "Failed to refresh");
                          setValidationErrors([]);
                          // Refresh the form state instead of reloading the page
                          form.reset(form.getValues());
                        } catch (error) {
                          console.error("Session refresh failed:", error);
                          setValidationErrors([
                            "Failed to refresh session. Please log in again.",
                            "Redirecting to login page..."
                          ]);
                          setTimeout(() => {
                            router.push('/admin/login');
                          }, 2000);
                        }
                      }}
                      className="text-xs"
                    >
                      🔄 Refresh Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/admin/login')}
                      className="text-xs"
                    >
                      🔑 Go to Login
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Progress Overview */}
      <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
        <CardHeader className="py-6">
          <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Language Requirements
          </CardTitle>
          <CardDescription className="text-base text-[#6B6B6B]">
            Both languages are required for a complete poet profile
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sindhi Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">سنڌي (Sindhi)</h3>
                <Badge variant={sindhiStatus.isComplete ? "default" : "secondary"}>
                  {sindhiStatus.isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sindhiStatus.progress}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {sindhiStatus.isComplete ? "All required fields completed" : "Name and biography required"}
              </div>
            </div>

            {/* English Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">English</h3>
                <Badge variant={englishStatus.isComplete ? "default" : "secondary"}>
                  {englishStatus.isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${englishStatus.progress}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {englishStatus.isComplete ? "All required fields completed" : "Name and biography required"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
        <CardHeader className="py-6">
          <CardTitle className="text-xl font-bold text-[#1F1F1F]">Basic Information</CardTitle>
          <CardDescription className="text-base text-[#6B6B6B]">
            General details that apply to both languages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="poet_slug" className="text-sm font-medium text-[#1F1F1F]">Poet Slug</Label>
              <div className="relative mt-2">
                <Input
                  id="poet_slug"
                  {...form.register("poet_slug")}
                  placeholder="e.g., shah-abdul-latif"
                  className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors pr-10"
                  onFocus={() => setShowSlugSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSlugSuggestions(false), 200)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (watchedValues.english_name) {
                      const slug = generateSlug(watchedValues.english_name);
                      form.setValue("poet_slug", slug);
                    }
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  title="Generate slug from English name"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              {form.formState.errors.poet_slug && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.poet_slug.message}</p>
              )}
              
              {/* Slug Suggestions */}
              <AnimatePresence>
                {showSlugSuggestions && slugSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-2 bg-muted rounded-lg border border-border"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {slugSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => form.setValue("poet_slug", suggestion)}
                          className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <Label htmlFor="image" className="text-sm font-medium text-[#1F1F1F]">Profile Image</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#1F1F1F]/20 transition-colors bg-white hover:bg-[#F4F4F5]"
                >
                  {isProcessingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm text-muted-foreground">Processing image...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Choose image file (max 5MB)"}
                      </span>
                    </>
                  )}
                </label>
                
                {/* Removed image processing info UI per request */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <Label htmlFor="birth_date" className="text-sm font-medium text-[#1F1F1F]">Birth Date</Label>
              <div className="mt-2 w-full">
                <DatePicker
                  date={form.watch("birth_date") || undefined}
                  onDateChange={(date) => {
                    console.log('Birth date selected:', date);
                    form.setValue("birth_date", date || null);
                    form.trigger("birth_date");
                  }}
                  placeholder="Select birth date"
                  className="w-full"
                />
              </div>
              {form.formState.errors.birth_date && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.birth_date.message}</p>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="death_date" className="text-sm font-medium text-[#1F1F1F]">Death Date (Optional - Leave empty for living poets)</Label>
              <div className="mt-2 w-full">
                <DatePicker
                  date={form.watch("death_date") || undefined}
                  onDateChange={(date) => {
                    console.log('Death date selected:', date);
                    form.setValue("death_date", date || null);
                    form.trigger("death_date");
                  }}
                  placeholder="Select death date (optional)"
                  className="w-full"
                />
              </div>
              {form.formState.errors.death_date && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.death_date.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Only fill this if the poet has passed away. Leave empty for living poets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CitySearchDropdown
                value={form.watch("birth_place") || ""}
                onChange={(value) => {
                  form.setValue("birth_place", value);
                  form.trigger("birth_place");
                }}
                placeholder="Search for birth place..."
                label="Birth Place"
              />
              <input type="hidden" {...form.register("birth_place")} />
            </div>
            <div>
              <CitySearchDropdown
                value={form.watch("death_place") || ""}
                onChange={(value) => {
                  form.setValue("death_place", value);
                  form.trigger("death_place");
                }}
                placeholder="Search for death place..."
                label="Death Place"
              />
              <input type="hidden" {...form.register("death_place")} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium text-[#1F1F1F]">Poet Tags</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Only poet-specific tags are shown here. These tags help categorize the type and style of the poet.
            </p>
            <div className="mt-2">
              
              {tagsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                  Loading poet tags...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <motion.button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.english.title)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:translate-y-[-1px] hover:shadow-sm ${
                        watchedValues.tags?.includes(tag.english.title)
                          ? getTagTypeColor(tag.tag_type) + ' ring-2 ring-[#1F1F1F] ring-offset-2'
                          : getTagTypeColor(tag.tag_type) + ' hover:ring-2 hover:ring-[#1F1F1F] hover:ring-offset-2'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title={`${tag.english.title} (${tag.tag_type})`}
                    >
                      <div className={`w-2 h-2 rounded-full ${getTagTypeDotColor(tag.tag_type)}`}></div>
                      {tag.english.title}
                    </motion.button>
                  ))}
                </div>
              )}
              {availableTags.length === 0 && !tagsLoading && (
                <p className="text-sm text-muted-foreground">
                  No poet tags available. Please add some poet-specific tags in the admin panel first.
                </p>
              )}
              
              {/* Selected Tags Display */}
              {watchedValues.tags && watchedValues.tags.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-[#6B6B6B]">Selected Poet Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {watchedValues.tags.map((tagName) => {
                      const tag = availableTags.find(t => t.english.title === tagName);
                      return (
                        <div
                          key={tagName}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${tag ? getTagTypeColor(tag.tag_type) : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                        >
                          <span>{tagName}</span>
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tagName)}
                            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                            title="Remove tag"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language-specific Information */}
      <div className="space-y-6">
        {/* Sindhi Information */}
        <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
          <CardHeader className="py-6 text-right" dir="rtl">
            <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center gap-2 justify-end">
              <span className="text-lg font-normal text-[#6B6B6B]">(Sindhi)</span>
              <span className="text-2xl">سنڌي</span>
            </CardTitle>
            <CardDescription className="text-right text-base text-[#6B6B6B]">
              سنڌي ٻولي ۾ معلومات
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-right">
                <Label htmlFor="sindhi_name" className="text-sm font-medium text-[#1F1F1F] text-right block">نالو (Name) *</Label>
                <Input
                  id="sindhi_name"
                  {...form.register("sindhi_name")}
                  placeholder="شاه عبداللطيف"
                  className="mt-2 sindhi-text text-right border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                  dir="rtl"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
                {form.formState.errors.sindhi_name && (
                  <p className="text-destructive text-sm mt-1 text-right">{form.formState.errors.sindhi_name.message}</p>
                )}
              </div>
              <div className="text-right">
                <Label htmlFor="sindhi_laqab" className="text-sm font-medium text-[#1F1F1F] text-right block">لقب (Laqab)</Label>
                <Input
                  id="sindhi_laqab"
                  {...form.register("sindhi_laqab")}
                  placeholder="ڀٽائي"
                  className="mt-2 sindhi-text text-right border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                  dir="rtl"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                />
              </div>
            </div>

            <div className="text-right">
              <Label htmlFor="sindhi_takhalus" className="text-sm font-medium text-[#1F1F1F] text-right block">تخلص (Takhalus)</Label>
              <Input
                id="sindhi_takhalus"
                {...form.register("sindhi_takhalus")}
                placeholder="لطيف"
                className="mt-2 sindhi-text text-right border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                dir="rtl"
                style={{ direction: 'rtl', textAlign: 'right' }}
              />
            </div>

            <div className="text-right">
              <Label htmlFor="sindhi_tagline" className="text-sm font-medium text-[#1F1F1F] text-right block">ٽيگ لائين (Tagline)</Label>
              <Input
                id="sindhi_tagline"
                {...form.register("sindhi_tagline")}
                placeholder="سنڌ جو عظيم شاعر"
                className="mt-2 sindhi-text text-right border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                dir="rtl"
                style={{ direction: 'rtl', textAlign: 'right' }}
              />
            </div>

            <div className="text-right">
              <Label htmlFor="sindhi_details" className="text-sm font-medium text-[#1F1F1F] text-right block">سوانح حيات (Biography) *</Label>
              <Textarea
                id="sindhi_details"
                {...form.register("sindhi_details")}
                placeholder="شاه عبداللطيف ڀٽائي سنڌ جي عظيم صوفي شاعر ۽ عارف هو..."
                className="mt-2 min-h-[120px] sindhi-text text-right border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                dir="rtl"
                style={{ direction: 'rtl', textAlign: 'right' }}
              />
              {form.formState.errors.sindhi_details && (
                <p className="text-destructive text-sm mt-1 text-right">{form.formState.errors.sindhi_details.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* English Information */}
        <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
          <CardHeader className="py-6">
            <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center gap-2">
              <span className="text-2xl">English</span>
            </CardTitle>
            <CardDescription className="text-base text-[#6B6B6B]">
              Information in English language
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="english_name" className="text-sm font-medium text-[#1F1F1F]">Name *</Label>
                <Input
                  id="english_name"
                  {...form.register("english_name")}
                  placeholder="Shah Abdul Latif Bhittai"
                  className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                />
                {form.formState.errors.english_name && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.english_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="english_laqab" className="text-sm font-medium text-[#1F1F1F]">Laqab (Title)</Label>
                <Input
                  id="english_laqab"
                  {...form.register("english_laqab")}
                  placeholder="The Saint of Bhit"
                  className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="english_takhalus" className="text-sm font-medium text-[#1F1F1F]">Takhalus (Pen Name)</Label>
              <Input
                id="english_takhalus"
                {...form.register("english_takhalus")}
                placeholder="Latif"
                className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="english_tagline" className="text-sm font-medium text-[#1F1F1F]">Tagline</Label>
              <Input
                id="english_tagline"
                {...form.register("english_tagline")}
                placeholder="Revolutionary Sufi poet of Sindh"
                className="mt-2 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="english_details" className="text-sm font-medium text-[#1F1F1F]">Biography *</Label>
              <Textarea
                id="english_details"
                {...form.register("english_details")}
                placeholder="Shah Abdul Latif Bhittai was a Sindhi Sufi scholar, mystic, saint, poet, and musician..."
                className="mt-2 min-h-[120px] border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
              />
              {form.formState.errors.english_details && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.english_details.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-[#E5E5E5]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"
        >
          {isSubmitting ? "Saving..." : mode === 'create' ? "Create Poet" : "Update Poet"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
} 