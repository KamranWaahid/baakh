"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Tag,
  Star,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  History,
  Sparkles,
  Globe,
  Zap,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AddPeriodPopup from "@/components/ui/AddPeriodPopup";

interface TimelinePeriod {
  id: string;
  period_slug: string;
  start_year: number;
  end_year?: number;
  is_ongoing: boolean;
  name: string;
  description?: string;
  characteristics: string[];
  color_code: string;
  icon_name?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface TimelineEvent {
  id: string;
  event_slug: string;
  event_date: string;
  event_year: number;
  is_approximate: boolean;
  title: string;
  description?: string;
  location?: string;
  event_type: string;
  importance_level: number;
  tags: string[];
  color_code?: string;
  icon_name?: string;
  is_featured: boolean;
  sort_order: number;
  period?: {
    id: string;
    slug: string;
    name: string;
    color_code: string;
  };
  poet?: {
    id: string;
    slug: string;
    name: string;
    photo?: string;
  };
  created_at: string;
  updated_at: string;
}

interface TimelineStats {
  total_periods: number;
  total_events: number;
  featured_periods: number;
  featured_events: number;
}

export default function TimelineAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<TimelinePeriod[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<TimelineStats>({
    total_periods: 0,
    total_events: 0,
    featured_periods: 0,
    featured_events: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState<TimelinePeriod | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddEventPopoverOpen, setIsAddEventPopoverOpen] = useState(false);
  const [isAddPeriodPopupOpen, setIsAddPeriodPopupOpen] = useState(false);
  const [isEditPeriodPopupOpen, setIsEditPeriodPopupOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'period' | 'event', id: string, name: string } | null>(null);
  const [sortBy, setSortBy] = useState("start_year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    // Period fields
    period_slug: "",
    start_year: "",
    end_year: "",
    is_ongoing: false,
    sindhi_name: "",
    sindhi_description: "",
    sindhi_characteristics: [] as string[],
    english_name: "",
    english_description: "",
    english_characteristics: [] as string[],
    color_code: "#3B82F6",
    icon_name: "",
    is_featured: false,
    sort_order: 0,
    
    // Event fields
    event_slug: "",
    event_date: "",
    event_year: "",
    is_approximate: false,
    period_id: "",
    poet_id: "",
    poetry_id: "",
    event_sindhi_title: "",
    event_sindhi_description: "",
    event_sindhi_location: "",
    event_english_title: "",
    event_english_description: "",
    event_english_location: "",
    event_type: "historical",
    importance_level: 1,
    event_tags: [] as string[],
    event_color_code: "",
    event_icon_name: "",
    event_is_featured: false,
    event_sort_order: 0
  });

  // Populate form when editing
  useEffect(() => {
    if (selectedPeriod) {
      setActiveTab('periods');
      // Fetch full raw fields for editing
      (async () => {
        try {
          const res = await fetch(`/api/timeline/periods/${selectedPeriod.id}/?lang=en`);
          // Safely parse JSON to avoid "Unexpected end of JSON input"
          let data: any = {};
          const text = await res.text();
          if (text && text.trim().length > 0) {
            try {
              data = JSON.parse(text);
            } catch (parseErr) {
              console.error('Failed to parse period response JSON', parseErr);
              data = {};
            }
          }
          const p = data.period_raw || data.period; // fallback
          if (p) {
            setFormData((prev) => ({
              ...prev,
              period_slug: p.period_slug || '',
              start_year: String(p.start_year ?? ''),
              end_year: p.end_year != null ? String(p.end_year) : '',
              is_ongoing: !!p.is_ongoing,
              // multilingual
              sindhi_name: p.sindhi_name || '',
              sindhi_description: p.sindhi_description || '',
              sindhi_characteristics: Array.isArray(p.sindhi_characteristics) ? p.sindhi_characteristics : [],
              english_name: p.english_name || '',
              english_description: p.english_description || '',
              english_characteristics: Array.isArray(p.english_characteristics) ? p.english_characteristics : [],
              color_code: p.color_code || '#3B82F6',
              icon_name: p.icon_name || '',
              is_featured: !!p.is_featured,
              sort_order: p.sort_order ?? 0,
            }));
          }
        } catch (e) {
          console.error('Failed to load period details for edit', e);
        }
      })();
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedEvent) {
      setActiveTab('events');
      setFormData((prev) => ({
        ...prev,
        event_slug: selectedEvent.event_slug || '',
        event_date: selectedEvent.event_date || '',
        event_year: String(selectedEvent.event_year ?? ''),
        is_approximate: !!selectedEvent.is_approximate,
        period_id: selectedEvent.period?.id || '',
        poet_id: selectedEvent.poet?.id || '',
        event_type: selectedEvent.event_type || 'historical',
        importance_level: selectedEvent.importance_level ?? 1,
        event_tags: Array.isArray(selectedEvent.tags) ? selectedEvent.tags : [],
        event_color_code: selectedEvent.color_code || '',
        event_icon_name: selectedEvent.icon_name || '',
        event_is_featured: !!selectedEvent.is_featured,
        event_sort_order: selectedEvent.sort_order ?? 0,
      }));
    }
  }, [selectedEvent]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPeriod) {
        const response = await fetch(`/api/timeline/periods/${selectedPeriod.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period_slug: formData.period_slug,
            start_year: parseInt(formData.start_year),
            end_year: formData.end_year ? parseInt(formData.end_year) : null,
            is_ongoing: formData.is_ongoing,
            // multilingual fields
            sindhi_name: formData.sindhi_name,
            sindhi_description: formData.sindhi_description,
            sindhi_characteristics: formData.sindhi_characteristics,
            english_name: formData.english_name,
            english_description: formData.english_description,
            english_characteristics: formData.english_characteristics,
            color_code: formData.color_code,
            icon_name: formData.icon_name || null,
            is_featured: formData.is_featured,
            sort_order: formData.sort_order,
          })
        });

        if (response.ok) {
          setIsEditDialogOpen(false);
          setSelectedPeriod(null);
          await fetchTimelineData();
        }
      } else if (selectedEvent) {
        const response = await fetch(`/api/timeline/events/${selectedEvent.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_slug: formData.event_slug,
            event_date: formData.event_date,
            event_year: parseInt(formData.event_year),
            is_approximate: formData.is_approximate,
            period_id: formData.period_id || null,
            poet_id: formData.poet_id || null,
            poetry_id: formData.poetry_id || null,
            event_sindhi_title: formData.event_sindhi_title,
            event_sindhi_description: formData.event_sindhi_description,
            event_sindhi_location: formData.event_sindhi_location,
            english_title: formData.event_english_title,
            english_description: formData.event_english_description,
            english_location: formData.event_english_location,
            event_type: formData.event_type,
            importance_level: formData.importance_level,
            tags: formData.event_tags,
            color_code: formData.event_color_code || null,
            icon_name: formData.event_icon_name || null,
            is_featured: formData.event_is_featured,
            sort_order: formData.event_sort_order,
          })
        });

        if (response.ok) {
          setIsEditDialogOpen(false);
          setSelectedEvent(null);
          await fetchTimelineData();
        }
      }
    } catch (error) {
      console.error('Error updating timeline item:', error);
    }
  };

  // Fetch timeline data
  const fetchTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch periods
      const periodsResponse = await fetch('/api/timeline/periods/?limit=100');
      const periodsData = await periodsResponse.json();
      
      if (periodsData.success) {
        setPeriods(periodsData.periods);
      }

      // Fetch events
      const eventsResponse = await fetch('/api/timeline/events/?limit=100');
      const eventsData = await eventsResponse.json();
      
      if (eventsData.success) {
        setEvents(eventsData.events);
      }

      // Calculate stats
      const featuredPeriods = periodsData.periods?.filter((p: TimelinePeriod) => p.is_featured).length || 0;
      const featuredEvents = eventsData.events?.filter((e: TimelineEvent) => e.is_featured).length || 0;
      
      setStats({
        total_periods: periodsData.total || 0,
        total_events: eventsData.total || 0,
        featured_periods: featuredPeriods,
        featured_events: featuredEvents
      });

    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  // Filter and sort data
  const filteredPeriods = useMemo(() => {
    let filtered = periods;

    if (searchQuery) {
      filtered = filtered.filter(period => 
        period.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        period.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterFeatured) {
      filtered = filtered.filter(period => period.is_featured);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof TimelinePeriod];
      const bValue = b[sortBy as keyof TimelinePeriod];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [periods, searchQuery, filterFeatured, sortBy, sortOrder]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(event => event.event_type === filterType);
    }

    if (filterFeatured) {
      filtered = filtered.filter(event => event.is_featured);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof TimelineEvent];
      const bValue = b[sortBy as keyof TimelineEvent];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [events, searchQuery, filterType, filterFeatured, sortBy, sortOrder]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === "periods") {
        const response = await fetch('/api/timeline/periods/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period_slug: formData.period_slug,
            start_year: parseInt(formData.start_year),
            end_year: formData.end_year ? parseInt(formData.end_year) : null,
            is_ongoing: formData.is_ongoing,
            sindhi_name: formData.sindhi_name,
            sindhi_description: formData.sindhi_description,
            sindhi_characteristics: formData.sindhi_characteristics,
            english_name: formData.english_name,
            english_description: formData.english_description,
            english_characteristics: formData.english_characteristics,
            color_code: formData.color_code,
            icon_name: formData.icon_name,
            is_featured: formData.is_featured,
            sort_order: formData.sort_order
          })
        });

        if (response.ok) {
          setIsCreateDialogOpen(false);
          resetForm();
          await fetchTimelineData();
        }
      } else {
        const response = await fetch('/api/timeline/events/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_slug: formData.event_slug,
            event_date: formData.event_date,
            event_year: parseInt(formData.event_year),
            is_approximate: formData.is_approximate,
            period_id: formData.period_id || null,
            poet_id: formData.poet_id || null,
            poetry_id: formData.poetry_id || null,
            sindhi_title: formData.event_sindhi_title,
            sindhi_description: formData.event_sindhi_description,
            sindhi_location: formData.event_sindhi_location,
            english_title: formData.event_english_title,
            english_description: formData.event_english_description,
            english_location: formData.event_english_location,
            event_type: formData.event_type,
            importance_level: formData.importance_level,
            tags: formData.event_tags,
            color_code: formData.event_color_code,
            icon_name: formData.event_icon_name,
            is_featured: formData.event_is_featured,
            sort_order: formData.event_sort_order
          })
        });

        if (response.ok) {
          setIsCreateDialogOpen(false);
          resetForm();
          await fetchTimelineData();
        }
      }
    } catch (error) {
      console.error('Error creating timeline item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      // Period fields
      period_slug: "",
      start_year: "",
      end_year: "",
      is_ongoing: false,
      sindhi_name: "",
      sindhi_description: "",
      sindhi_characteristics: [],
      english_name: "",
      english_description: "",
      english_characteristics: [],
      color_code: "#3B82F6",
      icon_name: "",
      is_featured: false,
      sort_order: 0,
      
      // Event fields
      event_slug: "",
      event_date: "",
      event_year: "",
      is_approximate: false,
      period_id: "",
      poet_id: "",
      poetry_id: "",
      event_sindhi_title: "",
      event_sindhi_description: "",
      event_sindhi_location: "",
      event_english_title: "",
      event_english_description: "",
      event_english_location: "",
      event_type: "historical",
      importance_level: 1,
      event_tags: [],
      event_color_code: "",
      event_icon_name: "",
      event_is_featured: false,
      event_sort_order: 0
    });
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch(`/api/timeline/${deleteItem.type}s/${deleteItem.id}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setDeleteItem(null);
        await fetchTimelineData();
      }
    } catch (error) {
      console.error('Error deleting timeline item:', error);
    }
  };

  const handleCreatePeriod = async (data: any) => {
    try {
      console.log('Creating period with data:', data);
      
      const payload = {
        period_slug: data.period_slug,
        start_year: parseInt(data.start_year),
        end_year: data.end_year ? parseInt(data.end_year) : null,
        is_ongoing: data.is_ongoing,
        sindhi_name: data.sindhi_name,
        sindhi_description: data.sindhi_description,
        sindhi_characteristics: data.sindhi_characteristics || [],
        english_name: data.english_name,
        english_description: data.english_description,
        english_characteristics: data.english_characteristics || [],
        is_featured: data.is_featured || false,
        sort_order: data.sort_order || 0,
        color_code: '#3B82F6' // Default color
      };
      
      console.log('Payload being sent to API:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('/api/timeline/periods/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        
        let errorMessage = `Failed to create period: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.details) {
            errorMessage += ` - ${errorJson.details}`;
          }
          if (errorJson.code) {
            errorMessage += ` (Code: ${errorJson.code})`;
          }
        } catch (e) {
          // If parsing fails, use the raw error data
          errorMessage += ` - ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Period created successfully:', result);
      
      await fetchTimelineData();
    } catch (error) {
      console.error('Error in handleCreatePeriod:', error);
      throw error;
    }
  };

  const handleEditPeriod = async (data: any) => {
    if (!selectedPeriod) return;
    try {
      const payload = {
        period_slug: data.period_slug,
        start_year: parseInt(data.start_year),
        end_year: data.end_year ? parseInt(data.end_year) : null,
        is_ongoing: data.is_ongoing,
        sindhi_name: data.sindhi_name,
        sindhi_description: data.sindhi_description,
        sindhi_characteristics: data.sindhi_characteristics || [],
        english_name: data.english_name,
        english_description: data.english_description,
        english_characteristics: data.english_characteristics || [],
        is_featured: data.is_featured || false,
        sort_order: data.sort_order || 0
      };
      const response = await fetch(`/api/timeline/periods/${selectedPeriod.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update period: ${response.status} ${response.statusText} - ${errorData}`);
      }
      setIsEditPeriodPopupOpen(false);
      setSelectedPeriod(null);
      await fetchTimelineData();
    } catch (error) {
      console.error('Error in handleEditPeriod:', error);
      throw error;
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      historical: "bg-blue-50 text-blue-700 border-blue-200",
      literary: "bg-purple-50 text-purple-700 border-purple-200",
      cultural: "bg-green-50 text-green-700 border-green-200",
      political: "bg-red-50 text-red-700 border-red-200",
      birth: "bg-pink-50 text-pink-700 border-pink-200",
      death: "bg-gray-50 text-gray-700 border-gray-200",
      publication: "bg-yellow-50 text-yellow-700 border-yellow-200",
      award: "bg-orange-50 text-orange-700 border-orange-200"
    };
    return colors[type as keyof typeof colors] || colors.historical;
  };

  const getImportanceColor = (level: number) => {
    const colors = {
      1: "bg-gray-100 text-gray-600",
      2: "bg-blue-100 text-blue-600",
      3: "bg-green-100 text-green-600",
      4: "bg-yellow-100 text-yellow-600",
      5: "bg-red-100 text-red-600"
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9]">
          <AdminPageHeader
            title="Timeline Management"
            subtitle="Historical Timeline"
            subtitleIcon={<History className="w-4 h-4" />}
            description="Manage historical periods and events for Sindhi poetry. Create timelines, organize events, and curate the chronological narrative of Sindhi literary heritage."
          />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardContent className="px-6 py-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-7 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                  <CardContent className="px-6 py-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Timeline Management"
          subtitle="Historical Timeline"
          subtitleIcon={<History className="w-4 h-4" />}
          description="Manage historical periods and events for Sindhi poetry. Create timelines, organize events, and curate the chronological narrative of Sindhi literary heritage."
          action={
            <Popover open={isAddEventPopoverOpen} onOpenChange={setIsAddEventPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="h-10 px-6 rounded-lg bg-[#1F1F1F] hover:bg-[#404040] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 bg-white border-[#E5E5E5] rounded-lg shadow-lg p-0"
                align="end"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#1F1F1F] mb-4">Add Timeline Item</h3>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab("periods");
                        setIsAddEventPopoverOpen(false);
                        setIsAddPeriodPopupOpen(true);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors group"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <History className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-[#1F1F1F]">Add Timeline Period</div>
                        <div className="text-sm text-[#6B6B6B]">Create a new historical period</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab("events");
                        setIsAddEventPopoverOpen(false);
                        resetForm();
                        setIsCreateDialogOpen(true);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-[#1F1F1F]">Add Timeline Event</div>
                        <div className="text-sm text-[#6B6B6B]">Create a new historical event</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsAddEventPopoverOpen(false);
                        // Add quick event creation logic here
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors group"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-[#1F1F1F]">Quick Add Event</div>
                        <div className="text-sm text-[#6B6B6B]">Fast event creation</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                    </motion.button>
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>
          }
        />

        {/* Duplicate content removed */}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div style={{ display: 'none' }} />
          </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-0">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle className="text-[18px] font-semibold text-[#1F1F1F]">
                    Add New {activeTab === "periods" ? "Timeline Period" : "Timeline Event"}
                  </DialogTitle>
                  <DialogDescription className="text-[13px] text-[#6B6B6B]">
                    Create a new {activeTab === "periods" ? "historical period" : "timeline event"} for the Sindhi poetry timeline.
                  </DialogDescription>
                </DialogHeader>
              <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "periods" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="period_slug">Period Slug</Label>
                        <Input
                          id="period_slug"
                          value={formData.period_slug}
                          onChange={(e) => setFormData({...formData, period_slug: e.target.value})}
                          placeholder="classical-sindhi-poetry"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="color_code">Color Code</Label>
                        <Input
                          id="color_code"
                          type="color"
                          value={formData.color_code}
                          onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="start_year">Start Year</Label>
                        <Input
                          id="start_year"
                          type="number"
                          value={formData.start_year}
                          onChange={(e) => setFormData({...formData, start_year: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_year">End Year</Label>
                        <Input
                          id="end_year"
                          type="number"
                          value={formData.end_year}
                          onChange={(e) => setFormData({...formData, end_year: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_ongoing"
                          checked={formData.is_ongoing}
                          onChange={(e) => setFormData({...formData, is_ongoing: e.target.checked})}
                        />
                        <Label htmlFor="is_ongoing">Ongoing Period</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sindhi_name">Sindhi Name</Label>
                        <Input
                          id="sindhi_name"
                          value={formData.sindhi_name}
                          onChange={(e) => setFormData({...formData, sindhi_name: e.target.value})}
                          placeholder="ڪلاسيڪل سنڌي شاعري"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="english_name">English Name</Label>
                        <Input
                          id="english_name"
                          value={formData.english_name}
                          onChange={(e) => setFormData({...formData, english_name: e.target.value})}
                          placeholder="Classical Sindhi Poetry"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sindhi_description">Sindhi Description</Label>
                        <Textarea
                          id="sindhi_description"
                          value={formData.sindhi_description}
                          onChange={(e) => setFormData({...formData, sindhi_description: e.target.value})}
                          placeholder="سنڌي شاعري جو سنھري دور..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="english_description">English Description</Label>
                        <Textarea
                          id="english_description"
                          value={formData.english_description}
                          onChange={(e) => setFormData({...formData, english_description: e.target.value})}
                          placeholder="The golden age of Sindhi poetry..."
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event_slug">Event Slug</Label>
                        <Input
                          id="event_slug"
                          value={formData.event_slug}
                          onChange={(e) => setFormData({...formData, event_slug: e.target.value})}
                          placeholder="shah-abdul-latif-birth"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="event_type">Event Type</Label>
                        <Select value={formData.event_type} onValueChange={(value) => setFormData({...formData, event_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="historical">Historical</SelectItem>
                            <SelectItem value="literary">Literary</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="political">Political</SelectItem>
                            <SelectItem value="birth">Birth</SelectItem>
                            <SelectItem value="death">Death</SelectItem>
                            <SelectItem value="publication">Publication</SelectItem>
                            <SelectItem value="award">Award</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="event_date">Event Date</Label>
                        <Input
                          id="event_date"
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="event_year">Event Year</Label>
                        <Input
                          id="event_year"
                          type="number"
                          value={formData.event_year}
                          onChange={(e) => setFormData({...formData, event_year: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_approximate"
                          checked={formData.is_approximate}
                          onChange={(e) => setFormData({...formData, is_approximate: e.target.checked})}
                        />
                        <Label htmlFor="is_approximate">Approximate Date</Label>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#1F1F1F] hover:bg-[#404040] text-white">
                    Create {activeTab === "periods" ? "Period" : "Event"}
                  </Button>
                </div>
              </form>
              </div>
              </motion.div>
              </DialogContent>
            </Dialog>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="px-6 py-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Total Periods</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{stats.total_periods}</div>
                  <div className="text-xs text-[#6B6B6B]">Historical periods</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="px-6 py-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Total Events</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{stats.total_events}</div>
                  <div className="text-xs text-[#6B6B6B]">Timeline events</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="px-6 py-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Featured Periods</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{stats.featured_periods}</div>
                  <div className="text-xs text-[#6B6B6B]">Highlighted periods</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardContent className="px-6 py-6">
                <div className="space-y-2">
                  <div className="text-sm text-[#6B6B6B] font-medium">Featured Events</div>
                  <div className="text-2xl font-bold text-[#1F1F1F]">{stats.featured_events}</div>
                  <div className="text-xs text-[#6B6B6B]">Important events</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border-[#E5E5E5] rounded-lg p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="periods" className="data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white rounded-md">Periods</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-white rounded-md">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-xl font-bold text-[#1F1F1F]">Timeline Overview</CardTitle>
                  <CardDescription className="text-[#6B6B6B]">
                    Visual representation of Sindhi poetry timeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                <div className="space-y-6">
                  {/* Timeline Visualization */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    {filteredPeriods.map((period, index) => (
                      <div key={period.id} className="relative flex items-start space-x-4 pb-8">
                        <div 
                          className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                          style={{ backgroundColor: period.color_code }}
                        >
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{period.name}</h3>
                            {period.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {period.start_year} - {period.is_ongoing ? 'Present' : period.end_year}
                          </p>
                          {period.description && (
                            <p className="text-sm text-muted-foreground">{period.description}</p>
                          )}
                          {period.characteristics && period.characteristics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {period.characteristics.map((char, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="periods" className="space-y-6">
              {/* Filters and Search */}
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="px-6 py-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-4 w-4" />
                      <Input
                        placeholder="Search periods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 h-9 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        <SelectItem value="start_year" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Start Year</SelectItem>
                        <SelectItem value="name" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Name</SelectItem>
                        <SelectItem value="created_at" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Created</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={filterFeatured ? "default" : "outline"}
                      className={`h-9 px-4 rounded-lg transition-colors ${
                        filterFeatured 
                          ? "bg-[#1F1F1F] hover:bg-[#404040] text-white" 
                          : "border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]"
                      }`}
                      onClick={() => setFilterFeatured(!filterFeatured)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Featured
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Periods List */}
              <div className="grid gap-4">
                {filteredPeriods.map((period) => (
                  <Card key={period.id} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                    <CardContent className="px-6 py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full mt-1"
                          style={{ backgroundColor: period.color_code }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{period.name}</h3>
                            {period.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {period.start_year} - {period.is_ongoing ? 'Present' : period.end_year}
                          </p>
                          {period.description && (
                            <p className="text-sm text-muted-foreground mb-3">{period.description}</p>
                          )}
                          {period.characteristics && period.characteristics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {period.characteristics.map((char, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedPeriod(period);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setDeleteItem({ type: 'period', id: period.id, name: period.name });
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

            <TabsContent value="events" className="space-y-6">
              {/* Filters and Search */}
              <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                <CardContent className="px-6 py-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-4 w-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 rounded-lg bg-white border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] hover:bg-[#F4F4F5] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32 h-9 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        <SelectItem value="all" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">All Types</SelectItem>
                        <SelectItem value="historical" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Historical</SelectItem>
                        <SelectItem value="literary" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Literary</SelectItem>
                        <SelectItem value="cultural" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Cultural</SelectItem>
                        <SelectItem value="birth" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Birth</SelectItem>
                        <SelectItem value="death" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Death</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32 h-9 rounded-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E5] shadow-lg">
                        <SelectItem value="event_year" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Year</SelectItem>
                        <SelectItem value="title" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Title</SelectItem>
                        <SelectItem value="importance_level" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Importance</SelectItem>
                        <SelectItem value="created_at" className="hover:bg-[#F4F4F5] focus:bg-[#F4F4F5]">Created</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={filterFeatured ? "default" : "outline"}
                      className={`h-9 px-4 rounded-lg transition-colors ${
                        filterFeatured 
                          ? "bg-[#1F1F1F] hover:bg-[#404040] text-white" 
                          : "border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]"
                      }`}
                      onClick={() => setFilterFeatured(!filterFeatured)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Featured
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Events List */}
              <div className="grid gap-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
                    <CardContent className="px-6 py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: event.color_code || event.period?.color_code || '#3B82F6' }}
                          ></div>
                          <div className="w-0.5 h-8 bg-muted mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            {event.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {event.event_type}
                            </Badge>
                            <Badge className={getImportanceColor(event.importance_level)}>
                              Level {event.importance_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.event_year} {event.is_approximate && '(Approximate)'}
                            {event.location && ` • ${event.location}`}
                          </p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                          )}
                          {event.period && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs text-muted-foreground">Period:</span>
                              <Badge variant="outline" className="text-xs">
                                {event.period.name}
                              </Badge>
                            </div>
                          )}
                          {event.poet && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs text-muted-foreground">Poet:</span>
                              <Badge variant="outline" className="text-xs">
                                {event.poet.name}
                              </Badge>
                            </div>
                          )}
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setDeleteItem({ type: 'event', id: event.id, name: event.title });
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          </Tabs>
        </div>

        {/* Add Period Popup */}
        <AddPeriodPopup
          isOpen={isAddPeriodPopupOpen}
          onClose={() => setIsAddPeriodPopupOpen(false)}
          onSubmit={handleCreatePeriod}
          mode="create"
        />

        {/* Edit Period Popup */}
        <AddPeriodPopup
          isOpen={isEditPeriodPopupOpen}
          onClose={() => setIsEditPeriodPopupOpen(false)}
          onSubmit={handleEditPeriod}
          mode="edit"
          initialData={selectedPeriod ? {
            period_slug: selectedPeriod.period_slug,
            start_year: String(selectedPeriod.start_year),
            end_year: selectedPeriod.end_year != null ? String(selectedPeriod.end_year) : '',
            is_ongoing: selectedPeriod.is_ongoing,
            // map to multilingual fields if available in list item
            sindhi_name: (selectedPeriod as any).sindhi_name || '',
            sindhi_description: (selectedPeriod as any).sindhi_description || '',
            sindhi_characteristics: (selectedPeriod as any).sindhi_characteristics || [],
            english_name: (selectedPeriod as any).english_name || selectedPeriod.name || '',
            english_description: (selectedPeriod as any).english_description || selectedPeriod.description || '',
            english_characteristics: (selectedPeriod as any).english_characteristics || selectedPeriod.characteristics || [],
            is_featured: selectedPeriod.is_featured,
            sort_order: selectedPeriod.sort_order
          } : null}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-0">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-[18px] font-semibold text-[#1F1F1F]">
                Edit {selectedPeriod ? 'Timeline Period' : 'Timeline Event'}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#6B6B6B]">
                Update {selectedPeriod ? 'historical period details' : 'timeline event details'}.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              {selectedPeriod ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_period_slug">Period Slug</Label>
                      <Input
                        id="edit_period_slug"
                        value={formData.period_slug}
                        onChange={(e) => setFormData({ ...formData, period_slug: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_color_code">Color Code</Label>
                      <Input
                        id="edit_color_code"
                        type="color"
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit_start_year">Start Year</Label>
                      <Input
                        id="edit_start_year"
                        type="number"
                        value={formData.start_year}
                        onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_end_year">End Year</Label>
                      <Input
                        id="edit_end_year"
                        type="number"
                        value={formData.end_year}
                        onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="edit_is_ongoing"
                        checked={formData.is_ongoing}
                        onChange={(e) => setFormData({ ...formData, is_ongoing: e.target.checked })}
                      />
                      <Label htmlFor="edit_is_ongoing">Ongoing</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_sindhi_name">Sindhi Name</Label>
                      <Input
                        id="edit_sindhi_name"
                        value={formData.sindhi_name}
                        onChange={(e) => setFormData({ ...formData, sindhi_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_english_name">English Name</Label>
                      <Input
                        id="edit_english_name"
                        value={formData.english_name}
                        onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_sindhi_description">Sindhi Description</Label>
                      <Textarea
                        id="edit_sindhi_description"
                        value={formData.sindhi_description}
                        onChange={(e) => setFormData({ ...formData, sindhi_description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_english_description">English Description</Label>
                      <Textarea
                        id="edit_english_description"
                        value={formData.english_description}
                        onChange={(e) => setFormData({ ...formData, english_description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_sindhi_characteristics">Sindhi Characteristics (comma separated)</Label>
                      <Input
                        id="edit_sindhi_characteristics"
                        value={(formData.sindhi_characteristics || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, sindhi_characteristics: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_english_characteristics">English Characteristics (comma separated)</Label>
                      <Input
                        id="edit_english_characteristics"
                        value={(formData.english_characteristics || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, english_characteristics: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_icon_name">Icon Name</Label>
                      <Input
                        id="edit_icon_name"
                        value={formData.icon_name}
                        onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_sort_order">Sort Order</Label>
                      <Input
                        id="edit_sort_order"
                        type="number"
                        value={String(formData.sort_order)}
                        onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    <Label htmlFor="edit_is_featured">Featured</Label>
                  </div>
                </>
              ) : selectedEvent ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_event_slug">Event Slug</Label>
                      <Input
                        id="edit_event_slug"
                        value={formData.event_slug}
                        onChange={(e) => setFormData({ ...formData, event_slug: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_type">Event Type</Label>
                      <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="historical">Historical</SelectItem>
                          <SelectItem value="literary">Literary</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="political">Political</SelectItem>
                          <SelectItem value="birth">Birth</SelectItem>
                          <SelectItem value="death">Death</SelectItem>
                          <SelectItem value="publication">Publication</SelectItem>
                          <SelectItem value="award">Award</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit_event_date">Event Date</Label>
                      <Input
                        id="edit_event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_year">Event Year</Label>
                      <Input
                        id="edit_event_year"
                        type="number"
                        value={formData.event_year}
                        onChange={(e) => setFormData({ ...formData, event_year: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="edit_is_approximate"
                        checked={formData.is_approximate}
                        onChange={(e) => setFormData({ ...formData, is_approximate: e.target.checked })}
                      />
                      <Label htmlFor="edit_is_approximate">Approximate</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_period_id">Period ID</Label>
                      <Input
                        id="edit_period_id"
                        value={formData.period_id}
                        onChange={(e) => setFormData({ ...formData, period_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_poet_id">Poet ID</Label>
                      <Input
                        id="edit_poet_id"
                        value={formData.poet_id}
                        onChange={(e) => setFormData({ ...formData, poet_id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_event_icon_name">Icon Name</Label>
                      <Input
                        id="edit_event_icon_name"
                        value={formData.event_icon_name}
                        onChange={(e) => setFormData({ ...formData, event_icon_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_color">Color</Label>
                      <Input
                        id="edit_event_color"
                        type="color"
                        value={formData.event_color_code || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, event_color_code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_importance">Importance</Label>
                      <Input
                        id="edit_importance"
                        type="number"
                        value={String(formData.importance_level)}
                        onChange={(e) => setFormData({ ...formData, importance_level: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_sort_order">Sort Order</Label>
                      <Input
                        id="edit_event_sort_order"
                        type="number"
                        value={String(formData.event_sort_order)}
                        onChange={(e) => setFormData({ ...formData, event_sort_order: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit_tags">Tags (comma separated)</Label>
                    <Input
                      id="edit_tags"
                      value={(formData.event_tags || []).join(', ')}
                      onChange={(e) => setFormData({ ...formData, event_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_event_is_featured"
                      checked={formData.event_is_featured}
                      onChange={(e) => setFormData({ ...formData, event_is_featured: e.target.checked })}
                    />
                    <Label htmlFor="edit_event_is_featured">Featured</Label>
                  </div>
                </>
              ) : null}
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#1F1F1F] hover:bg-[#404040] text-white">Save Changes</Button>
              </div>
            </form>
            </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white border-[#E5E5E5] rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#1F1F1F]">Delete {deleteItem?.type === 'period' ? 'Period' : 'Event'}</DialogTitle>
              <DialogDescription className="text-[#6B6B6B]">
                Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                className="h-9 px-4 rounded-lg border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] transition-colors"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
