"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, User, Hash, Clock, Heart, Copy, ExternalLink, Mic, Shuffle, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoetAvatar } from "@/components/ui/poet-avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter, usePathname } from "next/navigation";

interface SearchResult {
  id: string;
  type: 'poem' | 'poet' | 'theme' | 'timeline' | 'category' | 'tag' | 'couplet';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: {
    poet?: string;
    era?: string;
    theme?: string;
    form?: string;
    slug?: string;
    hasImage?: boolean;
    poetryId?: number;
    language?: string;
    tagSlug?: string;
    tagLabel?: string;
  };
  url: string;
  imageUrl?: string | null;
  highlight?: string;
  matchedField?: string;
}

interface SearchSuggestion {
  text: string;
  icon: string;
  category: string;
}

const rotatingPlaceholders: SearchSuggestion[] = [
  { text: "Search poems, poets, themes...", icon: "", category: "general" },
  { text: "Try 'Love', 'River', 'Resistance'", icon: "", category: "suggestions" },
  { text: "Poets from 19th century", icon: "", category: "era" },
  { text: "Find verses about nature and beauty", icon: "", category: "nature" },
  { text: "Search revolutionary poetry", icon: "", category: "revolution" },
  { text: "Discover Sufi wisdom", icon: "", category: "sufi" }
];

const sindhiPlaceholders: SearchSuggestion[] = [
  { text: "شاعري، شاعر، يا موضوع ڳوليو...", icon: "", category: "general" },
  { text: "آزمايو 'محبت'، 'درياءَ'، 'انقلاب'", icon: "", category: "suggestions" },
  { text: "19 صدي جا شاعر", icon: "", category: "era" },
  { text: "طبيعت ۽ خوبصورتي بابت شعر ڳوليو", icon: "", category: "nature" },
  { text: "انقلابي شاعري ڳوليو", icon: "", category: "revolution" },
  { text: "صوفي دانش ڳوليو", icon: "", category: "sufi" }
];

export default function SearchInterface() {
  const router = useRouter();
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [entitySuggestions, setEntitySuggestions] = useState<Array<{ type: string; label: string }>>([]);
  const [pills, setPills] = useState<string[]>([]);
  const [dym, setDym] = useState<string | undefined>();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = isSindhi ? sindhiPlaceholders : rotatingPlaceholders;

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const pushRecent = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);

    try {
      const currentLang = isSindhi ? 'sd' : 'en';
      const params = new URLSearchParams({ q: searchQuery, lang: currentLang });
      console.log('Searching with params:', params.toString());
      
      const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      
      console.log('Search response:', json);
      
      const apiResults = (json?.results || []) as SearchResult[];
      const apiPills = (json?.pills || []) as string[];
      const apiDym = json?.dym as string | undefined;
      setSearchResults(apiResults);
      setPills(apiPills);
      setDym(apiDym);
      
      const ents: Array<{ type: string; label: string }> = [];
      const perTypeCap: Record<string, number> = { poet: 0, tag: 0, category: 0 };
      for (const r of apiResults) {
        if (r.type === 'poet' || r.type === 'tag' || r.type === 'category') {
          const cap = r.type === 'poet' ? 3 : 2;
          if ((perTypeCap[r.type] ?? 0) < cap) {
            ents.push({ type: r.type, label: r.title });
            perTypeCap[r.type] = (perTypeCap[r.type] ?? 0) + 1;
          }
        }
        if (ents.length >= 7) break;
      }
      setEntitySuggestions(ents);
    } catch (e) {
      console.error('Search error', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Reset highlight when query changes or results hidden
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, showResults, recentSearches.length, entitySuggestions.length]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission - prevent navigation, just show results
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      pushRecent(query);
      setShowResults(true);
      // Don't navigate to search page, just show dropdown results
    }
  };

  // Suggestion click helper
  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    pushRecent(text);
    setShowResults(true);
    // Don't navigate to search page, just show dropdown results
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // URLs from API already include locale prefix, so use them directly
    router.push(result.url);
    setShowResults(false);
    if (query.trim()) pushRecent(query);
  };

  // Voice search simulation
  const handleVoiceSearch = () => {
    setIsVoiceSearch(true);
    setTimeout(() => setIsVoiceSearch(false), 2000);
  };

  // Surprise me functionality
  const handleSurpriseMe = () => {
    setIsSurpriseMode(true);
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setQuery(randomPlaceholder.text);
    setTimeout(() => setIsSurpriseMode(false), 2000);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Get keyword suggestions
  const getKeywordByIndex = (index: number) => {
    const keywords = placeholders.map(s => s.text);
    return keywords[index] || null;
  };

  // Count suggestions
  const suggestionsCount = () => {
    return Math.min(pills.length, 3);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={searchRef}>
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 ${isRTL ? 'right-4' : 'left-4'}`} />
          
          {/* Search Input */}
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              const allCount = recentSearches.length + entitySuggestions.length + suggestionsCount();
              if (e.key === 'ArrowDown' && allCount > 0) {
                e.preventDefault();
                setShowResults(true);
                setHighlightedIndex((prev) => (prev + 1 + allCount) % allCount);
              } else if (e.key === 'ArrowUp' && allCount > 0) {
                e.preventDefault();
                setShowResults(true);
                setHighlightedIndex((prev) => (prev - 1 + allCount) % allCount);
              } else if (e.key === 'Enter' && highlightedIndex >= 0 && allCount > 0) {
                e.preventDefault();
                const recCount = recentSearches.length;
                const entCount = entitySuggestions.length;
                if (highlightedIndex < recCount) {
                  handleSuggestionClick(recentSearches[highlightedIndex]);
                } else if (highlightedIndex < recCount + entCount) {
                  const idx = highlightedIndex - recCount;
                  handleSuggestionClick(entitySuggestions[idx].label);
                } else {
                  const idx = highlightedIndex - recCount - entCount;
                  const kw = getKeywordByIndex(idx);
                  if (kw) handleSuggestionClick(kw);
                }
              } else if (e.key === 'Escape') {
                setShowResults(false);
                setHighlightedIndex(-1);
              }
            }}
            className={`w-full h-14 text-lg border border-gray-200 bg-white rounded-full px-6 ${isRTL ? 'pr-14' : 'pl-14'} hover:border-gray-100 focus:border-gray-300 focus:ring-0 focus-visible:ring-0 focus:outline-none shadow-none focus:shadow-none focus-visible:shadow-none transition-colors duration-150 ${isSindhi ? 'auto-sindhi-font search-placeholder' : ''}`}
            style={isSindhi ? { fontFamily: 'var(--font-sindhi-primary)' } : {}}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          
          {/* Placeholder Text with Writing Animation - Only show when input is empty */}
          {!query && (
            <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none ${isRTL ? 'right-14' : 'left-14'} text-gray-400 ${isSindhi ? 'auto-sindhi-font search-placeholder' : ''}`}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPlaceholder}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut",
                    opacity: { duration: 0.2 },
                    y: { duration: 0.3 },
                    scale: { duration: 0.2 }
                  }}
                  className="block"
                >
                  {placeholders[currentPlaceholder].text}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${isRTL ? 'left-2' : 'right-2'}`}>
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              disabled={isVoiceSearch}
              className={`h-10 w-10 p-0 rounded-full transition-all flex items-center justify-center ${
                isVoiceSearch 
                  ? 'bg-black text-white animate-pulse' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSurpriseMe}
              disabled={isSurpriseMode}
              className={`h-10 w-10 p-0 rounded-full transition-all flex items-center justify-center ${
                isSurpriseMode 
                  ? 'bg-black text-white animate-pulse' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
          </div>
        </div>
      </form>

      {/* Live Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="w-full bg-white/98 backdrop-blur-md border border-gray-200/60 shadow-2xl rounded-xl overflow-hidden">
              <div className="p-3">
                {pills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pills.map((pill, idx) => (
                      <Badge key={idx} variant="outline" className={`${isSindhi ? 'sd-subtitle' : ''} rounded-full text-xs px-2.5 py-1`}>
                        {pill}
                      </Badge>
                    ))}
                  </div>
                )}
                {dym && (
                  <div className="mb-3 text-xs text-gray-500">
                    <span className={isSindhi ? 'auto-sindhi-font stats-text' : ''}>
                      {isSindhi ? 'شايد توهان جي مراد:' : 'Did you mean:'}
                    </span> {dym}
                  </div>
                )}
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      <span className={isSindhi ? 'auto-sindhi-font card-text' : ''}>
                        {isSindhi ? `"${query}" لاءِ ڪو نتيجو نه مليو` : `No results found for "${query}"`}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {isSindhi ? 'مختلف لفظ آزمايو يا هجاءَ چيڪ ڪريو' : 'Try different keywords or check spelling'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
                    {/* Minimal Suggestions */}
                    {(recentSearches.length > 0 || entitySuggestions.length > 0) && (
                      <div className="space-y-0 mb-2">
                        {recentSearches.length > 0 && (
                          <div className="space-y-0">
                            {recentSearches.slice(0, 3).map((search, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(search)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 hover:underline transition-colors ${
                                  highlightedIndex === idx ? 'bg-gray-50' : ''
                                } ${isSindhi ? 'auto-sindhi-font' : ''}`}
                              >
                                {search}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {entitySuggestions.length > 0 && (
                          <div className="space-y-0">
                            {entitySuggestions.slice(0, 3).map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion.label)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 hover:underline transition-colors ${
                                  highlightedIndex === recentSearches.length + idx ? 'bg-gray-50' : ''
                                } ${isSindhi ? 'auto-sindhi-font' : ''}`}
                              >
                                {suggestion.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Search Results - Minimal Perplexity Style */}
                    {searchResults.length > 0 && (
                      <div className="space-y-0">
                        {(() => {
                          // Remove duplicates and group by type with priority order
                          const seen = new Set<string>();
                          const uniqueResults = searchResults.filter(result => {
                            const key = `${result.type}-${result.id}`;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                          });

                          const priorityOrder = ['poet', 'couplet', 'poem', 'category', 'tag', 'timeline'];
                          const groupedResults = uniqueResults.reduce((acc, result) => {
                            if (!acc[result.type]) acc[result.type] = [];
                            acc[result.type].push(result);
                            return acc;
                          }, {} as Record<string, SearchResult[]>);
                          
                          // Sort by priority and limit results per type
                          const orderedResults: SearchResult[] = [];
                          priorityOrder.forEach(type => {
                            if (groupedResults[type]) {
                              const limit = type === 'poet' ? 3 : type === 'couplet' ? 4 : type === 'poem' ? 3 : 2;
                              orderedResults.push(...groupedResults[type].slice(0, limit));
                            }
                          });
                          
                          return orderedResults.map((result, index) => (
                            <motion.div
                              key={`${result.type}-${result.id}`}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.15, 
                                delay: index * 0.02,
                                ease: "easeOut"
                              }}
                              className="group cursor-pointer"
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`${isSindhi ? 'auto-sindhi-font' : ''} text-sm text-gray-900 group-hover:text-gray-700 transition-colors group-hover:underline`}>
                                      {result.title}
                                    </h4>
                                    {result.metadata?.poet && result.type !== 'poet' && (
                                      <p className={`${isSindhi ? 'auto-sindhi-font' : ''} text-xs text-gray-500 mt-0.5`}>
                                        {isSindhi ? 'شاعر:' : 'by'} {result.metadata.poet}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
