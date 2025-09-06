"use client";

import { useState, useEffect, useCallback } from "react";
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
  Wand2,
  User,
  Tag
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
  id: string;
  poet_id: number;
  sindhi_name: string;
  english_name: string;
  english_laqab?: string;
  file_url?: string;
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

type WorkflowStep = 'hesudhar' | 'romanizer' | 'couplet-details';

export default function AdminCoupletCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('hesudhar');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [poets, setPoets] = useState<Poet[]>([]);
  
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
  
  const [coupletDetails, setCoupletDetails] = useState({
    coupletSlug: '',
    tags: [] as string[],
    poetId: '',
    coupletSindhi: '',
    coupletEnglish: ''
  });

  // Available tags
  const [availableTags, setAvailableTags] = useState<Array<{
    id: number;
    slug: string;
    label: string;
    tag_type: string;
    english: { title: string; details: string };
    sindhi: { title: string; details: string };
  }>>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState<Array<{
    id: number;
    slug: string;
    label: string;
    tag_type: string;
    english: { title: string; details: string };
    sindhi: { title: string; details: string };
  }>>([]);

  // Utility function to remove double spaces while preserving line breaks
  const removeDoubleSpaces = (text: string): string => {
    return text
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n');
  };

  // Generate slug from text
  const generateSlug = (text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return baseSlug;
  };

  // Load initial data
  useEffect(() => {
    loadPoetsAndTags();
  }, []);

  // Filter tags based on search term
  useEffect(() => {
    if (tagSearchTerm.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.english.title.toLowerCase().includes(tagSearchTerm.toLowerCase()) ||
        tag.sindhi.title.toLowerCase().includes(tagSearchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(tagSearchTerm.toLowerCase()) ||
        tag.tag_type.toLowerCase().includes(tagSearchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(availableTags);
    }
  }, [tagSearchTerm, availableTags]);

  // Debug logging for coupletDetails changes
  useEffect(() => {
    if (currentStep === 'couplet-details') {
      console.log('Couplet details updated:', coupletDetails);
    }
  }, [coupletDetails, currentStep]);

  // Check system setup status
  const [systemSetupStatus, setSystemSetupStatus] = useState<'checking' | 'ready' | 'needs-setup' | 'error'>('checking');
  
  const checkSystemSetup = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/poetry/couplets/setup');
      const data = await response.json();
      if (response.ok && data.exists) {
        setSystemSetupStatus('ready');
      } else {
        setSystemSetupStatus('needs-setup');
      }
    } catch (error) {
      console.error('Error checking system setup:', error);
      setSystemSetupStatus('error');
    }
  }, []);

  useEffect(() => {
    if (currentStep === 'couplet-details') {
      checkSystemSetup();
    }
  }, [currentStep, checkSystemSetup]);

  const loadPoetsAndTags = async () => {
    try {
      setDataLoading(true);
      const [poetsRes, tagsRes] = await Promise.all([
        fetch('/api/admin/poets?limit=100'),
        fetch('/api/poetry/couplets/create')
      ]);
      
      let poetsLoaded = false;
      let tagsLoaded = false;
      
      if (poetsRes.ok) {
        const poetsData = await poetsRes.json();
        console.log('Poets loaded:', poetsData);
        setPoets(poetsData.poets || []);
        poetsLoaded = true;
      } else {
        console.error('Failed to load poets:', poetsRes.status);
        toast.error('Failed to load poets');
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        console.log('Topic tags loaded:', tagsData);
        setAvailableTags(tagsData.tags || []);
        tagsLoaded = true;
      } else {
        console.error('Failed to load topic tags:', tagsRes.status);
        toast.error('Failed to load topic tags');
      }

      // Show success message if both loaded successfully
      if (poetsLoaded && tagsLoaded) {
        toast.success(`✅ Loaded ${poets.length} poets and ${availableTags.length} tags successfully!`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setDataLoading(false);
    }
  };

  const retryLoadData = () => {
    loadPoetsAndTags();
  };

  // Step validation and progression
  const canProceedToNext = () => {
    switch (currentStep) {
      case 'hesudhar':
        return hesudharCompleted;
      case 'romanizer':
        return romanCompleted;
      case 'couplet-details':
        const canCreate = coupletDetails.coupletSlug?.trim() && 
                         coupletDetails.poetId?.trim() && 
                         coupletDetails.coupletSindhi?.trim();
        
        // Debug logging for couplet-details step
        if (currentStep === 'couplet-details') {
          console.log('Validation check:', {
            coupletSlug: coupletDetails.coupletSlug,
            poetId: coupletDetails.poetId,
            coupletSindhi: coupletDetails.coupletSindhi,
            canCreate
          });
        }
        
        return canCreate;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (!canProceedToNext()) return;
    
    const steps: WorkflowStep[] = ['hesudhar', 'romanizer', 'couplet-details'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      // Copy corrected text to next step if moving from hesudhar
      if (currentStep === 'hesudhar' && hesudharText.trim()) {
        setRomanText(hesudharText);
        
        // Also populate the Sindhi couplet field with the corrected text
        setCoupletDetails(prev => ({
          ...prev,
          coupletSindhi: hesudharText.trim()
        }));
        
        console.log('Auto-populated couplet details:', {
          coupletSindhi: hesudharText.trim(),
          coupletSlug: coupletDetails.coupletSlug,
          poetId: coupletDetails.poetId
        });
        
        // Auto-generate English couplet and slug from the corrected text
        try {
          const firstLine = hesudharText.split('\n')[0].trim();
          if (firstLine) {
            // Generate slug from first line
            const slugResponse = await fetch('/api/admin/romanizer/fast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: firstLine }),
            });
            
            if (slugResponse.ok) {
              const slugData = await slugResponse.json();
              if (slugData.romanizedText) {
                const transliteratedSlug = generateSlug(slugData.romanizedText);
                setCoupletDetails(prev => ({ 
                  ...prev, 
                  coupletSlug: transliteratedSlug
                }));
              }
            }
          }
          
          // Translate the complete couplet text
          const fullTextResponse = await fetch('/api/admin/romanizer/fast', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: hesudharText.trim() }),
          });
          
          if (fullTextResponse.ok) {
            const fullTextData = await fullTextResponse.json();
            if (fullTextData.romanizedText) {
              setCoupletDetails(prev => ({ 
                ...prev, 
                coupletEnglish: fullTextData.romanizedText
              }));
            }
          }
        } catch (error) {
          console.error('Error auto-generating English couplet and slug:', error);
          // Fallback: generate slug from original text
          const firstLine = hesudharText.split('\n')[0].trim();
          if (firstLine) {
            const fallbackSlug = generateSlug(firstLine);
            setCoupletDetails(prev => ({ 
              ...prev, 
              coupletSlug: fallbackSlug
            }));
          }
        }
      }
      
      // If moving from romanizer to couplet details, sync the romanizer file
      if (currentStep === 'romanizer') {
        toast.info('Syncing romanizer file to include new words...');
        setLoading(true);
        try {
          const syncResponse = await fetch('/api/admin/romanizer/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            if (syncData.success && syncData.newEntries > 0) {
              toast.success(`Romanizer synced! ${syncData.newEntries} new entries available`);
            } else {
              toast.success('Romanizer file is up to date');
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
      
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: WorkflowStep[] = ['hesudhar', 'romanizer', 'couplet-details'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Hesudhar checking and correction
  const checkHesudhar = async () => {
    if (!hesudharText.trim()) {
      toast.error('Please enter text to check');
      return;
    }
    
    setLoading(true);
    try {
      setHesudharOriginalText(hesudharText);
      
      const correctionResponse = await fetch('/api/admin/hesudhar/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: hesudharText }),
      });

      if (correctionResponse.ok) {
        const correctionData = await correctionResponse.json();
        
        setHesudharCorrections(correctionData.corrections || []);
        
        if (correctionData.correctedText !== hesudharText) {
          setHesudharText(correctionData.correctedText);
          toast.success(`Applied ${correctionData.corrections.length} hesudhar corrections!`);
        } else {
          toast.success('No hesudhar corrections needed!');
        }

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

  // Romanizer checking
  const checkRomanizer = async () => {
    if (!romanText.trim()) {
      toast.error('Please enter text to check');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/romanizer/fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: romanText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.romanizedText !== romanText) {
          setRomanText(data.romanizedText);
          toast.success(`Applied ${data.mappings.length} romanizations!`);
        } else {
          toast.success('No romanizations needed!');
        }
        
        setRomanResults(data.mappings.map((mapping: any) => ({
          id: Date.now() + Math.random(),
          word_sd: mapping.sindhiWord,
          word_roman: mapping.romanWord
        })));
        
        const allWords = romanText.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
        const romanizedWords = data.mappings.map((m: any) => m.sindhiWord);
        
        const notInDict = allWords.filter(word => 
          !romanizedWords.includes(word) && 
          !Object.keys(newRomanization).includes(word)
        );
        
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
        
        setNewRomanization(prev => ({ ...prev, [sindhiWord]: romanWord }));
        setWordsNotInDictionary(prev => prev.filter(word => word !== sindhiWord));
        
        setRomanResults(prev => [...prev, {
          id: Date.now() + Math.random(),
          word_sd: sindhiWord,
          word_roman: romanWord
        }]);
        
        const updatedRomanText = romanText.replace(
          new RegExp(sindhiWord, 'g'), 
          romanWord
        );
        setRomanText(updatedRomanText);
        
        setNewRomanization(prev => {
          const updated = { ...prev };
          delete updated[sindhiWord];
          return updated;
        });
        
      } else {
        toast.error('Failed to add romanization');
      }
    } catch (error) {
      console.error('Error adding romanization:', error);
      toast.error('Error adding romanization');
    }
  };

  // Create couplet
  const createCouplet = async () => {
    // Debug logging
    console.log('Creating couplet with details:', coupletDetails);
    
    // Enhanced validation with specific error messages
    if (!coupletDetails.coupletSlug?.trim()) {
      toast.error('Couplet slug is required');
      return;
    }
    
    if (!coupletDetails.poetId?.trim()) {
      toast.error('Poet selection is required');
      return;
    }
    
    if (!coupletDetails.coupletSindhi?.trim()) {
      toast.error('Sindhi couplet text is required');
      return;
    }
    
    setLoading(true);
    try {
            // Create couplet data with poetry_id = 0 for standalone couplets (system poetry record)
      const coupletData = {
        poetry_id: 0, // 0 for system poetry record (standalone couplets)
        poet_id: parseInt(coupletDetails.poetId),
        couplet_slug: coupletDetails.coupletSlug.trim(),
        couplet_tags: coupletDetails.tags.length > 0 ? coupletDetails.tags.join(', ') : '',
        couplet_text: coupletDetails.coupletSindhi.trim(),
        lang: 'sd'
      };
      
      // Additional validation to ensure all fields are properly set
      if (isNaN(coupletData.poet_id) || coupletData.poet_id <= 0) {
        toast.error('Invalid poet ID');
        return;
      }
      
      if (!coupletData.couplet_slug || coupletData.couplet_slug.length === 0) {
        toast.error('Couplet slug cannot be empty');
        return;
      }
      
      if (!coupletData.couplet_text || coupletData.couplet_text.length === 0) {
        toast.error('Couplet text cannot be empty');
        return;
      }
      
      console.log('Sending couplet data:', coupletData);
      
      // Test the data structure before sending
      const testData = {
        poetry_id: 0, // 0 for system poetry record (standalone couplets)
        poet_id: coupletData.poet_id,
        couplet_slug: coupletData.couplet_slug,
        couplet_tags: coupletData.couplet_tags,
        couplet_text: coupletData.couplet_text,
        lang: coupletData.lang
      };
      
      console.log('Test data structure:', testData);
      console.log('Test data JSON:', JSON.stringify([testData]));
      
      // Create Sindhi couplet
      console.log('Sending request to /api/admin/poetry/couplets');
      const coupletResponse = await fetch('/api/admin/poetry/couplets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([testData]),
      });
      
      console.log('Response status:', coupletResponse.status);
      console.log('Response headers:', Object.fromEntries(coupletResponse.headers.entries()));

      if (!coupletResponse.ok) {
        const errorData = await coupletResponse.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Failed to create couplet (${coupletResponse.status})`);
      }

      // If English text is provided, create English couplet too
      if (coupletDetails.coupletEnglish.trim()) {
        const englishCoupletData = {
          ...coupletData,
          couplet_text: coupletDetails.coupletEnglish,
          lang: 'en'
        };

        const englishResponse = await fetch('/api/admin/poetry/couplets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([englishCoupletData]),
        });

        if (!englishResponse.ok) {
          console.warn('Failed to create English couplet, but Sindhi couplet was created');
        }
      }
      
      toast.success('Couplet created successfully!');
      
      // Redirect to the couplets management page
      setTimeout(() => {
        router.push('/admin/poetry/couplets');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating couplet:', error);
      toast.error(error instanceof Error ? error.message : 'Error creating couplet');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'hesudhar', title: 'Hesudhar Check', icon: BookOpen, description: 'Check text for spelling errors' },
    { id: 'romanizer', title: 'Romanizer', icon: Languages, description: 'Convert to roman script' },
    { id: 'couplet-details', title: 'Couplet Details', icon: FileText, description: 'Add couplet information' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1F1F1F]" />
            <p className="text-[#6B6B6B]">Loading couplet creation tools...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state if data loading failed
  if (!dataLoading && (poets.length === 0 || availableTags.length === 0)) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">Data Loading Failed</h3>
            <p className="text-[#6B6B6B] mb-4">
              {poets.length === 0 && availableTags.length === 0 
                ? 'Failed to load both poets and tags. Please check your connection and try again.'
                : poets.length === 0 
                ? 'Failed to load poets. Please check your connection and try again.'
                : 'Failed to load tags. Please check your connection and try again.'
              }
            </p>
            <Button
              onClick={retryLoadData}
              className="bg-[#1F1F1F] hover:bg-[#404040] text-white px-6 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="bg-white shadow-lg border-b-2 border-gray-200 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Quote className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Create Couplet</h1>
                    <p className="text-xl text-gray-600 mt-2">
                      Create beautiful Sindhi couplets with our comprehensive tools
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-12 px-6 rounded-xl transition-all duration-200 font-semibold"
                  onClick={() => router.push("/admin/poetry/couplets")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Couplets
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="flex space-x-6">
                  {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border-3 transition-all duration-300 shadow-lg ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : isActive 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'bg-gray-100 border-gray-300 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-8 h-8" />
                          ) : (
                            <Icon className="w-8 h-8" />
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-24 h-1 mx-6 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg font-semibold text-gray-700">
                  Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div key={currentStep} className="min-h-[500px]">
            
            {/* Hesudhar Step */}
            {currentStep === 'hesudhar' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                    <BookOpen className="w-6 h-6" />
                    Text Validation
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Hesudhar Check</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Check your Sindhi text for spelling errors using our comprehensive hesudhar dictionary
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label htmlFor="hesudhar-text" dir="rtl" className="sindhi-label text-2xl text-gray-800 font-bold block">سنڌي شعر شامل ڪريو</Label>
                      <Textarea
                        id="hesudhar-text"
                        placeholder="سنڌي شعر شامل ڪريو"
                        value={hesudharText}
                        onChange={(e) => setHesudharText(e.target.value)}
                        className="min-h-[180px] text-xl text-right sindhi-textarea sindhi-rtl border-3 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300"
                        dir="rtl"
                        style={{ direction: 'rtl', textAlign: 'right' }}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <Button 
                        onClick={checkHesudhar} 
                        disabled={loading || !hesudharText.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl transition-all duration-300 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                        size="lg"
                      >
                        {loading ? (
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-6 h-6 mr-3" />
                        )}
                        Validate & Correct Text
                      </Button>
                      
                      {hesudharCompleted && (
                        <div className="bg-green-50 border-3 border-green-300 rounded-2xl p-6">
                          <div className="flex items-start gap-4">
                            <div className="text-green-600 mt-1">
                              <CheckCircle className="w-7 h-7" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xl font-bold text-green-800">Text Validated Successfully!</p>
                              <p className="text-lg text-green-700">
                                Your corrected text will be automatically used in the next step
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Romanizer Step */}
            {currentStep === 'romanizer' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                    <Languages className="w-6 h-6" />
                    Romanizer
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Text Romanization</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Convert Sindhi text to romanized equivalents for better accessibility
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label htmlFor="roman-text" className="text-2xl text-gray-800 font-bold">Sindhi text for romanization</Label>
                      <Textarea
                        id="roman-text"
                        placeholder="Enter Sindhi text to find roman equivalents..."
                        value={romanText}
                        onChange={(e) => setRomanText(e.target.value)}
                        className="min-h-[180px] text-xl border-3 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300"
                      />
                    </div>
                    
                    <Button 
                      onClick={checkRomanizer} 
                      disabled={loading || !romanText.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 px-8 rounded-2xl transition-all duration-300 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                      size="lg"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      ) : (
                        <Search className="w-6 h-6 mr-3" />
                      )}
                      Check Romanizer
                    </Button>

                    {/* Show words not in dictionary with option to add romanization */}
                    {wordsNotInDictionary.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2 text-[#1F1F1F]">
                          <AlertCircle className="w-4 h-4" />
                          Words Not in Dictionary ({wordsNotInDictionary.length})
                        </h4>
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
                  </div>
                </div>
              </div>
            )}

            {/* Couplet Details Step */}
            {currentStep === 'couplet-details' && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                    <FileText className="w-6 h-6" />
                    Couplet Details
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Create Your Couplet</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Add information about your couplet and configure all the details
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Couplet Slug */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Couplet Slug</h3>
                        <p className="text-gray-600">A unique identifier for your couplet</p>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="couplet-slug" className="text-xl text-gray-800 font-bold">Slug</Label>
                        <div className="flex gap-2">
                          <Input
                            id="couplet-slug"
                            placeholder="Auto-generated slug..."
                            value={coupletDetails.coupletSlug}
                            onChange={(e) => setCoupletDetails(prev => ({ ...prev, coupletSlug: e.target.value }))}
                            className="flex-1 font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                          />
                          <Button
                            onClick={async () => {
                              if (coupletDetails.coupletSindhi.trim()) {
                                try {
                                  const firstLine = coupletDetails.coupletSindhi.split('\n')[0].trim();
                                  if (firstLine) {
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
                                        const transliteratedSlug = generateSlug(data.romanizedText);
                                        setCoupletDetails(prev => ({ 
                                          ...prev, 
                                          coupletSlug: transliteratedSlug
                                        }));
                                        toast.success('Slug regenerated from transliterated text!');
                                      } else {
                                        const fallbackSlug = generateSlug(firstLine);
                                        setCoupletDetails(prev => ({ 
                                          ...prev, 
                                          coupletSlug: fallbackSlug
                                        }));
                                        toast.info('Slug generated from original text');
                                      }
                                    } else {
                                      const fallbackSlug = generateSlug(firstLine);
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        coupletSlug: fallbackSlug
                                      }));
                                      toast.info('Slug generated from original text');
                                    }
                                  }
                                } catch (error) {
                                  console.error('Error regenerating slug:', error);
                                  const firstLine = coupletDetails.coupletSindhi.split('\n')[0].trim();
                                  if (firstLine) {
                                    const fallbackSlug = generateSlug(firstLine);
                                    setCoupletDetails(prev => ({ 
                                      ...prev, 
                                      coupletSlug: fallbackSlug
                                    }));
                                    toast.error('Error regenerating slug, using fallback');
                                  }
                                }
                              } else {
                                toast.error('Please enter Sindhi couplet text first');
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                        <p className="text-lg text-gray-600">
                          Slug is automatically generated from the first line of your Sindhi couplet
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Topic Tags</h3>
                        <p className="text-gray-600">Select relevant topic tags for your couplet</p>
                      </div>
                        
                        {/* Selected Tags */}
                        {coupletDetails.tags.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm text-[#6B6B6B]">Selected Tags ({coupletDetails.tags.length})</Label>
                            <div className="flex flex-wrap gap-2">
                              {coupletDetails.tags.map((tagSlug) => {
                                const tag = availableTags.find(t => t.slug === tagSlug);
                                return (
                                  <div
                                    key={tagSlug}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span className="text-sm font-medium">
                                      {tag?.english.title || tagSlug}
                                    </span>
                                    <button
                                      onClick={() => setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        tags: prev.tags.filter(t => t !== tagSlug) 
                                      }))}
                                      className="ml-1 hover:text-red-200 transition-colors rounded-full p-0.5 hover:bg-white/20"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Tag Search and Selection */}
                        <div className="space-y-3">
                                                     <div className="flex items-center gap-2">
                             <Label className="text-sm text-[#6B6B6B]">
                               Available Tags ({filteredTags.length} of {availableTags.length})
                             </Label>
                             <div className="flex-1 relative">
                               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                               <Input
                                 placeholder="Search tags by name, type, or slug..."
                                 value={tagSearchTerm}
                                 className="pl-10 pr-4 h-9 text-sm border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-full bg-white hover:bg-[#F4F4F5] transition-colors"
                                 onChange={(e) => setTagSearchTerm(e.target.value)}
                               />
                               {tagSearchTerm && (
                                 <button
                                   onClick={() => setTagSearchTerm('')}
                                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               )}
                             </div>
                             {tagSearchTerm && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setTagSearchTerm('')}
                                 className="h-9 px-3 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                               >
                                 Clear
                               </Button>
                             )}
                           </div>
                          
                                                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border border-[#E5E5E5] rounded-lg bg-[#F9F9F9]">
                             {filteredTags.map((tag) => {
                              const isSelected = coupletDetails.tags.includes(tag.slug);
                              return (
                                <div
                                  key={tag.id}
                                  className={`
                                    relative cursor-pointer rounded-lg p-3 transition-all duration-200 transform hover:scale-105
                                    ${isSelected 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                      : 'bg-white hover:bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5] hover:border-[#1F1F1F]'
                                    }
                                  `}
                                  onClick={() => {
                                    if (isSelected) {
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        tags: prev.tags.filter(t => t !== tag.slug) 
                                      }));
                                    } else {
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        tags: [...prev.tags, tag.slug] 
                                      }));
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-medium text-sm truncate ${isSelected ? 'text-white' : 'text-[#1F1F1F]'}`}>
                                        {tag.english.title}
                                      </div>
                                      {tag.sindhi.title && (
                                        <div className={`text-xs truncate ${isSelected ? 'text-green-100' : 'text-[#6B6B6B]'}`} dir="rtl">
                                          {tag.sindhi.title}
                                        </div>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-white ml-2 flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  {/* Tag type indicator */}
                                  <div className={`absolute top-1 right-1 text-xs px-2 py-1 rounded-full ${
                                    isSelected 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-[#F4F4F5] text-[#6B6B6B]'
                                  }`}>
                                    {tag.tag_type}
                                  </div>
                                </div>
                              );
                            }                            )}
                          </div>
                          
                                                     {filteredTags.length === 0 && (
                             <div className="text-center py-4 text-[#6B6B6B]">
                               <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                               <p className="text-sm">
                                 {tagSearchTerm.trim() ? `No tags found for "${tagSearchTerm}"` : 'No tags available'}
                               </p>
                               {!tagSearchTerm.trim() && availableTags.length === 0 && (
                                 <p className="text-xs text-[#9CA3AF] mt-1">
                                   Tags are loading... Please wait.
                                 </p>
                               )}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Poet Selection */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Poet</h3>
                        <p className="text-gray-600">Choose the poet for this couplet</p>
                      </div>
                      
                      {poets.filter(poet => poet.poet_id && poet.poet_id.toString().trim() !== '').length > 0 ? (
                        <Select value={coupletDetails.poetId} onValueChange={(value) => setCoupletDetails(prev => ({ ...prev, poetId: value }))}>
                          <SelectTrigger className="w-full h-16 border-3 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-gray-50 hover:bg-white transition-all duration-300 rounded-2xl text-lg">
                            <SelectValue placeholder={`Select a poet (${poets.filter(poet => poet.poet_id && poet.poet_id.toString().trim() !== '').length} available)`} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px] bg-white border-2 border-gray-200 rounded-2xl">
                            {poets
                              .filter(poet => poet.poet_id && poet.poet_id.toString().trim() !== '')
                              .map((poet) => (
                                <SelectItem key={poet.id} value={poet.poet_id.toString()} className="hover:bg-blue-50 focus:bg-blue-50 p-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
                                      {poet.file_url ? (
                                        <img 
                                          src={poet.file_url} 
                                          alt={poet.english_name || 'Poet'}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-gray-600 text-xl font-bold">
                                          {(poet.english_name || poet.sindhi_name || '?').charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-bold text-lg text-gray-800 truncate">
                                        {poet.english_laqab || poet.english_name || poet.sindhi_name || 'Unknown Poet'}
                                      </span>
                                      {poet.sindhi_name && poet.english_name && (
                                        <span className="text-sm text-gray-500 truncate" dir="rtl">
                                          {poet.sindhi_name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                            <div>
                              <p className="font-bold text-lg text-yellow-800">No poets available</p>
                              <p className="text-yellow-700">Please ensure poets are loaded before creating couplets.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Couplet in Sindhi */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sindhi Couplet</h3>
                        <p className="text-gray-600">Enter your Sindhi couplet text</p>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="couplet-sindhi" dir="rtl" className="sindhi-label text-2xl text-gray-800 font-bold block">سنڌي شعر</Label>
                        <Textarea
                          id="couplet-sindhi"
                          placeholder="سنڌي شعر شامل ڪريو"
                          value={coupletDetails.coupletSindhi}
                          onChange={async (e) => {
                            const text = removeDoubleSpaces(e.target.value);
                            setCoupletDetails(prev => ({ 
                              ...prev, 
                              coupletSindhi: text 
                            }));
                            
                            // Auto-generate English couplet and slug from first line
                            if (text.trim()) {
                              try {
                                const firstLine = text.split('\n')[0].trim();
                                if (firstLine) {
                                  // Call the romanizer API to transliterate the first line for slug generation
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
                                      // Generate slug from the transliterated first line
                                      const transliteratedSlug = generateSlug(data.romanizedText);
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        coupletSlug: transliteratedSlug
                                      }));
                                    } else {
                                      // Fallback to original text if romanization fails
                                      const fallbackSlug = generateSlug(firstLine);
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        coupletSlug: fallbackSlug
                                      }));
                                    }
                                  } else {
                                    // Fallback to original text if API call fails
                                    const fallbackSlug = generateSlug(firstLine);
                                    setCoupletDetails(prev => ({ 
                                      ...prev, 
                                      coupletSlug: fallbackSlug
                                    }));
                                  }
                                }
                                
                                // Now translate the complete couplet text (all lines)
                                if (text.trim()) {
                                  const fullTextResponse = await fetch('/api/admin/romanizer/fast', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ text: text.trim() }),
                                  });
                                  
                                  if (fullTextResponse.ok) {
                                    const fullTextData = await fullTextResponse.json();
                                    if (fullTextData.romanizedText) {
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        coupletEnglish: fullTextData.romanizedText
                                      }));
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Error auto-generating English couplet and slug:', error);
                                // Fallback to original text if there's an error
                                const firstLine = text.split('\n')[0].trim();
                                if (firstLine) {
                                  const fallbackSlug = generateSlug(firstLine);
                                  setCoupletDetails(prev => ({ 
                                    ...prev, 
                                    coupletSlug: fallbackSlug
                                  }));
                                }
                              }
                            }
                          }}
                          className="min-h-[180px] text-xl text-right sindhi-textarea sindhi-rtl border-3 border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300"
                          dir="rtl"
                          style={{ direction: 'rtl', textAlign: 'right' }}
                        />
                        
                        
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={async () => {
                              if (coupletDetails.coupletSindhi.trim()) {
                                try {
                                  // First, generate slug from first line
                                  const firstLine = coupletDetails.coupletSindhi.split('\n')[0].trim();
                                  if (firstLine) {
                                    const slugResponse = await fetch('/api/admin/romanizer/fast', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ text: firstLine }),
                                    });
                                    
                                    if (slugResponse.ok) {
                                      const slugData = await slugResponse.json();
                                      if (slugData.romanizedText) {
                                        const transliteratedSlug = generateSlug(slugData.romanizedText);
                                        setCoupletDetails(prev => ({ 
                                          ...prev, 
                                          coupletSlug: transliteratedSlug
                                        }));
                                      }
                                    }
                                  }
                                  
                                  // Then, translate the complete couplet text
                                  const fullTextResponse = await fetch('/api/admin/romanizer/fast', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ text: coupletDetails.coupletSindhi.trim() }),
                                  });
                                  
                                  if (fullTextResponse.ok) {
                                    const fullTextData = await fullTextResponse.json();
                                    if (fullTextData.romanizedText) {
                                      setCoupletDetails(prev => ({ 
                                        ...prev, 
                                        coupletEnglish: fullTextData.romanizedText
                                      }));
                                      toast.success('English couplet and slug generated automatically!');
                                    } else {
                                      toast.error('Failed to generate English couplet');
                                    }
                                  } else {
                                    toast.error('Failed to call romanizer API');
                                  }
                                } catch (error) {
                                  console.error('Error generating English couplet:', error);
                                  toast.error('Error generating English couplet');
                                }
                              } else {
                                toast.error('Please enter Sindhi couplet text first');
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F5] hover:border-[#E5E5E5] transition-colors"
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Auto-Generate English & Slug
                          </Button>
                          <p className="text-lg text-gray-600 flex items-center">
                            Slug from first line, English couplet from complete text
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Couplet in English */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">English Couplet</h3>
                        <p className="text-gray-600">Auto-generated English translation</p>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="couplet-english" className="text-xl text-gray-800 font-bold">English Translation</Label>
                        <Textarea
                          id="couplet-english"
                          placeholder="Auto-generated English couplet..."
                          value={coupletDetails.coupletEnglish}
                          onChange={(e) => setCoupletDetails(prev => ({ 
                            ...prev, 
                            coupletEnglish: removeDoubleSpaces(e.target.value) 
                          }))}
                          className="min-h-[180px] text-xl border-3 border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300"
                        />
                          <div className="flex gap-2">
                            <Button
                              onClick={async () => {
                                if (coupletDetails.coupletSindhi.trim()) {
                                  try {
                                    // Translate the complete couplet text (all lines)
                                    const response = await fetch('/api/admin/romanizer/fast', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ text: coupletDetails.coupletSindhi.trim() }),
                                    });
                                    
                                    if (response.ok) {
                                      const data = await response.json();
                                      if (data.romanizedText) {
                                        setCoupletDetails(prev => ({ 
                                          ...prev, 
                                          coupletEnglish: data.romanizedText
                                        }));
                                        toast.success('English couplet regenerated!');
                                      } else {
                                        toast.error('Failed to generate English couplet');
                                      }
                                    } else {
                                      toast.error('Failed to call romanizer API');
                                    }
                                  } catch (error) {
                                    console.error('Error regenerating English couplet:', error);
                                    toast.error('Error generating English couplet');
                                  }
                                } else {
                                  toast.error('Please enter Sindhi couplet text first');
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              Regenerate English
                            </Button>
                            <p className="text-lg text-gray-600 flex items-center">
                              English couplet is automatically generated from the complete Sindhi couplet text
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Summary */}
          {currentStep === 'couplet-details' && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-4 h-4 rounded-full ${canProceedToNext() ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xl font-bold text-gray-800">
                    {canProceedToNext() ? 'Ready to Create' : 'Required Fields Missing'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${coupletDetails.coupletSlug?.trim() ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-semibold ${coupletDetails.coupletSlug?.trim() ? 'text-green-700' : 'text-red-700'}`}>
                      Couplet Slug
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${coupletDetails.poetId?.trim() ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-semibold ${coupletDetails.poetId?.trim() ? 'text-green-700' : 'text-red-700'}`}>
                      Poet Selection
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${coupletDetails.coupletSindhi?.trim() ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-semibold ${coupletDetails.coupletSindhi?.trim() ? 'text-green-700' : 'text-red-700'}`}>
                      Sindhi Couplet
                    </span>
                  </div>
                </div>
                
                {!canProceedToNext() && (
                  <p className="text-lg text-gray-600 mt-4 text-center">
                    Please complete all required fields above to create your couplet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <Button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-14 px-8 rounded-2xl transition-all duration-200 font-semibold text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Previous
            </Button>

            {currentStep === 'couplet-details' ? (
              <div className="space-y-3">
                {/* System Setup Status */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50">
                  <div className={`w-4 h-4 rounded-full ${
                    systemSetupStatus === 'ready' ? 'bg-green-500' : 
                    systemSetupStatus === 'needs-setup' ? 'bg-yellow-500' : 
                    systemSetupStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-lg font-semibold text-gray-800">
                    {systemSetupStatus === 'ready' ? 'System Ready' :
                     systemSetupStatus === 'needs-setup' ? 'Setup Required' :
                     systemSetupStatus === 'error' ? 'System Error' : 'Checking...'}
                  </span>
                </div>
                
                                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/poetry/couplets/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ test: true })
                        });
                        const data = await response.json();
                        if (response.ok) {
                          toast.success('API test successful!');
                          console.log('Test result:', data);
                        } else {
                          toast.error('API test failed: ' + data.error);
                          console.error('Test error:', data);
                        }
                      } catch (error) {
                        toast.error('API test error: ' + error);
                        console.error('Test error:', error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                  >
                    Test API
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        toast.info('Setting up system for standalone couplets...');
                        const response = await fetch('/api/admin/poetry/couplets/setup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        const data = await response.json();
                        if (response.ok) {
                          toast.success('Setup successful! ' + data.message);
                          console.log('Setup result:', data);
                        } else {
                          toast.error('Setup failed: ' + data.error);
                          console.error('Setup error:', data);
                        }
                      } catch (error) {
                        toast.error('Setup error: ' + error);
                        console.error('Setup error:', error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
                  >
                    Setup System
                  </Button>
                  <Button
                    onClick={createCouplet}
                    disabled={loading || !canProceedToNext()}
                    className="bg-green-600 hover:bg-green-700 text-white h-14 px-10 rounded-2xl transition-all duration-300 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 mr-3" />
                    )}
                    Create Couplet
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-10 rounded-2xl transition-all duration-300 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                size="lg"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
