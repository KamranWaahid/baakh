"use client";

import { Plus, ArrowLeft, Sparkles, Info } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import PoetForm from "@/components/forms/PoetForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CreatePoetPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/poets">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#F4F4F5] text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <div className="mb-1">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">Create</Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F1F1F]">New Poet</h1>
                    <p className="text-lg text-[#6B6B6B]">Add a poet to the archive with clear, research‑friendly details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                  Poet Information
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Fill the fields below. Required fields are marked with *.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PoetForm mode="create" />
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-[#1F1F1F]" />
                  Guidelines
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Keep entries concise and verifiable.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#6B6B6B] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include native name (Sindhi) and transliteration when available.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Add era/period and primary themes or tags (e.g., Sufi, Romantic).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Short bio (2–3 lines) with key contributions or notable works.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1F1F1F] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use references/notes field for citations or source links.</p>
                </div>
                
                <div className="p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5] mt-6">
                  <div className="font-medium text-[#1F1F1F] mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-[#6B6B6B]" />
                    Pro Tip
                  </div>
                  <p className="text-sm">
                    When creating poet entries, focus on accuracy and verifiability. Include multiple sources when possible and maintain consistency with existing entries.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 