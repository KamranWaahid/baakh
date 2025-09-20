"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BookOpen, Type, Plus, Loader2, Edit, Trash2,
  Search, X, ChevronDown, Database, FileText
} from "lucide-react";

// Types for database entities
type HesudharEntry = {
  id: number;
  word: string;
  correct: string;
  created_at: string;
  updated_at?: string;
};

type RomanWordEntry = {
  id: number;
  word_sd: string;
  word_roman: string;
  user_id?: number;
  created_at: string;
  updated_at?: string;
};

const ENTRIES_PER_PAGE = 20;

export default function RomanizerAdminPage() {
  const [activeTab, setActiveTab] = useState<string>("hesudhar");
  
  // Hesudhar state
  const [hesudharEntries, setHesudharEntries] = useState<HesudharEntry[]>([]);
  const [hesudharLoading, setHesudharLoading] = useState(true);
  const [hesudharSearch, setHesudharSearch] = useState("");
  const [hesudharPage, setHesudharPage] = useState(1);
  const [hesudharTotal, setHesudharTotal] = useState(0);
  const [hesudharHasMore, setHesudharHasMore] = useState(true);
  const [hesudharSearchTimeout, setHesudharSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hesudharNewWord, setHesudharNewWord] = useState("");
  const [hesudharNewCorrect, setHesudharNewCorrect] = useState("");
  const [hesudharEditingEntry, setHesudharEditingEntry] = useState<HesudharEntry | null>(null);
  const [hesudharIsSubmitting, setHesudharIsSubmitting] = useState(false);
  
  // Roman words state
  const [romanWordEntries, setRomanWordEntries] = useState<RomanWordEntry[]>([]);
  const [romanWordLoading, setRomanWordLoading] = useState(true);
  const [romanWordSearch, setRomanWordSearch] = useState("");
  const [romanWordPage, setRomanWordPage] = useState(1);
  const [romanWordTotal, setRomanWordTotal] = useState(0);
  const [romanWordHasMore, setRomanWordHasMore] = useState(true);
  const [romanWordSearchTimeout, setRomanWordSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [romanWordNewSd, setRomanWordNewSd] = useState("");
  const [romanWordNewRoman, setRomanWordNewRoman] = useState("");
  const [romanWordEditingEntry, setRomanWordEditingEntry] = useState<RomanWordEntry | null>(null);
  const [romanWordIsSubmitting, setRomanWordIsSubmitting] = useState(false);

  // Fetch Hesudhar entries
  useEffect(() => {
    const fetchHesudhar = async () => {
      setHesudharLoading(true);
      try {
        const params = new URLSearchParams({
          page: hesudharPage.toString(),
          limit: ENTRIES_PER_PAGE.toString(),
          search: hesudharSearch,
        });
        const response = await fetch(`/api/admin/romanizer/hesudhar?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch hesudhar entries');
        const data = await response.json();
        
        // Add null checks to prevent TypeError
        if (!data || !data.hesudhars) {
          console.error("Invalid API response structure:", data);
          toast.error("Invalid API response structure");
          setHesudharEntries([]);
          setHesudharTotal(0);
          setHesudharHasMore(false);
          return;
        }
        
        setHesudharEntries(prev => hesudharPage === 1 ? data.hesudhars : [...prev, ...data.hesudhars]);
        setHesudharTotal(data.total || 0);
        setHesudharHasMore((data.hesudhars.length || 0) === ENTRIES_PER_PAGE);
      } catch (error) {
        console.error("Error fetching hesudhar entries:", error);
        toast.error("Failed to fetch hesudhar entries.");
        setHesudharEntries([]);
        setHesudharTotal(0);
        setHesudharHasMore(false);
      } finally {
        setHesudharLoading(false);
      }
    };
    fetchHesudhar();
  }, [hesudharPage, hesudharSearch]);

  // Debounce hesudhar search
  useEffect(() => {
    if (hesudharSearchTimeout) {
      clearTimeout(hesudharSearchTimeout);
    }
    const timeout = setTimeout(() => {
      if (hesudharPage !== 1) {
        setHesudharPage(1);
      } else {
        // If already on page 1, trigger re-fetch directly
        const fetchHesudhar = async () => {
          setHesudharLoading(true);
          try {
            const params = new URLSearchParams({
              page: '1',
              limit: ENTRIES_PER_PAGE.toString(),
              search: hesudharSearch,
            });
            const response = await fetch(`/api/admin/romanizer/hesudhar?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch hesudhar entries');
            const data = await response.json();
            
            // Add null checks to prevent TypeError
            if (!data || !data.hesudhars) {
              console.error("Invalid API response structure:", data);
              toast.error("Invalid API response structure");
              setHesudharEntries([]);
              setHesudharTotal(0);
              setHesudharHasMore(false);
              return;
            }
            
            setHesudharEntries(data.hesudhars);
            setHesudharTotal(data.total || 0);
            setHesudharHasMore((data.hesudhars.length || 0) === ENTRIES_PER_PAGE);
          } catch (error) {
            console.error("Error fetching hesudhar entries:", error);
            toast.error("Failed to fetch hesudhar entries.");
            setHesudharEntries([]);
            setHesudharTotal(0);
            setHesudharHasMore(false);
          } finally {
            setHesudharLoading(false);
          }
        };
        fetchHesudhar();
      }
    }, 500);
    setHesudharSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [hesudharSearch]);

  // Fetch Roman words entries
  useEffect(() => {
    const fetchRomanWords = async () => {
      setRomanWordLoading(true);
      try {
        const params = new URLSearchParams({
          page: romanWordPage.toString(),
          limit: ENTRIES_PER_PAGE.toString(),
          search: romanWordSearch,
        });
        const response = await fetch(`/api/admin/romanizer/roman-words?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch roman words entries');
        const data = await response.json();
        
        // Add null checks to prevent TypeError
        if (!data || !data.romanWords) {
          console.error("Invalid API response structure:", data);
          toast.error("Invalid API response structure");
          setRomanWordEntries([]);
          setRomanWordTotal(0);
          setRomanWordHasMore(false);
          return;
        }
        
        setRomanWordEntries(prev => romanWordPage === 1 ? data.romanWords : [...prev, ...data.romanWords]);
        setRomanWordTotal(data.total || 0);
        setRomanWordHasMore((data.romanWords.length || 0) === ENTRIES_PER_PAGE);
      } catch (error) {
        console.error("Error fetching roman words entries:", error);
        toast.error("Failed to fetch roman words entries.");
        setRomanWordEntries([]);
        setRomanWordTotal(0);
        setRomanWordHasMore(false);
      } finally {
        setRomanWordLoading(false);
      }
    };
    fetchRomanWords();
  }, [romanWordPage, romanWordSearch]);

  // Debounce roman word search
  useEffect(() => {
    if (romanWordSearchTimeout) {
      clearTimeout(romanWordSearchTimeout);
    }
    const timeout = setTimeout(() => {
      if (romanWordPage !== 1) {
        setRomanWordPage(1);
      } else {
        // If already on page 1, trigger re-fetch directly
        const fetchRomanWords = async () => {
          setRomanWordLoading(true);
          try {
            const params = new URLSearchParams({
              page: '1',
              limit: ENTRIES_PER_PAGE.toString(),
              search: romanWordSearch,
            });
            const response = await fetch(`/api/admin/romanizer/roman-words?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch roman words entries');
            const data = await response.json();
            
            // Add null checks to prevent TypeError
            if (!data || !data.romanWords) {
              console.error("Invalid API response structure:", data);
              toast.error("Invalid API response structure");
              setRomanWordEntries([]);
              setRomanWordTotal(0);
              setRomanWordHasMore(false);
              return;
            }
            
            setRomanWordEntries(data.romanWords);
            setRomanWordTotal(data.total || 0);
            setRomanWordHasMore((data.romanWords.length || 0) === ENTRIES_PER_PAGE);
          } catch (error) {
            console.error("Error fetching roman words entries:", error);
            toast.error("Failed to fetch roman words entries.");
            setRomanWordEntries([]);
            setRomanWordTotal(0);
            setRomanWordHasMore(false);
          } finally {
            setRomanWordLoading(false);
          }
        };
        fetchRomanWords();
      }
    }, 500);
    setRomanWordSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [romanWordSearch]);

  // CRUD operations for Hesudhar
  const handleAddHesudhar = async () => {
    if (!hesudharNewWord.trim() || !hesudharNewCorrect.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setHesudharIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/romanizer/hesudhar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: hesudharNewWord.trim(),
          correct: hesudharNewCorrect.trim()
        })
      });

      if (response.ok) {
        toast.success("Hesudhar entry added successfully");
        setHesudharNewWord("");
        setHesudharNewCorrect("");
        setHesudharPage(1);
        setHesudharSearch("");
      } else {
        throw new Error('Failed to add hesudhar entry');
      }
    } catch (error) {
      console.error("Error adding hesudhar entry:", error);
      toast.error("Failed to add hesudhar entry");
    } finally {
      setHesudharIsSubmitting(false);
    }
  };

  const handleEditHesudhar = (entry: HesudharEntry) => {
    setHesudharEditingEntry(entry);
    setHesudharNewWord(entry.word);
    setHesudharNewCorrect(entry.correct);
  };

  const handleUpdateHesudhar = async () => {
    if (!hesudharEditingEntry || !hesudharNewWord.trim() || !hesudharNewCorrect.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setHesudharIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/romanizer/hesudhar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: hesudharEditingEntry.id,
          word: hesudharNewWord.trim(),
          correct: hesudharNewCorrect.trim()
        })
      });

      if (response.ok) {
        toast.success("Hesudhar entry updated successfully");
        setHesudharEditingEntry(null);
        setHesudharNewWord("");
        setHesudharNewCorrect("");
        setHesudharPage(1);
        setHesudharSearch("");
      } else {
        throw new Error('Failed to update hesudhar entry');
      }
    } catch (error) {
      console.error("Error updating hesudhar entry:", error);
      toast.error("Failed to update hesudhar entry");
    } finally {
      setHesudharIsSubmitting(false);
    }
  };

  const handleDeleteHesudhar = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/admin/romanizer/hesudhar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast.success("Hesudhar entry deleted successfully");
        setHesudharPage(1);
        setHesudharSearch("");
      } else {
        throw new Error('Failed to delete hesudhar entry');
      }
    } catch (error) {
      console.error("Error deleting hesudhar entry:", error);
      toast.error("Failed to delete hesudhar entry");
    }
  };

  // CRUD operations for Roman Words
  const handleAddRomanWord = async () => {
    if (!romanWordNewSd.trim() || !romanWordNewRoman.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setRomanWordIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/romanizer/roman-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word_sd: romanWordNewSd.trim(),
          word_roman: romanWordNewRoman.trim()
        })
      });

      if (response.ok) {
        toast.success("Roman word entry added successfully");
        setRomanWordNewSd("");
        setRomanWordNewRoman("");
        setRomanWordPage(1);
        setRomanWordSearch("");
      } else {
        throw new Error('Failed to add roman word entry');
      }
    } catch (error) {
      console.error("Error adding roman word entry:", error);
      toast.error("Failed to add roman word entry");
    } finally {
      setRomanWordIsSubmitting(false);
    }
  };

  const handleEditRomanWord = (entry: RomanWordEntry) => {
    setRomanWordEditingEntry(entry);
    setRomanWordNewSd(entry.word_sd);
    setRomanWordNewRoman(entry.word_roman);
  };

  const handleUpdateRomanWord = async () => {
    if (!romanWordEditingEntry || !romanWordNewSd.trim() || !romanWordNewRoman.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setRomanWordIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/romanizer/roman-words`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: romanWordEditingEntry.id,
          word_sd: romanWordNewSd.trim(),
          word_roman: romanWordNewRoman.trim()
        })
      });

      if (response.ok) {
        toast.success("Roman word entry updated successfully");
        setRomanWordEditingEntry(null);
        setRomanWordNewSd("");
        setRomanWordNewRoman("");
        setRomanWordPage(1);
        setRomanWordSearch("");
      } else {
        throw new Error('Failed to update roman word entry');
      }
    } catch (error) {
      console.error("Error updating roman word entry:", error);
      toast.error("Failed to update roman word entry");
    } finally {
      setRomanWordIsSubmitting(false);
    }
  };

  const handleDeleteRomanWord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/admin/romanizer/roman-words`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast.success("Roman word entry deleted successfully");
        setRomanWordPage(1);
        setRomanWordSearch("");
      } else {
        throw new Error('Failed to delete roman word entry');
      }
    } catch (error) {
      console.error("Error deleting roman word entry:", error);
      toast.error("Failed to delete roman word entry");
    }
  };

  const cancelEdit = () => {
    setHesudharEditingEntry(null);
    setRomanWordEditingEntry(null);
    setHesudharNewWord("");
    setHesudharNewCorrect("");
    setRomanWordNewSd("");
    setRomanWordNewRoman("");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Romanizer Management"
          subtitle="Romanizer Management"
          subtitleIcon={<Database className="w-4 h-4" />}
          description="Manage hesudhar corrections and roman word mappings with comprehensive tools. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button 
                variant="outline" 
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
                onClick={() => setActiveTab("hesudhar")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Hesudhar Dictionary
              </Button>
              <Button 
                variant="outline" 
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
                onClick={() => setActiveTab("roman-words")}
              >
                <Type className="w-4 h-4 mr-2" />
                Roman Dictionary
              </Button>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">Hesudhar Entries</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">{hesudharTotal}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B6B6B]">Roman Words</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">{romanWordTotal}</p>
                </div>
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#1F1F1F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg p-1">
            <TabsTrigger value="hesudhar" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4" />
              Hesudhar Dictionary
            </TabsTrigger>
            <TabsTrigger value="roman-words" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Type className="h-4 w-4" />
              Roman Dictionary
            </TabsTrigger>
          </TabsList>

          {/* Hesudhar Dictionary Tab */}
          <TabsContent value="hesudhar" className="space-y-6">
            {/* Add/Edit Form */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  {hesudharEditingEntry ? (
                    <>
                      <Edit className="h-5 w-5" />
                      Edit Hesudhar Entry
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add New Hesudhar Entry
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  {hesudharEditingEntry 
                    ? "Update the hesudhar correction entry"
                    : "Add a new word and its correct spelling"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hesudhar-word" className="text-[#1F1F1F] font-medium">Word</Label>
                    <Input
                      id="hesudhar-word"
                      placeholder="Enter the word"
                      value={hesudharNewWord}
                      onChange={(e) => setHesudharNewWord(e.target.value)}
                      className="sindhi-text border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                      dir="rtl"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hesudhar-correct" className="text-[#1F1F1F] font-medium">Correct Spelling</Label>
                    <Input
                      id="hesudhar-correct"
                      placeholder="Enter correct spelling"
                      value={hesudharNewCorrect}
                      onChange={(e) => setHesudharNewCorrect(e.target.value)}
                      className="sindhi-text border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                      dir="rtl"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={hesudharEditingEntry ? handleUpdateHesudhar : handleAddHesudhar}
                    disabled={hesudharIsSubmitting}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {hesudharIsSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : hesudharEditingEntry ? (
                      "Update Entry"
                    ) : (
                      "Add Entry"
                    )}
                  </Button>
                  {hesudharEditingEntry && (
                    <Button variant="outline" onClick={cancelEdit} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    placeholder="Search hesudhar entries..."
                    value={hesudharSearch}
                    onChange={(e) => setHesudharSearch(e.target.value)}
                    className="pl-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                  {hesudharSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHesudharSearch("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hesudharEntries.map((entry) => (
                <Card key={entry.id} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs font-mono bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                        #{entry.id}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHesudhar(entry)}
                          className="h-8 w-8 p-0 border-[#E5E5E5] text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHesudhar(entry.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">Word</p>
                        <p className="font-medium text-[#1F1F1F] sindhi-text" dir="rtl">{entry.word}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">Correct</p>
                        <p className="font-medium text-[#1F1F1F] sindhi-text" dir="rtl">{entry.correct}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading and Load More */}
            {hesudharLoading && hesudharPage === 1 && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#1F1F1F]" />
                <span className="ml-2 text-[#6B6B6B]">Loading hesudhar entries...</span>
              </div>
            )}

            {hesudharHasMore && !hesudharLoading && hesudharEntries.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setHesudharPage(prev => prev + 1)} 
                  variant="outline"
                  className="border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Load More
                </Button>
              </div>
            )}

            {!hesudharLoading && hesudharEntries.length === 0 && (
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-[#6B6B6B]">No hesudhar entries found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roman Dictionary Tab */}
          <TabsContent value="roman-words" className="space-y-6">
            {/* Add/Edit Form */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  {romanWordEditingEntry ? (
                    <>
                      <Edit className="h-5 w-5" />
                      Edit Roman Word Entry
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add New Roman Word Entry
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  {romanWordEditingEntry 
                    ? "Update the roman word mapping entry"
                    : "Add a new Sindhi word and its roman equivalent"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roman-word-sd" className="text-[#1F1F1F] font-medium">Sindhi Word</Label>
                    <Input
                      id="roman-word-sd"
                      placeholder="Enter Sindhi word"
                      value={romanWordNewSd}
                      onChange={(e) => setRomanWordNewSd(e.target.value)}
                      className="sindhi-text border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                      dir="rtl"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roman-word-roman" className="text-[#1F1F1F] font-medium">Roman Word</Label>
                    <Input
                      id="roman-word-roman"
                      placeholder="Enter roman equivalent"
                      value={romanWordNewRoman}
                      onChange={(e) => setRomanWordNewRoman(e.target.value)}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={romanWordEditingEntry ? handleUpdateRomanWord : handleAddRomanWord}
                    disabled={romanWordIsSubmitting}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {romanWordIsSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : romanWordEditingEntry ? (
                      "Update Entry"
                    ) : (
                      "Add Entry"
                    )}
                  </Button>
                  {romanWordEditingEntry && (
                    <Button variant="outline" onClick={cancelEdit} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                  <Input
                    placeholder="Search roman word entries..."
                    value={romanWordSearch}
                    onChange={(e) => setRomanWordSearch(e.target.value)}
                    className="pl-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                  {romanWordSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRomanWordSearch("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {romanWordEntries.map((entry) => (
                <Card key={entry.id} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs font-mono bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                        #{entry.id}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRomanWord(entry)}
                          className="h-8 w-8 p-0 border-[#E5E5E5] text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRomanWord(entry.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">Sindhi</p>
                        <p className="font-medium text-[#1F1F1F] sindhi-text" dir="rtl">{entry.word_sd}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">Roman</p>
                        <p className="font-medium text-[#1F1F1F]">{entry.word_roman}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading and Load More */}
            {romanWordLoading && romanWordPage === 1 && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#1F1F1F]" />
                <span className="ml-2 text-[#6B6B6B]">Loading roman words...</span>
              </div>
            )}

            {romanWordHasMore && !romanWordLoading && romanWordEntries.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setRomanWordPage(prev => prev + 1)} 
                  variant="outline"
                  className="border-[#E5E5E5] bg-white text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#E5E5E5]"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Load More
                </Button>
              </div>
            )}

            {!romanWordLoading && romanWordEntries.length === 0 && (
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-[#6B6B6B]">No roman word entries found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}


