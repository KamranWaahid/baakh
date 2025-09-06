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
  Mountain, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Flag,
  Building2,
  ArrowLeft
} from "lucide-react";

interface Province {
  id: number;
  province_name: string;
  country_id: number;
  lang: string;
  created_at: string;
  updated_at: string;
  country_name: string;
  cities_count: number;
}

export default function ProvincesAdminPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch provinces from API
  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '20',
        search: searchQuery,
        lang: selectedLang,
        country_id: selectedCountry !== 'all' ? selectedCountry : '',
        sortBy: 'province_name',
        sortOrder: 'asc'
      });
      
      const response = await fetch(`/api/admin/locations/provinces?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      
      const data = await response.json();
      if (data.success) {
        setProvinces(data.provinces);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, [page, searchQuery, selectedLang, selectedCountry]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this province?")) {
      try {
        const response = await fetch(`/api/admin/locations/provinces/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Refresh the list
          fetchProvinces();
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to delete province');
        }
      } catch (error) {
        console.error('Error deleting province:', error);
        alert('Failed to delete province');
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
          <p className="text-muted-foreground">Loading provinces...</p>
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
                <Link href="/admin/locations/provinces/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Province
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Mountain className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Provinces/States</h1>
                <p className="text-[#6B6B6B] text-lg">
                  Manage provinces and states within countries
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Filters */}
          <Card className="mb-6 bg-white border-[#E5E5E5]">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                    <Input
                      placeholder="Search provinces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                </div>
                
                <div className="sm:w-48">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full p-2 border border-[#E5E5E5] rounded-md bg-white focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
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
            <Card className="bg-white border-[#E5E5E5]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#1F1F1F]">{total}</div>
                <div className="text-sm text-[#6B6B6B]">Total Provinces</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#1F1F1F]">
                  {provinces.filter(p => p.lang === "en").length}
                </div>
                <div className="text-sm text-[#6B6B6B]">English</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#1F1F1F]">
                  {provinces.filter(p => p.lang === "sd").length}
                </div>
                <div className="text-sm text-[#6B6B6B]">سنڌي</div>
              </CardContent>
            </Card>
          </div>

          {/* Provinces List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {provinces.map((province, index) => (
                <motion.div
                  key={province.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="h-full bg-white border-[#E5E5E5] hover:shadow-lg transition-all duration-200 hover:border-[#D0D0D0]">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Mountain className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#1F1F1F]">{province.province_name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Flag className="w-4 h-4 text-[#6B6B6B]" />
                              <span className="text-sm text-[#6B6B6B]">{province.country_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-xs bg-[#F1F1F1] text-[#2B2B2B] border-[#E7E7E7]">
                            {getLangLabel(province.lang)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                          <Building2 className="w-4 h-4" />
                          <span>{province.cities_count} cities</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 border-[#E5E5E5] text-[#2B2B2B] hover:bg-[#F9F9F9] hover:border-[#D0D0D0]">
                          <Link href={`/admin/locations/provinces/${province.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(province.id)}
                          className="border-[#E5E5E5] text-red-600 hover:bg-red-50 hover:border-red-300"
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
                  className="border-[#E5E5E5]"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-[#6B6B6B]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="border-[#E5E5E5]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {provinces.length === 0 && (
            <div className="text-center py-12">
              <Mountain className="w-16 h-16 text-[#6B6B6B] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-[#1F1F1F]">No provinces found</h3>
              <p className="text-[#6B6B6B] mb-4">
                {searchQuery || selectedLang !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first province"
                }
              </p>
              <p className="text-sm text-[#6B6B6B] mb-4">
                Data is bilingual per row (use Language filter to switch).
              </p>
              <Button asChild className="bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border-0">
                <Link href="/admin/locations/provinces/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Province
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
