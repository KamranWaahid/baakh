"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  History, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Tag,
  Plus,
  Zap
} from "lucide-react";

interface AddPeriodPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PeriodFormData) => Promise<void>;
  mode?: 'create' | 'edit';
  initialData?: Partial<PeriodFormData> | null;
}

interface PeriodFormData {
  period_slug: string;
  start_year: string;
  end_year: string;
  is_ongoing: boolean;
  sindhi_name: string;
  sindhi_description: string;
  sindhi_characteristics: string[];
  english_name: string;
  english_description: string;
  english_characteristics: string[];
  is_featured: boolean;
  sort_order: number;
  selected_poets: string[];
  selected_categories: string[];
  selected_themes: string[];
}

interface Poet {
  id: string;
  poet_slug: string;
  sindhi_name: string;
  english_name: string;
  birth_year?: number;
  death_year?: number;
}

interface Category {
  id: string;
  slug: string;
  cat_name: string;
  cat_name_plural: string;
  lang: string;
}

interface Theme {
  id: string;
  slug: string;
  title: string;
  detail: string;
  tag_type: string;
}

const initialFormData: PeriodFormData = {
  period_slug: "",
  start_year: "",
  end_year: "",
  is_ongoing: false,
  sindhi_name: "",
  sindhi_description: "",
    sindhi_characteristics: [],
    english_name: "",
    english_description: "",
    english_characteristics: [],
    is_featured: false,
    sort_order: 0,
  selected_poets: [],
  selected_categories: [],
  selected_themes: []
};

export default function AddPeriodPopup({ isOpen, onClose, onSubmit, mode = 'create', initialData = null }: AddPeriodPopupProps) {
  const [formData, setFormData] = useState<PeriodFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [poets, setPoets] = useState<Poet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredPoets, setFilteredPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCharacteristic, setNewCharacteristic] = useState({ sindhi: '', english: '' });
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // When opening in edit mode, hydrate form with provided initialData
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData(prev => ({
        ...prev,
        period_slug: initialData.period_slug ?? prev.period_slug,
        start_year: initialData.start_year !== undefined ? String(initialData.start_year) : (initialData.start_year as any) || prev.start_year,
        end_year: initialData.end_year !== undefined && initialData.end_year !== null ? String(initialData.end_year) : (initialData.end_year as any) || '',
        is_ongoing: initialData.is_ongoing ?? prev.is_ongoing,
        sindhi_name: initialData.sindhi_name ?? prev.sindhi_name,
        sindhi_description: initialData.sindhi_description ?? prev.sindhi_description,
        sindhi_characteristics: Array.isArray(initialData.sindhi_characteristics) ? initialData.sindhi_characteristics as string[] : prev.sindhi_characteristics,
        english_name: initialData.english_name ?? prev.english_name,
        english_description: initialData.english_description ?? prev.english_description,
        english_characteristics: Array.isArray(initialData.english_characteristics) ? initialData.english_characteristics as string[] : prev.english_characteristics,
        is_featured: initialData.is_featured ?? prev.is_featured,
        sort_order: initialData.sort_order !== undefined ? Number(initialData.sort_order) : prev.sort_order,
        selected_poets: Array.isArray(initialData.selected_poets) ? initialData.selected_poets as string[] : prev.selected_poets,
        selected_categories: Array.isArray(initialData.selected_categories) ? initialData.selected_categories as string[] : prev.selected_categories,
        selected_themes: Array.isArray(initialData.selected_themes) ? initialData.selected_themes as string[] : prev.selected_themes,
      }));
    }
  }, [isOpen, mode, initialData]);

  // Add error boundary for unhandled errors
  const handleError = (error: any) => {
    console.error('Unhandled error in AddPeriodPopup:', error);
    setSubmitStatus('error');
    setIsSubmitting(false);
  };

  // Fetch data when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filter poets based on period dates
  useEffect(() => {
    if (formData.start_year && poets.length > 0) {
      const startYear = parseInt(formData.start_year);
      const endYear = formData.is_ongoing ? new Date().getFullYear() : parseInt(formData.end_year || '0');
      
      const filtered = poets.filter(poet => {
        if (!poet.birth_year) return false;
        return poet.birth_year >= startYear && (formData.is_ongoing || poet.birth_year <= endYear);
      });
      setFilteredPoets(filtered);
    } else {
      setFilteredPoets(poets);
    }
  }, [formData.start_year, formData.end_year, formData.is_ongoing, poets]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poetsRes, categoriesRes, themesRes] = await Promise.all([
        fetch('/api/poets/?limit=100'),
        fetch('/api/poetry/categories/'),
        fetch('/api/tags/?type=Theme')
      ]);

      if (poetsRes.ok) {
        const poetsData = await poetsRes.json();
        setPoets(poetsData.poets || []);
      } else {
        console.error('Failed to fetch poets:', poetsRes.status, poetsRes.statusText);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      } else {
        console.error('Failed to fetch categories:', categoriesRes.status, categoriesRes.statusText);
      }

      if (themesRes.ok) {
        const themesData = await themesRes.json();
        setThemes(themesData.tags || []);
      } else {
        console.error('Failed to fetch themes:', themesRes.status, themesRes.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      setIsSubmitting(true);
      setSubmitStatus('idle');

      console.log('Submitting form data:', formData);
      await onSubmit(formData);
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error creating period:', error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
        console.error('Error value:', error);
      }
      
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setSubmitStatus('idle');
    onClose();
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleInputChange = (field: keyof PeriodFormData, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug when English name changes
      if (field === 'english_name' && typeof value === 'string') {
        setIsGeneratingSlug(true);
        const generatedSlug = generateSlug(value);
        newData.period_slug = generatedSlug;
        
        // Reset generating state after a short delay
        setTimeout(() => {
          setIsGeneratingSlug(false);
        }, 500);
      }
      
      return newData;
    });
  };

  const addCharacteristic = (lang: 'sindhi' | 'english') => {
    const value = lang === 'sindhi' ? newCharacteristic.sindhi : newCharacteristic.english;
    if (value.trim()) {
      const field = lang === 'sindhi' ? 'sindhi_characteristics' : 'english_characteristics';
      const otherField = lang === 'sindhi' ? 'english_characteristics' : 'sindhi_characteristics';
      
      setFormData(prev => {
        const newCharacteristics = [...prev[field], value.trim()];
        const otherCharacteristics = prev[otherField];
        
        // Ensure both arrays have the same length
        const maxLength = Math.max(newCharacteristics.length, otherCharacteristics.length);
        const paddedOtherCharacteristics = [...otherCharacteristics];
        while (paddedOtherCharacteristics.length < maxLength) {
          paddedOtherCharacteristics.push('');
        }
        
        return {
          ...prev,
          [field]: newCharacteristics,
          [otherField]: paddedOtherCharacteristics
        };
      });
      
      setNewCharacteristic(prev => ({ ...prev, [lang]: '' }));
    }
  };

  const removeCharacteristic = (lang: 'sindhi' | 'english', index: number) => {
    const field = lang === 'sindhi' ? 'sindhi_characteristics' : 'english_characteristics';
    const otherField = lang === 'sindhi' ? 'english_characteristics' : 'sindhi_characteristics';
    
    setFormData(prev => {
      const newCharacteristics = prev[field].filter((_, i) => i !== index);
      const otherCharacteristics = prev[otherField];
      
      // Ensure both arrays have the same length
      const maxLength = Math.max(newCharacteristics.length, otherCharacteristics.length);
      const paddedOtherCharacteristics = [...otherCharacteristics];
      while (paddedOtherCharacteristics.length < maxLength) {
        paddedOtherCharacteristics.push('');
      }
      
      return {
        ...prev,
        [field]: newCharacteristics,
        [otherField]: paddedOtherCharacteristics
      };
    });
  };

  const toggleSelection = (type: 'poets' | 'categories' | 'themes', id: string) => {
    const field = `selected_${type}` as keyof PeriodFormData;
    setFormData(prev => {
      const current = prev[field] as string[];
      const updated = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden"
              >
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-[#E5E5E5]">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                        <History className="w-4 h-4 text-[#1F1F1F]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#1F1F1F]">{mode === 'edit' ? 'Edit Timeline Period' : 'Add Timeline Period'}</h2>
                        <p className="text-[#6B6B6B] text-sm">{mode === 'edit' ? 'Update historical period' : 'Create a new historical period'}</p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClose}
                      className="w-8 h-8 bg-[#F8F9FA] hover:bg-[#F1F3F4] rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-[#6B6B6B]" />
                    </motion.button>
                  </motion.div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="english_name" className="text-sm font-medium text-[#1F1F1F] flex items-center space-x-2">
                          <span>English Name</span>
                          <span className="text-xs text-[#6B6B6B] bg-[#F1F3F4] px-2 py-1 rounded-md flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>Generates slug</span>
                          </span>
                        </Label>
                        <Input
                          id="english_name"
                          value={formData.english_name}
                          onChange={(e) => handleInputChange('english_name', e.target.value)}
                          placeholder="Classical Sindhi Poetry"
                          className="h-11 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sindhi_name" className="text-sm font-medium text-[#1F1F1F]">
                          Sindhi Name
                        </Label>
                        <Input
                          id="sindhi_name"
                          value={formData.sindhi_name}
                          onChange={(e) => handleInputChange('sindhi_name', e.target.value)}
                          placeholder="ڪلاسيڪل سنڌي شاعري"
                          className="h-11 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="period_slug" className="text-sm font-medium text-[#1F1F1F] flex items-center space-x-2">
                          <span>Period Slug</span>
                          <span className="text-xs text-[#6B6B6B] bg-[#F1F3F4] px-2 py-1 rounded-md flex items-center space-x-1">
                            {isGeneratingSlug ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3" />
                                <span>Auto-generated</span>
                              </>
                            )}
                          </span>
                        </Label>
                        <Input
                          id="period_slug"
                          value={formData.period_slug}
                          placeholder="classical-sindhi-poetry"
                          className="h-11 rounded-xl border-0 bg-[#F8F9FA] transition-all duration-200 placeholder:opacity-60 cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_year" className="text-sm font-medium text-[#1F1F1F]">
                            Start Year
                          </Label>
                          <Input
                            id="start_year"
                            type="number"
                            value={formData.start_year}
                            onChange={(e) => handleInputChange('start_year', e.target.value)}
                            placeholder="1100"
                            className="h-11 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end_year" className="text-sm font-medium text-[#1F1F1F]">
                            End Year
                          </Label>
                          <Input
                            id="end_year"
                            type="number"
                            value={formData.end_year}
                            onChange={(e) => handleInputChange('end_year', e.target.value)}
                            placeholder="1800"
                            className="h-11 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 disabled:opacity-50 placeholder:opacity-60"
                            disabled={formData.is_ongoing}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3 pt-8">
                          <input
                            type="checkbox"
                            id="is_ongoing"
                            checked={formData.is_ongoing}
                            onChange={(e) => handleInputChange('is_ongoing', e.target.checked)}
                            className="w-4 h-4 text-[#1F1F1F] border-[#E5E5E5] rounded focus:ring-[#1F1F1F]"
                          />
                          <Label htmlFor="is_ongoing" className="text-sm font-medium text-[#1F1F1F]">
                            Ongoing Period
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="sindhi_description" className="text-sm font-medium text-[#1F1F1F]">
                            Sindhi Description
                          </Label>
                          <Textarea
                            id="sindhi_description"
                            value={formData.sindhi_description}
                            onChange={(e) => handleInputChange('sindhi_description', e.target.value)}
                            placeholder="سنڌي شاعري جو سنھري دور..."
                            className="min-h-[100px] rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 resize-none placeholder:opacity-60"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="english_description" className="text-sm font-medium text-[#1F1F1F]">
                            English Description
                          </Label>
                          <Textarea
                            id="english_description"
                            value={formData.english_description}
                            onChange={(e) => handleInputChange('english_description', e.target.value)}
                            placeholder="The golden age of Sindhi poetry..."
                            className="min-h-[100px] rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 resize-none placeholder:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Characteristics */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-[#1F1F1F]">Sindhi Characteristics</Label>
                          <div className="space-y-3">
                            <div className="flex space-x-2">
                              <Input
                                value={newCharacteristic.sindhi}
                                onChange={(e) => setNewCharacteristic(prev => ({ ...prev, sindhi: e.target.value }))}
                                placeholder="سنڌي خاصيت..."
                                className="h-10 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCharacteristic('sindhi'))}
                              />
                              <Button
                                type="button"
                                onClick={() => addCharacteristic('sindhi')}
                                className="h-10 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#404040] text-white transition-all duration-200"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.sindhi_characteristics.map((char, index) => (
                                <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1 bg-[#F1F3F4] text-[#1F1F1F] hover:bg-[#E8EAED] transition-colors">
                                  <span>{char}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCharacteristic('sindhi', index)}
                                    className="ml-1 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-[#1F1F1F]">English Characteristics</Label>
                          <div className="space-y-3">
                            <div className="flex space-x-2">
                              <Input
                                value={newCharacteristic.english}
                                onChange={(e) => setNewCharacteristic(prev => ({ ...prev, english: e.target.value }))}
                                placeholder="English characteristic..."
                                className="h-10 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCharacteristic('english'))}
                              />
                              <Button
                                type="button"
                                onClick={() => addCharacteristic('english')}
                                className="h-10 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#404040] text-white transition-all duration-200"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.english_characteristics.map((char, index) => (
                                <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1 bg-[#F1F3F4] text-[#1F1F1F] hover:bg-[#E8EAED] transition-colors">
                                  <span>{char}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCharacteristic('english', index)}
                                    className="ml-1 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Forms/Categories */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-[#1F1F1F] flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-[#6B6B6B]" />
                        <span>Forms/Categories</span>
                      </Label>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-[#6B6B6B]" />
                          <span className="ml-2 text-sm text-[#6B6B6B]">Loading categories...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {categories.map((category) => (
                            <motion.button
                              key={category.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleSelection('categories', category.id)}
                              className={`p-3 rounded-xl text-left transition-all duration-200 ${
                                formData.selected_categories.includes(category.id)
                                  ? 'bg-[#1F1F1F] text-white shadow-lg'
                                  : 'bg-[#F8F9FA] text-[#1F1F1F] hover:bg-[#F1F3F4] hover:shadow-sm'
                              }`}
                            >
                              <div className="text-sm font-medium">{category.cat_name}</div>
                              <div className="text-xs opacity-60">{category.slug}</div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Poets */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-[#1F1F1F] flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#6B6B6B]" />
                        <span>Poets (Filtered by Period Dates)</span>
                      </Label>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-[#6B6B6B]" />
                          <span className="ml-2 text-sm text-[#6B6B6B]">Loading poets...</span>
                        </div>
                      ) : filteredPoets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {filteredPoets.map((poet) => (
                            <motion.button
                              key={poet.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleSelection('poets', poet.id)}
                              className={`p-3 rounded-xl text-left transition-all duration-200 ${
                                formData.selected_poets.includes(poet.id)
                                  ? 'bg-[#1F1F1F] text-white shadow-lg'
                                  : 'bg-[#F8F9FA] text-[#1F1F1F] hover:bg-[#F1F3F4] hover:shadow-sm'
                              }`}
                            >
                              <div className="text-sm font-medium">{poet.sindhi_name}</div>
                              <div className="text-xs opacity-60">{poet.english_name}</div>
                              {poet.birth_year && (
                                <div className="text-xs opacity-50">Born: {poet.birth_year}</div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[#6B6B6B]">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No poets found for this period</p>
                          <p className="text-xs mt-1">Try adjusting the start/end years</p>
                        </div>
                      )}
                    </div>

                    {/* Themes/Tags */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-[#1F1F1F] flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-[#6B6B6B]" />
                        <span>Themes/Tags</span>
                      </Label>
                      
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-[#6B6B6B]" />
                          <span className="ml-2 text-sm text-[#6B6B6B]">Loading themes...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {themes.map((theme) => (
                            <motion.button
                              key={theme.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleSelection('themes', theme.id)}
                              className={`p-3 rounded-xl text-left transition-all duration-200 ${
                                formData.selected_themes.includes(theme.id)
                                  ? 'bg-[#1F1F1F] text-white shadow-lg'
                                  : 'bg-[#F8F9FA] text-[#1F1F1F] hover:bg-[#F1F3F4] hover:shadow-sm'
                              }`}
                            >
                              <div className="text-sm font-medium">{theme.title}</div>
                              <div className="text-xs opacity-60">{theme.slug}</div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Additional Settings */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="sort_order" className="text-sm font-medium text-[#1F1F1F]">
                          Sort Order
                        </Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="h-11 rounded-xl border-0 bg-[#F8F9FA] focus:bg-white focus:ring-2 focus:ring-[#1F1F1F] transition-all duration-200 placeholder:opacity-60"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F4] transition-colors">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={formData.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                          className="w-4 h-4 text-[#1F1F1F] border-[#E5E5E5] rounded focus:ring-[#1F1F1F]"
                        />
                        <Label htmlFor="is_featured" className="text-sm font-medium text-[#1F1F1F] cursor-pointer">
                          Featured Period
                        </Label>
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{mode === 'edit' ? 'Period updated successfully!' : 'Period created successfully!'}</span>
                      </motion.div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{mode === 'edit' ? 'Failed to update period. Please try again.' : 'Failed to create period. Please try again.'}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end space-x-3 pt-8 border-t border-[#E5E5E5]"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="h-11 px-8 rounded-xl border-0 bg-[#F8F9FA] text-[#6B6B6B] hover:bg-[#F1F3F4] transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 px-8 rounded-xl bg-[#1F1F1F] hover:bg-[#404040] text-white transition-all duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{mode === 'edit' ? 'Saving...' : 'Creating...'}</span>
                        </div>
                      ) : (
                        mode === 'edit' ? 'Save Changes' : 'Create Period'
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
