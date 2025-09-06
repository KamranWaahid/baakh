"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Clock, TrendingUp, Filter, BookOpen, Users, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: 'couplet' | 'poet' | 'topic';
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  tags?: string[];
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "couplet",
    title: "من جي حياتيءَ ۾",
    subtitle: "In my life",
    description: "A beautiful couplet about the journey of life and spiritual awakening...",
    href: "/poetry/1",
    tags: ["Sufi", "Philosophy", "Spiritual"]
  },
  {
    id: "2",
    type: "poet",
    title: "Shah Abdul Latif Bhittai",
    subtitle: "Classical Sufi Poet",
    description: "One of the greatest Sindhi poets, known for his spiritual and philosophical poetry...",
    href: "/poets/shah-abdul-latif-bhittai",
    tags: ["Sufi", "Classical", "Philosophy"]
  },
  {
    id: "3",
    type: "topic",
    title: "Divine Love",
    subtitle: "عشق الٰہی",
    description: "Poetry exploring themes of divine love and spiritual connection...",
    href: "/topics/divine-love",
    tags: ["Spiritual", "Love", "Mysticism"]
  }
];

const searchFilters = [
  { id: "all", label: "All", icon: Search },
  { id: "couplets", label: "Couplets", icon: BookOpen },
  { id: "poets", label: "Poets", icon: Users },
  { id: "topics", label: "Topics", icon: Tag }
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches] = useState([
    "Shah Abdul Latif",
    "Sufi poetry",
    "Divine love",
    "Classical Sindhi"
  ]);
  const [trendingSearches] = useState([
    "Spiritual awakening",
    "Mystical poetry",
    "Sindhi culture",
    "Traditional wisdom"
  ]);

  // Function to detect if text contains Sindhi characters
  const isSindhiText = (text: string): boolean => {
    return /[ء-ي]/.test(text);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter results based on query and active filter
    let filteredResults = mockSearchResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === "all" || result.type === activeFilter;
      
      return matchesQuery && matchesFilter;
    });

    setResults(filteredResults);
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'couplet':
        return <BookOpen className="w-4 h-4" />;
      case 'poet':
        return <Users className="w-4 h-4" />;
      case 'topic':
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'couplet':
        return 'Couplet';
      case 'poet':
        return 'Poet';
      case 'topic':
        return 'Topic';
      default:
        return 'Result';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search poetry, poets, or themes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !query.trim()) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </form>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 overflow-x-auto">
              {searchFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() ? (
              /* Search Results */
              <div className="p-4">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Searching...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {getTypeLabel(result.type)}
                              </span>
                              <h3 className={`font-medium text-gray-900 dark:text-white truncate ${isSindhiText(result.title) ? 'auto-sindhi-font' : ''}`}>
                                {result.title}
                              </h3>
                            </div>
                            {result.subtitle && (
                              <p className={`text-sm text-gray-600 dark:text-gray-400 mb-1 ${isSindhiText(result.subtitle) ? 'auto-sindhi-font' : ''}`}>
                                {result.subtitle}
                              </p>
                            )}
                            {result.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                                {result.description}
                              </p>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No results found for "{query}"
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Default State - Recent & Trending */
              <div className="p-4 space-y-6">
                {/* Recent Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Recent Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearch(search)}
                        className="text-sm"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Trending</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearch(search)}
                        className="text-sm"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
