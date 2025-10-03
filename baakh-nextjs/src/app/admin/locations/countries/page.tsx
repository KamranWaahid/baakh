'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Globe, ArrowLeft, Flag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Country {
  id: number;
  countryname: string;
  abbreviation: string | null;
  countrydesc: string | null;
  continent: string | null;
  capital_city: number | null;
  lang: string;
  created_at: string;
  updated_at: string;
  provinces_count: number;
  cities_count: number;
  capital_city_name: string | null;
  available_languages: string[];
  language_count: number;
}

export default function CountriesAdminPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(20);
  const router = useRouter();

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        search: searchQuery,
        lang: selectedLang,
        sortBy: 'countryname',
        sortOrder: 'asc'
      });

      const response = await fetch(`/api/admin/locations/countries/?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCountries(data.countries);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [page, searchQuery, selectedLang]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this country?')) {
      try {
        const response = await fetch(`/api/admin/locations/countries/${id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchCountries(); // Refresh the list
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting country:', error);
        alert('Failed to delete country');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchCountries();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLang('all');
    setPage(1);
  };

  const getLanguageBadge = (lang: string) => {
    const colors = {
      en: 'bg-blue-100 text-blue-800',
      sd: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={`text-xs ${colors[lang as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {lang.toUpperCase()}
      </Badge>
    );
  };

  const getLanguageDisplay = (country: Country) => {
    if (country.language_count === 1) {
      return getLanguageBadge(country.lang);
    }
    
    return (
      <div className="flex gap-1">
        {country.available_languages.map(lang => getLanguageBadge(lang))}
        <Badge variant="outline" className="text-xs">
          {country.language_count} langs
        </Badge>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading countries...</div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="text-[#6B6B6B] hover:bg-[#F1F1F1]">
                  <Link href="/admin/locations">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Locations
                  </Link>
                </Button>
              </div>
              
              <Button asChild className="bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border-0">
                <Link href="/admin/locations/countries/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Country
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Flag className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Countries</h1>
                <p className="text-[#6B6B6B] text-lg">
                  Manage countries and their details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Search and Filters */}
      <Card className="mb-6 bg-white border border-gray-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block text-gray-700">Search</label>
              <Input
                placeholder="Search countries, abbreviations, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-200 focus:border-gray-900 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">Language</label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="w-32 border border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sd">Sindhi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-gray-900 text-white">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            {(searchQuery || selectedLang !== 'all') && (
              <Button type="button" variant="outline" onClick={clearFilters} className="border border-gray-200 text-gray-700">
                Clear Filters
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {countries.length} of {total} countries
        {selectedLang !== 'all' && ` (${selectedLang.toUpperCase()} only)`}
      </div>

      {/* Countries List */}
      {countries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedLang !== 'all' ? 'No countries found' : 'No countries yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedLang !== 'all' 
                  ? `No countries match your search "${searchQuery}" or language filter.`
                  : 'Get started by adding your first country.'
                }
              </p>
              {(searchQuery || selectedLang !== 'all') ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Link href="/admin/locations/countries/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Country
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {countries.map((country) => (
            <Card key={country.id} className="bg-white border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{country.countryname}</h3>
                      {getLanguageDisplay(country)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      {country.abbreviation && (
                        <div>
                          <span className="font-medium">Abbreviation:</span> {country.abbreviation}
                        </div>
                      )}
                      {country.continent && (
                        <div>
                          <span className="font-medium">Continent:</span> {country.continent}
                        </div>
                      )}
                      {country.capital_city_name && (
                        <div>
                          <span className="font-medium">Capital:</span> {country.capital_city_name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Provinces:</span> {country.provinces_count}
                      </div>
                      <div>
                        <span className="font-medium">Cities:</span> {country.cities_count}
                      </div>
                    </div>
                    
                    {country.countrydesc && (
                      <p className="text-gray-600 mt-2">{country.countrydesc}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border border-gray-200 text-gray-700"
                    >
                      <Link href={`/admin/locations/countries/${country.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(country.id)}
                      className="border border-gray-200 text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
        </div>
      </div>
    </AdminLayout>
  );
}
