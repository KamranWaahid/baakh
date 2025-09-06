"use client";

import { useState } from 'react';
import { useCoupletsByPoet } from '@/hooks/useCoupletsByPoet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

interface CoupletsByPoetExampleProps {
  initialPoetId?: string;
}

export default function CoupletsByPoetExample({ initialPoetId = '' }: CoupletsByPoetExampleProps) {
  const [poetId, setPoetId] = useState(initialPoetId);
  const [searchPoetId, setSearchPoetId] = useState(initialPoetId);
  const [language, setLanguage] = useState<'sd' | 'en' | ''>('');

  const {
    couplets,
    poet,
    pagination,
    loading,
    error,
    fetchCouplets,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage
  } = useCoupletsByPoet(poetId, { autoFetch: !!poetId });

  const handleSearch = () => {
    if (searchPoetId.trim()) {
      setPoetId(searchPoetId.trim());
    }
  };

  const handleLanguageFilter = (lang: 'sd' | 'en' | '') => {
    setLanguage(lang);
    if (poetId) {
      fetchCouplets({ lang: lang || undefined, page: 1 });
    }
  };

  const handleSort = (sortBy: 'created_at' | 'couplet_slug' | 'lang') => {
    if (poetId) {
      fetchCouplets({ sortBy, page: 1 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fetch Couplets by Poet ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Poet ID (UUID)"
              value={searchPoetId}
              onChange={(e) => setSearchPoetId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchPoetId.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Language:</span>
            <Button
              variant={language === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageFilter('')}
            >
              All
            </Button>
            <Button
              variant={language === 'sd' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageFilter('sd')}
            >
              Sindhi
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageFilter('en')}
            >
              English
            </Button>

            <span className="text-sm font-medium ml-4">Sort by:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('created_at')}
            >
              Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('couplet_slug')}
            >
              Slug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('lang')}
            >
              Language
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading couplets...</p>
          </CardContent>
        </Card>
      )}

      {/* Poet Information */}
      {poet && (
        <Card>
          <CardHeader>
            <CardTitle>Poet: {poet.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Sindhi Name:</span> {poet.sindhi_name}
              </div>
              <div>
                <span className="font-medium">English Name:</span> {poet.english_name}
              </div>
              <div>
                <span className="font-medium">Slug:</span> {poet.slug}
              </div>
              <div>
                <span className="font-medium">ID:</span> {poet.id}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Couplets Display */}
      {couplets.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Couplets ({couplets.length})
            </h3>
            {pagination && (
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} 
                (Total: {pagination.total})
              </span>
            )}
          </div>

          <div className="grid gap-4">
            {couplets.map((couplet) => (
              <Card key={couplet.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Couplet Lines */}
                    <div className="space-y-2">
                      {couplet.lines.map((line, index) => (
                        <p
                          key={index}
                          className={`text-lg ${
                            couplet.lang === 'sd' ? 'auto-sindhi-font' : ''
                          }`}
                          style={
                            couplet.lang === 'sd' 
                              ? { fontFamily: 'var(--font-sindhi-primary)' } 
                              : {}
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                      <Badge variant="outline">
                        {couplet.lang === 'sd' ? 'Sindhi' : 'English'}
                      </Badge>
                      <span>•</span>
                      <span>Likes: {couplet.likes}</span>
                      <span>•</span>
                      <span>Views: {couplet.views}</span>
                      <span>•</span>
                      <span>Created: {new Date(couplet.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Tags */}
                    {couplet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {couplet.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={previousPage}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && couplets.length === 0 && poetId && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No couplets found for this poet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
