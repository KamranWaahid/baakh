"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Hash, BookOpen, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

interface TopicData {
  title: string;
  description: string;
  totalCategories: number;
  totalItems: number;
}

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTopicData = async () => {
      setLoading(true);
      try {
        // Fetch topic information and related categories
        const response = await fetch(`/api/topics/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setTopicData(data.topic);
          setCategories(data.categories || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching topic data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTopicData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Topic Not Found</h1>
            <p className="text-muted-foreground">The topic you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/20 to-background border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{topicData.title}</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {topicData.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{topicData.totalCategories} Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{topicData.totalItems} Total Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Categories in {topicData.title}
            </h2>
            <p className="text-muted-foreground">
              Explore all categories related to this topic
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Categories Found</h3>
              <p className="text-muted-foreground">
                There are no categories available for this topic yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      <Link 
                        href={`/categories/${category.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {category.count} items
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/categories/${category.slug}`}>
                          Explore →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
