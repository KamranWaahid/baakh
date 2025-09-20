"use client";

import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Search, 
  Copy, 
  Check,
  Table,
  Key,
  Link,
  Eye,
  EyeOff,
  Users,
  BookOpen,
  Quote,
  Tag,
  Globe,
  Layers,
  FileText
} from "lucide-react";

interface TableSchema {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: string;
    description: string;
  }[];
  relationships: {
    type: "one-to-many" | "many-to-many" | "one-to-one";
    table: string;
    description: string;
  }[];
}

const databaseSchema: TableSchema[] = [
  {
    id: "poets",
    name: "poets",
    description: "Stores information about poets and their biographical details",
    icon: Users,
    columns: [
      { name: "id", type: "UUID", nullable: false, primaryKey: true, description: "Unique identifier for the poet" },
      { name: "poet_slug", type: "VARCHAR(255)", nullable: false, description: "URL-friendly slug for the poet" },
      { name: "english_name", type: "VARCHAR(255)", nullable: false, description: "English name of the poet" },
      { name: "sindhi_name", type: "VARCHAR(255)", nullable: true, description: "Sindhi name of the poet" },
      { name: "english_laqab", type: "VARCHAR(255)", nullable: true, description: "English laqab (honorific title)" },
      { name: "sindhi_laqab", type: "VARCHAR(255)", nullable: true, description: "Sindhi laqab (honorific title)" },
      { name: "english_takhalus", type: "VARCHAR(255)", nullable: true, description: "English takhalus (pen name)" },
      { name: "sindhi_takhalus", type: "VARCHAR(255)", nullable: true, description: "Sindhi takhalus (pen name)" },
      { name: "birth_date", type: "VARCHAR(50)", nullable: true, description: "Birth date (YYYY format)" },
      { name: "death_date", type: "VARCHAR(50)", nullable: true, description: "Death date (YYYY format)" },
      { name: "birth_place", type: "VARCHAR(255)", nullable: true, description: "Place of birth" },
      { name: "death_place", type: "VARCHAR(255)", nullable: true, description: "Place of death" },
      { name: "file_url", type: "TEXT", nullable: true, description: "URL to profile image" },
      { name: "is_featured", type: "BOOLEAN", nullable: false, description: "Whether the poet is featured" },
      { name: "is_hidden", type: "BOOLEAN", nullable: false, description: "Whether the poet is hidden from public view" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "one-to-many", table: "poetry", description: "A poet can have multiple poetry works" },
      { type: "many-to-many", table: "poet_tags", description: "A poet can have multiple tags" }
    ]
  },
  {
    id: "poetry",
    name: "poetry",
    description: "Stores information about poetry works and collections",
    icon: BookOpen,
    columns: [
      { name: "id", type: "UUID", nullable: false, primaryKey: true, description: "Unique identifier for the poetry work" },
      { name: "poetry_slug", type: "VARCHAR(255)", nullable: false, description: "URL-friendly slug for the poetry work" },
      { name: "poet_id", type: "UUID", nullable: false, foreignKey: "poets.id", description: "Reference to the poet who wrote this work" },
      { name: "category_id", type: "INTEGER", nullable: true, foreignKey: "categories.id", description: "Reference to the category" },
      { name: "lang", type: "VARCHAR(10)", nullable: false, description: "Language of the poetry work" },
      { name: "visibility", type: "BOOLEAN", nullable: false, description: "Whether the work is visible to public" },
      { name: "is_featured", type: "BOOLEAN", nullable: false, description: "Whether the work is featured" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "many-to-one", table: "poets", description: "A poetry work belongs to one poet" },
      { type: "many-to-one", table: "categories", description: "A poetry work can belong to one category" },
      { type: "one-to-many", table: "poetry_couplets", description: "A poetry work can have multiple couplets" },
      { type: "one-to-many", table: "poetry_translations", description: "A poetry work can have multiple translations" },
      { type: "many-to-many", table: "poetry_tags", description: "A poetry work can have multiple tags" }
    ]
  },
  {
    id: "poetry_couplets",
    name: "poetry_couplets",
    description: "Stores individual couplets from poetry works",
    icon: Quote,
    columns: [
      { name: "id", type: "SERIAL", nullable: false, primaryKey: true, description: "Unique identifier for the couplet" },
      { name: "poetry_id", type: "UUID", nullable: false, foreignKey: "poetry.id", description: "Reference to the parent poetry work" },
      { name: "couplet_text", type: "TEXT", nullable: false, description: "The actual couplet text" },
      { name: "couplet_slug", type: "VARCHAR(255)", nullable: false, description: "URL-friendly slug for the couplet" },
      { name: "lang", type: "VARCHAR(10)", nullable: false, description: "Language of the couplet" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "many-to-one", table: "poetry", description: "A couplet belongs to one poetry work" }
    ]
  },
  {
    id: "poetry_translations",
    name: "poetry_translations",
    description: "Stores translations of poetry works",
    icon: FileText,
    columns: [
      { name: "id", type: "SERIAL", nullable: false, primaryKey: true, description: "Unique identifier for the translation" },
      { name: "poetry_id", type: "UUID", nullable: false, foreignKey: "poetry.id", description: "Reference to the parent poetry work" },
      { name: "title", type: "VARCHAR(255)", nullable: false, description: "Translated title" },
      { name: "lang", type: "VARCHAR(10)", nullable: false, description: "Language of the translation" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "many-to-one", table: "poetry", description: "A translation belongs to one poetry work" }
    ]
  },
  {
    id: "categories",
    name: "categories",
    description: "Stores poetry categories and classifications",
    icon: Layers,
    columns: [
      { name: "id", type: "SERIAL", nullable: false, primaryKey: true, description: "Unique identifier for the category" },
      { name: "name", type: "VARCHAR(255)", nullable: false, description: "Category name" },
      { name: "slug", type: "VARCHAR(255)", nullable: false, description: "URL-friendly slug for the category" },
      { name: "description", type: "TEXT", nullable: true, description: "Category description" },
      { name: "parent_id", type: "INTEGER", nullable: true, foreignKey: "categories.id", description: "Reference to parent category for hierarchy" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "one-to-many", table: "poetry", description: "A category can contain multiple poetry works" },
      { type: "one-to-many", table: "categories", description: "Self-referencing for category hierarchy" }
    ]
  },
  {
    id: "tags",
    name: "tags",
    description: "Stores tags for poets and poetry works",
    icon: Tag,
    columns: [
      { name: "id", type: "SERIAL", nullable: false, primaryKey: true, description: "Unique identifier for the tag" },
      { name: "name", type: "VARCHAR(255)", nullable: false, description: "Tag name" },
      { name: "slug", type: "VARCHAR(255)", nullable: false, description: "URL-friendly slug for the tag" },
      { name: "type", type: "VARCHAR(50)", nullable: false, description: "Type of tag (poet, poetry)" },
      { name: "description", type: "TEXT", nullable: true, description: "Tag description" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "many-to-many", table: "poet_tags", description: "A tag can be associated with multiple poets" },
      { type: "many-to-many", table: "poetry_tags", description: "A tag can be associated with multiple poetry works" }
    ]
  },
  {
    id: "poet_tags",
    name: "poet_tags",
    description: "Junction table for poet-tag many-to-many relationship",
    icon: Link,
    columns: [
      { name: "poet_id", type: "UUID", nullable: false, foreignKey: "poets.id", description: "Reference to the poet" },
      { name: "tag_id", type: "INTEGER", nullable: false, foreignKey: "tags.id", description: "Reference to the tag" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" }
    ],
    relationships: [
      { type: "many-to-one", table: "poets", description: "A poet-tag relationship belongs to one poet" },
      { type: "many-to-one", table: "tags", description: "A poet-tag relationship belongs to one tag" }
    ]
  },
  {
    id: "poetry_tags",
    name: "poetry_tags",
    description: "Junction table for poetry-tag many-to-many relationship",
    icon: Link,
    columns: [
      { name: "poetry_id", type: "UUID", nullable: false, foreignKey: "poetry.id", description: "Reference to the poetry work" },
      { name: "tag_id", type: "INTEGER", nullable: false, foreignKey: "tags.id", description: "Reference to the tag" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" }
    ],
    relationships: [
      { type: "many-to-one", table: "poetry", description: "A poetry-tag relationship belongs to one poetry work" },
      { type: "many-to-one", table: "tags", description: "A poetry-tag relationship belongs to one tag" }
    ]
  },
  {
    id: "locations",
    name: "locations",
    description: "Stores geographical information for poets and poetry",
    icon: Globe,
    columns: [
      { name: "id", type: "SERIAL", nullable: false, primaryKey: true, description: "Unique identifier for the location" },
      { name: "name", type: "VARCHAR(255)", nullable: false, description: "Location name" },
      { name: "sindhi_name", type: "VARCHAR(255)", nullable: true, description: "Sindhi name of the location" },
      { name: "type", type: "VARCHAR(50)", nullable: false, description: "Type of location (country, province, city)" },
      { name: "parent_id", type: "INTEGER", nullable: true, foreignKey: "locations.id", description: "Reference to parent location for hierarchy" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" },
      { name: "updated_at", type: "TIMESTAMP", nullable: false, description: "Record last update timestamp" }
    ],
    relationships: [
      { type: "one-to-many", table: "locations", description: "Self-referencing for location hierarchy" }
    ]
  }
];

export default function DatabaseSchemaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredTables = databaseSchema.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateCreateTableSQL = (table: TableSchema) => {
    let sql = `CREATE TABLE ${table.name} (\n`;
    
    table.columns.forEach((column, index) => {
      sql += `  ${column.name} ${column.type}`;
      if (!column.nullable) sql += ' NOT NULL';
      if (column.primaryKey) sql += ' PRIMARY KEY';
      if (column.foreignKey) sql += ` REFERENCES ${column.foreignKey}`;
      if (index < table.columns.length - 1) sql += ',';
      sql += '\n';
    });
    
    sql += ');';
    return sql;
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
                  <Database className="w-4 h-4 mr-2" />
                  Database Schema
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Database Schema</h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Complete database schema for the Poetry Archive system. Understand table structures, relationships, and data types.
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
                  <CardTitle className="text-lg font-semibold text-gray-900">Tables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredTables.map((table) => {
                    const Icon = table.icon;
                    const isActive = selectedTable === table.id;
                    
                    return (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(isActive ? null : table.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} className="text-gray-500" />
                        <span className="flex-1">{table.name}</span>
                        {isActive ? (
                          <EyeOff size={16} className="text-gray-400" />
                        ) : (
                          <Eye size={16} className="text-gray-400" />
                        )}
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
                    placeholder="Search database tables..."
                    className="pl-10 h-10 rounded-lg bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* Database Tables */}
              <div className="space-y-6">
                {filteredTables.map((table) => {
                  const Icon = table.icon;
                  const isSelected = selectedTable === table.id;
                  
                  return (
                    <Card key={table.id} className={`bg-white border-gray-200 rounded-lg shadow-sm transition-all ${
                      isSelected ? 'ring-2 ring-gray-300' : ''
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon size={20} className="text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-semibold text-gray-900">
                              {table.name}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">{table.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(generateCreateTableSQL(table), table.id)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedCode === table.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="columns" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="columns">Columns</TabsTrigger>
                            <TabsTrigger value="relationships">Relationships</TabsTrigger>
                            <TabsTrigger value="sql">SQL</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="columns" className="space-y-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-semibold text-gray-900">Column</th>
                                    <th className="text-left py-2 font-semibold text-gray-900">Type</th>
                                    <th className="text-left py-2 font-semibold text-gray-900">Constraints</th>
                                    <th className="text-left py-2 font-semibold text-gray-900">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((column, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                      <td className="py-2">
                                        <code className="text-gray-900 font-mono">{column.name}</code>
                                        {column.primaryKey && (
                                          <Key className="inline w-3 h-3 ml-1 text-yellow-600" />
                                        )}
                                      </td>
                                      <td className="py-2 text-gray-700">{column.type}</td>
                                      <td className="py-2">
                                        <div className="flex gap-1">
                                          {!column.nullable && (
                                            <Badge variant="outline" className="text-xs">NOT NULL</Badge>
                                          )}
                                          {column.foreignKey && (
                                            <Badge variant="outline" className="text-xs">FK</Badge>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 text-gray-600">{column.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="relationships" className="space-y-4">
                            {table.relationships.length > 0 ? (
                              <div className="space-y-3">
                                {table.relationships.map((rel, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Link className="w-4 h-4 text-gray-600" />
                                      <span className="font-medium text-gray-900">{rel.type.replace('-', ' ').toUpperCase()}</span>
                                      <span className="text-gray-600">→</span>
                                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {rel.table}
                                      </code>
                                    </div>
                                    <p className="text-sm text-gray-600">{rel.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-600">No relationships defined for this table.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="sql" className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900">CREATE TABLE Statement</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generateCreateTableSQL(table), `${table.id}-sql`)}
                                className="h-6 w-6 p-0"
                              >
                                {copiedCode === `${table.id}-sql` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-lg overflow-x-auto">
                              <code>{generateCreateTableSQL(table)}</code>
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Database Overview */}
              <Card className="bg-gray-50 border-gray-200 rounded-lg shadow-sm mt-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Database Type</p>
                          <p>PostgreSQL 15+</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Total Tables</p>
                          <p>{databaseSchema.length} tables</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Primary Language</p>
                          <p>SQL with JSON support</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Indexing</p>
                          <p>Optimized for search and relationships</p>
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
