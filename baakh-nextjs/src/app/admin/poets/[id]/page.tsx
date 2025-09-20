"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, ArrowLeft, Sparkles, Info, Plus } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import PoetForm from "@/components/forms/PoetForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Poet {
  id: string;
  poet_slug: string;
  english_name: string;
  english_laqab?: string;
  english_takhalus?: string;
  english_tagline?: string;
  english_details?: string;
  sindhi_name?: string;
  sindhi_laqab?: string;
  sindhi_takhalus?: string;
  sindhi_tagline?: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  death_place?: string;
  tags?: string[];
  file_url?: string | null;
  is_featured?: boolean;
  is_hidden?: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditPoetPage() {
  const params = useParams();
  const id = params.id as string;
  const [poet, setPoet] = useState<Poet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/poets/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch poet');
        }
        
        const data = await response.json();
        setPoet(data.poet);
      } catch (error) {
        console.error('Error fetching poet:', error);
        setError('Failed to fetch poet data');
      } finally {
        setLoading(false);
      }
    };

    fetchPoet();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9]">
          <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F1F1F1] rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-6 bg-[#F1F1F1] rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-[#F1F1F1] rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-[#F1F1F1] rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-sm min-h-[400px]">
                  <div className="h-6 w-40 bg-[#F1F1F1] rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-10 bg-[#F7F7F7] border border-[#EFEFEF] rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-sm min-h-[200px]">
                  <div className="h-6 w-32 bg-[#F1F1F1] rounded animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-6 bg-[#F7F7F7] border border-[#EFEFEF] rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !poet) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9]">
          <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F1F1F1] rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-[#2B2B2B]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Poet Not Found</h1>
                  <p className="text-[#6B6B6B] text-lg">Could not find the poet with ID: {id}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="bg-white border-[#E5E5E5] rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-[#DC2626] mb-4">Poet Not Found</h2>
                <p className="text-[#6B6B6B] mb-6">The poet you're looking for could not be found or there was an error loading the data.</p>
                <Link href="/admin/poets">
                  <Button className="bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Poets List
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Transform the data to match the form structure
  const initialData = {
    id: poet.id,
    poet_slug: poet.poet_slug || "",
    birth_date: poet.birth_date || "",
    death_date: poet.death_date || "",
    birth_place: poet.birth_place || "",
    death_place: poet.death_place || "",
    tags: poet.tags || [],
    file_url: poet.file_url || "",
    is_featured: poet.is_featured || false,
    is_hidden: poet.is_hidden || false,
    sindhi_name: poet.sindhi_name || "",
    sindhi_laqab: poet.sindhi_laqab || "",
    sindhi_takhalus: poet.sindhi_takhalus || "",
    sindhi_tagline: poet.sindhi_tagline || "",
    sindhi_details: poet.sindhi_details || "",
    english_name: poet.english_name || "",
    english_laqab: poet.english_laqab || "",
    english_takhalus: poet.english_takhalus || "",
    english_tagline: poet.english_tagline || "",
    english_details: poet.english_details || "",
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/poets">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#F1F1F1]">
                    <ArrowLeft className="w-4 h-4 text-[#6B6B6B]" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F1F1F1] rounded-lg flex items-center justify-center">
                    <Edit className="w-6 h-6 text-[#2B2B2B]" />
                  </div>
                  <div>
                    <div className="mb-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-[#F1F1F1] text-[#2B2B2B] border-[#E7E7E7]">
                        Edit Mode
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
                      Edit Poet Profile
                    </h1>
                    <p className="text-[#6B6B6B] text-lg">
                      Update poet information, details, and biographical data
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm border-[#E5E5E5] text-[#6B6B6B]">
                  {poet.is_featured ? 'Featured' : 'Standard'}
                </Badge>
                <Badge variant={poet.is_hidden ? "destructive" : "secondary"} className="text-sm">
                  {poet.is_hidden ? 'Hidden' : 'Visible'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardHeader className="py-6">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F]">Poet Information</CardTitle>
                  <CardDescription className="text-base text-[#6B6B6B]">
                    Update the fields below. Required fields are marked with *.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PoetForm mode="edit" initialData={initialData} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Guidelines Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardHeader className="py-6">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#1F1F1F]" /> 
                    Guidelines
                  </CardTitle>
                  <CardDescription className="text-base text-[#6B6B6B]">
                    Keep entries concise and verifiable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-[#6B6B6B]">
                        Include native name (Sindhi) and transliteration when available.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-[#6B6B6B]">
                        Add poet-specific tags (e.g., Sufi Poet, Classical Poet, Modern Poet).
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-[#6B6B6B]">
                        Short bio (2–3 lines) with key contributions or notable works.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-[#6B6B6B]">
                        Use references/notes field for citations or source links.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm mt-6">
                <CardHeader className="py-6">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button variant="outline" asChild className="w-full border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors justify-start">
                      <Link href="/admin/poets">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Poets List
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors justify-start">
                      <Link href={`/admin/poetry/create?poet=${poet.id}`}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Poetry for This Poet
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 