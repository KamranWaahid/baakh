"use client";

import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  Users, 
  FileText, 
  Quote, 
  Tag, 
  Type, 
  Globe, 
  BarChart3, 
  Settings,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Code,
  Database,
  Shield,
  Zap,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  subsections: {
    id: string;
    title: string;
    content: string;
    tips?: string[];
    warnings?: string[];
  }[];
}

const documentationSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn the basics of the admin panel and how to navigate the system.",
    subsections: [
      {
        id: "overview",
        title: "System Overview",
        content: "The Poetry Archive Admin Panel is a comprehensive management system for organizing and curating Sindhi poetry collections. It provides tools for managing poets, poetry works, couplets, tags, and more.",
        tips: [
          "Start by exploring the Dashboard for an overview of your content",
          "Use the search functionality to quickly find specific items",
          "Check the Quick Actions section for common tasks"
        ]
      },
      {
        id: "navigation",
        title: "Navigation Guide",
        content: "The sidebar contains all main sections organized by category. Each section has specific tools and features for managing different aspects of your poetry collection.",
        tips: [
          "Active sections are highlighted in the sidebar",
          "Use keyboard shortcuts for faster navigation",
          "Mobile users can access the menu via the hamburger button"
        ]
      }
    ]
  },
  {
    id: "content-management",
    title: "Content Management",
    icon: FileText,
    description: "Manage poets, poetry works, and couplets in your collection.",
    subsections: [
      {
        id: "poets",
        title: "Managing Poets",
        content: "The Poets section allows you to add, edit, and manage poet profiles. Each poet can have both English and Sindhi names, along with biographical information, locations, and tags.",
        tips: [
          "Use laqab names (honorific titles) for better identification",
          "Add birth and death dates for historical context",
          "Upload profile images to enhance poet profiles",
          "Use tags to categorize poets by era, style, or region"
        ],
        warnings: [
          "Ensure poet names are accurate and properly romanized",
          "Verify biographical information before publishing"
        ]
      },
      {
        id: "poetry",
        title: "Managing Poetry Works",
        content: "Create and manage complete poetry works with multiple couplets. Each work can have translations, categories, and detailed metadata.",
        tips: [
          "Start with the main title and description",
          "Add couplets one by one for better organization",
          "Use categories to group related works",
          "Add translations for multilingual support"
        ]
      },
      {
        id: "couplets",
        title: "Managing Couplets",
        content: "Individual couplets can be managed separately, allowing for flexible organization and cross-referencing between different poetry works.",
        tips: [
          "Each couplet should have a unique slug",
          "Add both original and translated versions",
          "Use tags for thematic organization",
          "Link couplets to their parent poetry works"
        ]
      }
    ]
  },
  {
    id: "organization",
    title: "Organization & Tags",
    icon: Tag,
    description: "Organize your content with categories, tags, and locations.",
    subsections: [
      {
        id: "categories",
        title: "Categories System",
        content: "Categories help organize poetry works by type, theme, or style. Create hierarchical categories for better organization.",
        tips: [
          "Use descriptive category names",
          "Create subcategories for detailed classification",
          "Assign categories consistently across works"
        ]
      },
      {
        id: "tags",
        title: "Tagging System",
        content: "Tags provide flexible labeling for both poets and poetry works. Use tags for themes, emotions, seasons, or any other classification.",
        tips: [
          "Use consistent tag naming conventions",
          "Create tag hierarchies when needed",
          "Review and merge duplicate tags regularly"
        ]
      },
      {
        id: "locations",
        title: "Location Management",
        content: "Manage geographical information for poets and poetry works. Includes countries, provinces, and cities with proper Sindhi and English names.",
        tips: [
          "Add both English and Sindhi location names",
          "Use consistent spelling and formatting",
          "Link locations to poet birthplaces and death places"
        ]
      }
    ]
  },
  {
    id: "tools",
    title: "Tools & Utilities",
    icon: Zap,
    description: "Specialized tools for Sindhi text processing and management.",
    subsections: [
      {
        id: "romanizer",
        title: "Romanization Tools",
        content: "Convert between Sindhi script and Roman script using the Hesudhar system. Essential for creating searchable and accessible content.",
        tips: [
          "Use the romanizer for consistent transliteration",
          "Verify romanized text for accuracy",
          "Maintain both script versions for completeness"
        ]
      },
      {
        id: "search",
        title: "Search & Discovery",
        content: "Advanced search capabilities across all content types with filters and sorting options.",
        tips: [
          "Use specific keywords for better results",
          "Combine multiple filters for precise searches",
          "Save frequent searches for quick access"
        ]
      }
    ]
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    icon: BarChart3,
    description: "Monitor your collection's growth and usage statistics.",
    subsections: [
      {
        id: "statistics",
        title: "Collection Statistics",
        content: "View comprehensive statistics about your poetry collection including counts, growth trends, and content distribution.",
        tips: [
          "Check statistics regularly to track growth",
          "Use analytics to identify content gaps",
          "Monitor user engagement metrics"
        ]
      },
      {
        id: "reports",
        title: "Reporting Features",
        content: "Generate detailed reports on collection status, content quality, and administrative activities.",
        tips: [
          "Export reports for external analysis",
          "Schedule regular report generation",
          "Use reports for collection planning"
        ]
      }
    ]
  },
  {
    id: "system",
    title: "System Administration",
    icon: Settings,
    description: "Configure system settings and manage user permissions.",
    subsections: [
      {
        id: "settings",
        title: "System Settings",
        content: "Configure global settings, preferences, and system behavior. Includes display options, language settings, and feature toggles.",
        tips: [
          "Review settings after system updates",
          "Backup settings before making changes",
          "Test changes in a staging environment"
        ]
      },
      {
        id: "permissions",
        title: "User Permissions",
        content: "Manage user roles and permissions for different admin functions. Control access to sensitive operations and content management.",
        tips: [
          "Follow principle of least privilege",
          "Regularly review user permissions",
          "Use role-based access control"
        ],
        warnings: [
          "Be careful when granting admin privileges",
          "Monitor user activities for security"
        ]
      }
    ]
  }
];

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["getting-started"]));
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(new Set(["overview"]));

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subsections.some(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleSubsection = (subsectionId: string) => {
    setExpandedSubsections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subsectionId)) {
        newSet.delete(subsectionId);
      } else {
        newSet.add(subsectionId);
      }
      return newSet;
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Admin Panel Documentation"
          subtitle="Documentation"
          subtitleIcon={<BookOpen className="w-4 h-4" />}
          description="Comprehensive guide to using the Poetry Archive Admin Panel. Learn how to manage poets, poetry works, and organize your collection effectively."
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-gray-200 rounded-lg shadow-sm sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Contents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documentationSections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections.has(section.id);
                    
                    return (
                      <div key={section.id} className="space-y-1">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Icon size={16} className="text-gray-500" />
                          <span className="flex-1">{section.title}</span>
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-400" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-6 space-y-1">
                            {section.subsections.map((subsection) => (
                              <button
                                key={subsection.id}
                                onClick={() => toggleSubsection(subsection.id)}
                                className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              >
                                {subsection.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Documentation Content */}
            <div className="lg:col-span-3">
              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search documentation..."
                    className="pl-10 h-10 rounded-lg bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* Documentation Sections */}
              <div className="space-y-8">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  
                  return (
                    <Card key={section.id} className="bg-white border-gray-200 rounded-lg shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon size={20} className="text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">
                              {section.title}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">{section.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} className="border-l-2 border-gray-200 pl-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {subsection.title}
                            </h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                              {subsection.content}
                            </p>
                            
                            {/* Tips */}
                            {subsection.tips && subsection.tips.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle size={16} className="text-green-600" />
                                  <span className="text-sm font-medium text-gray-900">Tips</span>
                                </div>
                                <ul className="space-y-1 ml-6">
                                  {subsection.tips.map((tip, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Warnings */}
                            {subsection.warnings && subsection.warnings.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle size={16} className="text-amber-600" />
                                  <span className="text-sm font-medium text-gray-900">Important Notes</span>
                                </div>
                                <ul className="space-y-1 ml-6">
                                  {subsection.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-amber-600 mt-1">⚠</span>
                                      <span>{warning}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Help */}
              <Card className="bg-gray-50 border-gray-200 rounded-lg shadow-sm mt-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HelpCircle size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h3>
                      <p className="text-gray-600 mb-4">
                        If you can't find what you're looking for, here are some additional resources:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          onClick={() => window.location.href = '/admin/support'}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          onClick={() => window.location.href = '/admin/api-docs'}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          API Documentation
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          onClick={() => window.location.href = '/admin/database-schema'}
                        >
                          <Database className="w-4 h-4 mr-2" />
                          Database Schema
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
