"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PoetryForm from "@/components/forms/PoetryForm";

export default function AdminPoetryEditPage() {
  const params = useParams();
  const [poetry, setPoetry] = useState<any>(null);
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
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs mb-1">Edit</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Poetry</h1>
          <p className="text-muted-foreground">
            Update poetry entry: {poetry.poetry_slug}
          </p>
        </motion.div>

        {/* Poetry Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <PoetryForm poetry={poetry} mode="edit" />
        </motion.div>
      </div>
    </AdminLayout>
  );
}
