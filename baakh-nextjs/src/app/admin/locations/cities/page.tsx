"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Flag,
  Mountain,
  ArrowLeft,
  Navigation
} from "lucide-react";

interface City {
  id: number;
  city_name: string;
  geo_lat?: string;
  geo_long?: string;
  province_id: number;
  lang: string;
  created_at: string;
  updated_at: string;
  province_name: string;
}

export default function CitiesAdminPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '20',
        search: searchQuery,
        lang: selectedLang,
        sortBy: 'city_name',
        sortOrder: 'asc'
      });
      
      const response = await fetch(`/api/admin/locations/cities?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      
      const data = await response.json();
      if (data.success) {
        setCities(data.cities);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [page, searchQuery, selectedLang]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        const response = await fetch(`/api/admin/locations/cities/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Refresh the list
          fetchCities();
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to delete city');
        }
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Failed to delete city');
      }
    }
  };

  const getLangLabel = (lang: string) => {
    switch (lang) {
      case "en": return "English";
      case "sd": return "سنڌي";
      default: return lang;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cities...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="text-gray-600">
                  <Link href="/admin/locations">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Locations
                  </Link>
                </Button>
              </div>
              
              <Button asChild className="bg-gray-900 text-white border-0">
                <Link href="/admin/locations/cities/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add City
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cities</h1>
                <p className="text-gray-600 text-lg">
                  Manage cities and their locations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Filters */}
          <Card className="mb-6 bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search cities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                </div>
                
                <div className="sm:w-48">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md bg-white focus:border-gray-900 focus:ring-gray-900"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English</option>
                    <option value="sd">سنڌي</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-600">Total Cities</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {cities.filter(c => c.lang === "en").length}
                </div>
                <div className="text-sm text-gray-600">English</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {cities.filter(c => c.lang === "sd").length}
                </div>
                <div className="text-sm text-gray-600">سنڌي</div>
              </CardContent>
            </Card>
          </div>

          {/* Cities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {cities.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="h-full bg-white border border-gray-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Building2 className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">{city.city_name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Mountain className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500">{city.province_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
                            {getLangLabel(city.lang)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {(city.geo_lat || city.geo_long) && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Navigation className="w-4 h-4" />
                            <span>
                              {city.geo_lat && city.geo_long 
                                ? `${city.geo_lat}, ${city.geo_long}`
                                : city.geo_lat || city.geo_long
                              }
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 border border-gray-200 text-gray-700">
                          <Link href={`/admin/locations/cities/${city.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(city.id)}
                          className="border border-gray-200 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="border border-gray-200"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="border border-gray-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {cities.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-900">No cities found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedLang !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first city"
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Data is bilingual per row (use Language filter to switch).
              </p>
              <Button asChild className="bg-gray-900 text-white border-0">
                <Link href="/admin/locations/cities/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add City
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
