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

  // Add Tag UI state
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState({
    slug: '',
    englishTitle: '',
    sindhiTitle: '',
    type: ''
  });

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
    </AdminLayout>)}
    return (
          <AdminLayout>
            <div className="min-h-screen bg-[#F9F9F9]">
              {/* Header Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Quote className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1F1F1F]">Create Couplet</h1>
                  <p className="text-lg text-[#6B6B6B] mt-2">
                    Create beautiful Sindhi couplets with our comprehensive tools
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
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
         <div className="mb-8">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="flex space-x-6">
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-colors ${
                        isCompleted 
                          ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white' 
                          : isActive 
                            ? 'bg-[#404040] border-[#404040] text-white' 
                            : 'bg-[#F4F4F5] border-[#E5E5E5] text-[#6B6B6B]'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <Icon className="w-8 h-8" />
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-24 h-1 mx-6 rounded-full ${
                          isCompleted ? 'bg-[#1F1F1F]' : 'bg-[#E5E5E5]'
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
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                  <BookOpen className="w-6 h-6" />
                  Text Validation
                </div>
                <h2 className="text-3xl font-bold text-[#1F1F1F] mb-2">Hesudhar Check</h2>
                <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                  Check your Sindhi text for spelling errors using our comprehensive hesudhar dictionary
                </p>
              </div>
              <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label htmlFor="hesudhar-text" dir="rtl" className="sindhi-label sindhi-text-lg text-[#1F1F1F] font-medium block">سنڌي شعر شامل ڪريو</Label>
                    <Textarea
                      id="hesudhar-text"
                      placeholder="سنڌي شعر شامل ڪريو"
                      value={hesudharText}
                      onChange={(e) => setHesudharText(e.target.value)}
                      className="min-h-[120px] text-lg text-right sindhi-textarea sindhi-rtl border border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                      dir="rtl"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <Button 
                      onClick={checkHesudhar} 
                      disabled={loading || !hesudharText.trim()}
                      className="w-full bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-green-600 mt-1">
                            <CheckCircle className="w-7 h-7" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-base font-semibold text-green-800">Text Validated Successfully!</p>
                            <p className="text-sm text-green-700">
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
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                  <Languages className="w-6 h-6" />
                  Romanizer
                </div>
                <h2 className="text-3xl font-bold text-[#1F1F1F] mb-2">Text Romanization</h2>
                <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                  Convert Sindhi text to romanized equivalents for better accessibility
                </p>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label htmlFor="roman-text" className="text-[#1F1F1F] font-medium">Sindhi text for romanization</Label>
                    <Textarea
                      id="roman-text"
                      placeholder="Enter Sindhi text to find roman equivalents..."
                      value={romanText}
                      onChange={(e) => setRomanText(e.target.value)}
                      className="min-h-[120px] text-lg border border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                    />
                  </div>
                  
                  <Button 
                    onClick={checkRomanizer} 
                    disabled={loading || !romanText.trim()}
                    className="w-full bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
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
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold mb-6">
                  <FileText className="w-6 h-6" />
                  Couplet Details
                </div>
                <h2 className="text-3xl font-bold text-[#1F1F1F] mb-2">Create Your Couplet</h2>
                <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                  Add information about your couplet and configure all the details
                </p>
              </div>
              <div className="space-y-6">
                {/* Add New Tag Modal */}
                {showAddTag && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white border border-[#E5E5E5] rounded-lg w-full max-w-md p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-[#1F1F1F]">Create New Tag</h4>
                        <button onClick={() => setShowAddTag(false)} className="text-[#6B6B6B] hover:text-[#1F1F1F]">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-[#1F1F1F]">English Title</Label>
                          <Input
                            value={newTag.englishTitle}
                            onChange={(e) => setNewTag({ ...newTag, englishTitle: e.target.value })}
                            placeholder="e.g. Love"
                            className="mt-1 h-9 text-sm border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1F1F1F]">Sindhi Title</Label>
                          <Input
                            value={newTag.sindhiTitle}
                            onChange={(e) => setNewTag({ ...newTag, sindhiTitle: e.target.value })}
                            placeholder="سنڌي عنوان"
                            className="mt-1 h-9 text-sm border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg sindhi-textarea sindhi-rtl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1F1F1F]">Type</Label>
                          <Input
                            value={newTag.type}
                            onChange={(e) => setNewTag({ ...newTag, type: e.target.value })}
                            placeholder="e.g. theme, genre"
                            className="mt-1 h-9 text-sm border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1F1F1F]">Slug</Label>
                          <Input
                            value={newTag.slug}
                            onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                            placeholder="auto-generated if empty"
                            className="mt-1 h-9 text-sm border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddTag(false)}
                          className="h-9 px-3 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const englishTitle = newTag.englishTitle.trim();
                            const sindhiTitle = newTag.sindhiTitle.trim();
                            const type = newTag.type.trim() || 'topic';
                            const slug = (newTag.slug || englishTitle || sindhiTitle).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                            if (!englishTitle && !sindhiTitle) return;
                            const tagObj:any = {
                              id: Date.now(),
                              slug,
                              label: slug,
                              tag_type: type,
                              english: { title: englishTitle || slug, details: '' },
                              sindhi: { title: sindhiTitle || '', details: '' }
                            };
                            setAvailableTags(prev => [tagObj, ...prev]);
                            setFilteredTags(prev => [tagObj, ...prev]);
                            setCoupletDetails(prev => ({ ...prev, tags: [...new Set([...prev.tags, slug])] }));
                            setNewTag({ slug: '', englishTitle: '', sindhiTitle: '', type: '' });
                            setShowAddTag(false);
                          }}
                          className="h-9 px-3 bg-[#1F1F1F] hover:bg-[#404040] text-white rounded-lg"
                        >
                          Save Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Couplet Slug */}
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">Couplet Slug</h3>
                      <p className="text-[#6B6B6B] text-sm">A unique identifier for your couplet</p>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="couplet-slug" className="text-[#1F1F1F] font-medium">Slug</Label>
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
                      <p className="text-sm text-[#6B6B6B]">
                        Slug is automatically generated from the first line of your Sindhi couplet
                      </p>
                    </div>
                  </div>
                </div>
                {/* Tags */}
                 {/* Tags */}
                 <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">Topic Tags</h3>
                      <p className="text-[#6B6B6B] text-sm">Select relevant topic tags for your couplet</p>
                    </div>
                     {/* Selected Tags */}
                     {coupletDetails.tags.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-[#6B6B6B]">Selected Tags ({coupletDetails.tags.length})</Label>
                          <div className="flex flex-wrap gap-2.5">
                            {coupletDetails.tags.map((tagSlug) => {
                              const tag = availableTags.find(t => t.slug === tagSlug);
                              return (
                                <div
                                  key={tagSlug}
                                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs border border-[#E5E5E5] bg-[#F4F4F5] text-[#1F1F1F]"
                                >
                                  <Tag className="w-3 h-3 text-[#6B6B6B]" />
                                  <span className="text-sm font-medium">
                                    {tag?.english.title || tagSlug}
                                  </span>
                                  <button
                                    onClick={() => setCoupletDetails(prev => ({ 
                                      ...prev, 
                                      tags: prev.tags.filter(t => t !== tagSlug) 
                                    }))}
                                    className="ml-1 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors rounded-full p-0.5 hover:bg-white/40"
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
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setShowAddTag(true)}
                             className="h-9 px-3 border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors ml-2"
                           >
                             + New Tag
                           </Button>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-3 border border-[#E5E5E5] rounded-lg bg-[#F9F9F9]">
                         {filteredTags.map((tag) => {
                            const isSelected = coupletDetails.tags.includes(tag.slug);
                            return (
                              <div
                                key={tag.id}
                                className={`
                                  relative cursor-pointer rounded-lg p-2.5 transition-colors
                                  ${isSelected 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
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
                                <div className={`absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-[#F4F4F5] text-[#6B6B6B]'
                                }`}>
                                  {tag.tag_type}
                                </div>
                              </div>
                            );
                          }                            )}
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
                 <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                 <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">Select Poet</h3>
                      <p className="text-[#6B6B6B] text-sm">Choose the poet for this couplet</p>
                    </div>
                    
                    {poets.filter(poet => poet.poet_id && poet.poet_id.toString().trim() !== '').length > 0 ? (
                      <Select value={coupletDetails.poetId} onValueChange={(value) => setCoupletDetails(prev => ({ ...prev, poetId: value }))}>
                        <SelectTrigger className="w-full h-10 border border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] rounded-lg text-sm">
                          <SelectValue placeholder={`Select a poet (${poets.filter(poet => poet.poet_id && poet.poet_id.toString().trim() !== '').length} available)`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px] bg-white border border-[#E5E5E5] rounded-lg">
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
              </div>
               {/* Couplet in Sindhi */}
               <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
               <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">Sindhi Couplet</h3>
                      <p className="text-[#6B6B6B] text-sm">Enter your Sindhi couplet text</p>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="couplet-sindhi" dir="rtl" className="sindhi-label sindhi-text-lg text-[#1F1F1F] font-medium block">سنڌي شعر</Label>
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
                        className="min-h=[120px] text-lg text-right sindhi-textarea sindhi-rtl border border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
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
                          className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors"
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
                  {/* Couplet in English */}
                  <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">English Couplet</h3>
                      <p className="text-[#6B6B6B] text-sm">Auto-generated English translation</p>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="couplet-english" className="text-[#1F1F1F] font-medium">English Translation</Label>
                      <Textarea
                        id="couplet-english"
                        placeholder="Auto-generated English couplet..."
                        value={coupletDetails.coupletEnglish}
                        onChange={(e) => setCoupletDetails(prev => ({ ...prev, coupletEnglish: removeDoubleSpaces(e.target.value) }))}
                        className="min-h-[120px] text-lg border border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                      />
                    </div>
                  </div>
                  </div>
               </div>
            </div>
          )}
          </div>
      </div>
       {/* Navigation Buttons */}
       <div className="flex justify-between items-center mt-10">
       <Button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            variant="outline"
            className="border border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
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
                  className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
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
              className="bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors"
              size="lg"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          )}
       </div>
            </div>
          </AdminLayout>
    );
}
