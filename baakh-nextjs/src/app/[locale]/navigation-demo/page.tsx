"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MainNavigation, 
  PageNavigation,
  SearchOverlay 
} from "@/components/navigation";
import { 
  BookOpen, 
  Users, 
  Tag, 
  Clock, 
  Heart, 
  Eye, 
  Star,
  Filter,
  Grid3X3,
  List,
  Search
} from "lucide-react";

export default function NavigationDemoPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const mockData = {
    totalItems: 156,
    totalPages: 8,
    currentPage: currentPage,
    itemsPerPage: 20
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "Title A-Z" },
    { value: "popular", label: "Most Popular" }
  ];

  const filterOptions = [
    { value: "sufi", label: "Sufi Poetry" },
    { value: "classical", label: "Classical" },
    { value: "modern", label: "Modern" },
    { value: "spiritual", label: "Spiritual" }
  ];

  const mockItems = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Sample Poetry ${i + 1}`,
    subtitle: `By Poet ${i + 1}`,
    description: "This is a sample description of the poetry item that demonstrates the layout and styling.",
    tags: ["Sufi", "Spiritual", "Classical"],
    stats: {
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10,
      readTime: `${Math.floor(Math.random() * 5) + 1} min read`
    }
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Navigation */}
      <MainNavigation />

      

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Navigation System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore the comprehensive navigation components and their functionality
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="functionality">Functionality</TabsTrigger>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation System Features</CardTitle>
                <CardDescription>
                  A comprehensive navigation solution for the Baakh poetry platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Primary Navigation</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Home, Couplets, Poets, Themes, Timeline, Collections</li>
                      <li>• Dropdown submenus with descriptions</li>
                      <li>• Active state indicators</li>
                      <li>• Responsive mobile drawer</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Secondary Actions</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Global search overlay</li>
                      <li>• Language switching (Sindhi/English)</li>
                      <li>• Theme toggle (Light/Dark)</li>
                      <li>• Donate and Sign In buttons</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    MainNavigation
                  </CardTitle>
                  <CardDescription>
                    Primary navigation with submenus and mobile support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Features dropdown submenus, mobile drawer, and integrated search.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary">Responsive</Badge>
                    <Badge variant="secondary">Accessible</Badge>
                    <Badge variant="secondary">Dark Mode</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    SearchOverlay
                  </CardTitle>
                  <CardDescription>
                    Global search with filters and recent searches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Modal search interface with type filtering and search history.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary">Modal</Badge>
                    <Badge variant="secondary">Filters</Badge>
                    <Badge variant="secondary">History</Badge>
                  </div>
                </CardContent>
              </Card>



              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    PageNavigation
                  </CardTitle>
                  <CardDescription>
                    Content pagination, sorting, and view controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Handles pagination, sorting, filtering, and view mode toggles.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary">Pagination</Badge>
                    <Badge variant="secondary">Sorting</Badge>
                    <Badge variant="secondary">View Modes</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="functionality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Functionality</CardTitle>
                <CardDescription>
                  Key features and user experience considerations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Accessibility</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• ARIA labels and roles</li>
                      <li>• Keyboard navigation</li>
                      <li>• Focus management</li>
                      <li>• Screen reader support</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mobile Experience</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Hamburger menu</li>
                      <li>• Accordion submenus</li>
                      <li>• Touch-friendly targets</li>
                      <li>• Responsive breakpoints</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Lazy loading</li>
                      <li>• Optimized re-renders</li>
                      <li>• Efficient state management</li>
                      <li>• Smooth animations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Component Demo</CardTitle>
                <CardDescription>
                  Interactive demonstration of navigation components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Demo */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Search Overlay</h3>
                  <Button onClick={() => setIsSearchOpen(true)}>
                    Open Search Overlay
                  </Button>
                </div>

                {/* Page Navigation Demo */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Page Navigation</h3>
                  <PageNavigation
                    currentPage={mockData.currentPage}
                    totalPages={mockData.totalPages}
                    totalItems={mockData.totalItems}
                    itemsPerPage={mockData.itemsPerPage}
                    onPageChange={setCurrentPage}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    sortOptions={sortOptions}
                    currentSort="newest"
                    onSortChange={(sort) => console.log('Sort changed:', sort)}
                    filterOptions={filterOptions}
                    currentFilter=""
                    onFilterChange={(filter) => console.log('Filter changed:', filter)}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                  />
                </div>

                {/* Content Demo */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Content Display</h3>
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {mockItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription>{item.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.stats.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {item.stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.stats.readTime}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}
