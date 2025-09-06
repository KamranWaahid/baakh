"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, ArrowLeft, Eye, Calendar, User, Tag, Globe, BookOpen } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PoetryData {
  id: string;
  poetry_slug: string;
  poetry_tags: string;
  lang: string;
  visibility: boolean;
  is_featured: boolean;
  content_style: string;
  created_at: string;
  updated_at: string;
  poets?: {
    id: string;
    sindhi_name: string;
    english_name: string;
    sindhi_laqab: string;
    english_laqab: string;
  };
  categories?: {
    id: string;
    slug: string;
  };
  poetry_translations?: Array<{
    id: string;
    title: string;
    info: string;
    source: string;
    lang: string;
  }>;
  poetry_couplets?: Array<{
    id: string;
    couplet_text: string;
    couplet_slug: string;
    couplet_tags: string;
    lang: string;
  }>;
}

export default function AdminPoetryViewPage() {
  const params = useParams();
  const router = useRouter();
  const [poetry, setPoetry] = useState<PoetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPoetry(params.id as string);
    }
  }, [params.id]);

  const fetchPoetry = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/poetry/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPoetry(data.poetry);
      } else {
        setError('Failed to fetch poetry');
      }
    } catch (error) {
      console.error('Error fetching poetry:', error);
      setError('Failed to fetch poetry');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'sd': 'Sindhi',
      'en': 'English',
      'ur': 'Urdu',
      'ar': 'Arabic'
    };
    return languages[code] || code.toUpperCase();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading poetry...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !poetry) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>
                {error || 'Poetry not found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The poetry you're looking for could not be loaded. Please check the URL and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/poetry')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Poetry
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs mb-2">
                {poetry.visibility ? 'Published' : 'Draft'}
                {poetry.is_featured && (
                  <Badge variant="default" className="ml-2">Featured</Badge>
                )}
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                {poetry.poetry_translations?.find(t => t.lang === 'en')?.title || poetry.poetry_slug}
              </h1>
              <p className="text-muted-foreground text-lg">
                /{poetry.poetry_slug}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/poetry/${poetry.poetry_slug}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public
              </Button>
              <Button
                onClick={() => router.push(`/admin/poetry/${poetry.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Poetry
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Language</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">{getLanguageName(poetry.lang)}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Content Style</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {poetry.content_style}
                      </Badge>
                    </div>
                  </div>
                </div>

                {poetry.poetry_tags && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {poetry.poetry_tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(poetry.created_at)}</span>
                    </div>
                  </div>
                  
                  {poetry.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(poetry.updated_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Translations */}
            {poetry.poetry_translations && poetry.poetry_translations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Translations</CardTitle>
                  <CardDescription>Available translations in different languages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poetry.poetry_translations.map((translation, index) => (
                    <div key={translation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">
                          {getLanguageName(translation.lang)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Translation {index + 1}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{translation.title}</h3>
                      
                      {translation.info && (
                        <p className="text-muted-foreground mb-2">{translation.info}</p>
                      )}
                      
                      {translation.source && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Source: </span>
                          <span>{translation.source}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Couplets */}
            {poetry.poetry_couplets && poetry.poetry_couplets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Couplets/Verses</CardTitle>
                  <CardDescription>Individual couplets and verses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poetry.poetry_couplets.map((couplet, index) => (
                    <div key={couplet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">
                          {getLanguageName(couplet.lang)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Couplet {index + 1}
                        </span>
                      </div>
                      
                      {couplet.couplet_slug && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Slug: {couplet.couplet_slug}
                        </div>
                      )}
                      
                      <div className="text-lg leading-relaxed mb-3">
                        {couplet.couplet_text}
                      </div>
                      
                      {couplet.couplet_tags && (
                        <div className="flex flex-wrap gap-2">
                          {couplet.couplet_tags.split(',').map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
            
            {/* Poet Information */}
            {poetry.poets && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Poet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sindhi Name</label>
                    <p className="font-medium">{poetry.poets.sindhi_name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">English Name</label>
                    <p className="font-medium">{poetry.poets.english_name}</p>
                  </div>
                  
                  {poetry.poets.sindhi_laqab && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sindhi Laqab</label>
                      <p className="text-muted-foreground">{poetry.poets.sindhi_laqab}</p>
                    </div>
                  )}
                  
                  {poetry.poets.english_laqab && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">English Laqab</label>
                      <p className="text-muted-foreground">{poetry.poets.english_laqab}</p>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => poetry.poets && router.push(`/admin/poets/${poetry.poets.id}`)}
                  >
                    View Poet Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Category Information */}
            {poetry.categories && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{poetry.categories.slug}</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => poetry.categories && router.push(`/admin/categories/${poetry.categories.id}`)}
                  >
                    View Category
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/poetry/${poetry.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Poetry
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/poetry/${poetry.poetry_slug}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Page
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
