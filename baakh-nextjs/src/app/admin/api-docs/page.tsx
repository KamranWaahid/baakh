"use client";

import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Search, 
  Copy, 
  Check,
  Globe,
  Database,
  Shield,
  Zap,
  BookOpen,
  Users,
  Tag,
  Quote
} from "lucide-react";

interface APIEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  category: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: {
    status: number;
    description: string;
    example: any;
  };
  example: {
    request: string;
    response: string;
  };
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: "get-poets",
    method: "GET",
    path: "/api/admin/poets",
    description: "Retrieve a list of poets with pagination and filtering",
    category: "poets",
    parameters: [
      { name: "page", type: "number", required: false, description: "Page number for pagination" },
      { name: "limit", type: "number", required: false, description: "Number of items per page" },
      { name: "search", type: "string", required: false, description: "Search term for filtering poets" }
    ],
    response: {
      status: 200,
      description: "Successfully retrieved poets",
      example: {
        poets: [],
        total: 0,
        page: 1,
        totalPages: 1
      }
    },
    example: {
      request: "GET /api/admin/poets?page=1&limit=10&search=shah",
      response: `{
  "poets": [
    {
      "id": "uuid",
      "poet_slug": "shah-abdul-latif",
      "english_name": "Shah Abdul Latif",
      "sindhi_name": "شاه عبداللطيف",
      "english_laqab": "Bhitai",
      "sindhi_laqab": "ڀٽائي",
      "birth_date": "1689",
      "death_date": "1752",
      "is_featured": true,
      "is_hidden": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}`
    }
  },
  {
    id: "create-poet",
    method: "POST",
    path: "/api/admin/poets",
    description: "Create a new poet",
    category: "poets",
    parameters: [
      { name: "english_name", type: "string", required: true, description: "English name of the poet" },
      { name: "sindhi_name", type: "string", required: false, description: "Sindhi name of the poet" },
      { name: "english_laqab", type: "string", required: false, description: "English laqab (honorific title)" },
      { name: "sindhi_laqab", type: "string", required: false, description: "Sindhi laqab (honorific title)" },
      { name: "birth_date", type: "string", required: false, description: "Birth date (YYYY format)" },
      { name: "death_date", type: "string", required: false, description: "Death date (YYYY format)" }
    ],
    response: {
      status: 201,
      description: "Poet created successfully",
      example: {
        id: "uuid",
        poet_slug: "generated-slug",
        created_at: "2024-01-01T00:00:00Z"
      }
    },
    example: {
      request: `POST /api/admin/poets
Content-Type: application/json

{
  "english_name": "Shah Abdul Latif",
  "sindhi_name": "شاه عبداللطيف",
  "english_laqab": "Bhitai",
  "sindhi_laqab": "ڀٽائي",
  "birth_date": "1689",
  "death_date": "1752"
}`,
      response: `{
  "id": "uuid",
  "poet_slug": "shah-abdul-latif",
  "english_name": "Shah Abdul Latif",
  "sindhi_name": "شاه عبداللطيف",
  "english_laqab": "Bhitai",
  "sindhi_laqab": "ڀٽائي",
  "birth_date": "1689",
  "death_date": "1752",
  "is_featured": false,
  "is_hidden": false,
  "created_at": "2024-01-01T00:00:00Z"
}`
    }
  },
  {
    id: "get-poetry",
    method: "GET",
    path: "/api/admin/poetry",
    description: "Retrieve a list of poetry works",
    category: "poetry",
    parameters: [
      { name: "page", type: "number", required: false, description: "Page number for pagination" },
      { name: "limit", type: "number", required: false, description: "Number of items per page" },
      { name: "poet_id", type: "string", required: false, description: "Filter by poet ID" },
      { name: "category_id", type: "string", required: false, description: "Filter by category ID" }
    ],
    response: {
      status: 200,
      description: "Successfully retrieved poetry works",
      example: {
        poetry: [],
        total: 0,
        page: 1,
        totalPages: 1
      }
    },
    example: {
      request: "GET /api/admin/poetry?poet_id=uuid&page=1&limit=10",
      response: `{
  "poetry": [
    {
      "id": "uuid",
      "poetry_slug": "shah-jo-risalo",
      "lang": "sindhi",
      "visibility": true,
      "is_featured": true,
      "poets": {
        "poet_id": 1,
        "poet_slug": "shah-abdul-latif",
        "sindhi_name": "شاه عبداللطيف",
        "english_name": "Shah Abdul Latif"
      },
      "poetry_translations": [
        {
          "id": 1,
          "title": "Shah Jo Risalo",
          "lang": "sindhi"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}`
    }
  },
  {
    id: "get-couplets",
    method: "GET",
    path: "/api/admin/poetry/couplets",
    description: "Retrieve a list of couplets",
    category: "couplets",
    parameters: [
      { name: "page", type: "number", required: false, description: "Page number for pagination" },
      { name: "limit", type: "number", required: false, description: "Number of items per page" },
      { name: "poetry_id", type: "string", required: false, description: "Filter by poetry work ID" },
      { name: "lang", type: "string", required: false, description: "Filter by language" }
    ],
    response: {
      status: 200,
      description: "Successfully retrieved couplets",
      example: {
        couplets: [],
        total: 0,
        page: 1,
        totalPages: 1
      }
    },
    example: {
      request: "GET /api/admin/poetry/couplets?poetry_id=uuid&lang=sindhi",
      response: `{
  "couplets": [
    {
      "id": 1,
      "couplet_text": "ڪيڏا ڪيڏا ڪيڏا ڪيڏا",
      "couplet_slug": "kida-kida-kida-kida",
      "lang": "sindhi",
      "poetry_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}`
    }
  },
  {
    id: "get-tags",
    method: "GET",
    path: "/api/admin/tags",
    description: "Retrieve a list of tags",
    category: "tags",
    parameters: [
      { name: "type", type: "string", required: false, description: "Filter by tag type (poet, poetry)" },
      { name: "search", type: "string", required: false, description: "Search term for filtering tags" }
    ],
    response: {
      status: 200,
      description: "Successfully retrieved tags",
      example: {
        tags: []
      }
    },
    example: {
      request: "GET /api/admin/tags?type=poet&search=classical",
      response: `{
  "tags": [
    {
      "id": 1,
      "name": "Classical",
      "slug": "classical",
      "type": "poet",
      "description": "Classical period poets",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}`
    }
  }
];

const categories = [
  { id: "all", label: "All Endpoints", icon: Code },
  { id: "poets", label: "Poets", icon: Users },
  { id: "poetry", label: "Poetry", icon: BookOpen },
  { id: "couplets", label: "Couplets", icon: Quote },
  { id: "tags", label: "Tags", icon: Tag }
];

export default function APIDocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800";
      case "POST": return "bg-blue-100 text-blue-800";
      case "PUT": return "bg-yellow-100 text-yellow-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <Code className="w-4 h-4 mr-2" />
                  API Documentation
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Complete API documentation for the Poetry Archive Admin Panel. Learn how to integrate with our REST API endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-gray-200 rounded-lg shadow-sm sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">API Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.id;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} className="text-gray-500" />
                        <span>{category.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search API endpoints..."
                    className="pl-10 h-10 rounded-lg bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* API Endpoints */}
              <div className="space-y-6">
                {filteredEndpoints.map((endpoint) => (
                  <Card key={endpoint.id} className="bg-white border-gray-200 rounded-lg shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-gray-600 mt-2">{endpoint.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="overview" className="w-full" onValueChange={() => {}}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="parameters">Parameters</TabsTrigger>
                          <TabsTrigger value="example">Example</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Response</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-700">Status: {endpoint.response.status}</span>
                                <span className="text-sm text-gray-600">{endpoint.response.description}</span>
                              </div>
                              <pre className="text-xs text-gray-700 overflow-x-auto">
                                <code>{JSON.stringify(endpoint.response.example, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="parameters" className="space-y-4">
                          {endpoint.parameters && endpoint.parameters.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Parameters</h4>
                              <div className="space-y-3">
                                {endpoint.parameters.map((param, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm font-mono text-gray-900">{param.name}</code>
                                      <Badge variant="outline" className="text-xs">
                                        {param.type}
                                      </Badge>
                                      {param.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{param.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-600">No parameters required for this endpoint.</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="example" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">Request</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(endpoint.example.request, `${endpoint.id}-request`)}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedCode === `${endpoint.id}-request` ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto">
                                <code>{endpoint.example.request}</code>
                              </pre>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">Response</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(endpoint.example.response, `${endpoint.id}-response`)}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedCode === `${endpoint.id}-response` ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto">
                                <code>{endpoint.example.response}</code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Reference */}
              <Card className="bg-gray-50 border-gray-200 rounded-lg shadow-sm mt-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Reference</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Base URL</p>
                          <code className="bg-white px-2 py-1 rounded text-xs">https://api.poetryarchive.com</code>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Authentication</p>
                          <p>Bearer token in Authorization header</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Rate Limiting</p>
                          <p>1000 requests per hour per API key</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Content Type</p>
                          <p>application/json for all requests</p>
                        </div>
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
