"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Languages, 
  FileText, 
  MessageSquare, 
  CheckCircle,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
  Type,
  Quote,
  Heart,
  Eye,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AdminLayout from "@/components/layouts/AdminLayout";

interface Poet {
  id: string; // This is the UUID from the poets table
  poet_id: number; // This is the bigint ID that should be used for foreign keys
  sindhi_name: string;
  english_name: string;
  english_laqab?: string;
  file_url?: string;
}

interface Category {
  id: string;
  slug: string;
  contentStyle: string;
  englishName: string;
  sindhiName: string;
  englishPlural: string;
  sindhiPlural: string;
  englishDetails: string;
  sindhiDetails: string;
  languages: string[];
  summary: string;
  title: string;
}

interface HesudharEntry {
  id: number;
  word: string;
  correct: string;
}

interface RomanWordEntry {
  id: number;
  word_sd: string;
  word_roman: string;
}

type WorkflowStep = 'hesudhar' | 'romanizer' | 'poetry-details' | 'couplets' | 'transliterate';

export default function AdminPoetryCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('hesudhar');
  const [loading, setLoading] = useState(false);
  const [poets, setPoets] = useState<Poet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupletCounter, setCoupletCounter] = useState(1);
  
  // Step data
  const [hesudharText, setHesudharText] = useState('');
  const [hesudharOriginalText, setHesudharOriginalText] = useState('');
  const [hesudharResults, setHesudharResults] = useState<HesudharEntry[]>([]);
  const [hesudharCorrections, setHesudharCorrections] = useState<Array<{
    originalWord: string;
    correctedWord: string;
    position: number;
  }>>([]);
  const [hesudharCompleted, setHesudharCompleted] = useState(false);
  
  const [romanText, setRomanText] = useState('');
  const [romanResults, setRomanResults] = useState<RomanWordEntry[]>([]);
  const [romanCompleted, setRomanCompleted] = useState(false);
  const [wordsNotInDictionary, setWordsNotInDictionary] = useState<string[]>([]);
  const [newRomanization, setNewRomanization] = useState<{ [key: string]: string }>({});
  
  const [transliteratedText, setTransliteratedText] = useState('');
  const [transliterationCompleted, setTransliterationCompleted] = useState(false);
  const [finalRomanizedText, setFinalRomanizedText] = useState<string>('');
  
  // Couplets management
  const [couplets, setCouplets] = useState<Array<{
    id: string;
    text: string;
    slug: string;
    tags: string[];
  }>>([]);
  const [coupletsCompleted, setCoupletsCompleted] = useState(false);

  // Transliterated couplets with preserved metadata
  const [transliteratedCouplets, setTransliteratedCouplets] = useState<Array<{
    id: string;
    sindhiText: string;
    romanText: string;
    slug: string;
    tags: string[];
  }>>([]);
  
  const [poetryDetails, setPoetryDetails] = useState({
    sindhiTitle: '',
    englishTitle: '',
    slug: '',
    detail: '',
    source: '',
    poetId: '',
    categoryId: '',
    contentStyle: '',
    tags: ''
  });

  // New state for tags management
  const [availableTags, setAvailableTags] = useState<Array<{
    id: number;
    slug: string;
    label: string;
    tag_type: string;
    english: { title: string; details: string };
    sindhi: { title: string; details: string };
  }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagData, setNewTagData] = useState({
    slug: '',
    type: 'Topic',
    sindhi: { title: '', details: '' },
    english: { title: '', details: '' }
  });
  
  const [finalPoetry, setFinalPoetry] = useState({
    sindhiCouplets: [] as string[],
    englishCouplets: [] as string[]
  });
  
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSubmittedSlug, setLastSubmittedSlug] = useState<string>('');

  // Utility function to remove double spaces while preserving line breaks
  const removeDoubleSpaces = (text: string): string => {
    // Split by lines, clean each line, then rejoin
    return text
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n');
  };

  // Generate slug from text (no timestamp/random)
  const generateSlug = (text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    console.log('generateSlug called:', { text, baseSlug });
    return baseSlug;
  };

  // Auto-romanize English title from Sindhi poetry
  const autoRomanizeTitle = async (sindhiText: string) => {
    if (!sindhiText.trim()) return;
    
    try {
      const response = await fetch('/api/admin/romanizer/fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sindhiText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.romanizedText) {
          // Extract first line or first few words for title
          const lines = data.romanizedText.split('\n').filter((line: string) => line.trim());
          const firstLine = lines[0] || '';
          const titleWords = firstLine.split(' ').slice(0, 5).join(' '); // First 5 words
          
          const newSlug = generateSlug(titleWords);
          console.log('Auto-romanization: Generated unique slug:', { titleWords, newSlug });
          setPoetryDetails(prev => {
            console.log('Setting poetry details with new slug:', { 
              previousSlug: prev.slug, 
              newSlug, 
              isUnique: newSlug.includes('-') 
            });
            return {
              ...prev,
              englishTitle: titleWords,
              slug: newSlug
            };
          });
        }
      }
    } catch (error) {
      console.error('Error auto-romanizing title:', error);
    }
  };

  // Couplet management functions
  const addCouplet = () => {
    const newCouplet = {
      id: `couplet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      slug: '',
      tags: []
    };
    setCouplets(prev => [...prev, newCouplet]);
    setCoupletCounter(prev => prev + 1);
  };

  const removeCouplet = (id: string) => {
    if (couplets.length > 1) {
      setCouplets(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCouplet = (id: string, field: 'text' | 'slug' | 'tags', value: string | string[]) => {
    setCouplets(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const generateCoupletSlug = (text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Use only the normalized text as slug; no timestamp/random suffix
    return baseSlug;
  };

  const addCoupletTag = (coupletId: string, tagSlug: string) => {
    setCouplets(prev => prev.map(c => 
      c.id === coupletId 
        ? { ...c, tags: [...c.tags.filter(t => t !== tagSlug), tagSlug] }
        : c
    ));
  };

  const removeCoupletTag = (coupletId: string, tagSlug: string) => {
    setCouplets(prev => prev.map(c => 
      c.id === coupletId 
        ? { ...c, tags: c.tags.filter(t => t !== tagSlug) }
        : c
    ));
  };

  // Transliterate all couplets
  const transliterateAllCouplets = async () => {
    if (couplets.length === 0) {
      toast.error('No couplets to transliterate');
      return;
    }

    // Validate that all couplets have slugs
    const coupletsWithoutSlugs = couplets.filter(c => !c.slug || !c.slug.trim());
    if (coupletsWithoutSlugs.length > 0) {
      toast.error('Please generate slugs for all couplets before transliteration');
      return;
    }

    setLoading(true);
    try {
      const transliteratedResults = [];

      for (const couplet of couplets) {
        if (!couplet.text.trim()) continue;

        // Use the fast romanizer API
        const response = await fetch('/api/admin/romanizer/fast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: couplet.text }),
        });

        if (response.ok) {
          const data = await response.json();
          transliteratedResults.push({
            id: couplet.id,
            sindhiText: couplet.text,
            romanText: data.romanizedText || couplet.text,
            slug: couplet.slug,
            tags: couplet.tags
          });
        } else {
          // Fallback: keep original text if transliteration fails
          transliteratedResults.push({
            id: couplet.id,
            sindhiText: couplet.text,
            romanText: couplet.text,
            slug: couplet.slug,
            tags: couplet.tags
          });
        }
      }

      setTransliteratedCouplets(transliteratedResults);
      setTransliterationCompleted(true);
      toast.success(`✅ Successfully transliterated ${transliteratedResults.length} couplets`);
    } catch (error) {
      console.error('Error transliterating couplets:', error);
      toast.error('Failed to transliterate couplets');
    } finally {
      setLoading(false);
    }
  };

  // Save edited transliterated couplets
  const saveTransliteratedCouplets = () => {
    // Validate that all couplets have transliterated text
    const isValid = transliteratedCouplets.every(c => 
      c.romanText.trim()
    );

    if (!isValid) {
      toast.error('Please ensure all couplets have transliterated text');
      return;
    }

    // Update the transliterated couplets state
    setTransliteratedCouplets([...transliteratedCouplets]);
    toast.success('✅ Transliterated text saved successfully');
  };

  // Tag management functions
  const addTag = (tagSlug: string) => {
    if (!selectedTags.includes(tagSlug)) {
      setSelectedTags(prev => [...prev, tagSlug]);
      setPoetryDetails(prev => ({
        ...prev,
        tags: [...selectedTags, tagSlug].join(', ')
      }));
    }
  };

  const removeTag = (tagSlug: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagSlug);
    setSelectedTags(newTags);
    setPoetryDetails(prev => ({
      ...prev,
      tags: newTags.join(', ')
    }));
  };

  const createNewTag = async () => {
    if (!newTagData.slug || !newTagData.sindhi.title || !newTagData.english.title) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTagData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Tag created successfully!');
        
        // Refresh tags list
        const tagsResponse = await fetch('/api/admin/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setAvailableTags(tagsData.tags || []);
        }
        
        // Add the new tag to selected tags
        addTag(newTagData.slug);
        
        // Reset form and close modal
        setNewTagData({
          slug: '',
          type: 'Topic',
          sindhi: { title: '', details: '' },
          english: { title: '', details: '' }
        });
        setShowTagModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    }
  };

  // Load initial data
  useEffect(() => {
    loadPoetsAndCategories();
  }, []);

  // Initialize selectedTags from poetryDetails.tags when component loads
  useEffect(() => {
    if (poetryDetails.tags) {
      const tagsArray = poetryDetails.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      setSelectedTags(tagsArray);
    }
  }, [poetryDetails.tags]);

  // Initialize with one couplet if none exist
  useEffect(() => {
    if (couplets.length === 0) {
      addCouplet();
    }
  }, []); // Empty dependency array to run only once

  // Prevent multiple couplets from being added on re-renders
  const addCoupletSafe = useCallback(() => {
    if (couplets.length === 0) {
      addCouplet();
    }
  }, [couplets.length]);

  const loadPoetsAndCategories = async () => {
    try {
      const [poetsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/poets?limit=100'),
        fetch('/api/categories?all=true'),
        fetch('/api/admin/tags')
      ]);
      
      if (poetsRes.ok) {
        const poetsData = await poetsRes.json();
        console.log('Poets API response:', poetsData);
        console.log('Poets array:', poetsData.poets);
        if (poetsData.poets && poetsData.poets.length > 0) {
          console.log('First poet sample:', poetsData.poets[0]);
          console.log('First poet ID fields:', {
            id: poetsData.poets[0].id,
            poet_id: poetsData.poets[0].poet_id,
            type_id: typeof poetsData.poets[0].id,
            type_poet_id: typeof poetsData.poets[0].poet_id
          });
        }
        setPoets(poetsData.poets || []);
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.items || []);
        console.log('Loaded categories count (create page):', (categoriesData.items || []).length);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setAvailableTags(tagsData.tags || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Step validation and progression
  const canProceedToNext = () => {
    switch (currentStep) {
      case 'hesudhar':
        return hesudharCompleted;
      case 'romanizer':
        return romanCompleted;
      case 'poetry-details':
        return poetryDetails.sindhiTitle && poetryDetails.poetId && poetryDetails.categoryId;
      case 'couplets':
        return couplets.length > 0 && couplets.every(c => c.text.trim() && c.slug.trim());
      case 'transliterate':
        return transliterationCompleted && transliteratedCouplets.length > 0;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (!canProceedToNext()) return;
    
    const steps: WorkflowStep[] = ['hesudhar', 'romanizer', 'poetry-details', 'couplets', 'transliterate'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      // Copy corrected text to next step if moving from hesudhar
      if (currentStep === 'hesudhar' && hesudharText.trim()) {
        setRomanText(hesudharText);
      }
      
              // If moving from romanizer to poetry details, sync the romanizer file
        if (currentStep === 'romanizer') {
          toast.info('🔄 Syncing romanizer file to include new words...');
          setLoading(true);
          try {
            // Sync the romanizer file to include any new words added
            const syncResponse = await fetch('/api/admin/romanizer/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (syncResponse.ok) {
              const syncData = await syncResponse.json();
              if (syncData.success && syncData.newEntries > 0) {
                toast.success(`✅ Romanizer synced! ${syncData.newEntries} new entries available`);
              } else {
                toast.success('✅ Romanizer file is up to date');
              }
            } else {
              toast.error('Failed to sync romanizer file');
            }
          } catch (error) {
            console.error('Error syncing romanizer:', error);
            toast.error('Error syncing romanizer file');
          } finally {
            setLoading(false);
          }
        }

        // If moving from poetry details to couplets, validate required fields
        if (currentStep === 'poetry-details') {
          if (!poetryDetails.poetId) {
            toast.error('Please select a poet before proceeding');
            return;
          }
          if (!poetryDetails.categoryId) {
            toast.error('Please select a category before proceeding');
            return;
          }
          if (!poetryDetails.sindhiTitle.trim()) {
            toast.error('Please enter a Sindhi title before proceeding');
            return;
          }
          
          setCoupletsCompleted(false);
        }

        // If moving from couplets to transliterate, check if couplets are added and transliterate
        if (currentStep === 'couplets') {
          if (couplets.length === 0) {
            toast.error('Please add at least one couplet before proceeding');
            return;
          }
          
          // Mark couplets as completed
          setCoupletsCompleted(true);
          
          toast.info('🔄 Automatically transliterating couplets...');
          // Set loading state and automatically trigger transliteration
          setLoading(true);
          setTimeout(() => {
            transliterateAllCouplets();
          }, 100);
        }
      
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: WorkflowStep[] = ['hesudhar', 'romanizer', 'poetry-details', 'couplets', 'transliterate'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      // Clear transliteration results when going back
      if (currentStep === 'transliterate') {
        setTransliteratedText('');
        setFinalRomanizedText('');
        setTransliterationCompleted(false);
        setTransliteratedCouplets([]);
      }
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Manual correction application
  const applyManualCorrection = (originalWord: string, correctedWord: string) => {
    const newText = hesudharText.replace(new RegExp(`\\b${originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), correctedWord);
    setHesudharText(newText);
    
    // Update corrections list
    setHesudharCorrections(prev => 
      prev.map(corr => 
        corr.originalWord === originalWord 
          ? { ...corr, applied: true }
          : corr
      )
    );
    
    toast.success(`Applied correction: ${originalWord} → ${correctedWord}`);
  };

  // Reset hesudhar step
  const resetHesudharStep = () => {
    setHesudharText('');
    setHesudharOriginalText('');
    setHesudharResults([]);
    setHesudharCorrections([]);
    setHesudharCompleted(false);
  };

  // Hesudhar checking and correction
  const checkHesudhar = async () => {
    if (!hesudharText.trim()) {
      toast.error('Please enter text to check');
      return;
    }
    
    setLoading(true);
    try {
      // Store original text before correction
      setHesudharOriginalText(hesudharText);
      
      // First, perform hesudhar correction
      const correctionResponse = await fetch('/api/admin/hesudhar/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: hesudharText }),
      });

      if (correctionResponse.ok) {
        const correctionData = await correctionResponse.json();
        
        // Store corrections for display
        setHesudharCorrections(correctionData.corrections || []);
        
        // Update the text with corrections
        if (correctionData.correctedText !== hesudharText) {
          setHesudharText(correctionData.correctedText);
          toast.success(`Applied ${correctionData.corrections.length} hesudhar corrections!`);
        } else {
          toast.success('No hesudhar corrections needed!');
        }

        // Also fetch hesudhar dictionary entries for reference
        const response = await fetch(`/api/admin/romanizer/hesudhar?search=${encodeURIComponent(hesudharText)}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setHesudharResults(data.hesudhars || []);
        }
        
        setHesudharCompleted(true);
      } else {
        toast.error('Error during hesudhar correction');
      }
    } catch (error) {
      console.error('Hesudhar error:', error);
      toast.error('Error checking hesudhar');
    } finally {
      setLoading(false);
    }
  };

  // Sync hesudhar file from database
  const syncHesudharFile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hesudhar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`✅ Synced ${data.count} hesudhar corrections to local file`);
        } else {
          toast.error(data.message || 'Failed to sync hesudhar file');
        }
      } else {
        toast.error('Error syncing hesudhar file');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error syncing hesudhar file');
    } finally {
      setLoading(false);
    }
  };

  // Romanizer checking using fast local file
  const checkRomanizer = async () => {
    if (!romanText.trim()) {
      toast.error('Please enter text to check');
      return;
    }
    
    setLoading(true);
    try {
      // Use fast romanization API
      const response = await fetch('/api/admin/romanizer/fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: romanText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the text with romanizations
        if (data.romanizedText !== romanText) {
          setRomanText(data.romanizedText);
          toast.success(`Applied ${data.mappings.length} romanizations!`);
        } else {
          toast.success('No romanizations needed!');
        }
        
        // Store results for display
        setRomanResults(data.mappings.map((mapping: any) => ({
          id: Date.now() + Math.random(), // Generate temporary ID
          word_sd: mapping.sindhiWord,
          word_roman: mapping.romanWord
        })));
        
        // Find words not in dictionary using the same regex as the romanizer
        const allWords = romanText.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
        const romanizedWords = data.mappings.map((m: any) => m.sindhiWord);
        
        // Filter out words that were already romanized
        // Also filter out words that are already in newRomanization
        const notInDict = allWords.filter(word => 
          !romanizedWords.includes(word) && 
          !Object.keys(newRomanization).includes(word)
        );
        
        // Remove duplicates and set the words not in dictionary
        setWordsNotInDictionary([...new Set(notInDict)]);
        
        setRomanCompleted(true);
      } else {
        toast.error('Error during romanization');
      }
    } catch (error) {
      console.error('Romanizer error:', error);
      toast.error('Error checking romanizer');
    } finally {
      setLoading(false);
    }
  };

  // Add new romanization to dictionary
  const addNewRomanization = async (sindhiWord: string, romanWord: string) => {
    try {
      const response = await fetch('/api/admin/romanizer/roman-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_sd: sindhiWord,
          word_roman: romanWord
        }),
      });

      if (response.ok) {
        toast.success(`Added new romanization: ${sindhiWord} → ${romanWord}`);
        
        // Update local state
        setNewRomanization(prev => ({ ...prev, [sindhiWord]: romanWord }));
        
        // Remove from not in dictionary list
        setWordsNotInDictionary(prev => prev.filter(word => word !== sindhiWord));
        
        // Add to roman results for display
        setRomanResults(prev => [...prev, {
          id: Date.now() + Math.random(),
          word_sd: sindhiWord,
          word_roman: romanWord
        }]);
        
        // Update the roman text to include the new romanization
        const updatedRomanText = romanText.replace(
          new RegExp(sindhiWord, 'g'), 
          romanWord
        );
        setRomanText(updatedRomanText);
        
        // Clear the input for this word
        setNewRomanization(prev => {
          const updated = { ...prev };
          delete updated[sindhiWord];
          return updated;
        });
        
        // Don't sync or re-run romanization - just update locally
        // This prevents unwanted refresh of the entire romanization
        
      } else {
        toast.error('Failed to add romanization');
      }
    } catch (error) {
      console.error('Error adding romanization:', error);
      toast.error('Error adding romanization');
    }
  };

  // Sync romanizer file from database
  const syncRomanizerFile = async () => {
    setLoading(true);
    setSyncError(null); // Clear previous errors
    
    try {
      const response = await fetch('/api/admin/romanizer/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`✅ Synced ${data.newEntries || data.count} romanizer mappings successfully`);
          setSyncError(null);
        } else {
          const errorMsg = data.message || 'Failed to sync romanizer file';
          toast.error(errorMsg);
          setSyncError(errorMsg);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Sync API error:', response.status, errorData);
        
        let errorMsg = 'Unknown error occurred';
        if (response.status === 500) {
          errorMsg = 'Server error: Romanizer sync is not available in this environment';
        } else if (response.status === 403) {
          errorMsg = 'Access denied: You do not have permission to sync romanizer';
        } else {
          errorMsg = `Sync failed: ${errorData.error || 'Unknown error occurred'}`;
        }
        
        toast.error(errorMsg);
        setSyncError(errorMsg);
      }
    } catch (error) {
      console.error('Sync error:', error);
      
      let errorMsg = 'Unexpected error during sync operation';
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMsg = 'Network error: Unable to connect to sync service';
      }
      
      toast.error(errorMsg);
      setSyncError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Transliteration - Sindhi to English only
  const performTransliteration = async () => {
    if (!romanText.trim()) {
      toast.error('Please enter text to transliterate');
      return;
    }
    
    setLoading(true);
    try {
      // Check if text contains Sindhi characters
      const sindhiRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      
      if (!sindhiRegex.test(romanText)) {
        toast.error('Please enter Sindhi text for transliteration');
        setLoading(false);
        return;
      }
      
      // First, try to romanize any remaining Sindhi text using the updated romanizer
      const romanizationResponse = await fetch('/api/admin/romanizer/fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: romanText }),
      });
      
      let finalText = romanText;
      let romanizedWords = [];
      
      if (romanizationResponse.ok) {
        const romanizationData = await romanizationResponse.json();
        if (romanizationData.mappings.length > 0) {
          finalText = romanizationData.romanizedText;
          romanizedWords = romanizationData.mappings;
          setFinalRomanizedText(romanizationData.romanizedText);
          toast.success(`Found ${romanizationData.mappings.length} romanizations for transliteration`);
        }
      }
      
      // Now perform character-by-character transliteration on the romanized text
      const transliterated = finalText.split('').map(char => {
        const mapping: { [key: string]: string } = {
          'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 'th',
          'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd',
          'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
          'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
          'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ک': 'k',
          'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'w', 'ہ': 'h',
          'ی': 'y', 'ے': 'e', 'ڀ': 'bh', 'ڄ': 'jh', 'څ': 'ch',
          'ڇ': 'ch', 'ڊ': 'd', 'ڋ': 'd', 'ڌ': 'dh', 'ڍ': 'd',
          'ڎ': 'd', 'ڏ': 'd', 'ڐ': 'd', 'ڑ': 'r', 'ڒ': 'r',
          'ړ': 'r', 'ڔ': 'r', 'ڕ': 'r', 'ږ': 'gh', 'ڗ': 'gh',
          'ژ': 'zh', 'ڙ': 'r', 'ښ': 'sh', 'ڛ': 's', 'ڜ': 'sh',
          'ڝ': 's', 'ڞ': 's', 'ڟ': 't', 'ڠ': 'ng', 'ڡ': 'f',
          'ڢ': 'f', 'ڣ': 'f', 'ڤ': 'v', 'ڥ': 'v', 'ڦ': 'p',
          'ڧ': 'q', 'ڨ': 'q', 'ڪ': 'k', 'ګ': 'k', 'ڬ': 'k',
          'ڭ': 'ng', 'ڮ': 'ng', 'ڰ': 'g', 'ڱ': 'ng',
          'ڲ': 'k', 'ڳ': 'g', 'ڴ': 'g', 'ڵ': 'l', 'ڶ': 'l',
          'ڷ': 'l', 'ڸ': 'l', 'ڹ': 'n', 'ں': 'n', 'ڻ': 'n',
          'ڼ': 'n', 'ڽ': 'n', 'ھ': 'h1', 'ڿ': 'ch',
          'ۂ': 'h2', 'ۃ': 'h3', 'ۄ': 'w', 'ۅ': 'w', 'ۆ': 'o',
          'ۇ': 'u', 'ۈ': 'u', 'ۉ': 'u', 'ۊ': 'w', 'ۋ': 'v',
          'ۍ': 'y', 'ێ': 'y', 'ۏ': 'w', 'ې': 'o',
          'ۑ': 'y', 'ۓ': 'y', 'ۖ': '', 'ۗ': '',
          'ۘ': '', 'ۙ': '', 'ۚ': '', 'ۛ': '', 'ۜ': '',
          '۝': '', '۞': '', '۟': '', '۠': '', 'ۡ': '',
          'ۢ': '', 'ۣ': '', 'ۤ': '', 'ۥ': '', 'ۦ': '',
          'ۧ': '', 'ۨ': '', '۩': '', '۪': '', '۫': '',
          '۬': '', 'ۭ': '', 'ۮ': '', 'ۯ': '', '۰': '0',
          '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5',
          '۶': '6', '۷': '7', '۸': '8', '۹': '9', 'ۺ': 'sh',
          'ۻ': 'd', 'ۼ': 'gh', '۽': 'ng', '۾': 'm', 'ۿ': 'h'
        };
        return mapping[char] || char;
      }).join('');
      
      setTransliteratedText(transliterated);
      setTransliterationCompleted(true);
      toast.success('Transliteration completed!');
    } catch (error) {
      toast.error('Error during transliteration');
    } finally {
      setLoading(false);
    }
  };

  // Create poetry
  const createPoetry = async () => {
    if (!transliteratedCouplets.length) {
      toast.error('Please complete transliteration first');
      return;
    }
    
    if (!poetryDetails.sindhiTitle || !poetryDetails.poetId || !poetryDetails.categoryId) {
      toast.error('Please fill in all required poetry details');
      return;
    }
    
    if (transliteratedCouplets.length === 0) {
      toast.error('Please add and transliterate at least one couplet');
      return;
    }

    // Validate that all transliterated couplets have required fields
    const invalidCouplets = transliteratedCouplets.filter(c => 
      !c.sindhiText || !c.sindhiText.trim() || 
      !c.romanText || !c.romanText.trim() || 
      !c.slug || !c.slug.trim()
    );
    
    if (invalidCouplets.length > 0) {
      toast.error('Please ensure all couplets have valid text and slugs');
      return;
    }
    
          // Ensure slug is unique
      if (!poetryDetails.slug || !poetryDetails.slug.includes('-')) {
        const newSlug = generateSlug(poetryDetails.englishTitle || poetryDetails.sindhiTitle);
        console.log('Forcing unique slug generation:', newSlug);
        setPoetryDetails(prev => ({ ...prev, slug: newSlug }));
        toast.info('Generated unique slug for poetry');
        return; // Let user try again with the new slug
      }
      
      // Double-check slug uniqueness - new format: base-timestamp-random
      const currentSlug = poetryDetails.slug;
      const slugParts = currentSlug.split('-');
      
      if (slugParts.length < 3) {
        toast.error('Slug must contain timestamp and random component for uniqueness');
        const newSlug = generateSlug(poetryDetails.englishTitle || poetryDetails.sindhiTitle);
        setPoetryDetails(prev => ({ ...prev, slug: newSlug }));
        return;
      }
      
      // Extract timestamp (second to last part) and validate
      const timestampPart = slugParts[slugParts.length - 2];
      const timestamp = parseInt(timestampPart || '0');
      const now = Date.now();
      const timeDiff = now - timestamp;
      
      // If timestamp is older than 1 minute, regenerate
      if (timeDiff > 60000) {
        const newSlug = generateSlug(poetryDetails.englishTitle || poetryDetails.sindhiTitle);
        console.log('Timestamp too old, regenerating slug:', { oldSlug: currentSlug, newSlug, timeDiff });
        setPoetryDetails(prev => ({ ...prev, slug: newSlug }));
        toast.info('Regenerated slug due to old timestamp');
        return;
      }
      
      console.log('Final slug validation:', { 
        slug: currentSlug, 
        slugParts: slugParts.length,
        hasTimestamp: slugParts.length >= 3,
        timestamp: timestampPart,
        random: slugParts[slugParts.length - 1],
        timeDiff,
        isValid: timeDiff <= 60000
      });
    
    // Prevent multiple submissions
    if (loading) {
      toast.error('Please wait, form is already being submitted');
      return;
    }
    
    // Prevent duplicate submissions with same slug
    if (lastSubmittedSlug === poetryDetails.slug) {
      toast.error('This poetry has already been submitted. Please check if it was created successfully.');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare poetry data for submission - using ACTUAL database schema
      const poetryData = {
        poetry_slug: poetryDetails.slug,
        poet_id: parseInt(poetryDetails.poetId), // This is now poet.poet_id (bigint)
        category_id: parseInt(poetryDetails.categoryId), // Convert to bigint
        poetry_tags: selectedTags.join(', '), // This is character varying in DB, not array
        lang: 'sd', // Default to Sindhi
        visibility: true, // This is boolean in DB, not text
        is_featured: false,
        content_style: 'justified', // This column exists in DB
        // user_uuid will be set by the API if needed
        // Remove created_at and updated_at - let the database handle these
      };
      
      console.log('Poetry Details:', poetryDetails);
      console.log('Generated Slug:', poetryDetails.slug);
      console.log('Is Slug Unique?', poetryDetails.slug.includes('-'));
      console.log('Poet ID:', poetryDetails.poetId, 'Type:', typeof poetryDetails.poetId);
      console.log('Category ID:', poetryDetails.categoryId, 'Type:', typeof poetryDetails.categoryId);
      console.log('Selected Tags:', selectedTags);
      console.log('Couplets Count:', transliteratedCouplets.length);
      
      // Debug poet selection
      const selectedPoet = poets.find(p => p.poet_id?.toString() === poetryDetails.poetId);
      console.log('Selected Poet:', selectedPoet);
      console.log('Poet ID from selection:', selectedPoet?.poet_id);
      console.log('Poet UUID from selection:', selectedPoet?.id);
      console.log('All poets for debugging:', poets.map(p => ({ id: p.id, poet_id: p.poet_id, name: p.english_name })));

      // Create the main poetry record
      console.log('Sending poetry data:', poetryData);
      const poetryResponse = await fetch('/api/admin/poetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poetryData),
      });

      if (!poetryResponse.ok) {
        const errorData = await poetryResponse.json();
        console.error('Poetry creation error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create poetry');
      }

      const createdPoetry = await poetryResponse.json();
      
      // Now create the couplets in both languages (sd and en) with required joins
      const poetryIdNumeric = parseInt(createdPoetry.id);
      const poetIdNumeric = parseInt(createdPoetry.poet_id || poetryDetails.poetId);

      const coupletsData = transliteratedCouplets.flatMap(couplet => {
        const base = {
          poetry_id: poetryIdNumeric,
          poet_id: poetIdNumeric,
          couplet_slug: couplet.slug,
          couplet_tags: couplet.tags.join(', '),
        } as any;

        const sdRow = {
          ...base,
          couplet_text: couplet.sindhiText,
          lang: 'sd',
        };

        const rows: any[] = [sdRow];

        if (couplet.romanText && couplet.romanText.trim()) {
          rows.push({
            ...base,
            couplet_text: couplet.romanText,
            lang: 'en',
          });
        }

        return rows;
      });
      
      // Validate couplet slugs are unique per language (same slug across sd/en is allowed)
      const slugLangPairs = coupletsData.map(c => `${c.lang}:${c.couplet_slug}`);
      const uniquePairs = new Set(slugLangPairs);
      if (slugLangPairs.length !== uniquePairs.size) {
        console.error('Duplicate couplet slugs detected within same language:', slugLangPairs);
        toast.error('Duplicate couplet slugs detected within the same language. Please regenerate couplets.');
        return;
      }
      
      console.log('Couplets Data (sd/en):', coupletsData);
      console.log('First Couplet Sample:', coupletsData[0]);
      console.log('Couplet slugs validation:', { total: slugLangPairs.length, unique: uniquePairs.size, pairs: slugLangPairs });

      // Create couplets using the couplets API
      console.log('Sending couplets data:', coupletsData);
      const coupletsResponse = await fetch('/api/admin/poetry/couplets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coupletsData),
      });

      if (!coupletsResponse.ok) {
        const errorData = await coupletsResponse.json();
        console.error('Couplets creation error:', errorData);
        throw new Error(errorData.error || 'Failed to create couplets');
      }
      
      console.log('Couplets created successfully:', await coupletsResponse.json());

      // Create translations if needed
      if (poetryDetails.sindhiTitle || poetryDetails.englishTitle) {
        const translationsData = [];
        
        if (poetryDetails.sindhiTitle) {
          translationsData.push({
            poetry_id: parseInt(createdPoetry.id), // Convert to bigint
            title: poetryDetails.sindhiTitle,
            lang: 'sd',
            info: poetryDetails.detail || '', // Use the info column for details
            source: poetryDetails.source || '' // Use the source column for source
          });
        }
        
        if (poetryDetails.englishTitle) {
          translationsData.push({
            poetry_id: parseInt(createdPoetry.id), // Convert to bigint
            title: poetryDetails.englishTitle,
            lang: 'en',
            info: poetryDetails.detail || '', // Use the info column for details
            source: poetryDetails.source || '' // Use the source column for source
          });
        }

        if (translationsData.length > 0) {
          const translationsResponse = await fetch('/api/admin/poetry/translations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(translationsData),
          });

          if (!translationsResponse.ok) {
            console.warn('Failed to create translations, but poetry was created');
          }
        }
      }
      
      // Track successful submission
      setLastSubmittedSlug(poetryDetails.slug);
      
      toast.success('✅ Poetry created successfully!');
      
      // Redirect to the poetry management page
      setTimeout(() => {
        router.push('/admin/poetry');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating poetry:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating poetry');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'hesudhar', title: 'Hesudhar Check', icon: BookOpen, description: 'Check text for spelling errors' },
    { id: 'romanizer', title: 'Romanizer', icon: Languages, description: 'Convert to roman script' },
    { id: 'poetry-details', title: 'Poetry Details', icon: FileText, description: 'Add metadata and information' },
    { id: 'couplets', title: 'Manage Couplets', icon: BookOpen, description: 'Add and organize couplets' },
    { id: 'transliterate', title: 'Transliterate', icon: MessageSquare, description: 'Convert to English' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // State for dynamic poetry section
  const [selectedPoet, setSelectedPoet] = useState<Poet | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [availablePoetry, setAvailablePoetry] = useState<any[]>([]); // Placeholder for poetry data

  // Fetch available poetry when poet or category changes
  useEffect(() => {
    const fetchPoetry = async () => {
      if (!poetryDetails.poetId || !poetryDetails.categoryId) {
        setAvailablePoetry([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/poetry?poetId=${poetryDetails.poetId}&categoryId=${poetryDetails.categoryId}`);
        if (response.ok) {
          const data = await response.json();
          setAvailablePoetry(data.poetry || []);
          setSelectedPoet(poets.find(p => p.id === poetryDetails.poetId) || null);
          setSelectedCategory(categories.find(c => c.id === poetryDetails.categoryId) || null);
        } else {
          toast.error('Failed to fetch available poetry');
          setAvailablePoetry([]);
        }
      } catch (error) {
        console.error('Error fetching poetry:', error);
        toast.error('Failed to fetch available poetry');
        setAvailablePoetry([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoetry();
  }, [poetryDetails.poetId, poetryDetails.categoryId, poets, categories]);

  // Refresh words not in dictionary list
  const refreshWordsNotInDictionary = () => {
    if (!romanText.trim()) return;
    
    // Extract all words from the current text
    const allWords = romanText.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
    const romanizedWords = romanResults.map((r: any) => r.word_sd);
    
    // Filter out words that were already romanized
    // Also filter out words that are already in newRomanization
    const notInDict = allWords.filter(word => 
      !romanizedWords.includes(word) && 
      !Object.keys(newRomanization).includes(word)
    );
    
    // Remove duplicates and set the words not in dictionary
    setWordsNotInDictionary([...new Set(notInDict)]);
    
    toast.success(`Found ${notInDict.length} words that need romanization`);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Poetry Creation
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Create Poetry</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Step-by-step workflow for poetry creation with comprehensive tools and validation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                  onClick={() => router.push("/admin/poetry")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Poetry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

              {/* Progress Steps */}
              <div className="mb-8">
                <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                      <div className="flex space-x-4">
                        {steps.map((step, index) => {
                          const isActive = step.id === currentStep;
                          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                          const Icon = step.icon;
                          
                          return (
                            <div key={step.id} className="flex items-center">
                              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white shadow-md' 
                                  : isActive 
                                    ? 'bg-[#404040] border-[#404040] text-white shadow-md' 
                                    : 'bg-[#F4F4F5] border-[#E5E5E5] text-[#6B6B6B]'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-7 h-7" />
                                ) : (
                                  <Icon className="w-7 h-7" />
                                )}
                              </div>
                              {index < steps.length - 1 && (
                                <div className={`w-20 h-0.5 mx-4 transition-all duration-300 ${
                                  isCompleted ? 'bg-[#1F1F1F]' : 'bg-[#E5E5E5]'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-sm text-[#6B6B6B]">
                        Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step Content */}
              <div
                key={currentStep}
                className="min-h-[500px]"
              >
                {/* Hesudhar Step */}
                {currentStep === 'hesudhar' && (
                  <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm mb-8">
                      <CardHeader className="pb-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Text Validation
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-[#1F1F1F]">Hesudhar Check</h1>
                            <p className="text-lg text-[#6B6B6B] max-w-2xl">
                              Check your Sindhi text for spelling errors using our comprehensive hesudhar dictionary
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Main Content */}
                    <div className="space-y-8">
                      {/* Input Section */}
                      <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                            Text Input
                          </CardTitle>
                          <CardDescription className="text-[#6B6B6B]">
                            Enter your Sindhi poetry text for validation
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="hesudhar-text" dir="rtl" className="sindhi-label sindhi-text-lg text-[#1F1F1F] font-medium">سنڌي شاعري شامل ڪريو</Label>
                            <Textarea
                              id="hesudhar-text"
                              placeholder="سنڌي شاعري شامل ڪريو"
                              value={hesudharText}
                              onChange={(e) => setHesudharText(e.target.value)}
                              className="min-h-[120px] text-lg text-right sindhi-textarea sindhi-rtl border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                              dir="rtl"
                              style={{ direction: 'rtl', textAlign: 'right' }}
                            />
                          </div>
                          
                          <div className="flex gap-3">
                            <Button 
                              onClick={checkHesudhar} 
                              disabled={loading || !hesudharText.trim()}
                              className="flex-1 bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
                              size="lg"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Check & Correct
                            </Button>
                            
                            <Button
                              onClick={syncHesudharFile}
                              variant="outline"
                              disabled={loading}
                              className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                              size="sm"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync
                            </Button>
                            
                            <Button 
                              onClick={resetHesudharStep}
                              variant="outline"
                              disabled={loading}
                              className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                              size="lg"
                            >
                              Reset
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Results Section */}
                      {hesudharResults.length > 0 && (
                        <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                              <BookOpen className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                              Dictionary Entries
                            </CardTitle>
                            <CardDescription className="text-[#6B6B6B]">
                              Found spelling suggestions and corrections
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {hesudharResults.slice(0, 5).map((result) => (
                                <div key={result.id} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
                                  <span className="text-[#1F1F1F] sindhi-text-base" dir="rtl">{result.word}</span>
                                  <span className="text-[#1F1F1F] font-medium">→ </span>
                                  <span className="text-[#1F1F1F] font-medium sindhi-text-base" dir="rtl">{result.correct}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Romanizer Step */}
                {currentStep === 'romanizer' && (
                  <div className="max-w-4xl mx-auto">
                    <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                          <Languages className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                          Romanizer
                        </CardTitle>
                        <CardDescription className="text-[#6B6B6B]">
                          Convert Sindhi text to romanized equivalents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="roman-text">Sindhi text for romanization</Label>
                          <Textarea
                            id="roman-text"
                            placeholder="Enter Sindhi text to find roman equivalents..."
                            value={romanText}
                            onChange={(e) => setRomanText(e.target.value)}
                            className="min-h-[120px] text-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-[#6B6B6B]">Dictionary Sync</p>
                              <p className="text-xs text-[#6B6B6B]">
                                Sync the latest romanizer mappings from the database
                              </p>
                            </div>
                            <Button
                              onClick={syncRomanizerFile}
                              variant="outline"
                              disabled={loading}
                              size="sm"
                              className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              {loading ? 'Syncing...' : 'Sync'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={checkRomanizer} 
                            disabled={loading || !romanText.trim()}
                            className="flex-1 bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
                            size="lg"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4 mr-2" />
                            )}
                            Check Romanizer
                          </Button>
                        </div>

                        {/* Sync Error Display */}
                        {syncError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-red-600 mt-1">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                              <div className="space-y-2">
                                <h5 className="font-medium text-red-800">Sync Error</h5>
                                <p className="text-sm text-red-700">{syncError}</p>
                                <p className="text-xs text-red-600">
                                  💡 This usually means the romanizer sync service is not available in your current environment. 
                                  You can still use the romanizer with existing mappings.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show words not in dictionary with option to add romanization */}
                        {wordsNotInDictionary.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium flex items-center gap-2 text-[#1F1F1F]">
                                <AlertCircle className="w-4 h-4" />
                                Words Not in Dictionary ({wordsNotInDictionary.length})
                              </h4>
                              <Button
                                onClick={refreshWordsNotInDictionary}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Refresh List
                              </Button>
                            </div>
                            <p className="text-sm text-[#6B6B6B]">
                              Add romanizations for these words. After adding, they will be applied to your text.
                            </p>
                            <div className="space-y-3">
                              {wordsNotInDictionary.map((word, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                                  <span className="sindhi-text-base text-[#1F1F1F]" dir="rtl">{word}</span>
                                  <span className="text-[#6B6B6B] font-medium">→</span>
                                  <Input
                                    placeholder="Enter romanization..."
                                    value={newRomanization[word] || ''}
                                    onChange={(e) => setNewRomanization(prev => ({ ...prev, [word]: e.target.value }))}
                                    className="flex-1 max-w-48 font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F9F9F9] transition-colors"
                                  />
                                  <Button
                                    onClick={() => addNewRomanization(word, newRomanization[word] || '')}
                                    disabled={!newRomanization[word]?.trim()}
                                    size="sm"
                                    variant="outline"
                                    className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                                  >
                                    Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

        {/* Poetry Details Step */}
        {currentStep === 'poetry-details' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm mb-8">
              <CardHeader className="pb-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
                    <FileText className="w-6 h-6 inline-block mr-2" />
                    Poetry Details
                  </h2>
                  <p className="text-[#6B6B6B]">
                    Add metadata and information about your poetry
                  </p>
                </div>
              </CardHeader>
            </Card>
            
            <div className="space-y-6">
              {/* Poetry Title */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sindhi-title" className="text-[#1F1F1F] font-medium">Sindhi Title</Label>
                      <Input
                        id="sindhi-title"
                        placeholder="سنڌي ٽائيٽل شامل ڪريو..."
                        value={poetryDetails.sindhiTitle}
                        onChange={(e) => {
                          const title = removeDoubleSpaces(e.target.value);
                          setPoetryDetails(prev => ({ 
                            ...prev, 
                            sindhiTitle: title
                          }));
                        }}
                        className="sindhi-input sindhi-rtl text-lg font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                        dir="rtl"
                        style={{ direction: 'rtl', textAlign: 'right' }}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => autoRomanizeTitle(poetryDetails.sindhiTitle)}
                          disabled={!poetryDetails.sindhiTitle.trim()}
                          variant="outline"
                          size="sm"
                          className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                        >
                          <Type className="w-4 h-4 mr-2" />
                          Auto-Romanize Title
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Poets */}
                      <div className="space-y-3">
                        <Label htmlFor="poet" className="text-sm font-semibold text-gray-700">Poet</Label>
                        <Select value={poetryDetails.poetId} onValueChange={(value) => setPoetryDetails(prev => ({ ...prev, poetId: value }))}>
                          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white hover:bg-gray-50 transition-colors rounded-lg">
                            <SelectValue placeholder={`Select a poet (${poets.length} available)`} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] bg-white border-gray-200 rounded-lg shadow-lg">
                            {poets.length > 0 ? (
                              poets.map((poet) => (
                                <SelectItem key={poet.id} value={poet.poet_id?.toString() || ''} className="hover:bg-gray-100 focus:bg-gray-100 py-3">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      {poet.file_url ? (
                                        <img 
                                          src={poet.file_url} 
                                          alt={poet.english_name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // Fallback to default avatar if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center ${poet.file_url ? 'hidden' : ''}`}>
                                        <span className="text-white text-sm font-semibold">
                                          {poet.english_name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-medium truncate text-gray-900 text-sm">
                                        {poet.english_laqab || poet.english_name}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                <div className="flex items-center justify-center mb-3">
                                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-lg">?</span>
                                  </div>
                                </div>
                                <p className="text-sm">No poets available</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {/* Selected Poet Display */}
                        {poetryDetails.poetId && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4">
                              {(() => {
                                const selectedPoet = poets.find(p => p.poet_id?.toString() === poetryDetails.poetId);
                                return selectedPoet ? (
                                  <>
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      {selectedPoet.file_url ? (
                                        <img 
                                          src={selectedPoet.file_url} 
                                          alt={selectedPoet.english_name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // Fallback to default avatar if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center ${selectedPoet.file_url ? 'hidden' : ''}`}>
                                        <span className="text-white text-lg font-semibold">
                                          {selectedPoet.english_name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-semibold text-lg text-gray-900 truncate">{selectedPoet.english_laqab || selectedPoet.english_name}</span>
                                    </div>
                                  </>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Category */}
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                        <Select value={poetryDetails.categoryId} onValueChange={(value) => setPoetryDetails(prev => ({ ...prev, categoryId: value }))}>
                          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white hover:bg-gray-50 transition-colors rounded-lg">
                            <SelectValue placeholder={categories.length > 0 ? `Select a category (${categories.length} available)` : "Loading categories..."} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] bg-white border-gray-200 rounded-lg shadow-lg">
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="hover:bg-gray-100 focus:bg-gray-100 py-3">
                                  <div className="flex flex-col w-full">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {category.englishName || category.sindhiName || category.slug}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                <div className="flex items-center justify-center mb-3">
                                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                                <p className="text-sm">Loading categories...</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {/* Selected Category Display */}
                        {poetryDetails.categoryId && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4">
                              {(() => {
                                const selectedCategory = categories.find(c => c.id === poetryDetails.categoryId);
                                return selectedCategory ? (
                                  <>
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-gray-600 text-lg font-semibold">
                                        {selectedCategory.englishName?.charAt(0)?.toUpperCase() || 
                                         selectedCategory.sindhiName?.charAt(0)?.toUpperCase() || 
                                         selectedCategory.slug?.charAt(0)?.toUpperCase() || '?'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-semibold text-lg text-gray-900 truncate">
                                        {selectedCategory.englishName || selectedCategory.sindhiName || selectedCategory.slug}
                                      </span>
                                    </div>
                                  </>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detail */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="poetry-detail" className="text-[#1F1F1F] font-medium">Detail</Label>
                    <Textarea
                      id="poetry-detail"
                      placeholder="Enter poetry description or details..."
                      value={poetryDetails.detail || ''}
                      onChange={(e) => setPoetryDetails(prev => ({ ...prev, detail: e.target.value }))}
                      className="min-h-[100px] font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Source */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="poetry-source" className="text-[#1F1F1F] font-medium">Source</Label>
                    <Input
                      id="poetry-source"
                      placeholder="Enter source information..."
                      value={poetryDetails.source || ''}
                      onChange={(e) => setPoetryDetails(prev => ({ ...prev, source: e.target.value }))}
                      className="font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Poetry Settings */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#1F1F1F]">Poetry Settings</h4>
                      <div className="flex items-center gap-4 text-sm text-[#6B6B6B]">
                        {poets.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {poets.length} poets loaded
                          </span>
                        )}
                        {categories.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {categories.length} categories loaded
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Data Loading Status */}
                    {(poets.length === 0 || categories.length === 0) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-600 mt-1">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium text-yellow-800">Loading Data</h5>
                            <div className="text-sm text-yellow-700 space-y-1">
                              {poets.length === 0 && (
                                <p>⏳ Loading poets... ({poets.length}/46)</p>
                              )}
                              {categories.length === 0 && (
                                <p>⏳ Loading categories... ({categories.length}/12)</p>
                              )}
                            </div>
                            <p className="text-xs text-yellow-600">
                              💡 Please wait while we load the available poets and categories
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#1F1F1F] font-medium">Tags</Label>
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
                    
                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tagSlug) => (
                          <Badge
                            key={tagSlug}
                            variant="secondary"
                            className="flex items-center gap-2 bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]"
                          >
                            {availableTags.find(t => t.slug === tagSlug)?.english.title || tagSlug}
                            <button
                              onClick={() => removeTag(tagSlug)}
                              className="ml-1 hover:text-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Available Tags */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Available Tags</Label>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        {availableTags.map((tag, index) => {
                          const isSelected = selectedTags.includes(tag.slug);
                          const colors = [
                            'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
                            'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
                            'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
                            'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
                            'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
                            'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
                            'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
                            'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                          ];
                          const selectedColors = [
                            'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                            'bg-green-500 text-white border-green-500 hover:bg-green-600',
                            'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                            'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
                            'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                            'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
                            'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
                            'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                          ];
                          const colorClass = isSelected ? selectedColors[index % selectedColors.length] : colors[index % colors.length];
                          
                          return (
                            <button
                              key={tag.id}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 transform hover:scale-105 active:scale-95 ${colorClass}`}
                              onClick={() => selectedTags.includes(tag.slug) ? removeTag(tag.slug) : addTag(tag.slug)}
                            >
                              {tag.english.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Poetry Title and Slug */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="english-title" className="text-[#1F1F1F] font-medium">Poetry Title (English)</Label>
                        <Input
                          id="english-title"
                          placeholder="Auto-generated from Sindhi poetry..."
                          value={poetryDetails.englishTitle}
                          onChange={(e) => {
                            const title = removeDoubleSpaces(e.target.value);
                            // Only generate new slug if we don't already have one with timestamp
                            if (!poetryDetails.slug || !poetryDetails.slug.includes('-')) {
                              const newSlug = generateSlug(title);
                              console.log('Title changed, generating new slug:', { title, newSlug });
                              setPoetryDetails(prev => ({ 
                                ...prev, 
                                englishTitle: title,
                                slug: newSlug
                              }));
                            } else {
                              // Just update the title, keep existing slug
                              console.log('Title changed, keeping existing slug:', { title, existingSlug: poetryDetails.slug });
                              setPoetryDetails(prev => ({ 
                                ...prev, 
                                englishTitle: title
                              }));
                            }
                          }}
                          className="font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="poetry-slug" className="text-[#1F1F1F] font-medium">Poetry Slug</Label>
                        <Input
                          id="poetry-slug"
                          placeholder="auto-generated-slug"
                          value={poetryDetails.slug || ''}
                          readOnly
                          className="font-ambile border-[#E5E5E5] bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSlug = generateSlug(poetryDetails.englishTitle || 'test');
                            console.log('Manual slug generation test:', { 
                              title: poetryDetails.englishTitle, 
                              newSlug,
                              isUnique: newSlug.includes('-')
                            });
                            setPoetryDetails(prev => ({ ...prev, slug: newSlug }));
                          }}
                          className="mt-2"
                        >
                          Regenerate Slug
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Couplets Step */}
        {currentStep === 'couplets' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                <BookOpen className="w-6 h-6 inline-block mr-2" />
                Manage Couplets ({couplets.length})
              </h2>
              <p className="text-gray-600">
                Add, edit, and organize your poetry couplets with individual slugs and tags
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Couplets Management */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Couplets ({couplets.length})</h4>
                    <Button
                      onClick={addCouplet}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Couplet
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Couplets List */}
                  <div className="space-y-6">
                    {couplets.map((couplet, index) => (
                      <div key={couplet.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-lg font-semibold text-gray-900">
                            Couplet #{index + 1}
                          </h5>
                          <Button
                            onClick={() => removeCouplet(couplet.id)}
                            variant="ghost"
                            size="sm"
                            disabled={couplets.length <= 1}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Couplet Text */}
                        <div className="space-y-4 mb-6">
                          <div className="space-y-2">
                            <Label htmlFor={`couplet-text-${couplet.id}`} className="text-sm font-semibold text-gray-700">Sindhi Text</Label>
                            <Textarea
                              id={`couplet-text-${couplet.id}`}
                              placeholder="سنڌي ۾ شعر لکو"
                              value={couplet.text}
                              onChange={async (e) => {
                                const text = removeDoubleSpaces(e.target.value);
                                updateCouplet(couplet.id, 'text', text);
                                // Auto-generate slug from transliterated first line
                                if (text.trim()) {
                                  try {
                                    const firstLine = text.split('\n')[0].trim();
                                    if (firstLine) {
                                      // Call the romanizer API to transliterate the first line
                                      const response = await fetch('/api/admin/romanizer/fast', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ text: firstLine }),
                                      });
                                      
                                      if (response.ok) {
                                        const data = await response.json();
                                        if (data.romanizedText) {
                                          // Generate slug from the transliterated text
                                          const transliteratedSlug = generateCoupletSlug(data.romanizedText);
                                          updateCouplet(couplet.id, 'slug', transliteratedSlug);
                                        } else {
                                          // Fallback to original text if romanization fails
                                          updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                        }
                                      } else {
                                        // Fallback to original text if API call fails
                                        updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error auto-generating transliterated slug:', error);
                                    // Fallback to original text if there's an error
                                    const firstLine = text.split('\n')[0].trim();
                                    updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                  }
                                }
                              }}
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg font-ambile text-lg"
                              dir="rtl"
                              style={{ 
                                direction: 'rtl', 
                                textAlign: 'right',
                                fontFamily: 'Ambile, Noto Sans Arabic, Arial, sans-serif',
                                minHeight: '120px'
                              }}
                            />
                          </div>

                          {/* Couplet Slug */}
                          <div className="space-y-2">
                            <Label htmlFor={`couplet-slug-${couplet.id}`} className="text-sm font-semibold text-gray-700">Couplet Slug</Label>
                            <div className="flex gap-3">
                              <Input
                                id={`couplet-slug-${couplet.id}`}
                                placeholder="auto-generated-slug"
                                value={couplet.slug}
                                onChange={(e) => updateCouplet(couplet.id, 'slug', e.target.value)}
                                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (couplet.text.trim()) {
                                    try {
                                      // Get the first line of the couplet
                                      const firstLine = couplet.text.split('\n')[0].trim();
                                      if (firstLine) {
                                        // Call the romanizer API to transliterate the first line
                                        const response = await fetch('/api/admin/romanizer/fast', {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                          },
                                          body: JSON.stringify({ text: firstLine }),
                                        });
                                        
                                        if (response.ok) {
                                          const data = await response.json();
                                          if (data.romanizedText) {
                                            // Generate slug from the transliterated text
                                            const transliteratedSlug = generateCoupletSlug(data.romanizedText);
                                            updateCouplet(couplet.id, 'slug', transliteratedSlug);
                                            toast.success('Slug generated from transliterated text!');
                                          } else {
                                            // Fallback to original text if romanization fails
                                            updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                            toast.info('Slug generated from original text');
                                          }
                                        } else {
                                          // Fallback to original text if API call fails
                                          updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                          toast.info('Slug generated from original text');
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error generating transliterated slug:', error);
                                      // Fallback to original text if there's an error
                                      const firstLine = couplet.text.split('\n')[0].trim();
                                      updateCouplet(couplet.id, 'slug', generateCoupletSlug(firstLine));
                                      toast.error('Error generating transliterated slug, using original text');
                                    }
                                  }
                                }}
                                disabled={!couplet.text.trim()}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                              >
                                <Wand2 className="w-4 h-4 mr-1" />
                                Transliterate
                              </Button>
                            </div>
                          </div>
                      </div>

                        {/* Couplet Tags */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-700">Couplet Tags</Label>
                            <span className="text-xs text-gray-500">
                              {couplet.tags.length} tags selected
                            </span>
                          </div>
                          
                          {/* Selected Tags */}
                          {couplet.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {couplet.tags.map((tagSlug, index) => {
                                const isSelected = true;
                                const selectedColors = [
                                  'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                                  'bg-green-500 text-white border-green-500 hover:bg-green-600',
                                  'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                                  'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
                                  'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                                  'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
                                  'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
                                  'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                                ];
                                const colorClass = selectedColors[index % selectedColors.length];
                                
                                return (
                                  <button
                                    key={tagSlug}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${colorClass}`}
                                    onClick={() => removeCoupletTag(couplet.id, tagSlug)}
                                  >
                                    {availableTags.find(t => t.slug === tagSlug)?.english.title || tagSlug}
                                    <X className="w-3 h-3" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Available Tags */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Available Tags</Label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                              {availableTags.map((tag, index) => {
                                const isSelected = couplet.tags.includes(tag.slug);
                                const colors = [
                                  'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
                                  'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
                                  'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
                                  'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
                                  'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
                                  'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
                                  'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
                                  'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                                ];
                                const selectedColors = [
                                  'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                                  'bg-green-500 text-white border-green-500 hover:bg-green-600',
                                  'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                                  'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
                                  'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                                  'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
                                  'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
                                  'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                                ];
                                const colorClass = isSelected ? selectedColors[index % selectedColors.length] : colors[index % colors.length];
                                
                                return (
                                  <button
                                    key={tag.id}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 transform hover:scale-105 active:scale-95 ${colorClass}`}
                                    onClick={() => couplet.tags.includes(tag.slug) 
                                      ? removeCoupletTag(couplet.id, tag.slug) 
                                      : addCoupletTag(couplet.id, tag.slug)
                                    }
                                  >
                                    {tag.english.title}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Poetry Section - Below Couplets */}
        {currentStep === 'couplets' && selectedPoet && selectedCategory && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-light text-white mb-2">
                Available Poetry
              </h2>
              <p className="text-white/60 text-sm">
                Poetry from {selectedPoet.english_name} in {selectedCategory.title} category
              </p>
            </div>

            <div className="space-y-6">
              {/* Poetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePoetry.map((poetry, index) => (
                  <div
                    key={poetry.id}
                    className="group h-full"
                  >
                    <div className="h-full rounded-lg border border-[#E5E5E5] transition-all bg-white hover:bg-[#F4F4F5] hover:shadow-sm">
                      <div className="p-5 h-full flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-11 w-11 rounded-lg bg-[#F4F4F5] flex items-center justify-center shrink-0">
                            <Quote className="w-5 h-5 text-[#1F1F1F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#1F1F1F] text-sm leading-tight mb-1">
                              {poetry.title}
                            </h3>
                            <p className="text-[#6B6B6B] text-xs">
                              {poetry.poet?.english_name || 'Unknown Poet'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-center space-y-1 mb-4">
                            {poetry.couplets?.slice(0, 2).map((couplet: any, idx: number) => (
                              <div key={idx} className="leading-relaxed text-white/80 text-sm sindhi-text" dir="rtl">
                                {couplet.sindhi_text}
                              </div>
                            ))}
                            {poetry.couplets && poetry.couplets.length > 2 && (
                              <div className="text-white/60 text-xs">
                                +{poetry.couplets.length - 2} more couplets
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {poetry.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                                <span key={tagIndex} className="px-2 py-1 bg-white/10 rounded text-white/60 text-[10px]">
                                  #{tag}
                                </span>
                              ))}
                              {poetry.tags && poetry.tags.length > 3 && (
                                <span className="px-2 py-1 bg-white/10 rounded text-white/60 text-[10px]">
                                  +{poetry.tags.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-white/60">
                              <span className="inline-flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                {poetry.likes || 0}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {poetry.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Poetry Message */}
              {availablePoetry.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-white/60" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Poetry Found</h3>
                  <p className="text-white/60 text-sm">
                    No poetry found for {selectedPoet.english_name} in {selectedCategory.title} category.
                  </p>
                </div>
              )

              {/* Tips */}
                              <div className="bg-white/5 border border-white/20 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="text-white/60 mt-1">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-white">Poetry Reference Tips</h5>
                    <ul className="text-sm text-white/60 space-y-1">
                      <li>• Review existing poetry to understand the style and structure</li>
                      <li>• Use similar themes and tags for consistency</li>
                      <li>• Study couplet patterns and language usage</li>
                      <li>• This helps maintain quality and consistency across your collection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tag Creation Modal */}
        <AnimatePresence>
          {showTagModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Create New Tag</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTagModal(false)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-4"
                  >
                    {/* Tag Slug */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-slug" className="text-sm font-medium text-gray-700">Tag Slug</Label>
                      <Input
                        id="tag-slug"
                        placeholder="tag-slug"
                        value={newTagData.slug}
                        onChange={(e) => setNewTagData(prev => ({ ...prev, slug: e.target.value }))}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md transition-colors"
                      />
                    </div>
                    
                    {/* Tag Type */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-type" className="text-sm font-medium text-gray-700">Tag Type</Label>
                      <Select value={newTagData.type} onValueChange={(value) => setNewTagData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Topic">Topic</SelectItem>
                          <SelectItem value="Theme">Theme</SelectItem>
                          <SelectItem value="Style">Style</SelectItem>
                          <SelectItem value="Period">Period</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Sindhi Title */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-sindhi" className="text-sm font-medium text-gray-700">Sindhi Title</Label>
                      <Input
                        id="tag-sindhi"
                        placeholder="سنڌي عنوان"
                        value={newTagData.sindhi.title}
                        onChange={(e) => setNewTagData(prev => ({ 
                          ...prev, 
                          sindhi: { ...prev.sindhi, title: e.target.value }
                        }))}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md transition-colors font-noto-sans-arabic text-lg"
                        dir="rtl"
                        style={{ 
                          direction: 'rtl', 
                          textAlign: 'right',
                          fontFamily: 'Noto Sans Arabic, Arial, sans-serif',
                          fontSize: '16px',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>
                    
                    {/* English Title */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-english" className="text-sm font-medium text-gray-700">English Title</Label>
                      <Input
                        id="tag-english"
                        placeholder="English Title"
                        value={newTagData.english.title}
                        onChange={(e) => setNewTagData(prev => ({ 
                          ...prev, 
                          english: { ...prev.english, title: e.target.value }
                        }))}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md transition-colors"
                      />
                    </div>
                    
                    {/* Sindhi Details */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-sindhi-details" className="text-sm font-medium text-gray-700">Sindhi Details</Label>
                      <Textarea
                        id="tag-sindhi-details"
                        placeholder="سنڌي تفصيل"
                        value={newTagData.sindhi.details}
                        onChange={(e) => setNewTagData(prev => ({ 
                          ...prev, 
                          sindhi: { ...prev.sindhi, details: e.target.value }
                        }))}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md transition-colors font-noto-sans-arabic text-base"
                        dir="rtl"
                        style={{ 
                          direction: 'rtl', 
                          textAlign: 'right',
                          fontFamily: 'Noto Sans Arabic, Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                        rows={2}
                      />
                    </div>
                    
                    {/* English Details */}
                    <div className="space-y-2">
                      <Label htmlFor="tag-english-details" className="text-sm font-medium text-gray-700">English Details</Label>
                      <Textarea
                        id="tag-english-details"
                        placeholder="English Details"
                        value={newTagData.english.details}
                        onChange={(e) => setNewTagData(prev => ({ 
                          ...prev, 
                          english: { ...prev.english, details: e.target.value }
                        }))}
                        className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md transition-colors"
                        rows={2}
                      />
                    </div>
                  </motion.div>
                </div>
                
                {/* Actions - Fixed at bottom */}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="px-4 py-3 border-t border-gray-200 bg-gray-50"
                >
                  <div className="flex gap-3">
                    <Button
                      onClick={createNewTag}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-md transition-colors disabled:opacity-50"
                      disabled={!newTagData.slug || !newTagData.sindhi.title || !newTagData.english.title}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tag
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowTagModal(false)}
                      className="px-4 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Transliteration Step */}
        {currentStep === 'transliterate' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                <MessageSquare className="w-6 h-6 inline-block mr-2" />
                English Transliteration
              </h2>
              <p className="text-gray-600">
                Your Sindhi couplets have been automatically transliterated to English/Roman
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Transliteration Status */}
              {!transliterationCompleted ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-600">Transliterating couplets...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Couplets Management */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">Transliterated Couplets ({transliteratedCouplets.length})</h4>
                        <div className="flex gap-3">
                          <Button
                            onClick={saveTransliteratedCouplets}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={transliterateAllCouplets}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Re-transliterate
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Couplets List */}
                      <div className="space-y-6">
                        {transliteratedCouplets.map((couplet, index) => (
                          <div key={couplet.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-lg font-semibold text-gray-900">
                                Couplet #{index + 1}
                              </h5>
                            </div>

                            {/* Couplet Text - English/Roman Transliteration */}
                            <div className="space-y-4 mb-6">
                              <div className="space-y-2">
                                <Label htmlFor={`transliterated-text-${couplet.id}`} className="text-sm font-semibold text-gray-700">English/Roman Text</Label>
                                <Textarea
                                  id={`transliterated-text-${couplet.id}`}
                                  placeholder="Edit transliterated text if needed..."
                                  value={couplet.romanText}
                                  onChange={(e) => {
                                    const updatedCouplets = transliteratedCouplets.map(c => 
                                      c.id === couplet.id ? { ...c, romanText: e.target.value } : c
                                    );
                                    setTransliteratedCouplets(updatedCouplets);
                                  }}
                                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg text-lg"
                                  style={{ minHeight: '120px' }}
                                />
                              </div>

                              {/* Couplet Slug */}
                              <div className="space-y-2">
                                <Label htmlFor={`transliterated-slug-${couplet.id}`} className="text-sm font-semibold text-gray-700">Couplet Slug</Label>
                                <Input
                                  id={`transliterated-slug-${couplet.id}`}
                                  placeholder="Slug from step 4"
                                  value={couplet.slug}
                                  readOnly
                                  className="border-gray-300 bg-gray-50 cursor-not-allowed font-ambile rounded-lg"
                                />
                              </div>
                            </div>

                            {/* Couplet Tags */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-gray-700">Couplet Tags</Label>
                                <span className="text-xs text-gray-500">
                                  {couplet.tags.length} tags selected
                                </span>
                              </div>
                              
                              {/* Selected Tags */}
                              {couplet.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {couplet.tags.map((tagSlug, index) => {
                                    const selectedColors = [
                                      'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                                      'bg-green-500 text-white border-green-500 hover:bg-green-600',
                                      'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                                      'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
                                      'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                                      'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
                                      'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
                                      'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                                    ];
                                    const colorClass = selectedColors[index % selectedColors.length];
                                    
                                    return (
                                      <div
                                        key={tagSlug}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${colorClass}`}
                                      >
                                        {availableTags.find(t => t.slug === tagSlug)?.english.title || tagSlug}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Available Tags */}
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Available Tags</Label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                  {availableTags.map((tag, index) => {
                                    const isSelected = couplet.tags.includes(tag.slug);
                                    const colors = [
                                      'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
                                      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
                                      'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
                                      'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
                                      'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
                                      'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
                                      'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
                                      'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                                    ];
                                    const selectedColors = [
                                      'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                                      'bg-green-500 text-white border-green-500 hover:bg-green-600',
                                      'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                                      'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
                                      'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                                      'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
                                      'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
                                      'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                                    ];
                                    const colorClass = isSelected ? selectedColors[index % selectedColors.length] : colors[index % colors.length];
                                    
                                    return (
                                      <div
                                        key={tag.id}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${colorClass}`}
                                      >
                                        {tag.english.title}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Submission */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">Ready to Create Poetry!</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                          <CheckCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            All steps are complete. Review your poetry details and couplets, then click the button below to save to the database.
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            onClick={createPoetry}
                            disabled={loading || !transliterationCompleted}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 text-lg font-medium rounded-lg"
                            size="lg"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating Poetry...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Create Poetry
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Hesudhar check completed</p>
                          <p>Romanization completed</p>
                          <p>Poetry details filled</p>
                          <p>Couplets added and organized</p>
                          <p>Transliteration completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
              </div>
        </div>

        {/* Navigation */}
        {currentStep !== 'transliterate' && (
          <div className="flex justify-between max-w-4xl mx-auto mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'hesudhar'}
              className="flex items-center gap-2 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 bg-[#1F1F1F] hover:bg-[#404040] text-white transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
